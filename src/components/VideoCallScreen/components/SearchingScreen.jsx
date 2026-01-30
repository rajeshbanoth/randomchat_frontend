import React from 'react';
import { FaArrowLeft, FaPalette, FaLink, FaCog } from 'react-icons/fa';
import ConnectionStatus from './ConnectionStatus';
import { formatTime } from '../../../utils/videoUtils';

const Header = ({
  showControls,
  partner,
  partnerDisconnected,
  activeTheme,
  setActiveTheme,
  themes,
  callInfo,
  copyRoomLink,
  showSettings,
  setShowSettings,
  connectionStatus,
  callDuration,
  handleDisconnect,
  setCurrentScreen
}) => {
  return (
    <div className={`relative px-6 py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              handleDisconnect();
              setCurrentScreen('home');
            }}
            className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">End Call</span>
          </button>
          
          {partner && (
            <div className="group flex items-center space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                    {(partner.profile?.username || partner.username || 'S').charAt(0)}
                  </div>
                </div>
                {partnerDisconnected ? (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border-2 border-gray-900"></div>
                ) : (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {partner.profile?.username || partner.username || 'Stranger'}
                </div>
                <div className="text-xs text-gray-400 flex items-center">
                  <ConnectionStatus
                    connectionStatus={connectionStatus}
                    callDuration={callDuration}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
            className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
          >
            <FaPalette className="group-hover:rotate-180 transition-transform" />
          </button>
          {callInfo.roomId && (
            <button
              onClick={copyRoomLink}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
              title="Copy Room Link"
            >
              <FaLink className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
          >
            <FaCog className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;