// components/HomeScreen.jsx - Fixed modal scrolling
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, FaComments, FaVideo, FaUsers, 
  FaHeart, FaPlus, FaTimes, FaArrowRight,
  FaCrown, FaStar, FaEdit, FaShieldAlt,
  FaRandom, FaRobot, FaExclamationTriangle,
  FaLock, FaBan, FaInfoCircle,
  FaCheckCircle, FaBell, FaChevronLeft,
  FaChevronRight, FaBars, FaWindowClose,
  FaSave
} from 'react-icons/fa';
import { IoIosWarning as FaWarning } from "react-icons/io";
import { Link } from 'react-router-dom';

// Constants for localStorage keys
const STORAGE_KEYS = {
  TERMS_ACCEPTED: 'omegle_pro_terms_accepted',
  AGE_VERIFIED: 'omegle_pro_age_verified',
  USER_PROFILE: 'omegle_pro_user_profile',
  USER_INTERESTS: 'omegle_pro_user_interests'
};

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
  const [showSafetyTips, setShowSafetyTips] = useState(true);
  const [ageVerified, setAgeVerified] = useState(hasVerifiedAge);
  const [termsAccepted, setTermsAccepted] = useState(hasAcceptedTerms);
  const [confirmedOver18, setConfirmedOver18] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const modalRef = useRef(null);
  const safetyModalRef = useRef(null);
  const ageModalRef = useRef(null);
  const safetyModalContentRef = useRef(null);
  const ageModalContentRef = useRef(null);

  const commonInterests = [
    'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
    'Travel', 'Food', 'Art', 'Books', 'Fitness',
    'Science', 'Fashion', 'Photography', 'Animals'
  ];

  // Load stored data on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedTerms = localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED);
        const storedAge = localStorage.getItem(STORAGE_KEYS.AGE_VERIFIED);
        
        if (storedTerms === 'true') {
          setTermsAccepted(true);
          onAcceptTerms?.(true);
        }
        
        if (storedAge === 'true') {
          setAgeVerified(true);
          onVerifyAge?.(true);
        }
        
        // Load user profile if exists
        const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (storedProfile) {
          try {
            const parsedProfile = JSON.parse(storedProfile);
            // You might want to pass this to parent component
            // onUpdateProfile?.(parsedProfile);
          } catch (e) {
            console.error('Error parsing stored profile:', e);
          }
        }
        
        // Load interests if exists
        const storedInterests = localStorage.getItem(STORAGE_KEYS.USER_INTERESTS);
        if (storedInterests) {
          try {
            const parsedInterests = JSON.parse(storedInterests);
            onUpdateInterests?.(parsedInterests);
          } catch (e) {
            console.error('Error parsing stored interests:', e);
          }
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredData();
  }, [onAcceptTerms, onVerifyAge, onUpdateInterests]);

  useEffect(() => {
    // Show age verification modal if age is not verified
    if (!ageVerified && !isLoading) {
      setTimeout(() => {
        setShowAgeVerification(true);
      }, 500);
    }
  }, [ageVerified, isLoading]);

  // Save interests to localStorage when they change
  useEffect(() => {
    if (interests && interests.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(interests));
      } catch (error) {
        console.error('Error saving interests to localStorage:', error);
      }
    }
  }, [interests]);

  // Save user profile to localStorage when it changes
  useEffect(() => {
    if (userProfile) {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      } catch (error) {
        console.error('Error saving profile to localStorage:', error);
      }
    }
  }, [userProfile]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
      const updatedInterests = [...interests, newInterest.trim()];
      onUpdateInterests(updatedInterests);
      
      // Auto-save to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(updatedInterests));
      } catch (error) {
        console.error('Error saving interests:', error);
      }
      
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    const updatedInterests = interests.filter(i => i !== interest);
    onUpdateInterests(updatedInterests);
    
    // Auto-save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(updatedInterests));
    } catch (error) {
      console.error('Error saving interests:', error);
    }
  };

  const handleAddCommonInterest = (interest) => {
    if (!interests.includes(interest) && interests.length < 10) {
      const updatedInterests = [...interests, interest];
      onUpdateInterests(updatedInterests);
      
      // Auto-save to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(updatedInterests));
      } catch (error) {
        console.error('Error saving interests:', error);
      }
    }
  };

  const handleAgeVerification = () => {
    if (confirmedOver18) {
      setAgeVerified(true);
      setShowAgeVerification(false);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.AGE_VERIFIED, 'true');
      } catch (error) {
        console.error('Error saving age verification:', error);
      }
      
      onVerifyAge?.(true);
    }
  };

  const handleTermsAcceptance = () => {
    setTermsAccepted(true);
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, 'true');
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
    }
    
    onAcceptTerms?.(true);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will reset your profile, interests, and consent.')) {
      try {
        localStorage.removeItem(STORAGE_KEYS.TERMS_ACCEPTED);
        localStorage.removeItem(STORAGE_KEYS.AGE_VERIFIED);
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.USER_INTERESTS);
        
        setTermsAccepted(false);
        setAgeVerified(false);
        setShowAgeVerification(true);
        
        // Reset parent state if callbacks exist
        onAcceptTerms?.(false);
        onVerifyAge?.(false);
        onUpdateInterests?.([]);
        
        alert('All data has been cleared. Please refresh the page.');
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

  const SafetyWarningModal = () => (
    <div className={`fixed inset-0 bg-black/90 z-50 flex items-start justify-center p-4 transition-all duration-300 overflow-y-auto ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div 
        ref={safetyModalRef}
        className="bg-gradient-to-br from-red-900/90 to-gray-900 rounded-2xl p-4 md:p-8 max-w-2xl w-full border-2 border-red-500 relative my-auto"
      >
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {termsAccepted && (
            <span className="text-green-400 text-sm flex items-center">
              <FaSave className="mr-1" /> Saved
            </span>
          )}
          <button
            onClick={() => handleCloseModal(() => {})}
            disabled={!termsAccepted}
            className={`text-gray-400 hover:text-white transition-colors ${
              !termsAccepted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center mb-6">
          <FaExclamationTriangle className="text-red-500 text-4xl md:text-5xl mr-0 md:mr-4 mb-4 md:mb-0" />
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center md:text-left">
            ⚠️ IMPORTANT SAFETY WARNING ⚠️
          </h2>
        </div>
        
        <div 
          ref={safetyModalContentRef}
          className="space-y-4 mb-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/50">
            <h3 className="text-lg md:text-xl font-bold text-red-300 mb-2">🚨 CRITICAL SAFETY INFORMATION</h3>
            <p className="text-white/90 text-sm md:text-base">
              Omegle is an anonymous chat platform where you may encounter explicit content, predators, scams, and inappropriate behavior.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-base md:text-lg font-bold text-yellow-400">🚫 STRICTLY PROHIBITED:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaBan className="text-red-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-white/90 text-sm md:text-base">Sharing personal information (name, address, school, phone number)</span>
              </li>
              <li className="flex items-start">
                <FaBan className="text-red-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-white/90 text-sm md:text-base">Sharing social media profiles or contact information</span>
              </li>
              <li className="flex items-start">
                <FaBan className="text-red-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-white/90 text-sm md:text-base">Explicit or adult content (Omegle is NOT for sexual content)</span>
              </li>
              <li className="flex items-start">
                <FaBan className="text-red-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-white/90 text-sm md:text-base">Harassment, bullying, or hate speech</span>
              </li>
              <li className="flex items-start">
                <FaBan className="text-red-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-white/90 text-sm md:text-base">Screen sharing or showing identifiable information</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-500/50">
            <h4 className="text-base md:text-lg font-bold text-yellow-300 mb-2">🛡️ SAFETY TIPS:</h4>
            <ul className="space-y-1 text-sm md:text-base">
              <li>• Use a VPN for additional privacy</li>
              <li>• Never meet anyone from Omegle in person</li>
              <li>• Report inappropriate users immediately</li>
              <li>• Keep your camera covered when not in use</li>
              <li>• Use moderated chat options when available</li>
            </ul>
          </div>

          <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/50">
            <h4 className="text-base md:text-lg font-bold text-blue-300 mb-2">👤 FOR PARENTS:</h4>
            <p className="text-white/90 text-sm md:text-base">
              This platform is not suitable for minors. Consider using parental control software and discuss online safety with your children.
            </p>
          </div>
          
          <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/50">
            <h4 className="text-base md:text-lg font-bold text-green-300 mb-2">💾 DATA STORAGE:</h4>
            <p className="text-white/90 text-sm md:text-base">
              Your consent will be saved locally in your browser. You won't see this warning again unless you clear your browser data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => window.open('https://www.commonsensemedia.org/articles/online-safety', '_blank')}
            className="flex-1 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold hover:opacity-90 transition-all text-sm md:text-base"
          >
            <FaInfoCircle className="inline mr-2" />
            Learn More About Online Safety
          </button>
          <button
            onClick={handleTermsAcceptance}
            className="flex-1 py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90 transition-all text-sm md:text-base"
          >
            <FaCheckCircle className="inline mr-2" />
            I Understand & Accept Risks
          </button>
        </div>
      </div>
    </div>
  );

  const AgeVerificationModal = () => (
    <div className={`fixed inset-0 bg-black/90 z-50 flex items-start justify-center p-4 transition-all duration-300 overflow-y-auto ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div 
        ref={ageModalRef}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-yellow-500 relative my-auto"
      >
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {ageVerified && (
            <span className="text-green-400 text-sm flex items-center">
              <FaSave className="mr-1" /> Saved
            </span>
          )}
          <button
            onClick={() => handleCloseModal(() => {})}
            disabled={!ageVerified}
            className={`text-gray-400 hover:text-white transition-colors ${
              !ageVerified ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <FaLock className="text-yellow-500 text-4xl md:text-5xl mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Age Verification Required</h2>
          <p className="text-gray-400 text-sm md:text-base">You must be 18 or older to use Omegle</p>
        </div>

        <div 
          ref={ageModalContentRef}
          className="space-y-4 mb-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-2"
        >
          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-300 text-xs md:text-sm">
              <FaWarning className="inline mr-2" />
              Omegle contains unmoderated content that may not be suitable for minors.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              id="ageConfirm"
              checked={confirmedOver18}
              onChange={(e) => setConfirmedOver18(e.target.checked)}
              className="mt-1 w-5 h-5 flex-shrink-0"
            />
            <label htmlFor="ageConfirm" className="text-white text-xs md:text-sm">
              I confirm that I am 18 years of age or older. I understand that Omegle may contain adult content and I am legally allowed to view such content in my jurisdiction.
            </label>
          </div>
          
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-xs md:text-sm">
              <FaSave className="inline mr-2" />
              Your age verification will be saved in your browser. You won't need to verify again.
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-8">
          <button
            onClick={handleAgeVerification}
            disabled={!confirmedOver18}
            className={`w-full py-3 md:py-4 rounded-xl font-bold transition-all duration-200 text-sm md:text-base ${
              confirmedOver18
                ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90'
                : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            <FaCheckCircle className="inline mr-2" />
            Verify I Am 18+ (Save to Browser)
          </button>
          
          <button
            onClick={() => window.open('https://www.commonsensemedia.org/', '_blank')}
            className="w-full py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-medium hover:opacity-90 transition-all text-sm md:text-base"
          >
            <FaInfoCircle className="inline mr-2" />
            Visit Common Sense Media (For Parents)
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By verifying your age, you agree to our Terms of Service and acknowledge our Privacy Policy.
            <br />
            <a href="https://www.connectsafely.org/controls/" className="text-blue-400 hover:underline">
              Learn about parental controls
            </a>
          </p>
        </div>
      </div>
    </div>
  );

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
      {/* Safety Warning Modal - Shows first if terms not accepted */}
      {!termsAccepted && <SafetyWarningModal />}
      
      {/* Age Verification Modal - Shows if age not verified */}
      {!ageVerified && termsAccepted && showAgeVerification && <AgeVerificationModal />}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
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
                  <p className="text-green-400 text-sm mt-2">✓ Age verified (saved)</p>
                )}
              </div>
            )}
            <button
              onClick={() => {
                setShowSafetyTips(!showSafetyTips);
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
                className="text-lg text-yellow-400 flex items-center space-x-2"
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
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-4 md:px-6 py-4 border-b border-gray-800/50 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden text-white"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                  <div className="font-medium truncate max-w-[100px]">{userProfile.username}</div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <span>Age {userProfile.age}</span>
                    {ageVerified && (
                      <>
                        <FaCheckCircle className="ml-2 text-green-400" size={10} />
                        <span className="ml-1 text-green-400 text-xs">(saved)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {ageVerified && termsAccepted && (
                <span className="text-green-400 text-sm flex items-center">
                  <FaSave className="mr-1" /> All saved
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSafetyTips(!showSafetyTips)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <FaShieldAlt />
              <span>Safety Tips</span>
            </button>
            {userProfile && (
              <button 
                onClick={onUpdateProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Enhanced Safety Warning Banner */}
      {showSafetyTips && (
        <div className="bg-gradient-to-r from-red-900/40 to-yellow-900/20 border-b border-red-500/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <FaExclamationTriangle className="text-red-400 animate-pulse" />
                <span className="text-white font-medium text-sm md:text-base">⚠️ HIGH RISK PLATFORM ⚠️</span>
                <span className="text-gray-300 text-xs md:text-sm hidden md:inline">
                  Anonymous chats may contain explicit content, predators, and scams
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {ageVerified && termsAccepted && (
                  <span className="text-green-400 text-xs md:text-sm hidden sm:inline">
                    ✓ Your preferences are saved
                  </span>
                )}
                <button
                  onClick={() => setShowSafetyTips(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Data Management Banner */}
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <FaSave className="text-green-400" />
              <div>
                <h4 className="font-bold text-sm md:text-base">Your data is saved locally</h4>
                <p className="text-gray-400 text-xs">Consent, profile, and interests are stored in your browser</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportData}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:opacity-90 text-xs md:text-sm"
              >
                Export Data
              </button>
              <button
                onClick={handleClearAllData}
                className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:opacity-90 text-xs md:text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Age and Safety Check Banner */}
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${ageVerified ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                {ageVerified ? <FaCheckCircle className="text-green-400 text-xl md:text-2xl" /> : <FaWarning className="text-yellow-400 text-xl md:text-2xl" />}
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">
                  {ageVerified ? '✅ Age Verified (18+)' : '⚠️ Age Verification Required'}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm">
                  {ageVerified 
                    ? 'Your age is verified and saved in your browser'
                    : 'You must be 18+ to access chat features'
                  }
                </p>
              </div>
            </div>
            
            {!ageVerified ? (
              <button
                onClick={() => setShowAgeVerification(true)}
                className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90 transition-all text-sm md:text-base"
              >
                Verify Age Now
              </button>
            ) : (
              <button
                onClick={handleClearAllData}
                className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                Reset Verification
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect Instantly
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Anonymous video and text chat with people who share your interests
          </p>
          
          <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-gray-800/50 rounded-full mb-8 md:mb-12">
            <FaUsers className="text-blue-400 mr-2 text-sm md:text-base" />
            <span className="text-base md:text-lg font-medium">{onlineCount.toLocaleString()}</span>
            <span className="text-gray-400 ml-2 text-sm md:text-base">people online now</span>
            <FaBell className="ml-3 md:ml-4 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Chat Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
          {/* Text Chat Card */}
          <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-blue-500' : 'border-red-500/50'}`}>
            {!ageVerified && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center p-4 md:p-6">
                  <FaLock className="text-red-400 text-3xl md:text-4xl mx-auto mb-3 md:mb-4" />
                  <h4 className="text-lg md:text-xl font-bold text-white mb-2">Age Verification Required</h4>
                  <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">You must be 18+ to use chat features</p>
                  <button
                    onClick={() => setShowAgeVerification(true)}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90 text-sm md:text-base"
                  >
                    Verify Now
                  </button>
                </div>
              </div>
            )}
            
            <div className="absolute -top-5 md:-top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg md:text-xl">
                <FaComments />
              </div>
            </div>
            
            <div className="text-center pt-6 md:pt-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Text Chat</h3>
              <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
                Connect instantly with random people through text messages
              </p>
              
              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={onStartTextChat}
                  disabled={!connected || !userProfile || !ageVerified}
                  className={`w-full py-3 md:py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center text-sm md:text-base ${
                    connected && userProfile && ageVerified
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaRandom className="mr-2" />
                  Start Random Chat
                </button>
                
                <button
                  onClick={onStartTextChat}
                  disabled={!connected || !userProfile || !ageVerified}
                  className={`w-full py-2 md:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center text-sm md:text-base ${
                    connected && userProfile && ageVerified
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
          <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-red-500' : 'border-red-500/50'}`}>
            {!ageVerified && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center p-4 md:p-6">
                  <FaLock className="text-red-400 text-3xl md:text-4xl mx-auto mb-3 md:mb-4" />
                  <h4 className="text-lg md:text-xl font-bold text-white mb-2">18+ Only</h4>
                  <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Video chat requires age verification</p>
                </div>
              </div>
            )}
            
            <div className="absolute -top-5 md:-top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-lg md:text-xl">
                <FaVideo />
              </div>
            </div>
            
            <div className="text-center pt-6 md:pt-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Video Chat</h3>
              <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
                Face-to-face video calls with random people
              </p>
              
              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={onStartVideoChat}
                  disabled={!connected || !userProfile || !ageVerified}
                  className={`w-full py-3 md:py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center text-sm md:text-base ${
                    connected && userProfile && ageVerified
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaRandom className="mr-2" />
                  Start Video Chat
                </button>
                
                <button
                  onClick={onStartVideoChat}
                  disabled={!connected || !userProfile || !ageVerified}
                  className={`w-full py-2 md:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center text-sm md:text-base ${
                    connected && userProfile && ageVerified
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
          <div className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-x-0 md:space-x-4 mb-4 md:mb-0">
                  <div className="relative mb-4 md:mb-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-700 overflow-hidden">
                      {userProfile.avatar ? (
                        <img 
                          src={userProfile.avatar} 
                          alt={userProfile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <FaUser className="text-xl md:text-2xl text-white" />
                        </div>
                      )}
                    </div>
                    {ageVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <FaCheckCircle size={10} md:size={12} />
                      </div>
                    )}
                  </div>
                  
                  <div className="md:flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold">{userProfile.username}</h3>
                      {ageVerified && (
                        <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-400 text-xs rounded-full border border-green-500/30">
                          18+ VERIFIED
                        </span>
                      )}
                      {userProfile.isPremium && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm md:text-base mb-2">
                      Age {userProfile.age} • {userProfile.gender !== 'not-specified' ? userProfile.gender : 'Not specified'} • {userProfile.chatMode === 'video' ? 'Video Chat' : 'Text Chat'}
                    </p>
                    {userProfile.bio && (
                      <p className="text-gray-300 text-sm md:text-base">{userProfile.bio}</p>
                    )}
                    {ageVerified && (
                      <p className="text-green-400 text-xs mt-2 flex items-center">
                        <FaSave className="mr-1" /> Profile saved in browser
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 md:space-x-3 w-full md:w-auto">
                  {!ageVerified && (
                    <button
                      onClick={() => setShowAgeVerification(true)}
                      className="flex-1 md:flex-none px-4 py-2 md:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90 text-sm md:text-base"
                    >
                      Verify Age
                    </button>
                  )}
                  <button
                    onClick={onUpdateProfile}
                    className="flex-1 md:flex-none px-4 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center text-sm md:text-base"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
              
              {/* User Preferences */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
                  <div className="text-xs text-gray-400 mb-1">Age Status</div>
                  <div className="font-medium text-sm md:text-base">
                    {ageVerified ? (
                      <span className="text-green-400 flex items-center">
                        ✓ Verified 18+
                        <FaSave className="ml-1" size={12} />
                      </span>
                    ) : (
                      <span className="text-yellow-400">⚠️ Not Verified</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
                  <div className="text-xs text-gray-400 mb-1">Gender Preference</div>
                  <div className="font-medium text-sm md:text-base capitalize">{userProfile.genderPreference || 'any'}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
                  <div className="text-xs text-gray-400 mb-1">Age Range</div>
                  <div className="font-medium text-sm md:text-base">{userProfile.ageRange?.min || 18} - {userProfile.ageRange?.max || 60}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
                  <div className="text-xs text-gray-400 mb-1">Chat Mode</div>
                  <div className="font-medium text-sm md:text-base flex items-center">
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
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Safety Warnings Section */}
        <div className="max-w-4xl mx-auto mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-red-900/30 to-black rounded-2xl p-6 md:p-8 border border-red-500/50">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <FaExclamationTriangle className="text-red-400 text-xl md:text-2xl" />
                <h3 className="text-lg md:text-2xl font-bold text-white">🚨 EXTREME CAUTION REQUIRED</h3>
              </div>
              <button
                onClick={() => setShowSafetyTips(!showSafetyTips)}
                className="text-gray-400 hover:text-white"
              >
                {showSafetyTips ? <FaTimes /> : <FaInfoCircle />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <div className="bg-black/50 p-3 md:p-4 rounded-xl border border-red-500/30">
                  <h4 className="font-bold text-red-300 mb-2 text-sm md:text-base">🚫 FOR MINORS:</h4>
                  <p className="text-xs md:text-sm text-gray-300">
                    This platform is NOT suitable for anyone under 18. If you are under 18, close this site immediately.
                  </p>
                </div>
                
                <div className="bg-black/50 p-3 md:p-4 rounded-xl border border-yellow-500/30">
                  <h4 className="font-bold text-yellow-300 mb-2 text-sm md:text-base">⚠️ HIGH RISK:</h4>
                  <ul className="text-xs md:text-sm text-gray-300 space-y-1">
                    <li>• Complete strangers - no identity verification</li>
                    <li>• No permanent chat logs or recordings</li>
                    <li>• May encounter illegal content</li>
                    <li>• Potential for grooming or exploitation</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 p-3 md:p-4 rounded-xl border border-blue-500/30">
                  <h4 className="font-bold text-blue-300 mb-2 text-sm md:text-base">🛡️ PROTECT YOURSELF:</h4>
                  <ul className="text-xs md:text-sm text-gray-300 space-y-1">
                    <li>• Use anonymous username (no real name)</li>
                    <li>• Disable location services</li>
                    <li>• Keep camera covered when not needed</li>
                    <li>• Never share personal information</li>
                    <li>• Report suspicious behavior immediately</li>
                  </ul>
                </div>
                
                <div className="bg-black/50 p-3 md:p-4 rounded-xl border border-green-500/30">
                  <h4 className="font-bold text-green-300 mb-2 text-sm md:text-base">📞 EMERGENCY:</h4>
                  <p className="text-xs md:text-sm text-gray-300">
                    If you feel threatened or encounter illegal content:
                    <br />
                    • Report to platform moderators
                    <br />
                    • Contact local authorities if necessary
                    <br />
                    • Visit: <a href="https://www.missingkids.org/cybertipline" className="text-blue-400 underline">CyberTipline.org</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-red-500/30">
              <div className="text-center">
                <p className="text-gray-400 text-xs md:text-sm">
                  By using this service, you acknowledge that you are 18+ and accept all risks.
                  <br />
                  <a href="https://www.connectsafely.org/safety-tips/" className="text-blue-400 hover:underline">
                    Learn more about online safety best practices
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl md:text-2xl font-bold mb-2">Your Interests</h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Add interests to find better matches (auto-saved to browser)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FaHeart className="text-red-400" />
                <span className="text-sm text-gray-400">{interests.length}/10</span>
                {interests.length > 0 && (
                  <FaSave className="text-green-400" title="Auto-saved to browser" />
                )}
              </div>
            </div>

            {/* Interest Input */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder="Add custom interest..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
              <button
                onClick={handleAddInterest}
                disabled={!newInterest.trim() || interests.length >= 10}
                className="sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm transition-all duration-200 ${
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
                      className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs md:text-sm border border-purple-500/30"
                    >
                      {interest}
                      <button 
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-1.5 md:ml-2 hover:text-white"
                      >
                        <FaTimes size={10} md:size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-green-400 text-xs mt-3 flex items-center">
                  <FaSave className="mr-1" /> Interests are auto-saved to your browser
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
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

      {/* Footer with Legal Disclaimers */}
      <footer className="border-t border-gray-800/50 mt-8 md:mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="text-center text-gray-500 text-xs md:text-sm">
            <p className="mb-2">
              <strong className="text-red-400">WARNING:</strong> This platform is for ADULTS (18+) only. 
              Users may encounter explicit content, scams, and potentially dangerous individuals.
            </p>
            <p className="mb-4">
              All chats are anonymous and not recorded. Use at your own risk.
              By using this service, you confirm you are 18+ and accept full responsibility for your interactions.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs">

  <Link to="/community-guidelines" className="text-blue-400 hover:underline">Community Guidelines</Link> | 
     <Link to="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link> | 
  <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link> |
<Link to="/contact-us" className="text-blue-400 hover:underline"> Contact Us</Link> |
              <a href="#" className="text-blue-400 hover:underline">Safety Center</a> |
              <a href="#" className="text-blue-400 hover:underline">Report Abuse</a> |
              <button onClick={handleClearAllData} className="text-red-400 hover:underline">Clear Saved Data</button>
            </div>
            <p className="mt-4 text-gray-600 text-xs md:text-sm">
              If you are under 18, please exit immediately. 
              <a href="https://www.kidshelpphone.ca" className="text-blue-400 hover:underline ml-2">
                Resources for youth
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;