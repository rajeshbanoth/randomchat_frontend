import React from 'react';
import { FaBars, FaShieldAlt, FaEdit, FaSave, FaCheckCircle, FaInfoCircle, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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
            className="md:hidden text-white hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
            aria-label="Open menu"
          >
            <FaBars size={20} />
          </button>
          
          {/* Home Button with Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              <FaHome size={18} className="text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
              Omegle Pro
            </h1>
          </Link>
          
          {userProfile && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full hover:bg-gray-800 transition-colors cursor-pointer group" onClick={onUpdateProfile}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {ageVerified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <FaCheckCircle size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium truncate max-w-[100px] text-white group-hover:text-blue-300 transition-colors">
                  {userProfile.username || 'User'}
                </div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                  Age {userProfile.age || '18'}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {ageVerified && termsAccepted && (
              <div className="flex items-center px-3 py-1.5 bg-green-900/30 rounded-lg border border-green-500/30">
                <FaSave className="mr-2 text-green-400" />
                <span className="text-green-300 text-sm">All saved</span>
              </div>
            )}
          </div>
          
          {/* About Us Button */}
          <Link to="/aboutus">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-105 group">
              <FaInfoCircle className="text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-white group-hover:text-blue-300 transition-colors">About Us</span>
            </button>
          </Link>
          
          {/* Safety Tips Button */}
          <button
            onClick={() => setShowSafetyTips(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-300 hover:scale-105 group"
          >
            <FaShieldAlt className="text-blue-400 group-hover:text-blue-300 transition-colors" />
            <span className="text-white group-hover:text-blue-300 transition-colors">Safety Tips</span>
          </button>
          
          {/* Edit Profile Button */}
          {userProfile && (
            <button 
              onClick={onUpdateProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-800 hover:to-gray-900 rounded-lg transition-all duration-300 hover:scale-105 group"
            >
              <FaEdit className="text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="text-white group-hover:text-purple-300 transition-colors">Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;