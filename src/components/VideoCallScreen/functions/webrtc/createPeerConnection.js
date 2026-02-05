// // src/components/functions/webrtc/createPeerConnection.js
// export const createPeerConnectionFn = ({
//   peerConnectionRef,
//   localStreamRef,
//   remoteStreamRef,
//   remoteVideoRef,
//   socket,
//   callInfo,
//   sendWebRTCIceCandidate,
//   sendWebRTCOffer,
//   addNotification,
//   setConnectionStatus,
//   startStatsCollection,
//   forceStreamSync,
//   setRemoteStream,
//   monitorRemoteStream,
//   userProfile,
//   isVideoEnabled,
//   isAudioEnabled,
//   attemptReconnect,
//   reconnectAttemptsRef,
//   maxReconnectAttempts,
//   setIsRemoteVideoMuted,
//   setIsRemoteAudioMuted
// }) => (servers) => {
//   console.log('🔗 Creating peer connection with ICE servers:', servers.length);
 
//   const configuration = {
//     iceServers: servers,
//     iceCandidatePoolSize: 10,
//     iceTransportPolicy: 'all',
//     bundlePolicy: 'max-bundle',
//     rtcpMuxPolicy: 'require'
//   };
 
//   // Close existing peer connection if any
//   if (peerConnectionRef.current) {
//     console.log('🛑 Closing existing peer connection');
//     peerConnectionRef.current.close();
//   }
 
//   const pc = new RTCPeerConnection(configuration);
//   peerConnectionRef.current = pc;
 
//   // ========== CRITICAL FIX: Add local tracks FIRST ==========
//   if (localStreamRef.current) {
//     console.log('🎬 Adding local stream tracks to new peer connection:', {
//       videoTracks: localStreamRef.current.getVideoTracks().length,
//       audioTracks: localStreamRef.current.getAudioTracks().length,
//       totalTracks: localStreamRef.current.getTracks().length
//     });
   
//     localStreamRef.current.getTracks().forEach((track, index) => {
//       console.log(`📤 Adding ${track.kind} track ${index + 1}:`, {
//         enabled: track.enabled,
//         readyState: track.readyState,
//         id: track.id?.substring(0, 8)
//       });
     
//       try {
//         // IMPORTANT: Add track with the local stream
//         const sender = pc.addTrack(track, localStreamRef.current);
//         console.log(`✅ ${track.kind} track added successfully:`, {
//           senderId: sender.id?.substring(0, 8),
//           trackEnabled: sender.track?.enabled,
//           readyState: sender.track?.readyState
//         });
//       } catch (error) {
//         console.error(`❌ Failed to add ${track.kind} track:`, error);
       
//         // Alternative: Add transceiver if track addition fails
//         if (error.name === 'InvalidStateError' || error.name === 'InvalidAccessError') {
//           console.log(`🔄 Creating transceiver for ${track.kind} as fallback`);
//           try {
//             const transceiver = pc.addTransceiver(track, {
//               direction: 'sendrecv',
//               streams: [localStreamRef.current]
//             });
//             console.log(`✅ Created transceiver for ${track.kind}:`, {
//               mid: transceiver.mid,
//               direction: transceiver.direction
//             });
//           } catch (transceiverError) {
//             console.error(`❌ Failed to create transceiver:`, transceiverError);
//           }
//         }
//       }
//     });
//   } else {
//     console.warn('⚠️ No local stream available when creating peer connection');
//   }
 
//   // Log initial transceivers
//   setTimeout(() => {
//     const transceivers = pc.getTransceivers();
//     console.log('🔄 Initial transceivers count:', transceivers.length);
//     transceivers.forEach((tc, idx) => {
//       console.log(` Transceiver ${idx}:`, {
//         mid: tc.mid,
//         direction: tc.direction,
//         currentDirection: tc.currentDirection,
//         receiverTrack: tc.receiver.track?.kind || 'none',
//         senderTrack: tc.sender.track?.kind || 'none',
//         receiverEnabled: tc.receiver.track?.enabled,
//         senderEnabled: tc.sender.track?.enabled
//       });
//     });
//   }, 100);
 
//   // ========== EVENT HANDLERS ==========
 
//   pc.onicecandidate = (event) => {
//     if (event.candidate && socket?.connected && callInfo.partnerId) {
//       console.log('🧊 Sending ICE candidate to partner:', callInfo.partnerId.substring(0, 8));
//       sendWebRTCIceCandidate({
//         to: callInfo.partnerId,
//         candidate: event.candidate,
//         callId: callInfo.callId,
//         roomId: callInfo.roomId
//       });
//     } else if (!event.candidate) {
//       console.log('✅ All ICE candidates gathered');
//     }
//   };
 
//   // Log signaling state changes
//   pc.onsignalingstatechange = () => {
//     console.log('📶 Signaling state changed:', pc.signalingState);
//   };
 
//   pc.oniceconnectionstatechange = () => {
//     console.log('🧊 ICE connection state:', pc.iceConnectionState);
//     if (pc.iceConnectionState === 'failed') {
//       console.warn('⚠️ ICE connection failed, restarting ICE...');
//       pc.restartIce();
//     } else if (pc.iceConnectionState === 'connected') {
//       console.log('✅ ICE connection established!');
//       addNotification('Network connection established', 'success');
//     }
//   };
 
//   pc.onicegatheringstatechange = () => {
//     console.log('📡 ICE gathering state:', pc.iceGatheringState);
//   };
 
//   pc.onconnectionstatechange = () => {
//     console.log('🔄 Peer connection state:', pc.connectionState);
//     setConnectionStatus(pc.connectionState);
   
//     if (pc.connectionState === 'connected') {
//       console.log('✅ Peer connection established!');
//       addNotification('Video call connected!', 'success');
//       startStatsCollection();
     
//       // CRITICAL: Force stream sync on connection
//       setTimeout(() => {
//         forceStreamSync();
//       }, 1000);
//     } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
//       console.warn(`⚠️ Peer connection ${pc.connectionState}`);
//       if (pc.connectionState === 'failed' && reconnectAttemptsRef.current < maxReconnectAttempts) {
//         attemptReconnect();
//       }
//     }
//   };
 
//   // ========== CRITICAL: Enhanced ontrack handler ==========
//   pc.ontrack = (event) => {
//     console.log('🎬 Received remote track:', {
//       kind: event.track.kind,
//       id: event.track.id?.substring(0, 8) || 'unknown',
//       readyState: event.track.readyState,
//       enabled: event.track.enabled,
//       muted: event.track.muted,
//       streams: event.streams?.length || 0
//     });
   
//     // Create or get remote stream
//     if (!remoteStreamRef.current) {
//       console.log('📹 Creating new remote stream');
//       remoteStreamRef.current = new MediaStream();
//     }
   
//     const remoteStream = remoteStreamRef.current;
   
//     // Check if we already have this track
//     const existingTrack = remoteStream.getTracks().find(t => t.id === event.track.id);
   
//     if (!existingTrack) {
//       console.log(`✅ Adding ${event.track.kind} track to remote stream:`, {
//         trackId: event.track.id?.substring(0, 8),
//         enabled: event.track.enabled,
//         muted: event.track.muted
//       });
     
//       remoteStream.addTrack(event.track);
     
//       // Update the remote video element
//       if (remoteVideoRef.current) {
//         // Always update srcObject to ensure it's current
//         remoteVideoRef.current.srcObject = remoteStream;
//         console.log('🎥 Updated remote video element with stream');
       
//         // Set video attributes for better playback
//         remoteVideoRef.current.playsInline = true;
//         remoteVideoRef.current.muted = false;
       
//         // Force playback
//         const playPromise = remoteVideoRef.current.play();
//         if (playPromise !== undefined) {
//           playPromise.catch(err => {
//             console.warn('⚠️ Remote video auto-play failed:', err);
           
//             // Try again on user interaction
//             const playOnInteraction = () => {
//               remoteVideoRef.current?.play().then(() => {
//                 console.log('✅ Remote video playback started after interaction');
//                 document.removeEventListener('click', playOnInteraction);
//               }).catch(e => {
//                 console.error('❌ Still cannot play remote video:', e);
//               });
//             };
           
//             document.addEventListener('click', playOnInteraction);
//           }).then(() => {
//             console.log('✅ Remote video playback started successfully');
//           });
//         }
//       }
     
//       // Update React state
//       setRemoteStream(remoteStream);
//       monitorRemoteStream(remoteStream);
     
//       // Log current state
//       console.log('📊 Remote stream state:', {
//         videoTracks: remoteStream.getVideoTracks().length,
//         audioTracks: remoteStream.getAudioTracks().length,
//         allTracks: remoteStream.getTracks().map(t => ({
//           kind: t.kind,
//           id: t.id?.substring(0, 8),
//           enabled: t.enabled,
//           muted: t.muted
//         }))
//       });
     
//       addNotification(`Partner ${event.track.kind} received`, 'success');
//     } else {
//       console.log(`ℹ️ ${event.track.kind} track already in stream`);
//     }
   
//     // Handle track events
//     event.track.onended = () => {
//       console.log(`🛑 Remote ${event.track.kind} track ended`);
     
//       if (remoteStreamRef.current) {
//         remoteStreamRef.current.removeTrack(event.track);
//         console.log(`🛑 Removed ${event.track.kind} track from stream`);
       
//         // Update UI
//         if (event.track.kind === 'video') {
//           setIsRemoteVideoMuted(true);
//         } else {
//           setIsRemoteAudioMuted(true);
//         }
//       }
//     };
   
//     event.track.onmute = () => {
//       console.log(`🔇 Remote ${event.track.kind} track muted`);
//       if (event.track.kind === 'video') {
//         setIsRemoteVideoMuted(true);
//       } else {
//         setIsRemoteAudioMuted(true);
//       }
//     };
   
//     event.track.onunmute = () => {
//       console.log(`🔊 Remote ${event.track.kind} track unmuted`);
//       if (event.track.kind === 'video') {
//         setIsRemoteVideoMuted(false);
//       } else {
//         setIsRemoteAudioMuted(false);
//       }
//     };
//   };
 
//   pc.ondatachannel = (event) => {
//     console.log('📨 Data channel received:', event.channel.label);
//   };
 
//   pc.onnegotiationneeded = async () => {
//     console.log('🔁 Negotiation needed, current state:', pc.signalingState);
   
//     // Only create offer if we're the caller and in stable state
//     if (callInfo.isCaller && pc.signalingState === 'stable') {
//       console.log('📤 Creating offer as caller...');
     
//       // Add delay to ensure local tracks are ready
//       setTimeout(async () => {
//         try {
//           // CRITICAL: Verify we have local tracks before creating offer
//           const senders = pc.getSenders();
//           console.log(`📤 Checking senders before creating offer: ${senders.length} senders`);
         
//           if (senders.length === 0) {
//             console.warn('⚠️ No senders found, adding local tracks now...');
//             if (localStreamRef.current) {
//               localStreamRef.current.getTracks().forEach(track => {
//                 try {
//                   pc.addTrack(track, localStreamRef.current);
//                 } catch (error) {
//                   console.error('❌ Failed to add track in negotiation:', error);
//                 }
//               });
//             }
//           }
         
//           const offerOptions = {
//             offerToReceiveAudio: true,
//             offerToReceiveVideo: true,
//             voiceActivityDetection: true,
//             iceRestart: false
//           };
         
//           console.log('📝 Creating offer with options:', offerOptions);
//           const offer = await pc.createOffer(offerOptions);
//           console.log('✅ Offer created:', offer.type);
         
//           await pc.setLocalDescription(offer);
//           console.log('✅ Local description set');
         
//           if (socket?.connected && callInfo.partnerId) {
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
           
//             console.log('📤 Offer sent to partner:', callInfo.partnerId.substring(0, 8));
//           } else {
//             console.warn('⚠️ Cannot send offer: socket not connected or no partner');
//           }
//         } catch (error) {
//           console.error('❌ Error creating offer:', error);
//         }
//       }, 500);
//     } else {
//       console.log('ℹ️ Not creating offer:', {
//         isCaller: callInfo.isCaller,
//         signalingState: pc.signalingState,
//         role: callInfo.isCaller ? 'caller' : 'callee'
//       });
//     }
//   };
 
//   console.log('✅ Peer connection created successfully');
//   return pc;
// };
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
  const ts = () => new Date().toISOString().slice(11, 23); // [HH:mm:ss.SSS]

  console.log(`[${ts()}] [PC-CREATE] Creating new RTCPeerConnection`, {
    iceServerCount: servers.length,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceCandidatePoolSize: 10
  });

  // ─── CLEANUP EXISTING PC ───────────────────────────────────────
  if (peerConnectionRef.current) {
    console.warn(`[${ts()}] [PC-CREATE] Closing existing PeerConnection before creating new one`);
    try {
      peerConnectionRef.current.close();
      console.log(`[${ts()}] [PC-CREATE] Old PeerConnection closed`);
    } catch (closeErr) {
      console.error(`[${ts()}] [PC-CREATE] Error while closing old PC`, closeErr);
    }
    peerConnectionRef.current = null;
  }

  // ─── CREATE NEW PC ─────────────────────────────────────────────
  const configuration = {
    iceServers: servers,
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  const pc = new RTCPeerConnection(configuration);
  peerConnectionRef.current = pc;

  console.log(`[${ts()}] [PC-CREATE] New RTCPeerConnection instance created`);

  // ─── ADD LOCAL TRACKS (critical step) ──────────────────────────
  if (localStreamRef.current && localStreamRef.current.active) {
    const tracks = localStreamRef.current.getTracks();
    console.log(`[${ts()}] [TRACK-ADD] Adding ${tracks.length} local tracks to PeerConnection`, {
      video: localStreamRef.current.getVideoTracks().length,
      audio: localStreamRef.current.getAudioTracks().length,
      streamActive: localStreamRef.current.active,
      streamId: localStreamRef.current.id?.substring(0, 8)
    });

    tracks.forEach((track, idx) => {
      console.log(`[${ts()}] [TRACK-ADD] Attempting to add ${track.kind} track #${idx + 1}`, {
        trackId: track.id?.substring(0, 8) || 'no-id',
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted,
        label: track.label || '(no label)'
      });

      try {
        const sender = pc.addTrack(track, localStreamRef.current);
        console.log(`[${ts()}] [TRACK-ADD] Successfully added ${track.kind} via addTrack`, {
          senderId: sender?.id?.substring(0, 8) || 'no-sender-id',
          trackEnabled: sender.track?.enabled,
          trackReadyState: sender.track?.readyState
        });
      } catch (addErr) {
        console.error(`[${ts()}] [TRACK-ADD] addTrack failed for ${track.kind}`, {
          name: addErr.name,
          message: addErr.message
        });

        // Fallback: transceiver
        try {
          const transceiver = pc.addTransceiver(track, {
            direction: 'sendrecv',
            streams: [localStreamRef.current]
          });
          console.log(`[${ts()}] [TRACK-ADD] Fallback → created transceiver for ${track.kind}`, {
            mid: transceiver.mid,
            direction: transceiver.direction,
            currentDirection: transceiver.currentDirection
          });
        } catch (txErr) {
          console.error(`[${ts()}] [TRACK-ADD] addTransceiver also failed for ${track.kind}`, txErr);
        }
      }
    });
  } else {
    console.warn(`[${ts()}] [TRACK-ADD] No active local stream available at PC creation time`);
  }

  // ─── LOG INITIAL TRANSCEIVERS (very useful for debugging) ──────
  setTimeout(() => {
    const transceivers = pc.getTransceivers();
    console.log(`[${ts()}] [PC-STATE] Initial transceivers (${transceivers.length})`);

    transceivers.forEach((tc, i) => {
      console.log(`  Transceiver ${i + 1}:`, {
        mid: tc.mid || '(no mid yet)',
        direction: tc.direction,
        currentDirection: tc.currentDirection,
        senderTrack: tc.sender.track ? `${tc.sender.track.kind} (${tc.sender.track.id?.substring(0,8)})` : 'none',
        receiverTrack: tc.receiver.track ? `${tc.receiver.track.kind} (${tc.receiver.track.id?.substring(0,8)})` : 'none',
        senderEnabled: tc.sender.track?.enabled,
        receiverEnabled: tc.receiver.track?.enabled
      });
    });
  }, 150);

  // ─── EVENT HANDLERS ────────────────────────────────────────────

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      if (socket?.connected && callInfo.partnerId) {
        console.log(`[${ts()}] [ICE] Sending candidate to ${callInfo.partnerId.substring(0,8)}...`, {
          type: event.candidate.type || 'unknown',
          address: event.candidate.address || 'unknown',
          port: event.candidate.port,
          priority: event.candidate.priority
        });
        sendWebRTCIceCandidate({
          to: callInfo.partnerId,
          candidate: event.candidate,
          callId: callInfo.callId,
          roomId: callInfo.roomId
        });
      } else {
        console.warn(`[${ts()}] [ICE] Cannot send candidate — socket or partner missing`);
      }
    } else {
      console.log(`[${ts()}] [ICE] ICE gathering completed (null candidate)`);
    }
  };

  pc.onsignalingstatechange = () => {
    console.log(`[${ts()}] [SIGNALING] State → ${pc.signalingState}`);
  };

  pc.oniceconnectionstatechange = () => {
    console.log(`[${ts()}] [ICE-CONN] State → ${pc.iceConnectionState}`);

    if (pc.iceConnectionState === 'failed') {
      console.warn(`[${ts()}] [ICE-CONN] ICE failed — attempting restartIce()`);
      pc.restartIce();
    } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
      console.log(`[${ts()}] [ICE-CONN] ICE connected/completed`);
      addNotification?.('Network path established', 'success');
    }
  };

  pc.onicegatheringstatechange = () => {
    console.log(`[${ts()}] [ICE-GATHER] State → ${pc.iceGatheringState}`);
  };

  pc.onconnectionstatechange = () => {
    console.log(`[${ts()}] [PC-CONN] State → ${pc.connectionState}`);
    setConnectionStatus?.(pc.connectionState);

    if (pc.connectionState === 'connected') {
      console.log(`[${ts()}] [PC-CONN] Peer connection fully connected!`);
      addNotification?.('Video call connected!', 'success');
      startStatsCollection?.();

      setTimeout(() => {
        console.log(`[${ts()}] [STREAM-SYNC] Forcing stream sync after connection`);
        forceStreamSync?.();
      }, 800);
    } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      console.warn(`[${ts()}] [PC-CONN] Connection ${pc.connectionState}`);
      if (pc.connectionState === 'failed' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        console.log(`[${ts()}] [RECONNECT] Triggering reconnect attempt`);
        attemptReconnect?.();
      }
    }
  };

  // ─── MOST IMPORTANT: ontrack ───────────────────────────────────
  pc.ontrack = (event) => {
    const track = event.track;
    console.log(`[${ts()}] [ONTRACK] Received remote ${track.kind} track`, {
      trackId: track.id?.substring(0,8) || 'unknown',
      readyState: track.readyState,
      enabled: track.enabled,
      muted: track.muted,
      streamsCount: event.streams?.length || 0,
      transceiverMid: event.transceiver?.mid || 'none'
    });

    if (!remoteStreamRef.current) {
      console.log(`[${ts()}] [REMOTE-STREAM] Creating new MediaStream for remote tracks`);
      remoteStreamRef.current = new MediaStream();
    }

    const rs = remoteStreamRef.current;

    const alreadyPresent = rs.getTracks().some(t => t.id === track.id);
    if (!alreadyPresent) {
      console.log(`[${ts()}] [REMOTE-STREAM] Adding new ${track.kind} track to remote stream`);
      rs.addTrack(track);

      if (remoteVideoRef.current) {
        console.log(`[${ts()}] [VIDEO-ELEM] Attaching remote stream to <video>`);
        remoteVideoRef.current.srcObject = rs;
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.muted = false;

        const playPromise = remoteVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log(`[${ts()}] [VIDEO-ELEM] Remote video playback started`))
            .catch(err => {
              console.warn(`[${ts()}] [VIDEO-ELEM] Auto-play blocked`, {
                name: err.name,
                message: err.message
              });

              // Fallback: play on first user interaction
              const tryPlayOnClick = () => {
                remoteVideoRef.current?.play()
                  .then(() => {
                    console.log(`[${ts()}] [VIDEO-ELEM] Playback started after user interaction`);
                    document.removeEventListener('click', tryPlayOnClick);
                  })
                  .catch(e => console.error(`[${ts()}] [VIDEO-ELEM] Still failed to play`, e));
              };
              document.addEventListener('click', tryPlayOnClick, { once: true });
            });
        }
      } else {
        console.warn(`[${ts()}] [VIDEO-ELEM] remoteVideoRef.current is null — cannot attach stream`);
      }

      setRemoteStream?.(rs);
      monitorRemoteStream?.(rs);

      console.log(`[${ts()}] [REMOTE-STREAM] Current composition`, {
        videoTracks: rs.getVideoTracks().length,
        audioTracks: rs.getAudioTracks().length,
        totalTracks: rs.getTracks().length
      });

      addNotification?.(`Partner ${track.kind} track received`, 'success');
    } else {
      console.log(`[${ts()}] [REMOTE-STREAM] Track ${track.id?.substring(0,8)} already exists in stream`);
    }

    // ─── Track lifecycle listeners ───────────────────────────────
    track.onended = () => {
      console.log(`[${ts()}] [TRACK-END] Remote ${track.kind} track ended`);
      rs.removeTrack(track);
      if (track.kind === 'video') setIsRemoteVideoMuted?.(true);
      if (track.kind === 'audio') setIsRemoteAudioMuted?.(true);
    };

    track.onmute = () => {
      console.log(`[${ts()}] [TRACK-MUTE] Remote ${track.kind} → muted`);
      if (track.kind === 'video') setIsRemoteVideoMuted?.(true);
      if (track.kind === 'audio') setIsRemoteAudioMuted?.(true);
    };

    track.onunmute = () => {
      console.log(`[${ts()}] [TRACK-UNMUTE] Remote ${track.kind} → unmuted`);
      if (track.kind === 'video') setIsRemoteVideoMuted?.(false);
      if (track.kind === 'audio') setIsRemoteAudioMuted?.(false);
    };
  };

  pc.ondatachannel = (event) => {
    console.log(`[${ts()}] [DATA-CHANNEL] Received data channel: ${event.channel.label}`);
  };

  // ─── NEGOTIATION NEEDED ────────────────────────────────────────
  pc.onnegotiationneeded = async () => {
    console.log(`[${ts()}] [NEGOTIATION] onnegotiationneeded fired — current signaling: ${pc.signalingState}`);

    if (!callInfo.isCaller) {
      console.log(`[${ts()}] [NEGOTIATION] Not caller → skipping automatic offer`);
      return;
    }

    if (pc.signalingState !== 'stable') {
      console.log(`[${ts()}] [NEGOTIATION] Not in stable state → skipping offer`, {
        currentState: pc.signalingState
      });
      return;
    }

    console.log(`[${ts()}] [NEGOTIATION] Caller in stable state → creating offer`);

    setTimeout(async () => {
      try {
        const sendersBefore = pc.getSenders().length;
        console.log(`[${ts()}] [NEGOTIATION] Senders before offer: ${sendersBefore}`);

        // Last chance to add tracks if missing
        if (sendersBefore === 0 && localStreamRef.current) {
          console.warn(`[${ts()}] [NEGOTIATION] No senders → forcing track addition`);
          localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
        }

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          voiceActivityDetection: true
        });

        console.log(`[${ts()}] [NEGOTIATION] Offer created → setting local description`);
        await pc.setLocalDescription(offer);

        if (socket?.connected && callInfo.partnerId) {
          console.log(`[${ts()}] [NEGOTIATION] Sending offer to ${callInfo.partnerId.substring(0,8)}`);
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
        } else {
          console.warn(`[${ts()}] [NEGOTIATION] Cannot send offer — missing socket/partner`);
        }
      } catch (err) {
        console.error(`[${ts()}] [NEGOTIATION] Failed to create/send offer`, err);
      }
    }, 600);
  };

  console.log(`[${ts()}] [PC-CREATE] PeerConnection fully configured with all handlers`);
  return pc;
};