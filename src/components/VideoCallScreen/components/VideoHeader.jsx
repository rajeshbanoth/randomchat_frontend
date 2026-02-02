import React from 'react';
import { FaArrowLeft, FaPalette, FaLink, FaCog } from 'react-icons/fa';
import LayoutSwitcher from './LayoutSwitcher';
import ConnectionStatus from './ConnectionStatus';

const VideoHeader = ({
  showControls,
  partner,
  partnerDisconnected,
  connectionStatus,
  callDuration,
  formatTime,
  videoLayout,
  handleLayoutChange,
  usingPlaceholder,
  setActiveTheme,
  activeTheme,
  themes,
  copyRoomLink,
  setShowSettings,
  showSettings,
  callInfo,
  handleDisconnect,
  setCurrentScreen
}) => {
  const themesList = Object.keys(themes);
  
  return (
    <div className={`relative px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => {
              handleDisconnect();
              setCurrentScreen('home');
            }}
            className="group flex items-center space-x-2 sm:space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">End Call</span>
          </button>
          
          {partner && (
            <div className="group flex items-center space-x-2 sm:space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
              <div className="relative">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                    {(partner.profile?.username || partner.username || 'S').charAt(0)}
                  </div>
                </div>
                {partnerDisconnected ? (
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border border-gray-900"></div>
                ) : (
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border border-gray-900"></div>
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-sm sm:text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {partner.profile?.username || partner.username || 'Stranger'}
                </div>
                <ConnectionStatus
                  connectionStatus={connectionStatus}
                  callDuration={callDuration}
                  formatTime={formatTime}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Layout Switcher */}
          <LayoutSwitcher
            videoLayout={videoLayout}
            handleLayoutChange={handleLayoutChange}
          />
          
          {usingPlaceholder && (
            <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <span className="text-xs text-purple-300">Placeholder</span>
            </div>
          )}
          
          <button
            onClick={() => setActiveTheme(prev => themesList[(themesList.indexOf(prev) + 1) % themesList.length])}
            className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
          >
            <FaPalette className="text-sm sm:text-base group-hover:rotate-180 transition-transform" />
          </button>
          
          {callInfo.roomId && (
            <button
              onClick={copyRoomLink}
              className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
              title="Copy Room Link"
            >
              <FaLink className="text-sm sm:text-base group-hover:scale-110 transition-transform" />
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
          >
            <FaCog className="text-sm sm:text-base group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoHeader;