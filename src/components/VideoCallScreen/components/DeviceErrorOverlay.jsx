import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeviceErrorOverlay = ({
  deviceError,
  retryLocalStream,
  addNotification,
  setDeviceError
}) => {
  if (!deviceError) return null;
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 z-40 max-w-md">
      <div className="text-center">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Device Error</h3>
        <p className="text-gray-300 mb-4">
          {deviceError}
        </p>
        <div className="space-y-3">
          <button
            onClick={retryLocalStream}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-all duration-300"
          >
            Retry Connection
          </button>
          <button
            onClick={() => {
              addNotification('Using placeholder video', 'info');
              setDeviceError(null);
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg font-medium hover:opacity-90 transition-all duration-300 border border-gray-700"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceErrorOverlay;