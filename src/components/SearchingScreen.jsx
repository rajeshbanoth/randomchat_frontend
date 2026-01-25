// src/components/SearchingScreen.jsx
import React from 'react';
import { FaArrowLeft, FaQrcode, FaVideo, FaComments, FaGlobe, FaSearch } from 'react-icons/fa';
import { formatSearchTime } from '../utils/helpers';

const SearchingScreen = ({ mode, searchTime, onBack, onScanQR }) => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <div className="px-6 py-4 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            <span>Cancel Search</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onScanQR}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaQrcode />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="absolute inset-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
            </div>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl relative ${
              mode === 'video' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              {mode === 'video' ? <FaVideo className="animate-pulse" /> : <FaComments className="animate-pulse" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            Looking for {mode === 'video' ? 'Video' : 'Text'} Partner...
          </h2>
          
          <div className="mb-8">
            <div className="text-4xl font-bold mb-2">{formatSearchTime(searchTime)}</div>
            <p className="text-gray-400">Searching time</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <FaGlobe className="text-green-400" />
              <span>Searching globally for matching profiles</span>
            </div>
            
            <button
              onClick={onScanQR}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center"
            >
              <FaQrcode className="mr-2" /> Scan QR Code
            </button>
            
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchingScreen;