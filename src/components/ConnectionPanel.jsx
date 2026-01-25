// components/ConnectionPanel.jsx
import React, { useState } from 'react'
import { FaSearch, FaUsers, FaHeart, FaRobot, FaRandom, FaVideo, FaVideoSlash, FaShieldAlt } from 'react-icons/fa'

const ConnectionPanel = ({ userProfile, onSearch, onlineCount, chatMode, onToggleChatMode, connected }) => {
  const [interests, setInterests] = useState(userProfile?.interests || [])
  const [searchType, setSearchType] = useState('random')
  const [ageRange, setAgeRange] = useState(userProfile?.ageRange || { min: 18, max: 60 })

  const commonInterests = [
    'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
    'Travel', 'Food', 'Art', 'Books', 'Fitness',
    'Science', 'Fashion', 'Photography', 'Animals', 'Cooking'
  ]

  const addInterest = (interest) => {
    if (!interests.includes(interest) && interests.length < 10) {
      setInterests([...interests, interest])
    }
  }

  const removeInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest))
  }

  const handleQuickStart = () => {
    if (!userProfile) {
      onSearch({})
    } else {
      onSearch({
        chatMode,
        interests: searchType === 'interest' ? interests : [],
        priority: 'quick'
      })
    }
  }

  const handleSmartMatch = () => {
    onSearch({
      chatMode,
      interests,
      priority: 'quality',
      matchType: 'smart'
    })
  }

  const handleInterestMatch = () => {
    setSearchType('interest')
    onSearch({
      chatMode,
      interests,
      priority: 'interests'
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Start */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Start Chatting
                </h1>
                <p className="text-gray-400 mt-2">Connect with strangers who share your interests</p>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full">
                <FaUsers className="text-blue-400" />
                <span className="font-bold">{onlineCount}</span>
                <span className="text-gray-400">online now</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100K+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">85%</div>
                <div className="text-sm text-gray-400">Match Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">&lt;10s</div>
                <div className="text-sm text-gray-400">Avg. Connect Time</div>
              </div>
            </div>
          </div>

          {/* Quick Options */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Quick Start</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button 
                onClick={() => {
                  setSearchType('random')
                  handleQuickStart()
                }}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <FaRandom />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Random Chat</h3>
                <p className="text-gray-400">Talk to anyone instantly</p>
                <div className="mt-4 flex items-center text-sm text-blue-400">
                  <span>Fast • No filters</span>
                </div>
              </button>
              
              <button 
                onClick={handleInterestMatch}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <FaHeart />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Interest Match</h3>
                <p className="text-gray-400">Connect through common interests</p>
                <div className="mt-4 flex items-center text-sm text-purple-400">
                  <span>Better matches • Shared topics</span>
                </div>
              </button>
              
              <button 
                onClick={handleSmartMatch}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <FaRobot />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Match</h3>
                <p className="text-gray-400">AI-powered compatibility matching</p>
                <div className="mt-4 flex items-center text-sm text-green-400">
                  <span>AI • Best compatibility</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Chat Mode</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => onToggleChatMode()}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  chatMode === 'text'
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    chatMode === 'text' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                      : 'bg-gray-700'
                  }`}>
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-white">Text Chat</h4>
                    <p className="text-sm text-gray-400">Text messages only</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => onToggleChatMode()}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  chatMode === 'video'
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    chatMode === 'video' 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                      : 'bg-gray-700'
                  }`}>
                    <span className="text-2xl">📹</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-white">Video Chat</h4>
                    <p className="text-sm text-gray-400">Video + Text messages</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Interests */}
        <div className="space-y-8">
          {/* Interests Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Your Interests</h3>
            <p className="text-gray-400 mb-4">Select interests to find better matches</p>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              {commonInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => {
                    if (interests.includes(interest)) {
                      removeInterest(interest)
                    } else {
                      addInterest(interest)
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    interests.includes(interest)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            
            {interests.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Selected ({interests.length}/10)</h4>
                  <button 
                    onClick={() => setInterests([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <span 
                      key={interest} 
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                      <button 
                        onClick={() => removeInterest(interest)}
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

          {/* Age Range */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Age Preference</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Min Age</label>
                  <input
                    type="range"
                    min="13"
                    max="100"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange({...ageRange, min: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center mt-2">
                    <span className="text-lg font-bold text-white">{ageRange.min}</span>
                    <span className="text-gray-400 text-sm ml-1">years</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Max Age</label>
                  <input
                    type="range"
                    min="13"
                    max="100"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange({...ageRange, max: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center mt-2">
                    <span className="text-lg font-bold text-white">{ageRange.max}</span>
                    <span className="text-gray-400 text-sm ml-1">years</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-400">
                {ageRange.min === ageRange.max 
                  ? `Show only ${ageRange.min} year olds`
                  : `Show ages ${ageRange.min} to ${ageRange.max}`
                }
              </div>
            </div>
          </div>

          {/* Safety Notice */}
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
                </ul>
              </div>
            </div>
          </div>

          {/* Start Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleSmartMatch}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-200 flex items-center justify-center"
              disabled={!connected}
            >
              <FaRobot className="mr-2" /> Start Smart Chat
            </button>
            <button 
              onClick={handleQuickStart}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-200"
              disabled={!connected}
            >
              Quick Random Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionPanel