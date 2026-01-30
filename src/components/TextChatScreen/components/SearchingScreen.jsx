import React from 'react';
import { FaArrowLeft, FaCog, FaQrcode, FaTimes, FaSearch } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import QRScanner from './QRScanner';

const SearchingScreen = ({
  onBack,
  showScanner,
  setShowScanner,
  isScanning,
  setIsScanning,
  simulateScanner,
  showSettings,
  setShowSettings,
  autoConnect,
  toggleAutoConnect,
  themes,
  activeTheme
}) => {
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
         
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
              <div className="relative">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Searching...
              </span>
            </div>
           
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <FaCog className="text-xl" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Searching Screen */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="text-center max-w-md">
          {/* Animated Orb */}
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
            </div>
            <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl relative animate-float">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
              <FaSearch className="relative animate-pulse" />
            </div>
          </div>
         
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Looking for a partner...
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            We're searching for someone who matches your interests
          </p>
         
          <div className="space-y-4 max-w-xs mx-auto">
            <button
              onClick={onBack}
              className="w-full px-8 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
            >
              <span className="group-hover:translate-x-1 transition-transform inline-block">
                Cancel Search
              </span>
            </button>
           
            <button
              onClick={() => setShowScanner(true)}
              className="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 group flex items-center justify-center"
            >
              <FaQrcode className="mr-3 group-hover:rotate-12 transition-transform" />
              Scan QR Code
            </button>
          </div>
        </div>
      </div>
      
      {/* QR Scanner Modal */}
      <QRScanner
        showScanner={showScanner}
        setShowScanner={setShowScanner}
        isScanning={isScanning}
        setIsScanning={setIsScanning}
        simulateScanner={simulateScanner}
      />
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 shadow-2xl w-64 z-50">
          <div className="space-y-4">
            <div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoConnect}
                    onChange={toggleAutoConnect}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                    autoConnect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                  }`}></div>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    autoConnect ? 'transform translate-x-5' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-300">Auto-connect</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Automatically search for next partner
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchingScreen;