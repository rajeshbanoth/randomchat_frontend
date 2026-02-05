import React from 'react';
import { FaArrowLeft, FaCog, FaVideo, FaSpinner } from 'react-icons/fa';

const SearchingScreen = ({
  activeTheme = 'from-gray-900 to-black',
  setCurrentScreen,
  showSettings,
  setShowSettings
}) => {
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${activeTheme} transition-all duration-500 overflow-hidden`}>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full animate-pulse-slow delay-1500"></div>
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-transparent"></div>
      </div>
      
      {/* Header - Fixed at top */}
      <div className="relative px-4 py-4 sm:px-6 border-b border-gray-800/50 bg-gray-900/40 backdrop-blur-xl z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="group flex items-center space-x-2 sm:space-x-3 text-gray-300 hover:text-white transition-all duration-300 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl hover:bg-gray-800/60 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300 text-base sm:text-lg" />
            <span className="font-medium text-sm sm:text-base">Back to Home</span>
          </button>
          
          {/* Searching Status Badge */}
          <div className="flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            </div>
            <span className="text-sm sm:text-base font-medium bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Searching...
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content - Centered with proper spacing */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div className="w-full max-w-lg text-center px-4">
          {/* Animated Video Icon Container */}
          <div className="relative mb-8 sm:mb-12 md:mb-16">
            {/* Outer glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse-glow"></div>
            </div>
            
            {/* Middle ring */}
            <div className="absolute inset-4 sm:ins-6 md:inset-8 flex items-center justify-center">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full border-2 border-blue-400/30 animate-spin-slow"></div>
            </div>
            
            {/* Main icon */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float">
              <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
              <FaVideo className="relative text-white text-4xl sm:text-5xl md:text-6xl animate-pulse-subtle" />
            </div>
            
            {/* Floating dots animation */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-1/2 -left-3 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-500"></div>
          </div>
          
          {/* Title with gradient text */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
              Looking for Video Partner
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 md:mb-12 max-w-md mx-auto leading-relaxed">
            We're searching for someone who wants to have a meaningful video conversation
          </p>
          
          {/* Connection progress indicator */}
          <div className="max-w-xs sm:max-w-sm mx-auto mb-8 sm:mb-10">
            <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Connecting...</span>
              <span className="animate-pulse">Searching network</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-sm mx-auto">
            <button
              onClick={() => setCurrentScreen('home')}
              className="flex-1 group px-6 py-3.5 sm:py-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gray-900/30"
            >
              <div className="flex items-center justify-center space-x-2">
                <FaArrowLeft className="text-gray-400 group-hover:text-white transition-colors duration-300 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                  Cancel Search
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex-1 group px-6 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-900/20"
            >
              <div className="flex items-center justify-center space-x-2">
                <FaCog className="text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300 group-hover:rotate-180 transition-transform" />
                <span className="font-medium text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300">
                  Settings
                </span>
              </div>
            </button>
          </div>
          
          {/* Tips/Hints */}
          <div className="mt-8 sm:mt-10 md:mt-12">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-400 bg-gray-900/30 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/30">
              <FaSpinner className="animate-spin" />
              <span>Tip: This usually takes 10-30 seconds</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Particles for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float-particle`}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + i * 5}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={i + 8}
            className={`absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float-particle`}
            style={{
              right: `${20 + i * 10}%`,
              bottom: `${30 + i * 5}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + i * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Add CSS animations
const styles = `
@keyframes pulse-glow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.05); }
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(0.98); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

@keyframes float-particle {
  0%, 100% { 
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10%, 90% { opacity: 0.3; }
  50% { 
    transform: translateY(-20px) translateX(10px);
    opacity: 0.5;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-gradient-x {
  background-size: 200% auto;
  animation: gradient-x 3s ease infinite;
}

.animate-progress {
  animation: progress 2s ease-in-out infinite;
  width: 0%;
}

.animate-float-particle {
  animation-timing-function: ease-in-out;
}
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SearchingScreen;