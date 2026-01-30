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