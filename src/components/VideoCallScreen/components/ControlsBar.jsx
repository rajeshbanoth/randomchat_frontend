import React from 'react';
import {
  FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash,
  FaPhone, FaRandom, FaExpand, FaCompress, FaInfoCircle,
  FaSync, FaCamera, FaRegCopy, FaUsers
} from 'react-icons/fa';
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';

const ControlsBar = ({
  showControls,
  hasLocalStream,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  handleDisconnect,
  handleNext,
  toggleFullscreen,
  isFullscreen,
  debugLayoutInfo,
  debugStreamInfo,
  testAllLayouts,
  copyRoomLink,
  callInfo,
  retryLocalStream,
  createAndUsePlaceholder,
  videoLayout,
  handleLayoutChange,
  isMobile,
  forceStreamSync,
  addNotification
}) => {
  return (
    <div className={`relative bg-gray-900/70 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Main Controls - Large buttons for easy access */}
      <div className="p-3 sm:p-4 border-t border-gray-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {/* Toggle Video */}
            <button
              onClick={toggleVideo}
              disabled={!hasLocalStream}
              className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isVideoEnabled
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? (
                <FaVideo className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaVideoSlash className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Toggle Audio */}
            <button
              onClick={toggleAudio}
              disabled={!hasLocalStream}
              className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isAudioEnabled
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isAudioEnabled ? (
                <FaMicrophone className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaMicrophoneSlash className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isScreenSharing
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
                : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'} group`}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? (
                <MdStopScreenShare className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <MdScreenShare className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* End Call - Prominent */}
            <button
              onClick={handleDisconnect}
              className="p-4 sm:p-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 group transform hover:rotate-6"
              title="End call"
            >
              <FaPhone className="text-xl sm:text-2xl group-hover:rotate-90 transition-transform" />
            </button>
            
            {/* Next Partner */}
            <button
              onClick={handleNext}
              className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-500/30 group"
              title="Next partner"
            >
              <FaRandom className="text-xl sm:text-2xl group-hover:rotate-180 transition-transform" />
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <FaCompress className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaExpand className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Additional Controls - Smaller secondary buttons */}
      <div className="px-4 pb-2 sm:px-6 sm:pb-3 border-t border-gray-800/30 pt-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-2 sm:space-x-4">
            <button
              onClick={debugLayoutInfo}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
              title="Debug layout information"
            >
              <FaInfoCircle className="inline mr-1 sm:mr-2" />
              <span>Debug Layout</span>
            </button>
            
            <button
              onClick={debugStreamInfo}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
              title="Debug stream information"
            >
              <FaInfoCircle className="inline mr-1 sm:mr-2" />
              <span>Debug Streams</span>
            </button>
            
            <button
              onClick={testAllLayouts}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-green-500/30"
              title="Test all layouts"
            >
              <FaSync className="inline mr-1 sm:mr-2" />
              <span>Test Layouts</span>
            </button>
            
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                title="Copy room link"
              >
                <FaRegCopy className="inline mr-1 sm:mr-2" />
                <span>Copy Link</span>
              </button>
            )}
            
            {!hasLocalStream && (
              <button
                onClick={retryLocalStream}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
                title="Retry camera"
              >
                <FaSync className="inline mr-1 sm:mr-2" />
                <span>Retry Camera</span>
              </button>
            )}
            
            <button
              onClick={createAndUsePlaceholder}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
              title="Use placeholder video"
            >
              <FaCamera className="inline mr-1 sm:mr-2" />
              <span>Placeholder</span>
            </button>
            
            {/* Quick Layout Switcher for Mobile */}
            {isMobile && (
              <button
                onClick={() => {
                  const layouts = ['pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 'stack'];
                  const nextLayout = layouts[(layouts.indexOf(videoLayout) + 1) % layouts.length];
                  handleLayoutChange(nextLayout);
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-indigo-500/30"
                title="Switch layout"
              >
                <span>Layout: {videoLayout.replace('-', ' ')}</span>
              </button>
            )}
            
            <button
              onClick={() => {
                forceStreamSync();
                addNotification('Forced stream sync', 'info');
              }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-amber-500/30"
              title="Force stream sync"
            >
              <FaSync className="inline mr-1 sm:mr-2" />
              <span>Sync Streams</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;