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
import { useChat } from '../context/ChatContext';

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


  // Add these refs at the top with other refs
const queuedIceCandidatesRef = useRef([]);
const processingCandidatesRef = useRef(false);

// Add this function to process queued ICE candidates
const processQueuedIceCandidates = useCallback(async () => {
  if (processingCandidatesRef.current || !queuedIceCandidatesRef.current.length) {
    return;
  }
  
  processingCandidatesRef.current = true;
  
  console.log(`🔄 Processing ${queuedIceCandidatesRef.current.length} queued ICE candidates`);
  
  try {
    if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
      const candidates = [...queuedIceCandidatesRef.current];
      queuedIceCandidatesRef.current = [];
      
      for (const candidate of candidates) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
          console.log('✅ Added queued ICE candidate');
        } catch (err) {
          console.error('❌ Failed to add queued ICE candidate:', err);
          // Put it back in queue
          queuedIceCandidatesRef.current.push(candidate);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing queued ICE candidates:', error);
  } finally {
    processingCandidatesRef.current = false;
  }
}, []);

// Add this effect to process queued candidates when remote description is set
useEffect(() => {
  if (peerConnectionRef.current?.remoteDescription && queuedIceCandidatesRef.current.length > 0) {
    console.log('🎯 Remote description set, processing queued candidates');
    processQueuedIceCandidates();
  }
}, [peerConnectionRef.current?.remoteDescription, processQueuedIceCandidates]);
  
  const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };

  // ==================== INITIALIZATION ====================
  
  const fetchIceServers = async () => {
    try {
      const response = await fetch('https://randomchat-lfo7.onrender.com/webrtc/config');
      const config = await response.json();
      console.log('🧊 ICE servers loaded:', config.iceServers?.length || 0);
      
      if (config.iceServers && config.iceServers.length > 0) {
        setIceServers(config.iceServers);
        return config.iceServers;
      } else {
        // Fallback to public STUN servers
        const fallbackServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ];
        setIceServers(fallbackServers);
        return fallbackServers;
      }
    } catch (error) {
      console.error('Failed to fetch ICE servers:', error);
      // Fallback to public STUN servers
      const fallbackServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ];
      setIceServers(fallbackServers);
      return fallbackServers;
    }
  };

const initializeLocalStream = async (forceRetry = false) => {
  if (isInitializing && !forceRetry) {
    console.log('⏳ Already initializing local stream');
    return null;
  }
  
  setIsInitializing(true);
  setDeviceError(null);
  
  console.log('🎥 Requesting media devices...');
  
  try {
    // First, get all available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const audioDevices = devices.filter(d => d.kind === 'audioinput');
    
    console.log('📱 Available devices:', {
      video: videoDevices.length,
      audio: audioDevices.length,
      devices: devices.map(d => ({ 
        kind: d.kind, 
        label: d.label,
        deviceId: d.deviceId 
      }))
    });
    
    // Stop any existing stream FIRST (critical)
    if (localStreamRef.current) {
      console.log('🛑 Stopping existing local stream tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      localStreamRef.current = null;
    }
    
    // Wait a bit to allow device to be released
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Build constraints based on available devices
    let constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    
    // If no video devices, use audio only
    if (videoDevices.length === 0) {
      console.warn('⚠️ No video devices found, using audio only');
      constraints.video = false;
    } else {
      // Try specific device IDs to avoid "in use" errors
      constraints.video.deviceId = { exact: videoDevices[0].deviceId };
    }
    
    // If no audio devices, use video only
    if (audioDevices.length === 0) {
      console.warn('⚠️ No audio devices found, using video only');
      constraints.audio = false;
    } else {
      constraints.audio.deviceId = { exact: audioDevices[0].deviceId };
    }
    
    // Try different approaches to get the stream
    let stream = null;
    let attemptCount = 0;
    const maxAttempts = 3;
    
    while (!stream && attemptCount < maxAttempts) {
      attemptCount++;
      console.log(`🔄 Attempt ${attemptCount}/${maxAttempts} to get media stream`);
      
      try {
        // First try with specific constraints
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(`✅ Got stream on attempt ${attemptCount}`);
      } catch (error) {
        console.warn(`⚠️ Attempt ${attemptCount} failed:`, error.name, error.message);
        
        if (attemptCount < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try different constraints on retry
          if (attemptCount === 2) {
            // Second attempt: try without specific device IDs
            console.log('🔄 Trying without specific device IDs...');
            constraints = {
              video: videoDevices.length > 0,
              audio: audioDevices.length > 0
            };
          } else if (attemptCount === 3) {
            // Third attempt: try with minimal constraints
            console.log('🔄 Trying with minimal constraints...');
            constraints = {
              video: videoDevices.length > 0 ? {
                width: { min: 320, ideal: 640, max: 1280 },
                height: { min: 240, ideal: 480, max: 720 },
                frameRate: { ideal: 15, max: 30 }
              } : false,
              audio: audioDevices.length > 0
            };
          }
        }
      }
    }
    
    if (!stream) {
      throw new Error('Could not access media devices after multiple attempts');
    }
    
    // Verify stream has tracks
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    console.log('✅ Stream obtained:', {
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
      videoEnabled: videoTracks[0]?.enabled ?? false,
      audioEnabled: audioTracks[0]?.enabled ?? false
    });
    
    // Set up track event listeners
    videoTracks.forEach(track => {
      track.onended = () => {
        console.warn('Video track ended');
        setIsVideoEnabled(false);
      };
      track.onmute = () => {
        console.log('Video track muted');
        setIsVideoEnabled(false);
      };
      track.onunmute = () => {
        console.log('Video track unmuted');
        setIsVideoEnabled(true);
      };
    });
    
    audioTracks.forEach(track => {
      track.onended = () => {
        console.warn('Audio track ended');
        setIsAudioEnabled(false);
      };
      track.onmute = () => {
        console.log('Audio track muted');
        setIsAudioEnabled(false);
      };
      track.onunmute = () => {
        console.log('Audio track unmuted');
        setIsAudioEnabled(true);
      };
    });
    
    localStreamRef.current = stream;
    setLocalStream(stream);
    setHasLocalStream(true);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      console.log('✅ Local video element updated');
      
      // Try to play the video
      localVideoRef.current.play().catch(err => {
        console.warn('⚠️ Local video auto-play failed:', err);
      });
    }
    
    // Update enabled states based on actual track status
    setIsVideoEnabled(videoTracks.length > 0 && (videoTracks[0]?.enabled ?? true));
    setIsAudioEnabled(audioTracks.length > 0 && (audioTracks[0]?.enabled ?? true));
    
    streamRetryCountRef.current = 0;
    console.log('✅ Local stream initialization complete');
    return stream;
    
  } catch (error) {
    console.error('❌ Failed to get local stream:', error.name, error.message);
    
    streamRetryCountRef.current += 1;
    
    if (streamRetryCountRef.current < maxStreamRetries) {
      console.log(`🔄 Retrying stream (${streamRetryCountRef.current}/${maxStreamRetries})...`);
      setDeviceError(`Failed to access camera/microphone. Retrying... (${streamRetryCountRef.current}/${maxStreamRetries})`);
      
      // Wait and retry with longer delay
      await new Promise(resolve => setTimeout(resolve, 1000 * streamRetryCountRef.current));
      return initializeLocalStream(true);
    }
    
    // All retries failed
    setDeviceError('Cannot access camera or microphone. Please check permissions and ensure no other app is using the camera.');
    addNotification('Cannot access camera/microphone. Using placeholder.', 'error');
    
    // Create placeholder stream
    return createPlaceholderStream();
    
  } finally {
    setIsInitializing(false);
  }
};

const createPlaceholderStream = () => {
  console.log('🎭 Creating placeholder stream');
  
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  
  // Create animated placeholder
  let animationFrame = null;
  let pulseValue = 0;
  
  const drawPlaceholder = () => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pulsing circle
    pulseValue = (pulseValue + 0.05) % (Math.PI * 2);
    const pulseSize = Math.sin(pulseValue) * 10 + 70;
    
    // Draw user icon
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 - 20, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👤', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Arial';
    ctx.fillText('Camera Unavailable', canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Please check camera permissions', canvas.width / 2, canvas.height / 2 + 90);
    
    // Continue animation
    animationFrame = requestAnimationFrame(drawPlaceholder);
  };
  
  drawPlaceholder();
  const stream = canvas.captureStream(15); // 15 FPS
  
  // Store animation frame for cleanup
  stream._animationFrame = animationFrame;
  
  localStreamRef.current = stream;
  setLocalStream(stream);
  setHasLocalStream(true);
  setIsVideoEnabled(false);
  
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
  }
  
  return stream;
};



  // ==================== WEBRTC CORE FUNCTIONS ====================

const createPeerConnection = useCallback((servers) => {
  console.log('🔗 Creating peer connection with ICE servers:', servers.length);
  
  const configuration = {
    iceServers: servers,
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };
  
  const pc = new RTCPeerConnection(configuration);
  peerConnectionRef.current = pc;
  
  // CRITICAL: Add transceivers before tracks
  pc.addTransceiver('video', { direction: 'sendrecv' });
  pc.addTransceiver('audio', { direction: 'sendrecv' });
  
  // Set up event handlers
  pc.onicecandidate = (event) => {
    if (event.candidate && socket?.connected && callInfo.partnerId) {
      console.log('🧊 Sending ICE candidate to partner:', callInfo.partnerId);
      sendWebRTCIceCandidate({
        to: callInfo.partnerId,
        candidate: event.candidate,
        callId: callInfo.callId,
        roomId: callInfo.roomId
      });
    }
  };
  
  // Log signaling state changes
  pc.onsignalingstatechange = () => {
    console.log('📶 Signaling state changed:', pc.signalingState);
  };
  
  pc.oniceconnectionstatechange = () => {
    console.log('🧊 ICE connection state:', pc.iceConnectionState);
    if (pc.iceConnectionState === 'failed') {
      console.warn('⚠️ ICE connection failed, restarting ICE...');
      pc.restartIce();
    }
  };
  
  pc.onconnectionstatechange = () => {
    console.log('🔄 Peer connection state:', pc.connectionState);
    setConnectionStatus(pc.connectionState);
    
    if (pc.connectionState === 'connected') {
      console.log('✅ Peer connection established!');
      addNotification('Video call connected!', 'success');
      startStatsCollection();
    } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      console.warn(`⚠️ Peer connection ${pc.connectionState}`);
      if (pc.connectionState === 'failed' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        attemptReconnect();
      }
    }
  };
  
  // Proper track event handler
  pc.ontrack = (event) => {
    console.log('🎬 Received remote track:', {
      kind: event.track.kind,
      id: event.track.id,
      readyState: event.track.readyState,
      streams: event.streams?.length || 0
    });
    
    if (event.streams && event.streams.length > 0) {
      const remoteStream = event.streams[0];
      console.log('📹 Remote stream received:', {
        streamId: remoteStream.id,
        videoTracks: remoteStream.getVideoTracks().length,
        audioTracks: remoteStream.getAudioTracks().length
      });
      
      // Create or update remote stream
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      
      // Add all tracks from the stream
      event.streams[0].getTracks().forEach(track => {
        if (!remoteStreamRef.current.getTracks().find(t => t.id === track.id)) {
          remoteStreamRef.current.addTrack(track);
          console.log(`✅ Added ${track.kind} track to remote stream`);
        }
      });
      
      // Update remote video element
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        console.log('✅ Remote video element updated with stream');
        
        // Try to play
        remoteVideoRef.current.play().catch(err => {
          console.warn('⚠️ Auto-play failed:', err);
        });
      }
      
      setRemoteStream(remoteStreamRef.current);
      monitorRemoteStream(remoteStreamRef.current);
      
      addNotification('Partner video received', 'success');
    }
  };
  
  pc.onnegotiationneeded = async () => {
    console.log('🔁 Negotiation needed, current state:', pc.signalingState);
    if (callInfo.isCaller && pc.signalingState === 'stable') {
      console.log('📤 Creating offer as caller...');
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        
        sendWebRTCOffer({
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
        
        console.log('📤 Offer sent to partner');
      } catch (error) {
        console.error('❌ Error creating offer:', error);
      }
    }
  };
  
  return pc;
}, [socket, callInfo, sendWebRTCIceCandidate, sendWebRTCOffer, userProfile, isVideoEnabled, isAudioEnabled, addNotification]);

const initializeWebRTCConnection = useCallback(async () => {
  // Prevent multiple initializations
  if (initializationRef.current) {
    console.log('⚠️ WebRTC already initialized');
    return;
  }
  
  if (!partner) {
    console.error('❌ Cannot initialize WebRTC: No partner');
    return;
  }
  
  if (!localStreamRef.current) {
    console.error('❌ Cannot initialize WebRTC: No local stream');
    return;
  }
  
  if (!callInfo.callId || !callInfo.roomId) {
    console.error('❌ Cannot initialize WebRTC: Missing call info');
    return;
  }
  
  console.log('🚀 Initializing WebRTC connection with:', {
    callId: callInfo.callId,
    roomId: callInfo.roomId,
    isCaller: callInfo.isCaller,
    partnerId: callInfo.partnerId,
    hasLocalStream: !!localStreamRef.current
  });
  
  initializationRef.current = true;
  setConnectionStatus('connecting');
  
  try {
    // Get ICE servers
    const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
    
    // Create peer connection
    const pc = createPeerConnection(servers);
    
    // CRITICAL FIX: Add local stream tracks PROPERLY
    const localStream = localStreamRef.current;
    const tracks = localStream.getTracks();
    
    console.log('🎬 Adding local tracks:', {
      totalTracks: tracks.length,
      videoTracks: localStream.getVideoTracks().length,
      audioTracks: localStream.getAudioTracks().length
    });
    
    // Add each track with proper transceiver handling
    tracks.forEach(track => {
      console.log(`📤 Adding ${track.kind} track to peer connection`);
      try {
        // Find an available transceiver for this track type
        const transceivers = pc.getTransceivers();
        const transceiver = transceivers.find(t => 
          t.receiver.track?.kind === track.kind || 
          t.sender.track?.kind === track.kind
        );
        
        if (transceiver && !transceiver.sender.track) {
          // Use existing transceiver
          transceiver.sender.replaceTrack(track);
          console.log(`✅ Replaced track on existing ${track.kind} transceiver`);
        } else {
          // Add new track
          pc.addTrack(track, localStream);
          console.log(`✅ Added new ${track.kind} track`);
        }
      } catch (error) {
        console.error(`❌ Failed to add ${track.kind} track:`, error);
      }
    });
    
    // If we're the caller, create and send offer
    if (callInfo.isCaller) {
      console.log('📤 Creating offer as caller');
      setTimeout(async () => {
        try {
          await createAndSendOffer(pc);
        } catch (error) {
          console.error('❌ Failed to create offer:', error);
        }
      }, 1000);
    } else {
      console.log('📥 Waiting for offer as callee');
    }
    
    console.log('✅ WebRTC connection initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize WebRTC:', error);
    addNotification('Failed to start video call', 'error');
    initializationRef.current = false;
    setConnectionStatus('failed');
  }
}, [partner, callInfo, iceServers, createPeerConnection, addNotification]);




  const createAndSendOffer = async (pc = peerConnectionRef.current) => {
    if (!pc || !socket?.connected || !callInfo.partnerId) return;
    
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      console.log('📝 Created offer:', offer.type);
      
      await pc.setLocalDescription(offer);
      
      sendWebRTCOffer({
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
      
      console.log('📤 Sent WebRTC offer to partner:', callInfo.partnerId);
      
    } catch (error) {
      console.error('❌ Error creating/sending offer:', error);
    }
  };

  // ==================== EVENT HANDLERS ====================

  const handleVideoMatchReady = useCallback((data) => {
    console.log('🎯 Video match ready event received:', data);
    
    if (videoMatchReadyRef.current) {
      console.log('⚠️ Already processed video match');
      return;
    }
    
    videoMatchReadyRef.current = true;
    
    // Extract partner ID from various possible locations
    const partnerId = data.partnerId || 
                     (partner?.id || partner?._id || partner?.partnerId);
    
    if (!partnerId) {
      console.error('❌ No partner ID in video match data');
      return;
    }
    
    // Determine if we're the caller
    const currentSocketId = socket?.id;
    const isCaller = currentSocketId && partnerId && 
                    (currentSocketId < partnerId);
    
    // Update call info
    setCallInfo({
      callId: data.callId,
      roomId: data.roomId,
      isCaller,
      partnerId,
      initialized: false
    });
    
    console.log('📞 Video call info updated:', {
      callId: data.callId,
      roomId: data.roomId,
      isCaller,
      partnerId,
      socketId: currentSocketId
    });
    
    // Update partner if needed
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
  
  // Only handle if we're the callee (not the caller)
  if (!callInfo.isCaller && data.sdp) {
    console.log('🎯 Handling offer as callee...');
    
    // Update call info
    setCallInfo(prev => ({
      ...prev,
      callId: data.callId || prev.callId,
      partnerId: data.from || prev.partnerId,
      roomId: data.roomId || prev.roomId,
      isCaller: false
    }));
    
    if (!peerConnectionRef.current) {
      console.warn('⚠️ No peer connection, creating one...');
      
      // Create peer connection if it doesn't exist
      const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
      const pc = createPeerConnection(servers);
      
      // Add local tracks
      if (localStreamRef.current) {
        const tracks = localStreamRef.current.getTracks();
        tracks.forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }
    }
    
    if (peerConnectionRef.current) {
      try {
        const pc = peerConnectionRef.current;
        const signalingState = pc.signalingState;
        
        console.log('📊 Current signaling state:', signalingState);
        
        // Check if we can process this offer
        if (signalingState === 'stable' || signalingState === 'have-local-offer') {
          console.log(`✅ Can process offer in ${signalingState} state`);
          
          // Set remote description
          console.log('📝 Setting remote description...');
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          console.log('✅ Remote description set');
          
          // Check if we already have a local description
          if (pc.localDescription) {
            console.log('ℹ️ Local description already exists:', pc.localDescription.type);
            
            // If we already have an answer, just send it again
            if (pc.localDescription.type === 'answer') {
              console.log('🔄 Re-sending existing answer...');
              sendWebRTCAnswer({
                to: data.from,
                sdp: pc.localDescription,
                callId: data.callId || callInfo.callId,
                roomId: data.roomId || callInfo.roomId
              });
              console.log('📤 Answer re-sent');
              return;
            }
          }
          
          // Create and set local description
          console.log('📝 Creating answer...');
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          
          console.log('📝 Setting local description...');
          await pc.setLocalDescription(answer);
          console.log('✅ Local description set');
          
          // Send answer
          sendWebRTCAnswer({
            to: data.from,
            sdp: answer,
            callId: data.callId || callInfo.callId,
            roomId: data.roomId || callInfo.roomId
          });
          
          console.log('📤 WebRTC answer sent to caller');
          
        } else if (signalingState === 'have-remote-offer') {
          console.log('ℹ️ Already have remote offer, creating new answer...');
          
          // We already have a remote offer, create new answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          sendWebRTCAnswer({
            to: data.from,
            sdp: answer,
            callId: data.callId || callInfo.callId,
            roomId: data.roomId || callInfo.roomId
          });
          
          console.log('📤 Sent updated answer');
          
        } else {
          console.warn(`⚠️ Cannot process offer in ${signalingState} state`);
          
          // Try to rollback and create new connection
          console.log('🔄 Creating new peer connection...');
          pc.close();
          
          const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
          const newPc = createPeerConnection(servers);
          
          // Add local tracks
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
              newPc.addTrack(track, localStreamRef.current);
            });
          }
          
          // Set remote description and create answer
          await newPc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await newPc.createAnswer();
          await newPc.setLocalDescription(answer);
          
          sendWebRTCAnswer({
            to: data.from,
            sdp: answer,
            callId: data.callId || callInfo.callId,
            roomId: data.roomId || callInfo.roomId
          });
          
          console.log('📤 Sent answer from new connection');
        }
        
      } catch (error) {
        console.error('❌ Error handling offer:', error);
        
        // Specific handling for InvalidStateError
        if (error.name === 'InvalidStateError') {
          console.log('🔄 Invalid state, attempting recovery...');
          
          const pc = peerConnectionRef.current;
          
          if (pc) {
            // Check current state
            console.log('📊 Current peer connection state:', {
              signalingState: pc.signalingState,
              connectionState: pc.connectionState,
              iceConnectionState: pc.iceConnectionState,
              hasLocalDescription: !!pc.localDescription,
              hasRemoteDescription: !!pc.remoteDescription
            });
            
            // If we're in a bad state, create new connection
            if (pc.signalingState === 'closed' || pc.connectionState === 'failed') {
              console.log('🔄 Creating new peer connection due to bad state...');
              pc.close();
              
              const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
              const newPc = createPeerConnection(servers);
              
              // Add local tracks
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                  newPc.addTrack(track, localStreamRef.current);
                });
              }
              
              // Retry the offer
              setTimeout(() => {
                handleWebRTCOffer(data);
              }, 500);
            } else {
              // Try to send existing answer if we have one
              if (pc.localDescription && pc.localDescription.type === 'answer') {
                console.log('📤 Sending existing answer...');
                sendWebRTCAnswer({
                  to: data.from,
                  sdp: pc.localDescription,
                  callId: data.callId || callInfo.callId,
                  roomId: data.roomId || callInfo.roomId
                });
              }
            }
          }
        }
      }
    } else {
      console.error('❌ No peer connection available');
    }
  } else if (callInfo.isCaller) {
    console.log('ℹ️ Received offer but we are caller, ignoring');
  } else {
    console.warn('⚠️ Cannot handle offer:', {
      hasSDP: !!data.sdp,
      isCaller: callInfo.isCaller,
      hasPeerConnection: !!peerConnectionRef.current
    });
  }
}, [callInfo, sendWebRTCAnswer, iceServers, createPeerConnection, fetchIceServers]);



const handleWebRTCAnswer = useCallback(async (data) => {
  console.log('✅ Received WebRTC answer:', {
    from: data.from,
    callId: data.callId,
    roomId: data.roomId,
    sdpType: data.sdp?.type
  });
  
  // Update callInfo with roomId if missing
  if (data.roomId && !callInfo.roomId) {
    console.log('🔁 Updating callInfo with roomId from answer:', data.roomId);
    setCallInfo(prev => ({
      ...prev,
      roomId: data.roomId
    }));
  }
  
  // CRITICAL FIX: The CALLEE should handle the answer, not the caller!
  // The caller sends the offer, the callee sends the answer back
  // So when we receive an answer, we must be the CALLER
  if (callInfo.isCaller && peerConnectionRef.current && data.sdp) {
    try {
      console.log('📝 Setting remote description from answer (we are the caller)...');
      
      // First, check if we already have a remote description
      if (peerConnectionRef.current.remoteDescription) {
        console.log('ℹ️ Remote description already set, updating...');
      }
      
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );
      console.log('✅ Remote description set from answer');
      
      // Set connection status
      setConnectionStatus('connected');
      
      // Force check for tracks
      setTimeout(() => {
        if (peerConnectionRef.current) {
          const receivers = peerConnectionRef.current.getReceivers();
          console.log('📊 Active receivers after answer:', receivers.length);
          
          receivers.forEach((receiver, idx) => {
            console.log(`  Receiver ${idx}:`, {
              trackKind: receiver.track?.kind,
              trackId: receiver.track?.id?.substring(0, 8),
              trackEnabled: receiver.track?.enabled,
              trackState: receiver.track?.readyState
            });
            
            // If we have a track but no stream, create one
            if (receiver.track && !remoteStreamRef.current) {
              console.log('🎯 Creating remote stream from track');
              remoteStreamRef.current = new MediaStream();
              remoteStreamRef.current.addTrack(receiver.track);
              
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStreamRef.current;
                console.log('✅ Set remote video srcObject');
                
                // Try to play the video
                remoteVideoRef.current.play().catch(err => {
                  console.warn('⚠️ Auto-play failed:', err);
                });
              }
              
              setRemoteStream(remoteStreamRef.current);
              monitorRemoteStream(remoteStreamRef.current);
            }
          });
        }
      }, 1000);
      
      addNotification('Video call connected!', 'success');
      
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      
      // Check current state
      console.log('📊 Current peer connection state:', {
        signalingState: peerConnectionRef.current?.signalingState,
        connectionState: peerConnectionRef.current?.connectionState,
        iceConnectionState: peerConnectionRef.current?.iceConnectionState
      });
    }
  } else {
    console.warn('⚠️ Not handling answer because:', {
      isCaller: callInfo.isCaller,
      hasPeerConnection: !!peerConnectionRef.current,
      hasSDP: !!data.sdp,
      role: callInfo.isCaller ? 'caller (should handle)' : 'callee (should not handle)'
    });
    
    // If we're the callee but received an answer, something is wrong
    if (!callInfo.isCaller) {
      console.log('🔄 We are callee but received answer, checking state...');
      
      // Maybe we should send an offer instead?
      if (peerConnectionRef.current && localStreamRef.current) {
        console.log('📤 Sending offer as callee (recovery)...');
        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          
          sendWebRTCOffer({
            to: data.from,
            sdp: offer,
            callId: data.callId || callInfo.callId,
            roomId: data.roomId || callInfo.roomId,
            metadata: {
              username: userProfile?.username || 'Anonymous',
              videoEnabled: isVideoEnabled,
              audioEnabled: isAudioEnabled
            }
          });
          
          console.log('📤 Sent recovery offer');
        } catch (error) {
          console.error('❌ Failed to send recovery offer:', error);
        }
      }
    }
  }
}, [callInfo, sendWebRTCOffer, userProfile, isVideoEnabled, isAudioEnabled]);


const handleWebRTCIceCandidate = useCallback(async (data) => {
  console.log('🧊 Received ICE candidate:', {
    from: data.from,
    candidate: data.candidate?.candidate?.substring(0, 50) + '...'
  });
  
  if (peerConnectionRef.current && data.candidate) {
    try {
      // Check if remote description is set
      if (!peerConnectionRef.current.remoteDescription) {
        console.log('⏳ Queueing ICE candidate (no remote description yet)');
        
        // Queue the candidate to add later
        if (!queuedIceCandidatesRef.current) {
          queuedIceCandidatesRef.current = [];
        }
        queuedIceCandidatesRef.current.push(new RTCIceCandidate(data.candidate));
        
        // Try to process queued candidates periodically
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
      
      // If error is because remote description is null, queue it
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
    
    // Initialize
    fetchIceServers();
    initializeLocalStream();
    
    // Setup global event listeners
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
    
    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Auto-hide controls
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    hideControls();
    
    // Show controls on mouse move
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

  // Initialize WebRTC when all conditions are met
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
        
        // Replace video track in peer connection
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
          
          // Update local video display
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          setIsScreenSharing(true);
          addNotification('Screen sharing started', 'success');
          
          // Handle when user stops sharing via browser UI
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        // Restore camera
        const cameraStream = localStreamRef.current;
        const cameraVideoTrack = cameraStream?.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender && cameraVideoTrack) {
          sender.replaceTrack(cameraVideoTrack);
          
          // Restore local video display
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = cameraStream;
          }
          
          // Stop screen stream
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
    
    // Send end call signal
    if (socket && callInfo.partnerId && callInfo.callId) {
      sendWebRTCEnd({
        to: callInfo.partnerId,
        reason: 'user_ended',
        callId: callInfo.callId,
        roomId: callInfo.roomId
      });
    }
    
    // Clean up
    cleanup();
    
    // Navigate back
    setCurrentScreen('home');
    
    // Call disconnect from context
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
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    setLocalStream(null);
    setHasLocalStream(false);
    
    setTimeout(() => {
      initializeLocalStream(true);
    }, 500);
  };


  const checkDevicePermissions = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasCamera = devices.some(device => device.kind === 'videoinput' && device.label);
    const hasMicrophone = devices.some(device => device.kind === 'audioinput' && device.label);
    
    console.log('🔍 Device permission check:', {
      hasCamera,
      hasMicrophone,
      devices: devices.map(d => ({ kind: d.kind, hasLabel: !!d.label }))
    });
    
    return { hasCamera, hasMicrophone };
  } catch (error) {
    console.error('❌ Error checking device permissions:', error);
    return { hasCamera: false, hasMicrophone: false };
  }
};
 const cleanup = () => {
  console.log('🧹 Cleaning up video call');
  
  // Stop placeholder animation if exists
  if (localStreamRef.current?._animationFrame) {
    cancelAnimationFrame(localStreamRef.current._animationFrame);
  }
  
  // Reset refs
  initializationRef.current = false;
  videoMatchReadyRef.current = false;
  streamRetryCountRef.current = 0;
  reconnectAttemptsRef.current = 0;
  
  // Stop all media tracks
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
  
  // Close peer connection
  if (peerConnectionRef.current) {
    console.log('🛑 Closing peer connection...');
    peerConnectionRef.current.close();
    peerConnectionRef.current = null;
  }
  
  // Clear refs
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null;
  }
  
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }
  
  // Reset state
  setLocalStream(null);
  setRemoteStream(null);
  setConnectionStatus('disconnected');
  setIsScreenSharing(false);
  setIsVideoEnabled(true);
  setIsAudioEnabled(true);
  setCallDuration(0);
  setCallStats(null);
  setHasLocalStream(false);
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

  const startStatsCollection = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    
    statsIntervalRef.current = setInterval(async () => {
      if (peerConnectionRef.current && connectionStatus === 'connected') {
        try {
          const stats = await peerConnectionRef.current.getStats();
          let audioStats = { inbound: {}, outbound: {} };
          let videoStats = { inbound: {}, outbound: {} };
          
          stats.forEach(report => {
            if (report.type === 'inbound-rtp') {
              if (report.kind === 'audio') {
                audioStats.inbound = {
                  packetsReceived: report.packetsReceived,
                  packetsLost: report.packetsLost,
                  jitter: report.jitter,
                  bytesReceived: report.bytesReceived
                };
              } else if (report.kind === 'video') {
                videoStats.inbound = {
                  framesReceived: report.framesReceived,
                  framesDecoded: report.framesDecoded,
                  framesDropped: report.framesDropped,
                  bytesReceived: report.bytesReceived,
                  frameWidth: report.frameWidth,
                  frameHeight: report.frameHeight,
                  framesPerSecond: report.framesPerSecond
                };
              }
            } else if (report.type === 'outbound-rtp') {
              if (report.kind === 'audio') {
                audioStats.outbound = {
                  packetsSent: report.packetsSent,
                  bytesSent: report.bytesSent
                };
              } else if (report.kind === 'video') {
                videoStats.outbound = {
                  framesSent: report.framesSent,
                  framesEncoded: report.framesEncoded,
                  bytesSent: report.bytesSent,
                  frameWidth: report.frameWidth,
                  frameHeight: report.frameHeight,
                  framesPerSecond: report.framesPerSecond
                };
              }
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              setCallStats(prev => ({
                ...prev,
                rtt: report.currentRoundTripTime * 1000,
                availableOutgoingBitrate: report.availableOutgoingBitrate
              }));
            }
          });
          
          setCallStats(prev => ({
            ...prev,
            audio: audioStats,
            video: videoStats,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error getting stats:', error);
        }
      }
    }, 2000);
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      addNotification('Failed to reconnect after multiple attempts', 'error');
      return;
    }
    
    reconnectAttemptsRef.current += 1;
    addNotification(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`, 'warning');
    
    setTimeout(() => {
      if (callInfo.callId && callInfo.roomId) {
        console.log('🔄 Attempting reconnect');
        initializeWebRTCConnection();
      }
    }, 2000);
  };

  const debugStreamInfo = () => {
  console.log('=== STREAM DEBUG INFO ===');
  console.log('Local Stream:', {
    exists: !!localStreamRef.current,
    tracks: localStreamRef.current?.getTracks().length || 0,
    videoTracks: localStreamRef.current?.getVideoTracks().length || 0,
    audioTracks: localStreamRef.current?.getAudioTracks().length || 0,
    active: localStreamRef.current?.active
  });
  
  console.log('Remote Stream:', {
    exists: !!remoteStreamRef.current,
    tracks: remoteStreamRef.current?.getTracks().length || 0,
    videoTracks: remoteStreamRef.current?.getVideoTracks().length || 0,
    audioTracks: remoteStreamRef.current?.getAudioTracks().length || 0,
    active: remoteStreamRef.current?.active
  });
  
  console.log('Peer Connection:', {
    exists: !!peerConnectionRef.current,
    connectionState: peerConnectionRef.current?.connectionState,
    iceConnectionState: peerConnectionRef.current?.iceConnectionState,
    signalingState: peerConnectionRef.current?.signalingState
  });
  
  if (peerConnectionRef.current) {
    const senders = peerConnectionRef.current.getSenders();
    const receivers = peerConnectionRef.current.getReceivers();
    
    console.log('Senders:', senders.length);
    senders.forEach((sender, idx) => {
      console.log(`  Sender ${idx}:`, {
        track: sender.track?.kind,
        trackId: sender.track?.id,
        enabled: sender.track?.enabled
      });
    });
    
    console.log('Receivers:', receivers.length);
    receivers.forEach((receiver, idx) => {
      console.log(`  Receiver ${idx}:`, {
        track: receiver.track?.kind,
        trackId: receiver.track?.id,
        enabled: receiver.track?.enabled
      });
    });
  }
  
  console.log('=== END DEBUG ===');
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
    if (deviceError) {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 z-40 max-w-md">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Device Error</h3>
            <p className="text-gray-300 mb-4">
              {deviceError}
            </p>
            <div className="space-y-3">
              <button
                onClick={retryLocalStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-all duration-300"
              >
                Retry Connection
              </button>
              <button
                onClick={() => {
                  addNotification('Using placeholder video', 'info');
                  setDeviceError(null);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg font-medium hover:opacity-90 transition-all duration-300 border border-gray-700"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
        <div className="relative px-6 py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentScreen('home');
              }}
              className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Searching for video chat...
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Searching Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="text-center max-w-md">
            {/* Animated Video Icon */}
            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
              </div>
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl relative animate-float">
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
                <FaVideo className="relative animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Looking for video partner...
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              We're searching for someone who wants to video chat
            </p>
            
            <div className="space-y-4 max-w-xs mx-auto">
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  Cancel Search
                </span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm group"
              >
                <FaCog className="inline mr-3 group-hover:rotate-180 transition-transform" />
                Video Settings
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
      <div className={`relative px-6 py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                handleDisconnect();
                setCurrentScreen('home');
              }}
              className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">End Call</span>
            </button>
            
            {partner && (
              <div className="group flex items-center space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                  </div>
                  {partnerDisconnected ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border-2 border-gray-900"></div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {partner.profile?.username || partner.username || 'Stranger'}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    {renderConnectionStatus()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaPalette className="group-hover:rotate-180 transition-transform" />
            </button>
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
                title="Copy Room Link"
              >
                <FaLink className="group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaCog className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Video Area */}
      <div className="video-container flex-1 relative overflow-hidden bg-black">
        {/* Remote Video (Partner) */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Remote Video Status Overlay */}
          {(!remoteStream || connectionStatus !== 'connected') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-8 border border-gray-700/50">
                {connectionStatus === 'connecting' ? (
                  <div className="text-5xl text-blue-400 animate-pulse">
                    <FaVideo />
                  </div>
                ) : (
                  <div className="text-5xl text-gray-600">
                    <FaUser />
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for partner'}
              </h3>
              <p className="text-gray-400 mb-10 text-lg">
                {connectionStatus === 'connecting'
                  ? 'Establishing video connection...'
                  : 'Partner video will appear here'}
              </p>
              
              {/* Remote Mute Indicators */}
              {remoteStream && (
                <div className="space-y-2">
                  {isRemoteVideoMuted && (
                    <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                      <FaVideoSlash className="inline mr-2" />
                      <span>Partner camera is off</span>
                    </div>
                  )}
                  {isRemoteAudioMuted && (
                    <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                      <FaMicrophoneSlash className="inline mr-2" />
                      <span>Partner microphone is muted</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Local Video (Self) - Picture-in-Picture */}
        {hasLocalStream && (
          <div className={`absolute ${isFullscreen ? 'top-8 right-8 w-64 h-48' : 'top-4 right-4 w-48 h-36'} transition-all duration-300 rounded-xl overflow-hidden border-2 border-gray-700/50 bg-black shadow-2xl`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Local Video Status Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              {!isVideoEnabled && (
                <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs">
                  <FaVideoSlash />
                </div>
              )}
              {!isAudioEnabled && (
                <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs">
                  <FaMicrophoneSlash />
                </div>
              )}
              {isScreenSharing && (
                <div className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded text-xs">
                  <MdScreenShare />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Connection Status Banner */}
        {connectionStatus === 'connecting' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium">Establishing secure connection...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Bar */}
      <div className={`relative p-6 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-6">
            {/* Toggle Video */}
            <button
              onClick={toggleVideo}
              disabled={!hasLocalStream}
              className={`p-4 rounded-full transition-all duration-300 ${isVideoEnabled
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isVideoEnabled ? (
                <FaVideo className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaVideoSlash className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Toggle Audio */}
            <button
              onClick={toggleAudio}
              disabled={!hasLocalStream}
              className={`p-4 rounded-full transition-all duration-300 ${isAudioEnabled
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAudioEnabled ? (
                <FaMicrophone className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaMicrophoneSlash className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all duration-300 ${isScreenSharing
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
                : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'} group`}
            >
              {isScreenSharing ? (
                <MdStopScreenShare className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <MdScreenShare className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* End Call */}
            <button
              onClick={handleDisconnect}
              className="p-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 group"
            >
              <FaPhone className="text-2xl group-hover:rotate-90 transition-transform" />
            </button>
            
            {/* Next Partner */}
            <button
              onClick={handleNext}
              className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-500/30 group"
            >
              <FaRandom className="text-2xl group-hover:rotate-180 transition-transform" />
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
            >
              {isFullscreen ? (
                <FaCompress className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaExpand className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
          
          {/* Additional Controls */}
          <div className="flex justify-center space-x-4 mt-4">
          <button
  onClick={() => {
    const debugState = debugGetState?.();
    console.log('Debug State:', debugState);
    console.log('Call Info:', callInfo);
    debugStreamInfo();
    addNotification('Debug info logged to console', 'info');
  }}
  className="px-4 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
>
  <FaInfoCircle className="inline mr-2" />
  Debug
</button>
            
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
              >
                <FaRegCopy className="inline mr-2" />
                Copy Room Link
              </button>
            )}
            
            {!hasLocalStream && (
              <button
                onClick={retryLocalStream}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
              >
                <FaSync className="inline mr-2" />
                Retry Camera
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 shadow-2xl w-64 z-50">
          <div className="space-y-4">
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
              <h4 className="text-sm font-medium text-gray-400 mb-2">Video Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Camera Status</span>
                  <span className={`text-xs ${hasLocalStream ? 'text-green-400' : 'text-red-400'}`}>
                    {hasLocalStream ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Retry Count</span>
                  <span className="text-xs text-gray-400">{retryCount}</span>
                </div>
                
                <button
                  onClick={retryLocalStream}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                >
                  Reinitialize Camera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatScreen;