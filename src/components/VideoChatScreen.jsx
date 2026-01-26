import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FaArrowLeft, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaPhoneSlash, FaPaperPlane, FaSyncAlt, FaDesktop, FaRedoAlt,
  FaSmile, FaMagic, FaLanguage, FaRandom, FaHeart,
  FaFire, FaBolt, FaGhost, FaUserFriends, FaSearch,
  FaChevronRight, FaChevronLeft, FaUsers, FaGlobe,
  FaExpand, FaCompress, FaShareAlt, FaEllipsisV, FaExclamationTriangle,
  FaComment, FaCog, FaInfoCircle, FaVolumeUp, FaVolumeMute,
  FaCamera, FaKey, FaShieldAlt, FaWifi, FaSignal, FaMobileAlt,
  FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaVideoSlash as FaVideoOff,
  FaUserCircle, FaBell, FaStar, FaRocket
} from 'react-icons/fa';
import { GiSoundWaves, GiPartyPopper } from 'react-icons/gi';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../context/ChatContext';
import './OmegleMobile.css';

// ICE servers configuration - UPDATED
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'balanced', // Changed from 'max-bundle'
  rtcpMuxPolicy: 'require'
};

// Connection states
const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  SEARCHING: 'searching',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
  RECONNECTING: 'reconnecting'
};

// Helper function to check media support
const checkMediaSupport = () => {
  console.log('[checkMediaSupport] Checking media support...');
  const errors = [];
  const warnings = [];

  // Check for mediaDevices API
  if (!navigator.mediaDevices) {
    errors.push('navigator.mediaDevices API is not available');
    console.error('[checkMediaSupport] navigator.mediaDevices API is not available');
  }

  // Check for getUserMedia
  if (!navigator.mediaDevices?.getUserMedia) {
    errors.push('getUserMedia is not available');
    console.error('[checkMediaSupport] getUserMedia is not available');
  }

  // Check for secure context
  const isSecureContext = window.isSecureContext ||
                         window.location.protocol === 'https:' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

  console.log('[checkMediaSupport] Secure context check:', {
    isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname
  });

  if (!isSecureContext) {
    errors.push('Not a secure context. HTTPS required for media access.');
    console.error('[checkMediaSupport] Not a secure context');
  }

  // Check for WebRTC support
  if (!window.RTCPeerConnection) {
    errors.push('WebRTC is not supported in this browser');
    console.error('[checkMediaSupport] WebRTC is not supported');
  }

  console.log('[checkMediaSupport] Support check completed:', {
    supported: errors.length === 0,
    errors,
    warnings,
    isSecureContext
  });

  return {
    supported: errors.length === 0,
    errors,
    warnings,
    isSecureContext
  };
};

const VideoChatScreen = () => {
  console.log('[VideoChatScreen] Component rendering');
  
  const {
    socket,
    partner,
    messages,
    userProfile,
    searching,
    onlineCount,
    sendMessage,
    disconnectPartner,
    nextPartner,
    addNotification,
    handleTypingStart,
    handleTypingStop,
    setCurrentScreen,
    startSearch,
    currentChatMode
  } = useChat();

  console.log('[VideoChatScreen] Context values:', {
    partnerId: partner?.partnerId || partner?.id,
    messagesCount: messages.length,
    searching,
    onlineCount,
    currentChatMode
  });

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const partnerRef = useRef(null);
  const messageEndRef = useRef(null);
  const swipeAreaRef = useRef(null);
  const autoConnectTimerRef = useRef(null);
  const swipeTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const screenShareRef = useRef(null);
  const connectionQualityRef = useRef(null);

  // State
  const [inCall, setInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATES.DISCONNECTED);
  const [debugLogs, setDebugLogs] = useState([]);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [remoteVideoStream, setRemoteVideoStream] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [autoSearch, setAutoSearch] = useState(true);
  const [swipeHintVisible, setSwipeHintVisible] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMounted, setIsMounted] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user');
  const [mediaSupport, setMediaSupport] = useState({ supported: false, errors: [], warnings: [] });
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState('normal');
  const [videoFilters, setVideoFilters] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [callQuality, setCallQuality] = useState({
    video: { width: 0, height: 0, fps: 0 },
    audio: { bitrate: 0, packetsLost: 0 },
    connection: { rtt: 0, jitter: 0 }
  });

  console.log('[VideoChatScreen] State values:', {
    inCall,
    isConnecting,
    connectionStatus,
    hasError,
    screenShareActive,
    showChat,
    showMenu
  });

  // Partner data synchronization helper
  const syncPartnerData = useCallback(() => {
    console.log('[syncPartnerData] Syncing partner data...');
    
    if (!partnerRef.current && partner) {
      console.log('[syncPartnerData] Setting partner from context');
      partnerRef.current = partner;
    }

    if (partnerRef.current) {
      // Ensure all required fields exist
      if (!partnerRef.current.profile && partnerRef.current.partnerProfile) {
        console.log('[syncPartnerData] Copying partnerProfile to profile');
        partnerRef.current.profile = partnerRef.current.partnerProfile;
      }

      if (!partnerRef.current.id && partnerRef.current.partnerId) {
        console.log('[syncPartnerData] Setting id from partnerId');
        partnerRef.current.id = partnerRef.current.partnerId;
      }

      console.log('[syncPartnerData] Current partner data:', {
        partnerId: partnerRef.current.partnerId,
        id: partnerRef.current.id,
        hasVideoCallId: !!partnerRef.current.videoCallId,
        hasRoomId: !!partnerRef.current.roomId,
        profile: partnerRef.current.profile?.username
      });
    }
  }, [partner]);

  // Check media support on component mount
  useEffect(() => {
    console.log('[useEffect] Component mount - checking media support');
    
    const support = checkMediaSupport();
    setMediaSupport(support);

    if (!support.supported) {
      console.error('[useEffect] Media not supported:', support.errors);
      setHasError(true);
      setErrorMessage(support.errors.join('\n'));
      addNotification('Video chat not supported in this browser', 'error');
    }

    // Check for permission status
    if (navigator.permissions) {
      console.log('[useEffect] Checking camera permissions...');
      navigator.permissions.query({ name: 'camera' }).then(result => {
        console.log('[useEffect] Camera permission state:', result.state);
        if (result.state === 'denied') {
          console.warn('[useEffect] Camera permission denied');
          addNotification('Camera permission denied. Please enable in browser settings.', 'warning');
        }
      });

      console.log('[useEffect] Checking microphone permissions...');
      navigator.permissions.query({ name: 'microphone' }).then(result => {
        console.log('[useEffect] Microphone permission state:', result.state);
        if (result.state === 'denied') {
          console.warn('[useEffect] Microphone permission denied');
          addNotification('Microphone permission denied. Please enable in browser settings.', 'warning');
        }
      });
    }

    // Show tutorial for first-time users
    const hasSeenTutorial = localStorage.getItem('videoChatTutorialSeen');
    console.log('[useEffect] Tutorial seen before?', hasSeenTutorial);
    if (!hasSeenTutorial) {
      console.log('[useEffect] Showing tutorial for first-time user');
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }

    return () => {
      console.log('[useEffect] Component cleanup - unmounting');
      setIsMounted(false);
      cleanupMedia();
    };
  }, []);

  // Initialize refs
  useEffect(() => {
    console.log('[useEffect] Initializing socket ref:', { socketId: socket?.id, connected: socket?.connected });
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    syncPartnerData();
  }, [partner, syncPartnerData]);

  // Add debug log
  const addDebugLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const log = {
      id: Date.now(),
      timestamp,
      message,
      type
    };

    if (isMounted) {
      setDebugLogs(prev => [log, ...prev.slice(0, 20)]);
    }

    // Console log based on type
    switch(type) {
      case 'error':
        console.error(`[${timestamp}] ${message}`);
        break;
      case 'warning':
        console.warn(`[${timestamp}] ${message}`);
        break;
      case 'success':
        console.log(`[${timestamp}] ✅ ${message}`);
        break;
      default:
        console.log(`[${timestamp}] ℹ️ ${message}`);
    }

    if (type === 'error') {
      addNotification(message, 'error');
    }
  }, [isMounted, addNotification]);

  // Monitor connection quality
  useEffect(() => {
    if (!pcRef.current || !inCall) {
      console.log('[useEffect] Skipping connection quality monitoring - no active call');
      return;
    }

    console.log('[useEffect] Starting connection quality monitoring');
    
    const interval = setInterval(async () => {
      try {
        console.log('[useEffect] Getting WebRTC stats...');
        const stats = await pcRef.current.getStats();
        let videoStats = { width: 0, height: 0, fps: 0 };
        let audioStats = { bitrate: 0, packetsLost: 0 };
        let connectionStats = { rtt: 0, jitter: 0 };
        let totalPacketsLost = 0;
        let totalPackets = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            videoStats.fps = report.framesPerSecond || 0;
            videoStats.width = report.frameWidth || 0;
            videoStats.height = report.frameHeight || 0;
            totalPacketsLost += report.packetsLost || 0;
            totalPackets += report.packetsReceived || 1;
          }

          if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
            audioStats.bitrate = report.bitrate || 0;
            audioStats.packetsLost = report.packetsLost || 0;
          }

          if (report.type === 'candidate-pair' && report.nominated) {
            connectionStats.rtt = report.currentRoundTripTime * 1000 || 0;
            connectionStats.jitter = report.totalRoundTripTime || 0;
          }
        });

        const packetLossRate = (totalPacketsLost / totalPackets) * 100;
        let quality = 'good';

        if (packetLossRate > 20 || connectionStats.rtt > 500) {
          quality = 'poor';
        } else if (packetLossRate > 10 || connectionStats.rtt > 300) {
          quality = 'average';
        }

        console.log('[useEffect] Connection quality stats:', {
          quality,
          packetLossRate: packetLossRate.toFixed(2),
          videoStats,
          audioStats,
          connectionStats
        });

        setConnectionQuality(quality);
        setCallQuality({
          video: videoStats,
          audio: audioStats,
          connection: connectionStats
        });

      } catch (error) {
        console.error('[useEffect] Error getting stats:', error);
        addDebugLog(`Failed to get connection stats: ${error.message}`, 'error');
      }
    }, 5000);

    return () => {
      console.log('[useEffect] Clearing connection quality monitoring');
      clearInterval(interval);
    };
  }, [inCall, addDebugLog]);

  // Handle when partner updates from context
  useEffect(() => {
    console.log('[useEffect] Partner update detected:', {
      partnerId: partner?.partnerId || partner?.id,
      inCall,
      isConnecting,
      currentChatMode
    });

    if (partner) {
      syncPartnerData();

      // Check if we have all necessary data for video call
      const hasPartnerId = partner.partnerId || partner.id;
      const hasVideoCallId = partner.videoCallId;
      const shouldStartCall = currentChatMode === 'video' && 
                             !inCall && 
                             !isConnecting && 
                             hasPartnerId &&
                             hasVideoCallId;

      if (shouldStartCall) {
        console.log('[useEffect] Conditions met for starting video call:', {
          partnerId: partner.partnerId,
          videoCallId: partner.videoCallId
        });
        setTimeout(() => {
          if (partnerRef.current?.partnerId && socketRef.current?.connected) {
            console.log('[useEffect] Starting video call after delay');
            startVideoCall();
          }
        }, 1000);
      }
    } else {
      console.log('[useEffect] No partner - resetting refs');
      partnerRef.current = null;
      setRemoteVideoStream(null);

      if (autoSearch && !searching && socketRef.current?.connected) {
        console.log('[useEffect] Auto-searching for new partner');
        setTimeout(() => {
          handleStartSearch();
        }, 1000);
      }
    }
  }, [partner, currentChatMode, inCall, isConnecting, autoSearch, searching, syncPartnerData]);

  // Auto-start video call when conditions are met
  useEffect(() => {
    console.log('[useEffect] Checking conditions for auto-start call:', {
      partner: partnerRef.current,
      currentChatMode,
      inCall,
      isConnecting,
      socketConnected: socketRef.current?.connected
    });

    const checkAndStartCall = () => {
      if (partnerRef.current &&
          currentChatMode === 'video' &&
          !inCall &&
          !isConnecting &&
          socketRef.current?.connected) {
        
        console.log('[useEffect] All conditions met for auto-start call');
        
        if (autoConnectTimerRef.current) {
          clearTimeout(autoConnectTimerRef.current);
        }

        autoConnectTimerRef.current = setTimeout(() => {
          if (partnerRef.current?.partnerId && !inCall && !isConnecting) {
            console.log('[useEffect] Executing auto-start call');
            startVideoCall();
          }
        }, 500);
      }
    };

    checkAndStartCall();

    return () => {
      if (autoConnectTimerRef.current) {
        console.log('[useEffect] Cleaning up auto-connect timer');
        clearTimeout(autoConnectTimerRef.current);
      }
    };
  }, [inCall, isConnecting, currentChatMode]);

  // Add this useEffect to listen for context events
  useEffect(() => {
    const handleVideoMatch = (event) => {
      console.log('[VideoChatScreen] Video match event received:', event.detail);
      const partnerData = event.detail.partner;
      
      // Update partner ref
      partnerRef.current = partnerData;
      syncPartnerData();
      
      // Start video call
      if (!inCall && !isConnecting) {
        setTimeout(() => {
          startVideoCall();
        }, 1000);
      }
    };
    
    const handleVideoCallReady = (event) => {
      console.log('[VideoChatScreen] Video call ready:', event.detail);
      // Update partner with call info
      if (partnerRef.current) {
        partnerRef.current = {
          ...partnerRef.current,
          videoCallId: event.detail.callId,
          roomId: event.detail.roomId
        };
      }
    };
    
    // Listen for events from ChatContext
    window.addEventListener('video-match', handleVideoMatch);
    window.addEventListener('video-call-ready', handleVideoCallReady);
    
    return () => {
      window.removeEventListener('video-match', handleVideoMatch);
      window.removeEventListener('video-call-ready', handleVideoCallReady);
    };
  }, [inCall, isConnecting, syncPartnerData]);

  // Socket event handlers
  useEffect(() => {
    console.log('[useEffect] Setting up socket event handlers');
    
    if (!socketRef.current) {
      console.warn('[useEffect] No socket available for event handlers');
      return;
    }

    const handleConnect = () => {
      addDebugLog('Socket connected', 'success');
      console.log('[socket] Socket connected:', socketRef.current?.id);

      if (partnerRef.current?.partnerId && !inCall && !isConnecting) {
        setTimeout(() => {
          startVideoCall();
        }, 1000);
      }
    };

    const handleDisconnect = () => {
      addDebugLog('Socket disconnected', 'error');
      console.error('[socket] Socket disconnected');
      setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
      setInCall(false);
    };

    const handleMatched = (data) => {
      addDebugLog(`Matched with partner: ${data.profile?.username || data.partnerProfile?.username || 'Stranger'}`, 'success');
      console.log('[socket] Matched with partner:', data);

      // Normalize partner data
      const normalizedPartner = {
        ...data,
        id: data.partnerId, // Set id to partnerId for consistency
        profile: data.profile || data.partnerProfile
      };
      
      partnerRef.current = normalizedPartner;

      setTimeout(() => {
        if (partnerRef.current?.partnerId && !inCall && !isConnecting) {
          startVideoCall();
        }
      }, 500);
    };

    const handleSearching = () => {
      console.log('[socket] Searching for partner...');
      setConnectionStatus(CONNECTION_STATES.SEARCHING);
    };

    const handleWebRTCOffer = async (data) => {
      console.log('[socket] Received WebRTC offer:', { 
        from: data.from, 
        sdpType: data.sdp?.type,
        videoCallId: data.videoCallId 
      });
      addDebugLog(`Received call offer from ${data.from || 'unknown'}`, 'info');

      if (!data.sdp || !data.from) {
        console.error('[socket] Invalid offer data received:', data);
        addDebugLog('Invalid offer data received', 'error');
        return;
      }

      if (data.metadata && !partnerRef.current) {
        console.log('[socket] Setting partner from offer metadata');
        partnerRef.current = {
          partnerId: data.from,
          id: data.from,
          videoCallId: data.videoCallId,
          roomId: data.roomId,
          profile: data.metadata || { username: 'Stranger' }
        };
      } else if (data.videoCallId) {
        // Update existing partner with videoCallId
        if (partnerRef.current) {
          partnerRef.current.videoCallId = data.videoCallId;
          partnerRef.current.roomId = data.roomId;
        }
      }

      if (!pcRef.current) {
        console.log('[socket] Handling incoming call');
        await handleIncomingCall(data.sdp, data.from);
      }
    };

    const handleWebRTCAnswer = async (data) => {
      console.log('[socket] Received WebRTC answer:', { sdpType: data.sdp?.type });
      addDebugLog('Received call answer from partner', 'info');

      if (!pcRef.current || !data.sdp) {
        console.warn('[socket] No peer connection or SDP for answer');
        return;
      }

      if (pcRef.current.signalingState === 'have-local-offer') {
        try {
          console.log('[socket] Setting remote description');
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          addDebugLog('Remote description set successfully', 'success');
        } catch (error) {
          console.error('[socket] Failed to set remote description:', error);
          addDebugLog(`Failed to set remote description: ${error.message}`, 'error');
        }
      }
    };

    const handleWebRTCIceCandidate = (data) => {
      console.log('[socket] Received ICE candidate:', data.candidate);
      if (pcRef.current && data.candidate) {
        pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(err => console.error('[socket] Error adding ICE candidate:', err));
      }
    };

    const handleWebRTCEnd = (data) => {
      console.log('[socket] Partner ended the call:', data);
      addDebugLog('Partner ended the call', 'info');
      handleEndCall(false);

      if (autoSearch) {
        setTimeout(() => {
          handleStartSearch();
        }, 1000);
      }
    };

    const handleWebRTCError = (data) => {
      console.error('[socket] WebRTC error:', data.error);
      addDebugLog(`WebRTC error: ${data.error || 'Unknown'}`, 'error');
    };

    const socket = socketRef.current;
    console.log('[useEffect] Attaching socket event listeners');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('matched', handleMatched);
    socket.on('searching', handleSearching);
    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
    socket.on('webrtc-end', handleWebRTCEnd);
    socket.on('webrtc-error', handleWebRTCError);

    return () => {
      console.log('[useEffect] Removing socket event listeners');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('matched', handleMatched);
      socket.off('searching', handleSearching);
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
      socket.off('webrtc-end', handleWebRTCEnd);
      socket.off('webrtc-error', handleWebRTCError);
    };
  }, [inCall, isConnecting, addDebugLog, autoSearch]);

  // Initialize local media with better error handling
  const initializeLocalMedia = async () => {
    console.log('[initializeLocalMedia] Starting media initialization...');
    
    try {
      setIsConnecting(true);
      addDebugLog('Requesting camera/microphone access...', 'info');

      // Check if mediaDevices exists
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = new Error('Camera/microphone API not available. Please use HTTPS and a modern browser.');
        console.error('[initializeLocalMedia] Media devices API not available');
        throw error;
      }

      // Check secure context
      if (window.location.protocol !== 'https:' &&
          window.location.hostname !== 'localhost' &&
          window.location.hostname !== '127.0.0.1') {
        const error = new Error('HTTPS required for camera access. Please use HTTPS or localhost.');
        console.error('[initializeLocalMedia] Not in secure context');
        throw error;
      }

      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: cameraFacing,
          frameRate: { ideal: 30, min: 20 },
          aspectRatio: 16/9
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2,
          sampleRate: 48000,
          sampleSize: 16
        }
      };

      console.log('[initializeLocalMedia] Constraints:', constraints);

      // Try to get device capabilities first
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('[initializeLocalMedia] Available devices:', devices);
        
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        const audioDevices = devices.filter(d => d.kind === 'audioinput');

        if (videoDevices.length === 0) {
          constraints.video = false;
          console.warn('[initializeLocalMedia] No camera detected');
          addNotification('No camera found. You can still use audio chat.', 'warning');
        }

        if (audioDevices.length === 0) {
          constraints.audio = false;
          console.warn('[initializeLocalMedia] No microphone detected');
          addNotification('No microphone found. You can use text chat.', 'warning');
        }
      } catch (deviceError) {
        console.warn('[initializeLocalMedia] Could not enumerate devices:', deviceError);
      }

      console.log('[initializeLocalMedia] Requesting user media...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[initializeLocalMedia] User media granted, stream:', stream);

      // Set up audio monitoring
      if (constraints.audio) {
        console.log('[initializeLocalMedia] Setting up audio monitoring');
        setupAudioMonitoring(stream);
      }

      localStreamRef.current = stream;
      setLocalVideoStream(stream);

      if (localVideoRef.current) {
        console.log('[initializeLocalMedia] Setting local video source');
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;

        localVideoRef.current.onloadedmetadata = () => {
          console.log('[initializeLocalMedia] Local video metadata loaded');
          localVideoRef.current.play().catch(e => {
            console.error('[initializeLocalMedia] Local video play error:', e);
          });
        };

        // Apply video filters if any
        if (videoFilters.length > 0) {
          console.log('[initializeLocalMedia] Applying video filters:', videoFilters);
          applyVideoFilters(localVideoRef.current, videoFilters);
        }
      }

      setIsConnecting(false);
      addDebugLog('Camera/microphone access granted', 'success');
      console.log('[initializeLocalMedia] Media initialization completed successfully');
      return stream;

    } catch (error) {
      console.error('[initializeLocalMedia] Error accessing media devices:', error);
      setIsConnecting(false);

      let userMessage = 'Cannot access camera/microphone. ';

      switch(error.name) {
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          userMessage += 'No camera/microphone found.';
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          userMessage += 'Camera/microphone is in use by another application.';
          break;
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          userMessage += 'Permission denied. Please allow camera/microphone access.';
          break;
        case 'OverconstrainedError':
          userMessage += 'Camera constraints cannot be met.';
          break;
        case 'TypeError':
          userMessage += 'Camera/microphone API not available. Use HTTPS.';
          break;
        default:
          userMessage += error.message;
      }

      console.error('[initializeLocalMedia] User-friendly error:', userMessage);
      addNotification(userMessage, 'error');
      setHasError(true);
      setErrorMessage(userMessage);
      throw error;
    }
  };

  // Audio monitoring for visual feedback
  const setupAudioMonitoring = (stream) => {
    console.log('[setupAudioMonitoring] Setting up audio monitoring');
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        // Visual feedback for audio level
        if (connectionQualityRef.current) {
          const level = Math.min(100, (average / 128) * 100);
          connectionQualityRef.current.style.setProperty('--audio-level', `${level}%`);
        }
      };

      const interval = setInterval(checkAudioLevel, 100);
      console.log('[setupAudioMonitoring] Audio monitoring started');

      // Cleanup on unmount
      return () => {
        console.log('[setupAudioMonitoring] Cleaning up audio monitoring');
        clearInterval(interval);
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    } catch (error) {
      console.error('[setupAudioMonitoring] Failed to setup audio monitoring:', error);
    }
  };

  // Browser detection helper
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'unknown';
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'safari';
    } else if (ua.includes('Edg')) {
      browser = 'edge';
    }
    
    return { browser, version: ua.match(/(Chrome|Firefox|Safari|Edg)\/(\d+)/)?.[2] || 'unknown' };
  };

  // Start video call with partner
  const startVideoCall = async () => {
    console.log('[startVideoCall] Starting video call process');
    
    try {
      if (!partnerRef.current) {
        console.warn('[startVideoCall] Cannot start call: No partner available');
        addDebugLog('Cannot start call: No partner available', 'error');
        setTimeout(() => {
          if (partnerRef.current) {
            startVideoCall();
          }
        }, 1000);
        return;
      }

      // Use partnerId instead of id
      const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
      if (!partnerId) {
        console.error('[startVideoCall] Cannot start call: No partner ID available');
        addDebugLog('Cannot start call: No partner ID available', 'error');
        return;
      }

      console.log('[startVideoCall] Starting WebRTC call:', {
        partnerId,
        videoCallId: partnerRef.current.videoCallId,
        roomId: partnerRef.current.roomId
      });
      addDebugLog(`Initializing WebRTC with partner: ${partnerId}`, 'info');

      if (!socketRef.current?.connected) {
        console.warn('[startVideoCall] Socket not connected, waiting...');
        addDebugLog('Socket not connected, waiting...', 'warning');
        setTimeout(() => {
          if (socketRef.current?.connected) {
            startVideoCall();
          }
        }, 1000);
        return;
      }

      setIsConnecting(true);
      setConnectionStatus(CONNECTION_STATES.CONNECTING);
      console.log('[startVideoCall] Setting connection status to CONNECTING');

      // Browser-specific configuration
      const browser = getBrowserInfo();
      console.log('[startVideoCall] Browser detected:', browser);
      
      let pcConfig = {
        iceServers: ICE_SERVERS.iceServers,
        iceTransportPolicy: 'all'
      };
      
      // Adjust for different browsers
      switch (browser.browser) {
        case 'firefox':
          pcConfig.bundlePolicy = 'balanced';
          break;
        case 'safari':
          pcConfig.bundlePolicy = 'max-compat';
          break;
        default:
          pcConfig.bundlePolicy = 'balanced';
      }

      // Create peer connection
      console.log('[startVideoCall] Creating RTCPeerConnection with config:', pcConfig);
      const pc = new RTCPeerConnection(pcConfig);
      pcRef.current = pc;
      console.log('[startVideoCall] Peer connection created:', pc);

      // Add local stream tracks
      if (localStreamRef.current) {
        console.log('[startVideoCall] Adding local stream tracks');
        localStreamRef.current.getTracks().forEach(track => {
          try {
            const sender = pc.addTrack(track, localStreamRef.current);
            console.log(`[startVideoCall] Added ${track.kind} track:`, track);
          } catch (error) {
            console.error('[startVideoCall] Error adding track:', error);
          }
        });
      } else {
        try {
          console.log('[startVideoCall] No local stream, initializing media');
          const stream = await initializeLocalMedia();
          stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
          });
        } catch (error) {
          console.error('[startVideoCall] Failed to initialize media:', error);
          setIsConnecting(false);
          return;
        }
      }

      // Set up event handlers
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current?.connected && partnerId) {
          console.log('[startVideoCall] ICE candidate generated:', event.candidate);
          socketRef.current.emit('webrtc-ice-candidate', {
            to: partnerId,
            candidate: event.candidate,
            videoCallId: partnerRef.current?.videoCallId,
            roomId: partnerRef.current?.roomId
          });
        } else if (event.candidate === null) {
          console.log('[startVideoCall] All ICE candidates generated');
        }
      };

      pc.ontrack = (event) => {
        console.log('[startVideoCall] Remote track received:', event.track.kind);
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          setRemoteVideoStream(remoteStream);
          console.log('[startVideoCall] Remote stream set:', remoteStream);

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.onloadedmetadata = () => {
              console.log('[startVideoCall] Remote video metadata loaded');
              remoteVideoRef.current.play().catch(e =>
                console.error('[startVideoCall] Remote video play error:', e)
              );
            };
          }
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[startVideoCall] Connection state changed: ${state}`);
        setConnectionStatus(state);

        switch(state) {
          case 'connected':
            console.log('[startVideoCall] WebRTC connection established!');
            setInCall(true);
            setIsConnecting(false);
            addDebugLog('Video call connected!', 'success');
            addReaction('🎉');
            startCallTimer();
            break;

          case 'disconnected':
          case 'failed':
            console.log(`[startVideoCall] Connection ${state}, attempting reconnect`);
            if (partnerRef.current) {
              handleReconnect();
            }
            break;

          case 'closed':
            console.log('[startVideoCall] Connection closed');
            setInCall(false);
            setIsConnecting(false);
            setRemoteVideoStream(null);
            break;
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[startVideoCall] ICE connection state: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          console.log('[startVideoCall] ICE connection failed, attempting reconnect');
          handleReconnect();
        }
      };

      pc.onsignalingstatechange = () => {
        console.log(`[startVideoCall] Signaling state: ${pc.signalingState}`);
      };

      // Create and send offer
      try {
        console.log('[startVideoCall] Creating offer...');
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          voiceActivityDetection: true
        });
        
        console.log('[startVideoCall] Offer created:', offer.type);
        
        // Set local description with the offer (NO SDP modification)
        await pc.setLocalDescription(offer);
        console.log('[startVideoCall] Local description set');

        // Send offer to partner
        socketRef.current.emit('webrtc-offer', {
          to: partnerId,
          sdp: offer,
          videoCallId: partnerRef.current?.videoCallId,
          roomId: partnerRef.current?.roomId,
          metadata: {
            username: userProfile?.username || 'Anonymous',
            userId: userProfile?.id || 'unknown',
            timestamp: Date.now()
          }
        });

        console.log('[startVideoCall] Offer sent to partner:', partnerId);
        addDebugLog('Call offer sent successfully', 'success');

      } catch (error) {
        console.error('[startVideoCall] Error creating/sending offer:', error);
        addDebugLog(`Offer failed: ${error.message}`, 'error');
        setIsConnecting(false);
        setConnectionStatus(CONNECTION_STATES.FAILED);
      }

    } catch (error) {
      console.error('[startVideoCall] Error starting video call:', error);
      addDebugLog(`Call start failed: ${error.message}`, 'error');
      setIsConnecting(false);
      setConnectionStatus(CONNECTION_STATES.FAILED);
      setHasError(true);
      setErrorMessage(error.message);
    }
  };

  // Handle incoming call
  const handleIncomingCall = async (offerSdp, fromPartnerId) => {
    console.log(`[handleIncomingCall] Accepting incoming call from ${fromPartnerId}`);
    
    try {
      addDebugLog(`Accepting incoming call from ${fromPartnerId}...`, 'info');
      setIsConnecting(true);

      if (!partnerRef.current && fromPartnerId) {
        console.log('[handleIncomingCall] Setting partner from incoming call');
        partnerRef.current = {
          partnerId: fromPartnerId,
          id: fromPartnerId,
          profile: { username: 'Stranger' }
        };
      }

      console.log('[handleIncomingCall] Creating RTCPeerConnection');
      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS.iceServers,
        iceTransportPolicy: 'all',
        bundlePolicy: 'balanced'
      });
      pcRef.current = pc;

      if (localStreamRef.current) {
        console.log('[handleIncomingCall] Adding existing local tracks');
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      } else {
        console.log('[handleIncomingCall] Initializing new media');
        await initializeLocalMedia();
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
          });
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current?.connected && partnerRef.current) {
          const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
          if (partnerId) {
            console.log('[handleIncomingCall] Sending ICE candidate');
            socketRef.current.emit('webrtc-ice-candidate', {
              to: partnerId,
              candidate: event.candidate,
              videoCallId: partnerRef.current?.videoCallId
            });
          }
        }
      };

      pc.ontrack = (event) => {
        console.log('[handleIncomingCall] Remote track received');
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          setRemoteVideoStream(remoteStream);

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.onloadedmetadata = () => {
              remoteVideoRef.current.play().catch(e =>
                console.error('[handleIncomingCall] Remote video play error:', e)
              );
            };
          }
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[handleIncomingCall] Connection state: ${state}`);
        setConnectionStatus(state);

        if (state === 'connected') {
          setInCall(true);
          setIsConnecting(false);
          addDebugLog('Incoming call accepted and connected', 'success');
          startCallTimer();
        } else if (state === 'failed' || state === 'disconnected') {
          setIsConnecting(false);
        }
      };

      console.log('[handleIncomingCall] Setting remote description');
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      
      console.log('[handleIncomingCall] Creating answer');
      const answer = await pc.createAnswer({
        voiceActivityDetection: true
      });
      
      await pc.setLocalDescription(answer);
      console.log('[handleIncomingCall] Local description set');

      const partnerId = partnerRef.current?.partnerId || partnerRef.current?.id || fromPartnerId;
      if (socketRef.current && partnerId) {
        console.log('[handleIncomingCall] Sending answer to partner');
        socketRef.current.emit('webrtc-answer', {
          to: partnerId,
          sdp: answer,
          videoCallId: partnerRef.current?.videoCallId
        });
        addDebugLog('Call answer sent successfully', 'success');
      }

    } catch (error) {
      console.error('[handleIncomingCall] Error accepting incoming call:', error);
      addDebugLog(`Failed to accept call: ${error.message}`, 'error');
      setIsConnecting(false);
      setConnectionStatus(CONNECTION_STATES.FAILED);
    }
  };

  // Handle reconnect
  const handleReconnect = () => {
    console.log('[handleReconnect] Attempting to reconnect');
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    reconnectTimerRef.current = setTimeout(() => {
      if (partnerRef.current && socketRef.current?.connected) {
        console.log('[handleReconnect] Executing reconnect');
        addDebugLog('Attempting to reconnect call...', 'info');
        startVideoCall();
      } else {
        console.log('[handleReconnect] Cannot reconnect - no partner or socket disconnected');
      }
    }, 2000);
  };

  // Start call timer
  const startCallTimer = () => {
    console.log('[startCallTimer] Starting call timer');
    const startTime = Date.now();

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    callTimerRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setCallDuration(duration);

      // Log every 30 seconds
      if (duration % 30 === 0) {
        console.log(`[startCallTimer] Call duration: ${formatTime(duration)}`);
      }

      // Auto-disconnect after 1 hour for safety
      if (duration > 3600) {
        console.log('[startCallTimer] Auto-disconnecting after 1 hour');
        handleEndCall(true);
        addNotification('Call automatically ended after 1 hour', 'info');
      }
    }, 1000);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle end call
  const handleEndCall = (notifyPartner = true) => {
    console.log('[handleEndCall] Ending call', { notifyPartner });
    
    try {
      addDebugLog('Ending call...', 'info');

      if (pcRef.current) {
        console.log('[handleEndCall] Closing peer connection');
        pcRef.current.close();
        pcRef.current = null;
      }

      if (notifyPartner && socketRef.current && partnerRef.current) {
        const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
        if (partnerId) {
          console.log('[handleEndCall] Notifying partner of call end');
          socketRef.current.emit('webrtc-end', {
            to: partnerId,
            reason: 'user_ended',
            videoCallId: partnerRef.current?.videoCallId
          });
        }
      }

      setInCall(false);
      setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
      setRemoteVideoStream(null);
      setCallDuration(0);
      console.log('[handleEndCall] State reset complete');

      if (callTimerRef.current) {
        console.log('[handleEndCall] Clearing call timer');
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      if (reconnectTimerRef.current) {
        console.log('[handleEndCall] Clearing reconnect timer');
        clearTimeout(reconnectTimerRef.current);
      }

    } catch (error) {
      console.error('[handleEndCall] Error ending call:', error);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    console.log('[toggleAudio] Toggling audio');
    
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        console.log(`[toggleAudio] Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
        addDebugLog(`Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`, 'info');
        addReaction(audioTrack.enabled ? '🔊' : '🔇');
      } else {
        console.warn('[toggleAudio] No audio track found');
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    console.log('[toggleVideo] Toggling video');
    
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        console.log(`[toggleVideo] Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
        addDebugLog(`Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`, 'info');
        addReaction(videoTrack.enabled ? '📹' : '📴');
      } else {
        console.warn('[toggleVideo] No video track found');
      }
    }
  };

  // Toggle camera facing
  const toggleCamera = async () => {
    console.log('[toggleCamera] Toggling camera facing');
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    console.log(`[toggleCamera] New facing mode: ${newFacing}`);

    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { facingMode: newFacing },
        audio: true
      };
      console.log('[toggleCamera] Requesting new stream with constraints:', constraints);
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = newStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newStream.getVideoTracks()[0]);
      }
      console.log('[toggleCamera] Camera flipped successfully');
      addDebugLog(`Camera flipped to ${newFacing}`, 'info');
      addReaction('🔄');
    } catch (error) {
      console.error('[toggleCamera] Error flipping camera:', error);
      addDebugLog(`Camera flip failed: ${error.message}`, 'error');
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    console.log('[toggleScreenShare] Toggling screen share');
    
    try {
      if (!screenShareActive) {
        console.log('[toggleScreenShare] Starting screen share');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: true
        });

        screenShareRef.current = screenStream;
        console.log('[toggleScreenShare] Screen stream obtained:', screenStream);

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current?.getSenders().find(s =>
          s.track?.kind === 'video'
        );

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
          setScreenShareActive(true);
          console.log('[toggleScreenShare] Screen sharing started');
          addDebugLog('Screen sharing started', 'success');
          addReaction('🖥️');

          screenStream.getVideoTracks()[0].onended = () => {
            console.log('[toggleScreenShare] Screen share ended by user');
            toggleScreenShare();
          };
        }
      } else {
        console.log('[toggleScreenShare] Stopping screen share');
        if (screenShareRef.current) {
          screenShareRef.current.getTracks().forEach(track => track.stop());
          screenShareRef.current = null;
        }

        setScreenShareActive(false);

        if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = pcRef.current?.getSenders().find(s =>
            s.track?.kind === 'video'
          );

          if (sender && cameraTrack) {
            await sender.replaceTrack(cameraTrack);
            console.log('[toggleScreenShare] Screen sharing stopped');
            addDebugLog('Screen sharing stopped', 'info');
          }
        }
      }
    } catch (error) {
      console.error('[toggleScreenShare] Screen sharing error:', error);
      addDebugLog(`Screen share failed: ${error.message}`, 'error');
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    console.log('[toggleFullscreen] Toggling fullscreen');
    
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      console.log('[toggleFullscreen] Entering fullscreen');
      elem.requestFullscreen().catch(err => {
        console.error('[toggleFullscreen] Fullscreen error:', err);
      });
    } else {
      console.log('[toggleFullscreen] Exiting fullscreen');
      document.exitFullscreen();
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    console.log('[useEffect] Setting up fullscreen change listener');
    
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      console.log(`[handleFullscreenChange] Fullscreen: ${isFullscreenNow}`);
      setIsFullscreen(isFullscreenNow);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      console.log('[useEffect] Removing fullscreen change listener');
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup media
  const cleanupMedia = () => {
    console.log('[cleanupMedia] Cleaning up media resources...');

    // Clear all timers
    [autoConnectTimerRef, reconnectTimerRef, swipeTimerRef, callTimerRef].forEach(ref => {
      if (ref.current) {
        if (ref === callTimerRef) {
          console.log(`[cleanupMedia] Clearing interval for ${ref}`);
          clearInterval(ref.current);
        } else {
          console.log(`[cleanupMedia] Clearing timeout for ${ref}`);
          clearTimeout(ref.current);
        }
        ref.current = null;
      }
    });

    // Stop and remove all media tracks
    if (localStreamRef.current) {
      console.log('[cleanupMedia] Stopping local stream tracks');
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
      setLocalVideoStream(null);
    }

    // Stop screen share if active
    if (screenShareRef.current) {
      console.log('[cleanupMedia] Stopping screen share stream');
      screenShareRef.current.getTracks().forEach(track => track.stop());
      screenShareRef.current = null;
      setScreenShareActive(false);
    }

    // Clean up peer connection
    if (pcRef.current) {
      console.log('[cleanupMedia] Closing peer connection');
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    // Clean video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteVideoStream(null);
    setInCall(false);
    setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
    console.log('[cleanupMedia] Cleanup completed');
  };

  // Handle swipe to next partner
  const handleSwipeToNext = () => {
    console.log('[handleSwipeToNext] Swiping to next partner');
    addDebugLog('Swiping to next partner', 'info');
    addReaction('👉');

    handleEndCall(true);
    disconnectPartner();

    setSwipeDirection('right');
    setSwipeProgress(100);

    setTimeout(() => {
      setSwipeDirection(null);
      setSwipeProgress(0);
      handleStartSearch();
    }, 300);
  };

  // Initialize swipe gestures
  useEffect(() => {
    console.log('[useEffect] Setting up swipe gestures');
    
    const element = swipeAreaRef.current;
    if (!element) {
      console.warn('[useEffect] No swipe area element found');
      return;
    }

    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
      console.log(`[swipe] Touch start: (${startX}, ${startY})`);
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        const progress = Math.min(Math.abs(deltaX) / 150, 1);
        setSwipeProgress(progress);

        if (deltaX > 0) {
          setSwipeDirection('right');
        } else {
          setSwipeDirection('left');
        }
        
        console.log(`[swipe] Moving: deltaX=${deltaX}, progress=${progress.toFixed(2)}`);
      }
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;

      console.log(`[swipe] Touch end: progress=${swipeProgress.toFixed(2)}, direction=${swipeDirection}`);
      
      if (swipeProgress > 0.5 && swipeDirection === 'right') {
        handleSwipeToNext();
      }

      setTimeout(() => {
        setSwipeProgress(0);
        setSwipeDirection(null);
        isSwiping = false;
      }, 200);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      console.log('[useEffect] Removing swipe gesture listeners');
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeProgress, swipeDirection]);

  // Hide swipe hint after 5 seconds
  useEffect(() => {
    if (swipeHintVisible) {
      console.log('[useEffect] Setting swipe hint timer');
      const timer = setTimeout(() => {
        console.log('[useEffect] Hiding swipe hint');
        setSwipeHintVisible(false);
      }, 5000);

      return () => {
        console.log('[useEffect] Clearing swipe hint timer');
        clearTimeout(timer);
      };
    }
  }, [swipeHintVisible]);

  // Auto-scroll messages
  useEffect(() => {
    if (messageEndRef.current && messagesContainerRef.current) {
      console.log('[useEffect] Auto-scrolling messages');
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    console.log('[handleSendMessage] Sending message:', messageText);
    
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
      setShowEmoji(false);
      console.log('[handleSendMessage] Message sent successfully');
    } else {
      console.log('[handleSendMessage] Message empty, not sending');
    }
  };

  // Send like
  const handleLike = () => {
    console.log('[handleLike] Sending like');
    sendMessage('❤️');
    addReaction('❤️');
  };

  // Add reaction
  const addReaction = (emoji) => {
    console.log(`[addReaction] Adding reaction: ${emoji}`);
    
    const reaction = {
      id: Date.now(),
      emoji,
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15
    };

    setReactions(prev => [...prev, reaction]);

    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2000);
  };

  // Apply video filters
  const applyVideoFilters = (videoElement, filters) => {
    console.log('[applyVideoFilters] Applying filters:', filters);
    
    if (!videoElement) {
      console.warn('[applyVideoFilters] No video element provided');
      return;
    }

    let filterString = '';
    filters.forEach(filter => {
      switch(filter) {
        case 'blur':
          filterString += 'blur(2px) ';
          break;
        case 'grayscale':
          filterString += 'grayscale(100%) ';
          break;
        case 'sepia':
          filterString += 'sepia(50%) ';
          break;
        case 'brightness':
          filterString += 'brightness(1.2) ';
          break;
        case 'contrast':
          filterString += 'contrast(1.2) ';
          break;
      }
    });

    videoElement.style.filter = filterString.trim();
    console.log('[applyVideoFilters] Applied filter string:', filterString);
  };

  // Handle starting search
  const handleStartSearch = async () => {
    console.log('[handleStartSearch] Starting partner search');
    
    if (searching) {
      console.log('[handleStartSearch] Already searching, skipping');
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('[handleStartSearch] Socket not connected');
      addNotification('Please wait for connection...', 'error');
      return;
    }

    // Check media support
    const support = checkMediaSupport();
    if (!support.supported) {
      console.error('[handleStartSearch] Media not supported:', support.errors);
      addNotification(`Video chat requires: ${support.errors.join(', ')}`, 'error');
      setHasError(true);
      setErrorMessage(support.errors.join('\n'));
      return;
    }

    addDebugLog('Starting video partner search...', 'info');
    setConnectionStatus(CONNECTION_STATES.SEARCHING);

    try {
      console.log('[handleStartSearch] Initializing local media');
      await initializeLocalMedia();
      startSearch('video');

      if (socketRef.current.connected && userProfile) {
        console.log('[handleStartSearch] Emitting search event');
        socketRef.current.emit('search', {
          mode: 'video',
          interests: userProfile.interests || [],
          genderPreference: userProfile.genderPreference || 'any',
          ageRange: userProfile.ageRange || { min: 18, max: 60 },
          socketId: socketRef.current.id,
          userId: userProfile.id || socketRef.current.id,
          username: userProfile.username,
          timestamp: Date.now()
        });
      }

      setTimeout(() => {
        if (searching && !partnerRef.current) {
          console.log('[handleStartSearch] No partner found after 30 seconds');
          addNotification('No partner found. Please try again.', 'info');
        }
      }, 30000);

    } catch (error) {
      console.error('[handleStartSearch] Failed to start search:', error);
    }
  };

  // Render connection status
  const renderStatusIndicator = () => {
    console.log('[renderStatusIndicator] Rendering status indicator');
    
    let statusText = '';
    let statusColor = '';

    if (searching) {
      statusText = `Searching... ${onlineCount} online`;
      statusColor = 'searching';
    } else if (isConnecting) {
      statusText = 'Connecting...';
      statusColor = 'connecting';
    } else if (inCall) {
      statusText = `Connected ${formatTime(callDuration)}`;
      statusColor = 'connected';
    } else if (partner) {
      statusText = 'Partner found';
      statusColor = 'partner-found';
    } else {
      statusText = 'Ready to connect';
      statusColor = 'ready';
    }

    console.log(`[renderStatusIndicator] Status: ${statusText}, Color: ${statusColor}`);
    
    return (
      <div className={`status-indicator ${statusColor}`}>
        <div className="status-dot" />
        <span className="status-text">{statusText}</span>
        {connectionQuality !== 'good' && inCall && (
          <span className="quality-badge">{connectionQuality}</span>
        )}
      </div>
    );
  };

  // Error Fallback Component
  const ErrorFallback = () => {
    console.log('[ErrorFallback] Rendering error fallback');
    
    return (
      <div className="video-error-fallback">
        <div className="error-content">
          <FaExclamationTriangle className="error-icon" />
          <h3>Video Connection Error</h3>
          <p className="error-message">{errorMessage}</p>

          <div className="error-details">
            <h4><FaInfoCircle /> To fix this:</h4>
            <ul>
              <li><FaShieldAlt /> Use <strong>HTTPS</strong> (not HTTP) or localhost</li>
              <li><FaKey /> Grant camera/microphone permissions when prompted</li>
              <li><FaMobileAlt /> Try Chrome, Firefox, or Edge (latest versions)</li>
              <li><FaCamera /> Ensure your camera/microphone is properly connected</li>
              <li><FaVideoOff /> Check that no other app is using your camera</li>
            </ul>
          </div>

          <div className="error-actions">
            <button onClick={() => {
              console.log('[ErrorFallback] Retrying connection');
              setHasError(false);
              setErrorMessage('');
              handleStartSearch();
            }} className="retry-btn">
              <FaRedoAlt /> Try Again
            </button>
            <button
              onClick={() => setCurrentScreen('text')}
              className="alt-btn"
            >
              <FaComment /> Text Chat
            </button>
            <button
              onClick={() => setCurrentScreen('home')}
              className="home-btn"
            >
              <FaArrowLeft /> Back Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Tutorial Component
  const TutorialOverlay = () => {
    console.log('[TutorialOverlay] Rendering tutorial');
    
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-content">
          <div className="tutorial-header">
            <GiPartyPopper className="tutorial-icon" />
            <h3>Welcome to Video Chat!</h3>
            <button
              className="tutorial-close"
              onClick={() => {
                console.log('[TutorialOverlay] Closing tutorial');
                setShowTutorial(false);
                localStorage.setItem('videoChatTutorialSeen', 'true');
              }}
            >
              <FaTimesCircle />
            </button>
          </div>

          <div className="tutorial-steps">
            <div className="tutorial-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Find a Partner</h4>
                <p>Click "Find Partner" to start searching for someone to chat with</p>
              </div>
            </div>

            <div className="tutorial-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Control Your Media</h4>
                <p>Use the bottom controls to mute/unmute audio/video</p>
              </div>
            </div>

            <div className="tutorial-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Send Messages</h4>
                <p>Use the chat panel to send text messages during your call</p>
              </div>
            </div>

            <div className="tutorial-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Skip or End</h4>
                <p>Swipe right or click "Skip" to find another partner</p>
              </div>
            </div>
          </div>

          <button
            className="tutorial-done-btn"
            onClick={() => {
              console.log('[TutorialOverlay] Tutorial completed');
              setShowTutorial(false);
              localStorage.setItem('videoChatTutorialSeen', 'true');
            }}
          >
            <FaCheckCircle /> Got it!
          </button>
        </div>
      </div>
    );
  };

  // Stats Panel
  const StatsPanel = () => {
    console.log('[StatsPanel] Rendering stats panel');
    
    return (
      <div className="stats-panel">
        <div className="stats-header">
          <h4><FaSignal /> Connection Stats</h4>
          <button onClick={() => {
            console.log('[StatsPanel] Closing stats panel');
            setShowStats(false);
          }}>
            <FaTimesCircle />
          </button>
        </div>

        <div className="stats-content">
          <div className="stats-section">
            <h5>Video Quality</h5>
            <div className="stat-row">
              <span>Resolution:</span>
              <span>{callQuality.video.width}x{callQuality.video.height}</span>
            </div>
            <div className="stat-row">
              <span>FPS:</span>
              <span>{callQuality.video.fps}</span>
            </div>
          </div>

          <div className="stats-section">
            <h5>Audio Quality</h5>
            <div className="stat-row">
              <span>Bitrate:</span>
              <span>{Math.round(callQuality.audio.bitrate / 1000)} kbps</span>
            </div>
            <div className="stat-row">
              <span>Packets Lost:</span>
              <span>{callQuality.audio.packetsLost}</span>
            </div>
          </div>

          <div className="stats-section">
            <h5>Connection</h5>
            <div className="stat-row">
              <span>RTT:</span>
              <span>{Math.round(callQuality.connection.rtt)}ms</span>
            </div>
            <div className="stat-row">
              <span>Quality:</span>
              <span className={`quality-${connectionQuality}`}>
                {connectionQuality.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Debug WebRTC state
  const debugWebRTC = () => {
    if (!pcRef.current) {
      console.log('[debugWebRTC] No peer connection');
      return;
    }
    
    console.group('[debugWebRTC] Peer Connection State');
    console.log('Signaling state:', pcRef.current.signalingState);
    console.log('ICE connection state:', pcRef.current.iceConnectionState);
    console.log('Connection state:', pcRef.current.connectionState);
    console.log('ICE gathering state:', pcRef.current.iceGatheringState);
    
    // Get transceivers
    const transceivers = pcRef.current.getTransceivers();
    console.log('Transceivers:', transceivers.length);
    transceivers.forEach((t, i) => {
      console.log(`Transceiver ${i}:`, {
        mid: t.mid,
        direction: t.direction,
        currentDirection: t.currentDirection,
        receiver: t.receiver?.track?.kind,
        sender: t.sender?.track?.kind,
        stopped: t.stopped
      });
    });
    
    // Get senders/receivers
    console.log('Senders:', pcRef.current.getSenders().length);
    console.log('Receivers:', pcRef.current.getReceivers().length);
    console.groupEnd();
  };

  // Main render
  console.log('[render] Rendering VideoChatScreen component');
  
  if (!mediaSupport.supported && hasError) {
    console.log('[render] Media not supported, showing error fallback');
    return <ErrorFallback />;
  }

  return (
    <div className="omegle-video-container">
      {/* Tutorial Overlay */}
      {showTutorial && <TutorialOverlay />}

      {/* Stats Panel */}
      {showStats && <StatsPanel />}

      {/* Top Header */}
      <div className="video-header">
        <button
          className="header-btn back-btn"
          onClick={() => {
            console.log('[render] Back button clicked');
            handleEndCall(true);
            setCurrentScreen('home');
          }}
        >
          <FaArrowLeft />
        </button>

        <div className="header-center">
          <div className="app-logo">
            <FaVideo /> <span>VideoChat</span>
          </div>
          {renderStatusIndicator()}
        </div>

        <div className="header-right">
          <div className="online-indicator">
            <FaUsers />
            <span className="online-count">{onlineCount}</span>
          </div>
          <button
            className="header-btn"
            onClick={() => {
              console.log(`[render] Toggling chat, current: ${showChat}`);
              setShowChat(!showChat);
            }}
          >
            <FaComment />
          </button>
          <button
            className="header-btn"
            onClick={() => {
              console.log(`[render] Toggling stats, current: ${showStats}`);
              setShowStats(!showStats);
            }}
          >
            <FaSignal />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div
        ref={swipeAreaRef}
        className={`video-swipe-area ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
        style={{
          transform: swipeDirection === 'right' ? `translateX(${swipeProgress * 100}px)` :
                    swipeDirection === 'left' ? `translateX(-${swipeProgress * 100}px)` : 'none',
          opacity: 1 - swipeProgress * 0.5
        }}
      >
        {/* Remote Video */}
        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />

          {!remoteVideoStream && !isConnecting && (
            <div className="video-placeholder">
              <FaUserFriends className="placeholder-icon" />
              <p>Waiting for partner...</p>
              {!searching && (
                <button
                  className="find-partner-btn"
                  onClick={handleStartSearch}
                >
                  <FaSearch /> Find Partner
                </button>
              )}
            </div>
          )}

          {isConnecting && (
            <div className="connecting-overlay">
              <div className="connecting-spinner"></div>
              <p>Connecting to partner...</p>
            </div>
          )}

          {/* Reactions */}
          {reactions.map(reaction => (
            <div
              key={reaction.id}
              className="reaction"
              style={{
                left: `${reaction.x}%`,
                top: `${reaction.y}%`
              }}
            >
              {reaction.emoji}
            </div>
          ))}

          {/* Connection Quality Indicator */}
          <div className="connection-quality" ref={connectionQualityRef}>
            <div className={`quality-bar ${connectionQuality}`}>
              <div className="quality-fill" />
            </div>
            <FaWifi className="quality-icon" />
          </div>
        </div>

        {/* Local Video PIP */}
        <div className="local-video-pip">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          <div className="pip-controls">
            {!audioEnabled && <span className="pip-mute">🔇</span>}
            {screenShareActive && <span className="pip-share">🖥️</span>}
          </div>
        </div>

        {/* Swipe Hint */}
        {swipeHintVisible && partner && (
          <div className="swipe-hint">
            <FaChevronRight className="swipe-icon" />
            <span>Swipe right to skip</span>
          </div>
        )}
      </div>

      {/* Partner Info Bar */}
      {partner && (
        <div className="partner-info-bar">
          <div className="partner-avatar">
            {partner.profile?.avatar || partner.partnerProfile?.avatar ? (
              <img src={partner.profile?.avatar || partner.partnerProfile?.avatar} 
                   alt={partner.profile?.username || partner.partnerProfile?.username || 'Stranger'} />
            ) : (
              <FaUserCircle />
            )}
          </div>
          <div className="partner-details">
            <div className="partner-name">
              {partner.profile?.username || partner.partnerProfile?.username || 'Stranger'}
              {inCall && <span className="live-badge">LIVE</span>}
            </div>
            <div className="partner-interests">
              {(partner.profile?.interests || partner.partnerProfile?.interests || [])
                .slice(0, 3)
                .map((interest, idx) => (
                  <span key={idx} className="interest-tag">#{interest}</span>
                ))}
            </div>
          </div>
          <div className="partner-actions">
            {partner.compatibility && (
              <span className="compatibility-badge">
                {partner.compatibility}% match
              </span>
            )}
            <button 
              className="star-btn"
              onClick={() => console.log('Star button clicked')}
            >
              <FaStar />
            </button>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="main-controls">
        <div className="control-group left-controls">
          <button
            className={`control-btn audio-btn ${!audioEnabled ? 'muted' : ''}`}
            onClick={toggleAudio}
          >
            {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          <button
            className={`control-btn video-btn ${!videoEnabled ? 'muted' : ''}`}
            onClick={toggleVideo}
          >
            {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>
          <button
            className="control-btn flip-btn"
            onClick={toggleCamera}
          >
            <FaRedoAlt />
          </button>
        </div>

        <div className="control-group center-controls">
          {inCall ? (
            <>
              <button
                className="control-btn share-btn"
                onClick={toggleScreenShare}
                data-active={screenShareActive}
              >
                <FaDesktop />
              </button>
              <button
                className="control-btn end-call-btn"
                onClick={() => {
                  console.log('[render] End call button clicked');
                  handleEndCall(true);
                }}
              >
                <FaPhoneSlash />
              </button>
              <button
                className="control-btn skip-btn"
                onClick={handleSwipeToNext}
              >
                <FaSyncAlt />
              </button>
            </>
          ) : (
            <button
              className="find-partner-btn-large"
              onClick={handleStartSearch}
              disabled={searching || isConnecting}
            >
              {searching ? (
                <>
                  <div className="search-spinner"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FaSearch />
                  <span>{partner ? 'Reconnect' : 'Find Partner'}</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="control-group right-controls">
          <button
            className="control-btn fullscreen-btn"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            className="control-btn like-btn"
            onClick={handleLike}
          >
            <FaHeart />
          </button>
          <button
            className="control-btn menu-btn"
            onClick={() => {
              console.log(`[render] Toggling menu, current: ${showMenu}`);
              setShowMenu(!showMenu);
            }}
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* Chat Drawer */}
      <div className={`chat-drawer ${showChat ? 'open' : ''} ${showEmoji ? 'expanded' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <FaComment /> Chat
            {messages.length > 0 && (
              <span className="message-count">{messages.length}</span>
            )}
          </div>
          <div className="chat-actions">
            <button
              className="chat-action-btn"
              onClick={() => {
                console.log(`[render] Toggling emoji picker, current: ${showEmoji}`);
                setShowEmoji(!showEmoji);
              }}
            >
              <FaSmile />
            </button>
            <button
              className="chat-action-btn"
              onClick={handleLike}
            >
              <FaHeart />
            </button>
            <button
              className="chat-action-btn close-chat"
              onClick={() => {
                console.log('[render] Closing chat drawer');
                setShowChat(false);
              }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="messages-container" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="no-messages">
              <FaComment className="no-messages-icon" />
              <p>No messages yet</p>
              <small>Start the conversation!</small>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messageEndRef} />
        </div>

        <div className="message-input-area">
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              console.log('[render] Message input changed:', e.target.value);
              setMessageText(e.target.value);
            }}
            onFocus={() => {
              console.log('[render] Message input focused');
              handleTypingStart();
            }}
            onBlur={() => {
              console.log('[render] Message input blurred');
              handleTypingStop();
            }}
            placeholder="Type a message..."
            className="message-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                console.log('[render] Enter key pressed, sending message');
                handleSendMessage();
              }
            }}
          />
          <button
            className="send-message-btn"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>

        {showEmoji && (
          <div className="emoji-picker-container">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                console.log('[render] Emoji clicked:', emojiData.emoji);
                setMessageText(prev => prev + emojiData.emoji);
                setShowEmoji(false);
              }}
              height={300}
              width="100%"
              searchDisabled={false}
              skinTonesDisabled={false}
              previewConfig={{
                showPreview: true
              }}
            />
          </div>
        )}
      </div>

      {/* Menu Panel */}
      {showMenu && (
        <div className="menu-panel">
          <div className="menu-header">
            <h4><FaCog /> Settings & Options</h4>
            <button onClick={() => {
              console.log('[render] Closing menu panel');
              setShowMenu(false);
            }}>
              <FaTimesCircle />
            </button>
          </div>

          <div className="menu-sections">
            <div className="menu-section">
              <h5><FaVideo /> Video Settings</h5>
              <button className="menu-item" onClick={() => console.log('[render] Apply Filters clicked')}>
                <FaMagic /> Apply Filters
              </button>
              <button className="menu-item" onClick={() => console.log('[render] Screen Share Settings clicked')}>
                <FaDesktop /> Screen Share Settings
              </button>
              <button className="menu-item" onClick={() => console.log('[render] Camera Settings clicked')}>
                <FaCamera /> Camera Settings
              </button>
            </div>

            <div className="menu-section">
              <h5><FaGlobe /> Chat Options</h5>
              <button className="menu-item" onClick={() => console.log('[render] Translate Chat clicked')}>
                <FaLanguage /> Translate Chat
              </button>
              <button className="menu-item" onClick={() => console.log('[render] Auto-translate clicked')}>
                <FaRandom /> Auto-translate
              </button>
              <button className="menu-item" onClick={() => console.log('[render] Notifications clicked')}>
                <FaBell /> Notifications
              </button>
            </div>

            <div className="menu-section">
              <h5><FaShieldAlt /> Privacy</h5>
              <label className="menu-toggle">
                <span>Auto-search</span>
                <input
                  type="checkbox"
                  checked={autoSearch}
                  onChange={(e) => {
                    console.log(`[render] Auto-search toggled: ${e.target.checked}`);
                    setAutoSearch(e.target.checked);
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
              <label className="menu-toggle">
                <span>Save chat history</span>
                <input type="checkbox" onChange={(e) => console.log(`[render] Save chat history: ${e.target.checked}`)} />
                <span className="toggle-slider"></span>
              </label>
              <button className="menu-item" onClick={() => console.log('[render] Report User clicked')}>
                <FaExclamationTriangle /> Report User
              </button>
            </div>
          </div>

          <div className="menu-footer">
            <button
              className="debug-btn"
              onClick={() => {
                console.log(`[render] Toggling debug info, current: ${showDebug}`);
                setShowDebug(!showDebug);
              }}
            >
              <FaInfoCircle /> Debug Info
            </button>
            <button
              className="restart-btn"
              onClick={() => {
                console.log('[render] Restart connection clicked');
                handleEndCall(true);
                handleStartSearch();
              }}
            >
              <FaRocket /> Restart Connection
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="quick-stats-bar">
        <div className="stat-item">
          <FaWifi />
          <span className="stat-value">{connectionQuality}</span>
        </div>
        <div className="stat-item">
          <FaSignal />
          <span className="stat-value">{onlineCount}</span>
        </div>
        <div className="stat-item">
          <FaVideo />
          <span className="stat-value">{callDuration > 0 ? formatTime(callDuration) : '--:--'}</span>
        </div>
        <div className="stat-item">
          <FaUsers />
          <span className="stat-value">{partner ? 1 : 0}/1</span>
        </div>
      </div>

      {/* Connection Status Toast */}
      {connectionStatus === CONNECTION_STATES.SEARCHING && (
        <div className="status-toast searching">
          <div className="toast-content">
            <div className="searching-animation">
              <div className="pulse"></div>
              <FaSearch />
            </div>
            <div className="toast-text">
              <h4>Searching for partner...</h4>
              <p>{onlineCount} users online • Finding the best match</p>
            </div>
            <button
              className="toast-action"
              onClick={() => {
                console.log('[render] Cancel search clicked');
                if (socketRef.current) {
                  socketRef.current.emit('cancel-search');
                }
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {connectionStatus === CONNECTION_STATES.CONNECTING && (
        <div className="status-toast connecting">
          <div className="toast-content">
            <div className="spinner"></div>
            <div className="toast-text">
              <h4>Connecting...</h4>
              <p>Establishing secure video connection</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={toggleAudio}
          data-active={audioEnabled}
        >
          {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
        <button
          className="quick-action-btn"
          onClick={toggleVideo}
          data-active={videoEnabled}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button
          className="quick-action-btn"
          onClick={toggleScreenShare}
          data-active={screenShareActive}
        >
          <FaDesktop />
        </button>
        <button
          className="quick-action-btn"
          onClick={() => setShowChat(!showChat)}
          data-active={showChat}
        >
          <FaComment />
        </button>
      </div>

      {/* Debug Button */}
      <button
        onClick={() => {
          console.log('DEBUG: Current state:', {
            contextPartner: partner,
            partnerRef: partnerRef.current,
            socketConnected: socket?.connected,
            socketId: socket?.id,
            inCall,
            isConnecting,
            connectionStatus,
            hasPartnerId: !!partnerRef.current?.partnerId,
            videoCallId: partnerRef.current?.videoCallId,
            roomId: partnerRef.current?.roomId
          });
          
          // Debug WebRTC state
          debugWebRTC();
          
          // Force sync partner data
          syncPartnerData();
          
          // Try to get partner info from server
          if (socket?.connected) {
            socket.emit('get-partner-info');
            socket.once('partner-info', (data) => {
              console.log('Partner info from server:', data);
              if (data.partnerId) {
                // Update partner ref with normalized structure
                partnerRef.current = {
                  partnerId: data.partnerId,
                  id: data.partnerId,
                  profile: data.profile || data.partnerProfile,
                  roomId: data.roomId,
                  videoCallId: data.videoCallId,
                  videoCall: data.videoCall
                };
                
                console.log('Updated partnerRef:', partnerRef.current);
                
                // Try to start call if conditions are met
                if (!inCall && !isConnecting && data.videoCallId) {
                  console.log('Attempting to start call with updated partner data');
                  setTimeout(() => startVideoCall(), 500);
                }
              }
            });
          }
        }}
        className="debug-btn"
      >
        Debug Partner State
      </button>

      {/* Debug Panel */}
      {showDebug && (
        <div className="debug-panel">
          <div className="debug-header">
            <h4>Debug Logs</h4>
            <button onClick={() => setDebugLogs([])}>Clear</button>
            <button onClick={() => setShowDebug(false)}>Close</button>
          </div>
          <div className="debug-logs">
            {debugLogs.map(log => (
              <div key={log.id} className={`debug-log debug-${log.type}`}>
                <span className="debug-time">[{log.timestamp}]</span>
                <span className="debug-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatScreen;