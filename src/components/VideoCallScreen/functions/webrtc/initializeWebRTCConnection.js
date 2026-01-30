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
   
    // Step 4: Role-based initialization with proper timing
    if (callInfo.isCaller) {
      console.log('🎯 ROLE: CALLER - Will send offer after delay');
     
      // Calculate delay to prevent race conditions
      const baseDelay = 1000; // 1 second base
      const randomDelay = Math.random() * 1000; // 0-1 second random
      const totalDelay = baseDelay + randomDelay;
     
      console.log(`⏳ Caller delay: ${Math.round(totalDelay)}ms (${Math.round(baseDelay)}ms base + ${Math.round(randomDelay)}ms random)`);
     
      const offerTimeoutRef = setTimeout(async () => {
        console.log('⏰ Caller delay complete, checking state...');
       
        // Check if still valid
        if (!peerConnectionRef.current || !socket?.connected || !callInfo.partnerId) {
          console.warn('⚠️ Cannot send offer: connection not ready');
          return;
        }
       
        // Check current state
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
       
        // If we already have a remote offer (race condition), become callee
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
       
        // If we already have a local offer, just re-send it
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
       
        // Normal flow: Create and send new offer
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
         
          // Retry once
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
         
          // If no offer received, we might need to become caller
          if (socket?.connected && callInfo.partnerId) {
            console.log('🔄 Callee becoming caller due to timeout...');
            setCallInfo(prev => ({ ...prev, isCaller: true }));
           
            // Trigger negotiation needed
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
      forceStreamSync();
    }, 1000);
   
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
          initializeWebRTCConnection();
        }
      }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
    }
  }
};