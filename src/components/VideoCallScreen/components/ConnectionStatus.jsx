import React from 'react';

const ConnectionStatus = ({ connectionStatus, callDuration, formatTime }) => {
  const statusColors = {
    connecting: 'text-yellow-400',
    connected: 'text-green-400',
    disconnected: 'text-red-400',
    failed: 'text-red-500',
    closed: 'text-gray-400',
    new: 'text-blue-400'
  };
  
  const statusText = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    failed: 'Connection Failed',
    closed: 'Call Ended',
    new: 'Initializing...'
  };
  
  return (
    <div className={`flex items-center ${statusColors[connectionStatus] || 'text-gray-400'}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${statusColors[connectionStatus]?.replace('text-', 'bg-')}`}></div>
      <span className="text-sm font-medium">
        {statusText[connectionStatus] || connectionStatus}
      </span>
      {connectionStatus === 'connected' && (
        <span className="ml-2 text-xs text-gray-400">
          {formatTime(callDuration)}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;