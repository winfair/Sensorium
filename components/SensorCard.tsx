import React from 'react';

interface SensorCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  status?: 'active' | 'inactive' | 'error' | 'waiting';
  className?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ title, icon, children, status = 'active', className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-ios-green';
      case 'inactive': return 'text-ios-subtext';
      case 'error': return 'text-ios-red';
      case 'waiting': return 'text-ios-orange';
      default: return 'text-ios-subtext';
    }
  };

  return (
    <div className={`bg-ios-card/80 backdrop-blur-md border border-ios-gray rounded-2xl p-5 flex flex-col gap-4 shadow-lg transition-all duration-300 hover:bg-ios-card ${className}`}>
      <div className="flex items-center justify-between border-b border-ios-gray pb-3">
        <div className="flex items-center gap-2">
          <div className="text-ios-blue p-2 bg-ios-blue/10 rounded-full">
            {icon}
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        <div className={`text-xs font-mono uppercase tracking-wider ${getStatusColor()} flex items-center gap-1`}>
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-ios-green animate-pulse' : status === 'waiting' ? 'bg-ios-orange' : status === 'error' ? 'bg-ios-red' : 'bg-ios-subtext'}`}></span>
          {status}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

export default SensorCard;