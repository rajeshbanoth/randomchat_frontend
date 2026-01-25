// src/components/UserProfileScreen.jsx
import React, { useState } from 'react';
import { FaUser, FaCrown, FaStar, FaComments, FaVideo } from 'react-icons/fa';

const UserProfileScreen = ({ userProfile, onSave, onCancel }) => {
  const [profileData, setProfileData] = useState({
    username: userProfile?.username || '',
    gender: userProfile?.gender || 'not-specified',
    age: userProfile?.age || 25,
    interests: userProfile?.interests || [],
    chatMode: userProfile?.chatMode || 'text',
    genderPreference: userProfile?.genderPreference || 'any',
    ageRange: userProfile?.ageRange || { min: 18, max: 60 },
    isPremium: userProfile?.isPremium || false,
    avatar: userProfile?.avatar || null,
    bio: userProfile?.bio || ''
  });

  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonInterests = [
    'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
    'Travel', 'Food', 'Art', 'Books', 'Fitness',
    'Science', 'Fashion', 'Photography', 'Animals', 'Cooking'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!profileData.username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim()) && profileData.interests.length < 10) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          avatar: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {userProfile ? 'Edit Profile' : 'Create Profile'}
            </h1>
            <p className="text-gray-400">Customize your chatting experience</p>
          </div>
          
          {userProfile && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-700 overflow-hidden mb-4">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <FaUser className="text-4xl text-white" />
                      </div>
                    )}
                  </div>
                  
                  <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    Upload Photo
                  </label>
                </div>
              </div>
              
              {/* Username and Age */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username *</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Age</label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profileData.age}
                      onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || 25})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="not-specified">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Tell others about yourself..."
                maxLength="200"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {profileData.bio.length}/200 characters
              </div>
            </div>
          </div>

          {/* Chat Preferences */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Chat Preferences</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chat Mode */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preferred Chat Mode</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="chatMode"
                      value="text"
                      checked={profileData.chatMode === 'text'}
                      onChange={(e) => setProfileData({...profileData, chatMode: e.target.value})}
                      className="text-blue-500"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FaComments />
                      </div>
                      <div>
                        <div className="font-medium">Text Chat</div>
                        <div className="text-sm text-gray-400">Text messages only</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="chatMode"
                      value="video"
                      checked={profileData.chatMode === 'video'}
                      onChange={(e) => setProfileData({...profileData, chatMode: e.target.value})}
                      className="text-red-500"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                        <FaVideo />
                      </div>
                      <div>
                        <div className="font-medium">Video Chat</div>
                        <div className="text-sm text-gray-400">Video + Text messages</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Preferences */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gender Preference</label>
                  <select
                    value={profileData.genderPreference}
                    onChange={(e) => setProfileData({...profileData, genderPreference: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="any">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age Range</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profileData.ageRange.min}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        ageRange: { ...profileData.ageRange, min: parseInt(e.target.value) || 18 }
                      })}
                      className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profileData.ageRange.max}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        ageRange: { ...profileData.ageRange, max: parseInt(e.target.value) || 60 }
                      })}
                      className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Interests</h2>
            <p className="text-gray-400 mb-4">Add interests to find better matches</p>
            
            {/* Interest Input */}
            <div className="flex space-x-3 mb-6">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="Add custom interest..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                disabled={!newInterest.trim() || profileData.interests.length >= 10}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            {/* Common Interests */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Popular Interests</h4>
              <div className="flex flex-wrap gap-2">
                {commonInterests.map(interest => (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => {
                      if (!profileData.interests.includes(interest) && profileData.interests.length < 10) {
                        setProfileData({
                          ...profileData,
                          interests: [...profileData.interests, interest]
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      profileData.interests.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected Interests */}
            {profileData.interests.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-400">Selected Interests ({profileData.interests.length}/10)</h4>
                  <button
                    type="button"
                    onClick={() => setProfileData({...profileData, interests: []})}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map(interest => (
                    <span 
                      key={interest} 
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                      <button 
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <FaCrown />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Premium Features</h2>
                <p className="text-gray-400 mb-4">Get priority matching and exclusive features</p>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={profileData.isPremium}
                      onChange={(e) => setProfileData({...profileData, isPremium: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${
                      profileData.isPremium ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-600'
                    }`}></div>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      profileData.isPremium ? 'transform translate-x-5' : ''
                    }`}></div>
                  </div>
                  <span className="font-medium">Enable Premium (Demo)</span>
                </label>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>Priority matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>Advanced filters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>No ads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>Profile highlighting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !profileData.username.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : userProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileScreen;