import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import SensorCard from './SensorCard';
import { GeolocationData } from '../types';

const LocationSensor: React.FC = () => {
  const [data, setData] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <SensorCard 
        title="Geolocation" 
        icon={<MapPin size={20} />} 
        status={error ? 'error' : data.latitude ? 'active' : 'waiting'}
        className="col-span-1 md:col-span-2"
    >
      {error ? (
        <div className="text-ios-red text-center p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-ios-subtext text-xs uppercase">Latitude</span>
                <span className="font-mono text-xl text-white truncate">{data.latitude?.toFixed(5) || '--'}</span>
            </div>
            <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-ios-subtext text-xs uppercase">Longitude</span>
                <span className="font-mono text-xl text-white truncate">{data.longitude?.toFixed(5) || '--'}</span>
            </div>
            <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-ios-subtext text-xs uppercase">Alt (m)</span>
                <span className="font-mono text-xl text-ios-blue">{data.altitude ? Math.round(data.altitude) : '--'}</span>
            </div>
            <div className="bg-ios-gray/20 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-ios-subtext text-xs uppercase">Speed (m/s)</span>
                <span className="font-mono text-xl text-ios-green">{data.speed ? data.speed.toFixed(1) : '0'}</span>
            </div>
            
            <div className="col-span-2 md:col-span-4 bg-ios-gray/10 p-3 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Navigation size={16} className={`text-ios-orange transition-transform duration-500`} style={{ transform: `rotate(${data.heading || 0}deg)` }} />
                    <span className="text-sm">Heading: <span className="font-mono text-white">{data.heading ? Math.round(data.heading) : 0}°</span></span>
                 </div>
                 <div className="text-xs text-ios-subtext">
                    Accuracy: ±{data.accuracy ? Math.round(data.accuracy) : 0}m
                 </div>
            </div>
        </div>
      )}
    </SensorCard>
  );
};

export default LocationSensor;