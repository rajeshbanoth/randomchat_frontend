import React from 'react';
import { FaArrowLeft, FaCog, FaVideo } from 'react-icons/fa';

const SearchingScreen = ({
  activeTheme,
  setCurrentScreen,
  showSettings,
  setShowSettings
}) => {
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${activeTheme} transition-all duration-500`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <div className="relative px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="group flex items-center space-x-2 sm:space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
              <div className="relative">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Searching for video...
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Searching Screen */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        <div className="text-center max-w-md">
          {/* Animated Video Icon */}
          <div className="relative mb-6 sm:mb-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
            </div>
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-5xl relative animate-float">
              <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
              <FaVideo className="relative animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Looking for video partner...
          </h2>
          <p className="text-gray-400 mb-6 sm:mb-10 text-sm sm:text-lg">
            We're searching for someone who wants to video chat
          </p>
          
          <div className="space-y-3 sm:space-y-4 max-w-xs mx-auto">
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full px-4 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
            >
              <span className="group-hover:translate-x-1 transition-transform inline-block text-sm sm:text-base">
                Cancel Search
              </span>
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full px-4 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm group"
            >
              <FaCog className="inline mr-2 sm:mr-3 group-hover:rotate-180 transition-transform" />
              <span className="text-sm sm:text-base">Video Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchingScreen;