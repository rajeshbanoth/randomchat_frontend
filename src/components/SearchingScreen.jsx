// src/components/SearchingScreen.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, 
  FaQrcode, 
  FaVideo, 
  FaComments, 
  FaGlobe, 
  FaSearch,
  FaUsers,
  FaRocket,
  FaSatellite,
  FaCompass,
  FaSync,
  FaPause,
  FaPlay,
  FaExpand,
  FaCog
} from 'react-icons/fa';
import { RiEarthFill } from 'react-icons/ri';
import { formatSearchTime } from '../utils/helpers';

const SearchingScreen = ({ mode, searchTime, onBack, onScanQR }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [searchTips, setSearchTips] = useState([
    "Finding someone who shares your interests...",
    "Scanning global chat network...",
    "Matching based on preferences...",
    "Looking for the perfect conversation partner...",
    "Analyzing compatibility scores...",
    "Searching for active users nearby..."
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [matchedUsers, setMatchedUsers] = useState(0);
  const [searchRadius, setSearchRadius] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Rotate search tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      if (!isPaused) {
        setCurrentTipIndex((prev) => (prev + 1) % searchTips.length);
      }
    }, 3000);
    return () => clearInterval(tipInterval);
  }, [isPaused, searchTips.length]);

  // Simulate matched users count
  useEffect(() => {
    const userInterval = setInterval(() => {
      if (!isPaused) {
        setMatchedUsers(prev => prev + Math.floor(Math.random() * 3));
      }
    }, 1500);
    return () => clearInterval(userInterval);
  }, [isPaused]);

  // Animate search radius
  useEffect(() => {
    const radiusInterval = setInterval(() => {
      if (!isPaused) {
        setSearchRadius(prev => {
          const newRadius = prev + Math.random() * 10 - 5;
          return Math.max(10, Math.min(100, newRadius));
        });
      }
    }, 1000);
    return () => clearInterval(radiusInterval);
  }, [isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-black overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(100, 100, 255, 0.2) 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Animated Rings */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 rounded-full border-2 border-blue-500/10 animate-ping"></div>
          <div className="w-80 h-80 rounded-full border-2 border-purple-500/10 animate-ping" style={{animationDelay: '0.5s'}}></div>
          <div className="w-64 h-64 rounded-full border-2 border-pink-500/10 animate-ping" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/30 bg-gradient-to-b from-gray-900/80 to-transparent backdrop-blur-xl z-20 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 transition-all duration-300 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Cancel Search</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={togglePause}
              className="p-2.5 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 group"
              title={isPaused ? "Resume Search" : "Pause Search"}
            >
              {isPaused ? <FaPlay className="text-green-400" /> : <FaPause className="text-yellow-400" />}
            </button>
            
            <button
              onClick={onScanQR}
              className="p-2.5 rounded-full bg-gradient-to-r from-blue-900/50 to-blue-800/50 hover:from-blue-800/50 hover:to-blue-700/50 backdrop-blur-sm border border-blue-700/50 transition-all duration-300 group"
              title="Scan QR Code"
            >
              <FaQrcode className="text-blue-400 group-hover:rotate-12 transition-transform" />
            </button> */}
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2.5 rounded-full bg-gradient-to-r from-purple-900/50 to-purple-800/50 hover:from-purple-800/50 hover:to-purple-700/50 backdrop-blur-sm border border-purple-700/50 transition-all duration-300 group"
              title="Advanced Options"
            >
              <FaCog className={`text-purple-400 ${showAdvanced ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Search Visualization */}
          <div className="relative mb-12">
            <div className="relative h-64 flex items-center justify-center">
              {/* Central Icon */}
              <div className="relative z-20">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center relative ${
                  mode === 'video' 
                    ? 'bg-gradient-to-r from-red-500/20 via-pink-500/20 to-rose-500/20'
                    : 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20'
                } backdrop-blur-sm border ${
                  mode === 'video' 
                    ? 'border-red-500/30' 
                    : 'border-blue-500/30'
                }`}>
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                    mode === 'video'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30'
                  }`}>
                    {mode === 'video' ? (
                      <FaVideo className="text-5xl text-white animate-pulse" />
                    ) : (
                      <FaComments className="text-5xl text-white animate-pulse" />
                    )}
                  </div>
                  
                  {/* Rotating Satellites */}
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute animate-orbit"
                      style={{
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '3s',
                        transformOrigin: 'center'
                      }}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-cyan-500/30">
                        <FaUsers className="text-lg text-cyan-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pulsing Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full border-2 border-blue-500/20 animate-pulse-ring"></div>
                <div className="w-80 h-80 rounded-full border-2 border-purple-500/20 animate-pulse-ring" style={{animationDelay: '0.2s'}}></div>
                <div className="w-64 h-64 rounded-full border-2 border-pink-500/20 animate-pulse-ring" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>

          {/* Search Info */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Searching for {mode === 'video' ? 'Video' : 'Text'} Partner
            </h1>
            
            {/* Search Tips */}
            <div className="h-12 mb-6">
              <div className="text-xl text-gray-300 animate-fade-in-out">
                {searchTips[currentTipIndex]}
              </div>
            </div>
          </div>

          {/* Search Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-sm rounded-2xl border border-blue-700/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <FaGlobe className="text-2xl text-blue-400" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{formatSearchTime(searchTime)}</div>
                  <div className="text-sm text-blue-300">Search Time</div>
                </div>
              </div>
              <div className="w-full bg-blue-900/50 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(searchTime % 60) / 60 * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-sm rounded-2xl border border-purple-700/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <FaUsers className="text-2xl text-purple-400" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{matchedUsers}</div>
                  <div className="text-sm text-purple-300">Users Scanned</div>
                </div>
              </div>
              <div className="text-xs text-gray-400">Active users in your region</div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-pink-900/20 to-pink-800/10 backdrop-blur-sm rounded-2xl border border-pink-700/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <FaCompass className="text-2xl text-pink-400" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{searchRadius}%</div>
                  <div className="text-sm text-pink-300">Search Radius</div>
                </div>
              </div>
              <div className="w-full bg-pink-900/50 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-1000"
                  style={{ width: `${searchRadius}%` }}
                ></div>
              </div>
            </div>
          </div> */}

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="mb-8 p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 animate-slide-down">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <FaCog className="text-purple-400" />
                <span>Advanced Search Options</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Search Radius</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Match Priority</label>
                  <select className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white">
                    <option>Highest Compatibility</option>
                    <option>Location Based</option>
                    <option>Interests Match</option>
                    <option>Random</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={togglePause}
              className={`px-8 py-4 rounded-xl font-medium flex items-center justify-center space-x-3 transition-all duration-300 ${
                isPaused
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                  : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500'
              }`}
            >
              {isPaused ? (
                <>
                  <FaPlay />
                  <span>Resume Search</span>
                </>
              ) : (
                <>
                  <FaPause />
                  <span>Pause Search</span>
                </>
              )}
            </button>
            
            <button
              onClick={onScanQR}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-medium flex items-center justify-center space-x-3 transition-all duration-300"
            >
              <FaQrcode />
              <span>Quick Connect via QR</span>
            </button>
             */}
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700/50 rounded-xl font-medium flex items-center justify-center space-x-3 transition-all duration-300"
            >
              <FaArrowLeft />
              <span>Cancel & Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 border-t border-gray-800/30 bg-gradient-to-t from-gray-900/80 to-transparent backdrop-blur-xl z-20 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-300">Active Search</span>
            </div>
            <div className="flex items-center space-x-2">
              <RiEarthFill className="text-blue-400" />
              <span className="text-gray-400">Global Network</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <FaSync className="text-purple-400 animate-spin" />
              <span className="text-gray-400">Real-time Scanning</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRocket className="text-pink-400" />
              <span className="text-gray-300">Turbo Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchingScreen;