import React from 'react';
import { FaVideoSlash, FaMicrophoneSlash, FaUser, FaVideo } from 'react-icons/fa';
import { MdScreenShare } from 'react-icons/md';

const VideoOverlay = ({
  type,
  isRemoteVideoMuted,
  isRemoteAudioMuted,
  connectionStatus,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isSmall
}) => {
  if (type === 'remote') {
    if (!connectionStatus || connectionStatus !== 'connected') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90">
          <div className={`${isSmall ? 'w-12 h-12' : 'w-24 h-24'} rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-4 border border-gray-700/50`}>
            {connectionStatus === 'connecting' ? (
              <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} text-blue-400 animate-pulse`}>
                <FaVideo />
              </div>
            ) : (
              <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} text-gray-600`}>
                <FaUser />
              </div>
            )}
          </div>
          <h3 className={`${isSmall ? 'text-sm' : 'text-xl'} font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}>
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Partner'}
          </h3>
        </div>
      );
    }
    
    // Status indicators for remote video
    return (
      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
        {isRemoteVideoMuted && (
          <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
            <FaVideoSlash className="mr-2" />
            <span>Video Off</span>
          </div>
        )}
        {isRemoteAudioMuted && (
          <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
            <FaMicrophoneSlash className="mr-2" />
            <span>Audio Off</span>
          </div>
        )}
      </div>
    );
  }
  
  if (type === 'local') {
    return (
      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
        {!isVideoEnabled && (
          <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
            <FaVideoSlash className="mr-2" />
            {!isSmall && <span>Camera Off</span>}
          </div>
        )}
        {!isAudioEnabled && (
          <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
            <FaMicrophoneSlash className="mr-2" />
            {!isSmall && <span>Mic Off</span>}
          </div>
        )}
        {isScreenSharing && (
          <div className="px-3 py-1.5 bg-blue-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
            <MdScreenShare className="mr-2" />
            {!isSmall && <span>Screen Sharing</span>}
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

export default VideoOverlay;