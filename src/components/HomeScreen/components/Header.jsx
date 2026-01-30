import React from 'react';
import { FaBars, FaShieldAlt, FaEdit, FaSave, FaCheckCircle } from 'react-icons/fa';

const Header = ({
  userProfile,
  ageVerified,
  termsAccepted,
  setShowMobileMenu,
  setShowSafetyTips,
  onUpdateProfile
}) => {
  return (
    <header className="px-4 md:px-6 py-4 border-b border-gray-800/50 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-30">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden text-white"
          >
            <FaBars size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Omegle Pro
          </h1>
          {userProfile && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs">
                  {userProfile.username?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium truncate max-w-[100px]">{userProfile.username}</div>
                <div className="text-xs text-gray-400 flex items-center">
                  <span>Age {userProfile.age}</span>
                  {ageVerified && (
                    <FaCheckCircle className="ml-2 text-green-400" size={10} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {ageVerified && termsAccepted && (
              <span className="text-green-400 text-sm flex items-center">
                <FaSave className="mr-1" /> All saved
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSafetyTips(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
          >
            <FaShieldAlt />
            <span>Safety Tips</span>
          </button>
          {userProfile && (
            <button 
              onClick={onUpdateProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;