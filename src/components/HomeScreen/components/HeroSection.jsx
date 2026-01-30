import React from 'react';
import { FaUsers } from 'react-icons/fa';

const HeroSection = ({ onlineCount }) => {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Connect with the World
        </span>
      </h1>
      <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
        Anonymous video and text chat with people who share your interests
      </p>
      
      <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full mb-8 md:mb-12">
        <FaUsers className="text-blue-400 mr-2" />
        <span className="text-lg font-medium">{onlineCount.toLocaleString()}</span>
        <span className="text-gray-400 ml-2">people online now</span>
      </div>
    </div>
  );
};

export default HeroSection;