// src/components/HomeScreen/TextOnlyHomeScreen.jsx
import React, { useState, useEffect } from 'react';

import WelcomeModal from './components/modals/WelcomeModal';
import SafetyWarningModal from './components/modals/SafetyWarningModal';
import AgeVerificationModal from './components/modals/AgeVerificationModal';

import { STORAGE_KEYS, loadStoredData, saveData } from '../../utils/storage';


import { 
  FaKeyboard, 
  FaComments, 
  FaGlobe, 
  FaLock, 
  FaMobileAlt,
  FaRocket,
  FaPaperPlane,
  FaUsers,
  FaSearch
} from 'react-icons/fa';

const TextOnlyHomeScreen = ({ 
  userProfile, 
  onlineCount, 
  interests, 
  onUpdateInterests,
  onUpdateProfile,
  onStartTextChat,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading text chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Modals */}
      {showWelcome && (
        <WelcomeModal
          isClosingModal={isClosingModal}
          setShowWelcome={setShowWelcome}
          setShowSafetyTips={setShowSafetyTips}
        />
      )}
      
      {showSafetyTips && (
        <SafetyWarningModal
          isClosingModal={isClosingModal}
          handleCloseModal={() => setShowSafetyTips(false)}
          setShowSafetyTips={setShowSafetyTips}
          handleTermsAcceptance={() => setTermsAccepted(true)}
          handleClearAllData={() => {}}
          activeSafetyTab={activeSafetyTab}
          setActiveSafetyTab={setActiveSafetyTab}
        />
      )}
      
      {!ageVerified && showAgeVerification && (
        <AgeVerificationModal
          isClosingModal={isClosingModal}
          confirmedOver18={confirmedOver18}
          setConfirmedOver18={setConfirmedOver18}
          handleAgeVerification={() => {
            setAgeVerified(true);
            setShowAgeVerification(false);
            saveData(STORAGE_KEYS.AGE_VERIFIED, true);
          }}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl">
            <FaKeyboard size={40} className="text-blue-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Text-Only <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Anonymous Chat</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with strangers worldwide through meaningful text conversations. 
            No camera required, just pure anonymous messaging.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => ageVerified ? onStartTextChat() : setShowAgeVerification(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
            >
              <FaRocket />
              <span>Start Text Chat</span>
            </button>
            
            <button
              onClick={() => setShowSafetyTips(true)}
              className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
            >
              <FaLock />
              <span>Safety Guide</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-3xl font-bold text-blue-400 mb-2">{onlineCount}</div>
              <div className="text-gray-300">Online Now</div>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-3xl font-bold text-green-400 mb-2">180+</div>
              <div className="text-gray-300">Countries</div>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-3xl font-bold text-purple-400 mb-2">Free</div>
              <div className="text-gray-300">No Cost</div>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-3xl font-bold text-yellow-400 mb-2">No Cam</div>
              <div className="text-gray-300">Required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
        {/* Quick Start */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How Text Chat Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Interests</h3>
              <p className="text-gray-300">
                Select topics you enjoy to match with like-minded people for better conversations.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Start Chatting</h3>
              <p className="text-gray-300">
                Click "Start Text Chat" to instantly connect with a random stranger from anywhere.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Connect & Share</h3>
              <p className="text-gray-300">
                Have meaningful conversations, share stories, and make new connections worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Profile & Interests */}
        {userProfile && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Your Text Chat Profile</h2>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                    {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{userProfile.username || 'Anonymous'}</h3>
                    <p className="text-gray-400">Age {userProfile.age || '18'}</p>
                  </div>
                </div>
                <button
                  onClick={onUpdateProfile}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              </div>
              
              {/* Interests Section */}
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3">Your Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-700/50 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Choose Text-Only Chat?</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-800/30 p-5 rounded-xl">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <FaKeyboard className="mr-3 text-blue-400" />
                  Enhanced Privacy
                </h3>
                <p className="text-gray-300">
                  Text chat offers complete anonymity without revealing your appearance. No camera means 
                  no visual data shared, providing an extra layer of privacy for meaningful conversations.
                </p>
              </div>
              
              <div className="bg-gray-800/30 p-5 rounded-xl">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <FaComments className="mr-3 text-green-400" />
                  Thoughtful Conversations
                </h3>
                <p className="text-gray-300">
                  Text-based communication allows for more considered responses, deeper discussions, 
                  and better expression of thoughts without the pressure of real-time video interaction.
                </p>
              </div>
              
              <div className="bg-gray-800/30 p-5 rounded-xl">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <FaMobileAlt className="mr-3 text-yellow-400" />
                  Universal Access
                </h3>
                <p className="text-gray-300">
                  Works on any device with an internet connection. No camera required means you can 
                  chat from smartphones, tablets, or computers without any hardware limitations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Safe Text Chatting</h2>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-3">Our Safety Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Mandatory age verification</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>AI-powered content moderation</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Quick reporting system</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Anonymous chat sessions</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-3">Safety Tips</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Never share personal information</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Report suspicious behavior</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Trust your instincts</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Use the disconnect button anytime</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => setShowSafetyTips(true)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
            >
              View Complete Safety Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextOnlyHomeScreen;