// components/HomeScreen.jsx - Updated with complete profile display
import React, { useState } from 'react';
import { 
  FaUser, FaComments, FaVideo, FaUsers, 
  FaHeart, FaPlus, FaTimes, FaArrowRight,
  FaCrown, FaStar, FaEdit, FaShieldAlt,
  FaRandom, FaRobot
} from 'react-icons/fa';

const HomeScreen = ({ 
  userProfile, 
  onlineCount, 
  interests, 
  onUpdateInterests,
  onUpdateProfile,
  onStartTextChat,
  onStartVideoChat,
  connected,
  currentMode
}) => {
  const [newInterest, setNewInterest] = useState('');

  const commonInterests = [
    'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
    'Travel', 'Food', 'Art', 'Books', 'Fitness',
    'Science', 'Fashion', 'Photography', 'Animals'
  ];

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
      onUpdateInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    onUpdateInterests(interests.filter(i => i !== interest));
  };

  const handleAddCommonInterest = (interest) => {
    if (!interests.includes(interest) && interests.length < 10) {
      onUpdateInterests([...interests, interest]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omegle PRO
            </h1>
            {userProfile && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs">
                    {userProfile.username?.charAt(0) || 'U'}
                  </div>
                  {userProfile.isPremium && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <FaCrown size={8} />
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{userProfile.username}</div>
                  <div className="text-xs text-gray-400">
                    {userProfile.age} • {userProfile.gender !== 'not-specified' ? userProfile.gender : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {userProfile && (
              <button 
                onClick={onUpdateProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaEdit />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect Instantly
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Anonymous video and text chat with people who share your interests
          </p>
          
          <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full mb-12">
            <FaUsers className="text-blue-400 mr-2" />
            <span className="text-lg font-medium">{onlineCount.toLocaleString()}</span>
            <span className="text-gray-400 ml-2">people online now</span>
          </div>
        </div>

        {/* Chat Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Text Chat Card */}
          <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
                <FaComments />
              </div>
            </div>
            
            <div className="text-center pt-4">
              <h3 className="text-2xl font-bold mb-4">Text Chat</h3>
              <p className="text-gray-400 mb-6">
                Connect instantly with random people through text messages
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={onStartTextChat}
                  disabled={!connected || !userProfile}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${
                    connected && userProfile
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaRandom className="mr-2" />
                  Start Random Chat
                </button>
                
                <button
                  onClick={onStartTextChat}
                  disabled={!connected || !userProfile}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                    connected && userProfile
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaRobot className="mr-2" />
                  Smart Match
                </button>
              </div>
            </div>
          </div>

          {/* Video Chat Card */}
          <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-red-500 transition-all duration-300">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xl">
                <FaVideo />
              </div>
            </div>
            
            <div className="text-center pt-4">
              <h3 className="text-2xl font-bold mb-4">Video Chat</h3>
              <p className="text-gray-400 mb-6">
                Face-to-face video calls with random people
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={onStartVideoChat}
                  disabled={!connected || !userProfile}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${
                    connected && userProfile
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaRandom className="mr-2" />
                  Start Video Chat
                </button>
                
                <button
                  onClick={onStartVideoChat}
                  disabled={!connected || !userProfile}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                    connected && userProfile
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaHeart className="mr-2" />
                  Interest Match
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        {userProfile && (
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
                    {userProfile.isPremium && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                        <FaCrown size={12} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-2xl font-bold">{userProfile.username}</h3>
                      {userProfile.isPremium && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">
                      {userProfile.age} years • {userProfile.gender !== 'not-specified' ? userProfile.gender : 'Not specified'} • {userProfile.chatMode === 'video' ? 'Video Chat' : 'Text Chat'}
                    </p>
                    {userProfile.bio && (
                      <p className="text-gray-300 mt-2">{userProfile.bio}</p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={onUpdateProfile}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              </div>
              
              {/* User Preferences */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Gender Preference</div>
                  <div className="font-medium capitalize">{userProfile.genderPreference || 'any'}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Age Range</div>
                  <div className="font-medium">{userProfile.ageRange?.min || 18} - {userProfile.ageRange?.max || 60}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Chat Mode</div>
                  <div className="font-medium flex items-center">
                    {userProfile.chatMode === 'video' ? (
                      <>
                        <span className="text-red-400 mr-2">📹</span> Video
                      </>
                    ) : (
                      <>
                        <span className="text-blue-400 mr-2">💬</span> Text
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Priority</div>
                  <div className="font-medium flex items-center">
                    {userProfile.isPremium ? (
                      <>
                        <FaStar className="text-yellow-400 mr-2" />
                        High Priority
                      </>
                    ) : (
                      'Standard'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interests Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Your Interests</h3>
                <p className="text-gray-400">
                  Add interests to find better matches (optional)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FaHeart className="text-red-400" />
                <span className="text-sm text-gray-400">{interests.length}/10</span>
              </div>
            </div>

            {/* Interest Input */}
            <div className="flex space-x-3 mb-6">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder="Add custom interest..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddInterest}
                disabled={!newInterest.trim() || interests.length >= 10}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus />
              </button>
            </div>

            {/* Common Interests */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Popular Interests</h4>
              <div className="flex flex-wrap gap-2">
                {commonInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleAddCommonInterest(interest)}
                    disabled={interests.includes(interest) || interests.length >= 10}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                      interests.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Interests */}
            {interests.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Selected Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <span 
                      key={interest} 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                      <button 
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 hover:text-white"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-start space-x-3">
              <FaShieldAlt className="text-yellow-400 text-xl mt-1" />
              <div>
                <h4 className="font-bold text-yellow-400 mb-2">Safety Guidelines</h4>
                <ul className="space-y-2 text-sm text-yellow-300/80">
                  <li>• Never share personal information</li>
                  <li>• Avoid sharing passwords or financial details</li>
                  <li>• Report inappropriate behavior immediately</li>
                  <li>• Be respectful to other users</li>
                  <li>• All conversations are anonymous and encrypted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;