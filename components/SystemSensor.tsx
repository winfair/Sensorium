import React, { useState, useEffect } from 'react';
import { Battery, Wifi, Monitor, Cpu } from 'lucide-react';
import SensorCard from './SensorCard';
import { NavigatorWithBattery } from '../types';

const SystemSensor: React.FC = () => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<string>('unknown');
  const [connectionSpeed, setConnectionSpeed] = useState<number | undefined>(undefined);
  const [cores, setCores] = useState<number>(navigator.hardwareConcurrency || 0);
  const [touchPoints, setTouchPoints] = useState<number>(navigator.maxTouchPoints || 0);

  useEffect(() => {
    // Battery
    const nav = navigator as NavigatorWithBattery;
    if (nav.getBattery) {
      nav.getBattery().then(battery => {
        setBatteryLevel(battery.level * 100);
        setIsCharging(battery.charging);
        
        battery.addEventListener('levelchange', () => setBatteryLevel(battery.level * 100));
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
      });
    }

    // Network
    if (nav.connection) {
      setNetworkType(nav.connection.effectiveType || 'unknown');
      setConnectionSpeed(nav.connection.downlink);
      
      // Note: connection change events are not standard everywhere so we skip listeners for simplicity
    }
  }, []);

  return (
    <SensorCard 
        title="System Status" 
        icon={<Cpu size={20} />} 
        status="active"
        className="col-span-1 md:col-span-2"
    >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Battery */}
            <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-2 text-ios-subtext text-xs uppercase mb-1">
                    <Battery size={14} />
                    <span>Battery</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-mono ${isCharging ? 'text-ios-green' : 'text-white'}`}>
                        {batteryLevel !== null ? Math.round(batteryLevel) : '--'}
                    </span>
                    <span className="text-sm">%</span>
                </div>
                {isCharging && <span className="text-[10px] text-ios-green uppercase tracking-wide">Charging</span>}
            </div>

            {/* Network */}
            <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-2 text-ios-subtext text-xs uppercase mb-1">
                    <Wifi size={14} />
                    <span>Network</span>
                </div>
                <span className="text-lg capitalize text-white truncate">{networkType}</span>
                {connectionSpeed && (
                    <span className="text-xs text-ios-subtext">~{connectionSpeed} Mbps</span>
                )}
            </div>

             {/* Hardware */}
             <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-2 text-ios-subtext text-xs uppercase mb-1">
                    <Cpu size={14} />
                    <span>Cores</span>
                </div>
                <span className="text-2xl font-mono text-white">{cores}</span>
            </div>

             {/* Display */}
             <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-2 text-ios-subtext text-xs uppercase mb-1">
                    <Monitor size={14} />
                    <span>Display</span>
                </div>
                <div className="text-xs text-white">
                    {window.screen.width} x {window.screen.height}
                </div>
                <span className="text-[10px] text-ios-subtext">
                    {touchPoints > 0 ? `${touchPoints} Touch Points` : 'No Touch'}
                </span>
            </div>

        </div>
    </SensorCard>
  );
};

export default SystemSensor;