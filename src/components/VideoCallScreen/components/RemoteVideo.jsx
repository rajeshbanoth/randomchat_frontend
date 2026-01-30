import React from 'react';
import { FaUser, FaVideoSlash, FaMicrophoneSlash } from 'react-icons/fa';

const RemoteVideo = ({
  remoteVideoRef,
  remoteStream,
  connectionStatus,
  isRemoteVideoMuted,
  isRemoteAudioMuted
}) => {
  return (
    <div className="absolute inset-0">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {(!remoteStream || connectionStatus !== 'connected') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-8 border border-gray-700/50">
            {connectionStatus === 'connecting' ? (
              <div className="text-5xl text-blue-400 animate-pulse">
                <FaVideo />
              </div>
            ) : (
              <div className="text-5xl text-gray-600">
                <FaUser />
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for partner'}
          </h3>
          <p className="text-gray-400 mb-10 text-lg">
            {connectionStatus === 'connecting'
              ? 'Establishing video connection...'
              : 'Partner video will appear here'}
          </p>
          
          {remoteStream && (
            <div className="space-y-2">
              {isRemoteVideoMuted && (
                <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                  <FaVideoSlash className="inline mr-2" />
                  <span>Partner camera is off</span>
                </div>
              )}
              {isRemoteAudioMuted && (
                <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                  <FaMicrophoneSlash className="inline mr-2" />
                  <span>Partner microphone is muted</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RemoteVideo;