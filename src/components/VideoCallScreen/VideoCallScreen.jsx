// src/components/VideoChatScreen.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaArrowLeft, FaRandom, FaTimes, FaUser,
  FaHeart, FaVideo, FaVideoSlash, FaMicrophone,
  FaMicrophoneSlash, FaDesktop, FaPhone, FaVolumeUp,
  FaVolumeMute, FaExpand, FaCompress, FaPalette,
  FaCog, FaQrcode, FaSync, FaUsers,
  FaEllipsisV, FaCamera,
  FaRegCopy, FaLink, FaInfoCircle, FaExclamationTriangle
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
  
  // Layout state - FIXED: Added comprehensive layout types
  const [videoLayout, setVideoLayout] = useState('pip'); // 'pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 'stack', 'focus-remote', 'focus-local', 'cinema', 'speaker-view'
  const [isMobile, setIsMobile] = useState(false);
  const [isChangingLayout, setIsChangingLayout] = useState(false);
  
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

  // Check screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-select layout based on screen size
      if (mobile) {
        handleLayoutChange('grid-vertical', false); // Vertical grid for mobile
      } else {
        handleLayoutChange('side-by-side', false); // Side-by-side for PC
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    if (peerConnectionRef.current?.remoteDescription && queuedIceCandidatesRef.current.length > 0) {
      console.log('🎯 Remote description set, processing queued candidates');
      processQueuedIceCandidates();
    }
  }, [peerConnectionRef.current?.remoteDescription, processQueuedIceCandidates]);
  
  useEffect(() => {
    const syncStreams = async () => {
      if (connectionStatus === 'connected' && peerConnectionRef.current) {
        console.log('🔄 Syncing streams on connection...');
        
        setTimeout(() => {
          const pc = peerConnectionRef.current;
          const receivers = pc.getReceivers();
          const hasRemoteTracks = receivers.some(r => r.track);
          
          if (hasRemoteTracks && !remoteStreamRef.current) {
            console.log('🔍 Found orphaned remote tracks, creating stream...');
            remoteStreamRef.current = new MediaStream();
            
            receivers.forEach(receiver => {
              if (receiver.track && !remoteStreamRef.current.getTracks()
                  .find(t => t.id === receiver.track.id)) {
                remoteStreamRef.current.addTrack(receiver.track);
                console.log(`✅ Added ${receiver.track.kind} track to remote stream`);
              }
            });
            
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
              setRemoteStream(remoteStreamRef.current);
              console.log('🎥 Updated remote video with synchronized stream');
            }
          }
          
          monitorStreams();
        }, 1000);
      }
    };
    
    syncStreams();
  }, [connectionStatus, monitorStreams]);

  useEffect(() => {
    const monitorInterval = setInterval(() => {
      if (peerConnectionRef.current) {
        const pc = peerConnectionRef.current;
        const state = {
          signalingState: pc.signalingState,
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          iceGatheringState: pc.iceGatheringState,
          localDescription: pc.localDescription?.type,
          remoteDescription: pc.remoteDescription?.type,
          senders: pc.getSenders().length,
          receivers: pc.getReceivers().length,
          transceivers: pc.getTransceivers().length
        };
        
        if (JSON.stringify(state) !== JSON.stringify(lastConnectionStateRef.current)) {
          console.log('📡 Connection state update:', state);
          lastConnectionStateRef.current = state;
          
          if (state.signalingState === 'stable') {
            if (state.localDescription === 'offer' && !callInfo.isCaller) {
              console.log('🔄 Auto-correcting: We are caller (have local offer)');
              setCallInfo(prev => ({ ...prev, isCaller: true }));
            } else if (state.localDescription === 'answer' && callInfo.isCaller) {
              console.log('🔄 Auto-correcting: We are callee (have local answer)');
              setCallInfo(prev => ({ ...prev, isCaller: false }));
            }
          }
        }
      }
    }, 2000);
    
    return () => clearInterval(monitorInterval);
  }, [callInfo.isCaller]);

  const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };

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

  // ==================== MODIFIED INITIALIZE LOCAL STREAM ====================
  const initializeLocalStream = async (usePlaceholder = false) => {
    try {
      console.log('🎬 Initializing local stream...', { usePlaceholder });
      setIsInitializing(true);
      
      if (usePlaceholder) {
        // Use placeholder stream
        const placeholder = createPlaceholderStream();
        if (placeholder) {
          localStreamRef.current = placeholder;
          setLocalStream(placeholder);
          setHasLocalStream(true);
          setUsingPlaceholder(true);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = placeholder;
            // Ensure it plays
            localVideoRef.current.play().catch(e => console.log('Placeholder play error:', e));
          }
          
          setIsVideoEnabled(true);
          setIsAudioEnabled(true);
          setDeviceError(null);
          addNotification('Using placeholder video stream', 'info');
          console.log('✅ Placeholder stream initialized');
          return true;
        }
      }
      
      // Try to get real camera and microphone
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
      
      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        setHasLocalStream(true);
        setUsingPlaceholder(false);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Ensure it plays
          localVideoRef.current.play().catch(e => console.log('Camera stream play error:', e));
        }
        
        // Check track states
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        setIsVideoEnabled(videoTrack ? videoTrack.enabled : false);
        setIsAudioEnabled(audioTrack ? audioTrack.enabled : false);
        
        setDeviceError(null);
        streamRetryCountRef.current = 0;
        
        console.log('✅ Real camera stream initialized with tracks:', {
          video: videoTrack?.enabled,
          audio: audioTrack?.enabled
        });
        
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error initializing local stream:', error);
      setDeviceError(`Camera/microphone error: ${error.message}`);
      
      if (streamRetryCountRef.current < maxStreamRetries && !usePlaceholder) {
        streamRetryCountRef.current++;
        console.log(`🔄 Retrying stream initialization (${streamRetryCountRef.current}/${maxStreamRetries})...`);
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await initializeLocalStream(false);
      } else {
        // Fall back to placeholder
        console.log('🔄 Falling back to placeholder stream...');
        return await initializeLocalStream(true);
      }
      
    } finally {
      setIsInitializing(false);
    }
    
    return false;
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
    console.log('🔄 Manually creating placeholder stream...');
    
    // Stop existing stream if any
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    // Clean up any existing animation
    if (localStreamRef.current?._animationFrame) {
      cancelAnimationFrame(localStreamRef.current._animationFrame);
    }
    
    const placeholder = createPlaceholderStream();
    if (placeholder) {
      localStreamRef.current = placeholder;
      setLocalStream(placeholder);
      setHasLocalStream(true);
      setUsingPlaceholder(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = placeholder;
        // Ensure it plays
        localVideoRef.current.play().catch(e => console.log('Placeholder play error:', e));
      }
      
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setDeviceError(null);
      addNotification('Now using placeholder video', 'success');
      
      // Update peer connection if it exists
      if (peerConnectionRef.current) {
        const videoTrack = placeholder.getVideoTracks()[0];
        const audioTrack = placeholder.getAudioTracks()[0];
        
        const videoSender = peerConnectionRef.current.getSenders()
          .find(s => s.track?.kind === 'video');
        const audioSender = peerConnectionRef.current.getSenders()
          .find(s => s.track?.kind === 'audio');
        
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
          console.log('✅ Updated peer connection with placeholder video');
        }
        
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack);
          console.log('✅ Updated peer connection with placeholder audio');
        }
      }
      
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (peerConnectionRef.current && !remoteStreamRef.current?.getTracks().length) {
        console.log('🔍 Checking for orphaned tracks...');
        
        const receivers = peerConnectionRef.current.getReceivers();
        receivers.forEach(receiver => {
          if (receiver.track && receiver.track.readyState === 'live') {
            console.log(`🎯 Found orphaned ${receiver.track.kind} track, adding to stream`);
            
            if (!remoteStreamRef.current) {
              remoteStreamRef.current = new MediaStream();
            }
            
            if (!remoteStreamRef.current.getTracks().find(t => t.id === receiver.track.id)) {
              remoteStreamRef.current.addTrack(receiver.track);
              
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStreamRef.current;
                console.log('✅ Updated remote video with orphaned track');
              }
              
              setRemoteStream(remoteStreamRef.current);
            }
          }
        });
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, []);

  const monitorRemoteStream = (stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    
    if (videoTrack) {
      setIsRemoteVideoMuted(!videoTrack.enabled);
      videoTrack.onmute = () => {
        console.log('📹 Partner video muted');
        setIsRemoteVideoMuted(true);
      };
      videoTrack.onunmute = () => {
        console.log('📹 Partner video unmuted');
        setIsRemoteVideoMuted(false);
      };
    }
    
    if (audioTrack) {
      setIsRemoteAudioMuted(!audioTrack.enabled);
      audioTrack.onmute = () => {
        console.log('🎤 Partner audio muted');
        setIsRemoteAudioMuted(true);
      };
      audioTrack.onunmute = () => {
        console.log('🎤 Partner audio unmuted');
        setIsRemoteAudioMuted(false);
      };
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

  const handleVideoMatchReady = useCallback((data) => {
    console.log('🎯 Video match ready event received:', data);
    
    if (videoMatchReadyRef.current) {
      console.log('⚠️ Already processed video match');
      return;
    }
    
    videoMatchReadyRef.current = true;
    
    const partnerId = data.partnerId || 
                     (partner?.id || partner?._id || partner?.partnerId);
    
    if (!partnerId) {
      console.error('❌ No partner ID in video match data');
      return;
    }
    
    const currentSocketId = socket?.id;
    const matchTime = data.timestamp || Date.now();
    const isCaller = currentSocketId && partnerId && 
                     (currentSocketId < partnerId);
    
    console.log('📞 Determining caller role:', {
      currentSocketId: currentSocketId?.substring(0, 8),
      partnerId: partnerId?.substring(0, 8),
      isCaller,
      rule: 'lower socket ID is caller'
    });
    
    setCallInfo({
      callId: data.callId,
      roomId: data.roomId,
      isCaller,
      partnerId,
      initialized: false
    });
    
    console.log('📞 Video call info set:', {
      callId: data.callId,
      roomId: data.roomId,
      isCaller,
      partnerId: partnerId?.substring(0, 8)
    });
    
    if (partner && debugForcePartnerUpdate) {
      debugForcePartnerUpdate({
        ...partner,
        videoCallId: data.callId,
        roomId: data.roomId,
        partnerProfile: data.partnerProfile
      });
    }
    
    addNotification('Video call is ready!', 'success');
  }, [socket, partner, debugForcePartnerUpdate, addNotification]);

  const handleWebRTCOffer = useCallback(async (data) => {
    console.log('📞 Received WebRTC offer:', {
      from: data.from,
      callId: data.callId,
      roomId: data.roomId,
      sdpType: data.sdp?.type
    });
    
    const pc = peerConnectionRef.current;
    
    if (!pc || !data.sdp) {
      console.warn('⚠️ No peer connection or SDP, ignoring offer');
      return;
    }
    
    const signalingState = pc.signalingState;
    const hasLocalOffer = pc.localDescription?.type === 'offer';
    
    console.log('📊 Current state before handling offer:', {
      signalingState,
      hasLocalOffer,
      localDescription: pc.localDescription?.type
    });
    
    if (hasLocalOffer) {
      console.warn('⚠️ GLARE: We already sent an offer, but received another offer');
      console.log('🔄 Comparing offer timestamps to decide who wins...');
      
      const ourSocketId = socket?.id;
      const theirSocketId = data.from;
      const weShouldBeCaller = ourSocketId && theirSocketId && ourSocketId < theirSocketId;
      
      if (weShouldBeCaller) {
        console.log('🎯 We win glare (lower socket ID), ignoring their offer');
        console.log('📤 Re-sending our offer...');
        
        if (pc.localDescription) {
          sendWebRTCOffer({
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
        }
        return;
      } else {
        console.log('🎯 They win glare, we become callee');
        console.log('🔄 Rolling back our offer...');
        
        await pc.setLocalDescription(null);
      }
    }
    
    try {
      console.log('🎯 Handling offer as callee...');
      
      setCallInfo(prev => ({
        ...prev,
        callId: data.callId || prev.callId,
        partnerId: data.from || prev.partnerId,
        roomId: data.roomId || prev.roomId,
        isCaller: false
      }));
      
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log('✅ Remote description (offer) set');
      
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(answer);
      console.log('✅ Local description (answer) set');
      
      sendWebRTCAnswer({
        to: data.from,
        sdp: answer,
        callId: data.callId || callInfo.callId,
        roomId: data.roomId || callInfo.roomId
      });
      
      console.log('📤 WebRTC answer sent to caller');
      
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }, [callInfo, sendWebRTCAnswer, sendWebRTCOffer, userProfile, isVideoEnabled, isAudioEnabled, socket]);

  const handleWebRTCAnswer = useCallback(async (data) => {
    console.log('✅ Received WebRTC answer:', {
      from: data.from,
      callId: data.callId,
      roomId: data.roomId,
      sdpType: data.sdp?.type
    });
    
    if (data.roomId && !callInfo.roomId) {
      console.log('🔁 Updating callInfo with roomId from answer:', data.roomId);
      setCallInfo(prev => ({
        ...prev,
        roomId: data.roomId
      }));
    }
    
    const pc = peerConnectionRef.current;
    
    if (!pc || !data.sdp) {
      console.warn('⚠️ No peer connection or SDP, ignoring answer');
      return;
    }
    
    const signalingState = pc.signalingState;
    const localDescType = pc.localDescription?.type;
    const remoteDescType = pc.remoteDescription?.type;
    
    console.log('📊 Current connection state:', {
      signalingState,
      localDescription: localDescType,
      remoteDescription: remoteDescType,
      isCaller: callInfo.isCaller,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState
    });
    
    if (signalingState === 'stable' && remoteDescType === 'answer') {
      console.log('ℹ️ Already connected (stable with answer), ignoring duplicate answer');
      
      if (localDescType === 'offer' && !callInfo.isCaller) {
        console.log('🔄 Correcting role: we are caller (we sent offer)');
        setCallInfo(prev => ({ ...prev, isCaller: true }));
      }
      
      setTimeout(() => {
        const receivers = pc.getReceivers();
        console.log('📊 Current receivers:', receivers.length);
        receivers.forEach((rec, idx) => {
          if (rec.track) {
            console.log(`  Receiver ${idx}: ${rec.track.kind} - ${rec.track.readyState}`);
          }
        });
      }, 500);
      
      return;
    }
    
    if (signalingState === 'have-local-offer') {
      console.log('🎯 We are CALLER (have-local-offer), processing answer...');
      
      if (!callInfo.isCaller) {
        console.log('🔄 Setting isCaller = true');
        setCallInfo(prev => ({ ...prev, isCaller: true }));
      }
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('✅ Remote description (answer) set');
        
        setConnectionStatus('connected');
        addNotification('Video call connected!', 'success');
        
        setTimeout(() => {
          const receivers = pc.getReceivers();
          console.log('📊 Active receivers after answer:', receivers.length);
          
          if (receivers.length === 0) {
            console.warn('⚠️ No receivers! Check ontrack event');
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error setting remote description:', error);
        
        if (error.message.includes('wrong state: stable')) {
          console.log('ℹ️ Already stable, just updating role');
          if (!callInfo.isCaller) {
            setCallInfo(prev => ({ ...prev, isCaller: true }));
          }
        }
      }
      
    } else if (signalingState === 'stable' && localDescType === 'offer') {
      console.log('🔄 Stable with local offer - we are actually CALLER');
      setCallInfo(prev => ({ ...prev, isCaller: true }));
      
      if (!remoteDescType || remoteDescType !== 'answer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          console.log('✅ Updated to answer in stable state');
        } catch (error) {
          console.warn('⚠️ Could not update remote description:', error.message);
        }
      }
      
    } else if (signalingState === 'have-remote-offer') {
      console.warn('❌ CALLEE received answer - ignoring');
      
      if (localDescType === 'answer') {
        console.log('🔄 Re-sending our answer...');
        sendWebRTCAnswer({
          to: data.from,
          sdp: pc.localDescription,
          callId: data.callId || callInfo.callId,
          roomId: data.roomId || callInfo.roomId
        });
      }
      
    } else {
      console.log(`ℹ️ Answer received in ${signalingState} state, trying to handle...`);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('✅ Remote description set');
        
        if (!callInfo.isCaller) {
          console.log('🔄 Updating role to caller');
          setCallInfo(prev => ({ ...prev, isCaller: true }));
        }
        
      } catch (error) {
        console.warn('⚠️ Could not set remote description:', error.message);
      }
    }
    
    setTimeout(() => {
      console.log('📊 Final state after answer processing:', {
        signalingState: pc.signalingState,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        localDescription: pc.localDescription?.type,
        remoteDescription: pc.remoteDescription?.type,
        isCaller: callInfo.isCaller
      });
    }, 1000);
  }, [callInfo, sendWebRTCAnswer, addNotification]);

  const handleWebRTCIceCandidate = useCallback(async (data) => {
    console.log('🧊 Received ICE candidate:', {
      from: data.from,
      candidate: data.candidate?.candidate?.substring(0, 50) + '...'
    });
    
    if (peerConnectionRef.current && data.candidate) {
      try {
        if (!peerConnectionRef.current.remoteDescription) {
          console.log('⏳ Queueing ICE candidate (no remote description yet)');
          
          if (!queuedIceCandidatesRef.current) {
            queuedIceCandidatesRef.current = [];
          }
          queuedIceCandidatesRef.current.push(new RTCIceCandidate(data.candidate));
          
          setTimeout(() => {
            processQueuedIceCandidates();
          }, 100);
          
          return;
        }
        
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
        console.log('✅ ICE candidate added');
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
        
        if (error.message.includes('remote description was null')) {
          console.log('📥 Queueing ICE candidate for later...');
          if (!queuedIceCandidatesRef.current) {
            queuedIceCandidatesRef.current = [];
          }
          queuedIceCandidatesRef.current.push(new RTCIceCandidate(data.candidate));
        }
      }
    }
  }, []);

  const handleWebRTCEnd = useCallback((data) => {
    console.log('📵 WebRTC call ended:', data);
    addNotification('Partner ended the video call', 'info');
    handleDisconnect();
  }, [addNotification]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    console.log('🎬 VideoChatScreen mounted');
    
    fetchIceServers();
    
    // Try to initialize with real camera first, fallback to placeholder
    const initStream = async () => {
      const success = await initializeLocalStream(false);
      if (!success) {
        console.log('🔄 Falling back to placeholder after mount');
        await initializeLocalStream(true);
      }
    };
    
    initStream();
    
    const handleVideoCallReady = (event) => {
      console.log('🔔 Custom video-call-ready event:', event.detail);
      handleVideoMatchReady(event.detail);
    };
    
    const handleWebRTCOfferEvent = (event) => handleWebRTCOffer(event.detail);
    const handleWebRTCAnswerEvent = (event) => handleWebRTCAnswer(event.detail);
    const handleWebRTCIceCandidateEvent = (event) => handleWebRTCIceCandidate(event.detail);
    const handleWebRTCEndEvent = (event) => handleWebRTCEnd(event.detail);
    
    window.addEventListener('video-call-ready', handleVideoCallReady);
    window.addEventListener('webrtc-offer', handleWebRTCOfferEvent);
    window.addEventListener('webrtc-answer', handleWebRTCAnswerEvent);
    window.addEventListener('webrtc-ice-candidate', handleWebRTCIceCandidateEvent);
    window.addEventListener('webrtc-end', handleWebRTCEndEvent);
    
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    hideControls();
    
    const handleMouseMove = () => {
      setShowControls(true);
      hideControls();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      console.log('🧹 VideoChatScreen cleanup');
      cleanup();
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('video-call-ready', handleVideoCallReady);
      window.removeEventListener('webrtc-offer', handleWebRTCOfferEvent);
      window.removeEventListener('webrtc-answer', handleWebRTCAnswerEvent);
      window.removeEventListener('webrtc-ice-candidate', handleWebRTCIceCandidateEvent);
      window.removeEventListener('webrtc-end', handleWebRTCEndEvent);
      
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const shouldInitialize = 
      localStreamRef.current && 
      partner && 
      callInfo.callId && 
      callInfo.roomId && 
      !initializationRef.current &&
      !callInfo.initialized;
    
    if (shouldInitialize) {
      console.log('🚀 Conditions met for WebRTC initialization');
      initializeWebRTCConnection();
      setCallInfo(prev => ({ ...prev, initialized: true }));
    }
  }, [localStreamRef.current, partner, callInfo, initializeWebRTCConnection]);

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

  const handleNext = () => {
    console.log('⏭️ Switching to next partner');
    handleDisconnect();
    setTimeout(() => {
      if (nextPartner) {
        nextPartner();
      }
    }, 500);
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

  const testAllLayouts = async () => {
    const layouts = [
      'pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 
      'stack', 'focus-remote', 'focus-local', 'cinema', 'speaker-view'
    ];
    
    for (let i = 0; i < layouts.length; i++) {
      const layout = layouts[i];
      console.log(`\n=== TESTING LAYOUT: ${layout} ===`);
      handleLayoutChange(layout, false);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      debugLayoutInfo();
    }
  };

  const checkStreamState = () => {
    console.log('=== STREAM STATE DEBUG ===');
    
    console.log('📱 Local Stream:', {
      exists: !!localStreamRef.current,
      active: localStreamRef.current?.active,
      tracks: localStreamRef.current?.getTracks().length || 0,
      videoTracks: localStreamRef.current?.getVideoTracks().length || 0,
      audioTracks: localStreamRef.current?.getAudioTracks().length || 0,
      isPlaceholder: usingPlaceholder
    });
    
    console.log('📹 Remote Stream:', {
      exists: !!remoteStreamRef.current,
      active: remoteStreamRef.current?.active,
      tracks: remoteStreamRef.current?.getTracks().length || 0,
      videoTracks: remoteStreamRef.current?.getVideoTracks().length || 0,
      audioTracks: remoteStreamRef.current?.getAudioTracks().length || 0
    });
    
    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;
      console.log('🔗 Peer Connection:', {
        signalingState: pc.signalingState,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState
      });
    }
    
    console.log('=== END DEBUG ===');
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
    
    const containerClass = `absolute inset-0 transition-all duration-500 ease-in-out ${
      isChangingLayout ? 'opacity-90 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
    }`;
    
    // Common video props
    const localVideoProps = {
      ref: localVideoRef,
      autoPlay: true,
      playsInline: true,
      muted: true,
      className: "w-full h-full object-cover",
      onLoadedMetadata: () => console.log('🎥 Local video metadata loaded'),
      onCanPlay: () => console.log('✅ Local video can play'),
      onError: (e) => console.error('Local video error:', e)
    };
    
    const remoteVideoProps = {
      ref: remoteVideoRef,
      autoPlay: true,
      playsInline: true,
      className: "w-full h-full object-cover",
      onLoadedMetadata: () => console.log('🎥 Remote video metadata loaded'),
      onCanPlay: () => console.log('✅ Remote video can play'),
      onError: (e) => console.error('Remote video error:', e)
    };
    
    switch(videoLayout) {
      case 'grid-horizontal':
        return (
          <div ref={videoContainerRef} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full gap-2 p-2 ${layoutAnimations['grid-horizontal']} ${containerClass}`}>
            {/* Remote Video */}
            <div className={`flex-1 relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video */}
            <div className={`flex-1 relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local')}
            </div>
          </div>
        );
        
      case 'grid-vertical':
        return (
          <div ref={videoContainerRef} className={`flex flex-col h-full gap-2 p-2 ${layoutAnimations['grid-vertical']} ${containerClass}`}>
            {/* Remote Video */}
            <div className={`flex-1 relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video */}
            <div className={`flex-1 relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local')}
            </div>
          </div>
        );
        
      case 'side-by-side':
        return (
          <div ref={videoContainerRef} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full gap-3 p-3 ${layoutAnimations['side-by-side']} ${containerClass}`}>
            {/* Remote Video - 70% */}
            <div className={`${isMobile ? 'h-2/3' : 'w-[70%]'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video - 30% */}
            <div className={`${isMobile ? 'h-1/3' : 'w-[30%]'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local')}
            </div>
          </div>
        );
        
      case 'stack':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.stack} ${containerClass}`}>
            {/* Remote Video - Bottom Layer */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video - Top Layer (Smaller) */}
            <div className={`absolute ${isMobile ? 'bottom-4 left-4 w-40 h-32' : 'bottom-8 left-8 w-80 h-60'} rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local', true)}
            </div>
          </div>
        );
        
      case 'cinema':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.cinema} ${containerClass}`}>
            {/* Remote Video - Full Screen with Black Bars */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-black'}`}>
              <video {...remoteVideoProps} className="w-full h-full object-contain" />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video - Small Corner */}
            <div className={`absolute ${isMobile ? 'top-4 right-4 w-32 h-24' : 'top-6 right-6 w-48 h-36'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local', true)}
            </div>
          </div>
        );
        
      case 'speaker-view':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['speaker-view']} ${containerClass}`}>
            {/* Main Speaker (Remote) */}
            <div className={`absolute ${isMobile ? 'inset-0' : 'inset-x-0 top-0 h-3/4'} ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video - Smaller at bottom */}
            <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4 h-32' : 'bottom-8 left-1/4 right-1/4 h-1/4'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local', true)}
            </div>
          </div>
        );
        
      case 'focus-remote':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['focus-remote']} ${containerClass}`}>
            {/* Remote Video - Main */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video - PIP */}
            <div className={`absolute ${isMobile ? 'top-4 right-4 w-32 h-24' : 'top-6 right-6 w-56 h-42'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local', true)}
            </div>
          </div>
        );
        
      case 'focus-local':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['focus-local']} ${containerClass}`}>
            {/* Local Video - Main */}
            <div className={`absolute inset-0`}>
              <video {...localVideoProps} />
              {renderVideoOverlay('local')}
            </div>
            
            {/* Remote Video - PIP */}
            <div className={`absolute ${isMobile ? 'top-4 left-4 w-32 h-24' : 'top-6 left-6 w-56 h-42'} rounded-xl overflow-hidden border-2 border-gray-700/50`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote', true)}
            </div>
          </div>
        );
        
      case 'pip':
      default:
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.pip} ${containerClass}`}>
            {/* Remote Video - Full Screen */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              {renderVideoOverlay('remote')}
            </div>
            
            {/* Local Video - PIP */}
            <div className={`absolute ${isMobile ? 'top-4 right-4 w-40 h-30' : 'top-8 right-8 w-72 h-54'} rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
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
            {/* Layout Switcher - Enhanced with more options */}
            <div className="hidden sm:flex items-center space-x-1 bg-gray-800/30 rounded-lg p-1 backdrop-blur-sm">
              {['pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 'stack', 'cinema', 'speaker-view', 'focus-remote', 'focus-local'].map((layout) => (
                <button
                  key={layout}
                  onClick={() => handleLayoutChange(layout)}
                  className={`p-1.5 rounded transition-all duration-300 ${videoLayout === layout ? 'bg-blue-500/30 border border-blue-500/50' : 'hover:bg-gray-700/30 border border-transparent'}`}
                  title={layout.replace('-', ' ')}
                >
                  <div className="w-4 h-3">
                    {getLayoutIcon(layout)}
                  </div>
                </button>
              ))}
            </div>
            
            {usingPlaceholder && (
              <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <span className="text-xs text-purple-300">Placeholder</span>
              </div>
            )}
            
            <button
              onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
              className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaPalette className="text-sm sm:text-base group-hover:rotate-180 transition-transform" />
            </button>
            
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
                title="Copy Room Link"
              >
                <FaLink className="text-sm sm:text-base group-hover:scale-110 transition-transform" />
              </button>
            )}
            
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
      
      {/* Controls Bar - FIXED: Always at bottom without scrolling needed */}
      <div className={`relative bg-gray-900/70 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Main Controls - Large buttons for easy access */}
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
              
              {/* End Call - Prominent */}
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
            </div>
          </div>
        </div>
        
        {/* Additional Controls - Smaller secondary buttons */}
        <div className="px-4 pb-2 sm:px-6 sm:pb-3 border-t border-gray-800/30 pt-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <button
                onClick={debugLayoutInfo}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
                title="Debug layout information"
              >
                <FaInfoCircle className="inline mr-1 sm:mr-2" />
                <span>Debug Layout</span>
              </button>
              
              <button
                onClick={debugStreamInfo}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                title="Debug stream information"
              >
                <FaInfoCircle className="inline mr-1 sm:mr-2" />
                <span>Debug Streams</span>
              </button>
              
              <button
                onClick={testAllLayouts}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-green-500/30"
                title="Test all layouts"
              >
                <FaSync className="inline mr-1 sm:mr-2" />
                <span>Test Layouts</span>
              </button>
              
              {callInfo.roomId && (
                <button
                  onClick={copyRoomLink}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                  title="Copy room link"
                >
                  <FaRegCopy className="inline mr-1 sm:mr-2" />
                  <span>Copy Link</span>
                </button>
              )}
              
              {!hasLocalStream && (
                <button
                  onClick={retryLocalStream}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
                  title="Retry camera"
                >
                  <FaSync className="inline mr-1 sm:mr-2" />
                  <span>Retry Camera</span>
                </button>
              )}
              
              <button
                onClick={createAndUsePlaceholder}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
                title="Use placeholder video"
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
        <div className="absolute top-14 sm:top-16 right-4 sm:right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-700/50 shadow-2xl w-64 sm:w-80 z-50 animate-slide-down">
          <div className="space-y-3 sm:space-y-4">
            <div>
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
              <p className="text-xs text-gray-400 mt-1">
                Automatically search for next partner
              </p>
            </div>
            
            {partner && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Partner Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{partner.profile?.username || partner.username || 'Stranger'}</div>
                      <div className="text-xs text-gray-400">
                        {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-800">
                    <div className="text-xs text-gray-400 mb-2">Connection</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{connectionStatus}</span>
                      <span className="text-xs text-gray-400">{formatTime(callDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Video Layout</h4>
              <div className="grid grid-cols-3 gap-2">
                {['pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 'stack', 'cinema', 'speaker-view', 'focus-remote', 'focus-local'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => handleLayoutChange(layout)}
                    className={`p-2 rounded-lg transition-all duration-300 ${videoLayout === layout ? 'bg-blue-500/20 border-blue-500/50' : 'bg-gray-800/30 border-gray-700/50'} border hover:scale-105`}
                    title={layout.replace('-', ' ')}
                  >
                    <div className="text-xs text-gray-300 truncate">
                      {layout.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Video Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Camera Status</span>
                  <span className={`text-xs ${hasLocalStream ? (usingPlaceholder ? 'text-purple-400' : 'text-green-400') : 'text-red-400'}`}>
                    {hasLocalStream ? (usingPlaceholder ? 'Placeholder' : 'Connected') : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Retry Count</span>
                  <span className="text-xs text-gray-400">{retryCount}</span>
                </div>
                
                <button
                  onClick={retryLocalStream}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30 hover:scale-[1.02]"
                >
                  Reinitialize Camera
                </button>
                
                <button
                  onClick={createAndUsePlaceholder}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30 hover:scale-[1.02]"
                >
                  {usingPlaceholder ? 'Refresh Placeholder' : 'Use Placeholder Video'}
                </button>
              </div>
            </div>
            
            {/* Quick Connection Test */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => {
                  forceStreamSync();
                  addNotification('Forced stream sync', 'info');
                }}
                className="w-full px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30 hover:scale-[1.02]"
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

// Helper function to get layout icons
const getLayoutIcon = (layout) => {
  switch(layout) {
    case 'pip':
      return (
        <div className="w-full h-full border border-gray-400 rounded relative">
          <div className="absolute top-0 right-0 w-2 h-2 border border-gray-400 rounded-sm"></div>
        </div>
      );
    case 'grid-horizontal':
      return (
        <div className="w-full h-full flex gap-0.5">
          <div className="flex-1 border border-gray-400 rounded"></div>
          <div className="flex-1 border border-gray-400 rounded"></div>
        </div>
      );
    case 'grid-vertical':
      return (
        <div className="w-full h-full flex flex-col gap-0.5">
          <div className="flex-1 border border-gray-400 rounded"></div>
          <div className="flex-1 border border-gray-400 rounded"></div>
        </div>
      );
    case 'side-by-side':
      return (
        <div className="w-full h-full flex gap-0.5">
          <div className="w-2/3 border border-gray-400 rounded"></div>
          <div className="w-1/3 border border-gray-400 rounded"></div>
        </div>
      );
    case 'stack':
      return (
        <div className="w-full h-full relative">
          <div className="absolute inset-0 border border-gray-400 rounded"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-2/3 border border-gray-400 rounded"></div>
        </div>
      );
    case 'cinema':
      return (
        <div className="w-full h-full border border-gray-400 rounded flex items-center justify-center">
          <div className="w-3/4 h-2/3 border-t border-b border-gray-400"></div>
        </div>
      );
    case 'speaker-view':
      return (
        <div className="w-full h-full flex flex-col gap-0.5">
          <div className="h-3/4 border border-gray-400 rounded"></div>
          <div className="h-1/4 border border-gray-400 rounded"></div>
        </div>
      );
    case 'focus-remote':
      return (
        <div className="w-full h-full relative">
          <div className="absolute inset-0 border border-gray-400 rounded"></div>
          <div className="absolute top-1 right-1 w-1/3 h-1/3 border border-gray-400 rounded-sm"></div>
        </div>
      );
    case 'focus-local':
      return (
        <div className="w-full h-full relative">
          <div className="absolute inset-0 border border-gray-400 rounded"></div>
          <div className="absolute top-1 left-1 w-1/3 h-1/3 border border-gray-400 rounded-sm"></div>
        </div>
      );
    default:
      return <div className="w-full h-full border border-gray-400 rounded"></div>;
  }
};

// Add custom CSS for smooth transitions
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
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default VideoChatScreen;