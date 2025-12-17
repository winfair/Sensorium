import React, { useState, useEffect, useRef } from 'react';
import { Activity, Move3d, Compass } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import SensorCard from './SensorCard';
import { Vector3, Euler } from '../types';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const MotionSensor: React.FC = () => {
  // Linear acceleration (m/s^2)
  const [acceleration, setAcceleration] = useState<Vector3>({ x: 0, y: 0, z: 0 });

  // Orientation angles (deg)
  const [rotation, setRotation] = useState<Euler>({ alpha: 0, beta: 0, gamma: 0 });

  // Gyro rotation rate (deg/s) — THIS is the “gyroscope”
  const [gyro, setGyro] = useState<Vector3>({ x: 0, y: 0, z: 0 });

  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'notsupported'>('unknown');
  const [history, setHistory] = useState<{ x: number; y: number; z: number; timestamp: number }[]>([]);
  const [isAbsolute, setIsAbsolute] = useState<boolean>(false);

  // Debug timestamps: proves whether events are arriving
  const [lastMotionMs, setLastMotionMs] = useState<number | null>(null);
  const [lastOrientationMs, setLastOrientationMs] = useState<number | null>(null);

  // Throttle updates for the chart to improve performance
  const lastChartUpdate = useRef<number>(0);

  // Avoid double-attaching listeners (React StrictMode/dev + multiple permission clicks)
  const listenersAttached = useRef<boolean>(false);

  const attachListeners = () => {
    if (listenersAttached.current) return;
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    listenersAttached.current = true;
  };

  const detachListeners = () => {
    window.removeEventListener('devicemotion', handleMotion);
    window.removeEventListener('deviceorientation', handleOrientation);
    listenersAttached.current = false;
  };

  const requestPermission = async () => {
    // iOS: permission calls must be triggered directly by user gesture.
    let grantedCount = 0;
    let errorCount = 0;

    const requestOrientation = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const state = await (DeviceOrientationEvent as any).requestPermission();
          return state === 'granted';
        } catch (e) {
          console.error("Orientation permission error:", e);
          return false;
        }
      }
      return true;
    };

    const requestMotion = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const state = await (DeviceMotionEvent as any).requestPermission();
          return state === 'granted';
        } catch (e) {
          console.error("Motion permission error:", e);
          return false;
        }
      }
      return true;
    };

    // Run sequentially (gesture token preservation)
    if (await requestOrientation()) grantedCount++; else errorCount++;
    if (await requestMotion()) grantedCount++; else errorCount++;

    if (grantedCount > 0) {
      setPermissionState('granted');
      // Re-attach cleanly (in case user clicked multiple times)
      detachListeners();
      attachListeners();
    } else if (errorCount > 0) {
      setPermissionState('denied');
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    setLastMotionMs(Date.now());

    // ACCEL: iOS sometimes provides nulls in accelerationIncludingGravity; fallback to acceleration.
    const a = event.accelerationIncludingGravity ?? event.acceleration ?? null;
    if (a) {
      const x = (a.x ?? 0);
      const y = (a.y ?? 0);
      const z = (a.z ?? 0);
      setAcceleration({ x, y, z });

      const now = Date.now();
      if (now - lastChartUpdate.current > 100) { // 10fps
        setHistory(prev => [...prev, { x, y, z, timestamp: now }].slice(-30));
        lastChartUpdate.current = now;
      }
    }

    // GYRO: real gyro rate is rotationRate (deg/s)
    const r = event.rotationRate ?? null;
    if (r) {
      // rotationRate uses alpha/beta/gamma naming; map to x/y/z for display
      const gx = (r.beta ?? 0);   // x-ish
      const gy = (r.gamma ?? 0);  // y-ish
      const gz = (r.alpha ?? 0);  // z-ish
      setGyro({ x: gx, y: gy, z: gz });
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    setLastOrientationMs(Date.now());

    // Standard event.alpha is 0-360 (often relative); iOS provides webkitCompassHeading (magnetic)
    let alpha = event.alpha;
    let absolute = event.absolute;

    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      alpha = event.webkitCompassHeading;
      absolute = true;
    }

    setIsAbsolute(!!absolute);
    setRotation({
      alpha: alpha ?? 0,
      beta: event.beta ?? 0,
      gamma: event.gamma ?? 0
    });
  };

  useEffect(() => {
    const needsPermission =
      typeof (DeviceMotionEvent as any).requestPermission === 'function' ||
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsPermission) {
      setPermissionState('unknown');
    } else {
      setPermissionState('granted');
      attachListeners();
    }

    return () => {
      detachListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debugAge = (ms: number | null) => {
    if (!ms) return 'never';
    const age = Date.now() - ms;
    if (age < 1000) return `${age}ms`;
    return `${Math.round(age / 1000)}s`;
  };

  return (
    <>
      <SensorCard
        title="Accelerometer"
        icon={<Activity size={20} />}
        status={permissionState === 'granted' ? 'active' : 'waiting'}
        className="col-span-full"
      >
        {permissionState !== 'granted' ? (
          <div className="space-y-3">
            <p className="text-sm text-ios-subtext">
              iOS requires a user gesture to enable motion/orientation sensors.
            </p>
            <button
              onClick={requestPermission}
              className="px-4 py-2 rounded-xl bg-ios-blue text-white font-semibold w-full"
            >
              Enable Motion & Orientation
            </button>
            <div className="text-xs text-ios-subtext">
              Motion event: {debugAge(lastMotionMs)} • Orientation event: {debugAge(lastOrientationMs)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/60">
                <div className="text-xs text-ios-subtext">X</div>
                <div className="text-xl font-bold font-mono">{(acceleration.x ?? 0).toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/60">
                <div className="text-xs text-ios-subtext">Y</div>
                <div className="text-xl font-bold font-mono">{(acceleration.y ?? 0).toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/60">
                <div className="text-xs text-ios-subtext">Z</div>
                <div className="text-xl font-bold font-mono">{(acceleration.z ?? 0).toFixed(2)}</div>
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

            <div className="text-xs text-ios-subtext">
              Motion event: {debugAge(lastMotionMs)} • Orientation event: {debugAge(lastOrientationMs)}
            </div>
          </div>
        )}
      </SensorCard>

      <SensorCard
        title="Gyroscope (rotation rate)"
        icon={<Move3d size={20} />}
        status={permissionState === 'granted' ? 'active' : 'waiting'}
        className="col-span-full"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/60">
            <div className="text-xs text-ios-subtext">X (β deg/s)</div>
            <div className="text-xl font-bold font-mono">{(gyro.x ?? 0).toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60">
            <div className="text-xs text-ios-subtext">Y (γ deg/s)</div>
            <div className="text-xl font-bold font-mono">{(gyro.y ?? 0).toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60">
            <div className="text-xs text-ios-subtext">Z (α deg/s)</div>
            <div className="text-xl font-bold font-mono">{(gyro.z ?? 0).toFixed(2)}</div>
          </div>
        </div>
      </SensorCard>

      <SensorCard
        title="Compass / Orientation"
        icon={<Compass size={20} />}
        status={permissionState === 'granted' ? 'active' : 'waiting'}
        className="col-span-full"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/60">
            <div className="text-xs text-ios-subtext">Alpha (heading)</div>
            <div className="text-xl font-bold font-mono">{Math.round(rotation.alpha ?? 0)}°</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60">
            <div className="text-xs text-ios-subtext">Beta</div>
            <div className="text-xl font-bold font-mono">{Math.round(rotation.beta ?? 0)}°</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60">
            <div className="text-xs text-ios-subtext">Gamma</div>
            <div className="text-xl font-bold font-mono">{Math.round(rotation.gamma ?? 0)}°</div>
          </div>
        </div>

        <div className="mt-3 text-[10px] uppercase tracking-wider text-ios-subtext flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isAbsolute ? 'bg-ios-green' : 'bg-ios-orange'}`} />
          {isAbsolute ? 'Magnetic North (webkitCompassHeading)' : 'Relative (alpha/beta/gamma)'}
        </div>
      </SensorCard>
    </>
  );
};

export default MotionSensor;
