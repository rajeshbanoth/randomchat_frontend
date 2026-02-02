// src/components/VideoChatScreen/components/DeviceSelector.jsx
import React, { useState, useEffect } from 'react';
import { FaCamera, FaMicrophone, FaTimes, FaCheck } from 'react-icons/fa';

const DeviceSelector = ({
  availableDevices,
  switchCamera,
  switchMicrophone,
  setShowDeviceSelector
}) => {
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');

  useEffect(() => {
    const cams = availableDevices.filter(d => d.kind === 'videoinput');
    const mics = availableDevices.filter(d => d.kind === 'audioinput');
    
    setCameras(cams);
    setMicrophones(mics);
    
    // Get current preferences
    const preferredCamera = localStorage.getItem('preferredCameraId');
    const preferredMic = localStorage.getItem('preferredMicrophoneId');
    
    if (preferredCamera && cams.some(cam => cam.deviceId === preferredCamera)) {
      setSelectedCamera(preferredCamera);
    }
    if (preferredMic && mics.some(mic => mic.deviceId === preferredMic)) {
      setSelectedMicrophone(preferredMic);
    }
  }, [availableDevices]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Select Devices</h3>
          <button
            onClick={() => setShowDeviceSelector(false)}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          {/* Cameras */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <FaCamera className="text-blue-400 mr-2" />
              <h4 className="font-medium text-white">Camera</h4>
            </div>
            <div className="space-y-2">
              {cameras.length === 0 ? (
                <p className="text-gray-400 text-sm">No cameras found</p>
              ) : (
                cameras.map(camera => (
                  <button
                    key={camera.deviceId}
                    onClick={() => {
                      setSelectedCamera(camera.deviceId);
                      switchCamera(camera.deviceId);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedCamera === camera.deviceId
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">
                          {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                        </div>
                        {camera.label && (
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {camera.deviceId.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                      {selectedCamera === camera.deviceId && (
                        <FaCheck className="text-green-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Microphones */}
          <div>
            <div className="flex items-center mb-3">
              <FaMicrophone className="text-green-400 mr-2" />
              <h4 className="font-medium text-white">Microphone</h4>
            </div>
            <div className="space-y-2">
              {microphones.length === 0 ? (
                <p className="text-gray-400 text-sm">No microphones found</p>
              ) : (
                microphones.map(mic => (
                  <button
                    key={mic.deviceId}
                    onClick={() => {
                      setSelectedMicrophone(mic.deviceId);
                      switchMicrophone(mic.deviceId);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedMicrophone === mic.deviceId
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">
                          {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                        </div>
                        {mic.label && (
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {mic.deviceId.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                      {selectedMicrophone === mic.deviceId && (
                        <FaCheck className="text-green-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setShowDeviceSelector(false)}
            className="w-full px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelector;