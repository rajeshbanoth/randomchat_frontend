import React from 'react';
import { FaUser, FaEdit, FaCheckCircle } from 'react-icons/fa';

const ProfileSection = ({
  userProfile,
  ageVerified,
  onUpdateProfile,
  setShowAgeVerification
}) => {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-700 overflow-hidden">
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt={userProfile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <FaUser className="text-2xl text-white" />
                  </div>
                )}
              </div>
              {ageVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <FaCheckCircle size={12} />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">{userProfile.username}</h3>
                {ageVerified && (
                  <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    18+ VERIFIED
                  </span>
                )}
              </div>
              <p className="text-gray-400">
                Age {userProfile.age} • {userProfile.gender !== 'not-specified' ? userProfile.gender : 'Not specified'}
              </p>
              {userProfile.bio && (
                <p className="text-gray-300 mt-2">{userProfile.bio}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
            {!ageVerified && (
              <button
                onClick={() => setShowAgeVerification(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90"
              >
                Verify Age
              </button>
            )}
            <button
              onClick={onUpdateProfile}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;