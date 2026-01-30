// // components/HomeScreen.jsx - Refactored into smaller components
// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   FaUser, FaComments, FaVideo, FaUsers, 
//   FaHeart, FaPlus, FaTimes, FaArrowRight,
//   FaCrown, FaStar, FaEdit, FaShieldAlt,
//   FaRandom, FaRobot, FaExclamationTriangle,
//   FaLock, FaBan, FaInfoCircle,
//   FaCheckCircle, FaBell, FaChevronLeft,
//   FaChevronRight, FaBars, FaWindowClose,
//   FaSave, FaSmile, FaHandPeace
// } from 'react-icons/fa';
// import { IoIosWarning as FaWarning } from "react-icons/io";
// import { Link } from 'react-router-dom';

// // Constants for localStorage keys
// const STORAGE_KEYS = {
//   TERMS_ACCEPTED: 'omegle_pro_terms_accepted',
//   AGE_VERIFIED: 'omegle_pro_age_verified',
//   USER_PROFILE: 'omegle_pro_user_profile',
//   USER_INTERESTS: 'omegle_pro_user_interests',
//   WELCOME_SHOWN: 'omegle_pro_welcome_shown'
// };

// // WelcomeModal Component
// const WelcomeModal = ({ isClosingModal, setShowWelcome, setShowSafetyTips }) => (
//   <div className={`fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
//     isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
//   }`}>
//     <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500">
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
//           <FaHandPeace className="text-2xl text-white" />
//         </div>
//         <h2 className="text-2xl font-bold text-white mb-2">Welcome to Omegle Pro!</h2>
//         <p className="text-gray-300">Connect with people around the world</p>
//       </div>
      
//       <div className="space-y-4 mb-6">
//         <div className="flex items-start space-x-3">
//           <FaSmile className="text-green-400 mt-1 flex-shrink-0" />
//           <div>
//             <h4 className="font-medium text-white">Make New Friends</h4>
//             <p className="text-gray-400 text-sm">Connect with people who share your interests</p>
//           </div>
//         </div>
        
//         <div className="flex items-start space-x-3">
//           <FaShieldAlt className="text-blue-400 mt-1 flex-shrink-0" />
//           <div>
//             <h4 className="font-medium text-white">Safe & Controlled</h4>
//             <p className="text-gray-400 text-sm">Your data stays on your device. Age verification ensures safety.</p>
//           </div>
//         </div>
        
//         <div className="flex items-start space-x-3">
//           <FaSave className="text-green-400 mt-1 flex-shrink-0" />
//           <div>
//             <h4 className="font-medium text-white">Auto-Save Feature</h4>
//             <p className="text-gray-400 text-sm">Your preferences are saved locally in your browser</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex space-x-3">
//         <button
//           onClick={() => {
//             setShowWelcome(false);
//             setShowSafetyTips(true);
//           }}
//           className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-medium hover:opacity-90"
//         >
//           Safety First
//         </button>
//         <button
//           onClick={() => setShowWelcome(false)}
//           className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl font-medium hover:opacity-90"
//         >
//           Get Started
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // SafetyWarningModal Component
// const SafetyWarningModal = ({ 
//   isClosingModal, 
//   handleCloseModal, 
//   setShowSafetyTips, 
//   handleTermsAcceptance, 
//   handleClearAllData, 
//   activeSafetyTab, 
//   setActiveSafetyTab 
// }) => (
//   <div className={`fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 transition-all duration-300 overflow-y-auto ${
//     isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
//   }`}>
//     <div 
//       className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-2xl w-full border-2 border-blue-500 relative my-auto"
//     >
//       <div className="absolute top-4 right-4">
//         <button
//           onClick={() => handleCloseModal(() => setShowSafetyTips(false))}
//           className="text-gray-400 hover:text-white transition-colors"
//         >
//           <FaTimes size={24} />
//         </button>
//       </div>
      
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
//           <FaShieldAlt className="text-2xl text-white" />
//         </div>
//         <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Safety First</h2>
//         <p className="text-gray-400">Important information to keep you safe</p>
//       </div>
      
//       {/* Safety Tabs */}
//       <div className="flex space-x-2 mb-6 overflow-x-auto">
//         {['quick-tips', 'age-verification', 'data-privacy', 'emergency'].map(tab => (
//           <button
//             key={tab}
//             onClick={() => setActiveSafetyTab(tab)}
//             className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
//               activeSafetyTab === tab
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//             }`}
//           >
//             {tab === 'quick-tips' && 'Quick Tips'}
//             {tab === 'age-verification' && 'Age 18+'}
//             {tab === 'data-privacy' && 'Privacy'}
//             {tab === 'emergency' && 'Emergency'}
//           </button>
//         ))}
//       </div>
      
//       <div 
//         className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2"
//       >
//         {activeSafetyTab === 'quick-tips' && (
//           <div className="space-y-4">
//             <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
//               <h3 className="text-lg font-bold text-blue-300 mb-2">Essential Safety Tips</h3>
//               <ul className="space-y-2 text-gray-300">
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">✓</span>
//                   <span>Keep personal information private</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">✓</span>
//                   <span>Be respectful to others</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">✓</span>
//                   <span>Report inappropriate behavior</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">✓</span>
//                   <span>Use common sense in conversations</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
//               <h4 className="font-bold text-green-300 mb-2">Good to Know</h4>
//               <p className="text-gray-300">
//                 All chats are anonymous. No registration required. Your data is stored only on your device.
//               </p>
//             </div>
//           </div>
//         )}
        
//         {activeSafetyTab === 'age-verification' && (
//           <div className="space-y-4">
//             <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
//               <h3 className="text-lg font-bold text-yellow-300 mb-2">Age Restriction</h3>
//               <p className="text-gray-300">
//                 This platform is intended for users 18 years and older. Age verification helps ensure a safer environment for everyone.
//               </p>
//             </div>
            
//             <div className="bg-gray-800/50 p-4 rounded-lg">
//               <h4 className="font-bold text-white mb-2">Why we ask for age verification:</h4>
//               <ul className="space-y-1 text-gray-300">
//                 <li>• Maintain age-appropriate conversations</li>
//                 <li>• Filter out underage users</li>
//                 <li>• Provide better content matching</li>
//                 <li>• Comply with legal requirements</li>
//               </ul>
//             </div>
//           </div>
//         )}
        
//         {activeSafetyTab === 'data-privacy' && (
//           <div className="space-y-4">
//             <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
//               <h3 className="text-lg font-bold text-green-300 mb-2">Your Privacy Matters</h3>
//               <p className="text-gray-300">
//                 We use local storage to save your preferences on your device only. No data is sent to our servers.
//               </p>
//             </div>
            
//             <div className="bg-gray-800/50 p-4 rounded-lg">
//               <div className="flex items-center space-x-3 mb-3">
//                 <FaSave className="text-green-400" />
//                 <div>
//                   <h4 className="font-bold text-white">Locally Stored Data</h4>
//                   <p className="text-gray-400 text-sm">Stays on your device</p>
//                 </div>
//               </div>
//               <ul className="space-y-1 text-gray-300 text-sm">
//                 <li>• Age verification status</li>
//                 <li>• Your interests and preferences</li>
//                 <li>• Profile information</li>
//                 <li>• Terms acceptance</li>
//               </ul>
//             </div>
//           </div>
//         )}
        
//         {activeSafetyTab === 'emergency' && (
//           <div className="space-y-4">
//             <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
//               <h3 className="text-lg font-bold text-red-300 mb-2">Need Help?</h3>
//               <p className="text-gray-300">
//                 If you encounter illegal content or feel threatened, here are resources:
//               </p>
//             </div>
            
//             <div className="space-y-2">
//               <a 
//                 href="https://www.missingkids.org/cybertipline" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
//               >
//                 <div className="font-medium text-white">CyberTipline</div>
//                 <div className="text-gray-400 text-sm">Report online exploitation</div>
//               </a>
              
//               <a 
//                 href="https://www.connectsafely.org/safety-tips/" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
//               >
//                 <div className="font-medium text-white">ConnectSafely Guides</div>
//                 <div className="text-gray-400 text-sm">Online safety resources</div>
//               </a>
//             </div>
//           </div>
//         )}
//       </div>
      
//       <div className="flex flex-col sm:flex-row gap-3">
//         <button
//           onClick={handleTermsAcceptance}
//           className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90"
//         >
//           <FaCheckCircle className="inline mr-2" />
//           I Understand & Continue
//         </button>
//         <button
//           onClick={handleClearAllData}
//           className="sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
//         >
//           Exit
//         </button>
//       </div>
      
//       <p className="text-xs text-gray-500 text-center mt-4">
//         By continuing, you agree to our Terms and acknowledge you are 18+
//       </p>
//     </div>
//   </div>
// );

// // AgeVerificationModal Component
// const AgeVerificationModal = ({ 
//   isClosingModal, 
//   confirmedOver18, 
//   setConfirmedOver18, 
//   handleAgeVerification, 
//   ageVerified 
// }) => (
//   <div className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
//     isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
//   }`}>
//     <div 
//       className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500"
//     >
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
//           <FaLock className="text-2xl text-white" />
//         </div>
//         <h2 className="text-2xl font-bold text-white mb-2">Age Verification</h2>
//         <p className="text-gray-400">Please confirm you are 18 or older</p>
//       </div>

//       <div className="space-y-6 mb-6">
//         <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
//           <p className="text-gray-300 text-sm">
//             This platform is designed for adult conversations. Age verification helps maintain a safe environment.
//           </p>
//         </div>

//         <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
//           <input
//             type="checkbox"
//             id="ageConfirm"
//             checked={confirmedOver18}
//             onChange={(e) => setConfirmedOver18(e.target.checked)}
//             className="mt-1 w-5 h-5 flex-shrink-0"
//           />
//           <label htmlFor="ageConfirm" className="text-white text-sm">
//             I confirm that I am 18 years of age or older
//           </label>
//         </div>
        
//         <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
//           <p className="text-green-300 text-sm">
//             <FaSave className="inline mr-2" />
//             Your verification will be saved locally in your browser
//           </p>
//         </div>
//       </div>

//       <div className="space-y-3">
//         <button
//           onClick={handleAgeVerification}
//           disabled={!confirmedOver18}
//           className={`w-full py-4 rounded-xl font-bold transition-all ${
//             confirmedOver18
//               ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90'
//               : 'bg-gray-700 cursor-not-allowed'
//           }`}
//         >
//           <FaCheckCircle className="inline mr-2" />
//           Verify & Continue
//         </button>
        
//         <button
//           onClick={() => window.open('https://www.commonsensemedia.org/', '_blank')}
//           className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors text-sm"
//         >
//           <FaInfoCircle className="inline mr-2" />
//           Family Safety Resources
//         </button>

//         <p className="text-xs text-gray-500 text-center mt-4">
//           Required for chat access. Verification stored locally.
//         </p>
//       </div>
//     </div>
//   </div>
// );

// // MobileMenu Component
// const MobileMenu = ({ 
//   showMobileMenu, 
//   setShowMobileMenu, 
//   userProfile, 
//   ageVerified, 
//   setShowSafetyTips, 
//   onUpdateProfile, 
//   setShowAgeVerification, 
//   handleExportData, 
//   handleClearAllData 
// }) => (
//   <div className="fixed inset-0 bg-black/90 z-40 md:hidden overflow-y-auto">
//     <div className="absolute top-4 right-4">
//       <button
//         onClick={() => setShowMobileMenu(false)}
//         className="text-white text-2xl"
//       >
//         <FaTimes />
//       </button>
//     </div>
//     <div className="flex flex-col items-center justify-center min-h-full p-8 space-y-6">
//       {userProfile && (
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-2xl">
//             {userProfile.username?.charAt(0) || 'U'}
//           </div>
//           <h3 className="text-xl font-bold text-white">{userProfile.username}</h3>
//           <p className="text-gray-400">Age {userProfile.age}</p>
//           {ageVerified && (
//             <p className="text-green-400 text-sm mt-2">✓ Age verified</p>
//           )}
//         </div>
//       )}
//       <button
//         onClick={() => {
//           setShowSafetyTips(true);
//           setShowMobileMenu(false);
//         }}
//         className="text-lg text-white flex items-center space-x-2"
//       >
//         <FaShieldAlt />
//         <span>Safety Tips</span>
//       </button>
//       {userProfile && (
//         <button 
//           onClick={() => {
//             onUpdateProfile();
//             setShowMobileMenu(false);
//           }}
//           className="text-lg text-white flex items-center space-x-2"
//         >
//           <FaEdit />
//           <span>Edit Profile</span>
//         </button>
//       )}
//       {!ageVerified && (
//         <button
//           onClick={() => {
//             setShowAgeVerification(true);
//             setShowMobileMenu(false);
//           }}
//           className="text-lg text-blue-400 flex items-center space-x-2"
//         >
//           <FaLock />
//           <span>Verify Age</span>
//         </button>
//       )}
//       <button
//         onClick={handleExportData}
//         className="text-lg text-blue-400 flex items-center space-x-2"
//       >
//         <FaSave />
//         <span>Export Data</span>
//       </button>
//       <button
//         onClick={handleClearAllData}
//         className="text-lg text-red-400 flex items-center space-x-2"
//       >
//         <FaTimes />
//         <span>Clear Data</span>
//       </button>
//     </div>
//   </div>
// );

// // Header Component
// const Header = ({ 
//   userProfile, 
//   ageVerified, 
//   setShowMobileMenu, 
//   setShowSafetyTips, 
//   onUpdateProfile, 
//   termsAccepted 
// }) => (
//   <header className="px-4 md:px-6 py-4 border-b border-gray-800/50 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-30">
//     <div className="max-w-6xl mx-auto flex justify-between items-center">
//       <div className="flex items-center space-x-2 md:space-x-4">
//         <button
//           onClick={() => setShowMobileMenu(true)}
//           className="md:hidden text-white"
//         >
//           <FaBars size={20} />
//         </button>
//         <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//           Omegle Pro
//         </h1>
//         {userProfile && (
//           <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
//             <div className="relative">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs">
//                 {userProfile.username?.charAt(0) || 'U'}
//               </div>
//               {userProfile.isPremium && (
//                 <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
//                   <FaCrown size={8} />
//                 </div>
//               )}
//             </div>
//             <div className="text-sm">
//               <div className="font-medium truncate max-w-[100px]">{userProfile.username}</div>
//               <div className="text-xs text-gray-400 flex items-center">
//                 <span>Age {userProfile.age}</span>
//                 {ageVerified && (
//                   <FaCheckCircle className="ml-2 text-green-400" size={10} />
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
      
//       <div className="hidden md:flex items-center space-x-3">
//         <div className="flex items-center space-x-2">
//           {ageVerified && termsAccepted && (
//             <span className="text-green-400 text-sm flex items-center">
//               <FaSave className="mr-1" /> All saved
//             </span>
//           )}
//         </div>
//         <button
//           onClick={() => setShowSafetyTips(true)}
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
//         >
//           <FaShieldAlt />
//           <span>Safety Tips</span>
//         </button>
//         {userProfile && (
//           <button 
//             onClick={onUpdateProfile}
//             className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
//           >
//             <FaEdit />
//             <span>Edit Profile</span>
//           </button>
//         )}
//       </div>
//     </div>
//   </header>
// );

// // SafetyStatusBanner Component
// const SafetyStatusBanner = ({ ageVerified, setShowSafetyTips }) => (
//   <div className="bg-gradient-to-r from-blue-900/20 to-gray-900 border-b border-blue-500/30">
//     <div className="max-w-6xl mx-auto px-4 md:px-6 py-2">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           {ageVerified ? (
//             <>
//               <FaCheckCircle className="text-green-400" />
//               <span className="text-white text-sm">Age verified • </span>
//             </>
//           ) : (
//             <>
//               <FaWarning className="text-yellow-400" />
//               <span className="text-white text-sm">Age verification required • </span>
//             </>
//           )}
//           <span className="text-gray-300 text-sm">Your data is saved locally</span>
//         </div>
//         <button
//           onClick={() => setShowSafetyTips(true)}
//           className="text-blue-400 hover:text-blue-300 text-sm"
//         >
//           Safety info
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // HeroSection Component
// const HeroSection = ({ onlineCount }) => (
//   <div className="text-center mb-12 md:mb-16">
//     <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
//       <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//         Connect with the World
//       </span>
//     </h1>
//     <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
//       Anonymous video and text chat with people who share your interests
//     </p>
    
//     <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full mb-8 md:mb-12">
//       <FaUsers className="text-blue-400 mr-2" />
//       <span className="text-lg font-medium">{onlineCount.toLocaleString()}</span>
//       <span className="text-gray-400 ml-2">people online now</span>
//     </div>
//   </div>
// );

// // QuickAccessCards Component
// const QuickAccessCards = ({ 
//   ageVerified, 
//   setShowAgeVerification, 
//   connected, 
//   userProfile, 
//   onStartTextChat, 
//   onStartVideoChat 
// }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
//     {/* Text Chat Card */}
//     <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-blue-500 hover:scale-[1.02]' : 'border-yellow-500/50'}`}>
//       {!ageVerified && (
//         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
//           <div className="text-center p-6">
//             <FaLock className="text-yellow-400 text-4xl mx-auto mb-4" />
//             <h4 className="text-xl font-bold text-white mb-2">Verify Age First</h4>
//             <p className="text-gray-300 mb-4">Quick age check required for chat access</p>
//             <button
//               onClick={() => setShowAgeVerification(true)}
//               className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90"
//             >
//               Verify Now
//             </button>
//           </div>
//         </div>
//       )}
      
//       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
//         <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
//           <FaComments />
//         </div>
//       </div>
      
//       <div className="text-center pt-4">
//         <h3 className="text-2xl font-bold mb-4">Text Chat</h3>
//         <p className="text-gray-400 mb-6">
//           Connect instantly with random people through text messages
//         </p>
        
//         <button
//           onClick={onStartTextChat}
//           disabled={!connected || !userProfile || !ageVerified}
//           className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
//             connected && userProfile && ageVerified
//               ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 hover:scale-105'
//               : 'bg-gray-700 cursor-not-allowed'
//           }`}
//         >
//           <FaRandom className="inline mr-2" />
//           Start Random Chat
//         </button>
//       </div>
//     </div>

//     {/* Video Chat Card */}
//     <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-red-500 hover:scale-[1.02]' : 'border-yellow-500/50'}`}>
//       {!ageVerified && (
//         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
//           <div className="text-center p-6">
//             <FaLock className="text-yellow-400 text-4xl mx-auto mb-4" />
//             <h4 className="text-xl font-bold text-white mb-2">Age Verified Only</h4>
//             <p className="text-gray-300 mb-4">Video chat requires age verification</p>
//           </div>
//         </div>
//       )}
      
//       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
//         <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xl">
//           <FaVideo />
//         </div>
//       </div>
      
//       <div className="text-center pt-4">
//         <h3 className="text-2xl font-bold mb-4">Video Chat</h3>
//         <p className="text-gray-400 mb-6">
//           Face-to-face video calls with random people
//         </p>
        
//         <button
//           onClick={onStartVideoChat}
//           disabled={!connected || !userProfile || !ageVerified}
//           className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
//             connected && userProfile && ageVerified
//               ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 hover:scale-105'
//               : 'bg-gray-700 cursor-not-allowed'
//           }`}
//         >
//           <FaRandom className="inline mr-2" />
//           Start Video Chat
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // ProfileSummary Component
// const ProfileSummary = ({ 
//   userProfile, 
//   ageVerified, 
//   setShowAgeVerification, 
//   onUpdateProfile 
// }) => (
//   <div className="max-w-4xl mx-auto mb-12">
//     <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
//         <div className="flex items-center space-x-4 mb-4 md:mb-0">
//           <div className="relative">
//             <div className="w-20 h-20 rounded-full border-4 border-gray-700 overflow-hidden">
//               {userProfile.avatar ? (
//                 <img 
//                   src={userProfile.avatar} 
//                   alt={userProfile.username}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
//                   <FaUser className="text-2xl text-white" />
//                 </div>
//               )}
//             </div>
//             {ageVerified && (
//               <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
//                 <FaCheckCircle size={12} />
//               </div>
//             )}
//           </div>
          
//           <div>
//             <div className="flex flex-wrap items-center gap-2 mb-2">
//               <h3 className="text-2xl font-bold">{userProfile.username}</h3>
//               {ageVerified && (
//                 <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-400 text-xs rounded-full border border-green-500/30">
//                   18+ VERIFIED
//                 </span>
//               )}
//             </div>
//             <p className="text-gray-400">
//               Age {userProfile.age} • {userProfile.gender !== 'not-specified' ? userProfile.gender : 'Not specified'}
//             </p>
//             {userProfile.bio && (
//               <p className="text-gray-300 mt-2">{userProfile.bio}</p>
//             )}
//           </div>
//         </div>
        
//         <div className="flex space-x-3 w-full md:w-auto">
//           {!ageVerified && (
//             <button
//               onClick={() => setShowAgeVerification(true)}
//               className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90"
//             >
//               Verify Age
//             </button>
//           )}
//           <button
//             onClick={onUpdateProfile}
//             className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center"
//           >
//             <FaEdit className="mr-2" />
//             Edit Profile
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // CollapsibleSafetySection Component
// const CollapsibleSafetySection = ({ 
//   showSafetyTips, 
//   setShowSafetyTips, 
//   handleClearAllData 
// }) => (
//   <div className="max-w-4xl mx-auto mb-8">
//     <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-700">
//       <button
//         onClick={() => setShowSafetyTips(!showSafetyTips)}
//         className="flex items-center justify-between w-full text-left"
//       >
//         <div className="flex items-center space-x-3">
//           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showSafetyTips ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
//             <FaShieldAlt className={`${showSafetyTips ? 'text-blue-400' : 'text-gray-400'}`} />
//           </div>
//           <div>
//             <h3 className="font-bold text-lg">Safety Information</h3>
//             <p className="text-gray-400 text-sm">Important guidelines and resources</p>
//           </div>
//         </div>
//         <FaChevronRight className={`transition-transform ${showSafetyTips ? 'rotate-90' : ''}`} />
//       </button>
      
//       {showSafetyTips && (
//         <div className="mt-6 pt-6 border-t border-gray-700">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="font-bold text-blue-300 mb-3">Quick Safety Tips</h4>
//               <ul className="space-y-2 text-gray-300">
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
//                   <span>Keep personal information private</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
//                   <span>Be respectful to others</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
//                   <span>Report inappropriate behavior</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-bold text-green-300 mb-3">Your Privacy</h4>
//               <div className="bg-gray-800/50 p-4 rounded-lg">
//                 <div className="flex items-center space-x-2 mb-2">
//                   <FaSave className="text-green-400" />
//                   <span className="font-medium">Data stored locally</span>
//                 </div>
//                 <p className="text-gray-400 text-sm">
//                   Your age verification, profile, and interests are saved only on your device. No data is sent to servers.
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-6">
//             <button
//               onClick={handleClearAllData}
//               className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
//             >
//               Clear All Stored Data
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   </div>
// );

// // InterestsSection Component
// const InterestsSection = ({ 
//   interests, 
//   newInterest, 
//   setNewInterest, 
//   handleAddInterest, 
//   handleRemoveInterest, 
//   handleAddCommonInterest 
// }) => {
//   const commonInterests = [
//     'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
//     'Travel', 'Food', 'Art', 'Books', 'Fitness',
//     'Science', 'Fashion', 'Photography', 'Animals'
//   ];

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
//         <div className="mb-6">
//           <h3 className="text-2xl font-bold mb-2">Your Interests</h3>
//           <p className="text-gray-400">
//             Add interests to find better matches (auto-saved to browser)
//           </p>
//         </div>

//         {/* Interest Input */}
//         <div className="flex space-x-3 mb-6">
//           <input
//             type="text"
//             value={newInterest}
//             onChange={(e) => setNewInterest(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
//             placeholder="Add custom interest..."
//             className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             onClick={handleAddInterest}
//             disabled={!newInterest.trim() || interests.length >= 10}
//             className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <FaPlus />
//           </button>
//         </div>

//         {/* Selected Interests */}
//         {interests.length > 0 && (
//           <div className="mb-8">
//             <h4 className="text-sm font-medium text-gray-400 mb-3">Selected Interests</h4>
//             <div className="flex flex-wrap gap-2">
//               {interests.map(interest => (
//                 <span 
//                   key={interest} 
//                   className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
//                 >
//                   {interest}
//                   <button 
//                     onClick={() => handleRemoveInterest(interest)}
//                     className="ml-2 hover:text-white"
//                   >
//                     <FaTimes size={12} />
//                   </button>
//                 </span>
//               ))}
//             </div>
//             <p className="text-green-400 text-sm mt-3 flex items-center">
//               <FaSave className="mr-1" /> Auto-saved to your browser
//             </p>
//           </div>
//         )}

//         {/* Common Interests */}
//         <div>
//           <h4 className="text-sm font-medium text-gray-400 mb-3">Popular Interests</h4>
//           <div className="flex flex-wrap gap-2">
//             {commonInterests.map(interest => (
//               <button
//                 key={interest}
//                 onClick={() => handleAddCommonInterest(interest)}
//                 disabled={interests.includes(interest) || interests.length >= 10}
//                 className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
//                   interests.includes(interest)
//                     ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
//                     : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                 }`}
//               >
//                 {interest}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ResourcesSection Component
// const ResourcesSection = () => (
//   <div className="max-w-4xl mx-auto mt-6 md:mt-8">
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//       <a href="https://www.connectsafely.org/controls/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-blue-500/30 hover:border-blue-500 transition-colors">
//         <h4 className="font-bold text-blue-300 mb-2 text-sm md:text-base">Parental Controls</h4>
//         <p className="text-xs md:text-sm text-gray-400">Tools to help parents monitor and restrict online access</p>
//       </a>
      
//       <a href="https://www.commonsensemedia.org/articles/online-safety" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-green-500/30 hover:border-green-500 transition-colors">
//         <h4 className="font-bold text-green-300 mb-2 text-sm md:text-base">Online Safety Guide</h4>
//         <p className="text-xs md:text-sm text-gray-400">Comprehensive guide to staying safe online</p>
//       </a>
      
//       <a href="https://www.missingkids.org/cybertipline" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-900/30 to-gray-900 rounded-xl p-4 md:p-6 border border-red-500/30 hover:border-red-500 transition-colors">
//         <h4 className="font-bold text-red-300 mb-2 text-sm md:text-base">Report Issues</h4>
//         <p className="text-xs md:text-sm text-gray-400">Report illegal or suspicious activity to authorities</p>
//       </a>
//     </div>
//   </div>
// );

// // Footer Component
// const Footer = ({ handleClearAllData }) => (
//   <footer className="border-t border-gray-800/50 mt-8 md:mt-12">
//     <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
//       <div className="text-center text-gray-500 text-xs md:text-sm">
//         <p className="mb-2">
//           <strong className="text-red-400">WARNING:</strong> This platform is for ADULTS (18+) only. 
//           Users may encounter explicit content, scams, and potentially dangerous individuals.
//         </p>
//         <p className="mb-4">
//           All chats are anonymous and not recorded. Use at your own risk.
//           By using this service, you confirm you are 18+ and accept full responsibility for your interactions.
//         </p>
//         <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs">
//           <Link to="/community-guidelines" className="text-blue-400 hover:underline">Community Guidelines</Link> | 
//           <Link to="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link> | 
//           <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link> |
//           <Link to="/contact-us" className="text-blue-400 hover:underline"> Contact Us</Link> |
//           <a href="#" className="text-blue-400 hover:underline">Safety Center</a> |
//           <a href="#" className="text-blue-400 hover:underline">Report Abuse</a> |
//           <button onClick={handleClearAllData} className="text-red-400 hover:underline">Clear Saved Data</button>
//         </div>
//         <p className="mt-4 text-gray-600 text-xs md:text-sm">
//           If you are under 18, please exit immediately. 
//           <a href="https://www.kidshelpphone.ca" className="text-blue-400 hover:underline ml-2">
//             Resources for youth
//           </a>
//         </p>
//       </div>
//     </div>
//   </footer>
// );

// // Main HomeScreen Component
// const HomeScreen = ({ 
//   userProfile, 
//   onlineCount, 
//   interests, 
//   onUpdateInterests,
//   onUpdateProfile,
//   onStartTextChat,
//   onStartVideoChat,
//   connected,
//   currentMode,
//   hasAcceptedTerms = false,
//   onAcceptTerms,
//   hasVerifiedAge = false,
//   onVerifyAge
// }) => {
//   const [newInterest, setNewInterest] = useState('');
//   const [showAgeVerification, setShowAgeVerification] = useState(false);
//   const [showSafetyTips, setShowSafetyTips] = useState(false);
//   const [ageVerified, setAgeVerified] = useState(hasVerifiedAge);
//   const [termsAccepted, setTermsAccepted] = useState(hasAcceptedTerms);
//   const [confirmedOver18, setConfirmedOver18] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [isClosingModal, setIsClosingModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showWelcome, setShowWelcome] = useState(false);
//   const [activeSafetyTab, setActiveSafetyTab] = useState('quick-tips');

//   const modalRef = useRef(null);
//   const safetyModalRef = useRef(null);
//   const ageModalRef = useRef(null);
//   const safetyModalContentRef = useRef(null);
//   const ageModalContentRef = useRef(null);

//   // Load stored data on component mount
//   useEffect(() => {
//     const loadStoredData = () => {
//       try {
//         const storedTerms = localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED);
//         const storedAge = localStorage.getItem(STORAGE_KEYS.AGE_VERIFIED);
//         const storedWelcome = localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN);
        
//         if (storedTerms === 'true') {
//           setTermsAccepted(true);
//           onAcceptTerms?.(true);
//         }
        
//         if (storedAge === 'true') {
//           setAgeVerified(true);
//           onVerifyAge?.(true);
//         }
        
//         // Show welcome only on first visit
//         if (storedWelcome !== 'true') {
//           setShowWelcome(true);
//           localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, 'true');
//         }
        
//         // Load user profile if exists
//         const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
//         if (storedProfile) {
//           try {
//             const parsedProfile = JSON.parse(storedProfile);
//             // You might want to pass this to parent component
//             // onUpdateProfile?.(parsedProfile);
//           } catch (e) {
//             console.error('Error parsing stored profile:', e);
//           }
//         }
        
//         // Load interests if exists
//         const storedInterests = localStorage.getItem(STORAGE_KEYS.USER_INTERESTS);
//         if (storedInterests) {
//           try {
//             const parsedInterests = JSON.parse(storedInterests);
//             onUpdateInterests?.(parsedInterests);
//           } catch (e) {
//             console.error('Error parsing stored interests:', e);
//           }
//         }
//       } catch (error) {
//         console.error('Error loading stored data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     loadStoredData();
//   }, [onAcceptTerms, onVerifyAge, onUpdateInterests]);

//   useEffect(() => {
//     // Show age verification modal if age is not verified
//     if (!ageVerified && !isLoading) {
//       // Small delay for better UX
//       setTimeout(() => {
//         setShowAgeVerification(true);
//       }, 1000);
//     }
//   }, [ageVerified, isLoading]);

//   // Save interests to localStorage when they change
//   useEffect(() => {
//     if (interests && interests.length > 0) {
//       try {
//         localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(interests));
//       } catch (error) {
//         console.error('Error saving interests to localStorage:', error);
//       }
//     }
//   }, [interests]);

//   // Save user profile to localStorage when it changes
//   useEffect(() => {
//     if (userProfile) {
//       try {
//         localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
//       } catch (error) {
//         console.error('Error saving profile to localStorage:', error);
//       }
//     }
//   }, [userProfile]);

//   const handleAddInterest = () => {
//     if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
//       const updatedInterests = [...interests, newInterest.trim()];
//       onUpdateInterests(updatedInterests);
      
//       // Auto-save to localStorage
//       try {
//         localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(updatedInterests));
//       } catch (error) {
//         console.error('Error saving interests:', error);
//       }
      
//       setNewInterest('');
//     }
//   };

//   const handleRemoveInterest = (interest) => {
//     const updatedInterests = interests.filter(i => i !== interest);
//     onUpdateInterests(updatedInterests);
    
//     // Auto-save to localStorage
//     try {
//       localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(updatedInterests));
//     } catch (error) {
//       console.error('Error saving interests:', error);
//     }
//   };

//   const handleAddCommonInterest = (interest) => {
//     if (!interests.includes(interest) && interests.length < 10) {
//       const updatedInterests = [...interests, interest];
//       onUpdateInterests(updatedInterests);
      
//       // Auto-save to localStorage
//       try {
//         localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(updatedInterests));
//       } catch (error) {
//         console.error('Error saving interests:', error);
//       }
//     }
//   };

//   const handleAgeVerification = () => {
//     if (confirmedOver18) {
//       setAgeVerified(true);
//       setShowAgeVerification(false);
      
//       // Save to localStorage
//       try {
//         localStorage.setItem(STORAGE_KEYS.AGE_VERIFIED, 'true');
//       } catch (error) {
//         console.error('Error saving age verification:', error);
//       }
      
//       onVerifyAge?.(true);
//     }
//   };

//   const handleTermsAcceptance = () => {
//     setTermsAccepted(true);
    
//     // Save to localStorage
//     try {
//       localStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, 'true');
//     } catch (error) {
//       console.error('Error saving terms acceptance:', error);
//     }
    
//     onAcceptTerms?.(true);
//   };

//   const handleClearAllData = () => {
//     if (window.confirm('Are you sure you want to clear all stored data? This will reset your profile, interests, and consent.')) {
//       try {
//         localStorage.removeItem(STORAGE_KEYS.TERMS_ACCEPTED);
//         localStorage.removeItem(STORAGE_KEYS.AGE_VERIFIED);
//         localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
//         localStorage.removeItem(STORAGE_KEYS.USER_INTERESTS);
//         localStorage.removeItem(STORAGE_KEYS.WELCOME_SHOWN);
        
//         setTermsAccepted(false);
//         setAgeVerified(false);
//         setShowAgeVerification(true);
        
//         // Reset parent state if callbacks exist
//         onAcceptTerms?.(false);
//         onVerifyAge?.(false);
//         onUpdateInterests?.([]);
        
//         alert('All data has been cleared. Page will refresh.');
//         setTimeout(() => window.location.reload(), 1000);
//       } catch (error) {
//         console.error('Error clearing localStorage:', error);
//         alert('Error clearing data. Please try again.');
//       }
//     }
//   };

//   const handleExportData = () => {
//     const data = {
//       termsAccepted: localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED) === 'true',
//       ageVerified: localStorage.getItem(STORAGE_KEYS.AGE_VERIFIED) === 'true',
//       profile: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || '{}'),
//       interests: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INTERESTS) || '[]')
//     };
    
//     const dataStr = JSON.stringify(data, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
//     const exportFileDefaultName = 'omegle_pro_data.json';
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const handleCloseModal = (setter) => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setter(false);
//       setIsClosingModal(false);
//     }, 300);
//   };

//   // Show loading state while checking localStorage
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-400">Loading your preferences...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
//       {/* Welcome Modal */}
//       {showWelcome && (
//         <WelcomeModal 
//           isClosingModal={isClosingModal} 
//           setShowWelcome={setShowWelcome} 
//           setShowSafetyTips={setShowSafetyTips} 
//         />
//       )}
      
//       {/* Safety Tips Modal */}
//       {showSafetyTips && (
//         <SafetyWarningModal 
//           isClosingModal={isClosingModal}
//           handleCloseModal={handleCloseModal}
//           setShowSafetyTips={setShowSafetyTips}
//           handleTermsAcceptance={handleTermsAcceptance}
//           handleClearAllData={handleClearAllData}
//           activeSafetyTab={activeSafetyTab}
//           setActiveSafetyTab={setActiveSafetyTab}
//         />
//       )}
      
//       {/* Age Verification Modal */}
//       {!ageVerified && showAgeVerification && (
//         <AgeVerificationModal 
//           isClosingModal={isClosingModal}
//           confirmedOver18={confirmedOver18}
//           setConfirmedOver18={setConfirmedOver18}
//           handleAgeVerification={handleAgeVerification}
//           ageVerified={ageVerified}
//         />
//       )}

//       {/* Mobile Menu Overlay */}
//       {showMobileMenu && (
//         <MobileMenu 
//           showMobileMenu={showMobileMenu}
//           setShowMobileMenu={setShowMobileMenu}
//           userProfile={userProfile}
//           ageVerified={ageVerified}
//           setShowSafetyTips={setShowSafetyTips}
//           onUpdateProfile={onUpdateProfile}
//           setShowAgeVerification={setShowAgeVerification}
//           handleExportData={handleExportData}
//           handleClearAllData={handleClearAllData}
//         />
//       )}

//       {/* Header */}
//       <Header 
//         userProfile={userProfile}
//         ageVerified={ageVerified}
//         setShowMobileMenu={setShowMobileMenu}
//         setShowSafetyTips={setShowSafetyTips}
//         onUpdateProfile={onUpdateProfile}
//         termsAccepted={termsAccepted}
//       />

//       {/* Safety Status Banner */}
//       <SafetyStatusBanner 
//         ageVerified={ageVerified}
//         setShowSafetyTips={setShowSafetyTips}
//       />

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
//         {/* Hero Section */}
//         <HeroSection onlineCount={onlineCount} />

//         {/* Quick Access Cards */}
//         <QuickAccessCards 
//           ageVerified={ageVerified}
//           setShowAgeVerification={setShowAgeVerification}
//           connected={connected}
//           userProfile={userProfile}
//           onStartTextChat={onStartTextChat}
//           onStartVideoChat={onStartVideoChat}
//         />

//         {/* Profile Summary - Only show if profile exists */}
//         {userProfile && (
//           <ProfileSummary 
//             userProfile={userProfile}
//             ageVerified={ageVerified}
//             setShowAgeVerification={setShowAgeVerification}
//             onUpdateProfile={onUpdateProfile}
//           />
//         )}

//         {/* Collapsible Safety Section */}
//         <CollapsibleSafetySection 
//           showSafetyTips={showSafetyTips}
//           setShowSafetyTips={setShowSafetyTips}
//           handleClearAllData={handleClearAllData}
//         />

//         {/* Interests Section */}
//         <InterestsSection 
//           interests={interests}
//           newInterest={newInterest}
//           setNewInterest={setNewInterest}
//           handleAddInterest={handleAddInterest}
//           handleRemoveInterest={handleRemoveInterest}
//           handleAddCommonInterest={handleAddCommonInterest}
//         />

//         {/* Resources Section */}
//         <ResourcesSection />
//       </div>

//       {/* Footer */}
//       <Footer handleClearAllData={handleClearAllData} />
//     </div>
//   );
// };

// export default HomeScreen;


import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, FaComments, FaVideo, FaUsers, 
  FaHeart, FaPlus, FaTimes, FaArrowRight,
  FaCrown, FaStar, FaEdit, FaShieldAlt,
  FaRandom, FaRobot, FaExclamationTriangle,
  FaLock, FaBan, FaInfoCircle,
  FaCheckCircle, FaBell, FaChevronLeft,
  FaChevronRight, FaBars, FaWindowClose,
  FaSave, FaSmile, FaHandPeace
} from 'react-icons/fa';
import { IoIosWarning as FaWarning } from "react-icons/io";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Constants for localStorage keys
const STORAGE_KEYS = {
  TERMS_ACCEPTED: 'omegle_pro_terms_accepted',
  AGE_VERIFIED: 'omegle_pro_age_verified',
  USER_PROFILE: 'omegle_pro_user_profile',
  USER_INTERESTS: 'omegle_pro_user_interests',
  WELCOME_SHOWN: 'omegle_pro_welcome_shown'
};

// SEO Head Component
const SEOHead = () => (
  <Helmet>
    <title>Omegle Pro - Anonymous Video & Text Chat Platform</title>
    <meta name="description" content="Connect with people worldwide through anonymous video and text chat. Safe, private conversations with age verification and interest-based matching." />
    <meta name="keywords" content="video chat, text chat, anonymous chat, meet new people, online friends, random chat, omegle alternative" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Omegle Pro - Connect with the World" />
    <meta property="og:description" content="Anonymous video and text chat with people who share your interests" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://omeglepro.example.com" />
    <link rel="canonical" href="https://omeglepro.example.com" />
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Omegle Pro",
        "description": "Anonymous video and text chat platform connecting people worldwide",
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "audience": {
          "@type": "PeopleAudience",
          "suggestedMinAge": 18
        }
      })}
    </script>
  </Helmet>
);

// WelcomeModal Component
const WelcomeModal = ({ isClosingModal, setShowWelcome, setShowSafetyTips }) => (
  <div 
    role="dialog" 
    aria-labelledby="welcome-title" 
    aria-describedby="welcome-description"
    className={`fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}
  >
    <article className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500">
      <header className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <FaHandPeace className="text-2xl text-white" />
        </div>
        <h2 id="welcome-title" className="text-2xl font-bold text-white mb-2">Welcome to Omegle Pro!</h2>
        <p id="welcome-description" className="text-gray-300">Connect with people around the world</p>
      </header>
      
      <section className="space-y-4 mb-6">
        <article className="flex items-start space-x-3">
          <FaSmile className="text-green-400 mt-1 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-medium text-white">Make New Friends</h3>
            <p className="text-gray-400 text-sm">Connect with people who share your interests</p>
          </div>
        </article>
        
        <article className="flex items-start space-x-3">
          <FaShieldAlt className="text-blue-400 mt-1 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-medium text-white">Safe & Controlled</h3>
            <p className="text-gray-400 text-sm">Your data stays on your device. Age verification ensures safety.</p>
          </div>
        </article>
        
        <article className="flex items-start space-x-3">
          <FaSave className="text-green-400 mt-1 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-medium text-white">Auto-Save Feature</h3>
            <p className="text-gray-400 text-sm">Your preferences are saved locally in your browser</p>
          </div>
        </article>
      </section>
      
      <footer className="flex space-x-3">
        <button
          onClick={() => {
            setShowWelcome(false);
            setShowSafetyTips(true);
          }}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-medium hover:opacity-90"
          aria-label="View safety tips first"
        >
          Safety First
        </button>
        <button
          onClick={() => setShowWelcome(false)}
          className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl font-medium hover:opacity-90"
          aria-label="Get started without viewing safety tips"
        >
          Get Started
        </button>
      </footer>
    </article>
  </div>
);

// SafetyWarningModal Component
const SafetyWarningModal = ({ 
  isClosingModal, 
  handleCloseModal, 
  setShowSafetyTips, 
  handleTermsAcceptance, 
  handleClearAllData, 
  activeSafetyTab, 
  setActiveSafetyTab 
}) => (
  <div 
    role="dialog"
    aria-modal="true"
    aria-labelledby="safety-title"
    className={`fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 transition-all duration-300 overflow-y-auto ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}
  >
    <article 
      className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-2xl w-full border-2 border-blue-500 relative my-auto"
    >
      <header>
        <button
          onClick={() => handleCloseModal(() => setShowSafetyTips(false))}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close safety information"
        >
          <FaTimes size={24} aria-hidden="true" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <FaShieldAlt className="text-2xl text-white" />
          </div>
          <h1 id="safety-title" className="text-2xl md:text-3xl font-bold text-white mb-2">Safety First</h1>
          <p className="text-gray-400">Important information to keep you safe</p>
        </div>
      </header>
      
      <nav aria-label="Safety information tabs" className="flex space-x-2 mb-6 overflow-x-auto">
        {['quick-tips', 'age-verification', 'data-privacy', 'emergency'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSafetyTab(tab)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeSafetyTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            aria-selected={activeSafetyTab === tab}
            role="tab"
          >
            {tab === 'quick-tips' && 'Quick Tips'}
            {tab === 'age-verification' && 'Age 18+'}
            {tab === 'data-privacy' && 'Privacy'}
            {tab === 'emergency' && 'Emergency'}
          </button>
        ))}
      </nav>
      
      <div 
        className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2"
        role="tabpanel"
        aria-labelledby={`${activeSafetyTab}-tab`}
      >
        {activeSafetyTab === 'quick-tips' && (
          <section>
            <article className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
              <h2 className="text-lg font-bold text-blue-300 mb-2">Essential Safety Tips</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✓</span>
                  <span>Keep personal information private</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✓</span>
                  <span>Be respectful to others</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✓</span>
                  <span>Report inappropriate behavior</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✓</span>
                  <span>Use common sense in conversations</span>
                </li>
              </ul>
            </article>
            
            <article className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
              <h3 className="font-bold text-green-300 mb-2">Good to Know</h3>
              <p className="text-gray-300">
                All chats are anonymous. No registration required. Your data is stored only on your device.
              </p>
            </article>
          </section>
        )}
        
        {activeSafetyTab === 'age-verification' && (
          <section>
            <article className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
              <h2 className="text-lg font-bold text-yellow-300 mb-2">Age Restriction</h2>
              <p className="text-gray-300">
                This platform is intended for users 18 years and older. Age verification helps ensure a safer environment for everyone.
              </p>
            </article>
            
            <article className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">Why we ask for age verification:</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Maintain age-appropriate conversations</li>
                <li>• Filter out underage users</li>
                <li>• Provide better content matching</li>
                <li>• Comply with legal requirements</li>
              </ul>
            </article>
          </section>
        )}
        
        {activeSafetyTab === 'data-privacy' && (
          <section>
            <article className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
              <h2 className="text-lg font-bold text-green-300 mb-2">Your Privacy Matters</h2>
              <p className="text-gray-300">
                We use local storage to save your preferences on your device only. No data is sent to our servers.
              </p>
            </article>
            
            <article className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <FaSave className="text-green-400" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-white">Locally Stored Data</h3>
                  <p className="text-gray-400 text-sm">Stays on your device</p>
                </div>
              </div>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Age verification status</li>
                <li>• Your interests and preferences</li>
                <li>• Profile information</li>
                <li>• Terms acceptance</li>
              </ul>
            </article>
          </section>
        )}
        
        {activeSafetyTab === 'emergency' && (
          <section>
            <article className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
              <h2 className="text-lg font-bold text-red-300 mb-2">Need Help?</h2>
              <p className="text-gray-300">
                If you encounter illegal content or feel threatened, here are resources:
              </p>
            </article>
            
            <article className="space-y-2">
              <a 
                href="https://www.missingkids.org/cybertipline" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-medium text-white">CyberTipline</h3>
                <p className="text-gray-400 text-sm">Report online exploitation</p>
              </a>
              
              <a 
                href="https://www.connectsafely.org/safety-tips/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-medium text-white">ConnectSafely Guides</h3>
                <p className="text-gray-400 text-sm">Online safety resources</p>
              </a>
            </article>
          </section>
        )}
      </div>
      
      <footer className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleTermsAcceptance}
          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90"
          aria-label="Accept terms and continue"
        >
          <FaCheckCircle className="inline mr-2" aria-hidden="true" />
          I Understand & Continue
        </button>
        <button
          onClick={handleClearAllData}
          className="sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
          aria-label="Exit and clear data"
        >
          Exit
        </button>
      </footer>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        By continuing, you agree to our Terms and acknowledge you are 18+
      </p>
    </article>
  </div>
);

// AgeVerificationModal Component
const AgeVerificationModal = ({ 
  isClosingModal, 
  confirmedOver18, 
  setConfirmedOver18, 
  handleAgeVerification, 
  ageVerified 
}) => (
  <div 
    role="dialog"
    aria-modal="true"
    aria-labelledby="age-verification-title"
    className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}
  >
    <article className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500">
      <header className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <FaLock className="text-2xl text-white" />
        </div>
        <h1 id="age-verification-title" className="text-2xl font-bold text-white mb-2">Age Verification</h1>
        <p className="text-gray-400">Please confirm you are 18 or older</p>
      </header>

      <section className="space-y-6 mb-6">
        <article className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
          <p className="text-gray-300 text-sm">
            This platform is designed for adult conversations. Age verification helps maintain a safe environment.
          </p>
        </article>

        <article className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
          <input
            type="checkbox"
            id="ageConfirm"
            checked={confirmedOver18}
            onChange={(e) => setConfirmedOver18(e.target.checked)}
            className="mt-1 w-5 h-5 flex-shrink-0"
            aria-labelledby="age-confirm-label"
          />
          <label id="age-confirm-label" htmlFor="ageConfirm" className="text-white text-sm">
            I confirm that I am 18 years of age or older
          </label>
        </article>
        
        <article className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <p className="text-green-300 text-sm">
            <FaSave className="inline mr-2" aria-hidden="true" />
            Your verification will be saved locally in your browser
          </p>
        </article>
      </section>

      <footer className="space-y-3">
        <button
          onClick={handleAgeVerification}
          disabled={!confirmedOver18}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            confirmedOver18
              ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90'
              : 'bg-gray-700 cursor-not-allowed'
          }`}
          aria-label="Verify age and continue"
        >
          <FaCheckCircle className="inline mr-2" aria-hidden="true" />
          Verify & Continue
        </button>
        
        <button
          onClick={() => window.open('https://www.commonsensemedia.org/', '_blank')}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors text-sm"
          aria-label="Open family safety resources"
        >
          <FaInfoCircle className="inline mr-2" aria-hidden="true" />
          Family Safety Resources
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Required for chat access. Verification stored locally.
        </p>
      </footer>
    </article>
  </div>
);

// Header Component with SEO improvements
const Header = ({ 
  userProfile, 
  ageVerified, 
  setShowMobileMenu, 
  setShowSafetyTips, 
  onUpdateProfile, 
  termsAccepted 
}) => (
  <header className="px-4 md:px-6 py-4 border-b border-gray-800/50 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-30">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => setShowMobileMenu(true)}
          className="md:hidden text-white"
          aria-label="Open mobile menu"
        >
          <FaBars size={20} aria-hidden="true" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Omegle Pro
        </h1>
        {userProfile && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs" aria-hidden="true">
                {userProfile.username?.charAt(0) || 'U'}
              </div>
              {userProfile.isPremium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center" aria-hidden="true">
                  <FaCrown size={8} />
                </div>
              )}
            </div>
            <div className="text-sm">
              <div className="font-medium truncate max-w-[100px]">{userProfile.username}</div>
              <div className="text-xs text-gray-400 flex items-center">
                <span>Age {userProfile.age}</span>
                {ageVerified && (
                  <FaCheckCircle className="ml-2 text-green-400" size={10} aria-label="Age verified" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <nav className="hidden md:flex items-center space-x-3" aria-label="Main navigation">
        <div className="flex items-center space-x-2">
          {ageVerified && termsAccepted && (
            <span className="text-green-400 text-sm flex items-center">
              <FaSave className="mr-1" aria-hidden="true" /> All saved
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSafetyTips(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
          aria-label="View safety tips"
        >
          <FaShieldAlt aria-hidden="true" />
          <span>Safety Tips</span>
        </button>
        {userProfile && (
          <button 
            onClick={onUpdateProfile}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Edit profile"
          >
            <FaEdit aria-hidden="true" />
            <span>Edit Profile</span>
          </button>
        )}
      </nav>
    </div>
  </header>
);

// HeroSection Component with semantic HTML
const HeroSection = ({ onlineCount }) => (
  <header className="text-center mb-12 md:mb-16">
    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
      <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Connect with the World
      </span>
    </h1>
    <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
      Anonymous video and text chat with people who share your interests
    </p>
    
    <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full mb-8 md:mb-12" aria-label="Current online users">
      <FaUsers className="text-blue-400 mr-2" aria-hidden="true" />
      <span className="text-lg font-medium">{onlineCount.toLocaleString()}</span>
      <span className="text-gray-400 ml-2">people online now</span>
    </div>
  </header>
);

// QuickAccessCards Component with ARIA labels
const QuickAccessCards = ({ 
  ageVerified, 
  setShowAgeVerification, 
  connected, 
  userProfile, 
  onStartTextChat, 
  onStartVideoChat 
}) => (
  <section aria-label="Chat options" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
    {/* Text Chat Card */}
    <article className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-blue-500 hover:scale-[1.02]' : 'border-yellow-500/50'}`}>
      {!ageVerified && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center p-6">
            <FaLock className="text-yellow-400 text-4xl mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-bold text-white mb-2">Verify Age First</h2>
            <p className="text-gray-300 mb-4">Quick age check required for chat access</p>
            <button
              onClick={() => setShowAgeVerification(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90"
              aria-label="Verify age to access text chat"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}
      
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2" aria-hidden="true">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
          <FaComments />
        </div>
      </div>
      
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold mb-4">Text Chat</h2>
        <p className="text-gray-400 mb-6">
          Connect instantly with random people through text messages
        </p>
        
        <button
          onClick={onStartTextChat}
          disabled={!connected || !userProfile || !ageVerified}
          className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
            connected && userProfile && ageVerified
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 hover:scale-105'
              : 'bg-gray-700 cursor-not-allowed'
          }`}
          aria-label="Start random text chat"
        >
          <FaRandom className="inline mr-2" aria-hidden="true" />
          Start Random Chat
        </button>
      </div>
    </article>

    {/* Video Chat Card */}
    <article className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-red-500 hover:scale-[1.02]' : 'border-yellow-500/50'}`}>
      {!ageVerified && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center p-6">
            <FaLock className="text-yellow-400 text-4xl mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-bold text-white mb-2">Age Verified Only</h2>
            <p className="text-gray-300 mb-4">Video chat requires age verification</p>
          </div>
        </div>
      )}
      
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2" aria-hidden="true">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xl">
          <FaVideo />
        </div>
      </div>
      
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold mb-4">Video Chat</h2>
        <p className="text-gray-400 mb-6">
          Face-to-face video calls with random people
        </p>
        
        <button
          onClick={onStartVideoChat}
          disabled={!connected || !userProfile || !ageVerified}
          className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
            connected && userProfile && ageVerified
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 hover:scale-105'
              : 'bg-gray-700 cursor-not-allowed'
          }`}
          aria-label="Start random video chat"
        >
          <FaRandom className="inline mr-2" aria-hidden="true" />
          Start Video Chat
        </button>
      </div>
    </article>
  </section>
);

// Main HomeScreen Component with SEO optimization
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
    const loadStoredData = () => {
      try {
        const storedTerms = localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED);
        const storedAge = localStorage.getItem(STORAGE_KEYS.AGE_VERIFIED);
        const storedWelcome = localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN);
        
        if (storedTerms === 'true') {
          setTermsAccepted(true);
          onAcceptTerms?.(true);
        }
        
        if (storedAge === 'true') {
          setAgeVerified(true);
          onVerifyAge?.(true);
        }
        
        // Show welcome only on first visit
        if (storedWelcome !== 'true') {
          setShowWelcome(true);
          localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, 'true');
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
      }, 1000);
    }
  }, [ageVerified, isLoading]);

  // Render structured data for SEO
  const renderStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Omegle Pro - Anonymous Chat Platform",
      "description": "Anonymous video and text chat platform for adults 18+",
      "mainEntity": {
        "@type": "WebApplication",
        "name": "Omegle Pro Chat",
        "description": "Connect with random people worldwide through secure anonymous chat",
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Any",
        "featureList": [
          "Anonymous Text Chat",
          "Video Chat",
          "Age Verification",
          "Interest Matching",
          "Local Data Storage"
        ]
      }
    };
    
    return (
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <>
        <SEOHead />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-label="Loading"></div>
            <p className="text-gray-400">Loading your preferences...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead />
      {renderStructuredData()}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black" itemScope itemType="https://schema.org/WebPage">
        {/* Welcome Modal */}
        {showWelcome && (
          <WelcomeModal 
            isClosingModal={isClosingModal} 
            setShowWelcome={setShowWelcome} 
            setShowSafetyTips={setShowSafetyTips} 
          />
        )}
        
        {/* Safety Tips Modal */}
        {showSafetyTips && (
          <SafetyWarningModal 
            isClosingModal={isClosingModal}
            handleCloseModal={(setter) => {
              setIsClosingModal(true);
              setTimeout(() => {
                setter(false);
                setIsClosingModal(false);
              }, 300);
            }}
            setShowSafetyTips={setShowSafetyTips}
            handleTermsAcceptance={() => {
              setTermsAccepted(true);
              localStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, 'true');
              onAcceptTerms?.(true);
            }}
            handleClearAllData={() => {
              if (window.confirm('Are you sure you want to clear all stored data?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            activeSafetyTab={activeSafetyTab}
            setActiveSafetyTab={setActiveSafetyTab}
          />
        )}
        
        {/* Age Verification Modal */}
        {!ageVerified && showAgeVerification && (
          <AgeVerificationModal 
            isClosingModal={isClosingModal}
            confirmedOver18={confirmedOver18}
            setConfirmedOver18={setConfirmedOver18}
            handleAgeVerification={() => {
              if (confirmedOver18) {
                setAgeVerified(true);
                setShowAgeVerification(false);
                localStorage.setItem(STORAGE_KEYS.AGE_VERIFIED, 'true');
                onVerifyAge?.(true);
              }
            }}
            ageVerified={ageVerified}
          />
        )}

        {/* Main Content */}
        <main>
          <Header 
            userProfile={userProfile}
            ageVerified={ageVerified}
            setShowMobileMenu={setShowMobileMenu}
            setShowSafetyTips={setShowSafetyTips}
            onUpdateProfile={onUpdateProfile}
            termsAccepted={termsAccepted}
          />

          {/* Safety Status Banner */}
          <section aria-label="Safety status" className="bg-gradient-to-r from-blue-900/20 to-gray-900 border-b border-blue-500/30">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {ageVerified ? (
                    <>
                      <FaCheckCircle className="text-green-400" aria-label="Age verified" />
                      <span className="text-white text-sm">Age verified • </span>
                    </>
                  ) : (
                    <>
                      <FaWarning className="text-yellow-400" aria-label="Age verification required" />
                      <span className="text-white text-sm">Age verification required • </span>
                    </>
                  )}
                  <span className="text-gray-300 text-sm">Your data is saved locally</span>
                </div>
                <button
                  onClick={() => setShowSafetyTips(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                  aria-label="View safety information"
                >
                  Safety info
                </button>
              </div>
            </div>
          </section>

          {/* Primary Content */}
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <HeroSection onlineCount={onlineCount} />

            <QuickAccessCards 
              ageVerified={ageVerified}
              setShowAgeVerification={setShowAgeVerification}
              connected={connected}
              userProfile={userProfile}
              onStartTextChat={onStartTextChat}
              onStartVideoChat={onStartVideoChat}
            />

            {/* Additional SEO Content */}
            <section className="max-w-4xl mx-auto mb-12" aria-label="About Omegle Pro">
              <article className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">About Omegle Pro</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 mb-4">
                    Omegle Pro is a modern anonymous chat platform that connects people worldwide through 
                    secure text and video conversations. Unlike traditional social platforms, we prioritize 
                    privacy by storing all data locally on your device.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Our platform features robust age verification to ensure a safe environment for adult 
                    conversations. Connect with people who share your interests for more meaningful 
                    connections.
                  </p>
                  <h3 className="text-xl font-bold mb-2">Key Features</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-2 mb-4">
                    <li>Secure anonymous text and video chat</li>
                    <li>Local data storage - nothing sent to servers</li>
                    <li>Age verification for 18+ users only</li>
                    <li>Interest-based matching system</li>
                    <li>Real-time online user count</li>
                    <li>No registration required</li>
                  </ul>
                </div>
              </article>
            </section>

            {/* FAQ Section for SEO */}
            <section className="max-w-4xl mx-auto mb-12" aria-label="Frequently Asked Questions">
              <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                  <summary className="font-bold text-lg cursor-pointer">Is Omegle Pro free to use?</summary>
                  <p className="mt-3 text-gray-300">Yes, Omegle Pro is completely free to use. There are no hidden fees or premium subscriptions required.</p>
                </details>
                <details className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                  <summary className="font-bold text-lg cursor-pointer">Is my data safe?</summary>
                  <p className="mt-3 text-gray-300">All data is stored locally on your device using browser storage. No information is sent to our servers, ensuring maximum privacy.</p>
                </details>
                <details className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                  <summary className="font-bold text-lg cursor-pointer">Why is age verification required?</summary>
                  <p className="mt-3 text-gray-300">Age verification ensures a safer environment for adult conversations and helps maintain age-appropriate content.</p>
                </details>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
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
              <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs">
                <Link to="/community-guidelines" className="text-blue-400 hover:underline">Community Guidelines</Link> | 
                <Link to="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link> | 
                <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link> |
                <Link to="/contact-us" className="text-blue-400 hover:underline">Contact Us</Link> |
                <button onClick={() => setShowSafetyTips(true)} className="text-blue-400 hover:underline">Safety Center</button> |
                <a href="mailto:abuse@omeglepro.example.com" className="text-blue-400 hover:underline">Report Abuse</button>
              </nav>
              <p className="mt-4 text-gray-600 text-xs md:text-sm">
                If you are under 18, please exit immediately. 
                <a href="https://www.kidshelpphone.ca" className="text-blue-400 hover:underline ml-2">
                  Resources for youth
                </a>
              </p>
            </div>
            
            {/* Microdata for SEO */}
            <div itemScope itemType="https://schema.org/Organization" style={{display: 'none'}}>
              <span itemProp="name">Omegle Pro</span>
              <span itemProp="description">Anonymous video and text chat platform</span>
              <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="addressCountry">US</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomeScreen;