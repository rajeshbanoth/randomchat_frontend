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
 
//   if (!callInfo.callId || !callInfo.roomId) {
//     console.error('❌ Cannot initialize WebRTC: Missing call info');
//     return;
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
   
//     // Step 4: Role-based initialization with proper timing
//     if (callInfo.isCaller) {
//       console.log('🎯 ROLE: CALLER - Will send offer after delay');
     
//       // Calculate delay to prevent race conditions
//       const baseDelay = 1000; // 1 second base
//       const randomDelay = Math.random() * 1000; // 0-1 second random
//       const totalDelay = baseDelay + randomDelay;
     
//       console.log(`⏳ Caller delay: ${Math.round(totalDelay)}ms (${Math.round(baseDelay)}ms base + ${Math.round(randomDelay)}ms random)`);
     
//       const offerTimeoutRef = setTimeout(async () => {
//         console.log('⏰ Caller delay complete, checking state...');
       
//         // Check if still valid
//         if (!peerConnectionRef.current || !socket?.connected || !callInfo.partnerId) {
//           console.warn('⚠️ Cannot send offer: connection not ready');
//           return;
//         }
       
//         // Check current state
//         const currentSignalingState = pc.signalingState;
//         const hasLocalOffer = pc.localDescription?.type === 'offer';
//         const hasRemoteOffer = pc.remoteDescription?.type === 'offer';
       
//         console.log('📊 Pre-offer state:', {
//           signalingState: currentSignalingState,
//           hasLocalOffer,
//           hasRemoteOffer,
//           senders: pc.getSenders().length,
//           receivers: pc.getReceivers().length
//         });
       
//         // If we already have a remote offer (race condition), become callee
//         if (hasRemoteOffer) {
//           console.warn('⚠️ Race condition: Already have remote offer, becoming callee');
//           setCallInfo(prev => ({ ...prev, isCaller: false }));
         
//           try {
//             const answer = await pc.createAnswer();
//             await pc.setLocalDescription(answer);
           
//             sendWebRTCAnswer({
//               to: callInfo.partnerId,
//               sdp: answer,
//               callId: callInfo.callId,
//               roomId: callInfo.roomId
//             });
           
//             console.log('📤 Sent answer after race detection');
//             return;
//           } catch (error) {
//             console.error('❌ Failed to create answer:', error);
//           }
//         }
       
//         // If we already have a local offer, just re-send it
//         if (hasLocalOffer) {
//           console.log('ℹ️ Already have local offer, re-sending...');
//           sendWebRTCOffer({
//             to: callInfo.partnerId,
//             sdp: pc.localDescription,
//             callId: callInfo.callId,
//             roomId: callInfo.roomId,
//             metadata: {
//               username: userProfile?.username || 'Anonymous',
//               videoEnabled: isVideoEnabled,
//               audioEnabled: isAudioEnabled
//             }
//           });
//           return;
//         }
       
//         // Normal flow: Create and send new offer
//         console.log('📤 Creating and sending initial offer...');
//         try {
//           const offer = await pc.createOffer({
//             offerToReceiveAudio: true,
//             offerToReceiveVideo: true,
//             voiceActivityDetection: true,
//             iceRestart: false
//           });
         
//           console.log('✅ Offer created:', offer.type);
//           await pc.setLocalDescription(offer);
//           console.log('✅ Local description (offer) set');
         
//           sendWebRTCOffer({
//             to: callInfo.partnerId,
//             sdp: offer,
//             callId: callInfo.callId,
//             roomId: callInfo.roomId,
//             metadata: {
//               username: userProfile?.username || 'Anonymous',
//               videoEnabled: isVideoEnabled,
//               audioEnabled: isAudioEnabled
//             }
//           });
         
//           console.log('📤 Initial offer sent to partner');
         
//         } catch (error) {
//           console.error('❌ Failed to create/send offer:', error);
         
//           // Retry once
//           setTimeout(async () => {
//             if (peerConnectionRef.current === pc) {
//               console.log('🔄 Retrying offer creation...');
//               try {
//                 const retryOffer = await pc.createOffer({
//                   offerToReceiveAudio: true,
//                   offerToReceiveVideo: true
//                 });
               
//                 await pc.setLocalDescription(retryOffer);
               
//                 sendWebRTCOffer({
//                   to: callInfo.partnerId,
//                   sdp: retryOffer,
//                   callId: callInfo.callId,
//                   roomId: callInfo.roomId,
//                   metadata: {
//                     username: userProfile?.username || 'Anonymous',
//                     videoEnabled: isVideoEnabled,
//                     audioEnabled: isAudioEnabled
//                   }
//                 });
               
//                 console.log('📤 Retry offer sent');
//               } catch (retryError) {
//                 console.error('❌ Retry also failed:', retryError);
//               }
//             }
//           }, 1000);
//         }
//       }, totalDelay);
     
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
         
//           // If no offer received, we might need to become caller
//           if (socket?.connected && callInfo.partnerId) {
//             console.log('🔄 Callee becoming caller due to timeout...');
//             setCallInfo(prev => ({ ...prev, isCaller: true }));
           
//             // Trigger negotiation needed
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
//       forceStreamSync();
//     }, 1000);
   
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
//           initializeWebRTCConnection();
//         }
//       }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
//     }
//   }
// };

// src/components/functions/webrtc/initializeWebRTCConnection.js
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
  // Prevent multiple initializations
  if (initializationRef.current) {
    console.log('⚠️ WebRTC already initialized');
    return;
  }
 
  if (!partner) {
    console.error('❌ Cannot initialize WebRTC: No partner');
    addNotification('No partner available', 'error');
    return;
  }
 
  // CRITICAL: Ensure local stream is ready before proceeding
  if (!localStreamRef.current || !localStreamRef.current.active) {
    console.warn('⚠️ Local stream not ready, initializing now...');
    await initializeLocalStream(true);
   
    // Check again after initialization
    if (!localStreamRef.current || !localStreamRef.current.active) {
      console.error('❌ Cannot initialize WebRTC: Failed to get local stream');
      addNotification('Failed to access camera/microphone', 'error');
      return;
    }
  }
 
  // AUTO-GENERATE CALL INFO IF MISSING - THIS IS THE KEY FIX!
  if (!callInfo.callId || !callInfo.roomId) {
    console.warn('⚠️ Missing call info, generating automatically...');
    
    const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newIsCaller = socket?.id && partner.id ? socket.id < partner.id : true;
    
    setCallInfo({
      callId: newCallId,
      roomId: newRoomId,
      isCaller: newIsCaller,
      partnerId: partner.id,
      initialized: false
    });
    
    console.log('📞 Generated call info:', {
      callId: newCallId,
      roomId: newRoomId,
      isCaller: newIsCaller
    });
    
    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 100));
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
    // Step 1: Get ICE servers
    const servers = iceServers.length > 0 ? iceServers : await fetchIceServers();
    console.log('🧊 Using ICE servers:', servers.length);
   
    // Step 2: Create peer connection (this adds local tracks)
    createPeerConnection(servers);
   
    // Give time for peer connection to initialize
    await new Promise(resolve => setTimeout(resolve, 300));
   
    const pc = peerConnectionRef.current;
    if (!pc) {
      throw new Error('Failed to create peer connection');
    }
   
    // Step 3: Verify local tracks were added
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
           
            // Try transceiver as last resort
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
   
    // Step 4: Role-based initialization with IMPROVED timing
    if (callInfo.isCaller) {
      console.log('🎯 ROLE: CALLER - Will send offer after connection is ready');
     
      // Function to check if peer connection is ready to send offer
    // Replace the isPeerConnectionReady function in initializeWebRTCConnection.js:

const isPeerConnectionReady = () => {
  if (!pc || !socket?.connected) {
    console.log('❌ PC not ready:', {
      hasPC: !!pc,
      socketConnected: socket?.connected
    });
    return false;
  }
  
  // Get partnerId from multiple possible sources
  const partnerId = callInfo.partnerId || partner?.id || partner?.partnerId;
  
  if (!partnerId) {
    console.log('⚠️ No partnerId yet, but continuing anyway...');
    console.log('Debug partner object:', {
      partner: !!partner,
      partnerId: partner?.id,
      callInfoPartnerId: callInfo.partnerId
    });
    
    // If we're getting remote tracks, we can proceed even without partnerId
    const receivers = pc.getReceivers();
    const hasRemoteTracks = receivers.some(r => r.track && r.track.readyState === 'live');
    
    if (hasRemoteTracks) {
      console.log('✅ Have remote tracks, proceeding with offer...');
      return true;
    }
    
    return false;
  }
  
  // Check if we already have an offer (race condition)
  const hasLocalOffer = pc.localDescription?.type === 'offer';
  const hasRemoteOffer = pc.remoteDescription?.type === 'offer';
  
  if (hasRemoteOffer) {
    console.log('⚠️ Already have remote offer, will answer instead');
    return false;
  }
  
  // Check connection states
  const isSignalingStable = pc.signalingState === 'stable';
  const hasNoDescription = !pc.localDescription && !pc.remoteDescription;
  
  // We can send offer if we're in a clean state OR if we're getting tracks
  const receivers = pc.getReceivers();
  const hasRemoteTracks = receivers.some(r => r.track && r.track.readyState === 'live');
  
  // Allow sending offer if we have remote tracks (means connection is working)
  if (hasRemoteTracks) {
    console.log('✅ Have remote tracks, connection is working, will send offer');
    return true;
  }
  
  return isSignalingStable && hasNoDescription;
};
      
      // Function to send the offer when ready
      const sendOfferWhenReady = async () => {
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds total (500ms * 20)
        
        const trySendOffer = async () => {
          attempts++;
          
          if (!isPeerConnectionReady()) {
            console.log(`⏳ Waiting for peer connection to be ready (attempt ${attempts}/${maxAttempts})...`);
            
            if (attempts >= maxAttempts) {
              console.warn('⚠️ Max attempts reached, trying to send offer anyway');
              // Force send offer even if not perfectly ready
            } else {
              setTimeout(trySendOffer, 500);
              return;
            }
          }
          
          try {
            console.log('📤 Creating and sending offer...');
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
              voiceActivityDetection: true,
              iceRestart: false
            });
            
            console.log('✅ Offer created');
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
            setConnectionStatus('connected');
            addNotification('Video call started!', 'success');
            
          } catch (error) {
            console.error('❌ Failed to create/send offer:', error);
            
            // Retry once after 1 second
            if (attempts < 2) {
              console.log('🔄 Retrying offer in 1 second...');
              setTimeout(() => {
                sendOfferWhenReady();
              }, 1000);
            }
          }
        };
        
        // Start trying to send offer
        trySendOffer();
      };
      
      // Start the offer process after a short delay
      const offerTimeoutRef = setTimeout(() => {
        console.log('⏰ Starting offer process...');
        sendOfferWhenReady();
      }, 1000); // 1 second initial delay
     
      // Store timeout for cleanup
      offerTimeoutRefs.current.push(offerTimeoutRef);
     
    } else {
      // CALLEE: Just wait for offer
      console.log('🎯 ROLE: CALLEE - Waiting for offer from caller...');
      console.log('📥 Callee will automatically respond when offer arrives');
     
      // Set a timeout to check if offer never arrives
      const offerWaitTimeout = setTimeout(() => {
        console.log('⏰ Callee waiting timeout (15s), checking state...');
       
        if (!pc.remoteDescription && connectionStatus === 'connecting') {
          console.warn('⚠️ No offer received after 15 seconds');
          addNotification('No response from partner, trying to initiate...', 'info');
         
          // If no offer received, switch to caller role
          if (socket?.connected && callInfo.partnerId) {
            console.log('🔄 Callee becoming caller due to timeout...');
            setCallInfo(prev => ({ ...prev, isCaller: true }));
            
            // Trigger negotiation to send offer
            pc.onnegotiationneeded?.();
          }
        }
      }, 15000); // 15 second timeout
     
      offerTimeoutRefs.current.push(offerWaitTimeout);
    }
   
    // Log final state after initialization
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
     
      // Force initial stream sync
      setTimeout(() => {
        forceStreamSync();
      }, 500);
    }, 500);
   
  } catch (error) {
    console.error('❌ Failed to initialize WebRTC:', error);
    addNotification('Failed to start video call', 'error');
    initializationRef.current = false;
    setConnectionStatus('failed');
   
    // Attempt recovery
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current += 1;
      console.log(`🔄 Attempting recovery (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
     
      setTimeout(() => {
        if (socket?.connected) {
          console.log('🔄 Restarting WebRTC connection...');
          initializationRef.current = false; // Reset flag
          initializeWebRTCConnection();
        }
      }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
    }
  }
};