// webrtcUtils.js
// Standalone helpers to create and initialize WebRTC connections.
// Each function receives a single `deps` object containing refs, callbacks, and state setters.



export async function initializeWebRTCConnectionFn(deps) {
  // deps contains many pieces; destructure what's needed
  const {
    partner,
    callInfoRef,
    initializationRef,
    setConnectionStatus,
    localStreamRef,
    initializeLocalStream,
    iceServers,
    fetchIceServers,
    createPeerConnection, // you can pass the helper or import it externally
    peerConnectionRef,
    socket,
    addNotification,
    setCallInfo, // setter for callInfo state if needed to modify role
    offerTimeoutRefs, // ref array for timeouts
    maxReconnectAttempts,
    reconnectAttemptsRef,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    userProfile,
    isVideoEnabled,
    isAudioEnabled,
    startStatsCollection,
    attemptReconnect,
    forceStreamSync,
    setRemoteStream,
    monitorRemoteStream,
    setIsRemoteVideoMuted,
    setIsRemoteAudioMuted
  } = deps;

  if (initializationRef.current) {
    console.log('⚠️ WebRTC already initialized');
    return;
  }

  if (!partner) {
    console.error('❌ Cannot initialize WebRTC: No partner');
    addNotification?.('No partner available', 'error');
    return;
  }

  if (!localStreamRef.current || !localStreamRef.current.active) {
    console.warn('⚠️ Local stream not ready, initializing now...');
    await initializeLocalStream?.(true);
    if (!localStreamRef.current || !localStreamRef.current.active) {
      console.error('❌ Cannot initialize WebRTC: Failed to get local stream');
      addNotification?.('Failed to access camera/microphone', 'error');
      return;
    }
  }

  const callInfo = callInfoRef.current;
  if (!callInfo?.callId || !callInfo?.roomId) {
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
  setConnectionStatus?.('connecting');

  try {
    const servers = (iceServers && iceServers.length > 0) ? iceServers : await fetchIceServers();
    console.log('🧊 Using ICE servers:', (servers || []).length);

    // Create peer connection (this will add local tracks)
    const pc = await createPeerConnection({
      servers,
      peerConnectionRef,
      localStreamRef,
      remoteStreamRef: deps.remoteStreamRef,
      remoteVideoRef: deps.remoteVideoRef,
      socket,
      callInfoRef,
      sendWebRTCIceCandidate: deps.sendWebRTCIceCandidate,
      sendWebRTCOffer,
      addNotification,
      setConnectionStatus,
      startStatsCollection,
      attemptReconnect,
      forceStreamSync,
      setRemoteStream,
      monitorRemoteStream,
      setIsRemoteVideoMuted,
      setIsRemoteAudioMuted,
      maxReconnectAttempts,
      reconnectAttemptsRef,
      userProfile,
      isVideoEnabled,
      isAudioEnabled
    });

    // give a bit of time to settle
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!peerConnectionRef.current) throw new Error('Failed to create peer connection');
    const pcRef = peerConnectionRef.current;

    // verify senders
    let senders = pcRef.getSenders();
    console.log(`📤 Initial senders count: ${senders.length}`);

    if (senders.length === 0 && localStreamRef.current) {
      console.warn('⚠️ No senders found, manually adding tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        try {
          const sender = pcRef.addTrack(track, localStreamRef.current);
          console.log(`✅ Manually added ${track.kind} track:`, { senderId: sender.id?.substring(0, 8) });
        } catch (error) {
          console.error(`❌ Failed to manually add ${track.kind} track:`, error);
          try {
            const transceiver = pcRef.addTransceiver(track.kind, { direction: 'sendrecv', streams: [localStreamRef.current] });
            console.log(`✅ Created transceiver for ${track.kind}`);
          } catch (transceiverError) {
            console.error(`❌ Failed to create transceiver:`, transceiverError);
          }
        }
      });
    }

    // Role-based flow (caller / callee)
    if (callInfo.isCaller) {
      console.log('🎯 ROLE: CALLER - Will send offer after delay');

      const baseDelay = 1000;
      const randomDelay = Math.random() * 1000;
      const totalDelay = baseDelay + randomDelay;

      console.log(`⏳ Caller delay: ${Math.round(totalDelay)}ms`);

      const offerTimeoutRef = setTimeout(async () => {
        console.log('⏰ Caller delay complete, checking state...');
        if (!peerConnectionRef.current || !socket?.connected || !callInfo.partnerId) {
          console.warn('⚠️ Cannot send offer: connection not ready');
          return;
        }

        const currentSignalingState = pcRef.signalingState;
        const hasLocalOffer = pcRef.localDescription?.type === 'offer';
        const hasRemoteOffer = pcRef.remoteDescription?.type === 'offer';

        console.log('📊 Pre-offer state:', {
          signalingState: currentSignalingState,
          hasLocalOffer,
          hasRemoteOffer,
          senders: pcRef.getSenders().length,
          receivers: pcRef.getReceivers().length
        });

        if (hasRemoteOffer) {
          console.warn('⚠️ Race condition: Already have remote offer, becoming callee');
          setCallInfo?.(prev => ({ ...prev, isCaller: false }));
          try {
            const answer = await pcRef.createAnswer();
            await pcRef.setLocalDescription(answer);
            sendWebRTCAnswer?.({
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
          sendWebRTCOffer?.({
            to: callInfo.partnerId,
            sdp: pcRef.localDescription,
            callId: callInfo.callId,
            roomId: callInfo.roomId,
            metadata: { username: userProfile?.username || 'Anonymous', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
          });
          return;
        }

        // Normal create offer
        try {
          const offer = await pcRef.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true, voiceActivityDetection: true, iceRestart: false });
          console.log('✅ Offer created:', offer.type);
          await pcRef.setLocalDescription(offer);
          console.log('✅ Local description (offer) set');

          sendWebRTCOffer?.({
            to: callInfo.partnerId,
            sdp: offer,
            callId: callInfo.callId,
            roomId: callInfo.roomId,
            metadata: { username: userProfile?.username || 'Anonymous', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
          });
          console.log('📤 Initial offer sent to partner');
        } catch (error) {
          console.error('❌ Failed to create/send offer:', error);
          // retry once
          setTimeout(async () => {
            if (peerConnectionRef.current === pcRef) {
              console.log('🔄 Retrying offer creation...');
              try {
                const retryOffer = await pcRef.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
                await pcRef.setLocalDescription(retryOffer);
                sendWebRTCOffer?.({
                  to: callInfo.partnerId,
                  sdp: retryOffer,
                  callId: callInfo.callId,
                  roomId: callInfo.roomId,
                  metadata: { username: userProfile?.username || 'Anonymous', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
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
      const offerWaitTimeout = setTimeout(() => {
        console.log('⏰ Callee waiting timeout (15s), checking state...');
        if (!pcRef.remoteDescription && setConnectionStatus) {
          console.warn('⚠️ No offer received after 15 seconds');
          if (socket?.connected && callInfo.partnerId) {
            console.log('🔄 Callee becoming caller due to timeout...');
            setCallInfo?.(prev => ({ ...prev, isCaller: true }));
            pcRef.onnegotiationneeded?.();
          }
        }
      }, 15000);

      offerTimeoutRefs.current.push(offerWaitTimeout);
    }

    setTimeout(() => {
      console.log('✅ WebRTC initialization sequence started');
      console.log('📊 Initial connection state:', {
        signalingState: pcRef.signalingState,
        iceConnectionState: pcRef.iceConnectionState,
        connectionState: pcRef.connectionState,
        localDescription: pcRef.localDescription?.type || 'none',
        remoteDescription: pcRef.remoteDescription?.type || 'none',
        senders: pcRef.getSenders().length,
        receivers: pcRef.getReceivers().length
      });
      forceStreamSync?.();
    }, 1000);

  } catch (error) {
    console.error('❌ Failed to initialize WebRTC:', error);
    addNotification?.('Failed to start video call', 'error');
    initializationRef.current = false;
    setConnectionStatus?.('failed');

    if (reconnectAttemptsRef.current < (maxReconnectAttempts || 0)) {
      reconnectAttemptsRef.current += 1;
      console.log(`🔄 Attempting recovery (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
      setTimeout(() => {
        if (socket?.connected) {
          initializeWebRTCConnection(deps); // retry
        }
      }, 2000 * reconnectAttemptsRef.current);
    }
  }
}
