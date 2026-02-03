// src/components/LoadingScreen.jsx
import React from 'react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-white">Loading Chat...</h2>
            <p className="text-gray-400 mt-2">Connecting you to amazing conversations</p>
          </div>
        </div>
        <div className="mt-8 space-y-2 max-w-md mx-auto">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse w-3/4"></div>
          </div>
          <p className="text-sm text-gray-500">Optimizing for fastest experience...</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;