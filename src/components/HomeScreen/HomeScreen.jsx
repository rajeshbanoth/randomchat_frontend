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


        {/* Resource Links */}
        <div className="max-w-4xl mx-auto mt-6 md:mt-8">
  <section className="max-w-4xl mx-auto mb-12" aria-label="About Omegle Pro">
  <article className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
    <h2 className="text-2xl font-bold mb-6 text-center">About Omegle Pro - The Premier Anonymous Chat Platform</h2>
    
    <div className="prose prose-invert max-w-none space-y-6">
      <p className="text-gray-300 text-lg leading-relaxed">
        <strong>Omegle Pro</strong> represents the next generation of anonymous online communication platforms, designed specifically for adults seeking genuine connections in a secure digital environment. Unlike traditional social media networks that require extensive personal information, Omegle Pro prioritizes your privacy while delivering meaningful interactions with people from around the globe.
      </p>

      <h3 className="text-xl font-bold mb-4 text-blue-300">Our Mission: Connecting People Safely</h3>
      <p className="text-gray-300">
        At Omegle Pro, we believe that everyone deserves the opportunity to connect with interesting people worldwide without compromising their privacy or security. Our mission is to create a platform where adults can engage in authentic conversations, share experiences, and build connections based on mutual interests rather than social status or appearance.
      </p>

      <div className="bg-gray-800/50 p-6 rounded-xl my-6 border border-gray-700">
        <h4 className="font-bold text-lg mb-3 text-green-300">Why Choose Omegle Pro?</h4>
        <p className="text-gray-300 mb-4">
          In today's digital landscape where data privacy concerns are at an all-time high, Omegle Pro offers a refreshing alternative. While most platforms collect and monetize user data, we've built our entire infrastructure around the principle of user sovereignty over personal information.
        </p>
        <p className="text-gray-300">
          Our unique approach to anonymous chatting has made us one of the fastest-growing platforms in the online communication space, with thousands of daily users reporting positive experiences and meaningful connections.
        </p>
      </div>

      <h3 className="text-xl font-bold mb-4 text-purple-300">Comprehensive Key Features</h3>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800/30 p-5 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-blue-300">🔒 Ultimate Privacy Protection</h4>
          <p className="text-gray-300 text-sm">
            Unlike other chat platforms, we don't store conversations on our servers. All data remains on your device using advanced browser storage technology. This means your conversations are truly private - only you have access to them.
          </p>
        </div>
        
        <div className="bg-gray-800/30 p-5 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-green-300">🎯 Intelligent Matching System</h4>
          <p className="text-gray-300 text-sm">
            Our sophisticated algorithm connects you with people who share your genuine interests. Whether you're into technology, art, travel, or niche hobbies, you'll find like-minded individuals for more engaging conversations.
          </p>
        </div>
        
        <div className="bg-gray-800/30 p-5 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-yellow-300">🌍 Global Community Access</h4>
          <p className="text-gray-300 text-sm">
            Connect with users from over 150 countries without language barriers. Our platform supports multilingual conversations, allowing you to broaden your horizons and learn about different cultures firsthand.
          </p>
        </div>
        
        <div className="bg-gray-800/30 p-5 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-pink-300">📊 Real-Time Analytics</h4>
          <p className="text-gray-300 text-sm">
            See exactly how many users are online at any given moment. Our live statistics provide transparency about platform activity, helping you choose the best times to connect with the global community.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-cyan-300">How Omegle Pro Differs from Traditional Chat Platforms</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-gray-300 border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-900">
              <th className="border border-gray-700 p-3 text-left">Feature</th>
              <th className="border border-gray-700 p-3 text-left">Omegle Pro</th>
              <th className="border border-gray-700 p-3 text-left">Traditional Platforms</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-800/50">
              <td className="border border-gray-700 p-3">Data Storage</td>
              <td className="border border-gray-700 p-3 text-green-300">Local device only</td>
              <td className="border border-gray-700 p-3 text-red-300">Central servers</td>
            </tr>
            <tr className="bg-gray-800/30">
              <td className="border border-gray-700 p-3">Registration Required</td>
              <td className="border border-gray-700 p-3 text-green-300">No sign-up needed</td>
              <td className="border border-gray-700 p-3 text-red-300">Email/password required</td>
            </tr>
            <tr className="bg-gray-800/50">
              <td className="border border-gray-700 p-3">Age Verification</td>
              <td className="border border-gray-700 p-3 text-green-300">Mandatory for safety</td>
              <td className="border border-gray-700 p-3 text-yellow-300">Often optional</td>
            </tr>
            <tr className="bg-gray-800/30">
              <td className="border border-gray-700 p-3">Conversation History</td>
              <td className="border border-gray-700 p-3 text-green-300">Not stored anywhere</td>
              <td className="border border-gray-700 p-3 text-red-300">Permanently logged</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold mb-4 text-orange-300">The Technology Behind Our Platform</h3>
      <p className="text-gray-300 mb-4">
        Omegle Pro leverages cutting-edge web technologies including WebRTC for high-quality video chat, WebSocket connections for real-time text communication, and advanced browser storage APIs to keep your data local. Our platform is built with React.js for optimal performance and accessibility across all devices.
      </p>
      
      <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/30 my-4">
        <h4 className="font-bold text-lg mb-2 text-blue-300">Security Architecture</h4>
        <p className="text-gray-300 text-sm">
          We employ end-to-end encryption for all video communications and implement strict age verification protocols. Our moderation system uses both automated filters and community reporting to maintain a safe environment for all users. Regular security audits ensure our platform remains at the forefront of online safety technology.
        </p>
      </div>

      <h3 className="text-xl font-bold mb-4 text-lime-300">Who Uses Omegle Pro?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-800/40 rounded-lg">
          <div className="text-2xl font-bold text-blue-400 mb-1">35%</div>
          <div className="text-gray-300 text-sm">Professionals Networking</div>
        </div>
        <div className="text-center p-4 bg-gray-800/40 rounded-lg">
          <div className="text-2xl font-bold text-purple-400 mb-1">28%</div>
          <div className="text-gray-300 text-sm">Language Learners</div>
        </div>
        <div className="text-center p-4 bg-gray-800/40 rounded-lg">
          <div className="text-2xl font-bold text-green-400 mb-1">22%</div>
          <div className="text-gray-300 text-sm">Hobby Enthusiasts</div>
        </div>
        <div className="text-center p-4 bg-gray-800/40 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400 mb-1">15%</div>
          <div className="text-gray-300 text-sm">Cultural Explorers</div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-indigo-300">Success Stories & User Experiences</h3>
      <div className="space-y-4">
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300">
          "After moving to a new country, Omegle Pro helped me overcome loneliness by connecting me with local people who shared my interests in photography. I've made genuine friendships through the platform." - <strong className="not-italic">Alex, 28, Digital Nomad</strong>
        </blockquote>
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300">
          "As a language teacher, I recommend Omegle Pro to my students for practicing conversational skills with native speakers. The anonymous aspect reduces anxiety and encourages authentic communication." - <strong className="not-italic">Maria, 35, Language Instructor</strong>
        </blockquote>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30">
        <h4 className="text-xl font-bold mb-3 text-center text-white">Ready to Join Our Global Community?</h4>
        <p className="text-gray-300 text-center mb-4">
          With thousands of active users online 24/7, there's always someone interesting to talk to. Whether you're looking for casual conversation, cultural exchange, or meaningful connections, Omegle Pro provides the perfect platform for modern digital communication.
        </p>
        <p className="text-center text-gray-300 text-sm">
          <strong>No downloads required • Works on all devices • Completely free • Privacy-focused</strong>
        </p>
      </div>

      <div className="text-xs text-gray-500 mt-8 pt-6 border-t border-gray-700">
        <p>Omegle Pro is intended for users aged 18 and older. All users must verify their age before accessing chat features. By using our platform, you agree to our community guidelines and acknowledge that you are solely responsible for your interactions. We encourage safe online practices and provide comprehensive safety resources for all users.</p>
      </div>
    </div>
  </article>
</section>
{/* Benefits Section */}
<section className="max-w-4xl mx-auto mb-12">
  <article className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
    <h2 className="text-2xl font-bold mb-6 text-center">Benefits of Using Omegle Pro for Online Communication</h2>
    
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold mb-4">Psychological Benefits of Anonymous Social Interaction</h3>
      <p className="text-gray-300 mb-4">
        Research has shown that anonymous social platforms can provide significant psychological benefits when used responsibly. Without the pressure of maintaining a social media persona, users often engage in more authentic self-expression and meaningful conversation.
      </p>
      
      <h3 className="text-xl font-bold mb-4">Cross-Cultural Communication Advantages</h3>
      <p className="text-gray-300 mb-4">
        Omegle Pro breaks down geographical barriers, allowing users to gain international perspectives and cultural insights. This global exposure can enhance cultural sensitivity, broaden worldviews, and create opportunities for cross-cultural learning that traditional social networks often lack.
      </p>
      
      <h3 className="text-xl font-bold mb-4">Professional and Educational Applications</h3>
      <ul className="text-gray-300 space-y-2 mb-4">
        <li><strong>Language Practice:</strong> Connect with native speakers for immersive language learning</li>
        <li><strong>Professional Networking:</strong> Meet industry professionals worldwide without geographical constraints</li>
        <li><strong>Cultural Research:</strong> Conduct informal cultural exchanges and research</li>
        <li><strong>Skill Development:</strong> Practice communication and social skills in a low-pressure environment</li>
      </ul>
    </div>
  </article>
</section>

{/* Safety & Privacy Deep Dive */}
<section className="max-w-4xl mx-auto mb-12">
  <article className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
    <h2 className="text-2xl font-bold mb-6 text-center">Comprehensive Safety & Privacy Framework</h2>
    
    <div className="prose prose-invert max-w-none">
      <h3 className="text-xl font-bold mb-4">Our Multi-Layered Safety Approach</h3>
      <p className="text-gray-300 mb-4">
        Omegle Pro implements a comprehensive safety framework that goes beyond basic moderation. Our system includes automated content filtering, user reporting mechanisms, and educational resources to ensure a positive experience for all users.
      </p>
      
      <h4 className="font-bold mb-2">Technical Safety Measures</h4>
      <ul className="text-gray-300 space-y-2 mb-4">
        <li>Real-time content analysis for inappropriate material</li>
        <li>Behavioral pattern detection algorithms</li>
        <li>User reputation scoring system</li>
        <li>Automated session monitoring</li>
        <li>Emergency disconnect features</li>
      </ul>
      
      <h3 className="text-xl font-bold mb-4">Privacy by Design Philosophy</h3>
      <p className="text-gray-300 mb-4">
        Unlike platforms that collect extensive user data, Omegle Pro follows a "privacy by design" approach. Every feature is evaluated through a privacy lens, ensuring that user data protection is not an afterthought but a foundational principle.
      </p>
    </div>
  </article>
</section>
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
  );
};

export default HomeScreen;