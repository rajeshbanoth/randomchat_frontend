// src/components/VideoChatScreen/components/DeviceErrorOverlay.jsx
import React from 'react';
import { FaExclamationTriangle, FaCamera, FaMicrophone, FaSync } from 'react-icons/fa';

const DeviceErrorOverlay = ({
  deviceError,
  hasLocalStream,
  retryLocalStream,
  createAndUsePlaceholder,
  setDeviceError,
  isInitializing
}) => {
  if (deviceError && !hasLocalStream && !isInitializing) {
    const isDeviceInUse = deviceError.includes('Device in use') || 
                         deviceError.includes('being used by another application');
    const isPermissionDenied = deviceError.includes('permission denied');
    const isNotFound = deviceError.includes('No camera/microphone found');
    
    return (
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-40 p-4">
        <div className="max-w-md w-full bg-gray-900/90 rounded-2xl border border-red-500/30 p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {isDeviceInUse ? 'Device Busy' : 
               isPermissionDenied ? 'Permission Required' :
               isNotFound ? 'Device Not Found' : 
               'Camera/Mic Error'}
            </h3>
            
            <p className="text-gray-300 mb-6">
              {deviceError}
            </p>
            
            <div className="space-y-3">
              {isDeviceInUse && (
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Quick Fix:</strong> Close other applications that might be using your camera/microphone (Zoom, Teams, Discord, etc.)
                  </p>
                </div>
              )}
              
              {isPermissionDenied && (
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mb-3">
                  <p className="text-sm text-yellow-300">
                    🔧 <strong>Permission Fix:</strong> Check browser settings to allow camera/microphone access for this site
                  </p>
                </div>
              )}
              
              <button
                onClick={retryLocalStream}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center"
              >
                <FaSync className="mr-2" />
                Retry Camera/Mic
              </button>
              
              <button
                onClick={() => {
                  createAndUsePlaceholder();
                  setDeviceError(null);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/80 to-pink-500/80 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center border border-purple-500/50"
              >
                <FaCamera className="mr-2" />
                Use Placeholder Video
              </button>
              
              {isDeviceInUse && (
                <button
                  onClick={() => {
                    // Try to request camera access without video to check permissions
                    navigator.mediaDevices.getUserMedia({ audio: true })
                      .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                        addNotification('Microphone is accessible', 'success');
                      })
                      .catch(err => {
                        addNotification('Microphone also blocked', 'error');
                      });
                    
                    // Try video only
                    navigator.mediaDevices.getUserMedia({ video: true })
                      .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                        addNotification('Camera is accessible', 'success');
                      })
                      .catch(err => {
                        addNotification('Camera also blocked', 'error');
                      });
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg font-medium hover:opacity-90 transition-all duration-300 text-sm"
                >
                  Test Camera & Mic Separately
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default DeviceErrorOverlay;