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
  const [videoCallId, setVideoCallId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const callTimerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const initializationRef = useRef(false);
  const videoMatchReadyRef = useRef(false);
  const retryTimeoutRef = useRef(null);
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
      const url = import.meta.env.VITE_BACKEND_URL+"/webrtc/config" || 'http://localhost:5000/webrtc/config';
      const response = await fetch('http://13.60.191.64:5000/webrtc/config');
      const config = await response.json();
      setIceServers(config.iceServers || []);
      console.log('🧊 ICE servers loaded:', config.iceServers?.length || 0);
    } catch (error) {
      console.error('Failed to fetch ICE servers:', error);
      // Fallback to public STUN servers
      setIceServers([
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]);
    }
  };
  const initializeLocalStream = async () => {
    if (isInitializing) {
      console.log('⏳ Already initializing local stream');
      return;
    }
    setIsInitializing(true);
    console.log('🎥 Requesting media devices');
    try {
      // First, check if we have permissions and available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('📱 Available devices:', {
        video: videoDevices.length,
        audio: audioDevices.length
      });
      if (videoDevices.length === 0 || audioDevices.length === 0) {
        throw new Error('No media devices found');
      }
      // Stop any existing stream first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
      }
      // Request new stream with error handling for busy devices
      const stream = await navigator.mediaDevices.getUserMedia({
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
      }).catch(async (error) => {
        console.warn('⚠️ First attempt failed, trying fallback constraints:', error.message);
        
        // Try without specific constraints
        return navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        }).catch(async (error2) => {
          console.warn('⚠️ Second attempt failed, trying audio only:', error2.message);
          
          // Try audio only
          return navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          }).then(audioStream => {
            // Add placeholder video track
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            
            // Draw placeholder
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No Camera', canvas.width/2, canvas.height/2);
            
            const placeholderStream = canvas.captureStream(24);
            const placeholderTrack = placeholderStream.getVideoTracks()[0];
            
            // Combine audio with placeholder video
            const combinedStream = new MediaStream([
              ...audioStream.getAudioTracks(),
              placeholderTrack
            ]);
            
            return combinedStream;
          });
        });
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      setHasLocalStream(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('✅ Local stream initialized');
      }
      // Check if we have actual video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === 'ended') {
        console.warn('⚠️ Video track ended immediately');
        setIsVideoEnabled(false);
      }
    } catch (error) {
      console.error('❌ Failed to get local stream:', error);
      
      // Create a placeholder stream for testing
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera Unavailable', canvas.width/2, canvas.height/2);
      
      const placeholderStream = canvas.captureStream(24);
      localStreamRef.current = placeholderStream;
      setLocalStream(placeholderStream);
      setHasLocalStream(true);
      setIsVideoEnabled(false);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = placeholderStream;
      }
      
      addNotification('Using placeholder video. Camera may be in use.', 'warning');
    } finally {
      setIsInitializing(false);
    }
  };
  // ==================== EFFECTS ====================
  useEffect(() => {
    console.log('🎬 VideoChatScreen mounted');
    
    // Reset refs
    initializationRef.current = false;
    videoMatchReadyRef.current = false;
    
    // Get ICE servers
    fetchIceServers();
    
    // Setup socket listeners
    setupWebRTCListeners();
    
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
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  // Initialize local stream when component mounts
  useEffect(() => {
    if (!hasLocalStream && !isInitializing) {
      console.log('🔄 Initializing local stream');
      initializeLocalStream();
    }
  }, [hasLocalStream, isInitializing]);
  // Trigger WebRTC initialization when all required state is ready
  useEffect(() => {
    if (localStream && partner && videoCallId && roomId && !initializationRef.current) {
      console.log('🚀 Initializing WebRTC with local stream');
      initializeWebRTCConnection(videoCallId, roomId, isCaller);
    }
  }, [localStream, partner, videoCallId, roomId, isCaller]);
  // Listen for video match events
  useEffect(() => {
    console.log('🎥 Setting up video match listener');
    
    const handleVideoMatchReady = (data) => {
      console.log('🎯 Video match ready event received:', data);
      
      // Prevent multiple initializations
      if (videoMatchReadyRef.current) {
        console.log('⚠️ Already processed video match, ignoring');
        return;
      }
      
      videoMatchReadyRef.current = true;
      
      // Store video call info
      setVideoCallId(data.callId);
      setRoomId(data.roomId);
      
      // Determine if we're the caller (lower socket ID)
      const currentSocketId = socket?.id;
      const partnerId = data.partnerId;
      const isCallerValue = currentSocketId && partnerId &&
                          (currentSocketId < partnerId);
      setIsCaller(isCallerValue);
      
      console.log('📞 Video call info:', {
        callId: data.callId,
        roomId: data.roomId,
        isCaller: isCallerValue,
        socketId: currentSocketId,
        partnerId: partnerId
      });
    };
    const handleVideoMatch = (event) => {
      console.log('🔔 Custom video-match event:', event.detail);
      if (event.detail && event.detail.partner) {
        // Update partner state if needed
        if (debugForcePartnerUpdate) {
          debugForcePartnerUpdate(event.detail.partner);
        }
      }
    };
    // Listen for server events
    if (socket) {
      socket.on('video-match-ready', handleVideoMatchReady);
      
      // Also listen for custom event from ChatContext
      window.addEventListener('video-match', handleVideoMatch);
      window.addEventListener('video-call-ready', handleVideoMatchReady);
    }
    return () => {
      if (socket) {
        socket.off('video-match-ready', handleVideoMatchReady);
      }
      window.removeEventListener('video-match', handleVideoMatch);
      window.removeEventListener('video-call-ready', handleVideoMatchReady);
    };
  }, [socket, debugForcePartnerUpdate]);
  // Setup WebRTC listeners once when socket is available
  useEffect(() => {
    if (socket && !initializationRef.current) {
      setupWebRTCListeners();
    }
  }, [socket]);
  // ==================== WEBRTC FUNCTIONS ====================
  const setupWebRTCListeners = () => {
    if (!socket) return;
    
    console.log('🔌 Setting up WebRTC socket listeners');
    
    const handleWebRTCOffer = async (data) => {
      console.log('📞 Received WebRTC offer:', {
        from: data.from,
        callId: data.callId,
        sdpType: data.sdp?.type
      });
      
      if (!isCaller && peerConnectionRef.current && data.sdp) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          console.log('✅ Remote description set from offer');
          
          // Create and send answer
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          sendWebRTCAnswer({
            to: data.from,
            sdp: answer,
            callId: data.callId || videoCallId
          });
          console.log('📤 Sent WebRTC answer');
        } catch (error) {
          console.error('❌ Error handling offer:', error);
        }
      }
    };
    
    const handleWebRTCAnswer = async (data) => {
      console.log('✅ Received WebRTC answer:', {
        from: data.from,
        callId: data.callId,
        sdpType: data.sdp?.type
      });
      
      if (isCaller && peerConnectionRef.current && data.sdp) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          console.log('✅ Remote description set from answer');
          setConnectionStatus('connected');
          addNotification('Video call connected!', 'success');
        } catch (error) {
          console.error('❌ Error handling answer:', error);
        }
      }
    };
    
    const handleWebRTCIceCandidate = async (data) => {
      console.log('🧊 Received ICE candidate:', data);
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
          console.log('✅ ICE candidate added');
        } catch (error) {
          console.error('❌ Error adding ICE candidate:', error);
        }
      }
    };
    
    const handleWebRTCEnd = (data) => {
      console.log('📵 WebRTC call ended:', data);
      setConnectionStatus('disconnected');
      addNotification('Partner ended the video call', 'info');
      handleDisconnect();
    };
    
    const handleWebRTCError = (data) => {
      console.error('❌ WebRTC error:', data);
      addNotification(`WebRTC error: ${data.error}`, 'error');
    };
    
    const handlePartnerDisconnected = (data) => {
      console.log('🔌 Partner disconnected in video chat');
      setPartnerDisconnected(true);
      setConnectionStatus('disconnected');
      addNotification('Partner disconnected', 'warning');
    };
    
    // Socket listeners
    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
    socket.on('webrtc-end', handleWebRTCEnd);
    socket.on('webrtc-error', handleWebRTCError);
    socket.on('partnerDisconnected', handlePartnerDisconnected);
    
    return () => {
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
      socket.off('webrtc-end', handleWebRTCEnd);
      socket.off('webrtc-error', handleWebRTCError);
      socket.off('partnerDisconnected', handlePartnerDisconnected);
    };
  };
  const initializeWebRTCConnection = (callId, roomId, caller) => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      console.log('⚠️ WebRTC already initialized, skipping');
      return;
    }
    
    initializationRef.current = true;
    
    console.log('🔗 Initializing WebRTC connection:', {
      callId,
      roomId,
      caller,
      hasLocalStream,
      partner: !!partner
    });
    
    if (!partner) {
      console.error('❌ Cannot initialize WebRTC: No partner');
      initializationRef.current = false;
      return;
    }
    
    try {
      const configuration = {
        iceServers: iceServers.length > 0 ? iceServers : [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      };
      
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;
      
      // Add local stream to connection
      if (localStreamRef.current) {
        const tracks = localStreamRef.current.getTracks();
        console.log('🎬 Adding local tracks to peer connection:', tracks.length);
        
        tracks.forEach(track => {
          try {
            pc.addTrack(track, localStreamRef.current);
            console.log(`✅ Added ${track.kind} track`);
          } catch (error) {
            console.error(`❌ Failed to add ${track.kind} track:`, error);
          }
        });
      } else {
        console.warn('⚠️ No local stream to add to peer connection');
      }
      
      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('🎬 Received remote track:', event.track.kind);
        
        if (!remoteVideoRef.current) {
          console.error('❌ No remote video ref');
          return;
        }
        
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          console.log('📹 Remote stream received:', remoteStream.id);
          
          remoteVideoRef.current.srcObject = remoteStream;
          setRemoteStream(remoteStream);
          setConnectionStatus('connected');
          
          // Monitor remote stream for mute/unmute
          monitorRemoteStream(remoteStream);
          
          addNotification('Partner video received', 'success');
        }
      };
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket && partner) {
          const partnerId = partner.id || partner._id || partner.partnerId;
          if (partnerId) {
            sendWebRTCIceCandidate({
              to: partnerId,
              candidate: event.candidate,
              callId: callId || videoCallId
            });
          }
        }
      };
      
      // Handle connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log('🔄 Connection state changed:', state);
        setConnectionStatus(state);
        
        if (state === 'connected') {
          console.log('✅ WebRTC connection established');
          addNotification('Video call connected!', 'success');
          startStatsCollection();
        } else if (state === 'disconnected' || state === 'failed') {
          console.warn(`⚠️ WebRTC connection ${state}`);
          addNotification(`Connection ${state}`, 'warning');
          if (state === 'failed') {
            attemptReconnect();
          }
        }
      };
      
      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState);
      };
      
      // If caller, create and send offer
      if (caller) {
        console.log('📤 Creating offer as caller');
        
        setTimeout(async () => {
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            
            console.log('📝 Created offer:', offer.type);
            
            await pc.setLocalDescription(offer);
            
            const partnerId = partner.id || partner._id || partner.partnerId;
            if (partnerId) {
              sendWebRTCOffer({
                to: partnerId,
                sdp: offer,
                callId: callId || videoCallId,
                metadata: {
                  username: userProfile?.username || 'Anonymous',
                  videoEnabled: isVideoEnabled,
                  audioEnabled: isAudioEnabled
                }
              });
              console.log('📤 Sent WebRTC offer to partner:', partnerId);
            }
          } catch (error) {
            console.error('❌ Error creating offer:', error);
            initializationRef.current = false;
          }
        }, 1000);
      } else {
        console.log('📥 Waiting for offer as callee');
      }
      
      setConnectionStatus('connecting');
      console.log('✅ WebRTC connection initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      addNotification('Failed to start video call', 'error');
      initializationRef.current = false;
    }
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
      if (partner && videoCallId) {
        console.log('🔄 Attempting reconnect');
        initializeWebRTCConnection(videoCallId, roomId, isCaller);
      }
    }, 2000);
  };
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
    if (socket && partner) {
      const partnerId = partner.id || partner._id || partner.partnerId;
      if (partnerId && videoCallId) {
        sendWebRTCEnd({
          to: partnerId,
          reason: 'user_ended',
          callId: videoCallId
        });
      }
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
    const link = `${window.location.origin}/video/${roomId || videoCallId}`;
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
      initializeLocalStream();
    }, 500);
  };
  const cleanup = () => {
    console.log('🧹 Cleaning up video call');
    
    // Reset refs
    initializationRef.current = false;
    videoMatchReadyRef.current = false;
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
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
    setVideoCallId(null);
    setRoomId(null);
    setIsCaller(false);
    reconnectAttemptsRef.current = 0;
    setRetryCount(0);
  };
  // ==================== RENDER FUNCTIONS ====================
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
  const renderStats = () => {
    if (!callStats || connectionStatus !== 'connected') return null;
    
    return (
      <div className="absolute bottom-20 left-4 bg-black/80 backdrop-blur-sm text-xs p-3 rounded-xl z-30 border border-gray-700/50 max-w-xs">
        <div className="font-bold mb-2 text-cyan-400">Call Stats</div>
        <div className="space-y-1">
          {callStats.rtt && (
            <div>Latency: {callStats.rtt.toFixed(0)}ms</div>
          )}
          {callStats.video?.inbound?.framesPerSecond && (
            <div>FPS: {callStats.video.inbound.framesPerSecond}</div>
          )}
          {callStats.video?.inbound?.frameWidth && (
            <div>Resolution: {callStats.video.inbound.frameWidth}x{callStats.video.inbound.frameHeight}</div>
          )}
          {callStats.audio?.inbound?.packetsLost !== undefined && (
            <div>Audio Loss: {callStats.audio.inbound.packetsLost} packets</div>
          )}
        </div>
      </div>
    );
  };
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    const partnerId = partner?.id || partner?._id || partner?.partnerId;
    
    return (
      <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm text-xs p-3 rounded-xl z-30 border border-gray-700/50 max-w-xs">
        <div className="font-bold mb-2 text-yellow-400">Debug Info</div>
        <div className="space-y-1">
          <div>Socket ID: {socket?.id?.substring(0, 8)}</div>
          <div>Partner ID: {partnerId?.substring(0, 8) || 'None'}</div>
          <div>Call ID: {videoCallId?.substring(0, 8) || 'None'}</div>
          <div>Room ID: {roomId?.substring(0, 8) || 'None'}</div>
          <div>Is Caller: {isCaller ? 'Yes' : 'No'}</div>
          <div>Connection: {connectionStatus}</div>
          <div>Local Stream: {hasLocalStream ? 'Ready' : 'Not Ready'}</div>
          <div>Remote Stream: {remoteStream ? 'Active' : 'Inactive'}</div>
          <div>Initialized: {initializationRef.current ? 'Yes' : 'No'}</div>
        </div>
      </div>
    );
  };
  const renderDeviceError = () => {
    if (retryCount > 0 || !hasLocalStream) {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 z-40">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Camera/Microphone Issue</h3>
            <p className="text-gray-300 mb-4">
              {retryCount > 0
                ? `Failed to access media devices (Attempt ${retryCount})`
                : 'Unable to access camera or microphone'}
            </p>
            <div className="space-y-3">
              <button
                onClick={retryLocalStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-all duration-300"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  addNotification('Using placeholder video', 'info');
                  setHasLocalStream(true);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg font-medium hover:opacity-90 transition-all duration-300 border border-gray-700"
              >
                Continue with Placeholder
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
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
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
      {/* Debug Info */}
      {renderDebugInfo()}
      {renderStats()}
      
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
            <button
              onClick={copyRoomLink}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
              title="Copy Room Link"
            >
              <FaLink className="group-hover:scale-110 transition-transform" />
            </button>
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
                addNotification('Debug info logged to console', 'info');
              }}
              className="px-4 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
            >
              <FaInfoCircle className="inline mr-2" />
              Debug
            </button>
            
            {roomId && (
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
                  
                  {partner.profile?.interests?.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Interests</div>
                      <div className="flex flex-wrap gap-1">
                        {partner.profile.interests.slice(0, 3).map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs backdrop-blur-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom video controls */
        video::-webkit-media-controls {
          display: none !important;
        }
        
        video {
          -webkit-transform: scaleX(1); /* Fix for flipped video in some browsers */
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
};

export default VideoChatScreen;