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
import { FaCameraRotate } from "react-icons/fa6";
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';
import { IoCameraReverse } from 'react-icons/io5';
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
  
  // Camera flip state
  const [cameraFacingMode, setCameraFacingMode] = useState('user');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  
  // Call info
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
  
  // Responsive state
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [videoLayout, setVideoLayout] = useState('grid');
  
  // Refs for timeouts/intervals
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
  const queuedIceCandidatesRef = useRef([]);
  const processingCandidatesRef = useRef(false);

  // ==================== RESPONSIVE HANDLING ====================
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      setIsMobile(width < 768);
      
      // Auto-switch layout based on screen size
      if (width < 640) {
        setVideoLayout('focus-remote');
      } else if (width < 1024) {
        setVideoLayout('grid');
      } else {
        setVideoLayout('grid');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==================== CAMERA FLIP FUNCTIONALITY ====================

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('📷 Available cameras:', videoDevices.length);
      setAvailableCameras(videoDevices);
      
      const frontCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('front') || 
        device.label.toLowerCase().includes('user') ||
        device.label.toLowerCase().includes('facetime')
      );
      
      if (frontCamera) {
        const frontIndex = videoDevices.findIndex(d => d.deviceId === frontCamera.deviceId);
        setCurrentCameraIndex(frontIndex);
        setCameraFacingMode('user');
      }
      
      return videoDevices;
    } catch (error) {
      console.error('Error getting cameras:', error);
      return [];
    }
  };

  const flipCamera = async () => {
    if (availableCameras.length < 2) {
      addNotification('Only one camera available', 'warning');
      return;
    }
    
    try {
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      const nextCamera = availableCameras[nextIndex];
      
      console.log('🔄 Switching camera:', {
        from: availableCameras[currentCameraIndex]?.label || 'unknown',
        to: nextCamera.label || 'unknown'
      });
      
      // Stop current video track
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }
      }
      
      // Get new camera stream
      const constraints = {
        video: {
          deviceId: { exact: nextCamera.deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: nextCamera.label.toLowerCase().includes('back') ? 'environment' : 'user'
        },
        audio: isAudioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true
        } : false
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Update facing mode state
      const isBackCamera = nextCamera.label.toLowerCase().includes('back') || 
                          nextCamera.label.toLowerCase().includes('environment') ||
                          nextCamera.label.toLowerCase().includes('rear');
      setCameraFacingMode(isBackCamera ? 'environment' : 'user');
      
      // Replace the video track in peer connection
      if (peerConnectionRef.current && newStream.getVideoTracks().length > 0) {
        const videoTrack = newStream.getVideoTracks()[0];
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      }
      
      // Update local stream
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          newStream.addTrack(audioTrack);
        }
        
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      localStreamRef.current = newStream;
      setLocalStream(newStream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
        localVideoRef.current.play().catch(console.warn);
      }
      
      setCurrentCameraIndex(nextIndex);
      addNotification(`Switched to ${isBackCamera ? 'back' : 'front'} camera`, 'success');
      
    } catch (error) {
      console.error('❌ Error flipping camera:', error);
      addNotification('Failed to switch camera', 'error');
      await initializeLocalStream(true);
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

  const forceStreamSync = useCallback(() => {
    console.log('🔄 Forcing stream synchronization...');
    
    if (localStreamRef.current && localVideoRef.current) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        console.log('✅ Synced local video element');
      }
    }
    
    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;
      const receivers = pc.getReceivers();
      
      console.log('📥 Checking receivers for remote tracks:', receivers.length);
      
      receivers.forEach((receiver, idx) => {
        if (receiver.track && receiver.track.readyState === 'live') {
          console.log(`✅ Receiver ${idx} has live ${receiver.track.kind} track`);
          
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
            console.log('📹 Created new remote stream');
          }
          
          const existingTrack = remoteStreamRef.current.getTracks()
            .find(t => t.id === receiver.track.id);
          
          if (!existingTrack) {
            remoteStreamRef.current.addTrack(receiver.track);
            console.log(`✅ Added ${receiver.track.kind} track to remote stream`);
          }
        }
      });
      
      if (remoteStreamRef.current && remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          console.log('🎥 Updated remote video with synchronized stream');
        }
        
        setRemoteStream(remoteStreamRef.current);
        
        console.log('📊 Final remote stream state:', {
          tracks: remoteStreamRef.current.getTracks().length,
          videoTracks: remoteStreamRef.current.getVideoTracks().length,
          audioTracks: remoteStreamRef.current.getAudioTracks().length
        });
      }
    }
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
  // ==================== STREAM HANDLING ====================

  const initializeLocalStream = async (forceRetry = false) => {
    if (isInitializing && !forceRetry) {
      console.log('⏳ Already initializing local stream');
      return null;
    }
    
    setIsInitializing(true);
    setDeviceError(null);
    
    console.log('🎥 Requesting media devices...');
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      console.log('📱 Available devices:', {
        video: videoDevices.length,
        audio: audioDevices.length
      });
      
      // Stop existing stream
      if (localStreamRef.current) {
        console.log('🛑 Stopping existing local stream tracks...');
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Store available cameras
      setAvailableCameras(videoDevices);
      
      // Try to find preferred camera
      let selectedCamera = videoDevices[currentCameraIndex] || videoDevices[0];
      const isBackCamera = selectedCamera?.label?.toLowerCase().includes('back') || 
                          selectedCamera?.label?.toLowerCase().includes('environment') ||
                          selectedCamera?.label?.toLowerCase().includes('rear');
      
      setCameraFacingMode(isBackCamera ? 'environment' : 'user');
      
      // Build constraints
      let constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera.deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 },
          facingMode: isBackCamera ? 'environment' : 'user'
        },
        audio: audioDevices.length > 0 ? {
          deviceId: audioDevices[0]?.deviceId ? { exact: audioDevices[0].deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };
      
      // Fallback if no specific device
      if (!selectedCamera && videoDevices.length > 0) {
        constraints.video = {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 }
        };
      }
      
      if (audioDevices.length === 0) {
        constraints.audio = false;
      }
      
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Stream obtained:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      setHasLocalStream(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => {
          console.warn('⚠️ Local video auto-play failed:', err);
        });
      }
      
      setIsVideoEnabled(stream.getVideoTracks().length > 0);
      setIsAudioEnabled(stream.getAudioTracks().length > 0);
      
      streamRetryCountRef.current = 0;
      console.log('✅ Local stream initialization complete');
      return stream;
      
    } catch (error) {
      console.error('❌ Failed to get local stream:', error.name, error.message);
      
      streamRetryCountRef.current += 1;
      
      if (streamRetryCountRef.current < maxStreamRetries) {
        console.log(`🔄 Retrying stream (${streamRetryCountRef.current}/${maxStreamRetries})...`);
        setDeviceError(`Failed to access camera/microphone. Retrying... (${streamRetryCountRef.current}/${maxStreamRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, 1000 * streamRetryCountRef.current));
        return initializeLocalStream(true);
      }
      
      setDeviceError('Cannot access camera or microphone. Please check permissions.');
      addNotification('Cannot access camera/microphone. Using placeholder.', 'error');
      
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
    
    let animationFrame = null;
    let pulseValue = 0;
    
    const drawPlaceholder = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      pulseValue = (pulseValue + 0.05) % (Math.PI * 2);
      const pulseSize = Math.sin(pulseValue) * 10 + 70;
      
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
      
      animationFrame = requestAnimationFrame(drawPlaceholder);
    };
    
    drawPlaceholder();
    const stream = canvas.captureStream(15);
    
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

  const fetchIceServers = async () => {
    try {
      const response = await fetch('https://randomchat-lfo7.onrender.com/webrtc/config');
      const config = await response.json();
      console.log('🧊 ICE servers loaded:', config.iceServers?.length || 0);
      
      if (config.iceServers && config.iceServers.length > 0) {
        setIceServers(config.iceServers);
        return config.iceServers;
      } else {
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
      const fallbackServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ];
      setIceServers(fallbackServers);
      return fallbackServers;
    }
  };

  const createPeerConnection = useCallback((servers) => {
    console.log('🔗 Creating peer connection with ICE servers:', servers.length);
    
    const configuration = {
      iceServers: servers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
    
    if (peerConnectionRef.current) {
      console.log('🛑 Closing existing peer connection');
      peerConnectionRef.current.close();
    }
    
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;
    
    if (localStreamRef.current) {
      console.log('🎬 Adding local stream tracks to new peer connection:', {
        videoTracks: localStreamRef.current.getVideoTracks().length,
        audioTracks: localStreamRef.current.getAudioTracks().length,
        totalTracks: localStreamRef.current.getTracks().length
      });
      
      localStreamRef.current.getTracks().forEach((track, index) => {
        console.log(`📤 Adding ${track.kind} track ${index + 1}:`, {
          enabled: track.enabled,
          readyState: track.readyState,
          id: track.id?.substring(0, 8)
        });
        
        try {
          const sender = pc.addTrack(track, localStreamRef.current);
          console.log(`✅ ${track.kind} track added successfully:`, {
            senderId: sender.id?.substring(0, 8),
            trackEnabled: sender.track?.enabled,
            readyState: sender.track?.readyState
          });
        } catch (error) {
          console.error(`❌ Failed to add ${track.kind} track:`, error);
          
          if (error.name === 'InvalidStateError' || error.name === 'InvalidAccessError') {
            console.log(`🔄 Creating transceiver for ${track.kind} as fallback`);
            try {
              const transceiver = pc.addTransceiver(track, {
                direction: 'sendrecv',
                streams: [localStreamRef.current]
              });
              console.log(`✅ Created transceiver for ${track.kind}:`, {
                mid: transceiver.mid,
                direction: transceiver.direction
              });
            } catch (transceiverError) {
              console.error(`❌ Failed to create transceiver:`, transceiverError);
            }
          }
        }
      });
    } else {
      console.warn('⚠️ No local stream available when creating peer connection');
    }
    
    setTimeout(() => {
      const transceivers = pc.getTransceivers();
      console.log('🔄 Initial transceivers count:', transceivers.length);
    }, 100);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected && callInfo.partnerId) {
        console.log('🧊 Sending ICE candidate to partner:', callInfo.partnerId.substring(0, 8));
        sendWebRTCIceCandidate({
          to: callInfo.partnerId,
          candidate: event.candidate,
          callId: callInfo.callId,
          roomId: callInfo.roomId
        });
      } else if (!event.candidate) {
        console.log('✅ All ICE candidates gathered');
      }
    };
    
    pc.onsignalingstatechange = () => {
      console.log('📶 Signaling state changed:', pc.signalingState);
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('⚠️ ICE connection failed, restarting ICE...');
        pc.restartIce();
      } else if (pc.iceConnectionState === 'connected') {
        console.log('✅ ICE connection established!');
        addNotification('Network connection established', 'success');
      }
    };
    
    pc.onicegatheringstatechange = () => {
      console.log('📡 ICE gathering state:', pc.iceGatheringState);
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
    
    pc.ontrack = (event) => {
      console.log('🎬 Received remote track:', {
        kind: event.track.kind,
        id: event.track.id?.substring(0, 8) || 'unknown',
        readyState: event.track.readyState,
        enabled: event.track.enabled,
        muted: event.track.muted,
        streams: event.streams?.length || 0
      });
      
      if (!remoteStreamRef.current) {
        console.log('📹 Creating new remote stream');
        remoteStreamRef.current = new MediaStream();
      }
      
      const remoteStream = remoteStreamRef.current;
      
      const existingTrack = remoteStream.getTracks().find(t => t.id === event.track.id);
      
      if (!existingTrack) {
        console.log(`✅ Adding ${event.track.kind} track to remote stream:`, {
          trackId: event.track.id?.substring(0, 8),
          enabled: event.track.enabled,
          muted: event.track.muted
        });
        
        remoteStream.addTrack(event.track);
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log('🎥 Updated remote video element with stream');
          
          remoteVideoRef.current.playsInline = true;
          remoteVideoRef.current.muted = false;
          
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.warn('⚠️ Remote video auto-play failed:', err);
              
              const playOnInteraction = () => {
                remoteVideoRef.current?.play().then(() => {
                  console.log('✅ Remote video playback started after interaction');
                  document.removeEventListener('click', playOnInteraction);
                }).catch(e => {
                  console.error('❌ Still cannot play remote video:', e);
                });
              };
              
              document.addEventListener('click', playOnInteraction);
            }).then(() => {
              console.log('✅ Remote video playback started successfully');
            });
          }
        }
        
        setRemoteStream(remoteStream);
        monitorRemoteStream(remoteStream);
        
        console.log('📊 Remote stream state:', {
          videoTracks: remoteStream.getVideoTracks().length,
          audioTracks: remoteStream.getAudioTracks().length,
          allTracks: remoteStream.getTracks().map(t => ({
            kind: t.kind,
            id: t.id?.substring(0, 8),
            enabled: t.enabled,
            muted: t.muted
          }))
        });
        
        addNotification(`Partner ${event.track.kind} received`, 'success');
      } else {
        console.log(`ℹ️ ${event.track.kind} track already in stream`);
      }
      
      event.track.onended = () => {
        console.log(`🛑 Remote ${event.track.kind} track ended`);
        
        if (remoteStreamRef.current) {
          remoteStreamRef.current.removeTrack(event.track);
          console.log(`🛑 Removed ${event.track.kind} track from stream`);
          
          if (event.track.kind === 'video') {
            setIsRemoteVideoMuted(true);
          } else {
            setIsRemoteAudioMuted(true);
          }
        }
      };
      
      event.track.onmute = () => {
        console.log(`🔇 Remote ${event.track.kind} track muted`);
        if (event.track.kind === 'video') {
          setIsRemoteVideoMuted(true);
        } else {
          setIsRemoteAudioMuted(true);
        }
      };
      
      event.track.onunmute = () => {
        console.log(`🔊 Remote ${event.track.kind} track unmuted`);
        if (event.track.kind === 'video') {
          setIsRemoteVideoMuted(false);
        } else {
          setIsRemoteAudioMuted(false);
        }
      };
    };
    
    pc.ondatachannel = (event) => {
      console.log('📨 Data channel received:', event.channel.label);
    };
    
    pc.onnegotiationneeded = async () => {
      console.log('🔁 Negotiation needed, current state:', pc.signalingState);
      
      if (callInfo.isCaller && pc.signalingState === 'stable') {
        console.log('📤 Creating offer as caller...');
        
        setTimeout(async () => {
          try {
            const senders = pc.getSenders();
            console.log(`📤 Checking senders before creating offer: ${senders.length} senders`);
            
            if (senders.length === 0) {
              console.warn('⚠️ No senders found, adding local tracks now...');
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                  try {
                    pc.addTrack(track, localStreamRef.current);
                  } catch (error) {
                    console.error('❌ Failed to add track in negotiation:', error);
                  }
                });
              }
            }
            
            const offerOptions = {
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
              voiceActivityDetection: true,
              iceRestart: false
            };
            
            console.log('📝 Creating offer with options:', offerOptions);
            const offer = await pc.createOffer(offerOptions);
            console.log('✅ Offer created:', offer.type);
            
            await pc.setLocalDescription(offer);
            console.log('✅ Local description set');
            
            if (socket?.connected && callInfo.partnerId) {
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
              
              console.log('📤 Offer sent to partner:', callInfo.partnerId.substring(0, 8));
            } else {
              console.warn('⚠️ Cannot send offer: socket not connected or no partner');
            }
          } catch (error) {
            console.error('❌ Error creating offer:', error);
          }
        }, 500);
      } else {
        console.log('ℹ️ Not creating offer:', {
          isCaller: callInfo.isCaller,
          signalingState: pc.signalingState,
          role: callInfo.isCaller ? 'caller' : 'callee'
        });
      }
    };
    
    console.log('✅ Peer connection created successfully');
    return pc;
  }, [
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
  ]);

  const initializeWebRTCConnection = useCallback(async () => {
    if (initializationRef.current) {
      console.log('⚠️ WebRTC already initialized');
      return;
    }
    
    if (!partner) {
      console.error('❌ Cannot initialize WebRTC: No partner');
      addNotification('No partner available', 'error');
      return;
    }
    
    if (!localStreamRef.current || !localStreamRef.current.active) {
      console.warn('⚠️ Local stream not ready, initializing now...');
      await initializeLocalStream(true);
      
      if (!localStreamRef.current || !localStreamRef.current.active) {
        console.error('❌ Cannot initialize WebRTC: Failed to get local stream');
        addNotification('Failed to access camera/microphone', 'error');
        return;
      }
    }
    
    if (!callInfo.callId || !callInfo.roomId) {
      console.error('❌ Cannot initialize WebRTC: Missing call info');
      return;
    }
    
    console.log('🚀 Initializing WebRTC connection with:', {
      callId: callInfo.callId,
      roomId: callInfo.roomId,
      isCaller: callInfo.isCaller,
      partnerId: callInfo.partnerId?.substring(0, 8),
      hasLocalStream: !!localStreamRef.current,
      localTracks: localStreamRef.current?.getTracks().length || 0,
      localStreamActive: localStreamRef.current?.active || false
    });
    
    initializationRef.current = true;
    setConnectionStatus('connecting');
    
    try {
      const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
      console.log('🧊 Using ICE servers:', servers.length);
      
      createPeerConnection(servers);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const pc = peerConnectionRef.current;
      if (!pc) {
        throw new Error('Failed to create peer connection');
      }
      
      const senders = pc.getSenders();
      console.log(`📤 Initial senders count: ${senders.length}`);
      
      if (senders.length === 0) {
        console.warn('⚠️ No senders found, manually adding tracks...');
        
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            try {
              const sender = pc.addTrack(track, localStreamRef.current);
              console.log(`✅ Manually added ${track.kind} track:`, {
                senderId: sender.id?.substring(0, 8),
                trackEnabled: sender.track?.enabled
              });
            } catch (error) {
              console.error(`❌ Failed to manually add ${track.kind} track:`, error);
              
              try {
                const transceiver = pc.addTransceiver(track.kind, {
                  direction: 'sendrecv',
                  streams: [localStreamRef.current]
                });
                console.log(`✅ Created transceiver for ${track.kind}`);
              } catch (transceiverError) {
                console.error(`❌ Failed to create transceiver:`, transceiverError);
              }
            }
          });
        }
      }
      
      if (callInfo.isCaller) {
        console.log('🎯 ROLE: CALLER - Will send offer after delay');
        
        const baseDelay = 1000;
        const randomDelay = Math.random() * 1000;
        const totalDelay = baseDelay + randomDelay;
        
        console.log(`⏳ Caller delay: ${Math.round(totalDelay)}ms (${Math.round(baseDelay)}ms base + ${Math.round(randomDelay)}ms random)`);
        
        const offerTimeoutRef = setTimeout(async () => {
          console.log('⏰ Caller delay complete, checking state...');
          
          if (!peerConnectionRef.current || !socket?.connected || !callInfo.partnerId) {
            console.warn('⚠️ Cannot send offer: connection not ready');
            return;
          }
          
          const currentSignalingState = pc.signalingState;
          const hasLocalOffer = pc.localDescription?.type === 'offer';
          const hasRemoteOffer = pc.remoteDescription?.type === 'offer';
          
          console.log('📊 Pre-offer state:', {
            signalingState: currentSignalingState,
            hasLocalOffer,
            hasRemoteOffer,
            senders: pc.getSenders().length,
            receivers: pc.getReceivers().length
          });
          
          if (hasRemoteOffer) {
            console.warn('⚠️ Race condition: Already have remote offer, becoming callee');
            setCallInfo(prev => ({ ...prev, isCaller: false }));
            
            try {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              sendWebRTCAnswer({
                to: callInfo.partnerId,
                sdp: answer,
                callId: callInfo.callId,
                roomId: callInfo.roomId
              });
              
              console.log('📤 Sent answer after race detection');
              return;
            } catch (error) {
              console.error('❌ Failed to create answer:', error);
            }
          }
          
          if (hasLocalOffer) {
            console.log('ℹ️ Already have local offer, re-sending...');
            sendWebRTCOffer({
              to: callInfo.partnerId,
              sdp: pc.localDescription,
              callId: callInfo.callId,
              roomId: callInfo.roomId,
              metadata: {
                username: userProfile?.username || 'Anonymous',
                videoEnabled: isVideoEnabled,
                audioEnabled: isAudioEnabled
              }
            });
            return;
          }
          
          console.log('📤 Creating and sending initial offer...');
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
              voiceActivityDetection: true,
              iceRestart: false
            });
            
            console.log('✅ Offer created:', offer.type);
            await pc.setLocalDescription(offer);
            console.log('✅ Local description (offer) set');
            
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
            
            console.log('📤 Initial offer sent to partner');
            
          } catch (error) {
            console.error('❌ Failed to create/send offer:', error);
            
            setTimeout(async () => {
              if (peerConnectionRef.current === pc) {
                console.log('🔄 Retrying offer creation...');
                try {
                  const retryOffer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                  });
                  
                  await pc.setLocalDescription(retryOffer);
                  
                  sendWebRTCOffer({
                    to: callInfo.partnerId,
                    sdp: retryOffer,
                    callId: callInfo.callId,
                    roomId: callInfo.roomId,
                    metadata: {
                      username: userProfile?.username || 'Anonymous',
                      videoEnabled: isVideoEnabled,
                      audioEnabled: isAudioEnabled
                    }
                  });
                  
                  console.log('📤 Retry offer sent');
                } catch (retryError) {
                  console.error('❌ Retry also failed:', retryError);
                }
              }
            }, 1000);
          }
        }, totalDelay);
        
        offerTimeoutRefs.current.push(offerTimeoutRef);
        
      } else {
        console.log('🎯 ROLE: CALLEE - Waiting for offer from caller...');
        console.log('📥 Callee will automatically respond when offer arrives');
        
        const offerWaitTimeout = setTimeout(() => {
          console.log('⏰ Callee waiting timeout (15s), checking state...');
          
          if (!pc.remoteDescription && connectionStatus === 'connecting') {
            console.warn('⚠️ No offer received after 15 seconds');
            
            if (socket?.connected && callInfo.partnerId) {
              console.log('🔄 Callee becoming caller due to timeout...');
              setCallInfo(prev => ({ ...prev, isCaller: true }));
              
              pc.onnegotiationneeded?.();
            }
          }
        }, 15000);
        
        offerTimeoutRefs.current.push(offerWaitTimeout);
      }
      
      setTimeout(() => {
        console.log('✅ WebRTC initialization sequence started');
        console.log('📊 Initial connection state:', {
          signalingState: pc.signalingState,
          iceConnectionState: pc.iceConnectionState,
          connectionState: pc.connectionState,
          localDescription: pc.localDescription?.type || 'none',
          remoteDescription: pc.remoteDescription?.type || 'none',
          senders: pc.getSenders().length,
          receivers: pc.getReceivers().length
        });
        
        forceStreamSync();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      addNotification('Failed to start video call', 'error');
      initializationRef.current = false;
      setConnectionStatus('failed');
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        console.log(`🔄 Attempting recovery (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
        
        setTimeout(() => {
          if (socket?.connected) {
            initializeWebRTCConnection();
          }
        }, 2000 * reconnectAttemptsRef.current);
      }
    }
  }, [
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
  ]);

  // ==================== EVENT HANDLERS ====================

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
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
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

  const handleGoBack = () => {
    console.log('🔙 Going back - disconnecting and stopping search');
    
    if (searching) {
      console.log('🛑 Stopping search...');
    }
    
    handleDisconnect();
    
    setTimeout(() => {
      setCurrentScreen('home');
      addNotification('Returned to home screen', 'info');
    }, 300);
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
    
    if (searching) {
      console.log('🛑 Explicitly stopping search mode');
    }
    
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

  const checkStreamState = () => {
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
      console.log('Receivers:', receivers.length);
    }
    
    console.log('=== END DEBUG ===');
  };

  const adjustRemoteVideoLayout = () => {
    if (!remoteVideoRef.current) return;
    
    const video = remoteVideoRef.current;
    
    video.style.objectFit = 'contain';
    video.style.backgroundColor = '#000';
    
    if (video.videoWidth && video.videoHeight) {
      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = windowSize.width / windowSize.height;
      
      if (videoAspect > containerAspect) {
        video.style.objectFit = 'cover';
      } else {
        video.style.objectFit = 'contain';
      }
    } else {
      video.style.objectFit = 'cover';
    }
    
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.maxWidth = '100%';
    video.style.maxHeight = '100%';
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    console.log('🎬 VideoChatScreen mounted');
    
    fetchIceServers();
    initializeLocalStream();
    getAvailableCameras();
    
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
    
    const handleUserInteraction = () => {
      setShowControls(true);
      hideControls();
    };
    
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      console.log('🧹 VideoChatScreen cleanup');
      cleanup();
      
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
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

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      const video = remoteVideoRef.current;
      
      const playVideo = () => {
        video.play().catch(err => {
          console.warn('Remote video play failed:', err);
        });
      };
      
      video.onloadedmetadata = () => {
        adjustRemoteVideoLayout();
        playVideo();
      };
      
      window.addEventListener('resize', adjustRemoteVideoLayout);
      
      return () => {
        window.removeEventListener('resize', adjustRemoteVideoLayout);
      };
    }
  }, [remoteStream, windowSize]);

  // ==================== HELPER FUNCTIONS ====================

  const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };

  const getVideoLayoutClasses = () => {
    switch (videoLayout) {
      case 'focus-remote':
        return {
          remote: 'absolute inset-0',
          local: 'absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg shadow-2xl'
        };
      case 'focus-local':
        return {
          remote: 'absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg shadow-2xl',
          local: 'absolute inset-0'
        };
      case 'grid':
      default:
        if (isMobile) {
          return {
            remote: 'absolute inset-0',
            local: 'absolute bottom-4 right-4 w-32 h-24 rounded-lg shadow-2xl'
          };
        } else {
          return {
            remote: 'absolute inset-0',
            local: 'absolute top-4 right-4 w-48 h-36 lg:w-64 lg:h-48 rounded-xl shadow-2xl'
          };
        }
    }
  };

  const getControlButtonSize = () => {
    if (isMobile) return 'p-3';
    if (windowSize.width < 1024) return 'p-3.5';
    return 'p-4';
  };

  const getIconSize = () => {
    if (isMobile) return 'text-lg';
    if (windowSize.width < 1024) return 'text-xl';
    return 'text-2xl';
  };

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

  // ==================== RENDER COMPONENTS ====================

  const renderHeader = () => {
    return (
      <div className={`relative px-4 md:px-6 py-3 md:py-4 border-b border-gray-800/30 bg-gray-900/70 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
              title="Go back (disconnects call)"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            
            {partner && (
              <div className="group flex items-center gap-3 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                  </div>
                  {partnerDisconnected ? (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border-2 border-gray-900"></div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                    {partner.profile?.username || partner.username || 'Stranger'}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    {renderConnectionStatus()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {availableCameras.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800/40 rounded-lg backdrop-blur-sm">
                <FaCamera className="text-blue-400" />
                <span className="text-xs text-gray-300">
                  {availableCameras.length} cam{availableCameras.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
              title="Change theme"
            >
              <FaPalette className="text-lg group-hover:rotate-180 transition-transform" />
            </button>
            
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
                title="Copy room link"
              >
                <FaLink className="text-lg group-hover:scale-110 transition-transform" />
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
              title="Settings"
            >
              <FaCog className="text-lg group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVideoArea = () => {
    const layout = getVideoLayoutClasses();
    
    return (
      <div className="video-container flex-1 relative overflow-hidden bg-black">
        <div className={layout.remote}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
            style={{
              objectFit: 'contain',
              backgroundColor: '#000'
            }}
            onLoadedMetadata={() => adjustRemoteVideoLayout()}
          />
          
          {(!remoteStream || connectionStatus !== 'connected') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-6 sm:mb-8 border border-gray-700/50">
                {connectionStatus === 'connecting' ? (
                  <div className="text-4xl sm:text-5xl text-blue-400 animate-pulse">
                    <FaVideo />
                  </div>
                ) : (
                  <div className="text-4xl sm:text-5xl text-gray-600">
                    <FaUser />
                  </div>
                )}
              </div>
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center px-4">
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for partner'}
              </h3>
              <p className="text-gray-400 mb-8 sm:mb-10 text-sm sm:text-lg text-center px-4">
                {connectionStatus === 'connecting'
                  ? 'Establishing video connection...'
                  : 'Partner video will appear here'}
              </p>
              
              {remoteStream && (
                <div className="space-y-2 max-w-xs">
                  {isRemoteVideoMuted && (
                    <div className="px-3 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                      <FaVideoSlash className="inline mr-2" />
                      <span className="text-sm">Partner camera is off</span>
                    </div>
                  )}
                  {isRemoteAudioMuted && (
                    <div className="px-3 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                      <FaMicrophoneSlash className="inline mr-2" />
                      <span className="text-sm">Partner microphone is muted</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {hasLocalStream && (
          <div className={layout.local}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
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
              {availableCameras.length > 1 && (
                <div className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded text-xs">
                  <FaCamera className="text-xs" />
                  <span className="ml-1 text-xs">{cameraFacingMode === 'user' ? 'Front' : 'Back'}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {connectionStatus === 'connecting' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm sm:text-lg font-medium">Establishing secure connection...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderControls = () => {
    const buttonSize = getControlButtonSize();
    const iconSize = getIconSize();
    
    return (
      <div className={`relative p-4 md:p-6 border-t border-gray-800/30 bg-gray-900/70 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-6">
            {availableCameras.length > 1 && (
              <button
                onClick={flipCamera}
                className={`${buttonSize} rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 backdrop-blur-sm border border-blue-500/30 group`}
                title={`Switch to ${cameraFacingMode === 'user' ? 'back' : 'front'} camera`}
              >
                <IoCameraReverse className={`${iconSize} group-hover:rotate-180 transition-transform`} />
              </button>
            )}
            
            <button
              onClick={toggleVideo}
              disabled={!hasLocalStream}
              className={`${buttonSize} rounded-full transition-all duration-300 ${isVideoEnabled
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? (
                <FaVideo className={`${iconSize} group-hover:scale-110 transition-transform`} />
              ) : (
                <FaVideoSlash className={`${iconSize} group-hover:scale-110 transition-transform`} />
              )}
            </button>
            
            <button
              onClick={toggleAudio}
              disabled={!hasLocalStream}
              className={`${buttonSize} rounded-full transition-all duration-300 ${isAudioEnabled
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'} group ${!hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? (
                <FaMicrophone className={`${iconSize} group-hover:scale-110 transition-transform`} />
              ) : (
                <FaMicrophoneSlash className={`${iconSize} group-hover:scale-110 transition-transform`} />
              )}
            </button>
            
            <button
              onClick={handleDisconnect}
              className={`${isMobile ? 'p-4' : 'p-5'} bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 group`}
              title="End call"
            >
              <FaPhone className={`${isMobile ? 'text-xl' : 'text-2xl'} group-hover:rotate-90 transition-transform`} />
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`${buttonSize} rounded-full transition-all duration-300 ${isScreenSharing
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
                : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'} group`}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              {isScreenSharing ? (
                <MdStopScreenShare className={`${iconSize} group-hover:scale-110 transition-transform`} />
              ) : (
                <MdScreenShare className={`${iconSize} group-hover:scale-110 transition-transform`} />
              )}
            </button>
            
            <button
              onClick={handleNext}
              className={`${buttonSize} bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-500/30 group`}
              title="Next partner"
            >
              <FaRandom className={`${iconSize} group-hover:rotate-180 transition-transform`} />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className={`${buttonSize} bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group`}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <FaCompress className={`${iconSize} group-hover:scale-110 transition-transform`} />
              ) : (
                <FaExpand className={`${iconSize} group-hover:scale-110 transition-transform`} />
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              onClick={() => {
                const debugState = debugGetState?.();
                console.log('Debug State:', debugState);
                console.log('Call Info:', callInfo);
                checkStreamState();
                addNotification('Debug info logged to console', 'info');
              }}
              className="px-3 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
              title="Debug information"
            >
              <FaInfoCircle className="inline mr-2" />
              {!isMobile && 'Debug'}
            </button>
            
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                title="Copy room link"
              >
                <FaRegCopy className="inline mr-2" />
                {!isMobile && 'Copy Link'}
              </button>
            )}
            
            {!hasLocalStream && (
              <button
                onClick={retryLocalStream}
                className="px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
                title="Retry camera"
              >
                <FaSync className="inline mr-2" />
                {!isMobile && 'Retry Camera'}
              </button>
            )}
            
            <button
              onClick={() => {
                setVideoLayout(current => {
                  if (current === 'grid') return 'focus-remote';
                  if (current === 'focus-remote') return 'focus-local';
                  return 'grid';
                });
              }}
              className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
              title="Change video layout"
            >
              <FaExpand className="inline mr-2" />
              {!isMobile && 'Layout'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  if (searching && !partner) {
    return (
      <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        {renderHeader()}
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
          <div className="text-center max-w-md">
            <div className="relative mb-8 sm:mb-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
              </div>
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-5xl relative animate-float">
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
                <FaVideo className="relative animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Looking for video partner...
            </h2>
            <p className="text-gray-400 mb-8 sm:mb-10 text-base sm:text-lg">
              We're searching for someone who wants to video chat
            </p>
            
            <div className="space-y-3 sm:space-y-4 max-w-xs mx-auto">
              <button
                onClick={handleGoBack}
                className="w-full px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  Cancel Search
                </span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm group"
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
      {renderDeviceError()}
      {renderHeader()}
      {renderVideoArea()}
      {renderControls()}
      
      {showSettings && (
        <div className="absolute top-14 sm:top-16 right-4 sm:right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 shadow-2xl w-56 sm:w-64 z-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <FaTimes />
              </button>
            </div>
            
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
            
            {availableCameras.length > 1 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Camera</h4>
                <div className="space-y-2">
                  {availableCameras.map((camera, index) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => {
                        setCurrentCameraIndex(index);
                        flipCamera();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        currentCameraIndex === index
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{camera.label || `Camera ${index + 1}`}</span>
                        {currentCameraIndex === index && (
                          <FaCamera className="text-blue-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Video Layout</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVideoLayout('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    videoLayout === 'grid'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                  title="Grid layout"
                >
                  <div className="text-center">
                    <FaExpand className="mx-auto mb-1" />
                    <span className="text-xs">Grid</span>
                  </div>
                </button>
                <button
                  onClick={() => setVideoLayout('focus-remote')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    videoLayout === 'focus-remote'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                  title="Focus on remote"
                >
                  <div className="text-center">
                    <FaUser className="mx-auto mb-1" />
                    <span className="text-xs">Focus</span>
                  </div>
                </button>
                <button
                  onClick={() => setVideoLayout('focus-local')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    videoLayout === 'focus-local'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                  title="Focus on local"
                >
                  <div className="text-center">
                    <FaVideo className="mx-auto mb-1" />
                    <span className="text-xs">Self</span>
                  </div>
                </button>
              </div>
            </div>
            
            {partner && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Partner Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {(partner.profile?.username || partner.username || 'S').charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{partner.profile?.username || partner.username || 'Stranger'}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-800">
                    <div className="text-xs text-gray-400 mb-2">Connection</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm capitalize">{connectionStatus}</span>
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
                  <span className="text-sm text-gray-300">Current Camera</span>
                  <span className="text-xs text-gray-400">
                    {cameraFacingMode === 'user' ? 'Front' : 'Back'}
                  </span>
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