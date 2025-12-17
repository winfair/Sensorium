import React from 'react';
import MotionSensor from './components/MotionSensor';
import LocationSensor from './components/LocationSensor';
import MediaSensor from './components/MediaSensor';
import SystemSensor from './components/SystemSensor';
import DownloadButton from './components/DownloadButton';
import { Smartphone } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-ios-text p-4 md:p-8 font-sans selection:bg-ios-blue selection:text-white pb-20">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ios-blue to-ios-purple rounded-xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
                <Smartphone className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Sensorium</h1>
                <p className="text-ios-subtext text-sm">Real-time Device Intelligence</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <div className="hidden md:block text-xs font-mono text-ios-subtext">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
             <DownloadButton />
        </div>
      </header>

      {/* Grid Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Row 1: Motion (Takes vertical space on large screens) & Compass */}
        <MotionSensor />

        {/* Row 2: Location & System */}
        <LocationSensor />
        <SystemSensor />
        
        {/* Row 3: Media */}
        <MediaSensor />

      </main>

      <footer className="mt-12 text-center text-ios-subtext text-xs max-w-xl mx-auto opacity-50">
        <p>
            Data is processed locally on your device. Accuracy depends on hardware capabilities and browser permissions.
            <br />
            Designed for iOS & WebKit.
        </p>
      </footer>
    </div>
  );
};

export default App;