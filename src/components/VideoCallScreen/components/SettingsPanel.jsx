import React from 'react';
import {
  FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash,
  FaPhone, FaRandom, FaExpand, FaCompress,
  FaInfoCircle, FaRegCopy, FaSync
} from 'react-icons/fa';
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';

const ControlsBar = ({
  showControls,
  hasLocalStream,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isFullscreen,
  callInfo,
  retryCount,
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  toggleFullscreen,
  handleDisconnect,
  handleNext,
  copyRoomLink,
  retryLocalStream,
  debugGetState,
  checkStreamState,
  addNotification
}) => {
  return (
    <div className={`relative p-6 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={toggleVideo}
            disabled={!hasLocalStream}
            className={`p-4 rounded-full transition-all duration-300 ${isVideoEnabled
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
              : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isVideoEnabled ? (
              <FaVideo className="text-2xl group-hover:scale-110 transition-transform" />
            ) : (
              <FaVideoSlash className="text-2xl group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <button
            onClick={toggleAudio}
            disabled={!hasLocalStream}
            className={`p-4 rounded-full transition-all duration-300 ${isAudioEnabled
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
              : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAudioEnabled ? (
              <FaMicrophone className="text-2xl group-hover:scale-110 transition-transform" />
            ) : (
              <FaMicrophoneSlash className="text-2xl group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-300 ${isScreenSharing
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
              : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'} group`}
          >
            {isScreenSharing ? (
              <MdStopScreenShare className="text-2xl group-hover:scale-110 transition-transform" />
            ) : (
              <MdScreenShare className="text-2xl group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <button
            onClick={handleDisconnect}
            className="p-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 group"
          >
            <FaPhone className="text-2xl group-hover:rotate-90 transition-transform" />
          </button>
          
          <button
            onClick={handleNext}
            className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-500/30 group"
          >
            <FaRandom className="text-2xl group-hover:rotate-180 transition-transform" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
          >
            {isFullscreen ? (
              <FaCompress className="text-2xl group-hover:scale-110 transition-transform" />
            ) : (
              <FaExpand className="text-2xl group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
        
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => {
              const debugState = debugGetState?.();
              console.log('Debug State:', debugState);
              checkStreamState();
              addNotification('Debug info logged to console', 'info');
            }}
            className="px-4 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
          >
            <FaInfoCircle className="inline mr-2" />
            Debug Stream
          </button>
          
          {callInfo.roomId && (
            <button
              onClick={copyRoomLink}
              className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
            >
              <FaRegCopy className="inline mr-2" />
              Copy Room Link
            </button>
          )}
          
          {!hasLocalStream && (
            <button
              onClick={retryLocalStream}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
            >
              <FaSync className="inline mr-2" />
              Retry Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;