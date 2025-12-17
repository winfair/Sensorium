import React, { useState, useEffect, useRef } from 'react';
import { Activity, Move3d, Compass } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import SensorCard from './SensorCard';
import { Vector3, Euler } from '../types';

const MotionSensor: React.FC = () => {
  const [acceleration, setAcceleration] = useState<Vector3>({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState<Euler>({ alpha: 0, beta: 0, gamma: 0 });
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'notsupported'>('unknown');
  const [history, setHistory] = useState<{ x: number; y: number; z: number; timestamp: number }[]>([]);
  const [isAbsolute, setIsAbsolute] = useState<boolean>(false);
  
  // Throttle updates for the chart to improve performance
  const lastChartUpdate = useRef<number>(0);

  const requestPermission = async () => {
    // We try to request permissions for both Motion and Orientation.
    // On iOS 13+, these are often separate or require specific calls.
    let grantedCount = 0;
    let errorCount = 0;

    const requestOrientation = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const state = await (DeviceOrientationEvent as any).requestPermission();
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            return true;
          }
        } catch (e) {
          console.error("Orientation permission error:", e);
        }
        return false;
      }
      return true; // Not required/supported, assume implicit
    };

    const requestMotion = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const state = await (DeviceMotionEvent as any).requestPermission();
          if (state === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            return true;
          }
        } catch (e) {
          console.error("Motion permission error:", e);
        }
        return false;
      }
      return true; // Not required/supported, assume implicit
    };

    // Execute requests
    // Note: In some browsers, these must be triggered directly by user interaction stack.
    // We run them sequentially to ensure the gesture token is valid for both if needed.
    if (await requestOrientation()) grantedCount++;
    else errorCount++;

    if (await requestMotion()) grantedCount++;
    else errorCount++;

    if (grantedCount > 0) {
      setPermissionState('granted');
    } else if (errorCount > 0) {
      setPermissionState('denied');
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
      const { x, y, z } = event.accelerationIncludingGravity;
      setAcceleration({ x: x || 0, y: y || 0, z: z || 0 });

      const now = Date.now();
      if (now - lastChartUpdate.current > 100) { // 10fps for chart
        setHistory(prev => {
          const newData = [...prev, { x: x || 0, y: y || 0, z: z || 0, timestamp: now }];
          return newData.slice(-30); // Keep last 30 points
        });
        lastChartUpdate.current = now;
      }
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // iOS uses webkitCompassHeading for magnetic north (0-360 clockwise)
    // Standard event.alpha is 0-360 counter-clockwise
    let alpha = event.alpha;
    let absolute = event.absolute;

    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      alpha = event.webkitCompassHeading;
      absolute = true; // webkitCompassHeading implies absolute magnetic reference
    }

    setIsAbsolute(!!absolute);
    setRotation({
      alpha: alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    });
  };

  useEffect(() => {
    // Initial check for permissions environment
    const needsPermission = 
      typeof (DeviceMotionEvent as any).requestPermission === 'function' || 
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsPermission) {
      setPermissionState('unknown');
    } else {
      setPermissionState('granted');
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const needsAuth = permissionState === 'unknown' && (
      typeof (DeviceMotionEvent as any).requestPermission === 'function' ||
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
  );

  return (
    <>
      <SensorCard 
        title="Motion & Accelerometer" 
        icon={<Activity size={20} />} 
        status={permissionState === 'granted' ? 'active' : 'waiting'}
        className="col-span-1 md:col-span-2 lg:col-span-1 row-span-2"
      >
        {needsAuth ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-ios-subtext mb-4">iOS requires permission to access motion sensors.</p>
            <button 
              onClick={requestPermission}
              className="bg-ios-blue text-white px-6 py-2 rounded-full font-semibold active:scale-95 transition-transform"
            >
              Grant Access
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-ios-gray/30 p-2 rounded-lg">
                <div className="text-xs text-ios-subtext uppercase">Accel X</div>
                <div className="font-mono text-ios-red">{acceleration.x?.toFixed(2)}</div>
              </div>
              <div className="bg-ios-gray/30 p-2 rounded-lg">
                <div className="text-xs text-ios-subtext uppercase">Accel Y</div>
                <div className="font-mono text-ios-green">{acceleration.y?.toFixed(2)}</div>
              </div>
              <div className="bg-ios-gray/30 p-2 rounded-lg">
                <div className="text-xs text-ios-subtext uppercase">Accel Z</div>
                <div className="font-mono text-ios-blue">{acceleration.z?.toFixed(2)}</div>
              </div>
            </div>

            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <YAxis domain={[-15, 15]} hide />
                  <Line type="monotone" dataKey="x" stroke="#ff453a" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="y" stroke="#30d158" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="z" stroke="#0a84ff" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-ios-subtext">
                    <span>Gravity</span>
                    <span>9.81 m/s²</span>
                </div>
                 <div className="w-full bg-ios-gray/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="bg-white h-full transition-all duration-75"
                        style={{ width: `${Math.min(100, Math.max(0, (Math.abs(acceleration.z || 0) / 20) * 100))}%` }}
                    />
                 </div>
            </div>
          </div>
        )}
      </SensorCard>

      <SensorCard 
        title="Gyroscope Orientation" 
        icon={<Move3d size={20} />} 
        status={permissionState === 'granted' ? 'active' : 'waiting'}
        className="col-span-1"
      >
        <div className="flex flex-col items-center justify-center h-full space-y-4">
             {/* 3D Representation */}
            <div 
                className="w-24 h-40 border-4 border-ios-subtext/50 rounded-3xl bg-ios-gray/20 flex items-center justify-center transition-transform duration-75"
                style={{
                    transform: `perspective(500px) rotateX(${rotation.beta || 0}deg) rotateY(${rotation.gamma || 0}deg) rotateZ(${0}deg)`
                }}
            >
                <div className="w-12 h-1 bg-ios-subtext/30 rounded-full mb-32"></div>
            </div>

             <div className="grid grid-cols-3 gap-2 text-center w-full">
                <div className="text-xs">
                    <div className="text-ios-subtext">Alpha</div>
                    <div className="font-mono">{Math.round(rotation.alpha || 0)}°</div>
                </div>
                <div className="text-xs">
                    <div className="text-ios-subtext">Beta</div>
                    <div className="font-mono">{Math.round(rotation.beta || 0)}°</div>
                </div>
                <div className="text-xs">
                    <div className="text-ios-subtext">Gamma</div>
                    <div className="font-mono">{Math.round(rotation.gamma || 0)}°</div>
                </div>
            </div>
        </div>
      </SensorCard>

       <SensorCard 
        title="Compass" 
        icon={<Compass size={20} />} 
        status={permissionState === 'granted' && rotation.alpha !== null ? 'active' : 'waiting'}
        className="col-span-1"
      >
        <div className="flex flex-col items-center justify-center h-full">
             <div className="relative w-32 h-32 rounded-full border-2 border-ios-gray flex items-center justify-center mb-4">
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ios-subtext opacity-50">
                    <span className="absolute top-1">N</span>
                    <span className="absolute bottom-1">S</span>
                    <span className="absolute left-2">W</span>
                    <span className="absolute right-2">E</span>
                 </div>
                 <div 
                    className="w-1 h-16 bg-gradient-to-t from-ios-red to-transparent absolute top-1/2 left-1/2 origin-bottom -translate-x-1/2 -translate-y-full transition-transform duration-200 ease-out"
                    // Rotate negative alpha because our CompassHeading is clockwise, but CSS rotate is clockwise.
                    // If North is 0. Phone rotates right (90 deg). Heading is 90.
                    // North is now to the Left (-90 deg relative to phone).
                    // So we must rotate needle -90.
                    style={{ transform: `translateX(-50%) rotate(${-(rotation.alpha || 0)}deg)` }}
                 >
                    <div className="w-3 h-3 bg-ios-red rounded-full absolute -top-1 -left-1 shadow-[0_0_10px_rgba(255,69,58,0.8)]"></div>
                 </div>
                 <div className="text-2xl font-bold font-mono z-10">{Math.round(rotation.alpha || 0)}°</div>
             </div>
             <div className="text-[10px] uppercase tracking-wider text-ios-subtext flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isAbsolute ? 'bg-ios-green' : 'bg-ios-orange'}`}></span>
                {isAbsolute ? 'Magnetic North' : 'Relative'}
             </div>
        </div>
      </SensorCard>
    </>
  );
};

export default MotionSensor;