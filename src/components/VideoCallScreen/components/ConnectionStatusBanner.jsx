import React from 'react';

const ConnectionStatusBanner = ({ connectionStatus }) => {
  if (connectionStatus === 'connecting') {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm sm:text-lg font-medium">Establishing connection...</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default ConnectionStatusBanner;