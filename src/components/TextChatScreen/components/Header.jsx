// import React from 'react';
// import { FaArrowLeft, FaQrcode, FaPalette, FaCog, FaHeart, FaTimes } from 'react-icons/fa';

// const Header = ({
//   partner,
//   partnerDisconnected,
//   localPartnerTyping,
//   onBack,
//   setShowScanner,
//   setActiveTheme,
//   themes,
//   activeTheme,
//   setShowSettings,
//   showSettings
// }) => {
//   return (
//     <div className="relative px-6 py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl">
//       <div className="max-w-6xl mx-auto flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={onBack}
//             className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
//           >
//             <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
//             <span className="font-medium">Back</span>
//           </button>
         
//           {partner && (
//             <div className="group flex items-center space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
//               <div className="relative">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
//                   <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
//                     {(partner.profile?.username || partner.username || 'S').charAt(0)}
//                   </div>
//                 </div>
//                 {partnerDisconnected ? (
//                   <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border-2 border-gray-900"></div>
//                 ) : (
//                   <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
//                 )}
//               </div>
//               <div className="text-left">
//                 <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//                   {partner.profile?.username || partner.username || 'Stranger'}
//                 </div>
//                 <div className="text-xs text-gray-400 flex items-center">
//                   {partnerDisconnected ? (
//                     <span className="text-red-400">Disconnected</span>
//                   ) : localPartnerTyping ? (
//                     <span className="text-yellow-400 flex items-center">
//                       <div className="flex space-x-1 mr-2">
//                         <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
//                         <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                         <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
//                       </div>
//                       <span className="text-yellow-400">typing...</span>
//                     </span>
//                   ) : partner.compatibility ? (
//                     <span className="text-emerald-400 flex items-center">
//                       <FaHeart size={10} className="mr-1 animate-pulse" />
//                       {partner.compatibility}% match
//                     </span>
//                   ) : (
//                     <span className="text-cyan-400">Online</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
       
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() => setShowScanner(true)}
//             className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
//           >
//             <FaQrcode className="group-hover:rotate-12 transition-transform" />
//           </button>
//           <button
//             onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
//             className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
//           >
//             <FaPalette className="group-hover:rotate-180 transition-transform" />
//           </button>
//           <button
//             onClick={() => setShowSettings(!showSettings)}
//             className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
//           >
//             <FaCog className="group-hover:rotate-90 transition-transform" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;


import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaQrcode, FaPalette, FaCog, FaHeart, FaTimes } from 'react-icons/fa';

const Header = ({
  partner,
  partnerDisconnected,
  localPartnerTyping,
  onBack,
  setShowScanner,
  setActiveTheme,
  themes,
  activeTheme,
  setShowSettings,
  showSettings
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Detect mobile and keyboard visibility
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check if keyboard is visible (for mobile)
    const handleResize = () => {
      checkMobile();
      // Detect keyboard on mobile by checking viewport height
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const windowHeight = window.innerHeight;
        const viewportHeight = visualViewport.height;
        // If viewport is significantly smaller than window, keyboard is likely open
        setKeyboardVisible(viewportHeight < windowHeight * 0.8);
      }
    };

    // Check for visual viewport API (for mobile keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    checkMobile();
    window.addEventListener('resize', handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Prevent body scrolling when keyboard is open on mobile
  useEffect(() => {
    if (isMobile) {
      if (keyboardVisible) {
        // Disable scrolling on body when keyboard is visible
        document.body.style.overflow = 'hidden';
        // Add padding to body to account for keyboard
        document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      } else {
        // Re-enable scrolling
        document.body.style.overflow = 'auto';
        document.body.style.paddingBottom = '0';
      }
    }
  }, [keyboardVisible, isMobile]);

  // Focus management for mobile keyboard
  const handleBackClick = () => {
    // Blur any active input before navigating back
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    // Small delay to allow keyboard to close
    setTimeout(() => {
      onBack();
    }, 100);
  };

  return (
    <header 
      className={`
        px-4 md:px-6 py-3 md:py-4 
        border-b border-gray-800/30 
        bg-gray-900/95 backdrop-blur-xl
        ${isMobile ? 'fixed top-0 left-0 right-0 z-50' : 'relative'}
        ${keyboardVisible && isMobile ? 'transform-none' : ''}
        transition-all duration-200
      `}
      style={{
        // Use safe-area-inset for notched phones
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingTop: 'env(safe-area-inset-top, 0.75rem)',
        height: isMobile ? '60px' : 'auto',
        minHeight: isMobile ? '60px' : 'auto'
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          <button
            onClick={handleBackClick}
            className="group flex items-center space-x-2 md:space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 md:px-4 md:py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm flex-shrink-0"
            aria-label="Go back"
          >
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform text-sm md:text-base" />
            <span className="font-medium text-sm md:text-base hidden sm:inline">Back</span>
          </button>
         
          {partner && (
            <div className="group flex items-center space-x-2 md:space-x-3 hover:bg-gray-800/40 rounded-xl p-1.5 md:p-2 backdrop-blur-sm transition-all duration-300 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm md:text-base">
                    {(partner.profile?.username || partner.username || 'S').charAt(0).toUpperCase()}
                  </div>
                </div>
                {partnerDisconnected ? (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border border-gray-900"></div>
                ) : (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border border-gray-900"></div>
                )}
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-bold text-sm md:text-base truncate bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {partner.profile?.username || partner.username || 'Stranger'}
                </div>
                <div className="text-xs text-gray-400 flex items-center truncate">
                  {partnerDisconnected ? (
                    <span className="text-red-400 text-xs">Disconnected</span>
                  ) : localPartnerTyping ? (
                    <span className="text-yellow-400 flex items-center truncate">
                      <div className="flex space-x-0.5 mr-1.5 flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-yellow-400 truncate">typing...</span>
                    </span>
                  ) : partner.compatibility ? (
                    <span className="text-emerald-400 flex items-center truncate">
                      <FaHeart size={8} className="mr-1 animate-pulse flex-shrink-0" />
                      <span className="truncate">{partner.compatibility}% match</span>
                    </span>
                  ) : (
                    <span className="text-cyan-400 truncate">Online</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
       
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 ml-2">
          <button
            onClick={() => setShowScanner(true)}
            className="p-2 md:p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            aria-label="Scan QR code"
          >
            <FaQrcode className="group-hover:rotate-12 transition-transform text-sm md:text-base" />
          </button>
          <button
            onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
            className="p-2 md:p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            aria-label="Change theme"
          >
            <FaPalette className="group-hover:rotate-180 transition-transform text-sm md:text-base" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 md:p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            aria-label="Settings"
          >
            <FaCog className="group-hover:rotate-90 transition-transform text-sm md:text-base" />
          </button>
        </div>
      </div>

      {/* Add spacer for fixed header on mobile */}
      {isMobile && !keyboardVisible && (
        <style jsx>{`
          .header-spacer {
            height: 60px;
            width: 100%;
          }
        `}</style>
      )}
    </header>
  );
};

export default Header;