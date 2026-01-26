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
  FaUserCircle, FaBell, FaStar, FaRocket, FaPlusCircle, FaPlug
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
  bundlePolicy: 'balanced',
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

// Media modes
const MEDIA_MODES = {
  NONE: 'none',
  AUDIO_ONLY: 'audio_only',
  VIDEO_ONLY: 'video_only',
  AUDIO_VIDEO: 'audio_video'
};

// Helper function to check media support - ALLOWS HTTP
const checkMediaSupport = () => {
  console.log('[checkMediaSupport] Checking media support...');
  const errors = [];
  const warnings = [];

  // Check for mediaDevices API
  if (!navigator.mediaDevices) {
    console.warn('[checkMediaSupport] navigator.mediaDevices API is not available');
    // Don't error out, try older API
  }

  // Check for getUserMedia (including older API)
  if (!navigator.mediaDevices?.getUserMedia && !navigator.getUserMedia) {
    warnings.push('Camera/microphone access might not be available');
    console.warn('[checkMediaSupport] getUserMedia is not available');
  }

  // Check for WebRTC support
  if (!window.RTCPeerConnection) {
    errors.push('WebRTC is not supported in this browser');
    console.error('[checkMediaSupport] WebRTC is not supported');
  }

  console.log('[checkMediaSupport] Support check completed:', {
    supported: errors.length === 0,
    errors,
    warnings
  });

  return {
    supported: errors.length === 0,
    errors,
    warnings,
    canRetry: true // Always allow retry
  };
};

// Helper function to create dummy audio track
const createDummyAudioTrack = () => {
  console.log('[createDummyAudioTrack] Creating dummy audio track');
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Create silent audio
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  
  const destination = audioContext.createMediaStreamDestination();
  oscillator.connect(destination);
  oscillator.start();
  
  const dummyStream = destination.stream;
  const audioTrack = dummyStream.getAudioTracks()[0];
  
  // Mark as dummy for identification
  audioTrack._isDummy = true;
  audioTrack.enabled = false; // Start disabled
  
  return audioTrack;
};

// Helper function to create dummy video track
const createDummyVideoTrack = () => {
  console.log('[createDummyVideoTrack] Creating dummy video track');
  
  // Create a canvas to generate a black frame
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  
  // Fill with black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Camera not available', canvas.width/2, canvas.height/2);
  
  // Create video stream from canvas
  const stream = canvas.captureStream(0);
  const videoTrack = stream.getVideoTracks()[0];
  
  // Mark as dummy for identification
  videoTrack._isDummy = true;
  videoTrack.enabled = false; // Start disabled
  
  return videoTrack;
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
  const [audioEnabled, setAudioEnabled] = useState(false); // Start disabled
  const [videoEnabled, setVideoEnabled] = useState(false); // Start disabled
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
  const [mediaMode, setMediaMode] = useState(MEDIA_MODES.NONE);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [hasAudioDevice, setHasAudioDevice] = useState(false);
  const [hasVideoDevice, setHasVideoDevice] = useState(false);

  console.log('[VideoChatScreen] State values:', {
    inCall,
    isConnecting,
    connectionStatus,
    hasError,
    screenShareActive,
    showChat,
    showMenu,
    mediaMode,
    audioEnabled,
    videoEnabled
  });

  // Check available devices on mount
  useEffect(() => {
    const checkDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(d => d.kind === 'audioinput');
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        
        setHasAudioDevice(audioDevices.length > 0);
        setHasVideoDevice(videoDevices.length > 0);
        
        console.log('[checkDevices] Available devices:', {
          audioDevices: audioDevices.length,
          videoDevices: videoDevices.length
        });
      } catch (error) {
        console.warn('[checkDevices] Could not enumerate devices:', error);
      }
    };
    
    checkDevices();
  }, []);

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
      addNotification('Video chat might have limited functionality', 'warning');
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

  // Get detailed browser info
  const getDetailedBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'unknown';
    } else if (ua.includes('Edg')) {
      browser = 'edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || 'unknown';
    }
    
    const features = {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia),
      webkitGetUserMedia: !!navigator.webkitGetUserMedia,
      mozGetUserMedia: !!navigator.mozGetUserMedia,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol
    };
    
    return {
      browser,
      version,
      isMobile,
      features,
      userAgent: ua
    };
  };

  // Release all media tracks
  const releaseAllMediaTracks = () => {
    console.log('[releaseAllMediaTracks] Releasing all media tracks');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`[releaseAllMediaTracks] Stopping ${track.kind} track`);
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }
    
    if (screenShareRef.current) {
      screenShareRef.current.getTracks().forEach(track => track.stop());
      screenShareRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setLocalVideoStream(null);
    setScreenShareActive(false);
    console.log('[releaseAllMediaTracks] All media tracks released');
  };

  // Initialize local media - PERMISSIVE VERSION
const initializeLocalMedia = async (mode = MEDIA_MODES.NONE) => {
  console.log('[initializeLocalMedia] Starting media initialization with mode:', mode);
  
  try {
    setIsConnecting(true);
    addDebugLog('Setting up media...', 'info');

    // Check for mediaDevices exists
    if (!navigator.mediaDevices) {
      console.warn('[initializeLocalMedia] Media devices API not available, using dummy tracks');
      return createDummyMedia(mode);
    }

    // IMPORTANT: Check if we already have a stream
    if (localStreamRef.current) {
      console.log('[initializeLocalMedia] Already have local stream, stopping old tracks');
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear any previous video sources
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Create new stream
    const stream = new MediaStream();
    let audioTrack = null;
    let videoTrack = null;
    let hasRealAudio = false;
    let hasRealVideo = false;

    // Try to get audio if requested
    if (mode === MEDIA_MODES.AUDIO_ONLY || mode === MEDIA_MODES.AUDIO_VIDEO) {
      try {
        console.log('[initializeLocalMedia] Requesting audio...');
        const audioConstraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints)
          .catch(() => {
            console.warn('[initializeLocalMedia] Audio access failed, using dummy');
            return null;
          });
        
        if (audioStream) {
          audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
            hasRealAudio = true;
            console.log('[initializeLocalMedia] Audio track added');
          }
        }
      } catch (audioError) {
        console.warn('[initializeLocalMedia] Audio error:', audioError);
      }
    }

    // Try to get video if requested
    if (mode === MEDIA_MODES.VIDEO_ONLY || mode === MEDIA_MODES.AUDIO_VIDEO) {
      try {
        console.log('[initializeLocalMedia] Requesting video...');
        const videoConstraints = {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            facingMode: cameraFacing,
            frameRate: { ideal: 20, min: 10 }
          }
        };
        
        const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints)
          .catch(() => {
            console.warn('[initializeLocalMedia] Video access failed, using dummy');
            return null;
          });
        
        if (videoStream) {
          videoTrack = videoStream.getVideoTracks()[0];
          if (videoTrack) {
            stream.addTrack(videoTrack);
            hasRealVideo = true;
            console.log('[initializeLocalMedia] Video track added');
          }
        }
      } catch (videoError) {
        console.warn('[initializeLocalMedia] Video error:', videoError);
      }
    }

    // Add dummy tracks if no real ones
    if (!audioTrack && (mode === MEDIA_MODES.AUDIO_ONLY || mode === MEDIA_MODES.AUDIO_VIDEO)) {
      console.log('[initializeLocalMedia] Adding dummy audio track');
      const dummyAudio = createDummyAudioTrack();
      stream.addTrack(dummyAudio);
      audioTrack = dummyAudio;
    }

    if (!videoTrack && (mode === MEDIA_MODES.VIDEO_ONLY || mode === MEDIA_MODES.AUDIO_VIDEO)) {
      console.log('[initializeLocalMedia] Adding dummy video track');
      const dummyVideo = createDummyVideoTrack();
      stream.addTrack(dummyVideo);
      videoTrack = dummyVideo;
    }

    // Set up local video if we have video track
    if (videoTrack && localVideoRef.current) {
      console.log('[initializeLocalMedia] Setting local video source');
      localVideoRef.current.srcObject = new MediaStream([videoTrack]);
      localVideoRef.current.muted = true;
      localVideoRef.current.playsInline = true;

      localVideoRef.current.onloadedmetadata = () => {
        console.log('[initializeLocalMedia] Local video metadata loaded');
        localVideoRef.current.play().catch(e => {
          console.error('[initializeLocalMedia] Local video play error:', e);
        });
      };
    }

    // Set up audio monitoring if we have real audio
    if (hasRealAudio) {
      console.log('[initializeLocalMedia] Setting up audio monitoring');
      setupAudioMonitoring(stream);
    }

    localStreamRef.current = stream;
    setLocalVideoStream(stream);
    setMediaMode(mode);
    
    // Update enabled states based on real devices
    setAudioEnabled(hasRealAudio && audioTrack?.enabled);
    setVideoEnabled(hasRealVideo && videoTrack?.enabled);

    console.log('[initializeLocalMedia] Media initialization completed:', {
      mode,
      hasRealAudio,
      hasRealVideo,
      audioEnabled: audioTrack?.enabled,
      videoEnabled: videoTrack?.enabled,
      trackCount: stream.getTracks().length
    });

    addDebugLog(`Media setup: ${hasRealAudio ? 'Audio' : 'No Audio'}, ${hasRealVideo ? 'Video' : 'No Video'}`, 'success');
    return stream;

  } catch (error) {
    console.error('[initializeLocalMedia] Error in media initialization:', error);
    setIsConnecting(false);
    
    // Even if media fails, we can continue with dummy tracks
    console.log('[initializeLocalMedia] Falling back to dummy media');
    return createDummyMedia(mode);
  }
};

// Create dummy media as fallback
const createDummyMedia = (mode) => {
  console.log('[createDummyMedia] Creating dummy media for mode:', mode);
  
  const stream = new MediaStream();
  
  if (mode === MEDIA_MODES.AUDIO_ONLY || mode === MEDIA_MODES.AUDIO_VIDEO) {
    const dummyAudio = createDummyAudioTrack();
    stream.addTrack(dummyAudio);
    setAudioEnabled(false);
  }
  
  if (mode === MEDIA_MODES.VIDEO_ONLY || mode === MEDIA_MODES.AUDIO_VIDEO) {
    const dummyVideo = createDummyVideoTrack();
    stream.addTrack(dummyVideo);
    setVideoEnabled(false);
    
    // Set up dummy video display
    if (localVideoRef.current) {
      const dummyStream = new MediaStream([dummyVideo]);
      localVideoRef.current.srcObject = dummyStream;
      localVideoRef.current.muted = true;
      localVideoRef.current.playsInline = true;
      localVideoRef.current.play().catch(e => console.error('Dummy video play error:', e));
    }
  }
  
  localStreamRef.current = stream;
  setLocalVideoStream(stream);
  setMediaMode(mode);
  
  console.log('[createDummyMedia] Dummy media created with tracks:', stream.getTracks().length);
  return stream;
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

  // Enable audio during call
  const enableAudioDuringCall = async () => {
    console.log('[enableAudioDuringCall] Enabling audio during call');
    
    if (!pcRef.current || !inCall) {
      console.warn('[enableAudioDuringCall] No active call');
      return;
    }

    try {
      addDebugLog('Enabling microphone...', 'info');
      
      // Get audio track
      const constraints = { audio: true };
      const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioTrack = audioStream.getAudioTracks()[0];
      
      if (audioTrack) {
        // Check if we already have an audio sender
        const senders = pcRef.current.getSenders();
        const audioSender = senders.find(s => s.track?.kind === 'audio');
        
        if (audioSender) {
          // Replace existing audio track
          await audioSender.replaceTrack(audioTrack);
          console.log('[enableAudioDuringCall] Replaced audio track');
        } else {
          // Add new audio track
          pcRef.current.addTrack(audioTrack, localStreamRef.current || audioStream);
          console.log('[enableAudioDuringCall] Added new audio track');
        }
        
        // Update local stream
        if (localStreamRef.current) {
          const existingAudio = localStreamRef.current.getAudioTracks()[0];
          if (existingAudio) {
            localStreamRef.current.removeTrack(existingAudio);
            existingAudio.stop();
          }
          localStreamRef.current.addTrack(audioTrack);
        } else {
          localStreamRef.current = new MediaStream([audioTrack]);
        }
        
        setAudioEnabled(true);
        addDebugLog('Microphone enabled', 'success');
        addReaction('🎤');
        
        // Notify partner
        if (socketRef.current && partnerRef.current) {
          const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
          socketRef.current.emit('media-state', {
            to: partnerId,
            audio: true,
            video: videoEnabled
          });
        }
      }
    } catch (error) {
      console.error('[enableAudioDuringCall] Failed to enable audio:', error);
      addDebugLog(`Failed to enable audio: ${error.message}`, 'error');
    }
  };

  // Enable video during call
  const enableVideoDuringCall = async () => {
    console.log('[enableVideoDuringCall] Enabling video during call');
    
    if (!pcRef.current || !inCall) {
      console.warn('[enableVideoDuringCall] No active call');
      return;
    }

    try {
      addDebugLog('Enabling camera...', 'info');
      
      // Get video track
      const constraints = { 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: cameraFacing
        }
      };
      const videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = videoStream.getVideoTracks()[0];
      
      if (videoTrack) {
        // Check if we already have a video sender
        const senders = pcRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        
        if (videoSender) {
          // Replace existing video track
          await videoSender.replaceTrack(videoTrack);
          console.log('[enableVideoDuringCall] Replaced video track');
        } else {
          // Add new video track
          pcRef.current.addTrack(videoTrack, localStreamRef.current || videoStream);
          console.log('[enableVideoDuringCall] Added new video track');
        }
        
        // Update local stream and video display
        if (localStreamRef.current) {
          const existingVideo = localStreamRef.current.getVideoTracks()[0];
          if (existingVideo) {
            localStreamRef.current.removeTrack(existingVideo);
            existingVideo.stop();
          }
          localStreamRef.current.addTrack(videoTrack);
        } else {
          localStreamRef.current = new MediaStream([videoTrack]);
        }
        
        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = new MediaStream([videoTrack]);
          localVideoRef.current.muted = true;
          localVideoRef.current.onloadedmetadata = () => {
            localVideoRef.current.play().catch(e => 
              console.error('Local video play error:', e)
            );
          };
        }
        
        setVideoEnabled(true);
        addDebugLog('Camera enabled', 'success');
        addReaction('📹');
        
        // Notify partner
        if (socketRef.current && partnerRef.current) {
          const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
          socketRef.current.emit('media-state', {
            to: partnerId,
            audio: audioEnabled,
            video: true
          });
        }
      }
    } catch (error) {
      console.error('[enableVideoDuringCall] Failed to enable video:', error);
      addDebugLog(`Failed to enable video: ${error.message}`, 'error');
    }
  };

  // Toggle audio (enable/disable during call)
  const toggleAudio = async () => {
    console.log('[toggleAudio] Toggling audio');
    
    if (!inCall) {
      console.warn('[toggleAudio] Not in a call');
      return;
    }

    if (audioEnabled) {
      // Disable audio
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = false;
          setAudioEnabled(false);
          console.log('[toggleAudio] Audio disabled');
          addDebugLog('Microphone muted', 'info');
          addReaction('🔇');
        }
      }
    } else {
      // Enable audio
      await enableAudioDuringCall();
    }
  };

  // Toggle video (enable/disable during call)
  const toggleVideo = async () => {
    console.log('[toggleVideo] Toggling video');
    
    if (!inCall) {
      console.warn('[toggleVideo] Not in a call');
      return;
    }

    if (videoEnabled) {
      // Disable video
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;
          setVideoEnabled(false);
          console.log('[toggleVideo] Video disabled');
          addDebugLog('Camera turned off', 'info');
          addReaction('📴');
        }
      }
    } else {
      // Enable video
      await enableVideoDuringCall();
    }
  };

  // Start video call with fallback - CONNECT FIRST, ADD MEDIA LATER
const startVideoCall = async () => {
  console.log('[startVideoCall] Starting video call process');
  
  try {
    if (!partnerRef.current) {
      console.warn('[startVideoCall] Cannot start call: No partner available');
      addDebugLog('Cannot start call: No partner available', 'error');
      return;
    }

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

    if (!socketRef.current?.connected) {
      console.warn('[startVideoCall] Socket not connected, waiting...');
      addDebugLog('Socket not connected, waiting...', 'warning');
      return;
    }

    // Reset any previous error state
    setHasError(false);
    setErrorMessage('');
    
    setIsConnecting(true);
    setConnectionStatus(CONNECTION_STATES.CONNECTING);

    // Clean up any existing peer connection
    if (pcRef.current) {
      console.log('[startVideoCall] Closing existing peer connection');
      pcRef.current.close();
      pcRef.current = null;
    }

    // Create new peer connection WITHOUT media initially
    console.log('[startVideoCall] Creating RTCPeerConnection without media');
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS.iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'balanced'
    });
    pcRef.current = pc;
    
    console.log('[startVideoCall] Peer connection created');

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
        console.log('[startVideoCall] Remote stream set');

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
          addDebugLog('Call connected! You can now enable media', 'success');
          startCallTimer();
          setShowMediaOptions(true); // Show media options after connection
          break;

        case 'disconnected':
          console.log('[startVideoCall] Connection disconnected, attempting reconnect');
          setTimeout(() => {
            if (pc.connectionState === 'disconnected') {
              console.log('[startVideoCall] Still disconnected, handling reconnect');
              handleReconnect();
            }
          }, 2000);
          break;
          
        case 'failed':
          console.log('[startVideoCall] Connection failed');
          setIsConnecting(false);
          setConnectionStatus(CONNECTION_STATES.FAILED);
          handleReconnect();
          break;

        case 'closed':
          console.log('[startVideoCall] Connection closed');
          setInCall(false);
          setIsConnecting(false);
          setRemoteVideoStream(null);
          setShowMediaOptions(false);
          break;
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[startVideoCall] ICE connection state: ${pc.iceConnectionState}`);
      
      if (pc.iceConnectionState === 'failed') {
        console.log('[startVideoCall] ICE connection failed');
        handleReconnect();
      }
    };

    // Create and send offer (without media tracks initially)
    try {
      console.log('[startVideoCall] Creating offer...');
      
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: false
      });
      
      console.log('[startVideoCall] Offer created:', offer.type);
      
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
          timestamp: Date.now(),
          hasAudio: false,
          hasVideo: false
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

      // Don't add tracks initially
      console.log('[handleIncomingCall] Accepting call without initial media');

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
          setShowMediaOptions(true); // Show media options after connection
        } else if (state === 'failed' || state === 'disconnected') {
          setIsConnecting(false);
          setShowMediaOptions(false);
        }
      };

      console.log('[handleIncomingCall] Setting remote description');
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      
      console.log('[handleIncomingCall] Creating answer');
      const answer = await pc.createAnswer({
        voiceActivityDetection: false
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


  

  
    // Toggle video

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
  

  // Handle reconnect
  const handleReconnect = () => {
    console.log('[handleReconnect] Attempting to reconnect');
    
    if (isConnecting || connectionStatus === CONNECTION_STATES.CONNECTING) {
      console.log('[handleReconnect] Already reconnecting, skipping');
      return;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    reconnectTimerRef.current = setTimeout(() => {
      if (partnerRef.current && socketRef.current?.connected) {
        console.log('[handleReconnect] Executing reconnect');
        addDebugLog('Attempting to reconnect call...', 'info');
        
        cleanupMedia();
        
        // Retry the call
        startVideoCall();
      } else {
        console.log('[handleReconnect] Cannot reconnect - no partner or socket disconnected');
        addDebugLog('Cannot reconnect: No partner found', 'error');
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
      setShowMediaOptions(false);
      console.log('[handleEndCall] State reset complete');

      if (callTimerRef.current) {
        console.log('[handleEndCall] Clearing call timer');
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      cleanupMedia();

    } catch (error) {
      console.error('[handleEndCall] Error ending call:', error);
    }
  };

  // Cleanup media
  const cleanupMedia = () => {
    console.log('[cleanupMedia] Cleaning up media resources...');

    // Clear all timers
    [autoConnectTimerRef, reconnectTimerRef, swipeTimerRef, callTimerRef].forEach(ref => {
      if (ref.current) {
        if (ref === callTimerRef) {
          console.log(`[cleanupMedia] Clearing interval for call timer`);
          clearInterval(ref.current);
        } else {
          console.log(`[cleanupMedia] Clearing timeout for ${ref}`);
          clearTimeout(ref.current);
        }
        ref.current = null;
      }
    });

    // Stop and remove all media tracks
    releaseAllMediaTracks();

    // Clean up peer connection
    if (pcRef.current) {
      console.log('[cleanupMedia] Closing peer connection, current state:', {
        signalingState: pcRef.current.signalingState,
        connectionState: pcRef.current.connectionState
      });
      
      // Remove event handlers first
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.onsignalingstatechange = null;
      
      // Only close if not already closed
      if (pcRef.current.signalingState !== 'closed') {
        pcRef.current.close();
      }
      pcRef.current = null;
    }

    // Clean video elements
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteVideoStream(null);
    setInCall(false);
    setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
    console.log('[cleanupMedia] Cleanup completed');
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

    addDebugLog('Starting video partner search...', 'info');
    setConnectionStatus(CONNECTION_STATES.SEARCHING);

    try {
      // Don't initialize media at search time
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
          timestamp: Date.now(),
          hasMedia: false // Indicate we don't have media initially
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

  // Socket event handlers
  useEffect(() => {
    console.log('[useEffect] Setting up socket event handlers');
    
    if (!socketRef.current) {
      console.warn('[useEffect] No socket available for event handlers');
      return;
    }

    // ... (keep existing socket handlers, but add media-state handler)
    const handleMediaState = (data) => {
      console.log('[socket] Partner media state changed:', data);
      addDebugLog(`Partner ${data.audio ? 'enabled' : 'disabled'} audio, ${data.video ? 'enabled' : 'disabled'} video`, 'info');
    };

    const socket = socketRef.current;
    socket.on('media-state', handleMediaState);

    return () => {
      socket.off('media-state', handleMediaState);
    };
  }, [addDebugLog]);

  // Media Options Component
  const MediaOptionsOverlay = () => {
    if (!showMediaOptions || !inCall) return null;

    return (
      <div className="media-options-overlay">
        <div className="media-options-content">
          <div className="media-options-header">
            <FaPlug className="options-icon" />
            <h3>Enable Media</h3>
            <button
              className="options-close"
              onClick={() => setShowMediaOptions(false)}
            >
              <FaTimesCircle />
            </button>
          </div>

          <div className="media-options-grid">
            <div className={`media-option ${audioEnabled ? 'active' : ''}`}>
              <div className="option-icon">
                {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </div>
              <div className="option-content">
                <h4>Microphone</h4>
                <p>{audioEnabled ? 'Microphone is on' : 'Enable your microphone'}</p>
                <button
                  className={`option-btn ${audioEnabled ? 'btn-disabled' : 'btn-enable'}`}
                  onClick={toggleAudio}
                  disabled={!hasAudioDevice && audioEnabled}
                >
                  {audioEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            <div className={`media-option ${videoEnabled ? 'active' : ''}`}>
              <div className="option-icon">
                {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </div>
              <div className="option-content">
                <h4>Camera</h4>
                <p>{videoEnabled ? 'Camera is on' : 'Enable your camera'}</p>
                <button
                  className={`option-btn ${videoEnabled ? 'btn-disabled' : 'btn-enable'}`}
                  onClick={toggleVideo}
                  disabled={!hasVideoDevice && videoEnabled}
                >
                  {videoEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            <div className="media-option info">
              <div className="option-icon">
                <FaInfoCircle />
              </div>
              <div className="option-content">
                <h4>Information</h4>
                <p>Call is connected! You can enable media anytime.</p>
                <small>Use text chat if media is not available</small>
              </div>
            </div>
          </div>

          <div className="media-options-footer">
            <button
              className="skip-media-btn"
              onClick={() => setShowMediaOptions(false)}
            >
              Continue without media
            </button>
          </div>
        </div>
      </div>
    );
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
      if (!audioEnabled && !videoEnabled) {
        statusText += ' (Text only)';
      } else if (audioEnabled && !videoEnabled) {
        statusText += ' (Audio only)';
      } else if (!audioEnabled && videoEnabled) {
        statusText += ' (Video only)';
      }
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
    
    const handleRetry = () => {
      console.log('[ErrorFallback] Retrying connection');
      setHasError(false);
      setErrorMessage('');
      
      // Release all media first
      releaseAllMediaTracks();
      
      // Try again after a short delay
      setTimeout(() => {
        if (partnerRef.current) {
          startVideoCall();
        } else {
          handleStartSearch();
        }
      }, 1000);
    };
    
    return (
      <div className="video-error-fallback">
        <div className="error-content">
          <FaExclamationTriangle className="error-icon" />
          <h3>Connection Error</h3>
          <p className="error-message">{errorMessage}</p>

          <div className="error-details">
            <h4><FaInfoCircle /> Quick Fixes:</h4>
            <ul>
              <li><FaRedoAlt /> <strong>Refresh the page</strong> and try again</li>
              <li><FaPlug /> Try connecting without media first</li>
              <li><FaComment /> You can still use text chat</li>
              <li><FaShieldAlt /> Make sure you're using a supported browser</li>
            </ul>
          </div>

          <div className="error-actions">
            <button onClick={handleRetry} className="retry-btn">
              <FaRedoAlt /> Try Again
            </button>
            <button
              onClick={() => {
                releaseAllMediaTracks();
                setCurrentScreen('text');
              }}
              className="alt-btn"
            >
              <FaComment /> Text Chat
            </button>
            <button
              onClick={() => {
                releaseAllMediaTracks();
                setCurrentScreen('home');
              }}
              className="home-btn"
            >
              <FaArrowLeft /> Back Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  console.log('[render] Rendering VideoChatScreen component');
  
  if (hasError && !mediaSupport.supported) {
    console.log('[render] Showing error fallback');
    return <ErrorFallback />;
  }


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
  

  return (
    <div className="omegle-video-container">
      {/* Media Options Overlay */}
      {showMediaOptions && <MediaOptionsOverlay />}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <div className="tutorial-header">
              <GiPartyPopper className="tutorial-icon" />
              <h3>Welcome to Video Chat!</h3>
              <button
                className="tutorial-close"
                onClick={() => {
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
                  <h4>Connect First</h4>
                  <p>Call connects immediately without needing camera/mic</p>
                </div>
              </div>
              <div className="tutorial-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Add Media Later</h4>
                  <p>Enable camera/microphone anytime during the call</p>
                </div>
              </div>
              <div className="tutorial-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Text Chat Available</h4>
                  <p>You can always chat even without media</p>
                </div>
              </div>
            </div>
            <button
              className="tutorial-done-btn"
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('videoChatTutorialSeen', 'true');
              }}
            >
              <FaCheckCircle /> Got it!
            </button>
          </div>
        </div>
      )}

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
            onClick={() => setShowChat(!showChat)}
          >
            <FaComment />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div
        ref={swipeAreaRef}
        className={`video-swipe-area ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
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

          {/* Media Status Indicator */}
          {inCall && (
            <div className="media-status-indicator">
              <div className="media-status">
                <span className={`media-icon ${audioEnabled ? 'active' : 'inactive'}`}>
                  {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </span>
                <span className={`media-icon ${videoEnabled ? 'active' : 'inactive'}`}>
                  {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                </span>
              </div>
            </div>
          )}
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
            {!videoEnabled && <span className="pip-no-video">📴</span>}
          </div>
        </div>
      </div>

      {/* Partner Info Bar */}
      {partner && (
        <div className="partner-info-bar">
          <div className="partner-avatar">
            <FaUserCircle />
          </div>
          <div className="partner-details">
            <div className="partner-name">
              {partner.profile?.username || partner.partnerProfile?.username || 'Stranger'}
              {inCall && <span className="live-badge">LIVE</span>}
            </div>
            <div className="partner-status">
              {inCall ? (
                <span className="call-status">
                  {audioEnabled || videoEnabled ? 'Media enabled' : 'Text chat only'}
                </span>
              ) : (
                <span className="call-status">Ready to connect</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="main-controls">
        <div className="control-group left-controls">
          <button
            className={`control-btn audio-btn ${!audioEnabled ? 'muted' : ''}`}
            onClick={toggleAudio}
            disabled={!inCall}
            title={audioEnabled ? 'Mute microphone' : 'Enable microphone'}
          >
            {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          <button
            className={`control-btn video-btn ${!videoEnabled ? 'muted' : ''}`}
            onClick={toggleVideo}
            disabled={!inCall}
            title={videoEnabled ? 'Turn off camera' : 'Enable camera'}
          >
            {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>
          <button
            className="control-btn media-options-btn"
            onClick={() => setShowMediaOptions(true)}
            disabled={!inCall}
            title="Media options"
          >
            <FaPlusCircle />
          </button>
        </div>

        <div className="control-group center-controls">
          {inCall ? (
            <>
              <button
                className="control-btn end-call-btn"
                onClick={() => handleEndCall(true)}
              >
                <FaPhoneSlash />
              </button>
              <button
                className="control-btn skip-btn"
                onClick={() => {
                  handleEndCall(true);
                  handleStartSearch();
                }}
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
            className="control-btn like-btn"
            onClick={() => sendMessage('❤️')}
          >
            <FaHeart />
          </button>
          <button
            className="control-btn chat-btn"
            onClick={() => setShowChat(!showChat)}
          >
            <FaComment />
          </button>
        </div>
      </div>

      {/* Chat Drawer */}
      <div className={`chat-drawer ${showChat ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <FaComment /> Chat
            {messages.length > 0 && (
              <span className="message-count">{messages.length}</span>
            )}
          </div>
          <button
            className="chat-action-btn close-chat"
            onClick={() => setShowChat(false)}
          >
            <FaChevronRight />
          </button>
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
            onChange={(e) => setMessageText(e.target.value)}
            onFocus={handleTypingStart}
            onBlur={handleTypingStop}
            placeholder="Type a message..."
            className="message-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
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
              <p>{onlineCount} users online</p>
            </div>
          </div>
        </div>
      )}

      {connectionStatus === CONNECTION_STATES.CONNECTING && (
        <div className="status-toast connecting">
          <div className="toast-content">
            <div className="spinner"></div>
            <div className="toast-text">
              <h4>Connecting...</h4>
              <p>Establishing connection</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Banner */}
      {inCall && !(audioEnabled || videoEnabled) && (
        <div className="quick-action-banner">
          <div className="banner-content">
            <FaPlug className="banner-icon" />
            <div className="banner-text">
              <h4>Enable Media</h4>
              <p>Click the microphone or camera buttons to add media to your call</p>
            </div>
            <button
              className="banner-action"
              onClick={() => setShowMediaOptions(true)}
            >
              Enable Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatScreen;