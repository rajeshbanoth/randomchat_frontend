// src/components/SearchingScreen.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, 
  FaSearch,
  FaUsers,
  FaSignal,
  FaGlobe,
  FaPause,
  FaPlay,
  FaCog,
  FaSpinner
} from 'react-icons/fa';

const SearchingScreen = ({ mode, searchTime, onBack }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState(0);

  // Simulate matched users count
  useEffect(() => {
    const userInterval = setInterval(() => {
      if (!isPaused) {
        setMatchedUsers(prev => prev + Math.floor(Math.random() * 2));
      }
    }, 2000);
    return () => clearInterval(userInterval);
  }, [isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Animated Circle */}
          <div className="relative mb-12">
            <div className="relative w-48 h-48 mx-auto">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-slate-700">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-pulse" />
              </div>
              
              {/* Middle Ring */}
              <div className="absolute inset-8 rounded-full border border-slate-600/50">
                <div className={`absolute inset-0 rounded-full ${
                  mode === 'video' 
                    ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20'
                    : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
                }`} />
              </div>
              
              {/* Center Circle */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <FaSearch className="text-white text-xl" />
                  </div>
                  <div className="absolute -inset-4 rounded-full border border-blue-500/20 animate-ping" />
                </div>
              </div>
              
              {/* Scanning Line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Searching for {mode === 'video' ? 'Video' : 'Chat'} Partner
          </h1>
          
          {/* Status */}
          <p className="text-slate-400 mb-8">
            Looking for someone to connect with...
          </p>

          {/* Timer */}
          <div className="mb-10">
            <div className="text-5xl font-bold text-white mb-2">
              {formatTime(searchTime)}
            </div>
            <div className="text-sm text-slate-400">
              Time searching
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <FaUsers className="text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{matchedUsers}</div>
              <div className="text-xs text-slate-400">Users found</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <FaSignal className="text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">Good</div>
              <div className="text-xs text-slate-400">Signal</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2">
                <FaGlobe className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">24</div>
              <div className="text-xs text-slate-400">Countries</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={togglePause}
              className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all ${
                isPaused
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              }`}
            >
              {isPaused ? (
                <>
                  <FaPlay />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <FaPause />
                  <span>Pause</span>
                </>
              )}
            </button>
            
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-600 transition-all"
            >
              Cancel
            </button>
          </div>

          {/* Tip */}
          <div className="mt-10 text-sm text-slate-500">
            <div className="flex items-center justify-center space-x-2">
              <FaSpinner className="animate-spin" />
              <span>Finding the perfect match...</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">Live connection active</span>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%) rotate(0deg); }
          100% { transform: translateX(100%) rotate(0deg); }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SearchingScreen;