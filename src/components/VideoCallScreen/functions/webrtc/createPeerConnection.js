// src/components/functions/webrtc/createPeerConnection.js
export const createPeerConnectionFn = ({
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
}) => (servers) => {
  console.log('🔗 Creating peer connection with ICE servers:', servers.length);
 
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
 
  // ========== CRITICAL FIX: Add local tracks FIRST ==========
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
        // IMPORTANT: Add track with the local stream
        const sender = pc.addTrack(track, localStreamRef.current);
        console.log(`✅ ${track.kind} track added successfully:`, {
          senderId: sender.id?.substring(0, 8),
          trackEnabled: sender.track?.enabled,
          readyState: sender.track?.readyState
        });
      } catch (error) {
        console.error(`❌ Failed to add ${track.kind} track:`, error);
       
        // Alternative: Add transceiver if track addition fails
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
 
  // Log initial transceivers
  setTimeout(() => {
    const transceivers = pc.getTransceivers();
    console.log('🔄 Initial transceivers count:', transceivers.length);
    transceivers.forEach((tc, idx) => {
      console.log(` Transceiver ${idx}:`, {
        mid: tc.mid,
        direction: tc.direction,
        currentDirection: tc.currentDirection,
        receiverTrack: tc.receiver.track?.kind || 'none',
        senderTrack: tc.sender.track?.kind || 'none',
        receiverEnabled: tc.receiver.track?.enabled,
        senderEnabled: tc.sender.track?.enabled
      });
    });
  }, 100);
 
  // ========== EVENT HANDLERS ==========
 
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
 
  // Log signaling state changes
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
     
      // CRITICAL: Force stream sync on connection
      setTimeout(() => {
        forceStreamSync();
      }, 1000);
    } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      console.warn(`⚠️ Peer connection ${pc.connectionState}`);
      if (pc.connectionState === 'failed' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        attemptReconnect();
      }
    }
  };
 
  // ========== CRITICAL: Enhanced ontrack handler ==========
  pc.ontrack = (event) => {
    console.log('🎬 Received remote track:', {
      kind: event.track.kind,
      id: event.track.id?.substring(0, 8) || 'unknown',
      readyState: event.track.readyState,
      enabled: event.track.enabled,
      muted: event.track.muted,
      streams: event.streams?.length || 0
    });
   
    // Create or get remote stream
    if (!remoteStreamRef.current) {
      console.log('📹 Creating new remote stream');
      remoteStreamRef.current = new MediaStream();
    }
   
    const remoteStream = remoteStreamRef.current;
   
    // Check if we already have this track
    const existingTrack = remoteStream.getTracks().find(t => t.id === event.track.id);
   
    if (!existingTrack) {
      console.log(`✅ Adding ${event.track.kind} track to remote stream:`, {
        trackId: event.track.id?.substring(0, 8),
        enabled: event.track.enabled,
        muted: event.track.muted
      });
     
      remoteStream.addTrack(event.track);
     
      // Update the remote video element
      if (remoteVideoRef.current) {
        // Always update srcObject to ensure it's current
        remoteVideoRef.current.srcObject = remoteStream;
        console.log('🎥 Updated remote video element with stream');
       
        // Set video attributes for better playback
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.muted = false;
       
        // Force playback
        const playPromise = remoteVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('⚠️ Remote video auto-play failed:', err);
           
            // Try again on user interaction
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
     
      // Update React state
      setRemoteStream(remoteStream);
      monitorRemoteStream(remoteStream);
     
      // Log current state
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
   
    // Handle track events
    event.track.onended = () => {
      console.log(`🛑 Remote ${event.track.kind} track ended`);
     
      if (remoteStreamRef.current) {
        remoteStreamRef.current.removeTrack(event.track);
        console.log(`🛑 Removed ${event.track.kind} track from stream`);
       
        // Update UI
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
   
    // Only create offer if we're the caller and in stable state
    if (callInfo.isCaller && pc.signalingState === 'stable') {
      console.log('📤 Creating offer as caller...');
     
      // Add delay to ensure local tracks are ready
      setTimeout(async () => {
        try {
          // CRITICAL: Verify we have local tracks before creating offer
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
};