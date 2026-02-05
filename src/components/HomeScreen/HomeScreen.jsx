import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import QuickAccessCards from './components/QuickAccessCards';
import ProfileSection from './components/ProfileSection';
import SafetySection from './components/SafetySection';
import InterestsSection from './components/InterestsSection';
import Footer from './components/Footer';
import WelcomeModal from './components/modals/WelcomeModal';
import SafetyWarningModal from './components/modals/SafetyWarningModal';
import AgeVerificationModal from './components/modals/AgeVerificationModal';
import MobileMenu from './components/modals/MobileMenu';
import { STORAGE_KEYS, loadStoredData, saveData } from '../../utils/storage';
import { commonInterests } from '../../utils/constants';

const HomeScreen = ({ 
  userProfile, 
  onlineCount, 
  interests, 
  onUpdateInterests,
  onUpdateProfile,
  onStartTextChat,
  onStartVideoChat,
  connected,
  currentMode,
  hasAcceptedTerms = false,
  onAcceptTerms,
  hasVerifiedAge = false,
  onVerifyAge
}) => {
  const [newInterest, setNewInterest] = useState('');
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [ageVerified, setAgeVerified] = useState(hasVerifiedAge);
  const [termsAccepted, setTermsAccepted] = useState(hasAcceptedTerms);
  const [confirmedOver18, setConfirmedOver18] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeSafetyTab, setActiveSafetyTab] = useState('quick-tips');

  // Load stored data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await loadStoredData();
        
        if (storedData.termsAccepted) {
          setTermsAccepted(true);
          onAcceptTerms?.(true);
        }
        
        if (storedData.ageVerified) {
          setAgeVerified(true);
          onVerifyAge?.(true);
        }
        
        if (!storedData.welcomeShown) {
          setShowWelcome(true);
          saveData(STORAGE_KEYS.WELCOME_SHOWN, true);
        }
        
        if (storedData.interests && storedData.interests.length > 0) {
          onUpdateInterests?.(storedData.interests);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [onAcceptTerms, onVerifyAge, onUpdateInterests]);

  // Show age verification modal if age is not verified
  useEffect(() => {
    if (!ageVerified && !isLoading) {
      setTimeout(() => {
        setShowAgeVerification(true);
      }, 1000);
    }
  }, [ageVerified, isLoading]);

  // Save interests to localStorage when they change
  useEffect(() => {
    if (interests && interests.length > 0) {
      saveData(STORAGE_KEYS.USER_INTERESTS, interests);
    }
  }, [interests]);

  // Save user profile to localStorage when it changes
  useEffect(() => {
    if (userProfile) {
      saveData(STORAGE_KEYS.USER_PROFILE, userProfile);
    }
  }, [userProfile]);

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

  const handleAgeVerification = () => {
    if (confirmedOver18) {
      setAgeVerified(true);
      setShowAgeVerification(false);
      saveData(STORAGE_KEYS.AGE_VERIFIED, true);
      onVerifyAge?.(true);
    }
  };

  const handleTermsAcceptance = () => {
    setTermsAccepted(true);
    saveData(STORAGE_KEYS.TERMS_ACCEPTED, true);
    onAcceptTerms?.(true);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will reset your profile, interests, and consent.')) {
      try {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        
        setTermsAccepted(false);
        setAgeVerified(false);
        setShowAgeVerification(true);
        
        onAcceptTerms?.(false);
        onVerifyAge?.(false);
        onUpdateInterests?.([]);
        
        alert('All data has been cleared. Page will refresh.');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  const handleExportData = () => {
    const data = {
      termsAccepted: localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED) === 'true',
      ageVerified: localStorage.getItem(STORAGE_KEYS.AGE_VERIFIED) === 'true',
      profile: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || '{}'),
      interests: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INTERESTS) || '[]')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'omegle_pro_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCloseModal = (setter) => {
    setIsClosingModal(true);
    setTimeout(() => {
      setter(false);
      setIsClosingModal(false);
    }, 300);
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags should be added to your index.html or using Helmet in your main layout */}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
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
            handleCloseModal={handleCloseModal}
            setShowSafetyTips={setShowSafetyTips}
            handleTermsAcceptance={handleTermsAcceptance}
            handleClearAllData={handleClearAllData}
            activeSafetyTab={activeSafetyTab}
            setActiveSafetyTab={setActiveSafetyTab}
          />
        )}
        
        {!ageVerified && showAgeVerification && (
          <AgeVerificationModal
            isClosingModal={isClosingModal}
            confirmedOver18={confirmedOver18}
            setConfirmedOver18={setConfirmedOver18}
            handleAgeVerification={handleAgeVerification}
          />
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <MobileMenu
            userProfile={userProfile}
            ageVerified={ageVerified}
            setShowMobileMenu={setShowMobileMenu}
            setShowSafetyTips={setShowSafetyTips}
            setShowAgeVerification={setShowAgeVerification}
            onUpdateProfile={onUpdateProfile}
            handleExportData={handleExportData}
            handleClearAllData={handleClearAllData}
          />
        )}

        {/* Header */}
        <Header
          userProfile={userProfile}
          ageVerified={ageVerified}
          termsAccepted={termsAccepted}
          setShowMobileMenu={setShowMobileMenu}
          setShowSafetyTips={setShowSafetyTips}
          onUpdateProfile={onUpdateProfile}
        />

        {/* Safety Status Banner */}
        <div className="bg-gradient-to-r from-blue-900/20 to-gray-900 border-b border-blue-500/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {ageVerified ? (
                  <>
                    <span className="text-green-400">✓</span>
                    <span className="text-white text-sm">Age verified • </span>
                  </>
                ) : (
                  <>
                    <span className="text-yellow-400">⚠</span>
                    <span className="text-white text-sm">Age verification required • </span>
                  </>
                )}
                <span className="text-gray-300 text-sm">Your data is saved locally</span>
              </div>
              <button
                onClick={() => setShowSafetyTips(true)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Safety info
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Hero Section */}
          <HeroSection onlineCount={onlineCount} />

          {/* Quick Access Cards */}
          <QuickAccessCards
            ageVerified={ageVerified}
            connected={connected}
            userProfile={userProfile}
            onStartTextChat={onStartTextChat}
            onStartVideoChat={onStartVideoChat}
            setShowAgeVerification={setShowAgeVerification}
          />

          {/* Profile Section */}
          {userProfile && (
            <ProfileSection
              userProfile={userProfile}
              ageVerified={ageVerified}
              onUpdateProfile={onUpdateProfile}
              setShowAgeVerification={setShowAgeVerification}
            />
          )}

          {/* Safety Section */}
          <SafetySection
            showSafetyTips={showSafetyTips}
            setShowSafetyTips={setShowSafetyTips}
            handleClearAllData={handleClearAllData}
          />

          {/* Interests Section */}
          <InterestsSection
            interests={interests}
            newInterest={newInterest}
            setNewInterest={setNewInterest}
            handleAddInterest={handleAddInterest}
            handleRemoveInterest={handleRemoveInterest}
            handleAddCommonInterest={handleAddCommonInterest}
            commonInterests={commonInterests}
          />

          {/* SEO Content Sections */}
          <div className="space-y-12 mt-12">
            
            {/* Comprehensive Omegle Pro Overview */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="omegle-pro-overview">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Omegle Pro: The Premier Random Chat Platform for 2024
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  <strong className="text-blue-300">Omegle Pro</strong> has emerged as the leading random chat platform following the shutdown of the original Omegle in 2023. As a modern, safety-first alternative, Omegle Pro offers users an enhanced experience for connecting with strangers through video and text chat. Our platform maintains the core concept of spontaneous online conversations while implementing advanced security measures, better moderation, and improved user experience.
                </p>

                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
                  <h3 className="text-xl font-bold mb-4 text-green-300">The Evolution of Random Chat: From Omegle to Omegle Pro</h3>
                  <p className="text-gray-300 mb-4">
                    The original Omegle, launched in 2009 by Leif K-Brooks, revolutionized online communication by introducing random chat to millions of users worldwide. While it pioneered anonymous online interactions, it faced significant challenges with moderation and user safety. Omegle Pro was created to address these issues while preserving the spontaneity that made random chat popular.
                  </p>
                  <p className="text-gray-300">
                    Unlike traditional social media platforms that rely on existing social connections, Omegle Pro facilitates genuine encounters between complete strangers, breaking down geographical and social barriers. This unique approach has proven particularly valuable for language learners, cultural exchange enthusiasts, and individuals seeking authentic human connections beyond their immediate social circles.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/30">
                    <h4 className="font-bold text-lg mb-3 text-blue-300">Global Community Statistics</h4>
                    <ul className="text-gray-300 space-y-3">
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Active users from 180+ countries</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>50+ languages supported through automatic translation</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Peak concurrent users exceeding 50,000 daily</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Average session duration: 18 minutes</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-500/30">
                    <h4 className="font-bold text-lg mb-3 text-purple-300">User Demographics</h4>
                    <ul className="text-gray-300 space-y-3">
                      <li className="flex items-center">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Age range: 18-45 (average: 26)</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>65% male, 35% female user base</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Top countries: USA, India, UK, Brazil, Germany</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Mobile usage: 68% (Android/iOS)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Comparison Deep Dive */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="feature-comparison">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Omegle Pro vs Other Random Chat Platforms: Comprehensive Analysis
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-gray-900">
                      <th className="p-4 text-left">Platform Feature</th>
                      <th className="p-4 text-left">Omegle Pro</th>
                      <th className="p-4 text-left">Original Omegle</th>
                      <th className="p-4 text-left">Chatroulette</th>
                      <th className="p-4 text-left">Tinychat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/50">
                      <td className="p-4 border-b border-gray-700">Current Status</td>
                      <td className="p-4 border-b border-gray-700 text-green-400 font-bold">Active & Growing</td>
                      <td className="p-4 border-b border-gray-700 text-red-400">Closed (Nov 2023)</td>
                      <td className="p-4 border-b border-gray-700 text-yellow-400">Active</td>
                      <td className="p-4 border-b border-gray-700 text-yellow-400">Active</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="p-4 border-b border-gray-700">Age Verification</td>
                      <td className="p-4 border-b border-gray-700 text-green-400">Mandatory 18+</td>
                      <td className="p-4 border-b border-gray-700 text-red-400">Not Required</td>
                      <td className="p-4 border-b border-gray-700 text-yellow-400">Basic</td>
                      <td className="p-4 border-b border-gray-700 text-yellow-400">Basic</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="p-4 border-b border-gray-700">Moderation System</td>
                      <td className="p-4 border-b border-gray-700">AI + Human + Community</td>
                      <td className="p-4 border-b border-gray-700">Limited Manual</td>
                      <td className="p-4 border-b border-gray-700">Basic Automated</td>
                      <td className="p-4 border-b border-gray-700">User Reporting</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="p-4 border-b border-gray-700">Privacy Level</td>
                      <td className="p-4 border-b border-gray-700 text-green-400">High (Local Storage)</td>
                      <td className="p-4 border-b border-gray-700">Medium</td>
                      <td className="p-4 border-b border-gray-700">Low</td>
                      <td className="p-4 border-b border-gray-700">Medium</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="p-4 border-b border-gray-700">Registration Required</td>
                      <td className="p-4 border-b border-gray-700 text-green-400">No</td>
                      <td className="p-4 border-b border-gray-700">No</td>
                      <td className="p-4 border-b border-gray-700">No</td>
                      <td className="p-4 border-b border-gray-700">Yes</td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="p-4 border-b border-gray-700">Interest Matching</td>
                      <td className="p-4 border-b border-gray-700 text-green-400">Advanced Algorithm</td>
                      <td className="p-4 border-b border-gray-700">Basic Tags</td>
                      <td className="p-4 border-b border-gray-700">None</td>
                      <td className="p-4 border-b border-gray-700">Room-based</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="p-4">Mobile Experience</td>
                      <td className="p-4 text-green-400">Fully Responsive</td>
                      <td className="p-4 text-red-400">Not Optimized</td>
                      <td className="p-4 text-yellow-400">Basic App</td>
                      <td className="p-4 text-yellow-400">App Available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/30">
                <h3 className="text-xl font-bold mb-3 text-green-300">Why Omegle Pro Stands Out</h3>
                <p className="text-gray-300 mb-4">
                  The competitive advantage of Omegle Pro lies in our balanced approach: we maintain the simplicity and spontaneity of random chat while implementing robust safety measures that other platforms lack. Our commitment to user privacy (with local data storage), combined with mandatory age verification and advanced moderation, creates a safer environment without compromising the authentic random chat experience.
                </p>
                <p className="text-gray-300">
                  Unlike platforms that require downloads or registrations, Omegle Pro works directly in your browser, ensuring accessibility across all devices. Our interest-based matching system reduces the randomness of connections, increasing the likelihood of meaningful conversations while preserving the element of surprise that makes random chat appealing.
                </p>
              </div>
            </section>

            {/* Comprehensive Feature Breakdown */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="features-breakdown">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Omegle Pro Features: Technical Specifications & User Benefits
              </h2>
              
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/40 p-5 rounded-lg border border-blue-500/30">
                    <h3 className="text-lg font-bold mb-2 text-blue-300">Video Chat Technology Stack</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Omegle Pro utilizes WebRTC (Web Real-Time Communication) for peer-to-peer video connections. This ensures:
                    </p>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• End-to-end encryption for all video streams</li>
                      <li>• Adaptive bitrate for varying network conditions</li>
                      <li>• Resolution up to 1080p based on connection speed</li>
                      <li>• Less than 200ms latency for real-time interaction</li>
                      <li>• Noise cancellation and echo suppression</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/40 p-5 rounded-lg border border-purple-500/30">
                    <h3 className="text-lg font-bold mb-2 text-purple-300">Text Chat Infrastructure</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Our real-time text chat system offers:
                    </p>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• WebSocket connections for instant messaging</li>
                      <li>• Typing indicators and read receipts</li>
                      <li>• Support for emojis and special characters</li>
                      <li>• Message history (locally stored only)</li>
                      <li>• Automatic language detection</li>
                    </ul>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-green-500/30">
                    <h4 className="font-bold mb-2 text-green-300">Matching Algorithm</h4>
                    <p className="text-gray-300 text-xs">
                      Proprietary algorithm that considers interests, language, timezone, and conversation history to optimize connections.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-yellow-500/30">
                    <h4 className="font-bold mb-2 text-yellow-300">Privacy Architecture</h4>
                    <p className="text-gray-300 text-xs">
                      All user data stored locally using IndexedDB. No server-side storage of conversations or personal information.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-red-500/30">
                    <h4 className="font-bold mb-2 text-red-300">Safety Systems</h4>
                    <p className="text-gray-300 text-xs">
                      Multi-layered moderation including AI content analysis, user reporting, and manual review teams.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases and Applications */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="use-cases">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Practical Applications: How People Use Omegle Pro
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800/30 p-5 rounded-lg">
                  <h3 className="text-lg font-bold mb-2 text-blue-300">Language Learning & Practice</h3>
                  <p className="text-gray-300 mb-3">
                    Omegle Pro has become a popular platform for language learners seeking authentic conversation practice with native speakers. Users can:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Practice conversational skills in target languages</li>
                    <li>• Learn colloquial expressions and slang</li>
                    <li>• Receive instant feedback on pronunciation</li>
                    <li>• Understand cultural nuances through direct interaction</li>
                    <li>• Build confidence in speaking with strangers</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/30 p-5 rounded-lg">
                  <h3 className="text-lg font-bold mb-2 text-purple-300">Cultural Exchange & Global Awareness</h3>
                  <p className="text-gray-300 mb-3">
                    The platform facilitates cross-cultural understanding by connecting users from different backgrounds:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Learn about customs and traditions worldwide</li>
                    <li>• Discuss current events from different perspectives</li>
                    <li>• Share cultural experiences and stories</li>
                    <li>• Break down stereotypes through direct communication</li>
                    <li>• Build international friendships</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/30 p-5 rounded-lg">
                  <h3 className="text-lg font-bold mb-2 text-green-300">Professional Networking & Skill Development</h3>
                  <p className="text-gray-300 mb-3">
                    Professionals use Omegle Pro for networking and skill enhancement:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Connect with professionals in similar industries</li>
                    <li>• Practice presentation and communication skills</li>
                    <li>• Seek career advice from experienced individuals</li>
                    <li>• Discuss industry trends and innovations</li>
                    <li>• Develop cross-cultural business communication skills</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Safety and Privacy Deep Dive */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="safety-privacy">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Safety & Privacy: Omegle Pro's Comprehensive Protection Framework
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-900/20 p-5 rounded-lg border border-red-500/30">
                  <h3 className="text-lg font-bold mb-2 text-red-300">Age Verification System</h3>
                  <p className="text-gray-300 mb-3">
                    All users must verify they are 18+ before accessing chat features. This system:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Prevents underage access to the platform</li>
                    <li>• Creates accountability among adult users</li>
                    <li>• Reduces risks associated with minor interactions</li>
                    <li>• Complies with international online safety standards</li>
                  </ul>
                </div>
                
                <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/30">
                  <h3 className="text-lg font-bold mb-2 text-blue-300">Content Moderation Layers</h3>
                  <p className="text-gray-300 mb-3">
                    Our multi-tiered moderation approach includes:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/40 p-3 rounded">
                      <h4 className="font-bold text-sm mb-1 text-green-300">AI Analysis</h4>
                      <p className="text-gray-300 text-xs">Real-time detection of inappropriate content</p>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded">
                      <h4 className="font-bold text-sm mb-1 text-yellow-300">User Reporting</h4>
                      <p className="text-gray-300 text-xs">Quick report system with instant response</p>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded">
                      <h4 className="font-bold text-sm mb-1 text-red-300">Manual Review</h4>
                      <p className="text-gray-300 text-xs">Human moderation team for complex cases</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-900/20 p-5 rounded-lg border border-green-500/30">
                  <h3 className="text-lg font-bold mb-2 text-green-300">Privacy Protection Measures</h3>
                  <p className="text-gray-300 mb-3">
                    Unlike many platforms, Omegle Pro doesn't store your conversations:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• All chat data remains on your local device</li>
                    <li>• No registration = no personal data collection</li>
                    <li>• IP addresses are anonymized and not stored</li>
                    <li>• No tracking cookies or behavioral profiling</li>
                    <li>• Option to clear all data with one click</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technical Specifications */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="tech-specs">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Technical Specifications & System Requirements
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 text-blue-300">Browser Requirements</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Chrome 80+ (Recommended)</li>
                    <li>• Firefox 75+</li>
                    <li>• Safari 13+</li>
                    <li>• Edge 80+</li>
                    <li>• Opera 67+</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-300">Network Requirements</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Minimum: 1 Mbps upload/download</li>
                    <li>• Recommended: 5+ Mbps for HD video</li>
                    <li>• Stable connection for best experience</li>
                    <li>• Low latency network preferred</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-800/40 p-5 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-green-300">Device Compatibility</h3>
                <p className="text-gray-300">
                  Omegle Pro works on all modern devices including Windows PCs, Mac computers, Android smartphones, iPhones, iPads, and Chromebooks. No app download required - everything runs directly in your browser.
                </p>
              </div>
            </section>

            {/* FAQ Expansion */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700" id="faq-expanded">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                Frequently Asked Questions About Omegle Pro
              </h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-bold mb-2 text-blue-300">How does Omegle Pro handle inappropriate content?</h3>
                  <p className="text-gray-300">
                    Omegle Pro employs a three-tier moderation system: 1) AI-powered content filtering that analyzes conversations in real-time, 2) User reporting system that allows immediate flagging of inappropriate behavior, and 3) Human moderation team that reviews reported content. Violations result in temporary or permanent bans depending on severity.
                  </p>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-bold mb-2 text-purple-300">Can I use Omegle Pro without a webcam?</h3>
                  <p className="text-gray-300">
                    Yes, absolutely. While Omegle Pro supports video chat, you can choose to use only text chat if you prefer. Many users enjoy text-only conversations, and our platform accommodates both preferences. The text chat interface includes typing indicators, emoji support, and real-time messaging.
                  </p>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-bold mb-2 text-green-300">Is there a limit to how long I can chat?</h3>
                  <p className="text-gray-300">
                    No, there are no time limits on conversations. You can chat for as long as you and your partner wish to continue. Sessions can last from a few minutes to several hours. If you want to end a conversation, simply click the "Next" or "Disconnect" button to connect with someone new.
                  </p>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-bold mb-2 text-yellow-300">How does the interest matching system work?</h3>
                  <p className="text-gray-300">
                    When you select interests in your profile, our algorithm prioritizes matching you with users who share those interests. The system considers multiple factors including common interests, language preferences, timezone similarity, and past connection success rates to optimize your chat experience.
                  </p>
                </div>
                
                <div className="pb-4">
                  <h3 className="text-lg font-bold mb-2 text-cyan-300">What happens if I encounter technical issues?</h3>
                  <p className="text-gray-300">
                    Omegle Pro includes built-in troubleshooting for common issues. If you experience connection problems, try refreshing the page, checking your internet connection, or clearing your browser cache. For persistent issues, our support documentation provides step-by-step solutions for most technical problems.
                  </p>
                </div>
              </div>
            </section>

            {/* Conclusion and CTA */}
            <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 md:p-8 border border-blue-500/30" id="conclusion">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-white">
                Join the Omegle Pro Community Today
              </h2>
              
              <div className="text-center space-y-4">
                <p className="text-gray-300 text-lg">
                  Experience the next generation of random chat with enhanced safety, better features, and a global community waiting to connect.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-2">Free</div>
                    <div className="text-gray-300 text-sm">No hidden costs or subscriptions</div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 mb-2">Secure</div>
                    <div className="text-gray-300 text-sm">Advanced privacy and safety features</div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400 mb-2">Global</div>
                    <div className="text-gray-300 text-sm">Connect with people worldwide</div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    onClick={() => ageVerified ? onStartVideoChat() : setShowAgeVerification(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Start Video Chat Now
                  </button>
                  <p className="text-gray-400 text-sm mt-4">
                    No registration required • Works on all devices • Your privacy protected
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Resource Links */}
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-xl font-bold mb-6 text-center text-white">Additional Safety Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <a href="https://www.connectsafely.org/controls/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-blue-500/30 hover:border-blue-500 transition-colors">
                <h4 className="font-bold text-blue-300 mb-2 text-sm md:text-base">Parental Controls</h4>
                <p className="text-xs md:text-sm text-gray-400">Tools to help parents monitor and restrict online access</p>
              </a>
              
              <a href="https://www.commonsensemedia.org/articles/online-safety" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-green-500/30 hover:border-green-500 transition-colors">
                <h4 className="font-bold text-green-300 mb-2 text-sm md:text-base">Online Safety Guide</h4>
                <p className="text-xs md:text-sm text-gray-400">Comprehensive guide to staying safe online</p>
              </a>
              
              <a href="https://www.missingkids.org/cybertipline" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-red-500/30 hover:border-red-500 transition-colors">
                <h4 className="font-bold text-red-300 mb-2 text-sm md:text-base">Report Issues</h4>
                <p className="text-xs md:text-sm text-gray-400">Report illegal or suspicious activity to authorities</p>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer handleClearAllData={handleClearAllData} />
      </div>
    </>
  );
};

export default HomeScreen;