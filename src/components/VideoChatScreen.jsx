// // src/components/VideoChatScreen.jsx
// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import {
//   FaArrowLeft, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
//   FaPhoneSlash, FaPaperPlane, FaSyncAlt, FaDesktop, FaRedoAlt,
//   FaSmile, FaMagic, FaLanguage, FaRandom, FaHeart,
//   FaFire, FaBolt, FaGhost, FaUserFriends, FaSearch,
//   FaChevronRight, FaChevronLeft, FaUsers, FaGlobe,
//   FaExpand, FaCompress, FaShareAlt, FaEllipsisV, FaExclamationTriangle
// } from 'react-icons/fa';
// import { GiSoundWaves } from 'react-icons/gi';
// import EmojiPicker from 'emoji-picker-react';
// import { useChat } from '../context/ChatContext';
// import './OmegleMobile.css';

// // ICE servers configuration
// const ICE_SERVERS = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' },
//     { urls: 'stun:stun1.l.google.com:19302' },
//     { urls: 'stun:stun2.l.google.com:19302' },
//     { urls: 'stun:stun3.l.google.com:19302' },
//     { urls: 'stun:stun4.l.google.com:19302' }
//   ],
//   iceTransportPolicy: 'all',
//   bundlePolicy: 'max-bundle',
//   rtcpMuxPolicy: 'require'
// };

// // Connection states
// const CONNECTION_STATES = {
//   DISCONNECTED: 'disconnected',
//   SEARCHING: 'searching',
//   CONNECTING: 'connecting',
//   CONNECTED: 'connected',
//   FAILED: 'failed',
//   RECONNECTING: 'reconnecting'
// };

// const VideoChatScreen = () => {
//   const {
//     socket,
//     partner,
//     messages,
//     userProfile,
//     searching,
//     onlineCount,
//     sendMessage,
//     disconnectPartner,
//     nextPartner,
//     addNotification,
//     handleTypingStart,
//     handleTypingStop,
//     setCurrentScreen,
//     startSearch,
//     currentChatMode
//   } = useChat();

//   // Refs
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const socketRef = useRef(null);
//   const partnerRef = useRef(null);
//   const messageEndRef = useRef(null);
//   const swipeAreaRef = useRef(null);
//   const autoConnectTimerRef = useRef(null);
//   const swipeTimerRef = useRef(null);
//   const reconnectTimerRef = useRef(null);
//   const callTimerRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const screenShareRef = useRef(null);

//   // State
//   const [inCall, setInCall] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [audioEnabled, setAudioEnabled] = useState(true);
//   const [videoEnabled, setVideoEnabled] = useState(true);
//   const [messageText, setMessageText] = useState('');
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [swipeDirection, setSwipeDirection] = useState(null);
//   const [swipeProgress, setSwipeProgress] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATES.DISCONNECTED);
//   const [debugLogs, setDebugLogs] = useState([]);
//   const [localVideoStream, setLocalVideoStream] = useState(null);
//   const [remoteVideoStream, setRemoteVideoStream] = useState(null);
//   const [showDebug, setShowDebug] = useState(false);
//   const [autoSearch, setAutoSearch] = useState(true);
//   const [swipeHintVisible, setSwipeHintVisible] = useState(true);
//   const [screenShareActive, setScreenShareActive] = useState(false);
//   const [hasError, setHasError] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isMounted, setIsMounted] = useState(true);

// const getPartnerId = () => {
//   if (!partnerRef.current) return null;
//   return partnerRef.current.partnerId || partnerRef.current.id;
// };
  
//   // Initialize refs
//   useEffect(() => {
//     socketRef.current = socket;
//     console.log('Socket ref updated:', socket?.id);
//   }, [socket]);

//   useEffect(() => {
//     partnerRef.current = partner;
//     console.log('Partner ref updated:', partner);
//   }, [partner]);

//   // Component mount/unmount
//   useEffect(() => {
//     setIsMounted(true);
//     return () => {
//       setIsMounted(false);
//     };
//   }, []);

//   // Add debug log
//   const addDebugLog = useCallback((message, type = 'info') => {
//     const timestamp = new Date().toLocaleTimeString();
//     const log = {
//       id: Date.now(),
//       timestamp,
//       message,
//       type
//     };
    
//     if (isMounted) {
//       setDebugLogs(prev => [log, ...prev.slice(0, 20)]);
//     }
    
//     console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    
//     if (type === 'error') {
//       addNotification(message, 'error');
//     }
//   }, [isMounted, addNotification]);

//   // Listen for video match events from ChatContext
//   useEffect(() => {
//     const handleVideoMatch = (event) => {
//       console.log('Video match event received:', event.detail);
//       const matchedPartner = event.detail?.partner;
      
//       if (matchedPartner && matchedPartner.id !== partnerRef.current?.id) {
//         console.log('Setting partner from match event:', matchedPartner);
//         addDebugLog('Partner matched via event, starting call...', 'info');
        
//         // Update partner ref immediately
//         partnerRef.current = matchedPartner;
        
//         // Start video call after short delay
//         setTimeout(() => {
//           if (!inCall && !isConnecting && socketRef.current?.connected) {
//             console.log('Starting video call from match event');
//             startVideoCall();
//           }
//         }, 300);
//       }
//     };

//     window.addEventListener('video-match', handleVideoMatch);
    
//     return () => {
//       window.removeEventListener('video-match', handleVideoMatch);
//     };
//   }, [inCall, isConnecting, addDebugLog]);

//   // Handle when partner updates from context
//   useEffect(() => {
//     console.log('Partner context updated in VideoChatScreen:', partner);
    
//     if (partner) {
//       // Update partner ref
//       partnerRef.current = partner;
      
//       // If this is a video chat and we're not already in a call, start it
//       if (currentChatMode === 'video' && !inCall && !isConnecting) {
//         console.log('Starting video call from partner update');
//         addDebugLog('Partner found, starting video call...', 'info');
        
//         // Small delay to ensure everything is ready
//         setTimeout(() => {
//           if (partnerRef.current?.id && socketRef.current?.connected) {
//             startVideoCall();
//           }
//         }, 1000);
//       }
//     } else {
//       // Partner disconnected or cleared
//       console.log('Partner cleared');
//       partnerRef.current = null;
//       setRemoteVideoStream(null);
      
//       // Auto-search if enabled
//       if (autoSearch && !searching && socketRef.current?.connected) {
//         setTimeout(() => {
//           handleStartSearch();
//         }, 1000);
//       }
//     }
//   }, [partner, currentChatMode, inCall, isConnecting, autoSearch, searching, addDebugLog]);

//   // Auto-start video call when conditions are met
//   useEffect(() => {
//     const checkAndStartCall = () => {
//       console.log('Checking if should start video call:', {
//         partner: partnerRef.current,
//         inCall,
//         isConnecting,
//         currentChatMode,
//         socketConnected: socketRef.current?.connected
//       });
      
//       if (partnerRef.current && 
//           currentChatMode === 'video' && 
//           !inCall && 
//           !isConnecting && 
//           socketRef.current?.connected) {
        
//         console.log('Conditions met, starting video call');
//         addDebugLog('Partner ready, initiating video call...', 'info');
        
//         // Clear any existing timeout
//         if (autoConnectTimerRef.current) {
//           clearTimeout(autoConnectTimerRef.current);
//         }
        
//         // Start call with small delay
//         autoConnectTimerRef.current = setTimeout(() => {
//           if (partnerRef.current?.id && !inCall && !isConnecting) {
//             console.log('Executing startVideoCall');
//             startVideoCall();
//           }
//         }, 500);
//       }
//     };
    
//     // Check immediately
//     checkAndStartCall();
    
//     return () => {
//       if (autoConnectTimerRef.current) {
//         clearTimeout(autoConnectTimerRef.current);
//       }
//     };
//   }, [inCall, isConnecting, currentChatMode, addDebugLog]);

//   // Auto-search for new partner when disconnected
//   useEffect(() => {
//     if (!partner && autoSearch && !searching && inCall) {
//       console.log('Partner disconnected, auto-searching for new partner...');
//       addDebugLog('Auto-searching for new partner...', 'info');
      
//       // Clear call state
//       setInCall(false);
//       setConnectionStatus(CONNECTION_STATES.SEARCHING);
      
//       // Start search after short delay
//       setTimeout(() => {
//         handleStartSearch();
//       }, 1000);
//     }
//   }, [partner, autoSearch, searching, inCall, addDebugLog]);

//   // Initial setup
//   useEffect(() => {
//     console.log('VideoChatScreen mounted');
//     addDebugLog('Component mounted', 'info');
    
//     const initialize = async () => {
//       // Wait for socket connection
//       if (!socketRef.current?.connected) {
//         console.log('Waiting for socket connection...');
//         addDebugLog('Waiting for socket connection...', 'info');
        
//         const checkSocket = setInterval(() => {
//           if (socketRef.current?.connected) {
//             clearInterval(checkSocket);
//             console.log('Socket connected, proceeding...');
//             handleStartSearch();
//           }
//         }, 500);
//         return;
//       }
      
//       // If already have a partner from context, don't search
//       if (partnerRef.current) {
//         console.log('Already have partner from context:', partnerRef.current);
//         // Wait a moment then start video call
//         setTimeout(() => {
//           if (!inCall && !isConnecting) {
//             startVideoCall();
//           }
//         }, 1000);
//       } else if (!searching) {
//         // Start search if not already searching
//         console.log('No partner, starting search...');
//         handleStartSearch();
//       }
//     };

//     initialize();

//     return () => {
//       console.log('VideoChatScreen cleanup');
//       cleanupMedia();
//       if (autoConnectTimerRef.current) {
//         clearTimeout(autoConnectTimerRef.current);
//       }
//     };
//   }, []);

//   // Socket event handlers
//   useEffect(() => {
//     if (!socketRef.current) return;
    
//     console.log('Setting up socket event handlers in VideoChatScreen');
    
//     const handleConnect = () => {
//       console.log('Socket connected in VideoChatScreen');
//       addDebugLog('Socket connected', 'success');
      
//       // If we have a partner but no call, try to start call
//       if (partnerRef.current?.id && !inCall && !isConnecting) {
//         setTimeout(() => {
//           startVideoCall();
//         }, 1000);
//       }
//     };
    
//     const handleDisconnect = () => {
//       console.log('Socket disconnected in VideoChatScreen');
//       addDebugLog('Socket disconnected', 'error');
//       setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
//       setInCall(false);
//     };
    
//     const handleMatched = (data) => {
//       console.log('Matched event received in VideoChatScreen:', data);
//       addDebugLog(`Matched with partner: ${data.profile?.username || 'Stranger'}`, 'success');
      
//       // Update partner ref immediately
//       partnerRef.current = data;
      
//       // Start video call after short delay
//       setTimeout(() => {
//         if (partnerRef.current?.id && !inCall && !isConnecting) {
//           console.log('Auto-starting call after match');
//           startVideoCall();
//         }
//       }, 500);
//     };
    
//     const handleSearching = () => {
//       console.log('Searching event received');
//       setConnectionStatus(CONNECTION_STATES.SEARCHING);
//     };
    
//     // Listen to socket events
//     const socket = socketRef.current;
//     socket.on('connect', handleConnect);
//     socket.on('disconnect', handleDisconnect);
//     socket.on('matched', handleMatched);
//     socket.on('searching', handleSearching);
    
//     return () => {
//       socket.off('connect', handleConnect);
//       socket.off('disconnect', handleDisconnect);
//       socket.off('matched', handleMatched);
//       socket.off('searching', handleSearching);
//     };
//   }, [inCall, isConnecting, addDebugLog]);

//   // WebRTC signaling handlers
// // Update the WebRTC event handlers (around line 350):
// useEffect(() => {
//   if (!socketRef.current) {
//     console.log('Socket ref not available for WebRTC');
//     return;
//   }

//   const handleWebRTCOffer = async (data) => {
//     console.log('Received WebRTC offer:', data);
//     addDebugLog(`Received call offer from ${data.from || 'unknown'}`, 'info');
    
//     // Validate data
//     if (!data.sdp || !data.from) {
//       console.error('Invalid offer data:', data);
//       addDebugLog('Invalid offer data received', 'error');
//       return;
//     }
    
//     // Update partner info if needed
//     if (data.metadata && !partnerRef.current) {
//       console.log('Setting partner from offer metadata');
//       partnerRef.current = {
//         partnerId: data.from,
//         id: data.from, // Add both for compatibility
//         profile: data.metadata
//       };
//     }
    
//     // Accept incoming call
//     if (!pcRef.current) {
//       await handleIncomingCall(data.sdp, data.from);
//     } else {
//       console.log('Already in a call, ignoring offer');
//     }
//   };

//   const handleWebRTCAnswer = async (data) => {
//     console.log('Received WebRTC answer:', data);
//     addDebugLog('Received call answer from partner', 'info');
    
//     if (!pcRef.current || !data.sdp) {
//       console.error('No peer connection or invalid answer');
//       return;
//     }
    
//     if (pcRef.current.signalingState === 'have-local-offer') {
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
//         addDebugLog('Remote description set successfully', 'success');
//       } catch (error) {
//         console.error('Error setting remote description:', error);
//         addDebugLog(`Failed to set remote description: ${error.message}`, 'error');
//       }
//     } else {
//       console.warn('Unexpected signaling state:', pcRef.current.signalingState);
//     }
//   };

//   const handleWebRTCIceCandidate = (data) => {
//     console.log('Received ICE candidate from:', data.from);
//     if (pcRef.current && data.candidate) {
//       try {
//         pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
//           .catch(err => console.error('Error adding ICE candidate:', err));
//       } catch (error) {
//         console.error('Error processing ICE candidate:', error);
//       }
//     }
//   };

//   const handleWebRTCEnd = (data) => {
//     console.log('Partner ended the call:', data);
//     addDebugLog('Partner ended the call', 'info');
//     handleEndCall(false);
    
//     // Auto-search for new partner if enabled
//     if (autoSearch) {
//       setTimeout(() => {
//         handleStartSearch();
//       }, 1000);
//     }
//   };

//   const handleWebRTCError = (data) => {
//     console.error('WebRTC error from server:', data);
//     addDebugLog(`WebRTC error: ${data.error || 'Unknown'}`, 'error');
//   };

//   // Set up socket listeners
//   const socket = socketRef.current;
//   socket.on('webrtc-offer', handleWebRTCOffer);
//   socket.on('webrtc-answer', handleWebRTCAnswer);
//   socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
//   socket.on('webrtc-end', handleWebRTCEnd);
//   socket.on('webrtc-error', handleWebRTCError);

//   return () => {
//     socket.off('webrtc-offer', handleWebRTCOffer);
//     socket.off('webrtc-answer', handleWebRTCAnswer);
//     socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
//     socket.off('webrtc-end', handleWebRTCEnd);
//     socket.off('webrtc-error', handleWebRTCError);
//   };
// }, [autoSearch, addDebugLog]);
//   // Handle starting search
//   const handleStartSearch = async () => {
//     console.log('=== handleStartSearch ===');
//     console.log('Current state:', { searching, partner: partnerRef.current, socketConnected: socketRef.current?.connected });
    
//     if (searching) {
//       console.log('Already searching, skipping...');
//       return;
//     }
    
//     if (!socketRef.current || !socketRef.current.connected) {
//       console.error('Socket not connected');
//       addNotification('Please wait for connection...', 'error');
//       return;
//     }
    
//     console.log('Starting video chat search...');
//     addDebugLog('Starting video partner search...', 'info');
//     setConnectionStatus(CONNECTION_STATES.SEARCHING);
    
//     try {
//       // First initialize local media
//       await initializeLocalMedia();
      
//       console.log('Local media ready, starting search...');
      
//       // Call the context's startSearch function
//       startSearch('video');
      
//       // Also emit search via socket directly as backup
//       if (socketRef.current.connected && userProfile) {
//         console.log('Emitting direct search event');
//         socketRef.current.emit('search', {
//           mode: 'video',
//           interests: userProfile.interests || [],
//           genderPreference: userProfile.genderPreference || 'any',
//           ageRange: userProfile.ageRange || { min: 18, max: 60 },
//           socketId: socketRef.current.id,
//           userId: userProfile.id || socketRef.current.id,
//           username: userProfile.username,
//           timestamp: Date.now()
//         });
//       }
      
//       // Set a timeout to prevent infinite searching
//       setTimeout(() => {
//         if (searching && !partnerRef.current) {
//           console.log('Search timeout - no partner found');
//           addNotification('No partner found. Please try again.', 'info');
//         }
//       }, 30000); // 30 second timeout
      
//     } catch (error) {
//       console.error('Failed to start search:', error);
//       addNotification('Camera/mic access required for video chat', 'error');
//     }
//   };

//   // Initialize local media
//   const initializeLocalMedia = async () => {
//     try {
//       setIsConnecting(true);
//       addDebugLog('Requesting camera/microphone access...', 'info');
      
//       const constraints = {
//         video: {
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: 'user',
//           frameRate: { ideal: 30 }
//         },
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       };
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       console.log('Local stream obtained:', stream);
//       addDebugLog('Camera/microphone access granted', 'success');
      
//       localStreamRef.current = stream;
//       setLocalVideoStream(stream);
      
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         localVideoRef.current.muted = true;
        
//         localVideoRef.current.onloadedmetadata = () => {
//           console.log('Local video metadata loaded');
//           localVideoRef.current.play().catch(e => console.error('Local video play error:', e));
//         };
//       }
      
//       setIsConnecting(false);
//       return stream;
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//       addDebugLog(`Media access error: ${error.message}`, 'error');
//       setIsConnecting(false);
      
//       // Show appropriate error message
//       if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
//         addNotification('No camera found. Please connect a camera.', 'error');
//       } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
//         addNotification('Camera is already in use by another application.', 'error');
//       } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
//         addNotification('Camera/microphone permission denied. Please enable permissions.', 'error');
//       } else {
//         addNotification(`Cannot access camera/microphone: ${error.message}`, 'error');
//       }
      
//       throw error;
//     }
//   };

//   // Start video call with partner
// // Update the startVideoCall function (around line 597):
// const startVideoCall = async () => {
//   console.log('=== startVideoCall called ===');
//   console.log('Current state:', {
//     partnerRef: partnerRef.current,
//     partner: partner,
//     socket: socketRef.current?.connected,
//     inCall,
//     isConnecting
//   });
  
//   try {
//     // Check if partner exists and has ID (check for both id and partnerId)
//     if (!partnerRef.current) {
//       addDebugLog('Cannot start call: No partner available', 'error');
      
//       // Wait for partner to be set
//       setTimeout(() => {
//         if (partnerRef.current) {
//           startVideoCall();
//         }
//       }, 1000);
//       return;
//     }
    
//     // Get partner ID from either partnerId or id property
//     // const partnerId = partnerRef.current.partnerId || partnerRef.current.id;

//     const partnerId = getPartnerId();

//     if (!partnerId) {
//       addDebugLog('Cannot start call: No partner ID available', 'error');
//       console.error('Partner object:', partnerRef.current);
      
//       // Wait and retry
//       setTimeout(() => {
//         if (partnerRef.current) {
//           startVideoCall();
//         }
//       }, 1000);
//       return;
//     }
    
//     console.log('Starting WebRTC call with partner ID:', partnerId);
//     addDebugLog(`Initializing WebRTC with partner: ${partnerId}`, 'info');
    
//     if (!socketRef.current || !socketRef.current.connected) {
//       addDebugLog('Socket not connected, waiting...', 'warning');
      
//       // Wait for socket connection
//       setTimeout(() => {
//         if (socketRef.current?.connected) {
//           startVideoCall();
//         }
//       }, 1000);
//       return;
//     }
    
//     setIsConnecting(true);
//     setConnectionStatus(CONNECTION_STATES.CONNECTING);
    
//     // Create peer connection
//     const pc = new RTCPeerConnection(ICE_SERVERS);
//     pcRef.current = pc;
    
//     // Add local stream tracks if available
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => {
//         try {
//           pc.addTrack(track, localStreamRef.current);
//           console.log(`Added ${track.kind} track to peer connection`);
//         } catch (error) {
//           console.error('Error adding track:', error);
//         }
//       });
//     } else {
//       // Initialize local media if not already done
//       try {
//         const stream = await initializeLocalMedia();
//         stream.getTracks().forEach(track => {
//           pc.addTrack(track, stream);
//         });
//       } catch (error) {
//         console.error('Failed to initialize local media:', error);
//         setIsConnecting(false);
//         return;
//       }
//     }
    
//     // Set up event handlers
//     pc.onicecandidate = (event) => {
//       if (event.candidate && socketRef.current?.connected && partnerId) {
//         console.log('Sending ICE candidate to:', partnerId);
//         socketRef.current.emit('webrtc-ice-candidate', {
//           to: partnerId,
//           candidate: event.candidate
//         });
//       }
//     };
    
//     pc.ontrack = (event) => {
//       console.log('Received remote track:', event);
//       if (event.streams && event.streams[0]) {
//         const remoteStream = event.streams[0];
//         setRemoteVideoStream(remoteStream);
        
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStream;
//           remoteVideoRef.current.onloadedmetadata = () => {
//             remoteVideoRef.current.play().catch(e => 
//               console.error('Remote video play error:', e)
//             );
//           };
//         }
//       }
//     };
    
//     pc.onconnectionstatechange = () => {
//       const state = pc.connectionState;
//       console.log('Connection state:', state);
//       setConnectionStatus(state);
      
//       switch(state) {
//         case 'connected':
//           console.log('WebRTC connection established!');
//           setInCall(true);
//           setIsConnecting(false);
//           addDebugLog('Video call connected!', 'success');
//           startCallTimer();
//           break;
          
//         case 'disconnected':
//         case 'failed':
//           console.log('Connection lost');
//           if (partnerRef.current) {
//             handleReconnect();
//           }
//           break;
          
//         case 'closed':
//           setInCall(false);
//           setIsConnecting(false);
//           setRemoteVideoStream(null);
//           break;
//       }
//     };
    
//     pc.oniceconnectionstatechange = () => {
//       console.log('ICE connection state:', pc.iceConnectionState);
//       if (pc.iceConnectionState === 'failed') {
//         handleReconnect();
//       }
//     };
    
//     pc.onicegatheringstatechange = () => {
//       console.log('ICE gathering state:', pc.iceGatheringState);
//     };
    
//     // Create and send offer
//     try {
//       const offer = await pc.createOffer({
//         offerToReceiveAudio: true,
//         offerToReceiveVideo: true
//       });
      
//       await pc.setLocalDescription(offer);
      
//       console.log('Sending WebRTC offer to partner:', partnerId);
//       socketRef.current.emit('webrtc-offer', {
//         to: partnerId,
//         sdp: offer,
//         metadata: {
//           username: userProfile?.username || 'Anonymous',
//           userId: userProfile?.id || 'unknown',
//           timestamp: Date.now()
//         }
//       });
      
//       addDebugLog('Call offer sent successfully', 'success');
      
//     } catch (error) {
//       console.error('Error creating/sending offer:', error);
//       addDebugLog(`Offer failed: ${error.message}`, 'error');
//       setIsConnecting(false);
//       setConnectionStatus(CONNECTION_STATES.FAILED);
//     }
    
//   } catch (error) {
//     console.error('Error starting video call:', error);
//     addDebugLog(`Call start failed: ${error.message}`, 'error');
//     setIsConnecting(false);
//     setConnectionStatus(CONNECTION_STATES.FAILED);
//     setHasError(true);
//     setErrorMessage(error.message);
//   }
// };

//   // Handle incoming call
// // Update the handleIncomingCall function (around line 740):
// const handleIncomingCall = async (offerSdp, fromPartnerId) => {
//   try {
//     addDebugLog(`Accepting incoming call from ${fromPartnerId}...`, 'info');
//     setIsConnecting(true);
    
//     // Ensure we have the partner reference
//     if (!partnerRef.current && fromPartnerId) {
//       partnerRef.current = {
//         partnerId: fromPartnerId,
//         id: fromPartnerId, // Add both for compatibility
//         profile: { username: 'Stranger' }
//       };
//     }
    
//     // Create peer connection
//     const pc = new RTCPeerConnection(ICE_SERVERS);
//     pcRef.current = pc;
    
//     // Add local stream if available
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => {
//         pc.addTrack(track, localStreamRef.current);
//       });
//     } else {
//       // Initialize local media
//       await initializeLocalMedia();
//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach(track => {
//           pc.addTrack(track, localStreamRef.current);
//         });
//       }
//     }
    
//     // Set up event handlers
//     pc.onicecandidate = (event) => {
//       if (event.candidate && socketRef.current?.connected && partnerRef.current) {
//         const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
//         if (partnerId) {
//           socketRef.current.emit('webrtc-ice-candidate', {
//             to: partnerId,
//             candidate: event.candidate
//           });
//         }
//       }
//     };
    
//     pc.ontrack = (event) => {
//       if (event.streams && event.streams[0]) {
//         const remoteStream = event.streams[0];
//         setRemoteVideoStream(remoteStream);
        
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStream;
//           remoteVideoRef.current.onloadedmetadata = () => {
//             remoteVideoRef.current.play().catch(e => 
//               console.error('Remote video play error:', e)
//             );
//           };
//         }
//       }
//     };
    
//     pc.onconnectionstatechange = () => {
//       const state = pc.connectionState;
//       setConnectionStatus(state);
      
//       if (state === 'connected') {
//         setInCall(true);
//         setIsConnecting(false);
//         addDebugLog('Incoming call accepted and connected', 'success');
//         startCallTimer();
//       } else if (state === 'failed' || state === 'disconnected') {
//         setIsConnecting(false);
//       }
//     };
    
//     // Set remote description and create answer
//     try {
//       await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
      
//       // Send answer back
//       const partnerId = partnerRef.current?.partnerId || partnerRef.current?.id || fromPartnerId;
//       if (socketRef.current && partnerId) {
//         console.log('Sending WebRTC answer to:', partnerId);
//         socketRef.current.emit('webrtc-answer', {
//           to: partnerId,
//           sdp: answer
//         });
//         addDebugLog('Call answer sent successfully', 'success');
//       } else {
//         console.error('Cannot send answer: missing socket or partner ID');
//       }
//     } catch (error) {
//       console.error('Error creating answer:', error);
//       throw error;
//     }
    
//   } catch (error) {
//     console.error('Error accepting incoming call:', error);
//     addDebugLog(`Failed to accept call: ${error.message}`, 'error');
//     setIsConnecting(false);
//     setConnectionStatus(CONNECTION_STATES.FAILED);
//   }
// };

//   // Handle reconnect
// // Update handleReconnect function (around line 780):
// const handleReconnect = () => {
//   if (reconnectTimerRef.current) {
//     clearTimeout(reconnectTimerRef.current);
//   }
  
//   reconnectTimerRef.current = setTimeout(() => {
//     if (partnerRef.current && socketRef.current?.connected) {
//       addDebugLog('Attempting to reconnect call...', 'info');
//       startVideoCall();
//     }
//   }, 2000);
// };

//   // Start call timer
//   const startCallTimer = () => {
//     const startTime = Date.now();
    
//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//     }
    
//     callTimerRef.current = setInterval(() => {
//       const duration = Math.floor((Date.now() - startTime) / 1000);
//       setCallDuration(duration);
//     }, 1000);
//   };

//   // Format time
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Handle end call
//   // Update handleEndCall function (around line 800):
// const handleEndCall = (notifyPartner = true) => {
//   try {
//     console.log('Ending call...');
//     addDebugLog('Ending video call...', 'info');
    
//     // Close peer connection
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }
    
//     // Notify partner
//     if (notifyPartner && socketRef.current && partnerRef.current) {
//       const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
//       if (partnerId) {
//         socketRef.current.emit('webrtc-end', {
//           to: partnerId,
//           reason: 'user_ended'
//         });
//       }
//     }
    
//     // Clear state
//     setInCall(false);
//     setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
//     setRemoteVideoStream(null);
//     setCallDuration(0);
    
//     // Clear call timer
//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//       callTimerRef.current = null;
//     }
    
//     // Stop local video
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = null;
//     }
    
//     // Stop remote video
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = null;
//     }
    
//     // Clear reconnect timer
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//     }
    
//   } catch (error) {
//     console.error('Error ending call:', error);
//   }
// };

//   // Toggle audio
//   const toggleAudio = () => {
//     if (localStreamRef.current) {
//       const audioTrack = localStreamRef.current.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setAudioEnabled(audioTrack.enabled);
//         addDebugLog(`Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`, 'info');
//       }
//     }
//   };

//   // Toggle video
//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       const videoTrack = localStreamRef.current.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setVideoEnabled(videoTrack.enabled);
//         addDebugLog(`Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`, 'info');
//       }
//     }
//   };

//   // Toggle screen share
//   const toggleScreenShare = async () => {
//     try {
//       if (!screenShareActive) {
//         // Start screen sharing
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//           audio: true
//         });
        
//         screenShareRef.current = screenStream;
        
//         // Replace video track
//         const videoTrack = screenStream.getVideoTracks()[0];
//         const sender = pcRef.current?.getSenders().find(s => 
//           s.track?.kind === 'video'
//         );
        
//         if (sender && videoTrack) {
//           sender.replaceTrack(videoTrack);
//           setScreenShareActive(true);
//           addDebugLog('Screen sharing started', 'success');
          
//           // Handle when user stops sharing via browser UI
//           screenStream.getVideoTracks()[0].onended = () => {
//             toggleScreenShare();
//           };
//         }
//       } else {
//         // Stop screen sharing
//         if (screenShareRef.current) {
//           screenShareRef.current.getTracks().forEach(track => track.stop());
//           screenShareRef.current = null;
//         }
        
//         setScreenShareActive(false);
        
//         // Restore camera
//         if (localStreamRef.current) {
//           const cameraTrack = localStreamRef.current.getVideoTracks()[0];
//           const sender = pcRef.current?.getSenders().find(s => 
//             s.track?.kind === 'video'
//           );
          
//           if (sender && cameraTrack) {
//             sender.replaceTrack(cameraTrack);
//             addDebugLog('Screen sharing stopped', 'info');
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Screen sharing error:', error);
//       addDebugLog(`Screen share failed: ${error.message}`, 'error');
//     }
//   };

//   // Cleanup media
//   const cleanupMedia = () => {
//     console.log('Cleaning up media resources...');
    
//     // Clear all timers
//     if (autoConnectTimerRef.current) {
//       clearTimeout(autoConnectTimerRef.current);
//     }
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//     }
//     if (swipeTimerRef.current) {
//       clearTimeout(swipeTimerRef.current);
//     }
//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//     }
    
//     // Stop and remove all media tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => {
//         track.stop();
//         track.enabled = false;
//       });
//       localStreamRef.current = null;
//       setLocalVideoStream(null);
//     }
    
//     // Stop screen share if active
//     if (screenShareRef.current) {
//       screenShareRef.current.getTracks().forEach(track => track.stop());
//       screenShareRef.current = null;
//       setScreenShareActive(false);
//     }
    
//     // Clean up peer connection
//     if (pcRef.current) {
//       pcRef.current.ontrack = null;
//       pcRef.current.onicecandidate = null;
//       pcRef.current.oniceconnectionstatechange = null;
//       pcRef.current.onconnectionstatechange = null;
//       pcRef.current.close();
//       pcRef.current = null;
//     }
    
//     // Clean video elements
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = null;
//     }
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = null;
//     }
    
//     setRemoteVideoStream(null);
//     setInCall(false);
//     setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
//   };

//   // Handle swipe to next partner
//   const handleSwipeToNext = () => {
//     console.log('Swiping to next partner...');
//     addDebugLog('Swipe detected - switching to next partner', 'info');
    
//     // End current call
//     handleEndCall(true);
    
//     // Disconnect from partner
//     disconnectPartner();
    
//     // Show swipe animation
//     setSwipeDirection('right');
//     setSwipeProgress(100);
    
//     // Start search for new partner
//     setTimeout(() => {
//       setSwipeDirection(null);
//       setSwipeProgress(0);
//       handleStartSearch();
//     }, 300);
//   };

//   // Initialize swipe gestures
//   useEffect(() => {
//     const element = swipeAreaRef.current;
//     if (!element) return;

//     let startX = 0;
//     let startY = 0;
//     let isSwiping = false;

//     const handleTouchStart = (e) => {
//       startX = e.touches[0].clientX;
//       startY = e.touches[0].clientY;
//       isSwiping = true;
//     };

//     const handleTouchMove = (e) => {
//       if (!isSwiping) return;
      
//       const currentX = e.touches[0].clientX;
//       const currentY = e.touches[0].clientY;
//       const deltaX = currentX - startX;
//       const deltaY = currentY - startY;
      
//       // Only consider horizontal swipes
//       if (Math.abs(deltaX) > Math.abs(deltaY)) {
//         e.preventDefault();
//         const progress = Math.min(Math.abs(deltaX) / 150, 1);
//         setSwipeProgress(progress);
        
//         if (deltaX > 0) {
//           setSwipeDirection('right');
//         } else {
//           setSwipeDirection('left');
//         }
//       }
//     };

//     const handleTouchEnd = () => {
//       if (!isSwiping) return;
      
//       if (swipeProgress > 0.5 && swipeDirection === 'right') {
//         handleSwipeToNext();
//       }
      
//       // Reset swipe state
//       setTimeout(() => {
//         setSwipeProgress(0);
//         setSwipeDirection(null);
//         isSwiping = false;
//       }, 200);
//     };

//     element.addEventListener('touchstart', handleTouchStart, { passive: false });
//     element.addEventListener('touchmove', handleTouchMove, { passive: false });
//     element.addEventListener('touchend', handleTouchEnd);

//     return () => {
//       element.removeEventListener('touchstart', handleTouchStart);
//       element.removeEventListener('touchmove', handleTouchMove);
//       element.removeEventListener('touchend', handleTouchEnd);
//     };
//   }, [swipeProgress, swipeDirection]);

//   // Hide swipe hint after 5 seconds
//   useEffect(() => {
//     if (swipeHintVisible) {
//       const timer = setTimeout(() => {
//         setSwipeHintVisible(false);
//       }, 5000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [swipeHintVisible]);

//   // Auto-scroll messages
//   useEffect(() => {
//     if (messageEndRef.current && messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   // Send message
//   const handleSendMessage = () => {
//     if (messageText.trim()) {
//       sendMessage(messageText);
//       setMessageText('');
//       setShowEmoji(false);
//     }
//   };

//   // Render connection status
//   const renderStatusIndicator = () => {
//     let statusText = '';
//     let statusColor = 'gray';
    
//     if (searching) {
//       statusText = `Searching... ${onlineCount} online`;
//       statusColor = 'blue';
//     } else if (isConnecting) {
//       statusText = 'Connecting...';
//       statusColor = 'yellow';
//     } else if (inCall) {
//       statusText = `Connected ${formatTime(callDuration)}`;
//       statusColor = 'green';
//     } else if (partner) {
//       statusText = 'Partner found';
//       statusColor = 'yellow';
//     } else {
//       statusText = 'Disconnected';
//       statusColor = 'red';
//     }
    
//     return (
//       <div className="status-indicator">
//         <div className={`status-dot ${statusColor}`} />
//         <span className="status-text">{statusText}</span>
//         {partner && !inCall && (
//           <span className="connecting-text">(Starting call...)</span>
//         )}
//       </div>
//     );
//   };

//   // Error boundary fallback
//   const ErrorFallback = () => (
//     <div className="video-error-fallback">
//       <div className="error-content">
//         <FaExclamationTriangle className="error-icon" />
//         <h3>Video Connection Error</h3>
//         <p>{errorMessage || 'Failed to establish video connection'}</p>
//         <div className="error-actions">
//           <button onClick={() => {
//             setHasError(false);
//             setErrorMessage('');
//             handleStartSearch();
//           }} className="retry-btn">
//             <FaRedoAlt /> Retry Connection
//           </button>
//           <button 
//             onClick={() => setCurrentScreen('home')}
//             className="home-btn"
//           >
//             <FaArrowLeft /> Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // Render debug panel
//   const DebugPanel = () => (
//     <div className="debug-panel">
//       <div className="debug-header">
//         <h4>Debug Info</h4>
//         <button onClick={() => setShowDebug(false)}>Hide</button>
//       </div>
//       <div className="debug-content">
//         <div className="debug-section">
//           <h5>Connection</h5>
//           <p>Status: {connectionStatus}</p>
//           <p>Partner: {partner?.profile?.username || 'None'}</p>
//           <p>Socket: {socket?.connected ? 'Connected' : 'Disconnected'}</p>
//           <p>In Call: {inCall ? 'Yes' : 'No'}</p>
//           <p>Call Duration: {formatTime(callDuration)}</p>
//         </div>
//         <div className="debug-section">
//           <h5>Media</h5>
//           <p>Local Stream: {localVideoStream ? 'Active' : 'Inactive'}</p>
//           <p>Remote Stream: {remoteVideoStream ? 'Active' : 'Inactive'}</p>
//           <p>Audio: {audioEnabled ? 'On' : 'Off'}</p>
//           <p>Video: {videoEnabled ? 'On' : 'Off'}</p>
//           <p>Screen Share: {screenShareActive ? 'On' : 'Off'}</p>
//         </div>
//         <div className="debug-logs">
//           <h5>Recent Logs</h5>
//           {debugLogs.slice(0, 5).map(log => (
//             <div key={log.id} className={`debug-log ${log.type}`}>
//               <span className="log-time">{log.timestamp}</span>
//               <span className="log-message">{log.message}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   // Main render
//   if (hasError) {
//     return <ErrorFallback />;
//   }

//   return (
//     <div className="omegle-video-container">
//       {/* Connection Status Banner */}
//       <div className="connection-status-banner">
//         {!socket?.connected && (
//           <div className="socket-disconnected">
//             <FaBolt /> Connecting to server...
//           </div>
//         )}
        
//         {socket?.connected && !partner && !searching && (
//           <div className="ready-to-search">
//             <FaSearch /> Ready to find a partner
//           </div>
//         )}
        
//         {searching && (
//           <div className="searching-status">
//             <div className="searching-spinner"></div>
//             Searching for partner... ({onlineCount} online)
//           </div>
//         )}
        
//         {partner && !inCall && (
//           <div className="partner-found">
//             <FaUserFriends /> Found: {partner.profile?.username || 'Stranger'} 
//             {isConnecting ? ' (Connecting...)' : ''}
//           </div>
//         )}
//       </div>

//       {/* Debug Toggle */}
//       {process.env.NODE_ENV === 'development' && (
//         <button 
//           className="debug-toggle-btn"
//           onClick={() => setShowDebug(!showDebug)}
//         >
//           Debug
//         </button>
//       )}

//       {/* Debug Panel */}
//       {showDebug && <DebugPanel />}

//       {/* Connection Debug Display */}
//       <div className="connection-debug">
//         <div className="debug-item">
//           <span>Socket:</span>
//           <span className={socket?.connected ? 'connected' : 'disconnected'}>
//             {socket?.connected ? 'Connected' : 'Disconnected'}
//           </span>
//         </div>
//         <div className="debug-item">
//           <span>Partner:</span>
//           <span className={partner ? 'has-partner' : 'no-partner'}>
//             {partner ? partner.profile?.username || 'Stranger' : 'None'}
//           </span>
//         </div>
//         <div className="debug-item">
//           <span>Searching:</span>
//           <span className={searching ? 'searching' : 'not-searching'}>
//             {searching ? 'Yes' : 'No'}
//           </span>
//         </div>
//         <div className="debug-item">
//           <span>In Call:</span>
//           <span className={inCall ? 'in-call' : 'not-in-call'}>
//             {inCall ? 'Yes' : 'No'}
//           </span>
//         </div>
//       </div>

//       {/* Swipe Area */}
//       <div 
//         ref={swipeAreaRef}
//         className={`video-swipe-area ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
//         style={{
//           transform: swipeDirection === 'right' ? `translateX(${swipeProgress * 100}px)` : 
//                     swipeDirection === 'left' ? `translateX(-${swipeProgress * 100}px)` : 'none',
//           opacity: 1 - swipeProgress * 0.5
//         }}
//       >
//         {/* Remote Video */}
//         <div className="remote-video-container">
//           <video 
//             ref={remoteVideoRef} 
//             autoPlay 
//             playsInline 
//             className="remote-video"
//           />
          
//           {!remoteVideoStream && !isConnecting && (
//             <div className="video-placeholder">
//               <FaUserFriends className="placeholder-icon" />
//               <p>Waiting for partner...</p>
//             </div>
//           )}
          
//           {isConnecting && (
//             <div className="connecting-overlay">
//               <div className="connecting-spinner"></div>
//               <p>Connecting...</p>
//             </div>
//           )}
//         </div>

//         {/* Local Video */}
//         <div className="local-video-pip">
//           <video 
//             ref={localVideoRef} 
//             autoPlay 
//             muted 
//             playsInline 
//             className="local-video"
//           />
//           {!audioEnabled && <div className="mute-indicator">🔇</div>}
//           {screenShareActive && <div className="screen-share-indicator">🖥️</div>}
//         </div>

//         {/* Swipe Hint */}
//         {swipeHintVisible && partner && (
//           <div className="swipe-hint">
//             <FaChevronRight className="swipe-icon" />
//             <span>Swipe right to skip</span>
//           </div>
//         )}
//       </div>

//       {/* Top Controls */}
//       <div className="top-controls">
//         <button 
//           className="control-btn back-btn"
//           onClick={() => {
//             handleEndCall(true);
//             setCurrentScreen('home');
//           }}
//         >
//           <FaArrowLeft />
//         </button>
        
//         <div className="connection-info">
//           {renderStatusIndicator()}
//           {inCall && (
//             <div className="call-timer">
//               <span className="timer-icon">⏱️</span>
//               {formatTime(callDuration)}
//             </div>
//           )}
//         </div>
        
//         <div className="online-count">
//           <FaUsers />
//           <span>{onlineCount} online</span>
//         </div>
//       </div>

//       {/* Call Controls */}
//       <div className="call-controls">
//         <button 
//           className={`control-btn ${!audioEnabled ? 'active' : ''}`}
//           onClick={toggleAudio}
//         >
//           {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
//         </button>
        
//         <button 
//           className={`control-btn ${!videoEnabled ? 'active' : ''}`}
//           onClick={toggleVideo}
//         >
//           {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
//         </button>
        
//         <button 
//           className={`control-btn ${screenShareActive ? 'active' : ''}`}
//           onClick={toggleScreenShare}
//         >
//           <FaDesktop />
//         </button>
        
//         <button 
//           className="control-btn skip-btn"
//           onClick={handleSwipeToNext}
//           disabled={!partner}
//         >
//           <FaSyncAlt />
//           <span className="btn-label">Skip</span>
//         </button>
        
//         <button 
//           className="control-btn end-call-btn"
//           onClick={() => handleEndCall(true)}
//         >
//           <FaPhoneSlash />
//           <span className="btn-label">End</span>
//         </button>
//       </div>

//       {/* Search/Connect Controls */}
//       {(!partner || !inCall) && (
//         <div className="search-controls">
//           {searching ? (
//             <div className="searching-indicator">
//               <div className="searching-spinner"></div>
//               <p>Searching for partner... {onlineCount} online</p>
//               <button 
//                 className="cancel-search-btn"
//                 onClick={() => {
//                   // Cancel search if context provides a way
//                   if (socketRef.current) {
//                     socketRef.current.emit('cancel-search');
//                   }
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           ) : (
//             <button 
//               className="start-search-btn"
//               onClick={handleStartSearch}
//               disabled={isConnecting}
//             >
//               <FaSearch />
//               <span>{partner ? 'Reconnect' : 'Find Partner'}</span>
//             </button>
//           )}
//         </div>
//       )}

//       {/* Partner Info */}
//       {partner && (
//         <div className="partner-info">
//           <div className="partner-name">
//             {partner.profile?.username || 'Stranger'}
//             {connectionStatus === 'connected' && (
//               <span className="online-badge">● Online</span>
//             )}
//           </div>
//           <div className="partner-interests">
//             {partner.profile?.interests?.slice(0, 3).map((interest, idx) => (
//               <span key={idx} className="interest-tag">{interest}</span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Chat Drawer */}
//       <div className={`chat-drawer ${showEmoji ? 'expanded' : ''}`}>
//         <div className="chat-header">
//           <h4>Chat</h4>
//           <button 
//             className="emoji-toggle-btn"
//             onClick={() => setShowEmoji(!showEmoji)}
//           >
//             <FaSmile />
//           </button>
//         </div>
        
//         <div 
//           className="messages-container"
//           ref={messagesContainerRef}
//         >
//           {messages.map((msg, idx) => (
//             <div key={idx} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
//               <div className="message-content">{msg.text}</div>
//               <div className="message-time">
//                 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </div>
//             </div>
//           ))}
//           <div ref={messageEndRef} />
//         </div>
        
//         <div className="message-input-container">
//           <input
//             type="text"
//             value={messageText}
//             onChange={(e) => setMessageText(e.target.value)}
//             onFocus={handleTypingStart}
//             onBlur={handleTypingStop}
//             placeholder="Type a message..."
//             className="message-input"
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//           />
//           <button 
//             className="send-btn"
//             onClick={handleSendMessage}
//             disabled={!messageText.trim()}
//           >
//             <FaPaperPlane />
//           </button>
//         </div>
        
//         {showEmoji && (
//           <div className="emoji-picker">
//             <EmojiPicker
//               onEmojiClick={(emojiData) => {
//                 setMessageText(prev => prev + emojiData.emoji);
//                 setShowEmoji(false);
//               }}
//               height={300}
//               width="100%"
//             />
//           </div>
//         )}
//       </div>

//       {/* Auto-search toggle */}
//       <div className="auto-search-toggle">
//         <label>
//           <input
//             type="checkbox"
//             checked={autoSearch}
//             onChange={(e) => setAutoSearch(e.target.checked)}
//           />
//           <span>Auto-search for new partners</span>
//         </label>
//       </div>
//     </div>
//   );
// };

// export default VideoChatScreen;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FaArrowLeft, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaPhoneSlash, FaPaperPlane, FaSyncAlt, FaDesktop, FaRedoAlt,
  FaSmile, FaMagic, FaLanguage, FaRandom, FaHeart,
  FaFire, FaBolt, FaGhost, FaUserFriends, FaSearch,
  FaChevronRight, FaChevronLeft, FaUsers, FaGlobe,
  FaExpand, FaCompress, FaShareAlt, FaEllipsisV, FaExclamationTriangle,
  FaComment
} from 'react-icons/fa';
import { GiSoundWaves } from 'react-icons/gi';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../context/ChatContext';
import './OmegleMobile.css';
// ICE servers configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
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
const VideoChatScreen = () => {
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

const getPartnerId = () => {
  if (!partnerRef.current) return null;
  return partnerRef.current.partnerId || partnerRef.current.id;
};
 
  // Initialize refs
  useEffect(() => {
    socketRef.current = socket;
    console.log('Socket ref updated:', socket?.id);
  }, [socket]);
  useEffect(() => {
    partnerRef.current = partner;
    console.log('Partner ref updated:', partner);
  }, [partner]);
  // Component mount/unmount
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);
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
   
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
   
    if (type === 'error') {
      addNotification(message, 'error');
    }
  }, [isMounted, addNotification]);
  // Listen for video match events from ChatContext
  useEffect(() => {
    const handleVideoMatch = (event) => {
      console.log('Video match event received:', event.detail);
      const matchedPartner = event.detail?.partner;
     
      if (matchedPartner && matchedPartner.id !== partnerRef.current?.id) {
        console.log('Setting partner from match event:', matchedPartner);
        addDebugLog('Partner matched via event, starting call...', 'info');
       
        // Update partner ref immediately
        partnerRef.current = matchedPartner;
       
        // Start video call after short delay
        setTimeout(() => {
          if (!inCall && !isConnecting && socketRef.current?.connected) {
            console.log('Starting video call from match event');
            startVideoCall();
          }
        }, 300);
      }
    };
    window.addEventListener('video-match', handleVideoMatch);
   
    return () => {
      window.removeEventListener('video-match', handleVideoMatch);
    };
  }, [inCall, isConnecting, addDebugLog]);
  // Handle when partner updates from context
  useEffect(() => {
    console.log('Partner context updated in VideoChatScreen:', partner);
   
    if (partner) {
      // Update partner ref
      partnerRef.current = partner;
     
      // If this is a video chat and we're not already in a call, start it
      if (currentChatMode === 'video' && !inCall && !isConnecting) {
        console.log('Starting video call from partner update');
        addDebugLog('Partner found, starting video call...', 'info');
       
        // Small delay to ensure everything is ready
        setTimeout(() => {
          if (partnerRef.current?.id && socketRef.current?.connected) {
            startVideoCall();
          }
        }, 1000);
      }
    } else {
      // Partner disconnected or cleared
      console.log('Partner cleared');
      partnerRef.current = null;
      setRemoteVideoStream(null);
     
      // Auto-search if enabled
      if (autoSearch && !searching && socketRef.current?.connected) {
        setTimeout(() => {
          handleStartSearch();
        }, 1000);
      }
    }
  }, [partner, currentChatMode, inCall, isConnecting, autoSearch, searching, addDebugLog]);
  // Auto-start video call when conditions are met
  useEffect(() => {
    const checkAndStartCall = () => {
      console.log('Checking if should start video call:', {
        partner: partnerRef.current,
        inCall,
        isConnecting,
        currentChatMode,
        socketConnected: socketRef.current?.connected
      });
     
      if (partnerRef.current &&
          currentChatMode === 'video' &&
          !inCall &&
          !isConnecting &&
          socketRef.current?.connected) {
       
        console.log('Conditions met, starting video call');
        addDebugLog('Partner ready, initiating video call...', 'info');
       
        // Clear any existing timeout
        if (autoConnectTimerRef.current) {
          clearTimeout(autoConnectTimerRef.current);
        }
       
        // Start call with small delay
        autoConnectTimerRef.current = setTimeout(() => {
          if (partnerRef.current?.id && !inCall && !isConnecting) {
            console.log('Executing startVideoCall');
            startVideoCall();
          }
        }, 500);
      }
    };
   
    // Check immediately
    checkAndStartCall();
   
    return () => {
      if (autoConnectTimerRef.current) {
        clearTimeout(autoConnectTimerRef.current);
      }
    };
  }, [inCall, isConnecting, currentChatMode, addDebugLog]);
  // Auto-search for new partner when disconnected
  useEffect(() => {
    if (!partner && autoSearch && !searching && inCall) {
      console.log('Partner disconnected, auto-searching for new partner...');
      addDebugLog('Auto-searching for new partner...', 'info');
     
      // Clear call state
      setInCall(false);
      setConnectionStatus(CONNECTION_STATES.SEARCHING);
     
      // Start search after short delay
      setTimeout(() => {
        handleStartSearch();
      }, 1000);
    }
  }, [partner, autoSearch, searching, inCall, addDebugLog]);
  // Initial setup
  useEffect(() => {
    console.log('VideoChatScreen mounted');
    addDebugLog('Component mounted', 'info');
   
    const initialize = async () => {
      // Wait for socket connection
      if (!socketRef.current?.connected) {
        console.log('Waiting for socket connection...');
        addDebugLog('Waiting for socket connection...', 'info');
       
        const checkSocket = setInterval(() => {
          if (socketRef.current?.connected) {
            clearInterval(checkSocket);
            console.log('Socket connected, proceeding...');
            handleStartSearch();
          }
        }, 500);
        return;
      }
     
      // If already have a partner from context, don't search
      if (partnerRef.current) {
        console.log('Already have partner from context:', partnerRef.current);
        // Wait a moment then start video call
        setTimeout(() => {
          if (!inCall && !isConnecting) {
            startVideoCall();
          }
        }, 1000);
      } else if (!searching) {
        // Start search if not already searching
        console.log('No partner, starting search...');
        handleStartSearch();
      }
    };
    initialize();
    return () => {
      console.log('VideoChatScreen cleanup');
      cleanupMedia();
      if (autoConnectTimerRef.current) {
        clearTimeout(autoConnectTimerRef.current);
      }
    };
  }, []);
  // Socket event handlers
  useEffect(() => {
    if (!socketRef.current) return;
   
    console.log('Setting up socket event handlers in VideoChatScreen');
   
    const handleConnect = () => {
      console.log('Socket connected in VideoChatScreen');
      addDebugLog('Socket connected', 'success');
     
      // If we have a partner but no call, try to start call
      if (partnerRef.current?.id && !inCall && !isConnecting) {
        setTimeout(() => {
          startVideoCall();
        }, 1000);
      }
    };
   
    const handleDisconnect = () => {
      console.log('Socket disconnected in VideoChatScreen');
      addDebugLog('Socket disconnected', 'error');
      setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
      setInCall(false);
    };
   
    const handleMatched = (data) => {
      console.log('Matched event received in VideoChatScreen:', data);
      addDebugLog(`Matched with partner: ${data.profile?.username || 'Stranger'}`, 'success');
     
      // Update partner ref immediately
      partnerRef.current = data;
     
      // Start video call after short delay
      setTimeout(() => {
        if (partnerRef.current?.id && !inCall && !isConnecting) {
          console.log('Auto-starting call after match');
          startVideoCall();
        }
      }, 500);
    };
   
    const handleSearching = () => {
      console.log('Searching event received');
      setConnectionStatus(CONNECTION_STATES.SEARCHING);
    };
   
    // Listen to socket events
    const socket = socketRef.current;
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('matched', handleMatched);
    socket.on('searching', handleSearching);
   
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('matched', handleMatched);
      socket.off('searching', handleSearching);
    };
  }, [inCall, isConnecting, addDebugLog]);
  // WebRTC signaling handlers
// Update the WebRTC event handlers (around line 350):
useEffect(() => {
  if (!socketRef.current) {
    console.log('Socket ref not available for WebRTC');
    return;
  }
  const handleWebRTCOffer = async (data) => {
    console.log('Received WebRTC offer:', data);
    addDebugLog(`Received call offer from ${data.from || 'unknown'}`, 'info');
   
    // Validate data
    if (!data.sdp || !data.from) {
      console.error('Invalid offer data:', data);
      addDebugLog('Invalid offer data received', 'error');
      return;
    }
   
    // Update partner info if needed
    if (data.metadata && !partnerRef.current) {
      console.log('Setting partner from offer metadata');
      partnerRef.current = {
        partnerId: data.from,
        id: data.from, // Add both for compatibility
        profile: data.metadata
      };
    }
   
    // Accept incoming call
    if (!pcRef.current) {
      await handleIncomingCall(data.sdp, data.from);
    } else {
      console.log('Already in a call, ignoring offer');
    }
  };
  const handleWebRTCAnswer = async (data) => {
    console.log('Received WebRTC answer:', data);
    addDebugLog('Received call answer from partner', 'info');
   
    if (!pcRef.current || !data.sdp) {
      console.error('No peer connection or invalid answer');
      return;
    }
   
    if (pcRef.current.signalingState === 'have-local-offer') {
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        addDebugLog('Remote description set successfully', 'success');
      } catch (error) {
        console.error('Error setting remote description:', error);
        addDebugLog(`Failed to set remote description: ${error.message}`, 'error');
      }
    } else {
      console.warn('Unexpected signaling state:', pcRef.current.signalingState);
    }
  };
  const handleWebRTCIceCandidate = (data) => {
    console.log('Received ICE candidate from:', data.from);
    if (pcRef.current && data.candidate) {
      try {
        pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(err => console.error('Error adding ICE candidate:', err));
      } catch (error) {
        console.error('Error processing ICE candidate:', error);
      }
    }
  };
  const handleWebRTCEnd = (data) => {
    console.log('Partner ended the call:', data);
    addDebugLog('Partner ended the call', 'info');
    handleEndCall(false);
   
    // Auto-search for new partner if enabled
    if (autoSearch) {
      setTimeout(() => {
        handleStartSearch();
      }, 1000);
    }
  };
  const handleWebRTCError = (data) => {
    console.error('WebRTC error from server:', data);
    addDebugLog(`WebRTC error: ${data.error || 'Unknown'}`, 'error');
  };
  // Set up socket listeners
  const socket = socketRef.current;
  socket.on('webrtc-offer', handleWebRTCOffer);
  socket.on('webrtc-answer', handleWebRTCAnswer);
  socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
  socket.on('webrtc-end', handleWebRTCEnd);
  socket.on('webrtc-error', handleWebRTCError);
  return () => {
    socket.off('webrtc-offer', handleWebRTCOffer);
    socket.off('webrtc-answer', handleWebRTCAnswer);
    socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
    socket.off('webrtc-end', handleWebRTCEnd);
    socket.off('webrtc-error', handleWebRTCError);
  };
}, [autoSearch, addDebugLog]);
  // Handle starting search
  const handleStartSearch = async () => {
    console.log('=== handleStartSearch ===');
    console.log('Current state:', { searching, partner: partnerRef.current, socketConnected: socketRef.current?.connected });
   
    if (searching) {
      console.log('Already searching, skipping...');
      return;
    }
   
    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket not connected');
      addNotification('Please wait for connection...', 'error');
      return;
    }
   
    console.log('Starting video chat search...');
    addDebugLog('Starting video partner search...', 'info');
    setConnectionStatus(CONNECTION_STATES.SEARCHING);
   
    try {
      // First initialize local media
      await initializeLocalMedia();
     
      console.log('Local media ready, starting search...');
     
      // Call the context's startSearch function
      startSearch('video');
     
      // Also emit search via socket directly as backup
      if (socketRef.current.connected && userProfile) {
        console.log('Emitting direct search event');
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
     
      // Set a timeout to prevent infinite searching
      setTimeout(() => {
        if (searching && !partnerRef.current) {
          console.log('Search timeout - no partner found');
          addNotification('No partner found. Please try again.', 'info');
        }
      }, 30000); // 30 second timeout
     
    } catch (error) {
      console.error('Failed to start search:', error);
      addNotification('Camera/mic access required for video chat', 'error');
    }
  };
  // Initialize local media
  const initializeLocalMedia = async () => {
    try {
      setIsConnecting(true);
      addDebugLog('Requesting camera/microphone access...', 'info');
     
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: cameraFacing,
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
     
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream obtained:', stream);
      addDebugLog('Camera/microphone access granted', 'success');
     
      localStreamRef.current = stream;
      setLocalVideoStream(stream);
     
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
       
        localVideoRef.current.onloadedmetadata = () => {
          console.log('Local video metadata loaded');
          localVideoRef.current.play().catch(e => console.error('Local video play error:', e));
        };
      }
     
      setIsConnecting(false);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      addDebugLog(`Media access error: ${error.message}`, 'error');
      setIsConnecting(false);
     
      // Show appropriate error message
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        addNotification('No camera found. Please connect a camera.', 'error');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        addNotification('Camera is already in use by another application.', 'error');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        addNotification('Camera/microphone permission denied. Please enable permissions.', 'error');
      } else {
        addNotification(`Cannot access camera/microphone: ${error.message}`, 'error');
      }
     
      throw error;
    }
  };
  // Start video call with partner
// Update the startVideoCall function (around line 597):
const startVideoCall = async () => {
  console.log('=== startVideoCall called ===');
  console.log('Current state:', {
    partnerRef: partnerRef.current,
    partner: partner,
    socket: socketRef.current?.connected,
    inCall,
    isConnecting
  });
 
  try {
    // Check if partner exists and has ID (check for both id and partnerId)
    if (!partnerRef.current) {
      addDebugLog('Cannot start call: No partner available', 'error');
     
      // Wait for partner to be set
      setTimeout(() => {
        if (partnerRef.current) {
          startVideoCall();
        }
      }, 1000);
      return;
    }
   
    // Get partner ID from either partnerId or id property
    // const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
    const partnerId = getPartnerId();
    if (!partnerId) {
      addDebugLog('Cannot start call: No partner ID available', 'error');
      console.error('Partner object:', partnerRef.current);
     
      // Wait and retry
      setTimeout(() => {
        if (partnerRef.current) {
          startVideoCall();
        }
      }, 1000);
      return;
    }
   
    console.log('Starting WebRTC call with partner ID:', partnerId);
    addDebugLog(`Initializing WebRTC with partner: ${partnerId}`, 'info');
   
    if (!socketRef.current || !socketRef.current.connected) {
      addDebugLog('Socket not connected, waiting...', 'warning');
     
      // Wait for socket connection
      setTimeout(() => {
        if (socketRef.current?.connected) {
          startVideoCall();
        }
      }, 1000);
      return;
    }
   
    setIsConnecting(true);
    setConnectionStatus(CONNECTION_STATES.CONNECTING);
   
    // Create peer connection
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
   
    // Add local stream tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current);
          console.log(`Added ${track.kind} track to peer connection`);
        } catch (error) {
          console.error('Error adding track:', error);
        }
      });
    } else {
      // Initialize local media if not already done
      try {
        const stream = await initializeLocalMedia();
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      } catch (error) {
        console.error('Failed to initialize local media:', error);
        setIsConnecting(false);
        return;
      }
    }
   
    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.connected && partnerId) {
        console.log('Sending ICE candidate to:', partnerId);
        socketRef.current.emit('webrtc-ice-candidate', {
          to: partnerId,
          candidate: event.candidate
        });
      }
    };
   
    pc.ontrack = (event) => {
      console.log('Received remote track:', event);
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        setRemoteVideoStream(remoteStream);
       
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current.play().catch(e =>
              console.error('Remote video play error:', e)
            );
          };
        }
      }
    };
   
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('Connection state:', state);
      setConnectionStatus(state);
     
      switch(state) {
        case 'connected':
          console.log('WebRTC connection established!');
          setInCall(true);
          setIsConnecting(false);
          addDebugLog('Video call connected!', 'success');
          startCallTimer();
          break;
         
        case 'disconnected':
        case 'failed':
          console.log('Connection lost');
          if (partnerRef.current) {
            handleReconnect();
          }
          break;
         
        case 'closed':
          setInCall(false);
          setIsConnecting(false);
          setRemoteVideoStream(null);
          break;
      }
    };
   
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        handleReconnect();
      }
    };
   
    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };
   
    // Create and send offer
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
     
      await pc.setLocalDescription(offer);
     
      console.log('Sending WebRTC offer to partner:', partnerId);
      socketRef.current.emit('webrtc-offer', {
        to: partnerId,
        sdp: offer,
        metadata: {
          username: userProfile?.username || 'Anonymous',
          userId: userProfile?.id || 'unknown',
          timestamp: Date.now()
        }
      });
     
      addDebugLog('Call offer sent successfully', 'success');
     
    } catch (error) {
      console.error('Error creating/sending offer:', error);
      addDebugLog(`Offer failed: ${error.message}`, 'error');
      setIsConnecting(false);
      setConnectionStatus(CONNECTION_STATES.FAILED);
    }
   
  } catch (error) {
    console.error('Error starting video call:', error);
    addDebugLog(`Call start failed: ${error.message}`, 'error');
    setIsConnecting(false);
    setConnectionStatus(CONNECTION_STATES.FAILED);
    setHasError(true);
    setErrorMessage(error.message);
  }
};
  // Handle incoming call
// Update the handleIncomingCall function (around line 740):
const handleIncomingCall = async (offerSdp, fromPartnerId) => {
  try {
    addDebugLog(`Accepting incoming call from ${fromPartnerId}...`, 'info');
    setIsConnecting(true);
   
    // Ensure we have the partner reference
    if (!partnerRef.current && fromPartnerId) {
      partnerRef.current = {
        partnerId: fromPartnerId,
        id: fromPartnerId, // Add both for compatibility
        profile: { username: 'Stranger' }
      };
    }
   
    // Create peer connection
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
   
    // Add local stream if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      // Initialize local media
      await initializeLocalMedia();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }
    }
   
    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.connected && partnerRef.current) {
        const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
        if (partnerId) {
          socketRef.current.emit('webrtc-ice-candidate', {
            to: partnerId,
            candidate: event.candidate
          });
        }
      }
    };
   
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        setRemoteVideoStream(remoteStream);
       
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current.play().catch(e =>
              console.error('Remote video play error:', e)
            );
          };
        }
      }
    };
   
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
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
   
    // Set remote description and create answer
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
     
      // Send answer back
      const partnerId = partnerRef.current?.partnerId || partnerRef.current?.id || fromPartnerId;
      if (socketRef.current && partnerId) {
        console.log('Sending WebRTC answer to:', partnerId);
        socketRef.current.emit('webrtc-answer', {
          to: partnerId,
          sdp: answer
        });
        addDebugLog('Call answer sent successfully', 'success');
      } else {
        console.error('Cannot send answer: missing socket or partner ID');
      }
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
   
  } catch (error) {
    console.error('Error accepting incoming call:', error);
    addDebugLog(`Failed to accept call: ${error.message}`, 'error');
    setIsConnecting(false);
    setConnectionStatus(CONNECTION_STATES.FAILED);
  }
};
  // Handle reconnect
// Update handleReconnect function (around line 780):
const handleReconnect = () => {
  if (reconnectTimerRef.current) {
    clearTimeout(reconnectTimerRef.current);
  }
 
  reconnectTimerRef.current = setTimeout(() => {
    if (partnerRef.current && socketRef.current?.connected) {
      addDebugLog('Attempting to reconnect call...', 'info');
      startVideoCall();
    }
  }, 2000);
};
  // Start call timer
  const startCallTimer = () => {
    const startTime = Date.now();
   
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
   
    callTimerRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setCallDuration(duration);
    }, 1000);
  };
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  // Handle end call
  // Update handleEndCall function (around line 800):
const handleEndCall = (notifyPartner = true) => {
  try {
    console.log('Ending call...');
    addDebugLog('Ending video call...', 'info');
   
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
   
    // Notify partner
    if (notifyPartner && socketRef.current && partnerRef.current) {
      const partnerId = partnerRef.current.partnerId || partnerRef.current.id;
      if (partnerId) {
        socketRef.current.emit('webrtc-end', {
          to: partnerId,
          reason: 'user_ended'
        });
      }
    }
   
    // Clear state
    setInCall(false);
    setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
    setRemoteVideoStream(null);
    setCallDuration(0);
   
    // Clear call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
   
    // Stop local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
   
    // Stop remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
   
    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
   
  } catch (error) {
    console.error('Error ending call:', error);
  }
};
  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        addDebugLog(`Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`, 'info');
      }
    }
  };
  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        addDebugLog(`Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`, 'info');
      }
    }
  };
  // Toggle camera facing
  const toggleCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);

    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { facingMode: newFacing },
        audio: true
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = newStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newStream.getVideoTracks()[0]);
      }
      addDebugLog(`Camera flipped to ${newFacing}`, 'info');
    } catch (error) {
      console.error('Error flipping camera:', error);
      addDebugLog(`Camera flip failed: ${error.message}`, 'error');
    }
  };
  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      if (!screenShareActive) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
       
        screenShareRef.current = screenStream;
       
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current?.getSenders().find(s =>
          s.track?.kind === 'video'
        );
       
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
          setScreenShareActive(true);
          addDebugLog('Screen sharing started', 'success');
         
          // Handle when user stops sharing via browser UI
          screenStream.getVideoTracks()[0].onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        // Stop screen sharing
        if (screenShareRef.current) {
          screenShareRef.current.getTracks().forEach(track => track.stop());
          screenShareRef.current = null;
        }
       
        setScreenShareActive(false);
       
        // Restore camera
        if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = pcRef.current?.getSenders().find(s =>
            s.track?.kind === 'video'
          );
         
          if (sender && cameraTrack) {
            sender.replaceTrack(cameraTrack);
            addDebugLog('Screen sharing stopped', 'info');
          }
        }
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      addDebugLog(`Screen share failed: ${error.message}`, 'error');
    }
  };
  // Toggle fullscreen
  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  // Cleanup media
  const cleanupMedia = () => {
    console.log('Cleaning up media resources...');
   
    // Clear all timers
    if (autoConnectTimerRef.current) {
      clearTimeout(autoConnectTimerRef.current);
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    if (swipeTimerRef.current) {
      clearTimeout(swipeTimerRef.current);
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
   
    // Stop and remove all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
      setLocalVideoStream(null);
    }
   
    // Stop screen share if active
    if (screenShareRef.current) {
      screenShareRef.current.getTracks().forEach(track => track.stop());
      screenShareRef.current = null;
      setScreenShareActive(false);
    }
   
    // Clean up peer connection
    if (pcRef.current) {
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
  };
  // Handle swipe to next partner
  const handleSwipeToNext = () => {
    console.log('Swiping to next partner...');
    addDebugLog('Swipe detected - switching to next partner', 'info');
   
    // End current call
    handleEndCall(true);
   
    // Disconnect from partner
    disconnectPartner();
   
    // Show swipe animation
    setSwipeDirection('right');
    setSwipeProgress(100);
   
    // Start search for new partner
    setTimeout(() => {
      setSwipeDirection(null);
      setSwipeProgress(0);
      handleStartSearch();
    }, 300);
  };
  // Initialize swipe gestures
  useEffect(() => {
    const element = swipeAreaRef.current;
    if (!element) return;
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    };
    const handleTouchMove = (e) => {
      if (!isSwiping) return;
     
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
     
      // Only consider horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        const progress = Math.min(Math.abs(deltaX) / 150, 1);
        setSwipeProgress(progress);
       
        if (deltaX > 0) {
          setSwipeDirection('right');
        } else {
          setSwipeDirection('left');
        }
      }
    };
    const handleTouchEnd = () => {
      if (!isSwiping) return;
     
      if (swipeProgress > 0.5 && swipeDirection === 'right') {
        handleSwipeToNext();
      }
     
      // Reset swipe state
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
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeProgress, swipeDirection]);
  // Hide swipe hint after 5 seconds
  useEffect(() => {
    if (swipeHintVisible) {
      const timer = setTimeout(() => {
        setSwipeHintVisible(false);
      }, 5000);
     
      return () => clearTimeout(timer);
    }
  }, [swipeHintVisible]);
  // Auto-scroll messages
  useEffect(() => {
    if (messageEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  // Send message
  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
      setShowEmoji(false);
    }
  };
  // Send like
  const handleLike = () => {
    sendMessage('❤️');
  };
  // Render connection status
  const renderStatusIndicator = () => {
    let statusText = '';
    let statusColor = 'gray';
   
    if (searching) {
      statusText = `Searching... ${onlineCount} online`;
      statusColor = 'blue';
    } else if (isConnecting) {
      statusText = 'Connecting...';
      statusColor = 'yellow';
    } else if (inCall) {
      statusText = `Connected ${formatTime(callDuration)}`;
      statusColor = 'green';
    } else if (partner) {
      statusText = 'Partner found';
      statusColor = 'yellow';
    } else {
      statusText = 'Disconnected';
      statusColor = 'red';
    }
   
    return (
      <div className="status-indicator">
        <div className={`status-dot ${statusColor}`} />
        <span className="status-text">{statusText}</span>
        {partner && !inCall && (
          <span className="connecting-text">(Starting call...)</span>
        )}
      </div>
    );
  };
  // Error boundary fallback
  const ErrorFallback = () => (
    <div className="video-error-fallback">
      <div className="error-content">
        <FaExclamationTriangle className="error-icon" />
        <h3>Video Connection Error</h3>
        <p>{errorMessage || 'Failed to establish video connection'}</p>
        <div className="error-actions">
          <button onClick={() => {
            setHasError(false);
            setErrorMessage('');
            handleStartSearch();
          }} className="retry-btn">
            <FaRedoAlt /> Retry Connection
          </button>
          <button
            onClick={() => setCurrentScreen('home')}
            className="home-btn"
          >
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
  // Render debug panel
  const DebugPanel = () => (
    <div className="debug-panel">
      <div className="debug-header">
        <h4>Debug Info</h4>
        <button onClick={() => setShowDebug(false)}>Hide</button>
      </div>
      <div className="debug-content">
        <div className="debug-section">
          <h5>Connection</h5>
          <p>Status: {connectionStatus}</p>
          <p>Partner: {partner?.profile?.username || 'None'}</p>
          <p>Socket: {socket?.connected ? 'Connected' : 'Disconnected'}</p>
          <p>In Call: {inCall ? 'Yes' : 'No'}</p>
          <p>Call Duration: {formatTime(callDuration)}</p>
        </div>
        <div className="debug-section">
          <h5>Media</h5>
          <p>Local Stream: {localVideoStream ? 'Active' : 'Inactive'}</p>
          <p>Remote Stream: {remoteVideoStream ? 'Active' : 'Inactive'}</p>
          <p>Audio: {audioEnabled ? 'On' : 'Off'}</p>
          <p>Video: {videoEnabled ? 'On' : 'Off'}</p>
          <p>Screen Share: {screenShareActive ? 'On' : 'Off'}</p>
        </div>
        <div className="debug-logs">
          <h5>Recent Logs</h5>
          {debugLogs.slice(0, 5).map(log => (
            <div key={log.id} className={`debug-log ${log.type}`}>
              <span className="log-time">{log.timestamp}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  // Main render
  if (hasError) {
    return <ErrorFallback />;
  }
  return (
    <div className="omegle-video-container">
      {/* Connection Status Banner */}
      <div className="connection-status-banner">
        {!socket?.connected && (
          <div className="socket-disconnected">
            <FaBolt /> Connecting to server...
          </div>
        )}
       
        {socket?.connected && !partner && !searching && (
          <div className="ready-to-search">
            <FaSearch /> Ready to find a partner
          </div>
        )}
       
        {searching && (
          <div className="searching-status">
            <div className="searching-spinner"></div>
            Searching for partner... ({onlineCount} online)
          </div>
        )}
       
        {partner && !inCall && (
          <div className="partner-found">
            <FaUserFriends /> Found: {partner.profile?.username || 'Stranger'}
            {isConnecting ? ' (Connecting...)' : ''}
          </div>
        )}
      </div>
      {/* Debug Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <button
          className="debug-toggle-btn"
          onClick={() => setShowDebug(!showDebug)}
        >
          Debug
        </button>
      )}
      {/* Debug Panel */}
      {showDebug && <DebugPanel />}
      {/* Connection Debug Display */}
      <div className="connection-debug">
        <div className="debug-item">
          <span>Socket:</span>
          <span className={socket?.connected ? 'connected' : 'disconnected'}>
            {socket?.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="debug-item">
          <span>Partner:</span>
          <span className={partner ? 'has-partner' : 'no-partner'}>
            {partner ? partner.profile?.username || 'Stranger' : 'None'}
          </span>
        </div>
        <div className="debug-item">
          <span>Searching:</span>
          <span className={searching ? 'searching' : 'not-searching'}>
            {searching ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="debug-item">
          <span>In Call:</span>
          <span className={inCall ? 'in-call' : 'not-in-call'}>
            {inCall ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      {/* Swipe Area */}
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
            </div>
          )}
         
          {isConnecting && (
            <div className="connecting-overlay">
              <div className="connecting-spinner"></div>
              <p>Connecting...</p>
            </div>
          )}
        </div>
        {/* Local Video */}
        <div className="local-video-pip">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          {!audioEnabled && <div className="mute-indicator">🔇</div>}
          {screenShareActive && <div className="screen-share-indicator">🖥️</div>}
        </div>
        {/* Swipe Hint */}
        {swipeHintVisible && partner && (
          <div className="swipe-hint">
            <FaChevronRight className="swipe-icon" />
            <span>Swipe right to skip</span>
          </div>
        )}
      </div>
      {/* Top Controls */}
      <div className="top-controls">
        <button
          className="control-btn back-btn"
          onClick={() => {
            handleEndCall(true);
            setCurrentScreen('home');
          }}
        >
          <FaArrowLeft />
        </button>
       
        <div className="connection-info">
          {renderStatusIndicator()}
          {inCall && (
            <div className="call-timer">
              <span className="timer-icon">⏱️</span>
              {formatTime(callDuration)}
            </div>
          )}
        </div>
       
        <div className="online-count">
          <FaUsers />
          <span>{onlineCount} online</span>
        </div>
        <button
          className="control-btn chat-toggle-btn"
          onClick={() => setShowChat(!showChat)}
        >
          <FaComment />
        </button>
        <button
          className="control-btn menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FaEllipsisV />
        </button>
      </div>
      {/* Call Controls */}
      <div className="call-controls">
        <button
          className={`control-btn ${!audioEnabled ? 'active' : ''}`}
          onClick={toggleAudio}
        >
          {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
       
        <button
          className={`control-btn ${!videoEnabled ? 'active' : ''}`}
          onClick={toggleVideo}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </button>
       
        <button
          className="control-btn"
          onClick={toggleCamera}
        >
          <FaRedoAlt />
        </button>
       
        <button
          className={`control-btn ${screenShareActive ? 'active' : ''}`}
          onClick={toggleScreenShare}
        >
          <FaDesktop />
        </button>
       
        <button
          className="control-btn fullscreen-btn"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
       
        <button
          className="control-btn skip-btn"
          onClick={handleSwipeToNext}
          disabled={!partner}
        >
          <FaSyncAlt />
          <span className="btn-label">Skip</span>
        </button>
       
        <button
          className="control-btn end-call-btn"
          onClick={() => handleEndCall(true)}
        >
          <FaPhoneSlash />
          <span className="btn-label">End</span>
        </button>
      </div>
      {/* Search/Connect Controls */}
      {(!partner || !inCall) && (
        <div className="search-controls">
          {searching ? (
            <div className="searching-indicator">
              <div className="searching-spinner"></div>
              <p>Searching for partner... {onlineCount} online</p>
              <button
                className="cancel-search-btn"
                onClick={() => {
                  // Cancel search if context provides a way
                  if (socketRef.current) {
                    socketRef.current.emit('cancel-search');
                  }
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="start-search-btn"
              onClick={handleStartSearch}
              disabled={isConnecting}
            >
              <FaSearch />
              <span>{partner ? 'Reconnect' : 'Find Partner'}</span>
            </button>
          )}
        </div>
      )}
      {/* Partner Info */}
      {partner && (
        <div className="partner-info">
          <div className="partner-name">
            {partner.profile?.username || 'Stranger'}
            {connectionStatus === 'connected' && (
              <span className="online-badge">● Online</span>
            )}
          </div>
          <div className="partner-interests">
            {partner.profile?.interests?.slice(0, 3).map((interest, idx) => (
              <span key={idx} className="interest-tag">{interest}</span>
            ))}
          </div>
        </div>
      )}
      {/* Chat Drawer */}
      {showChat && (
        <div className={`chat-drawer ${showEmoji ? 'expanded' : ''}`}>
          <div className="chat-header">
            <h4>Chat</h4>
            <button
              className="like-btn"
              onClick={handleLike}
            >
              <FaHeart />
            </button>
            <button
              className="emoji-toggle-btn"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <FaSmile />
            </button>
          </div>
         
          <div
            className="messages-container"
            ref={messagesContainerRef}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
         
          <div className="message-input-container">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onFocus={handleTypingStart}
              onBlur={handleTypingStop}
              placeholder="Type a message..."
              className="message-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
         
          {showEmoji && (
            <div className="emoji-picker">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessageText(prev => prev + emojiData.emoji);
                  setShowEmoji(false);
                }}
                height={300}
                width="100%"
              />
            </div>
          )}
        </div>
      )}
      {/* Menu */}
      {showMenu && (
        <div className="menu-overlay">
          <div className="menu-content">
            <h4>More Options</h4>
            <button className="menu-item">
              <FaLanguage /> Translate Chat
            </button>
            <button className="menu-item">
              <FaMagic /> Apply Filters
            </button>
            <button className="menu-item">
              <FaShareAlt /> Share Room
            </button>
            <button className="menu-item" onClick={() => setShowMenu(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Auto-search toggle */}
      <div className="auto-search-toggle">
        <label>
          <input
            type="checkbox"
            checked={autoSearch}
            onChange={(e) => setAutoSearch(e.target.checked)}
          />
          <span>Auto-search for new partners</span>
        </label>
      </div>
    </div>
  );
};
export default VideoChatScreen;