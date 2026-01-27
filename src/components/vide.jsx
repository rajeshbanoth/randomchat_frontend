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
    debugGetState
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
  const [activeTheme, setActiveTheme] = useState('midnight');
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);
  
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
  
  // NEW: Camera switching state
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [currentMicrophoneIndex, setCurrentMicrophoneIndex] = useState(0);
  
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

  // Ref for queued ICE candidates
  const queuedIceCandidatesRef = useRef([]);
  const processingCandidatesRef = useRef(false);

  // Themes
  const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };

  // NEW: Get available cameras and microphones
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      
      setAvailableCameras(cameras);
      setAvailableMicrophones(microphones);
      
      console.log('📱 Available devices:', {
        cameras: cameras.length,
        microphones: microphones.length
      });
      
      return { cameras, microphones };
    } catch (error) {
      console.error('❌ Error enumerating devices:', error);
      return { cameras: [], microphones: [] };
    }
  }, []);

  // NEW: Switch camera
  const switchCamera = async (deviceId) => {
    if (!localStreamRef.current || !peerConnectionRef.current) return;
    
    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;
      
      // Stop current video track
      videoTrack.stop();
      
      // Get new video stream with selected camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 }
        },
        audio: isAudioEnabled ? {
          deviceId: availableMicrophones[currentMicrophoneIndex]?.deviceId ? 
            { exact: availableMicrophones[currentMicrophoneIndex].deviceId } : true
        } : false
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in local stream
      localStreamRef.current.removeTrack(videoTrack);
      localStreamRef.current.addTrack(newVideoTrack);
      
      // Replace track in peer connection
      const sender = peerConnectionRef.current.getSenders()
        .find(s => s.track?.kind === 'video');
      
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }
      
      // Update video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      // Update camera index
      const cameraIndex = availableCameras.findIndex(cam => cam.deviceId === deviceId);
      if (cameraIndex !== -1) {
        setCurrentCameraIndex(cameraIndex);
      }
      
      addNotification('Camera switched', 'success');
    } catch (error) {
      console.error('❌ Error switching camera:', error);
      addNotification('Failed to switch camera', 'error');
    }
  };

  // NEW: Switch microphone
  const switchMicrophone = async (deviceId) => {
    if (!localStreamRef.current || !peerConnectionRef.current) return;
    
    try {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (!audioTrack) return;
      
      // Stop current audio track
      audioTrack.stop();
      
      // Get new audio stream with selected microphone
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled ? {
          deviceId: availableCameras[currentCameraIndex]?.deviceId ? 
            { exact: availableCameras[currentCameraIndex].deviceId } : true,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 }
        } : false,
        audio: {
          deviceId: { exact: deviceId }
        }
      });
      
      const newAudioTrack = newStream.getAudioTracks()[0];
      
      // Replace track in local stream
      localStreamRef.current.removeTrack(audioTrack);
      localStreamRef.current.addTrack(newAudioTrack);
      
      // Replace track in peer connection
      const sender = peerConnectionRef.current.getSenders()
        .find(s => s.track?.kind === 'audio');
      
      if (sender) {
        await sender.replaceTrack(newAudioTrack);
      }
      
      // Update microphone index
      const micIndex = availableMicrophones.findIndex(mic => mic.deviceId === deviceId);
      if (micIndex !== -1) {
        setCurrentMicrophoneIndex(micIndex);
      }
      
      addNotification('Microphone switched', 'success');
    } catch (error) {
      console.error('❌ Error switching microphone:', error);
      addNotification('Failed to switch microphone', 'error');
    }
  };

  // Updated initializeLocalStream with device selection
  const initializeLocalStream = async (forceRetry = false) => {
    if (isInitializing && !forceRetry) {
      console.log('⏳ Already initializing local stream');
      return null;
    }
    
    setIsInitializing(true);
    setDeviceError(null);
    
    console.log('🎥 Requesting media devices...');
    
    try {
      // Get available devices
      const { cameras, microphones } = await getAvailableDevices();
      
      console.log('📱 Available devices:', {
        video: cameras.length,
        audio: microphones.length
      });
      
      // Stop any existing stream
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
      
      // Build constraints
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
      
      // Use first camera if available
      if (cameras.length > 0) {
        constraints.video.deviceId = { exact: cameras[0].deviceId };
        setCurrentCameraIndex(0);
      } else {
        console.warn('⚠️ No video devices found, using audio only');
        constraints.video = false;
      }
      
      // Use first microphone if available
      if (microphones.length > 0) {
        constraints.audio.deviceId = { exact: microphones[0].deviceId };
        setCurrentMicrophoneIndex(0);
      } else {
        console.warn('⚠️ No audio devices found, using video only');
        constraints.audio = false;
      }
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
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
      
      // Update enabled states
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
      
      return createPlaceholderStream();
      
    } finally {
      setIsInitializing(false);
    }
  };

  // WebRTC functions (simplified and cleaned)
  const createPeerConnection = useCallback((servers) => {
    console.log('🔗 Creating peer connection');
    
    const configuration = {
      iceServers: servers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
    
    // Close existing peer connection if any
    if (peerConnectionRef.current) {
      console.log('🛑 Closing existing peer connection');
      peerConnectionRef.current.close();
    }
    
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;
    
    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStreamRef.current);
        } catch (error) {
          console.error(`❌ Failed to add ${track.kind} track:`, error);
        }
      });
    }
    
    // Event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected && callInfo.partnerId) {
        sendWebRTCIceCandidate({
          to: callInfo.partnerId,
          candidate: event.candidate,
          callId: callInfo.callId,
          roomId: callInfo.roomId
        });
      }
    };
    
    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        addNotification('Video call connected!', 'success');
      }
    };
    
    pc.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      
      const remoteStream = remoteStreamRef.current;
      const existingTrack = remoteStream.getTracks().find(t => t.id === event.track.id);
      
      if (!existingTrack) {
        remoteStream.addTrack(event.track);
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        
        setRemoteStream(remoteStream);
      }
    };
    
    return pc;
  }, [socket, callInfo, sendWebRTCIceCandidate]);

  // Control functions
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
          setIsScreenSharing(true);
          addNotification('Screen sharing started', 'success');
          
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
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Effects
  useEffect(() => {
    console.log('🎬 VideoChatScreen mounted');
    
    // Initialize
    initializeLocalStream();
    getAvailableDevices();
    
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
      
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  // If searching and no partner, show searching screen
  if (searching && !partner) {
    return (
      <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('home')}
              className="group flex items-center space-x-2 sm:space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-sm sm:text-base" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
                <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Searching...
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Searching Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
          <div className="text-center max-w-md">
            <div className="relative mb-6 sm:mb-10">
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-5xl relative animate-float mx-auto">
                <FaVideo className="animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Looking for video partner...
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-10 text-sm sm:text-lg">
              We're searching for someone who wants to video chat
            </p>
            
            <div className="space-y-3 sm:space-y-4 max-w-xs mx-auto">
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-full px-4 py-2.5 sm:px-8 sm:py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm"
              >
                Cancel Search
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-4 py-2.5 sm:px-8 sm:py-3.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm flex items-center justify-center"
              >
                <FaCog className="mr-2 sm:mr-3" />
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
      {/* Header - Responsive */}
      <div className={`relative px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                handleDisconnect();
                setCurrentScreen('home');
              }}
              className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 px-3 py-1.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-sm" />
              <span className="font-medium text-sm">End Call</span>
            </button>
            
            {partner && (
              <div className="flex items-center space-x-3 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm sm:text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {partner.profile?.username || partner.username || 'Stranger'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTime(callDuration)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
              className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <FaPalette className="text-sm sm:text-base" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <FaCog className="text-sm sm:text-base" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Video Area - Responsive */}
      <div className="video-container flex-1 relative overflow-hidden bg-black">
        {/* Remote Video */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {(!remoteStream || connectionStatus !== 'connected') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90 p-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-6 border border-gray-700/50">
                <div className="text-3xl sm:text-5xl text-blue-400 animate-pulse">
                  <FaVideo />
                </div>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for partner'}
              </h3>
              <p className="text-gray-400 mb-6 text-sm sm:text-lg text-center">
                {connectionStatus === 'connecting'
                  ? 'Establishing video connection...'
                  : 'Partner video will appear here'}
              </p>
            </div>
          )}
        </div>
        
        {/* Local Video - Responsive sizing */}
        {hasLocalStream && (
          <div className={`absolute ${isFullscreen ? 'top-4 right-4 w-32 h-24 sm:w-64 sm:h-48' : 'top-2 right-2 w-32 h-24 sm:w-48 sm:h-36'} transition-all duration-300 rounded-xl overflow-hidden border-2 border-gray-700/50 bg-black shadow-2xl`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Controls Bar - Responsive */}
      <div className={`relative p-3 sm:p-6 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Main Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {/* Camera Toggle */}
            <button
              onClick={toggleVideo}
              disabled={!hasLocalStream}
              className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isVideoEnabled
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'}`}
            >
              {isVideoEnabled ? (
                <FaVideo className="text-lg sm:text-2xl" />
              ) : (
                <FaVideoSlash className="text-lg sm:text-2xl" />
              )}
            </button>
            
            {/* Microphone Toggle */}
            <button
              onClick={toggleAudio}
              disabled={!hasLocalStream}
              className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isAudioEnabled
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'}`}
            >
              {isAudioEnabled ? (
                <FaMicrophone className="text-lg sm:text-2xl" />
              ) : (
                <FaMicrophoneSlash className="text-lg sm:text-2xl" />
              )}
            </button>
            
            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${isScreenSharing
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
                : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'}`}
            >
              {isScreenSharing ? (
                <MdStopScreenShare className="text-lg sm:text-2xl" />
              ) : (
                <MdScreenShare className="text-lg sm:text-2xl" />
              )}
            </button>
            
            {/* Camera Switch */}
            {availableCameras.length > 1 && (
              <button
                onClick={() => {
                  const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
                  switchCamera(availableCameras[nextIndex].deviceId);
                }}
                className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                title="Switch Camera"
              >
                <FaCamera className="text-lg sm:text-2xl" />
              </button>
            )}
            
            {/* End Call */}
            <button
              onClick={handleDisconnect}
              className="p-4 sm:p-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30"
            >
              <FaPhone className="text-lg sm:text-2xl" />
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
            >
              {isFullscreen ? (
                <FaCompress className="text-lg sm:text-2xl" />
              ) : (
                <FaExpand className="text-lg sm:text-2xl" />
              )}
            </button>
          </div>
          
          {/* Additional Controls */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            {callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30 flex items-center"
              >
                <FaRegCopy className="mr-1.5 sm:mr-2" />
                Copy Link
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30 flex items-center"
            >
              <FaRandom className="mr-1.5 sm:mr-2" />
              Next
            </button>
            
            {!hasLocalStream && (
              <button
                onClick={retryLocalStream}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30 flex items-center"
              >
                <FaSync className="mr-1.5 sm:mr-2" />
                Retry Camera
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Settings Panel - Responsive */}
      {showSettings && (
        <div className="absolute top-14 sm:top-16 right-2 sm:right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-700/50 shadow-2xl w-56 sm:w-64 z-50">
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
            
            {/* Camera Selection */}
            {availableCameras.length > 0 && (
              <div className="pt-2 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Camera</h4>
                <div className="space-y-1">
                  {availableCameras.map((camera, index) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => switchCamera(camera.deviceId)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs sm:text-sm transition-all duration-200 ${
                        currentCameraIndex === index
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <FaCamera className="mr-2 text-xs" />
                        <span className="truncate">{camera.label || `Camera ${index + 1}`}</span>
                        {currentCameraIndex === index && (
                          <span className="ml-auto text-xs text-green-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Microphone Selection */}
            {availableMicrophones.length > 0 && (
              <div className="pt-2 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Microphone</h4>
                <div className="space-y-1">
                  {availableMicrophones.map((mic, index) => (
                    <button
                      key={mic.deviceId}
                      onClick={() => switchMicrophone(mic.deviceId)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs sm:text-sm transition-all duration-200 ${
                        currentMicrophoneIndex === index
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <FaMicrophone className="mr-2 text-xs" />
                        <span className="truncate">{mic.label || `Mic ${index + 1}`}</span>
                        {currentMicrophoneIndex === index && (
                          <span className="ml-auto text-xs text-green-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-300">Camera</span>
                  <span className={`text-xs ${hasLocalStream ? 'text-green-400' : 'text-red-400'}`}>
                    {hasLocalStream ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-300">Connection</span>
                  <span className="text-xs text-gray-400">{connectionStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatScreen;