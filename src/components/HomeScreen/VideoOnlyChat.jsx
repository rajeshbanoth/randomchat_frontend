// src/components/HomeScreen/VideoOnlyHomeScreen.jsx
import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadStoredData, saveData } from '../../utils/storage';
import { commonInterests } from '../../utils/constants';

import { 
  FaVideo, 
  FaCamera, 
  FaMicrophone, 
  FaWifi, 
  FaUsers,
  FaGlobe,
  FaPlayCircle,
  FaRandom,
  FaShieldAlt,
  FaRocket,
  FaCrown,
  FaStar
} from 'react-icons/fa';

const VideoOnlyHomeScreen = ({ 
  userProfile, 
  onlineCount, 
  interests, 
  onUpdateInterests,
  onUpdateProfile,
  onStartVideoChat,
  connected
}) => {
  const [newInterest, setNewInterest] = useState('');
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmedOver18, setConfirmedOver18] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeSafetyTab, setActiveSafetyTab] = useState('quick-tips');
  const [cameraPermission, setCameraPermission] = useState(false);
  const [micPermission, setMicPermission] = useState(false);

  // Check camera/mic permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
        cameraStream.getTracks().forEach(track => track.stop());
        
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission(true);
        micStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.log('Camera/mic permission not granted:', error);
      }
    };
    
    checkPermissions();
  }, []);

  // Load stored data
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await loadStoredData();
        
        if (storedData.termsAccepted) setTermsAccepted(true);
        if (storedData.ageVerified) setAgeVerified(true);
        if (!storedData.welcomeShown) {
          setShowWelcome(true);
          saveData(STORAGE_KEYS.WELCOME_SHOWN, true);
        }
        if (storedData.interests) onUpdateInterests?.(storedData.interests);
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!ageVerified && !isLoading) {
      setTimeout(() => {
        setShowAgeVerification(true);
      }, 1000);
    }
  }, [ageVerified, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading video chat...</p>
        </div>
      </div>
    );
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
      const updatedInterests = [...interests, newInterest.trim()];
      onUpdateInterests(updatedInterests);
      saveData(STORAGE_KEYS.USER_INTERESTS, updatedInterests);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    const updatedInterests = interests.filter(i => i !== interest);
    onUpdateInterests(updatedInterests);
    saveData(STORAGE_KEYS.USER_INTERESTS, updatedInterests);
  };

  const handleAddCommonInterest = (interest) => {
    if (!interests.includes(interest) && interests.length < 10) {
      const updatedInterests = [...interests, interest];
      onUpdateInterests(updatedInterests);
      saveData(STORAGE_KEYS.USER_INTERESTS, updatedInterests);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Video Background Effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-900/10 via-purple-900/10 to-blue-900/10 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center relative z-10">
          {/* Animated Video Icon */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <FaVideo size={40} className="text-white" />
            </div>
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Video Chat</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Face-to-face video conversations with random strangers worldwide. 
            HD webcam quality. Real connections through live video.
          </p>

          {/* Camera Status */}
          <div className="flex justify-center gap-6 mb-8">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${cameraPermission ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              <FaCamera className={cameraPermission ? 'text-green-400' : 'text-red-400'} />
              <span>Camera {cameraPermission ? 'Ready' : 'Required'}</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${micPermission ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              <FaMicrophone className={micPermission ? 'text-green-400' : 'text-red-400'} />
              <span>Microphone {micPermission ? 'Ready' : 'Required'}</span>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => ageVerified ? onStartVideoChat() : setShowAgeVerification(true)}
              className="px-8 py-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-700 hover:via-purple-700 hover:to-blue-700 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 group animate-pulse"
            >
              <FaPlayCircle className="group-hover:animate-spin" />
              <span>Start Video Chat</span>
            </button>
            
            <button
              onClick={() => setShowSafetyTips(true)}
              className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
            >
              <FaShieldAlt />
              <span>Video Safety</span>
            </button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
              <div className="text-3xl font-bold text-red-400 mb-2 flex items-center justify-center">
                <FaUsers className="mr-2" />
                {onlineCount}
              </div>
              <div className="text-gray-300">Live Now</div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-400 mb-2 flex items-center justify-center">
                <FaGlobe className="mr-2" />
                180+
              </div>
              <div className="text-gray-300">Countries</div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center">
                <FaVideo className="mr-2" />
                HD
              </div>
              <div className="text-gray-300">Video Quality</div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
              <div className="text-3xl font-bold text-yellow-400 mb-2 flex items-center justify-center">
                <FaCrown className="mr-2" />
                Free
              </div>
              <div className="text-gray-300">Premium Quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12 relative z-10">
        {/* How It Works - Video Focused */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How Video Chat Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 group hover:border-red-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaCamera />
              </div>
              <h3 className="text-xl font-bold mb-3">Enable Camera</h3>
              <p className="text-gray-300">
                Allow camera access for face-to-face video conversations. HD quality supported.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 group hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaRandom />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect Randomly</h3>
              <p className="text-gray-300">
                Click start to connect with a random stranger instantly via live video.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 group hover:border-green-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaVideo />
              </div>
              <h3 className="text-xl font-bold mb-3">Chat Live</h3>
              <p className="text-gray-300">
                Have real-time video conversations. Skip or continue based on connection.
              </p>
            </div>
          </div>
        </div>

        {/* Profile & Interests */}
        {userProfile && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Your Video Profile</h2>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                      {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <FaVideo size={12} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{userProfile.username || 'Anonymous'}</h3>
                    <p className="text-gray-400">Video Chat Ready • Age {userProfile.age || '18'}</p>
                  </div>
                </div>
                <button
                  onClick={onUpdateProfile}
                  className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg transition-all duration-300"
                >
                  Edit Profile
                </button>
              </div>
              
              {/* Video Interests */}
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3">Video Chat Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full text-sm border border-gray-700 hover:border-red-500/50 transition-colors cursor-pointer" onClick={() => handleRemoveInterest(interest)}>
                      {interest} ×
                    </span>
                  ))}
                  {interests.length < 10 && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                        placeholder="Add interest..."
                        className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-full text-sm w-32 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleAddInterest}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-purple-600 rounded-full text-sm hover:scale-105 transition-transform"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Add interests to match with people who share similar topics</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Chat Benefits */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-red-900/20 via-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-red-500/30">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Video Chat is Better</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900/30 p-5 rounded-xl border border-gray-800">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <FaVideo size={16} />
                  </div>
                  Real Human Connection
                </h3>
                <p className="text-gray-300">
                  See facial expressions, body language, and genuine reactions. Video chat creates authentic connections that text can't replicate.
                </p>
              </div>
              
              <div className="bg-gray-900/30 p-5 rounded-xl border border-gray-800">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <FaWifi size={16} />
                  </div>
                  Live Interaction
                </h3>
                <p className="text-gray-300">
                  Real-time conversations with immediate feedback. No waiting for responses - just natural, flowing dialogue.
                </p>
              </div>
              
              <div className="bg-gray-900/30 p-5 rounded-xl border border-gray-800">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <FaGlobe size={16} />
                  </div>
                  Global Visual Experience
                </h3>
                <p className="text-gray-300">
                  See people from different cultures and backgrounds. Experience visual diversity and learn about the world face-to-face.
                </p>
              </div>
              
              <div className="bg-gray-900/30 p-5 rounded-xl border border-gray-800">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                    <FaStar size={16} />
                  </div>
                  Memorable Encounters
                </h3>
                <p className="text-gray-300">
                  Face-to-face conversations create lasting memories. Visual connections are more memorable than text exchanges.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Safety Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Video Chat Safety</h2>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-green-400" />
                  Video Safety Features
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Blur background option for privacy</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Instant disconnect button always visible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>No video recording or screenshots allowed</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Age verification required for all users</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-blue-400" />
                  Safety Tips for Video
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <span>Keep personal items out of camera view</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <span>Report any inappropriate behavior immediately</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <span>Use a neutral background when possible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <span>Trust your instincts - disconnect if uncomfortable</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-lg border border-gray-700">
              <h4 className="font-bold mb-2">⚠️ Important Video Safety Notice</h4>
              <p className="text-sm text-gray-300">
                Video chat shows your face and surroundings. Be mindful of what's visible in your camera frame. 
                Never share personal information, addresses, or identifiable details during video calls.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center">
            <div className="text-5xl mb-4 animate-bounce">🎥</div>
            <h3 className="text-2xl font-bold mb-4">Ready for Live Video Chat?</h3>
            <button
              onClick={() => ageVerified ? onStartVideoChat() : setShowAgeVerification(true)}
              className="px-10 py-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-700 hover:via-purple-700 hover:to-blue-700 rounded-xl text-xl font-bold transition-all duration-300 hover:scale-105 animate-pulse flex items-center space-x-3"
            >
              <FaRocket />
              <span>Start Live Video Chat Now</span>
            </button>
            <p className="text-gray-400 mt-4 text-sm">
              Click above to connect instantly with random strangers via live video
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOnlyHomeScreen;