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
import {initializeWebRTCConnectionFn } from './functions/webrtc/initializeWebRTCConnection';
// Import the factories (they are named same as functions)
import {
  processQueuedIceCandidates as processQueuedIceCandidatesFactory,
  monitorStreams as monitorStreamsFactory
} from './functions/webrtcDebugFunctions';


import { startStatsCollectionFn, stopStatsCollectionFn } from './functions/webrtc/startStatsCollection';
import { attemptReconnectFn } from './functions/webrtc/attemptReconnect';
import { fetchIceServersFn } from './functions/webrtc/fetchIceServers';
import { initializeLocalStreamFn, createPlaceholderStreamFn } from './functions/webrtc/localStream';
import { forceStreamSyncFn } from './functions/webrtc/forceStreamSync';


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
// Add this ref
const lastConnectionStateRef = useRef({});

  // Add these refs at the top with other refs
const queuedIceCandidatesRef = useRef([]);
const processingCandidatesRef = useRef(false);


  // Instantiate the functions from factories and preserve original function names
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
      
      // Give a moment for tracks to stabilize
      setTimeout(() => {
        // Check if we have remote tracks but no remote stream
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
        
        // Log current state
        monitorStreams();
      }, 1000);
    }
  };
  
  syncStreams();
}, [connectionStatus, monitorStreams]);


// Add this useEffect to monitor connection state
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
      
      // Only log if something changed
      if (JSON.stringify(state) !== JSON.stringify(lastConnectionStateRef.current)) {
        console.log('📡 Connection state update:', state);
        lastConnectionStateRef.current = state;
        
        // Auto-correct role based on actual state
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
  }, 2000); // Check every 2 seconds
  
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

  // ==================== INITIALIZATION ====================
  
const fetchIceServers = async () => {
  return await fetchIceServersFn({
    setIceServers
  });
};






const initializeLocalStream = async () => {
  return await initializeLocalStreamFn({
    isInitializing,
    setIsInitializing,
    setDeviceError,
    localStreamRef,
    setLocalStream,
    setHasLocalStream,
    localVideoRef,
    setIsVideoEnabled,
    setIsAudioEnabled,
    streamRetryCountRef,
    maxStreamRetries,
    addNotification
  });
};


// Helper function to force stream synchronization
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




useEffect(() => {
  // Periodically check for tracks without streams
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


  // ==================== WEBRTC CORE FUNCTIONS ====================


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
  
  // FIXED: Better role determination
  // Use a combination of socket ID and match time
  const matchTime = data.timestamp || Date.now();
  
  // Simple deterministic rule: Lower socket ID is caller
  // But also consider if we initiated the video chat
  const isCaller = currentSocketId && partnerId && 
                   (currentSocketId < partnerId);
  
  console.log('📞 Determining caller role:', {
    currentSocketId: currentSocketId?.substring(0, 8),
    partnerId: partnerId?.substring(0, 8),
    isCaller,
    rule: 'lower socket ID is caller'
  });
  
  // Update call info
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
  
  // CRITICAL: Check if we already sent an offer (GLARE condition)
  if (hasLocalOffer) {
    console.warn('⚠️ GLARE: We already sent an offer, but received another offer');
    console.log('🔄 Comparing offer timestamps to decide who wins...');
    
    // Simple resolution: Lower socket ID becomes caller
    const ourSocketId = socket?.id;
    const theirSocketId = data.from;
    const weShouldBeCaller = ourSocketId && theirSocketId && ourSocketId < theirSocketId;
    
    if (weShouldBeCaller) {
      console.log('🎯 We win glare (lower socket ID), ignoring their offer');
      console.log('📤 Re-sending our offer...');
      
      // Re-send our offer
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
      
      // Rollback: Clear local description, become callee
      await pc.setLocalDescription(null);
    }
  }
  
  // Normal offer handling
  try {
    console.log('🎯 Handling offer as callee...');
    
    // Update call info
    setCallInfo(prev => ({
      ...prev,
      callId: data.callId || prev.callId,
      partnerId: data.from || prev.partnerId,
      roomId: data.roomId || prev.roomId,
      isCaller: false // We're callee when receiving offer
    }));
    
    // Set remote description
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    console.log('✅ Remote description (offer) set');
    
    // Create and send answer
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
  
  // Update callInfo with roomId if missing
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
  
  // Get current signaling state
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
  
  // CRITICAL FIX: Check if we're already connected
  if (signalingState === 'stable' && remoteDescType === 'answer') {
    console.log('ℹ️ Already connected (stable with answer), ignoring duplicate answer');
    
    // Just update our role if it's wrong
    if (localDescType === 'offer' && !callInfo.isCaller) {
      console.log('🔄 Correcting role: we are caller (we sent offer)');
      setCallInfo(prev => ({ ...prev, isCaller: true }));
    }
    
    // Check if we have media flowing
    setTimeout(() => {
      const receivers = pc.getReceivers();
      console.log('📊 Current receivers:', receivers.length);
      receivers.forEach((rec, idx) => {
        if (rec.track) {
          console.log(`  Receiver ${idx}: ${rec.track.kind} - ${rec.track.readyState}`);
        }
      });
    }, 500);
    
    return; // Don't process further
  }
  
  // Handle based on actual state, not just isCaller flag
  if (signalingState === 'have-local-offer') {
    // We sent an offer, waiting for answer - we're the CALLER
    console.log('🎯 We are CALLER (have-local-offer), processing answer...');
    
    // Update role if needed
    if (!callInfo.isCaller) {
      console.log('🔄 Setting isCaller = true');
      setCallInfo(prev => ({ ...prev, isCaller: true }));
    }
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log('✅ Remote description (answer) set');
      
      setConnectionStatus('connected');
      addNotification('Video call connected!', 'success');
      
      // Debug media tracks
      setTimeout(() => {
        const receivers = pc.getReceivers();
        console.log('📊 Active receivers after answer:', receivers.length);
        
        if (receivers.length === 0) {
          console.warn('⚠️ No receivers! Check ontrack event');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error setting remote description:', error);
      
      // If already in stable state, just update role
      if (error.message.includes('wrong state: stable')) {
        console.log('ℹ️ Already stable, just updating role');
        if (!callInfo.isCaller) {
          setCallInfo(prev => ({ ...prev, isCaller: true }));
        }
      }
    }
    
  } else if (signalingState === 'stable' && localDescType === 'offer') {
    // We're in stable state but think we're callee - fix role
    console.log('🔄 Stable with local offer - we are actually CALLER');
    setCallInfo(prev => ({ ...prev, isCaller: true }));
    
    // Check if we need to update remote description
    if (!remoteDescType || remoteDescType !== 'answer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('✅ Updated to answer in stable state');
      } catch (error) {
        console.warn('⚠️ Could not update remote description:', error.message);
      }
    }
    
  } else if (signalingState === 'have-remote-offer') {
    // We received an offer - we're CALLEE, shouldn't get answers
    console.warn('❌ CALLEE received answer - ignoring');
    
    // We should send our answer again if we have one
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
    // Other states
    console.log(`ℹ️ Answer received in ${signalingState} state, trying to handle...`);
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log('✅ Remote description set');
      
      // If we successfully set answer, we must be caller
      if (!callInfo.isCaller) {
        console.log('🔄 Updating role to caller');
        setCallInfo(prev => ({ ...prev, isCaller: true }));
      }
      
    } catch (error) {
      console.warn('⚠️ Could not set remote description:', error.message);
    }
  }
  
  // Log final state
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


const checkStreamState = () => {
  console.log('=== STREAM STATE DEBUG ===');
  
  // Check local stream
  console.log('📱 Local Stream:', {
    exists: !!localStreamRef.current,
    active: localStreamRef.current?.active,
    tracks: localStreamRef.current?.getTracks().length || 0,
    videoTracks: localStreamRef.current?.getVideoTracks().length || 0,
    audioTracks: localStreamRef.current?.getAudioTracks().length || 0
  });
  
  // Check remote stream
  console.log('📹 Remote Stream:', {
    exists: !!remoteStreamRef.current,
    active: remoteStreamRef.current?.active,
    tracks: remoteStreamRef.current?.getTracks().length || 0,
    videoTracks: remoteStreamRef.current?.getVideoTracks().length || 0,
    audioTracks: remoteStreamRef.current?.getAudioTracks().length || 0
  });
  
  // Check peer connection
  if (peerConnectionRef.current) {
    const pc = peerConnectionRef.current;
    console.log('🔗 Peer Connection:', {
      signalingState: pc.signalingState,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState
    });
    
    // Check receivers
    const receivers = pc.getReceivers();
    console.log('🎧 Receivers:', receivers.length);
    receivers.forEach((receiver, idx) => {
      console.log(`  Receiver ${idx}:`, {
        trackKind: receiver.track?.kind,
        trackId: receiver.track?.id?.substring(0, 8),
        trackEnabled: receiver.track?.enabled,
        trackState: receiver.track?.readyState
      });
    });
    
    // Check transceivers
    const transceivers = pc.getTransceivers();
    console.log('🔄 Transceivers:', transceivers.length);
    transceivers.forEach((transceiver, idx) => {
      console.log(`  Transceiver ${idx}:`, {
        mid: transceiver.mid,
        direction: transceiver.direction,
        currentDirection: transceiver.currentDirection,
        receiverTrack: transceiver.receiver.track?.kind,
        senderTrack: transceiver.sender.track?.kind
      });
    });
  }
  
  console.log('=== END DEBUG ===');
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
    checkStreamState();
    addNotification('Debug info logged to console', 'info');
  }}
  className="px-4 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
>
  <FaInfoCircle className="inline mr-2" />
  Debug Stream
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