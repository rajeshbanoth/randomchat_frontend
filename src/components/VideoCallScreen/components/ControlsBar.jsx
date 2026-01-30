import React from 'react';
import { FaUser, FaVideo, FaVideoSlash, FaMicrophoneSlash } from 'react-icons/fa';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';

const VideoArea = ({
  remoteVideoRef,
  localVideoRef,
  remoteStream,
  connectionStatus,
  hasLocalStream,
  isFullscreen,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isRemoteVideoMuted,
  isRemoteAudioMuted
}) => {
  return (
    <div className="video-container flex-1 relative overflow-hidden bg-black">
      <RemoteVideo
        remoteVideoRef={remoteVideoRef}
        remoteStream={remoteStream}
        connectionStatus={connectionStatus}
        isRemoteVideoMuted={isRemoteVideoMuted}
        isRemoteAudioMuted={isRemoteAudioMuted}
      />
      
      {hasLocalStream && (
        <LocalVideo
          localVideoRef={localVideoRef}
          isFullscreen={isFullscreen}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isScreenSharing={isScreenSharing}
        />
      )}
      
      {connectionStatus === 'connecting' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium">Establishing secure connection...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoArea;