import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaArrowLeft, FaRandom, FaTimes, FaUser,
  FaHeart, FaVideo, FaVideoSlash, FaMicrophone,
  FaMicrophoneSlash, FaDesktop, FaPhone, FaVolumeUp,
  FaVolumeMute, FaExpand, FaCompress, FaPalette,
  FaCog, FaQrcode, FaSync, FaUsers,
  FaEllipsisV, FaCamera,
  FaRegCopy, FaLink, FaInfoCircle, FaExclamationTriangle,
  FaSave, FaCheck, FaDesktop as FaLayout
} from 'react-icons/fa';

// Layout configuration
const LAYOUT_CONFIG = [
  { 
    id: 'pip', 
    name: 'Picture-in-Picture', 
    icon: 'pip',
    description: 'Main view with small preview',
    mobileFriendly: true,
    defaultMobile: true
  },
  { 
    id: 'grid-horizontal', 
    name: 'Horizontal Grid', 
    icon: 'grid-h',
    description: 'Videos side by side',
    mobileFriendly: true,
    defaultMobile: false
  },
  { 
    id: 'grid-vertical', 
    name: 'Vertical Grid', 
    icon: 'grid-v',
    description: 'Videos stacked vertically',
    mobileFriendly: true,
    defaultMobile: true
  },
  { 
    id: 'side-by-side', 
    name: 'Side by Side', 
    icon: 'side',
    description: 'Large main view with sidebar',
    mobileFriendly: false,
    defaultMobile: false
  },
  { 
    id: 'stack', 
    name: 'Stacked', 
    icon: 'stack',
    description: 'Overlaid with preview corner',
    mobileFriendly: true,
    defaultMobile: false
  },
  { 
    id: 'focus-remote', 
    name: 'Focus Partner', 
    icon: 'focus-remote',
    description: 'Partner fills most of screen',
    mobileFriendly: true,
    defaultMobile: false
  },
  { 
    id: 'focus-local', 
    name: 'Focus Self', 
    icon: 'focus-local',
    description: 'Your video fills most of screen',
    mobileFriendly: true,
    defaultMobile: false
  },
  { 
    id: 'cinema', 
    name: 'Cinema Mode', 
    icon: 'cinema',
    description: 'Theater-style experience',
    mobileFriendly: false,
    defaultMobile: false
  },
  { 
    id: 'speaker-view', 
    name: 'Speaker View', 
    icon: 'speaker',
    description: 'Active speaker highlighted',
    mobileFriendly: true,
    defaultMobile: false
  }
];
const VideoChatUi = ({
    showLayoutModal,
    setShowLayoutModal,
    videoLayout,
    getLayoutById,
    handleLayoutChange,
    savedDefaultLayout,
    saveDefaultLayout,
    getLayoutIconComponent,
     clearDefaultLayout,
     addNotification,
     isMobile,
     activeTheme

}) => {

     const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };
      // ==================== RENDER LAYOUT SELECTION MODAL ====================
      const renderLayoutModal = () => {
        if (!showLayoutModal) return null;
    
        const currentLayout = getLayoutById(videoLayout);
    
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-in">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowLayoutModal(false)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-900/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Choose Video Layout
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Select your preferred layout. You can set one as default.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLayoutModal(false)}
                    className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-300"
                  >
                    <FaTimes className="text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
    
              {/* Layout Grid */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {LAYOUT_CONFIG.map((layout) => {
                    const isActive = layout.id === videoLayout;
                    const isDefault = layout.id === savedDefaultLayout;
                    const isMobileFriendly = layout.mobileFriendly && isMobile;
                    
                    return (
                      <button
                        key={layout.id}
                        onClick={() => {
                          handleLayoutChange(layout.id);
                          setShowLayoutModal(false);
                        }}
                        className={`relative p-4 rounded-xl transition-all duration-300 border-2 group ${
                          isActive 
                            ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-600/5' 
                            : 'border-gray-800 hover:border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30'
                        } ${!isMobileFriendly && isMobile ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        disabled={!isMobileFriendly && isMobile}
                      >
                        {/* Default Badge */}
                        {isDefault && (
                          <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-xs font-medium z-10">
                            <FaCheck className="inline mr-1" /> Default
                          </div>
                        )}
                        
                        {/* Layout Icon */}
                        <div className="flex justify-center mb-3">
                          <div className={`w-20 h-12 rounded-lg flex items-center justify-center ${
                            isActive 
                              ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30' 
                              : 'bg-gray-800/50 border border-gray-700/50'
                          }`}>
                            {getLayoutIconComponent(layout.icon)}
                          </div>
                        </div>
                        
                        {/* Layout Info */}
                        <div className="text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${
                              isActive ? 'text-white' : 'text-gray-300'
                            }`}>
                              {layout.name}
                            </h4>
                            {isActive && (
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-3">
                            {layout.description}
                          </p>
                          
                          {/* Mobile Warning */}
                          {!isMobileFriendly && isMobile && (
                            <div className="text-xs text-yellow-500 bg-yellow-500/10 rounded px-2 py-1 mb-3">
                              Not optimized for mobile
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveDefaultLayout(layout.id);
                              }}
                              className={`flex-1 text-xs px-3 py-1.5 rounded-lg transition-all duration-300 ${
                                isDefault 
                                  ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 border border-emerald-500/50 text-emerald-300' 
                                  : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600/50'
                              }`}
                            >
                              {isDefault ? 'Default Saved' : 'Set as Default'}
                            </button>
                            
                            {isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearDefaultLayout();
                                }}
                                className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-300 rounded-lg hover:opacity-90 transition-all duration-300"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
    
              {/* Footer */}
              <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-900/30">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    <span className="text-emerald-400 font-medium">
                      {currentLayout.name}
                    </span>
                    <span className="mx-2">•</span>
                    {savedDefaultLayout ? (
                      <span>Default: <span className="font-medium">{getLayoutById(savedDefaultLayout).name}</span></span>
                    ) : (
                      <span>No default layout set</span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowLayoutModal(false)}
                      className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-300 border border-gray-700/50 font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        clearDefaultLayout();
                        addNotification('Default layout cleared', 'info');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 rounded-xl transition-all duration-300 border border-red-500/30 font-medium text-red-300"
                    >
                      Clear Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      };
  return (
       <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
{renderLayoutModal}


    </div> 
       )

    }

    const styles = `
.layout-transitioning {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-down {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-left {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes modal-in {
  from { 
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-in-up {
  animation: slide-in-up 0.5s ease-out;
}

.animate-slide-in-down {
  animation: slide-in-down 0.5s ease-out;
}

.animate-slide-in-left {
  animation: slide-in-left 0.5s ease-out;
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out;
}

.animate-modal-in {
  animation: modal-in 0.3s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}

/* Smooth hover effects */
.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Glass effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}


    export default VideoChatUi;