
// // src/components/functions/webrtc/initializeWebRTCConnection.js

// export const initializeWebRTCConnectionFn = ({
//   initializationRef,
//   partner,
//   addNotification,
//   localStreamRef,
//   initializeLocalStream,
//   callInfo,
//   setCallInfo,
//   setConnectionStatus,
//   iceServers,
//   fetchIceServers,
//   createPeerConnection,
//   socket,
//   sendWebRTCOffer,
//   userProfile,
//   isVideoEnabled,
//   isAudioEnabled,
//   sendWebRTCAnswer,
//   connectionStatus,
//   forceStreamSync,
//   reconnectAttemptsRef,
//   maxReconnectAttempts,
//   peerConnectionRef,
//   offerTimeoutRefs
// }) => async () => {
//   // Prevent multiple initializations
//   if (initializationRef.current) {
//     console.log('⚠️ WebRTC already initialized');
//     return;
//   }
 
//   if (!partner) {
//     console.error('❌ Cannot initialize WebRTC: No partner');
//     addNotification('No partner available', 'error');
//     return;
//   }
 
//   // CRITICAL: Ensure local stream is ready before proceeding
//   if (!localStreamRef.current || !localStreamRef.current.active) {
//     console.warn('⚠️ Local stream not ready, initializing now...');
//     await initializeLocalStream(true);
   
//     // Check again after initialization
//     if (!localStreamRef.current || !localStreamRef.current.active) {
//       console.error('❌ Cannot initialize WebRTC: Failed to get local stream');
//       addNotification('Failed to access camera/microphone', 'error');
//       return;
//     }
//   }
 
//   // AUTO-GENERATE CALL INFO IF MISSING - THIS IS THE KEY FIX!
//   if (!callInfo.callId || !callInfo.roomId) {
//     console.warn('⚠️ Missing call info, generating automatically...');
    
//     const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const newIsCaller = socket?.id && partner.id ? socket.id < partner.id : true;
    
//     setCallInfo({
//       callId: newCallId,
//       roomId: newRoomId,
//       isCaller: newIsCaller,
//       partnerId: partner.id,
//       initialized: false
//     });
    
//     console.log('📞 Generated call info:', {
//       callId: newCallId,
//       roomId: newRoomId,
//       isCaller: newIsCaller
//     });
    
//     // Wait for state update
//     await new Promise(resolve => setTimeout(resolve, 100));
//   }
 
//   console.log('🚀 Initializing WebRTC connection with:', {
//     callId: callInfo.callId,
//     roomId: callInfo.roomId,
//     isCaller: callInfo.isCaller,
//     partnerId: callInfo.partnerId?.substring(0, 8),
//     hasLocalStream: !!localStreamRef.current,
//     localTracks: localStreamRef.current?.getTracks().length || 0,
//     localStreamActive: localStreamRef.current?.active || false
//   });
 
//   initializationRef.current = true;
//   setConnectionStatus('connecting');
 
//   try {
//     // Step 1: Get ICE servers
//     const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
//     console.log('🧊 Using ICE servers:', servers.length);
   
//     // Step 2: Create peer connection (this adds local tracks)
//     createPeerConnection(servers);
   
//     // Give time for peer connection to initialize
//     await new Promise(resolve => setTimeout(resolve, 300));
   
//     const pc = peerConnectionRef.current;
//     if (!pc) {
//       throw new Error('Failed to create peer connection');
//     }
   
//     // Step 3: Verify local tracks were added
//     const senders = pc.getSenders();
//     console.log(`📤 Initial senders count: ${senders.length}`);
   
//     if (senders.length === 0) {
//       console.warn('⚠️ No senders found, manually adding tracks...');
     
//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach(track => {
//           try {
//             const sender = pc.addTrack(track, localStreamRef.current);
//             console.log(`✅ Manually added ${track.kind} track:`, {
//               senderId: sender.id?.substring(0, 8),
//               trackEnabled: sender.track?.enabled
//             });
//           } catch (error) {
//             console.error(`❌ Failed to manually add ${track.kind} track:`, error);
           
//             // Try transceiver as last resort
//             try {
//               const transceiver = pc.addTransceiver(track.kind, {
//                 direction: 'sendrecv',
//                 streams: [localStreamRef.current]
//               });
//               console.log(`✅ Created transceiver for ${track.kind}`);
//             } catch (transceiverError) {
//               console.error(`❌ Failed to create transceiver:`, transceiverError);
//             }
//           }
//         });
//       }
//     }
   
//     // Step 4: Role-based initialization with IMPROVED timing
//     if (callInfo.isCaller) {
//       console.log('🎯 ROLE: CALLER - Will send offer after connection is ready');
     
//       // Function to check if peer connection is ready to send offer
//     // Replace the isPeerConnectionReady function in initializeWebRTCConnection.js:

// const isPeerConnectionReady = () => {
//   if (!pc || !socket?.connected) {
//     console.log('❌ PC not ready:', {
//       hasPC: !!pc,
//       socketConnected: socket?.connected
//     });
//     return false;
//   }
  
//   // Get partnerId from multiple possible sources
//   const partnerId = callInfo.partnerId || partner?.id || partner?.partnerId;
  
//   if (!partnerId) {
//     console.log('⚠️ No partnerId yet, but continuing anyway...');
//     console.log('Debug partner object:', {
//       partner: !!partner,
//       partnerId: partner?.id,
//       callInfoPartnerId: callInfo.partnerId
//     });
    
//     // If we're getting remote tracks, we can proceed even without partnerId
//     const receivers = pc.getReceivers();
//     const hasRemoteTracks = receivers.some(r => r.track && r.track.readyState === 'live');
    
//     if (hasRemoteTracks) {
//       console.log('✅ Have remote tracks, proceeding with offer...');
//       return true;
//     }
    
//     return false;
//   }
  
//   // Check if we already have an offer (race condition)
//   const hasLocalOffer = pc.localDescription?.type === 'offer';
//   const hasRemoteOffer = pc.remoteDescription?.type === 'offer';
  
//   if (hasRemoteOffer) {
//     console.log('⚠️ Already have remote offer, will answer instead');
//     return false;
//   }
  
//   // Check connection states
//   const isSignalingStable = pc.signalingState === 'stable';
//   const hasNoDescription = !pc.localDescription && !pc.remoteDescription;
  
//   // We can send offer if we're in a clean state OR if we're getting tracks
//   const receivers = pc.getReceivers();
//   const hasRemoteTracks = receivers.some(r => r.track && r.track.readyState === 'live');
  
//   // Allow sending offer if we have remote tracks (means connection is working)
//   if (hasRemoteTracks) {
//     console.log('✅ Have remote tracks, connection is working, will send offer');
//     return true;
//   }
  
//   return isSignalingStable && hasNoDescription;
// };
      
//       // Function to send the offer when ready
//       const sendOfferWhenReady = async () => {
//         let attempts = 0;
//         const maxAttempts = 20; // 10 seconds total (500ms * 20)
        
//         const trySendOffer = async () => {
//           attempts++;
          
//           if (!isPeerConnectionReady()) {
//             console.log(`⏳ Waiting for peer connection to be ready (attempt ${attempts}/${maxAttempts})...`);
            
//             if (attempts >= maxAttempts) {
//               console.warn('⚠️ Max attempts reached, trying to send offer anyway');
//               // Force send offer even if not perfectly ready
//             } else {
//               setTimeout(trySendOffer, 500);
//               return;
//             }
//           }
          
//           try {
//             console.log('📤 Creating and sending offer...');
//             const offer = await pc.createOffer({
//               offerToReceiveAudio: true,
//               offerToReceiveVideo: true,
//               voiceActivityDetection: true,
//               iceRestart: false
//             });
            
//             console.log('✅ Offer created');
//             await pc.setLocalDescription(offer);
//             console.log('✅ Local description (offer) set');
            
//             sendWebRTCOffer({
//               to: callInfo.partnerId,
//               sdp: offer,
//               callId: callInfo.callId,
//               roomId: callInfo.roomId,
//               metadata: {
//                 username: userProfile?.username || 'Anonymous',
//                 videoEnabled: isVideoEnabled,
//                 audioEnabled: isAudioEnabled
//               }
//             });
            
//             console.log('📤 Initial offer sent to partner');
//             setConnectionStatus('connected');
//             addNotification('Video call started!', 'success');
            
//           } catch (error) {
//             console.error('❌ Failed to create/send offer:', error);
            
//             // Retry once after 1 second
//             if (attempts < 2) {
//               console.log('🔄 Retrying offer in 1 second...');
//               setTimeout(() => {
//                 sendOfferWhenReady();
//               }, 1000);
//             }
//           }
//         };
        
//         // Start trying to send offer
//         trySendOffer();
//       };
      
//       // Start the offer process after a short delay
//       const offerTimeoutRef = setTimeout(() => {
//         console.log('⏰ Starting offer process...');
//         sendOfferWhenReady();
//       }, 1000); // 1 second initial delay
     
//       // Store timeout for cleanup
//       offerTimeoutRefs.current.push(offerTimeoutRef);
     
//     } else {
//       // CALLEE: Just wait for offer
//       console.log('🎯 ROLE: CALLEE - Waiting for offer from caller...');
//       console.log('📥 Callee will automatically respond when offer arrives');
     
//       // Set a timeout to check if offer never arrives
//       const offerWaitTimeout = setTimeout(() => {
//         console.log('⏰ Callee waiting timeout (15s), checking state...');
       
//         if (!pc.remoteDescription && connectionStatus === 'connecting') {
//           console.warn('⚠️ No offer received after 15 seconds');
//           addNotification('No response from partner, trying to initiate...', 'info');
         
//           // If no offer received, switch to caller role
//           if (socket?.connected && callInfo.partnerId) {
//             console.log('🔄 Callee becoming caller due to timeout...');
//             setCallInfo(prev => ({ ...prev, isCaller: true }));
            
//             // Trigger negotiation to send offer
//             pc.onnegotiationneeded?.();
//           }
//         }
//       }, 15000); // 15 second timeout
     
//       offerTimeoutRefs.current.push(offerWaitTimeout);
//     }
   
//     // Log final state after initialization
//     setTimeout(() => {
//       console.log('✅ WebRTC initialization sequence started');
//       console.log('📊 Initial connection state:', {
//         signalingState: pc.signalingState,
//         iceConnectionState: pc.iceConnectionState,
//         connectionState: pc.connectionState,
//         localDescription: pc.localDescription?.type || 'none',
//         remoteDescription: pc.remoteDescription?.type || 'none',
//         senders: pc.getSenders().length,
//         receivers: pc.getReceivers().length
//       });
     
//       // Force initial stream sync
//       setTimeout(() => {
//         forceStreamSync();
//       }, 500);
//     }, 500);
   
//   } catch (error) {
//     console.error('❌ Failed to initialize WebRTC:', error);
//     addNotification('Failed to start video call', 'error');
//     initializationRef.current = false;
//     setConnectionStatus('failed');
   
//     // Attempt recovery
//     if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//       reconnectAttemptsRef.current += 1;
//       console.log(`🔄 Attempting recovery (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
     
//       setTimeout(() => {
//         if (socket?.connected) {
//           console.log('🔄 Restarting WebRTC connection...');
//           initializationRef.current = false; // Reset flag
//           initializeWebRTCConnectionFn();
//         }
//       }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
//     }
//   }
// };

export const initializeWebRTCConnectionFn = ({
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
}) => async () => {
  const ts = () => new Date().toISOString().slice(11, 23); // short time for logs

  console.log(`[${ts()}] [INIT-WEBRTC] Starting WebRTC connection initialization`);

  // ─── GUARD: Already initializing ───────────────────────────────
  if (initializationRef.current) {
    console.warn(`[${ts()}] [INIT-WEBRTC] Already initializing — skipping duplicate call`);
    // return;
  }

  // Set the initialization flag HERE, not in the component
initializationRef.current = true;
console.log(`[${ts()}] [INIT-WEBRTC] Setting initializationRef.current = true`);

  // ─── GUARD: No partner ─────────────────────────────────────────
  if (!partner) {
    console.error(`[${ts()}] [INIT-WEBRTC] No partner object — cannot proceed`, {
      partnerExists: !!partner,
      partnerId: partner?.id || partner?.partnerId || 'missing'
    });
    addNotification?.('No partner available', 'error');
    return;
  }

  // ─── ENSURE LOCAL STREAM ───────────────────────────────────────
  if (!localStreamRef.current || !localStreamRef.current.active) {
    console.warn(`[${ts()}] [INIT-WEBRTC] Local stream missing or inactive → forcing initialization`);

    await initializeLocalStream(true);

    if (!localStreamRef.current || !localStreamRef.current.active) {
      console.error(`[${ts()}] [INIT-WEBRTC] Failed to obtain usable local stream even with placeholder`, {
        hasStream: !!localStreamRef.current,
        active: localStreamRef.current?.active,
        tracks: localStreamRef.current?.getTracks()?.length || 0
      });
      addNotification?.('Failed to access camera/microphone', 'error');
      return;
    }
    console.log(`[${ts()}] [INIT-WEBRTC] Local stream ready after forced init`, {
      tracks: localStreamRef.current.getTracks().map(t => t.kind).join(', ')
    });
  }

  // ─── AUTO-GENERATE CALL INFO IF MISSING ────────────────────────
  if (!callInfo.callId || !callInfo.roomId) {
    console.warn(`[${ts()}] [INIT-WEBRTC] Missing callId or roomId → auto-generating`);

    const newCallId = `call_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
    const newRoomId = `room_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
    const newIsCaller = !!(socket?.id && (partner.id || partner.partnerId) && socket.id < (partner.id || partner.partnerId));

    setCallInfo({
      callId: newCallId,
      roomId: newRoomId,
      isCaller: newIsCaller,
      partnerId: partner.id || partner.partnerId,
      initialized: false
    });

    console.log(`[${ts()}] [INIT-WEBRTC] Generated missing call info`, {
      callId: newCallId,
      roomId: newRoomId,
      isCaller: newIsCaller,
      partnerId: (partner.id || partner.partnerId)?.substring(0,8) + '...'
    });

    // Give React a moment to update state
    await new Promise(r => setTimeout(r, 120));
  }

  // ─── LOG ENTRY POINT ───────────────────────────────────────────
  console.log(`[${ts()}] [INIT-WEBRTC] Starting connection sequence`, {
    callId: callInfo.callId,
    roomId: callInfo.roomId,
    isCaller: callInfo.isCaller,
    partnerId: callInfo.partnerId?.substring(0,8) + '...' || 'missing',
    localTracks: localStreamRef.current?.getTracks()?.length || 0,
    streamActive: localStreamRef.current?.active || false,
    socketConnected: socket?.connected || false
  });

  initializationRef.current = true;
  setConnectionStatus('connecting');

  try {
    // ─── ICE SERVERS ─────────────────────────────────────────────
    let servers = iceServers;
    if (servers.length === 0) {
      console.log(`[${ts()}] [ICE] No cached ICE servers — fetching now...`);
      servers = await fetchIceServers();
      console.log(`[${ts()}] [ICE] Received ${servers.length} ICE server(s)`);
    } else {
      console.log(`[${ts()}] [ICE] Using ${servers.length} cached ICE server(s)`);
    }

    // ─── CREATE PEER CONNECTION ──────────────────────────────────
    console.log(`[${ts()}] [PC] Creating new RTCPeerConnection`);
    createPeerConnection(servers);

    await new Promise(r => setTimeout(r, 400)); // give time for constructor + events

    const pc = peerConnectionRef.current;
    if (!pc) {
      throw new Error("peerConnectionRef.current is still null after createPeerConnection");
    }

    console.log(`[${ts()}] [PC] PeerConnection created`, {
      signalingState: pc.signalingState,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState
    });

    // ─── VERIFY / FIX LOCAL TRACKS ───────────────────────────────
    let senders = pc.getSenders();
    console.log(`[${ts()}] [TRACKS] Initial senders count: ${senders.length}`);

    if (senders.length === 0 && localStreamRef.current) {
      console.warn(`[${ts()}] [TRACKS] No senders after createPeerConnection → manually adding tracks`);

      localStreamRef.current.getTracks().forEach(track => {
        try {
          const sender = pc.addTrack(track, localStreamRef.current);
          console.log(`[${ts()}] [TRACKS] Added ${track.kind} track via addTrack`, {
            trackId: track.id.substring(0,8) + '...',
            senderId: sender?.id?.substring(0,8) + '...',
            enabled: track.enabled
          });
        } catch (addErr) {
          console.error(`[${ts()}] [TRACKS] addTrack failed for ${track.kind}`, addErr);

          try {
            pc.addTransceiver(track, {
              direction: 'sendrecv',
              streams: [localStreamRef.current]
            });
            console.log(`[${ts()}] [TRACKS] Successfully added ${track.kind} via addTransceiver`);
          } catch (txErr) {
            console.error(`[${ts()}] [TRACKS] addTransceiver also failed for ${track.kind}`, txErr);
          }
        }
      });

      // refresh senders after manual adds
      senders = pc.getSenders();
      console.log(`[${ts()}] [TRACKS] Senders after manual add: ${senders.length}`);
    }

    // ─── ROLE-SPECIFIC BEHAVIOR ──────────────────────────────────
    if (callInfo.isCaller) {
      console.log(`[${ts()}] [ROLE] Caller → preparing to send offer`);

      const isPeerConnectionReady = () => {
        if (!pc || !socket?.connected) return false;

        const partnerId = callInfo.partnerId || partner?.id || partner?.partnerId;
        if (!partnerId) {
          const hasTracksAlready = pc.getReceivers().some(r => r.track?.readyState === 'live');
          if (hasTracksAlready) {
            console.log(`[${ts()}] [READY-CHECK] Has live remote tracks → considering ready`);
            return true;
          }
          return false;
        }

        const hasRemoteOffer = pc.remoteDescription?.type === 'offer';
        if (hasRemoteOffer) {
          console.log(`[${ts()}] [READY-CHECK] Already have remote offer → should answer instead`);
          return false;
        }

        const stableAndClean = pc.signalingState === 'stable' &&
                              !pc.localDescription && !pc.remoteDescription;

        const hasEarlyTracks = pc.getReceivers().some(r => r.track?.readyState === 'live');

        return stableAndClean || hasEarlyTracks;
      };

      const sendOfferWhenReady = async () => {
        let attempt = 0;
        const MAX_ATTEMPTS = 20;

        const trySend = async () => {
          attempt++;

          if (!isPeerConnectionReady()) {
            if (attempt >= MAX_ATTEMPTS) {
              console.warn(`[${ts()}] [OFFER] Max wait attempts reached — forcing offer send`);
            } else {
              console.log(`[${ts()}] [OFFER] Waiting for ready state (attempt ${attempt}/${MAX_ATTEMPTS})`);
              setTimeout(trySend, 500);
              return;
            }
          }

          try {
            console.log(`[${ts()}] [OFFER] Creating offer...`);
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
              voiceActivityDetection: true
            });

            console.log(`[${ts()}] [OFFER] Offer created → setting local description`);
            await pc.setLocalDescription(offer);

            console.log(`[${ts()}] [OFFER] Sending offer to ${callInfo.partnerId?.substring(0,8)}...`);
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

            console.log(`[${ts()}] [OFFER] Offer successfully sent`);
            setConnectionStatus('offer-sent');
            addNotification?.('Calling partner...', 'info');

          } catch (err) {
            console.error(`[${ts()}] [OFFER] Failed to create/send offer`, {
              name: err.name,
              message: err.message
            });

            if (attempt < 3) {
              console.log(`[${ts()}] [OFFER] Retrying in 1.5s...`);
              setTimeout(trySend, 1500);
            }
          }
        };

        trySend();
      };

      const offerStartTimeout = setTimeout(() => {
        console.log(`[${ts()}] [OFFER] Starting delayed offer process`);
        sendOfferWhenReady();
      }, 1200);

      offerTimeoutRefs.current.push(offerStartTimeout);

    } else {
      // ─── CALLEE PATH ─────────────────────────────────────────────
      console.log(`[${ts()}] [ROLE] Callee → waiting for incoming offer`);

      const waitTimeout = setTimeout(() => {
        if (!pc.remoteDescription && connectionStatus === 'connecting') {
          console.warn(`[${ts()}] [CALLEE-TIMEOUT] No offer received after 15s`);

          if (socket?.connected && (callInfo.partnerId || partner?.id)) {
            console.log(`[${ts()}] [CALLEE-TIMEOUT] Switching to caller role due to timeout`);
            setCallInfo(prev => ({ ...prev, isCaller: true }));
            addNotification?.('No response — initiating call...', 'info');

            if (pc.onnegotiationneeded) {
              console.log(`[${ts()}] [CALLEE-TIMEOUT] Triggering onnegotiationneeded`);
              pc.onnegotiationneeded();
            }
          }
        }
      }, 15000);

      offerTimeoutRefs.current.push(waitTimeout);
    }

    // ─── FINAL STATE SNAPSHOT ─────────────────────────────────────
    setTimeout(() => {
      console.log(`[${ts()}] [INIT-WEBRTC] Initialization phase completed — current state:`, {
        signaling: pc.signalingState,
        connection: pc.connectionState,
        iceConnection: pc.iceConnectionState,
        iceGathering: pc.iceGatheringState,
        localDesc: pc.localDescription?.type || 'none',
        remoteDesc: pc.remoteDescription?.type || 'none',
        senders: pc.getSenders().length,
        receivers: pc.getReceivers().length
      });

      setTimeout(() => {
        console.log(`[${ts()}] [STREAM-SYNC] Forcing initial stream sync`);
        forceStreamSync?.();
      }, 600);

    }, 800);

  } catch (error) {
    console.error(`[${ts()}] [INIT-WEBRTC] Critical initialization failure`, {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0,4)
    });

    addNotification?.('Failed to start video connection', 'error');
    initializationRef.current = false;
    setConnectionStatus('failed');

    // ─── RECONNECT LOGIC ─────────────────────────────────────────
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current += 1;
      const delay = 1800 * reconnectAttemptsRef.current;

      console.log(`[${ts()}] [RECONNECT] Scheduling retry #${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);

      setTimeout(() => {
        if (socket?.connected) {
          console.log(`[${ts()}] [RECONNECT] Restarting WebRTC init`);
          initializationRef.current = false;
          initializeWebRTCConnectionFn()();
        }
      }, delay);
    }
  }
};