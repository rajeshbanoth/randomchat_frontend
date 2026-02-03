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
  FaCog,
  FaUserFriends,
  FaRandom,
  FaWaveSquare,
  FaSignal
} from 'react-icons/fa';
import { RiEarthFill } from 'react-icons/ri';
import { formatSearchTime } from '../utils/helpers';

const SearchingScreen = ({ mode, searchTime, onBack, onScanQR }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [searchTips, setSearchTips] = useState([
    "Connecting with people who share your interests...",
    "Scanning global network for the perfect match...",
    "Finding someone nearby who's ready to chat...",
    "Matching you with compatible conversation partners...",
    "Analyzing conversation styles and preferences...",
    "Discovering interesting people from around the world..."
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [matchedUsers, setMatchedUsers] = useState(0);
  const [searchRadius, setSearchRadius] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [signalStrength, setSignalStrength] = useState(75);
  const [connectionSpeed, setConnectionSpeed] = useState(450);

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

  // Simulate signal and connection
  useEffect(() => {
    const signalInterval = setInterval(() => {
      if (!isPaused) {
        setSignalStrength(prev => {
          const change = Math.random() * 10 - 5;
          return Math.max(30, Math.min(100, prev + change));
        });
        setConnectionSpeed(prev => {
          const change = Math.random() * 50 - 25;
          return Math.max(200, Math.min(1000, prev + change));
        });
      }
    }, 2000);
    return () => clearInterval(signalInterval);
  }, [isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-black overflow-hidden relative">
      {/* Futuristic Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="url(#grid-gradient)" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Floating Connection Nodes */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-float opacity-50"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              boxShadow: '0 0 20px 2px rgba(99, 102, 241, 0.5)'
            }}
          />
        ))}
        
        {/* Animated Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M 10% 50% Q 35% 20%, 50% 50% T 90% 50%"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="1"
            strokeDasharray="5,5"
            className="animate-dash"
          />
        </svg>

        {/* Pulsing Radar Effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 rounded-full border border-blue-500/20 animate-ping opacity-10"></div>
          <div className="w-80 h-80 rounded-full border border-purple-500/20 animate-ping opacity-10" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      {/* Glassmorphism Header */}
      <div className="px-6 py-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between backdrop-blur-xl bg-gray-900/40 rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
            <button
              onClick={onBack}
              className="group flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-gray-800/60 to-gray-900/60 hover:from-gray-700/60 hover:to-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/30"
            >
              <div className="relative">
                <FaArrowLeft className="text-gray-300 group-hover:text-white transition-colors group-hover:-translate-x-1 transition-transform" />
                <div className="absolute -inset-1 bg-blue-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </div>
              <span className="text-gray-200 font-medium group-hover:text-white transition-colors">Cancel Search</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-800/40 px-4 py-2 rounded-xl border border-gray-700/50">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                <span className="text-sm text-gray-300 font-medium">
                  {isPaused ? 'Paused' : 'Searching'}
                </span>
              </div>
              
              <button
                onClick={togglePause}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-blue-800/40 hover:from-blue-800/40 hover:to-blue-700/40 backdrop-blur-sm border border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/30 group"
                title={isPaused ? "Resume Search" : "Pause Search"}
              >
                {isPaused ? (
                  <FaPlay className="text-green-400 group-hover:text-green-300 transition-colors" />
                ) : (
                  <FaPause className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                )}
              </button>
              
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-purple-800/40 hover:from-purple-800/40 hover:to-purple-700/40 backdrop-blur-sm border border-purple-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/30 group relative"
                title="Advanced Options"
              >
                <FaCog className={`text-purple-400 group-hover:text-purple-300 transition-colors ${showAdvanced ? 'animate-spin' : ''}`} />
                {showAdvanced && (
                  <div className="absolute -inset-1 bg-purple-500/20 blur-sm rounded-xl"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-5xl w-full">
          {/* Central Search Visualization */}
          <div className="relative mb-16">
            <div className="relative h-80 flex items-center justify-center">
              {/* Outer Orbital Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-spin-slow"></div>
                <div className="absolute w-[500px] h-[500px] border border-purple-500/10 rounded-full animate-spin-slow" style={{animationDirection: 'reverse'}}></div>
                
                {/* Orbiting Users */}
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute animate-orbit-fast"
                    style={{
                      animationDelay: `${i * 0.4}s`,
                      transformOrigin: 'center',
                      top: '50%',
                      left: '50%',
                      marginTop: '-300px',
                      marginLeft: '-20px'
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <FaUserFriends className="text-white text-sm" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Central Hub */}
              <div className="relative z-20">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-full"></div>
                  
                  {/* Main Circle */}
                  <div className={`relative w-64 h-64 rounded-full flex items-center justify-center backdrop-blur-sm border-2 ${
                    mode === 'video' 
                      ? 'bg-gradient-to-br from-red-900/30 via-pink-900/30 to-rose-900/30 border-red-500/40'
                      : 'bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-indigo-900/30 border-blue-500/40'
                  } shadow-2xl`}>
                    {/* Inner Circle */}
                    <div className={`w-48 h-48 rounded-full flex items-center justify-center ${
                      mode === 'video'
                        ? 'bg-gradient-to-br from-red-600 to-pink-600 shadow-2xl shadow-red-500/40'
                        : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/40'
                    }`}>
                      <div className="relative">
                        {mode === 'video' ? (
                          <FaVideo className="text-5xl text-white animate-pulse" />
                        ) : (
                          <FaComments className="text-5xl text-white animate-pulse" />
                        )}
                        {/* Scanning Lines */}
                        <div className="absolute -inset-10 border-2 border-white/10 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    
                    {/* Pulsing Rings */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400/50 animate-spin"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-purple-400/50 animate-spin" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  
                  {/* Connection Points */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse shadow-lg shadow-cyan-500/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Information */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Searching for {mode === 'video' ? 'Video' : 'Text'} Connection
            </h1>
            
            {/* Animated Search Tip */}
            <div className="h-16 mb-6 flex items-center justify-center">
              <div className="relative max-w-2xl mx-auto">
                <div className="text-xl text-gray-300 font-medium animate-fade-in-out px-8 py-4 bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-center space-x-3">
                    <FaSearch className="text-blue-400 animate-pulse" />
                    <span>{searchTips[currentTipIndex]}</span>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-sm opacity-50 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Connection Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* Search Time */}
            <div className="group p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-800/50">
                    <FaSync className="text-blue-400 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Search Time</div>
                    <div className="text-2xl font-bold text-white">{formatSearchTime(searchTime)}</div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 group-hover:shadow-lg group-hover:shadow-blue-500/30"
                  style={{ width: `${(searchTime % 60) / 60 * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Users Scanned */}
            <div className="group p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/50 to-purple-800/50">
                    <FaUsers className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Users Scanned</div>
                    <div className="text-2xl font-bold text-white">{matchedUsers}</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">Active in your region</div>
            </div>
            
            {/* Signal Strength */}
            <div className="group p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-900/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-900/50 to-emerald-800/50">
                    <FaSignal className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Signal Strength</div>
                    <div className="text-2xl font-bold text-white">{signalStrength}%</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      i < Math.floor(signalStrength / 20)
                        ? 'bg-gradient-to-b from-green-500 to-emerald-500'
                        : 'bg-gray-700'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Connection Speed */}
            <div className="group p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-900/50 to-blue-800/50">
                    <FaRocket className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Speed</div>
                    <div className="text-2xl font-bold text-white">{connectionSpeed}ms</div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(1000 - connectionSpeed) / 8}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Advanced Options Panel */}
          {showAdvanced && (
            <div className="mb-10 animate-slide-down">
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-2xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                    <FaCog className="text-purple-400 animate-spin-slow" />
                    <span>Advanced Connection Settings</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Search Radius</label>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>Local</span>
                          <span>Global</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Match Priority</label>
                        <select className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50">
                          <option>Highest Compatibility</option>
                          <option>Location Based</option>
                          <option>Interests Match</option>
                          <option>Random Discovery</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Connection Type</label>
                        <div className="flex space-x-3">
                          <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-600/50 rounded-lg text-blue-300 hover:text-white hover:border-blue-500 transition-all">
                            Stable
                          </button>
                          <button className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-900/40 to-purple-800/40 border border-purple-600/50 rounded-lg text-purple-300 hover:text-white hover:border-purple-500 transition-all">
                            Fast
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBack}
              className="group px-10 py-5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700/50 rounded-xl font-medium flex items-center justify-center space-x-4 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FaArrowLeft className="relative z-10" />
              <span className="relative z-10">Cancel & Exit Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-6 py-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-xl bg-gray-900/40 rounded-2xl p-5 border border-gray-700/50 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
                    <div className="absolute -inset-2 bg-green-500/20 blur-sm rounded-full"></div>
                  </div>
                  <span className="text-gray-300 font-medium">Live Search Active</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RiEarthFill className="text-blue-400 animate-pulse" />
                  <span className="text-gray-400">Global Network</span>
                  <span className="text-blue-400 font-bold">•</span>
                  <span className="text-gray-300">24 Countries</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <FaRandom className="text-purple-400 animate-spin" />
                  <span className="text-gray-400">Real-time Matching</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FaRocket className="text-pink-400 animate-bounce" />
                    <div className="absolute -inset-2 bg-pink-500/10 blur-sm rounded-full"></div>
                  </div>
                  <span className="text-gray-300 font-medium">Turbo Mode</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-pink-900/40 to-pink-800/40 rounded-lg text-xs text-pink-300">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit-fast {
          from { transform: rotate(0deg) translateX(300px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(300px) rotate(-360deg); }
        }
        
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.5; transform: translateY(10px); }
          50% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        
        .animate-orbit-fast {
          animation: orbit-fast 8s linear infinite;
        }
        
        .animate-dash {
          animation: dash 20s linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out infinite;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SearchingScreen;