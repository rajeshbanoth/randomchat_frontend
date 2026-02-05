

// src/components/VideoChatScreen.jsx
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
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';
import { useChat } from '../../context/ChatContext';
import { createPeerConnectionFn, } from './functions/webrtc/createPeerConnection';
import { initializeWebRTCConnectionFn } from './functions/webrtc/initializeWebRTCConnection';
// Import the factories (they are named same as functions)
import {
  processQueuedIceCandidates as processQueuedIceCandidatesFactory,
  monitorStreams as monitorStreamsFactory
} from './functions/webrtcDebugFunctions';

import { startStatsCollectionFn, stopStatsCollectionFn } from './functions/webrtc/startStatsCollection';
import { attemptReconnectFn } from './functions/webrtc/attemptReconnect';
import { fetchIceServersFn } from './functions/webrtc/fetchIceServers';
import { initializeLocalStreamFn } from './functions/webrtc/localStream';
import { forceStreamSyncFn } from './functions/webrtc/forceStreamSync';

// ==================== PLACEHOLDER STREAM FUNCTION ====================
const createPlaceholderStream = () => {
  console.log('🎬 Creating placeholder video stream...');
  
  try {
    // Create a canvas element for placeholder video
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Create a placeholder MediaStream
    const placeholderStream = new MediaStream();
    
    // Create animation for the placeholder
    let animationFrameId;
    let angle = 0;
    
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937'; // gray-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient circle
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, '#3b82f6'); // blue-500
      gradient.addColorStop(1, '#8b5cf6'); // purple-500
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(canvas.width, canvas.height) / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw camera icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', 0, 0);
      
      ctx.restore();
      
      angle += 0.02;
      
      // Capture canvas as video frame
      canvas.captureStream(30).getVideoTracks()[0]?.stop();
      
      // Add new video track to stream
      const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
      if (videoTrack) {
        // Clear existing tracks
        placeholderStream.getTracks().forEach(track => track.stop());
        placeholderStream.addTrack(videoTrack);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Store animation frame ID for cleanup
    placeholderStream._animationFrame = animationFrameId;
    
    // Create a silent audio track
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const destination = audioContext.createMediaStreamDestination();
    oscillator.connect(destination);
    oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
    oscillator.start();
    
    const audioTrack = destination.stream.getAudioTracks()[0];
    placeholderStream.addTrack(audioTrack);
    
    console.log('✅ Placeholder stream created with animation');
    return placeholderStream;
    
  } catch (error) {
    console.error('❌ Error creating placeholder stream:', error);
    
    // Fallback: Create a simple static placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', canvas.width / 2, canvas.height / 2);
    
    const stream = canvas.captureStream(1);
    return stream;
  }
};

const log = (scope, message, data = null) => {
  const time = new Date().toISOString();
  if (data !== null) {
    console.log(`[${time}] [${scope}] ${message}`, data);
  } else {
    console.log(`[${time}] [${scope}] ${message}`);
  }
};


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

// Helper function to get layout by ID
const getLayoutById = (id) => LAYOUT_CONFIG.find(layout => layout.id === id) || LAYOUT_CONFIG[0];

// Helper function to get layout icon component
const getLayoutIconComponent = (iconType) => {
  switch(iconType) {
    case 'pip':
      return (
        <div className="w-4 h-4 border border-gray-400 rounded relative">
          <div className="absolute top-0 right-0 w-1 h-1 border border-gray-400 rounded-sm"></div>
        </div>
      );
    case 'grid-h':
      return (
        <div className="w-4 h-4 flex gap-0.5">
          <div className="flex-1 border border-gray-400 rounded"></div>
          <div className="flex-1 border border-gray-400 rounded"></div>
        </div>
      );
    case 'grid-v':
      return (
        <div className="w-4 h-4 flex flex-col gap-0.5">
          <div className="flex-1 border border-gray-400 rounded"></div>
          <div className="flex-1 border border-gray-400 rounded"></div>
        </div>
      );
    case 'side':
      return (
        <div className="w-4 h-4 flex gap-0.5">
          <div className="w-2/3 border border-gray-400 rounded"></div>
          <div className="w-1/3 border border-gray-400 rounded"></div>
        </div>
      );
    case 'stack':
      return (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 border border-gray-400 rounded"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border border-gray-400 rounded-sm"></div>
        </div>
      );
    case 'focus-remote':
      return (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 border border-gray-400 rounded"></div>
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border border-gray-400 rounded-sm"></div>
        </div>
      );
    case 'focus-local':
      return (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 border border-gray-400 rounded"></div>
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border border-gray-400 rounded-sm"></div>
        </div>
      );
    case 'cinema':
      return (
        <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
          <div className="w-3 h-2 border-t border-b border-gray-400"></div>
        </div>
      );
    case 'speaker':
      return (
        <div className="w-4 h-4 flex flex-col gap-0.5">
          <div className="h-2/3 border border-gray-400 rounded"></div>
          <div className="h-1/3 border border-gray-400 rounded"></div>
        </div>
      );
    default:
      return <div className="w-4 h-4 border border-gray-400 rounded"></div>;
  }
};

const VideoChatScreen = () => {
  const {
    socket,
    partner,
    userProfile,
    searching,
    autoConnect,
    disconnectPartner,
    nextPartner,
    toggleAutoConnect,
    addNotification,
    setCurrentScreen,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate,
    sendWebRTCEnd,
    debugGetState,
    debugForcePartnerUpdate
  } = useChat();
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const offerTimeoutRefs = useRef([]);
  
  // State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false);
  const [isRemoteVideoMuted, setIsRemoteVideoMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [iceServers, setIceServers] = useState([]);
  const [callStats, setCallStats] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [activeTheme, setActiveTheme] = useState('midnight');
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);
  
  // CRITICAL: Use a single source for call info
  const [callInfo, setCallInfo] = useState({
    callId: null,
    roomId: null,
    isCaller: false,
    partnerId: null,
    initialized: false
  });
  
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [deviceError, setDeviceError] = useState(null);
  
  // Placeholder state
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);
  
  // Layout state with localStorage support
  const [videoLayout, setVideoLayout] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('videoChatDefaultLayout');
    const isMobile = window.innerWidth < 768;
    
    if (saved && LAYOUT_CONFIG.find(l => l.id === saved)) {
      return saved;
    }
    
    // Default based on screen size
    if (isMobile) {
      const mobileDefault = LAYOUT_CONFIG.find(l => l.defaultMobile);
      return mobileDefault ? mobileDefault.id : 'grid-vertical';
    }
    
    return 'pip'; // Default desktop layout
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [isChangingLayout, setIsChangingLayout] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [savedDefaultLayout, setSavedDefaultLayout] = useState(() => {
    return localStorage.getItem('videoChatDefaultLayout') || '';
  });
  
  // Refs for layout management
  const layoutChangeRef = useRef(false);
  const videoContainerRef = useRef(null);
  
  const callTimerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const initializationRef = useRef(false);
  const videoMatchReadyRef = useRef(false);
  const retryTimeoutRef = useRef(null);
  const streamRetryCountRef = useRef(0);
  const maxStreamRetries = 3;
  const lastConnectionStateRef = useRef({});
  
  // Add these refs at the top with other refs
  const queuedIceCandidatesRef = useRef([]);
  const processingCandidatesRef = useRef(false);

  const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };

  // Check screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-select layout based on screen size if no saved layout
      if (!localStorage.getItem('videoChatDefaultLayout')) {
        if (mobile) {
          handleLayoutChange('grid-vertical', false); // Vertical grid for mobile
        } else {
          handleLayoutChange('side-by-side', false); // Side-by-side for PC
        }
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ==================== LAYOUT MANAGEMENT FUNCTIONS ====================
  
  const saveDefaultLayout = (layoutId) => {
    try {
      localStorage.setItem('videoChatDefaultLayout', layoutId);
      setSavedDefaultLayout(layoutId);
      addNotification(`Default layout set to ${getLayoutById(layoutId).name}`, 'success');
      console.log('💾 Saved default layout:', layoutId);
    } catch (error) {
      console.error('❌ Error saving layout:', error);
      addNotification('Failed to save default layout', 'error');
    }
  };

  const clearDefaultLayout = () => {
    try {
      localStorage.removeItem('videoChatDefaultLayout');
      setSavedDefaultLayout('');
      addNotification('Default layout cleared', 'info');
      console.log('🗑️ Cleared default layout');
    } catch (error) {
      console.error('❌ Error clearing layout:', error);
    }
  };

  // ==================== CRITICAL FIX: Enhanced layout change handler ====================
  const handleLayoutChange = async (newLayout, animate = true) => {
    console.log(`🔄 Changing layout from ${videoLayout} to ${newLayout}`);
    
    if (newLayout === videoLayout) return;
    
    if (animate) {
      setIsChangingLayout(true);
      layoutChangeRef.current = true;
      
      // Add a CSS class for smooth transition
      if (videoContainerRef.current) {
        videoContainerRef.current.classList.add('layout-transitioning');
      }
    }
    
    // Change layout first
    setVideoLayout(newLayout);
    
    // Wait for React to update DOM
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Force reattachment of streams
    if (remoteStreamRef.current && remoteVideoRef.current) {
      console.log('🎬 Reattaching remote stream for layout change');
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch(e => console.log('Remote play after layout:', e));
    }
    
    if (localStreamRef.current && localVideoRef.current) {
      console.log('🎬 Reattaching local stream for layout change');
      const currentStream = isScreenSharing && screenStreamRef.current 
        ? screenStreamRef.current 
        : localStreamRef.current;
      localVideoRef.current.srcObject = currentStream;
      localVideoRef.current.play().catch(e => console.log('Local play after layout:', e));
    }
    
    layoutChangeRef.current = false;
    
    // Remove transition class and reset state
    if (animate) {
      setTimeout(() => {
        setIsChangingLayout(false);
        if (videoContainerRef.current) {
          videoContainerRef.current.classList.remove('layout-transitioning');
        }
      }, 300);
    }
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


  // Add this function to force reset initialization
const forceResetInitialization = useCallback(() => {
  console.log("[FORCE-RESET] Force resetting initialization state");
  
  // Reset all refs
  initializationRef.current = false;
  localStreamInitRef.current = false;
  videoMatchReadyRef.current = false;
  
  // Reset state
  setCallInfo(prev => ({
    ...prev,
    initialized: false
  }));
  
  setConnectionStatus('disconnected');
  
  // Clear any existing peer connection
  if (peerConnectionRef.current) {
    console.log("[FORCE-RESET] Closing existing peer connection");
    peerConnectionRef.current.close();
    peerConnectionRef.current = null;
  }
  
  console.log("[FORCE-RESET] Complete, ready for fresh start");
}, []);


    const handleDisconnect = () => {
    console.log('📵 Disconnecting video call');
    
    if (socket && callInfo.partnerId && callInfo.callId) {
      sendWebRTCEnd({
        to: callInfo.partnerId,
        reason: 'user_ended',
        callId: callInfo.callId,
        roomId: callInfo.roomId
      });
    }
    
    cleanup();
    
    setCurrentScreen('home');
    
    if (disconnectPartner) {
      disconnectPartner();
    }
    
    addNotification('Video call ended', 'info');
  };
  // ==================== WEBRTC FUNCTIONS ====================

  // Instantiate the functions from factories
  const processQueuedIceCandidates = useCallback(
    processQueuedIceCandidatesFactory({
      peerConnectionRef,
      queuedIceCandidatesRef,
      processingCandidatesRef
    }),
    []
  );

 const monitorStreams = useCallback(
  monitorStreamsFactory({
    localStreamRef,
    remoteStreamRef,
    peerConnectionRef,
    localVideoRef,
    remoteVideoRef,
    callInfo
  }),
  [callInfo]
);

// Add this effect to process queued candidates when remote description is set
useEffect(() => {
  try {
    if (!peerConnectionRef.current) {
      console.log("[ICE] ⏳ Waiting for peerConnection — skipping queued candidates processing");
      return;
    }

    if (!peerConnectionRef.current.remoteDescription) {
      console.log("[ICE] ⏳ No remote description set yet — still queuing candidates", {
        queuedCount: queuedIceCandidatesRef.current?.length || 0
      });
      return;
    }

    if (!queuedIceCandidatesRef.current?.length) {
      console.log("[ICE] ✅ No more queued ICE candidates to process");
      return;
    }

    console.log("[ICE] 🎯 REMOTE DESCRIPTION SET → processing queued ICE candidates", {
      remoteType: peerConnectionRef.current.remoteDescription.type,
      queuedCount: queuedIceCandidatesRef.current.length,
      ts: new Date().toISOString()
    });

    processQueuedIceCandidates();

  } catch (err) {
    console.error("[ICE] ❌ Error while processing queued ICE candidates", {
      message: err?.message || err,
      stack: err?.stack?.split('\n')?.slice(0, 4),
      queuedCount: queuedIceCandidatesRef.current?.length || 0
    });
  }
}, [peerConnectionRef.current?.remoteDescription, processQueuedIceCandidates]);

// ────────────────────────────────────────────────

useEffect(() => {
  const syncStreams = async () => {
    try {
      if (connectionStatus !== 'connected') {
        console.log("[STREAM-SYNC] Skipping — connection not ready", { connectionStatus });
        return;
      }

      if (!peerConnectionRef.current) {
        console.warn("[STREAM-SYNC] No PeerConnection → cannot sync streams");
        return;
      }

      console.log("[STREAM-SYNC] 🔄 Starting stream sync", {
        callId: callInfo.callId,
        roomId: callInfo.roomId,
        hasLocalStream: !!localStreamRef.current,
        hasRemoteStream: !!remoteStreamRef.current
      });

      // Small delay to let 'track' events possibly fire
      await new Promise(r => setTimeout(r, 1000));

      const pc = peerConnectionRef.current;

      const receivers = pc.getReceivers();
      const senders = pc.getSenders();

      console.log("[STREAM-SYNC] PeerConnection snapshot", {
        receivers: receivers.length,
        senders: senders.length,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState
      });

      const remoteTracks = receivers.map(r => r.track).filter(Boolean);

      if (remoteTracks.length === 0) {
        console.warn("[STREAM-SYNC] No remote tracks in receivers yet");
        return;
      }

      if (!remoteStreamRef.current) {
        console.log("[STREAM-SYNC] 🆕 Creating new remote MediaStream");

        remoteStreamRef.current = new MediaStream();

        remoteTracks.forEach(track => {
          if (!remoteStreamRef.current.getTracks().some(t => t.id === track.id)) {
            remoteStreamRef.current.addTrack(track);
            console.log("[STREAM-SYNC] + added track → remote stream", {
              kind: track.kind,
              id: track.id,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState
            });
          }
        });

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.muted = false;
          setRemoteStream(remoteStreamRef.current);
          console.log("[STREAM-SYNC] 🎬 Attached remote stream to video element", {
            trackCount: remoteStreamRef.current.getTracks().length
          });
        } else {
          console.warn("[STREAM-SYNC] remoteVideoRef is null → cannot attach stream");
        }
      } else {
        console.log("[STREAM-SYNC] Remote stream exists — checking for missing tracks", {
          currentCount: remoteStreamRef.current.getTracks().length
        });

        remoteTracks.forEach(track => {
          if (!remoteStreamRef.current.getTracks().some(t => t.id === track.id)) {
            remoteStreamRef.current.addTrack(track);
            console.log("[STREAM-SYNC] 🔄 Added missing track to existing remote stream", {
              kind: track.kind,
              id: track.id
            });
          }
        });
      }

      monitorStreams?.();
      console.log("[STREAM-SYNC] ✓ sync completed — monitorStreams called");

    } catch (err) {
      console.error("[STREAM-SYNC] ❌ Error during stream sync", {
        message: err?.message || String(err),
        stack: err?.stack?.split?.('\n')?.slice(0, 4)
      });
    }
  };

  syncStreams();
}, [connectionStatus, monitorStreams, callInfo?.callId, callInfo?.roomId]);

// ────────────────────────────────────────────────

useEffect(() => {
  const monitorInterval = setInterval(() => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        // console.debug("[MONITOR] No PeerConnection yet");
        return;
      }

      const now = Date.now();

      const state = {
        ts: new Date().toISOString(),
        signaling: pc.signalingState,
        connection: pc.connectionState,
        iceConnection: pc.iceConnectionState,
        iceGathering: pc.iceGatheringState,
        localDesc: pc.localDescription?.type || null,
        remoteDesc: pc.remoteDescription?.type || null,
        senders: pc.getSenders?.().length ?? 0,
        receivers: pc.getReceivers?.().length ?? 0,
        transceivers: pc.getTransceivers?.().length ?? 0
      };

      const prev = lastConnectionStateRef.current;
      const changed = !prev || JSON.stringify(state) !== JSON.stringify(prev);

      if (changed) {
        console.log("[MONITOR] Connection state CHANGED", state);
        lastConnectionStateRef.current = state;

        if (state.signaling === 'stable') {
          if (state.localDesc === 'offer' && !callInfo.isCaller) {
            console.log("[MONITOR] AUTO-CORRECT → isCaller = true (stable + local=offer)");
            setCallInfo(prev => ({ ...prev, isCaller: true }));
          }
          else if (state.localDesc === 'answer' && callInfo.isCaller) {
            console.log("[MONITOR] AUTO-CORRECT → isCaller = false (stable + local=answer)");
            setCallInfo(prev => ({ ...prev, isCaller: false }));
          }
        }
      }
      // Heartbeat every ~12 seconds when nothing changes
      else if (!prev || now - prev.ts > 12000) {
        console.debug("[MONITOR] heartbeat (stable)", {
          connection: state.connection,
          ice: state.iceConnection,
          signaling: state.signaling
        });
      }

    } catch (err) {
      console.error("[MONITOR] Error in monitor interval", {
        message: err?.message || err,
        ts: new Date().toISOString()
      });
    }
  }, 2000);

  console.log("[MONITOR] Started connection monitor (2s interval)");

  return () => {
    clearInterval(monitorInterval);
    console.log("[MONITOR] Stopped connection monitor");
  };
}, [callInfo.isCaller]);

  const startStatsCollection = () => {
    startStatsCollectionFn({
      peerConnectionRef,
      statsIntervalRef,
      getConnectionStatus: () => connectionStatus,
      setCallStats
    });
  };

  const stopStatsCollection = () => {
    stopStatsCollectionFn(statsIntervalRef);
  };

  const attemptReconnect = () => {
    attemptReconnectFn({
      reconnectAttemptsRef,
      maxReconnectAttempts,
      addNotification,
      callInfo,
      initializeWebRTCConnection
    });
  };

  const fetchIceServers = async () => {
    return await fetchIceServersFn({
      setIceServers
    });
  };

  // Add this function to reset all initialization flags
const resetInitialization = useCallback(() => {
  console.log("[RESET] Resetting all initialization flags");
  initializationRef.current = false;
  videoMatchReadyRef.current = false;
  localStreamInitRef.current = false;
  
  setCallInfo(prev => ({
    ...prev,
    initialized: false
  }));
  
  setConnectionStatus('disconnected');
  setRetryCount(0);
  reconnectAttemptsRef.current = 0;
  
  console.log("[RESET] All flags reset, ready for fresh start");
}, []);

  // ==================== MODIFIED INITIALIZE LOCAL STREAM ====================
// ==================== MODIFIED INITIALIZE LOCAL STREAM ====================
const initializeLocalStream = async (usePlaceholder = false) => {
  console.log("[LOCAL_STREAM] initializeLocalStream() called", {
    usePlaceholder,
    timestamp: new Date().toISOString()
  });

  setIsInitializing(true);

  try {
    // ─── PLACEHOLDER PATH ────────────────────────────────────────
    if (usePlaceholder) {
      console.log("[LOCAL_STREAM] Using placeholder stream (camera/mic denied or failed)");

      const placeholder = createPlaceholderStream();

      if (!placeholder || !placeholder.active) {
        console.error("[LOCAL_STREAM] createPlaceholderStream() returned invalid stream", {
          active: placeholder?.active,
          tracks: placeholder ? placeholder.getTracks().length : 0
        });
        return false;
      }

      localStreamRef.current = placeholder;
      setLocalStream(placeholder);
      setHasLocalStream(true);
      setUsingPlaceholder(true);

      console.log("[LOCAL_STREAM] Placeholder stream assigned successfully", {
        videoTracks: placeholder.getVideoTracks().length,
        audioTracks: placeholder.getAudioTracks().length,
        active: placeholder.active
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = placeholder;
        localVideoRef.current.muted = true; // usually placeholder is muted
        localVideoRef.current.play()
          .then(() => console.log("[LOCAL_STREAM] Placeholder video element started playing"))
          .catch(err => console.warn("[LOCAL_STREAM] Placeholder play() failed", {
            name: err.name,
            message: err.message
          }));
      } else {
        console.warn("[LOCAL_STREAM] localVideoRef.current is null — cannot attach placeholder");
      }

      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setDeviceError(null);

      console.log("[LOCAL_STREAM] Placeholder mode fully activated");

      return true;
    }

    // ─── REAL CAMERA + MICROPHONE PATH ───────────────────────────
    console.log("[LOCAL_STREAM] Requesting real getUserMedia — video + audio");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    if (!stream || !stream.active) {
      console.error("[LOCAL_STREAM] getUserMedia returned invalid/null stream", { active: stream?.active });
      return false;
    }

    console.log("[LOCAL_STREAM] getUserMedia succeeded — real stream received", {
      trackCount: stream.getTracks().length,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });

    localStreamRef.current = stream;
    setLocalStream(stream);
    setHasLocalStream(true);
    setUsingPlaceholder(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = false; // local preview usually unmuted
      localVideoRef.current.play()
        .then(() => console.log("[LOCAL_STREAM] Local camera preview started playing"))
        .catch(err => console.warn("[LOCAL_STREAM] localVideo.play() failed", {
          name: err.name,
          message: err.message
        }));
    } else {
      console.warn("[LOCAL_STREAM] localVideoRef.current is null — cannot show local preview");
    }

    // ─── Track inspection ────────────────────────────────────────
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    console.log("[LOCAL_STREAM] Initial track states", {
      video: videoTrack ? {
        id: videoTrack.id,
        enabled: videoTrack.enabled,
        readyState: videoTrack.readyState,
        muted: videoTrack.muted,
        label: videoTrack.label || '(no label)'
      } : 'no video track',
      audio: audioTrack ? {
        id: audioTrack.id,
        enabled: audioTrack.enabled,
        readyState: audioTrack.readyState,
        muted: audioTrack.muted,
        label: audioTrack.label || '(no label)'
      } : 'no audio track'
    });

    setIsVideoEnabled(!!videoTrack?.enabled);
    setIsAudioEnabled(!!audioTrack?.enabled);

    setDeviceError(null);
    streamRetryCountRef.current = 0;

    console.log("[LOCAL_STREAM] Real camera + mic stream initialized successfully");

    return true;

  } catch (error) {
    console.error("[LOCAL_STREAM] getUserMedia / initialization failed", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')?.slice(0, 3)
    });

    let userFriendlyMsg = "Cannot access camera/microphone";

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      userFriendlyMsg = "Camera/microphone permission denied";
    } else if (error.name === 'NotFoundError') {
      userFriendlyMsg = "No camera or microphone found";
    } else if (error.name === 'NotReadableError') {
      userFriendlyMsg = "Camera/microphone is in use by another application";
    }

    setDeviceError(userFriendlyMsg);

    // ─── RETRY LOGIC ─────────────────────────────────────────────
    if (streamRetryCountRef.current < maxStreamRetries && !usePlaceholder) {
      streamRetryCountRef.current++;

      console.warn("[LOCAL_STREAM] Retrying getUserMedia", {
        attempt: streamRetryCountRef.current,
        max: maxStreamRetries,
        delayMs: 1000
      });

      await new Promise(r => setTimeout(r, 1000));
      return await initializeLocalStream(false);
    }

    // ─── FALLBACK TO PLACEHOLDER ─────────────────────────────────
    console.log("[LOCAL_STREAM] Max retries reached → falling back to placeholder stream");
    return await initializeLocalStream(true);

  } finally {
    setIsInitializing(false);
    console.log("[LOCAL_STREAM] initializeLocalStream() completed", {
      isInitializing: false,
      hasLocalStream: !!localStreamRef.current,
      usingPlaceholder: !!localStreamRef.current && localStreamRef.current.getVideoTracks()[0]?.label?.includes?.("placeholder")
    });
  }
};

  const forceStreamSync = useCallback(() => {
    forceStreamSyncFn({
      localStreamRef,
      localVideoRef,
      peerConnectionRef,
      remoteStreamRef,
      remoteVideoRef,
      setRemoteStream
    });
  }, []);

 
// Enhanced createPlaceholderStream function for manual trigger
const createAndUsePlaceholder = () => {
  console.log("[PLACEHOLDER] Manually triggering placeholder stream creation");

  // ─── STOP EXISTING LOCAL STREAM ───────────────────────────────
  if (localStreamRef.current) {
    console.log("[PLACEHOLDER] Stopping existing local stream tracks", {
      trackCount: localStreamRef.current.getTracks().length,
      active: localStreamRef.current.active
    });

    localStreamRef.current.getTracks().forEach(track => {
      console.log(`[PLACEHOLDER] Stopping ${track.kind} track`, {
        id: track.id,
        kind: track.kind,
        readyState: track.readyState,
        enabled: track.enabled,
        label: track.label || '(no label)'
      });
      track.stop();
    });

    localStreamRef.current = null;
    console.log("[PLACEHOLDER] Existing local stream fully stopped and cleared");
  }

  // ─── CLEANUP OLD ANIMATION (if any) ───────────────────────────
  if (localStreamRef.current?._animationFrame) {
    cancelAnimationFrame(localStreamRef.current._animationFrame);
    console.log("[PLACEHOLDER] Cancelled previous animation frame");
  }

  // ─── CREATE NEW PLACEHOLDER ───────────────────────────────────
  const placeholder = createPlaceholderStream();

  if (!placeholder || !placeholder.active) {
    console.error("[PLACEHOLDER] Failed to create valid placeholder MediaStream", {
      active: placeholder?.active ?? false,
      videoTracks: placeholder?.getVideoTracks?.()?.length ?? 0,
      audioTracks: placeholder?.getAudioTracks?.()?.length ?? 0
    });
    return false;
  }

  console.log("[PLACEHOLDER] Placeholder MediaStream created successfully", {
    videoTracks: placeholder.getVideoTracks().length,
    audioTracks: placeholder.getAudioTracks().length,
    active: placeholder.active
  });

  // ─── APPLY TO STATE & VIDEO ELEMENT ───────────────────────────
  localStreamRef.current = placeholder;
  setLocalStream(placeholder);
  setHasLocalStream(true);
  setUsingPlaceholder(true);

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = placeholder;
    localVideoRef.current.muted = true;           // placeholder usually muted
    localVideoRef.current.play()
      .then(() => console.log("[PLACEHOLDER] Placeholder video element started playing"))
      .catch(err => console.warn("[PLACEHOLDER] play() failed on placeholder video", {
        name: err.name,
        message: err.message
      }));
  } else {
    console.warn("[PLACEHOLDER] localVideoRef.current is null → cannot display placeholder");
  }

  setIsVideoEnabled(true);
  setIsAudioEnabled(true);
  setDeviceError(null);

  console.log("[PLACEHOLDER] Placeholder fully activated in UI state");

  addNotification?.('Now using placeholder video', 'success');

  // ─── UPDATE PEER CONNECTION SENDERS (if exists) ───────────────
  if (peerConnectionRef.current) {
    console.log("[PLACEHOLDER] Updating senders in active PeerConnection");

    const videoTrack = placeholder.getVideoTracks()[0];
    const audioTrack = placeholder.getAudioTracks()[0];

    const senders = peerConnectionRef.current.getSenders();

    console.log("[PLACEHOLDER] Current senders snapshot", {
      count: senders.length,
      kinds: senders.map(s => s.track?.kind ?? 'no-track').join(", ")
    });

    const videoSender = senders.find(s => s.track?.kind === 'video');
    const audioSender = senders.find(s => s.track?.kind === 'audio');

    if (videoSender && videoTrack) {
      videoSender.replaceTrack(videoTrack)
        .then(() => console.log("[PLACEHOLDER] Successfully replaced video track in PeerConnection"))
        .catch(err => console.error("[PLACEHOLDER] replaceTrack(video) failed", err));
    } else {
      console.warn("[PLACEHOLDER] Could not replace video track", {
        hasVideoSender: !!videoSender,
        hasVideoTrack: !!videoTrack
      });
    }

    if (audioSender && audioTrack) {
      audioSender.replaceTrack(audioTrack)
        .then(() => console.log("[PLACEHOLDER] Successfully replaced audio track in PeerConnection"))
        .catch(err => console.error("[PLACEHOLDER] replaceTrack(audio) failed", err));
    } else {
      console.warn("[PLACEHOLDER] Could not replace audio track", {
        hasAudioSender: !!audioSender,
        hasAudioTrack: !!audioTrack
      });
    }
  } else {
    console.log("[PLACEHOLDER] No PeerConnection yet → placeholder tracks will be used on next negotiation");
  }

  return true;
};


// Add this useEffect to check partner for call info
// Update the useEffect that checks partner for call info
useEffect(() => {
  if (partner && !callInfo.callId) {
    console.log("[PARTNER-CHECK] Checking partner for call info", {
      partnerId: partner.id || partner._id || partner.partnerId,
      videoCallId: partner.videoCallId,
      roomId: partner.roomId,
      hasCallInfo: !!(partner.videoCallId || partner.roomId),
      socketId: socket?.id?.substring(0, 8)
    });

    // Check if partner has call info
    const partnerCallId = partner.videoCallId || partner.callId;
    const partnerRoomId = partner.roomId || partnerCallId;
    
    if (partnerCallId) {
      console.log("[PARTNER-CHECK] Found call info in partner object", {
        callId: partnerCallId,
        roomId: partnerRoomId
      });
      
      const currentSocketId = socket?.id;
      const partnerId = partner.id || partner._id || partner.partnerId;
      
      // Fix: Ensure we have both socket IDs
      if (currentSocketId && partnerId) {
        const isCaller = currentSocketId < partnerId;
        
        console.log("[PARTNER-CHECK] Role decision:", {
          mySocketId: currentSocketId.substring(0, 8),
          partnerSocketId: partnerId.substring(0, 8),
          isCaller,
          rule: "lower socket ID becomes caller"
        });
        
        setCallInfo(prev => ({
          ...prev,
          callId: partnerCallId,
          roomId: partnerRoomId,
          isCaller,
          partnerId,
          initialized: false
        }));
      } else {
        console.warn("[PARTNER-CHECK] Missing socket IDs, defaulting to caller=false", {
          hasMySocketId: !!currentSocketId,
          hasPartnerId: !!partnerId
        });
        
        setCallInfo(prev => ({
          ...prev,
          callId: partnerCallId,
          roomId: partnerRoomId,
          isCaller: false, // Default to callee if we can't determine
          partnerId: partnerId || 'unknown',
          initialized: false
        }));
      }
    }
  }
}, [partner, socket, callInfo.callId]);
// ────────────────────────────────────────────────────────────────

useEffect(() => {
  console.log("[REMOTE_RECOVERY] Started orphaned remote tracks recovery monitor (every 2s)");

  const checkInterval = setInterval(() => {
    if (!peerConnectionRef.current) {
      // console.debug("[REMOTE_RECOVERY] No PeerConnection yet");
      return;
    }

    const currentRemoteTrackCount = remoteStreamRef.current?.getTracks()?.length || 0;

    if (currentRemoteTrackCount > 0) {
      // console.debug("[REMOTE_RECOVERY] Remote stream already has tracks → skipping check");
      return;
    }

    console.log("[REMOTE_RECOVERY] Remote stream is empty → checking receivers for orphaned tracks");

    const receivers = peerConnectionRef.current.getReceivers();

    console.log("[REMOTE_RECOVERY] Found receivers", { count: receivers.length });

    receivers.forEach((receiver, index) => {
      const track = receiver.track;

      if (!track) {
        console.debug("[REMOTE_RECOVERY] Receiver", index, "has no track");
        return;
      }

      console.log("[REMOTE_RECOVERY] Receiver track found", {
        kind: track.kind,
        id: track.id,
        readyState: track.readyState,
        enabled: track.enabled,
        muted: track.muted
      });

      if (track.readyState === 'live') {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          console.log("[REMOTE_RECOVERY] Created new remote MediaStream for orphaned tracks");
        }

        const alreadyAdded = remoteStreamRef.current
          .getTracks()
          .some(t => t.id === track.id);

        if (!alreadyAdded) {
          remoteStreamRef.current.addTrack(track);
          console.log("[REMOTE_RECOVERY] Added orphaned live track to remote stream", {
            kind: track.kind,
            id: track.id,
            readyState: track.readyState
          });

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            console.log("[REMOTE_RECOVERY] Updated remote <video> element srcObject");
          }

          setRemoteStream(remoteStreamRef.current);
        } else {
          console.debug("[REMOTE_RECOVERY] Track already in remote stream", { id: track.id });
        }
      }
    });
  }, 2000);

  return () => {
    clearInterval(checkInterval);
    console.log("[REMOTE_RECOVERY] Orphaned track recovery monitor stopped");
  };
}, []);

// ────────────────────────────────────────────────────────────────

const monitorRemoteStream = (stream) => {
  if (!stream) {
    console.warn("[REMOTE_MONITOR] monitorRemoteStream called with null/undefined stream");
    return;
  }

  console.log("[REMOTE_MONITOR] Starting to monitor remote stream tracks", {
    videoCount: stream.getVideoTracks().length,
    audioCount: stream.getAudioTracks().length,
    active: stream.active
  });

  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];

  if (videoTrack) {
    setIsRemoteVideoMuted(!videoTrack.enabled);
    console.log("[REMOTE_MONITOR] Remote video track status", {
      enabled: videoTrack.enabled,
      muted: videoTrack.muted,
      readyState: videoTrack.readyState
    });

    videoTrack.onmute = () => {
      console.log("[REMOTE_MONITOR] Remote video → MUTED");
      setIsRemoteVideoMuted(true);
    };

    videoTrack.onunmute = () => {
      console.log("[REMOTE_MONITOR] Remote video → UNMUTED");
      setIsRemoteVideoMuted(false);
    };
  } else {
    console.warn("[REMOTE_MONITOR] No remote video track present");
  }

  if (audioTrack) {
    setIsRemoteAudioMuted(!audioTrack.enabled);
    console.log("[REMOTE_MONITOR] Remote audio track status", {
      enabled: audioTrack.enabled,
      muted: audioTrack.muted,
      readyState: audioTrack.readyState
    });

    audioTrack.onmute = () => {
      console.log("[REMOTE_MONITOR] Remote audio → MUTED");
      setIsRemoteAudioMuted(true);
    };

    audioTrack.onunmute = () => {
      console.log("[REMOTE_MONITOR] Remote audio → UNMUTED");
      setIsRemoteAudioMuted(false);
    };
  } else {
    console.warn("[REMOTE_MONITOR] No remote audio track present");
  }
};

  const createPeerConnection = useCallback(
    createPeerConnectionFn({
      peerConnectionRef,
      localStreamRef,
      remoteStreamRef,
      remoteVideoRef,
      socket,
      callInfo,
      sendWebRTCIceCandidate,
      sendWebRTCOffer,
      addNotification,
      setConnectionStatus,
      startStatsCollection,
      forceStreamSync,
      setRemoteStream,
      monitorRemoteStream,
      userProfile,
      isVideoEnabled,
      isAudioEnabled,
      attemptReconnect,
      reconnectAttemptsRef,
      maxReconnectAttempts,
      setIsRemoteVideoMuted,
      setIsRemoteAudioMuted
    }),
    [
      socket,
      callInfo,
      sendWebRTCIceCandidate,
      sendWebRTCOffer,
      userProfile,
      isVideoEnabled,
      isAudioEnabled,
      addNotification,
      startStatsCollection,
      attemptReconnect,
      forceStreamSync
    ]
  );

  const initializeWebRTCConnection = useCallback(
    initializeWebRTCConnectionFn({
      initializationRef,
      partner,
      addNotification,
      localStreamRef,
      initializeLocalStream,
      callInfo,
      setCallInfo,
      setConnectionStatus,
      iceServers,
      fetchIceServers,
      createPeerConnection,
      socket,
      sendWebRTCOffer,
      userProfile,
      isVideoEnabled,
      isAudioEnabled,
      sendWebRTCAnswer,
      connectionStatus,
      forceStreamSync,
      reconnectAttemptsRef,
      maxReconnectAttempts,
      peerConnectionRef,
      offerTimeoutRefs
    }),
    [
      partner,
      callInfo,
      iceServers,
      createPeerConnection,
      fetchIceServers,
      sendWebRTCOffer,
      sendWebRTCAnswer,
      userProfile,
      isVideoEnabled,
      isAudioEnabled,
      addNotification,
      socket,
      connectionStatus,
      initializeLocalStream,
      forceStreamSync
    ]
  );



// --- Callbacks with detailed logs ---
// Update the handleVideoMatchReady callback
const handleVideoMatchReady = useCallback((data) => {
  console.log("[VIDEO_MATCH] 🎯 Video match ready event received", {
    partnerId: data.partnerId,
    callId: data.callId,
    roomId: data.roomId,
    timestamp: data.timestamp,
    hasPartnerProfile: !!data.partnerProfile,
    source: data.source || 'unknown'
  });

  if (videoMatchReadyRef.current) {
    console.warn("[VIDEO_MATCH] ⚠️ Already processed video match — ignoring duplicate event");
    return;
  }

  videoMatchReadyRef.current = true;

  // Get partner ID from various possible sources
  const partnerId = data.partnerId ||
                    partner?.id ||
                    partner?._id ||
                    partner?.partnerId;

  if (!partnerId) {
    console.error("[VIDEO_MATCH] ❌ No partner ID found in match data", {
      data,
      partner: partner ? 'exists' : 'missing'
    });
    return;
  }

  const currentSocketId = socket?.id;
  const matchTime = data.timestamp || Date.now();

  // Classic deterministic caller role: lower socket ID wins
  const isCaller = currentSocketId && partnerId && (currentSocketId < partnerId);

  console.log("[VIDEO_MATCH] 📞 Role decision", {
    mySocketId: currentSocketId?.substring(0, 8) || "not-connected",
    partnerSocketId: partnerId?.substring(0, 8) || "unknown",
    isCaller,
    decisionRule: "lower socket ID becomes caller",
    matchTimestamp: new Date(matchTime).toISOString()
  });

  // CRITICAL: Update callInfo with all necessary data
  setCallInfo(prev => {
    const newCallInfo = {
      ...prev,
      callId: data.callId,
      roomId: data.roomId || data.callId, // Use callId as fallback for roomId
      isCaller,
      partnerId,
      initialized: false
    };
    
    console.log("[VIDEO_MATCH] 📞 Call info updated", newCallInfo);
    return newCallInfo;
  });

  // Force a check after setting call info
  setTimeout(() => {
    console.log("[VIDEO_MATCH] 🚀 Triggering WebRTC check after match");
    if (localStreamRef.current && !callInfo.initialized) {
      console.log("[VIDEO_MATCH] Conditions met, should trigger WebRTC soon");
    }
  }, 500);

  addNotification?.('Video call is ready!', 'success');

}, [socket, partner, addNotification, callInfo.initialized]);

const handleWebRTCOffer = useCallback(async (data) => {
  console.log("[OFFER] 📥 Received WebRTC offer", {
    from: data.from?.substring?.(0,8) + "..." || "unknown",
    callId: data.callId,
    roomId: data.roomId,
    sdpType: data.sdp?.type,
    hasSdp: !!data.sdp
  });

  const pc = peerConnectionRef.current;

  if (!pc || !data.sdp) {
    console.warn("[OFFER] ⚠️ Ignoring offer — missing PeerConnection or SDP", {
      pcExists: !!pc,
      hasSdp: !!data.sdp
    });
    return;
  }

  console.log("[OFFER] Current PeerConnection state before offer", {
    signalingState: pc.signalingState,
    localDesc: pc.localDescription?.type || "none",
    remoteDesc: pc.remoteDescription?.type || "none",
    connectionState: pc.connectionState
  });

  // ─── GLARE DETECTION & RESOLUTION ─────────────────────────────
  if (pc.localDescription?.type === 'offer') {
    console.warn("[OFFER] ⚠️ GLARE DETECTED — we already sent an offer");

    const ourId = socket?.id;
    const theirId = data.from;

    const weWinGlare = ourId && theirId && ourId < theirId;

    console.log("[OFFER] Glare resolution", {
      ourSocket: ourId?.substring(0,8) || "missing",
      theirSocket: theirId?.substring(0,8) || "missing",
      weWin: weWinGlare,
      winner: weWinGlare ? "us (caller)" : "them (caller)"
    });

    if (weWinGlare) {
      console.log("[OFFER] We win glare → ignoring their offer & re-sending ours");
      if (pc.localDescription) {
        try {
          await sendWebRTCOffer({
            to: data.from,
            sdp: pc.localDescription,
            callId: data.callId || callInfo.callId,
            roomId: data.roomId || callInfo.roomId,
            metadata: {
              username: userProfile?.username || 'Anonymous',
              videoEnabled: isVideoEnabled,
              audioEnabled: isAudioEnabled
            }
          });
          console.log("[OFFER] Re-sent our offer after winning glare");
        } catch (err) {
          console.error("[OFFER] Failed to re-send offer after glare win", err);
        }
      }
      return;
    }

    // They win → rollback our offer
    console.log("[OFFER] They win glare → rolling back our local offer");
    try {
      await pc.setLocalDescription(null);
      console.log("[OFFER] Local description rolled back successfully");
    } catch (err) {
      console.warn("[OFFER] Rollback failed (may be non-critical in this browser)", err);
    }
  }

  try {
    console.log("[OFFER] Setting remote description (offer) as callee");

    setCallInfo(prev => ({
      ...prev,
      callId: data.callId || prev.callId,
      partnerId: data.from || prev.partnerId,
      roomId: data.roomId || prev.roomId,
      isCaller: false
    }));

    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    console.log("[OFFER] Remote description (offer) set successfully");

    const answer = await pc.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });

    console.log("[OFFER] Answer created");

    await pc.setLocalDescription(answer);
    console.log("[OFFER] Local description (answer) set");

    await sendWebRTCAnswer({
      to: data.from,
      sdp: answer,
      callId: data.callId || callInfo.callId,
      roomId: data.roomId || callInfo.roomId
    });

    console.log("[OFFER] Answer sent to caller");

  } catch (error) {
    console.error("[OFFER] Error while processing offer", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')?.slice(0,3)
    });
  }
}, [callInfo, sendWebRTCAnswer, sendWebRTCOffer, userProfile, isVideoEnabled, isAudioEnabled, socket, setCallInfo]);


const handleWebRTCAnswer = useCallback(async (data) => {
  console.log("[ANSWER] 📥 Received WebRTC answer", {
    from: data.from?.substring?.(0,8) + "..." || "unknown",
    callId: data.callId,
    roomId: data.roomId,
    sdpType: data.sdp?.type
  });

  if (data.roomId && !callInfo.roomId) {
    console.log("[ANSWER] Updating missing roomId from answer", { roomId: data.roomId });
    setCallInfo(prev => ({ ...prev, roomId: data.roomId }));
  }

  const pc = peerConnectionRef.current;
  if (!pc || !data.sdp) {
    console.warn("[ANSWER] Ignoring answer — missing PC or SDP", {
      pcExists: !!pc,
      hasSdp: !!data.sdp
    });
    return;
  }

  console.log("[ANSWER] Pre-processing state", {
    signaling: pc.signalingState,
    localDesc: pc.localDescription?.type || "none",
    remoteDesc: pc.remoteDescription?.type || "none",
    connection: pc.connectionState,
    iceConnection: pc.iceConnectionState,
    expectedRole: callInfo.isCaller ? "caller" : "callee"
  });

  // Duplicate / late answer in stable state
  if (pc.signalingState === 'stable' && pc.remoteDescription?.type === 'answer') {
    console.log("[ANSWER] Already stable with answer — likely duplicate/late answer");

    if (pc.localDescription?.type === 'offer' && !callInfo.isCaller) {
      console.log("[ANSWER] Role correction: we sent offer → we are caller");
      setCallInfo(prev => ({ ...prev, isCaller: true }));
    }

    setTimeout(() => {
      const receivers = pc.getReceivers?.() || [];
      console.log("[ANSWER] Receivers snapshot after duplicate answer", { count: receivers.length });
      receivers.forEach((r, i) => {
        if (r.track) console.log(`  Receiver ${i}: ${r.track.kind} ${r.track.readyState}`);
      });
    }, 600);

    return;
  }

  // Normal caller path: have-local-offer → set remote answer
  if (pc.signalingState === 'have-local-offer') {
    console.log("[ANSWER] We are caller → processing answer");

    if (!callInfo.isCaller) {
      console.log("[ANSWER] Role correction: setting isCaller = true");
      setCallInfo(prev => ({ ...prev, isCaller: true }));
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log("[ANSWER] Remote description (answer) set successfully");

      setConnectionStatus?.('connected');
      addNotification?.('Video call connected!', 'success');

      setTimeout(() => {
        const receivers = pc.getReceivers?.() || [];
        console.log("[ANSWER] Receivers after setRemoteDescription", { count: receivers.length });
        if (receivers.length === 0) {
          console.warn("[ANSWER] No receivers yet — check ontrack / addTrack events");
        }
      }, 1200);

    } catch (error) {
      console.error("[ANSWER] Failed to set remote description (answer)", error);

      if (error?.message?.includes('wrong state: stable')) {
        console.warn("[ANSWER] 'wrong state: stable' error — forcing caller role");
        setCallInfo(prev => ({ ...prev, isCaller: true }));
      }
    }

  } else if (pc.signalingState === 'stable' && pc.localDescription?.type === 'offer') {
    console.log("[ANSWER] Stable + local offer → treating as caller & trying setRemote");
    setCallInfo(prev => ({ ...prev, isCaller: true }));

    if (!pc.remoteDescription || pc.remoteDescription.type !== 'answer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log("[ANSWER] Successfully set answer in stable state (recovery)");
      } catch (err) {
        console.warn("[ANSWER] Failed to set answer in stable state", err.message);
      }
    }

  } else {
    console.warn("[ANSWER] Unexpected state when receiving answer", {
      signalingState: pc.signalingState,
      local: pc.localDescription?.type,
      remote: pc.remoteDescription?.type
    });

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log("[ANSWER] Fallback: set remote description anyway");
    } catch (err) {
      console.warn("[ANSWER] Fallback setRemoteDescription failed", err.message);
    }
  }

  setTimeout(() => {
    console.log("[ANSWER] Final PeerConnection state after processing", {
      signaling: pc.signalingState,
      connection: pc.connectionState,
      iceConnection: pc.iceConnectionState,
      localDesc: pc.localDescription?.type || "none",
      remoteDesc: pc.remoteDescription?.type || "none",
      role: callInfo.isCaller ? "caller" : "callee"
    });
  }, 1000);

}, [callInfo, sendWebRTCAnswer, addNotification, setCallInfo, setConnectionStatus]);


const handleWebRTCIceCandidate = useCallback(async (data) => {
  console.log("[ICE] 🧊 Received ICE candidate", {
    from: data.from?.substring?.(0,8) + "..." || "unknown",
    candidateType: data.candidate?.candidate?.split(' ')[7] || "unknown",
    candidatePreview: data.candidate?.candidate
      ? data.candidate.candidate.substring(0, 60) + (data.candidate.candidate.length > 60 ? "..." : "")
      : "no candidate"
  });

  const pc = peerConnectionRef.current;
  if (!pc || !data.candidate) {
    console.warn("[ICE] Ignoring candidate — missing PC or candidate data", {
      pcExists: !!pc,
      hasCandidate: !!data.candidate
    });
    return;
  }

  try {
    if (!pc.remoteDescription) {
      console.log("[ICE] Remote description not set yet → queueing candidate", {
        alreadyQueued: queuedIceCandidatesRef.current?.length || 0
      });

      queuedIceCandidatesRef.current = queuedIceCandidatesRef.current || [];
      queuedIceCandidatesRef.current.push(new RTCIceCandidate(data.candidate));

      setTimeout(() => {
        if (typeof processQueuedIceCandidates === 'function') {
          processQueuedIceCandidates();
          console.log("[ICE] Triggered queued candidates processing");
        }
      }, 120);

      return;
    }

    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    console.log("[ICE] Successfully added ICE candidate");

  } catch (error) {
    console.error("[ICE] Failed to add ICE candidate", {
      message: error.message,
      name: error.name
    });

    // Common case: candidate arrived before remote description
    if (error.message?.includes('remote description was null') ||
        error.message?.includes('Cannot set ICE') ||
        error.message?.includes('Unexpected')) {
      console.log("[ICE] Queueing candidate due to timing issue");
      queuedIceCandidatesRef.current = queuedIceCandidatesRef.current || [];
      queuedIceCandidatesRef.current.push(new RTCIceCandidate(data.candidate));
    }
  }
}, [processQueuedIceCandidates]);



const handleWebRTCEnd = useCallback((data) => {
  log('END', '📵 WebRTC call ended', data);
  addNotification?.('Partner ended the video call', 'info');
  handleDisconnect?.();
}, [addNotification, handleDisconnect]);


  // ==================== EFFECTS ====================

useEffect(() => {
  console.log("[LIFECYCLE] VideoChatScreen component mounted");

  // ─── ICE SERVERS ───────────────────────────────────────────────
  console.log("[ICE] Starting to fetch ICE servers configuration");

  fetchIceServers()
    .then(() => {
      console.log("[ICE] ICE servers fetched successfully");
    })
    .catch(err => {
      console.error("[ICE] Failed to fetch ICE servers", {
        message: err.message,
        name: err.name
      });
    });

  // ─── LOCAL STREAM INITIALIZATION ───────────────────────────────
  const initStream = async () => {
    console.log("[MEDIA] Attempting real camera + microphone initialization");

    const success = await initializeLocalStream(false);

    if (success) {
      console.log("[MEDIA] Real local stream initialized successfully");
    } else {
      console.warn("[MEDIA] Real camera/mic failed → falling back to placeholder");
      const placeholderSuccess = await initializeLocalStream(true);
      if (placeholderSuccess) {
        console.log("[MEDIA] Placeholder stream activated");
      } else {
        console.error("[MEDIA] Even placeholder stream failed to initialize");
      }
    }
  };

  initStream().catch(err => {
    console.error("[MEDIA] Unexpected error during stream init sequence", err);
  });

  // ─── CUSTOM WINDOW EVENTS ──────────────────────────────────────
  const handleVideoCallReady = (event) => {
    console.log("[EVENT] 'video-call-ready' received", event.detail);
    handleVideoMatchReady(event.detail);
  };

  const handleWebRTCOfferEvent = (event) => {
    console.log("[SIGNAL] 'webrtc-offer' received", {
      from: event.detail?.from?.substring?.(0,8) + "..." || "unknown",
      callId: event.detail?.callId
    });
    handleWebRTCOffer(event.detail);
  };

  const handleWebRTCAnswerEvent = (event) => {
    console.log("[SIGNAL] 'webrtc-answer' received", {
      from: event.detail?.from?.substring?.(0,8) + "..." || "unknown",
      callId: event.detail?.callId
    });
    handleWebRTCAnswer(event.detail);
  };

  const handleWebRTCIceCandidateEvent = (event) => {
    console.log("[SIGNAL] 'webrtc-ice-candidate' received", {
      from: event.detail?.from?.substring?.(0,8) + "..." || "unknown"
    });
    handleWebRTCIceCandidate(event.detail);
  };

  const handleWebRTCEndEvent = (event) => {
    console.log("[SIGNAL] 'webrtc-end' received", event.detail);
    handleWebRTCEnd?.(event.detail);
  };

  window.addEventListener('video-call-ready', handleVideoCallReady);
  window.addEventListener('webrtc-offer', handleWebRTCOfferEvent);
  window.addEventListener('webrtc-answer', handleWebRTCAnswerEvent);
  window.addEventListener('webrtc-ice-candidate', handleWebRTCIceCandidateEvent);
  window.addEventListener('webrtc-end', handleWebRTCEndEvent);

  console.log("[EVENT] All global WebRTC event listeners registered");

  // ─── CALL DURATION TIMER ───────────────────────────────────────
  callTimerRef.current = setInterval(() => {
    setCallDuration(prev => {
      const next = prev + 1;
      if (next % 10 === 0) {
        console.log("[TIMER] Call duration:", `${next}s`);
      }
      return next;
    });
  }, 1000);

  console.log("[TIMER] Call duration timer started (updates every 1s)");

  // ─── CONTROLS AUTO-HIDE LOGIC ──────────────────────────────────
  const hideControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      console.debug("[UI] Cleared previous controls auto-hide timeout");
    }

    controlsTimeoutRef.current = setTimeout(() => {
      console.log("[UI] Auto-hiding controls after inactivity");
      setShowControls(true);
    }, 3000);
  };

  hideControls();
  let mouseMoveTimeout;
  
 const handleMouseMove = (e) => {
    if (!showControls) {
      console.log("[UI] Mouse moved → showing controls");
      setShowControls(true);
    }
    
    // Clear existing timeout
    if (mouseMoveTimeout) {
      clearTimeout(mouseMoveTimeout);
    }
    
    // Set new timeout to hide controls
    mouseMoveTimeout = setTimeout(() => {
      console.log("[UI] Hiding controls after inactivity");
      setShowControls(false);
    }, 3000);
  };

    const handleTouchStart = () => {
    if (!showControls) {
      console.log("[UI] Touch detected → showing controls");
      setShowControls(true);
    }
    
    if (mouseMoveTimeout) {
      clearTimeout(mouseMoveTimeout);
    }
    
    mouseMoveTimeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchstart', handleTouchStart);
  // ─── CLEANUP ───────────────────────────────────────────────────
  return () => {
    console.log("[LIFECYCLE] VideoChatScreen unmounting — beginning cleanup");

    cleanup?.();
    console.log("[LIFECYCLE] VideoChatScreen unmounting — beginning cleanup");

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('video-call-ready', handleVideoCallReady);
    window.removeEventListener('webrtc-offer', handleWebRTCOfferEvent);
    window.removeEventListener('webrtc-answer', handleWebRTCAnswerEvent);
    window.removeEventListener('webrtc-ice-candidate', handleWebRTCIceCandidateEvent);
    window.removeEventListener('webrtc-end', handleWebRTCEndEvent);

    console.log("[CLEANUP] All window event listeners removed");

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      console.log("[CLEANUP] Controls auto-hide timeout cleared");
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      console.log("[CLEANUP] Call duration timer stopped");
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      console.log("[CLEANUP] Stats reporting interval cleared");
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      console.log("[CLEANUP] Retry timeout cleared");
    }

    console.log("[LIFECYCLE] Cleanup finished");
  };
}, []);

useEffect(() => {
  const conditions = {
    hasLocalStream: !!localStreamRef.current && localStreamRef.current.active,
    hasPartner: !!partner,
    hasCallId: !!callInfo.callId,
    hasRoomId: !!callInfo.roomId,
    notInitializing: !initializationRef.current,
    notAlreadyInitialized: !callInfo.initialized,
    socketReady: !!socket?.connected,
    connectionNotConnected: connectionStatus !== 'connected' && connectionStatus !== 'connecting'
  };

  console.log("[INIT_CHECK] WebRTC connection init conditions", {
    ...conditions,
    allMet: Object.values(conditions).every(Boolean),
    initializationRef: initializationRef.current,
    callInfoInitialized: callInfo.initialized
  });

  const shouldInitialize = Object.values(conditions).every(Boolean);

  if (!shouldInitialize) {
    const missing = Object.entries(conditions)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    console.log("[INIT_CHECK] ❌ Missing conditions:", missing.join(', '));
    return;
  }

  console.log("[INIT] 🚀 All conditions met → starting WebRTC setup");

  const initWebRTC = async () => {
    console.log("[INIT] About to call initializeWebRTCConnection()");
    
    try {
      // REMOVE this line: initializationRef.current = true;
      // It should be set inside initializeWebRTCConnectionFn
      
      await initializeWebRTCConnection();
      console.log("[INIT] ✓ initializeWebRTCConnection() executed successfully");

      // Mark as initialized after successful connection
      setCallInfo(prev => {
        console.log("[INIT] ✓ Marking callInfo.initialized = true");
        return { ...prev, initialized: true };
      });
      
    } catch (err) {
      console.error("[INIT] ❌ WebRTC connection initialization failed", err);
      
      // Reset on failure
      initializationRef.current = false;
      setCallInfo(prev => ({ ...prev, initialized: false }));
      
      // Retry after delay
      setTimeout(() => {
        console.log("[INIT] 🔄 Retrying initialization after failure");
      }, 3000);
    }
  };

  // Don't wrap in requestAnimationFrame - just call it
  initWebRTC();

}, [partner, callInfo, initializeWebRTCConnection, socket, connectionStatus]);
// ==================== CONTROL FUNCTIONS ====================

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        addNotification(videoTrack.enabled ? 'Video enabled' : 'Video disabled', 'info');
        
        // Update the stream in peer connection if it exists
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders()
            .find(s => s.track?.kind === 'video');
          if (sender) {
            sender.track.enabled = videoTrack.enabled;
          }
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        addNotification(audioTrack.enabled ? 'Audio enabled' : 'Audio disabled', 'info');
        
        // Update the stream in peer connection if it exists
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders()
            .find(s => s.track?.kind === 'audio');
          if (sender) {
            sender.track.enabled = audioTrack.enabled;
          }
        }
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor"
          },
          audio: false
        });
        
        screenStreamRef.current = screenStream;
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
            localVideoRef.current.play().catch(e => console.log('Screen share play error:', e));
          }
          
          setIsScreenSharing(true);
          addNotification('Screen sharing started', 'success');
          
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        const cameraStream = localStreamRef.current;
        const cameraVideoTrack = cameraStream?.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender && cameraVideoTrack) {
          sender.replaceTrack(cameraVideoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = cameraStream;
            localVideoRef.current.play().catch(e => console.log('Camera reattach play error:', e));
          }
          
          screenStreamRef.current?.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
          
          setIsScreenSharing(false);
          addNotification('Screen sharing stopped', 'info');
        }
      }
    } catch (error) {
      console.error('❌ Screen share error:', error);
      if (error.name !== 'NotAllowedError') {
        addNotification('Failed to share screen', 'error');
      }
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-container');
    if (!document.fullscreenElement) {
      videoContainer?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };



  const handleNext = () => {
    console.log('⏭️ Switching to next partner');
       nextPartner();
    // handleDisconnect();
    // setTimeout(() => {
    //   if (nextPartner) {
    //     nextPartner();
    //   }
    // }, 500);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/video/${callInfo.roomId || callInfo.callId}`;
    navigator.clipboard.writeText(link);
    addNotification('Room link copied to clipboard', 'success');
  };

  const retryLocalStream = () => {
    console.log('🔄 Retrying local stream initialization');
    setRetryCount(prev => prev + 1);
    
    if (localStreamRef.current) {
      // Stop animation if it's a placeholder
      if (localStreamRef.current._animationFrame) {
        cancelAnimationFrame(localStreamRef.current._animationFrame);
      }
      
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    setLocalStream(null);
    setHasLocalStream(false);
    setUsingPlaceholder(false);
    
    setTimeout(() => {
      initializeLocalStream(false); // Try real camera first
    }, 500);
  };

  // ==================== DEBUG FUNCTIONS ====================

  const debugLayoutInfo = () => {
    console.log('=== LAYOUT DEBUG ===');
    console.log('Current layout:', videoLayout);
    console.log('Local video:', {
      element: !!localVideoRef.current,
      srcObject: localVideoRef.current?.srcObject,
      paused: localVideoRef.current?.paused,
      readyState: localVideoRef.current?.readyState
    });
    console.log('Remote video:', {
      element: !!remoteVideoRef.current,
      srcObject: remoteVideoRef.current?.srcObject,
      paused: remoteVideoRef.current?.paused,
      readyState: remoteVideoRef.current?.readyState
    });
    console.log('Streams:', {
      localStream: !!localStreamRef.current,
      remoteStream: !!remoteStreamRef.current,
      screenStream: !!screenStreamRef.current
    });
    console.log('===================');
  };

  const debugStreamInfo = () => {
    console.log('=== STREAM DEBUG INFO ===');
    
    // Check if streams are properly stored
    console.log('Stored Streams:', {
      localStreamRef: localStreamRef.current,
      remoteStreamRef: remoteStreamRef.current,
      screenStreamRef: screenStreamRef.current
    });
    
    // Check tracks in each stream
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      console.log('Local Stream Tracks:', tracks.length);
      tracks.forEach((track, i) => {
        console.log(`  Track ${i}:`, {
          kind: track.kind,
          id: track.id?.substring(0, 8),
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label
        });
      });
    }
    
    if (remoteStreamRef.current) {
      const tracks = remoteStreamRef.current.getTracks();
      console.log('Remote Stream Tracks:', tracks.length);
      tracks.forEach((track, i) => {
        console.log(`  Track ${i}:`, {
          kind: track.kind,
          id: track.id?.substring(0, 8),
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label
        });
      });
    }
    
    // Check video elements
    console.log('Video Elements:', {
      localVideo: {
        element: !!localVideoRef.current,
        srcObjectType: localVideoRef.current?.srcObject?.constructor.name,
        srcObjectTracks: localVideoRef.current?.srcObject?.getTracks()?.length
      },
      remoteVideo: {
        element: !!remoteVideoRef.current,
        srcObjectType: remoteVideoRef.current?.srcObject?.constructor.name,
        srcObjectTracks: remoteVideoRef.current?.srcObject?.getTracks()?.length
      }
    });
    
    console.log('Current Layout:', videoLayout);
    console.log('========================');
  };


  const cleanup = () => {
    console.log('🧹 Cleaning up video call');
    
    if (localStreamRef.current?._animationFrame) {
      cancelAnimationFrame(localStreamRef.current._animationFrame);
    }
    
    initializationRef.current = false;
    videoMatchReadyRef.current = false;
    streamRetryCountRef.current = 0;
    reconnectAttemptsRef.current = 0;
    
    if (localStreamRef.current) {
      console.log('🛑 Stopping local stream tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    if (remoteStreamRef.current) {
      console.log('🛑 Stopping remote stream tracks...');
      remoteStreamRef.current.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
      remoteStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      console.log('🛑 Stopping screen stream tracks...');
      screenStreamRef.current.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
      screenStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      console.log('🛑 Closing peer connection...');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionStatus('disconnected');
    setIsScreenSharing(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setCallDuration(0);
    setCallStats(null);
    setHasLocalStream(false);
    setUsingPlaceholder(false);
    setCallInfo({
      callId: null,
      roomId: null,
      isCaller: false,
      partnerId: null,
      initialized: false
    });
    setRetryCount(0);
    setDeviceError(null);
  };

  // ==================== RENDER HELPERS ====================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderConnectionStatus = () => {
    const statusColors = {
      connecting: 'text-yellow-400',
      connected: 'text-green-400',
      disconnected: 'text-red-400',
      failed: 'text-red-500',
      closed: 'text-gray-400',
      new: 'text-blue-400'
    };
    
    const statusText = {
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      failed: 'Connection Failed',
      closed: 'Call Ended',
      new: 'Initializing...'
    };
    
    return (
      <div className={`flex items-center ${statusColors[connectionStatus] || 'text-gray-400'}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${statusColors[connectionStatus]?.replace('text-', 'bg-')}`}></div>
        <span className="text-sm font-medium">
          {statusText[connectionStatus] || connectionStatus}
        </span>
        {connectionStatus === 'connected' && (
          <span className="ml-2 text-xs text-gray-400">
            {formatTime(callDuration)}
          </span>
        )}
      </div>
    );
  };

  const renderDeviceError = () => {
    if (deviceError && !hasLocalStream) {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 z-40 max-w-md">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Camera/Mic Error</h3>
            <p className="text-gray-300 mb-4">
              {deviceError}
            </p>
            <div className="space-y-3">
              <button
                onClick={retryLocalStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-all duration-300"
              >
                Retry Camera
              </button>
              <button
                onClick={() => {
                  createAndUsePlaceholder();
                  setDeviceError(null);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500/80 to-pink-500/80 rounded-lg font-medium hover:opacity-90 transition-all duration-300 border border-purple-500/50"
              >
                Use Placeholder Video
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ==================== COMPREHENSIVE VIDEO LAYOUTS WITH SMOOTH ANIMATIONS ====================

  const renderVideoOverlay = (type, isSmall = false) => {
    if (type === 'remote') {
      if (!remoteStream || connectionStatus !== 'connected') {
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90">
            <div className={`${isSmall ? 'w-12 h-12' : 'w-24 h-24'} rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-4 border border-gray-700/50`}>
              {connectionStatus === 'connecting' ? (
                <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} text-blue-400 animate-pulse`}>
                  <FaVideo />
                </div>
              ) : (
                <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} text-gray-600`}>
                  <FaUser />
                </div>
              )}
            </div>
            <h3 className={`${isSmall ? 'text-sm' : 'text-xl'} font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}>
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Partner'}
            </h3>
          </div>
        );
      }
      
      // Status indicators for remote video
      return (
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          {isRemoteVideoMuted && (
            <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
              <FaVideoSlash className="mr-2" />
              <span>Video Off</span>
            </div>
          )}
          {isRemoteAudioMuted && (
            <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
              <FaMicrophoneSlash className="mr-2" />
              <span>Audio Off</span>
            </div>
          )}
        </div>
      );
    }
    
    if (type === 'local') {
      return (
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          {!isVideoEnabled && (
            <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
              <FaVideoSlash className="mr-2" />
              {!isSmall && <span>Camera Off</span>}
            </div>
          )}
          {!isAudioEnabled && (
            <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
              <FaMicrophoneSlash className="mr-2" />
              {!isSmall && <span>Mic Off</span>}
            </div>
          )}
          {isScreenSharing && (
            <div className="px-3 py-1.5 bg-blue-500/80 backdrop-blur-sm rounded-lg text-sm flex items-center shadow-lg">
              <MdScreenShare className="mr-2" />
              {!isSmall && <span>Screen Sharing</span>}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

const renderVideoLayout = () => {
  const layoutAnimations = {
    pip: "animate-fade-in",
    'grid-horizontal': "animate-slide-in-up",
    'grid-vertical': "animate-slide-in-left",
    'side-by-side': "animate-scale-in",
    stack: "animate-fade-in",
    'focus-remote': "animate-slide-in-right",
    'focus-local': "animate-slide-in-left",
    cinema: "animate-fade-in",
    'speaker-view': "animate-slide-in-up"
  };

  const containerClass = `relative w-full h-full transition-all duration-500 ease-in-out ${
    isChangingLayout ? 'opacity-90 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
  }`;

  // Common video props
  const localVideoProps = {
    ref: localVideoRef,
    autoPlay: true,
    playsInline: true,
    muted: true,
    className: "block w-full h-full object-cover",
    onLoadedMetadata: () => console.log('🎥 Local video metadata loaded'),
    onCanPlay: () => console.log('✅ Local video can play'),
    onError: (e) => console.error('Local video error:', e)
  };

  const remoteVideoProps = {
    ref: remoteVideoRef,
    autoPlay: true,
    playsInline: true,
    className: "block w-full h-full object-cover",
    onLoadedMetadata: () => console.log('🎥 Remote video metadata loaded'),
    onCanPlay: () => console.log('✅ Remote video can play'),
    onError: (e) => console.error('Remote video error:', e)
  };

  switch (videoLayout) {

    case 'grid-horizontal':
      return (
        <div
          ref={videoContainerRef}
          className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full min-h-0 gap-2 p-2 ${layoutAnimations['grid-horizontal']} ${containerClass}`}
        >
          <div className={`${isMobile ? 'h-1/2' : 'flex-1 min-h-0 min-w-0'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`${isMobile ? 'h-1/2' : 'flex-1 min-h-0 min-w-0'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local')}
          </div>
        </div>
      );

    case 'grid-vertical':
      return (
        <div
          ref={videoContainerRef}
          className={`flex ${isMobile ? 'flex-row' : 'flex-col'} h-full min-h-0 gap-2 p-2 ${layoutAnimations['grid-vertical']} ${containerClass}`}
        >
          <div className={`${isMobile ? 'w-1/2' : 'h-1/2 min-h-0'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`${isMobile ? 'w-1/2' : 'h-1/2 min-h-0'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local')}
          </div>
        </div>
      );

    case 'side-by-side':
      return (
        <div
          ref={videoContainerRef}
          className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full min-h-0 gap-3 p-3 ${layoutAnimations['side-by-side']} ${containerClass}`}
        >
          <div className={`${isMobile ? 'h-2/3' : 'w-[70%] min-h-0'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`${isMobile ? 'h-1/3' : 'w-[30%] min-h-0'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local')}
          </div>
        </div>
      );

    case 'stack':
      return (
        <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.stack} ${containerClass}`}>
          <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`absolute ${isMobile ? 'bottom-4 left-4 w-32 h-24' : 'bottom-8 left-8 w-64 h-48'} rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local', true)}
          </div>
        </div>
      );

    case 'cinema':
      return (
        <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.cinema} ${containerClass}`}>
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className={`relative ${isMobile ? 'w-full h-auto' : 'w-auto h-full'} max-w-full max-h-full`}>
              <video
                {...remoteVideoProps}
                className={`${isMobile ? 'w-full h-auto' : 'w-auto h-full'} block object-contain`}
              />
              {renderVideoOverlay('remote')}
            </div>
          </div>

          <div className={`absolute ${isMobile ? 'top-4 right-4 w-32 h-24' : 'top-8 right-8 w-48 h-36'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local', true)}
          </div>
        </div>
      );

    case 'speaker-view':
      return (
        <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['speaker-view']} ${containerClass}`}>
          <div className={`absolute inset-x-0 top-0 h-3/4 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4 h-32' : 'bottom-8 left-1/3 right-1/3 h-1/4'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local', true)}
          </div>
        </div>
      );

    case 'focus-remote':
      return (
        <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['focus-remote']} ${containerClass}`}>
          <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`absolute ${isMobile ? 'top-4 right-4 w-32 h-24' : 'top-8 right-8 w-48 h-36'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local', true)}
          </div>
        </div>
      );

    case 'focus-local':
      return (
        <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['focus-local']} ${containerClass}`}>
          <div className="absolute inset-0">
            <video {...localVideoProps} />
            {renderVideoOverlay('local')}
          </div>

          <div className={`absolute ${isMobile ? 'top-4 left-4 w-32 h-24' : 'top-8 left-8 w-48 h-36'} rounded-xl overflow-hidden border-2 border-gray-700/50`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote', true)}
          </div>
        </div>
      );

    case 'pip':
    default:
      return (
        <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.pip} ${containerClass}`}>
          <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
            <video {...remoteVideoProps} />
            {renderVideoOverlay('remote')}
          </div>

          <div className={`absolute ${isMobile ? 'top-4 right-4 w-40 h-30' : 'top-8 right-8 w-64 h-48'} rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
            <video {...localVideoProps} />
            {renderVideoOverlay('local', true)}
          </div>
        </div>
      );
  }
};

  // ==================== RENDER ====================

  // If searching and no partner, show searching screen
  if (searching && !partner) {
    return (
      <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        {/* Header */}
        <div className="relative px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('home')}
              className="group flex items-center space-x-2 sm:space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">Back to Home</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
                <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Searching for video...
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Searching Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
          <div className="text-center max-w-md">
            {/* Animated Video Icon */}
            <div className="relative mb-6 sm:mb-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
              </div>
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-5xl relative animate-float">
                <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
                <FaVideo className="relative animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Looking for video partner...
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-10 text-sm sm:text-lg">
              We're searching for someone who wants to video chat
            </p>
            
            <div className="space-y-3 sm:space-y-4 max-w-xs mx-auto">
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-full px-4 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block text-sm sm:text-base">
                  Cancel Search
                </span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-4 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm group"
              >
                <FaCog className="inline mr-2 sm:mr-3 group-hover:rotate-180 transition-transform" />
                <span className="text-sm sm:text-base">Video Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
      {/* Layout Selection Modal */}
      {renderLayoutModal()}

      <button
  onClick={async () => {
    console.log("[MANUAL-OFFER] Manually sending offer");
    
    if (!peerConnectionRef.current) {
      console.error("[MANUAL-OFFER] No peer connection");
      return;
    }
    
    try {
      // Force caller role
      setCallInfo(prev => ({ ...prev, isCaller: true }));
      
      // Create and send offer
      const pc = peerConnectionRef.current;
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      
      // Send to partner
      if (callInfo.partnerId && socket) {
        await sendWebRTCOffer({
          to: callInfo.partnerId,
          sdp: offer,
          callId: callInfo.callId,
          roomId: callInfo.roomId,
          metadata: {
            username: userProfile?.username || 'Anonymous',
            videoEnabled: isVideoEnabled,
            audioEnabled: isAudioEnabled
          }
        });
        
        console.log("[MANUAL-OFFER] Offer sent successfully");
        addNotification?.('Manual offer sent', 'success');
      }
    } catch (error) {
      console.error("[MANUAL-OFFER] Failed to send offer:", error);
    }
  }}
  className="fixed bottom-40 right-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center"
>
  <FaPhone className="text-white mr-2" />
  <span className="text-white font-bold text-sm">SEND OFFER</span>
</button>
      
      {/* Device Error Overlay */}
      {renderDeviceError()}
      
      {/* Header */}
      <div className={`relative px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => {
                handleDisconnect();
                setCurrentScreen('home');
              }}
              className="group flex items-center space-x-2 sm:space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">End Call</span>
            </button>
            
            {partner && (
              <div className="group flex items-center space-x-2 sm:space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                  </div>
                  {partnerDisconnected ? (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border border-gray-900"></div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border border-gray-900"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm sm:text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {partner.profile?.username || partner.username || 'Stranger'}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    {renderConnectionStatus()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Layout switcher - Enhanced */}
            <div className="relative group">
              <button
                onClick={() => setShowLayoutModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/30 hover:border-blue-500/30"
              >
                <FaLayout className="text-sm sm:text-base" />
                <span className="hidden sm:inline text-sm font-medium">
                  {getLayoutById(videoLayout).name}
                </span>
                {savedDefaultLayout === videoLayout && (
                  <FaCheck className="text-emerald-400 ml-1" size={12} />
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block animate-slide-down">
                <div className="bg-gray-900/95 backdrop-blur-xl rounded-lg p-3 border border-gray-700/50 shadow-xl min-w-[200px]">
                  <div className="text-xs text-gray-400 mb-2">Current Layout</div>
                  <div className="text-sm font-medium text-white mb-1">
                    {getLayoutById(videoLayout).name}
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    {getLayoutById(videoLayout).description}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveDefaultLayout(videoLayout)}
                      className="flex-1 text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg transition-all duration-300 border border-blue-500/30"
                    >
                      {savedDefaultLayout === videoLayout ? 'Default' : 'Set Default'}
                    </button>
                    <button
                      onClick={() => setShowLayoutModal(true)}
                      className="text-xs px-3 py-1.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-lg transition-all duration-300 border border-gray-700/30"
                    >
                      All Layouts
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick layout buttons */}
            <div className="hidden sm:flex items-center space-x-1 bg-gray-800/30 rounded-lg p-1 backdrop-blur-sm">
              {['pip', 'grid-horizontal', 'grid-vertical', 'side-by-side'].map((layout) => (
                <button
                  key={layout}
                  onClick={() => handleLayoutChange(layout)}
                  className={`p-1.5 rounded transition-all duration-300 ${videoLayout === layout ? 'bg-blue-500/30 border border-blue-500/50' : 'hover:bg-gray-700/30 border border-transparent'}`}
                  title={getLayoutById(layout).name}
                >
                  {getLayoutIconComponent(getLayoutById(layout).icon)}
                </button>
              ))}
            </div>
            
            {/* Placeholder indicator */}
            {usingPlaceholder && (
              <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <span className="text-xs text-purple-300">Placeholder</span>
              </div>
            )}
            
            {/* Theme toggle */}
            <button
              onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
              className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaPalette className="text-sm sm:text-base group-hover:rotate-180 transition-transform" />
            </button>
            
            {/* Copy link */}
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
                title="Copy Room Link"
              >
                <FaLink className="text-sm sm:text-base group-hover:scale-110 transition-transform" />
              </button>
            )}
            
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaCog className="text-sm sm:text-base group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Video Area */}
      <div className="video-container flex-1 relative overflow-hidden bg-black">
        {renderVideoLayout()}
        
        {/* Connection Status Banner */}
        {connectionStatus === 'connecting' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm sm:text-lg font-medium">Establishing connection...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Bar */}
      <div className={`relative bg-gray-900/70 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Main Controls */}
        <div className="p-3 sm:p-4 border-t border-gray-800/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {/* Toggle Video */}
              <button
                onClick={toggleVideo}
                disabled={!hasLocalStream}
                className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isVideoEnabled
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
                  : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? (
                  <FaVideo className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                ) : (
                  <FaVideoSlash className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                )}
              </button>
              
              {/* Toggle Audio */}
              <button
                onClick={toggleAudio}
                disabled={!hasLocalStream}
                className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isAudioEnabled
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
                  : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {isAudioEnabled ? (
                  <FaMicrophone className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                ) : (
                  <FaMicrophoneSlash className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                )}
              </button>
              
              {/* Screen Share */}
              <button
                onClick={toggleScreenShare}
                className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isScreenSharing
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'} group`}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {isScreenSharing ? (
                  <MdStopScreenShare className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                ) : (
                  <MdScreenShare className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                )}
              </button>
              
              {/* End Call */}
              <button
                onClick={handleDisconnect}
                className="p-4 sm:p-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 group transform hover:rotate-6"
                title="End call"
              >
                <FaPhone className="text-xl sm:text-2xl group-hover:rotate-90 transition-transform" />
              </button>
              
              {/* Next Partner */}
              <button
                onClick={handleNext}
                className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-500/30 group"
                title="Next partner"
              >
                <FaRandom className="text-xl sm:text-2xl group-hover:rotate-180 transition-transform" />
              </button>
              
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <FaCompress className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                ) : (
                  <FaExpand className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                )}
              </button>
              
              {/* Layout Quick Switch */}
              <button
                onClick={() => {
                  const layouts = LAYOUT_CONFIG.filter(l => isMobile ? l.mobileFriendly : true);
                  const currentIndex = layouts.findIndex(l => l.id === videoLayout);
                  const nextIndex = (currentIndex + 1) % layouts.length;
                  handleLayoutChange(layouts[nextIndex].id);
                }}
                className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-blue-500/30 group"
                title="Switch layout"
              >
                <FaSync className="text-xl sm:text-2xl group-hover:rotate-180 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Additional Controls */}
        <div className="px-4 pb-2 sm:px-6 sm:pb-3 border-t border-gray-800/30 pt-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowLayoutModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30 flex items-center"
              >
                <FaLayout className="mr-1 sm:mr-2" />
                <span>Change Layout</span>
              </button>
              
              <button
                onClick={copyRoomLink}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30 flex items-center"
              >
                <FaRegCopy className="mr-1 sm:mr-2" />
                <span>Copy Link</span>
              </button>
              
              <button
                onClick={debugLayoutInfo}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
              >
                <FaInfoCircle className="inline mr-1 sm:mr-2" />
                <span>Debug Layout</span>
              </button>
              
              <button
                onClick={debugStreamInfo}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
              >
                <FaInfoCircle className="inline mr-1 sm:mr-2" />
                <span>Debug Streams</span>
              </button>
              
              {!hasLocalStream && (
                <button
                  onClick={retryLocalStream}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
                >
                  <FaSync className="inline mr-1 sm:mr-2" />
                  <span>Retry Camera</span>
                </button>
              )}
              
              <button
                onClick={createAndUsePlaceholder}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
              >
                <FaCamera className="inline mr-1 sm:mr-2" />
                <span>Placeholder</span>
              </button>
              
              {/* Quick Layout Switcher for Mobile */}
              {isMobile && (
                <button
                  onClick={() => {
                    const layouts = ['pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 'stack'];
                    const nextLayout = layouts[(layouts.indexOf(videoLayout) + 1) % layouts.length];
                    handleLayoutChange(nextLayout);
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-indigo-500/30"
                  title="Switch layout"
                >
                  <span>Layout: {videoLayout.replace('-', ' ')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-14 sm:top-16 right-4 sm:right-6 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-700/50 shadow-2xl w-72 sm:w-80 z-50 animate-slide-down">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            {/* Layout Settings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <FaLayout className="mr-2 text-blue-400" />
                Video Layout
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div>
                    <div className="text-sm font-medium">
                      {getLayoutById(videoLayout).name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {savedDefaultLayout === videoLayout ? '✓ Default layout' : 'Current layout'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLayoutModal(true)}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg transition-all duration-300 border border-blue-500/30"
                  >
                    Change
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveDefaultLayout(videoLayout)}
                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 rounded-lg transition-all duration-300 border border-emerald-500/30 flex items-center justify-center"
                  >
                    <FaSave className="mr-2" />
                    Save as Default
                  </button>
                  {savedDefaultLayout && (
                    <button
                      onClick={clearDefaultLayout}
                      className="px-3 py-2 text-sm bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 rounded-lg transition-all duration-300 border border-red-500/30"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Auto-reconnect */}
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoConnect}
                    onChange={toggleAutoConnect}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                    autoConnect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                  }`}></div>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    autoConnect ? 'transform translate-x-5' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-300">Auto-reconnect</span>
              </label>
              <p className="text-xs text-gray-400">
                Automatically search for next partner
              </p>
            </div>

            {/* Partner Info */}
            {partner && (
              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Partner Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{partner.profile?.username || partner.username || 'Stranger'}</div>
                      <div className="text-xs text-gray-400">
                        {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="font-medium">{connectionStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-medium">{formatTime(callDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Settings */}
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Video Settings</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Camera Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${hasLocalStream ? (usingPlaceholder ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300') : 'bg-red-500/20 text-red-300'}`}>
                    {hasLocalStream ? (usingPlaceholder ? 'Placeholder' : 'Connected') : 'Disconnected'}
                  </span>
                </div>
                
                <button
                  onClick={retryLocalStream}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30 hover:scale-[1.02] flex items-center justify-center"
                >
                  <FaSync className="mr-2 animate-spin-slow" />
                  Reinitialize Camera
                </button>
                
                <button
                  onClick={createAndUsePlaceholder}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30 hover:scale-[1.02] flex items-center justify-center"
                >
                  <FaCamera className="mr-2" />
                  {usingPlaceholder ? 'Refresh Placeholder' : 'Use Placeholder'}
                </button>
              </div>
            </div>

            {/* Debug Options */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => {
                  forceStreamSync();
                  addNotification('Forced stream sync', 'info');
                }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30 hover:scale-[1.02]"
              >
                Force Stream Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add enhanced CSS animations
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

export default VideoChatScreen;