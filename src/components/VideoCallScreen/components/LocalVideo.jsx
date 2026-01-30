import React from 'react';
import { FaVideoSlash, FaMicrophoneSlash } from 'react-icons/fa';
import { MdScreenShare } from 'react-icons/md';

const LocalVideo = ({
  localVideoRef,
  isFullscreen,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing
}) => {
  return (
    <div className={`absolute ${isFullscreen ? 'top-8 right-8 w-64 h-48' : 'top-4 right-4 w-48 h-36'} transition-all duration-300 rounded-xl overflow-hidden border-2 border-gray-700/50 bg-black shadow-2xl`}>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        {!isVideoEnabled && (
          <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs">
            <FaVideoSlash />
          </div>
        )}
        {!isAudioEnabled && (
          <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs">
            <FaMicrophoneSlash />
          </div>
        )}
        {isScreenSharing && (
          <div className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded text-xs">
            <MdScreenShare />
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalVideo;