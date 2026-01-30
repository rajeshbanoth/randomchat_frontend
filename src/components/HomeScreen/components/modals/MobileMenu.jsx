import React from 'react';
import { FaTimes, FaShieldAlt, FaEdit, FaLock, FaSave } from 'react-icons/fa';

const MobileMenu = ({
  userProfile,
  ageVerified,
  setShowMobileMenu,
  setShowSafetyTips,
  setShowAgeVerification,
  onUpdateProfile,
  handleExportData,
  handleClearAllData
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-40 md:hidden overflow-y-auto">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMobileMenu(false)}
          className="text-white text-2xl"
        >
          <FaTimes />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-full p-8 space-y-6">
        {userProfile && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-2xl">
              {userProfile.username?.charAt(0) || 'U'}
            </div>
            <h3 className="text-xl font-bold text-white">{userProfile.username}</h3>
            <p className="text-gray-400">Age {userProfile.age}</p>
            {ageVerified && (
              <p className="text-green-400 text-sm mt-2">✓ Age verified</p>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setShowSafetyTips(true);
            setShowMobileMenu(false);
          }}
          className="text-lg text-white flex items-center space-x-2"
        >
          <FaShieldAlt />
          <span>Safety Tips</span>
        </button>
        {userProfile && (
          <button 
            onClick={() => {
              onUpdateProfile();
              setShowMobileMenu(false);
            }}
            className="text-lg text-white flex items-center space-x-2"
          >
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        )}
        {!ageVerified && (
          <button
            onClick={() => {
              setShowAgeVerification(true);
              setShowMobileMenu(false);
            }}
            className="text-lg text-blue-400 flex items-center space-x-2"
          >
            <FaLock />
            <span>Verify Age</span>
          </button>
        )}
        <button
          onClick={handleExportData}
          className="text-lg text-blue-400 flex items-center space-x-2"
        >
          <FaSave />
          <span>Export Data</span>
        </button>
        <button
          onClick={handleClearAllData}
          className="text-lg text-red-400 flex items-center space-x-2"
        >
          <FaTimes />
          <span>Clear Data</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;