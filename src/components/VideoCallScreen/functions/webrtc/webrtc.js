// webrtcUtils.js
// Standalone helpers to create and initialize WebRTC connections.
// Each function receives a single `deps` object containing refs, callbacks, and state setters.



// export async function initializeWebRTCConnectionFn(deps) {
//   // deps contains many pieces; destructure what's needed
//   const {
//     partner,
//     callInfoRef,
//     initializationRef,
//     setConnectionStatus,
//     localStreamRef,
//     initializeLocalStream,
//     iceServers,
//     fetchIceServers,
//     createPeerConnection, // you can pass the helper or import it externally
//     peerConnectionRef,
//     socket,
//     addNotification,
//     setCallInfo, // setter for callInfo state if needed to modify role
//     offerTimeoutRefs, // ref array for timeouts
//     maxReconnectAttempts,
//     reconnectAttemptsRef,
//     sendWebRTCOffer,
//     sendWebRTCAnswer,
//     userProfile,
//     isVideoEnabled,
//     isAudioEnabled,
//     startStatsCollection,
//     attemptReconnect,
//     forceStreamSync,
//     setRemoteStream,
//     monitorRemoteStream,
//     setIsRemoteVideoMuted,
//     setIsRemoteAudioMuted
//   } = deps;

//   if (initializationRef.current) {
//     console.log('⚠️ WebRTC already initialized');
//     return;
//   }

//   if (!partner) {
//     console.error('❌ Cannot initialize WebRTC: No partner');
//     addNotification?.('No partner available', 'error');
//     return;
//   }

//   if (!localStreamRef.current || !localStreamRef.current.active) {
//     console.warn('⚠️ Local stream not ready, initializing now...');
//     await initializeLocalStream?.(true);
//     if (!localStreamRef.current || !localStreamRef.current.active) {
//       console.error('❌ Cannot initialize WebRTC: Failed to get local stream');
//       addNotification?.('Failed to access camera/microphone', 'error');
//       return;
//     }
//   }

//   const callInfo = callInfoRef.current;
//   if (!callInfo?.callId || !callInfo?.roomId) {
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
//   setConnectionStatus?.('connecting');

//   try {
//     const servers = (iceServers && iceServers.length > 0) ? iceServers : await fetchIceServers();
//     console.log('🧊 Using ICE servers:', (servers || []).length);

//     // Create peer connection (this will add local tracks)
//     const pc = await createPeerConnection({
//       servers,
//       peerConnectionRef,
//       localStreamRef,
//       remoteStreamRef: deps.remoteStreamRef,
//       remoteVideoRef: deps.remoteVideoRef,
//       socket,
//       callInfoRef,
//       sendWebRTCIceCandidate: deps.sendWebRTCIceCandidate,
//       sendWebRTCOffer,
//       addNotification,
//       setConnectionStatus,
//       startStatsCollection,
//       attemptReconnect,
//       forceStreamSync,
//       setRemoteStream,
//       monitorRemoteStream,
//       setIsRemoteVideoMuted,
//       setIsRemoteAudioMuted,
//       maxReconnectAttempts,
//       reconnectAttemptsRef,
//       userProfile,
//       isVideoEnabled,
//       isAudioEnabled
//     });

//     // give a bit of time to settle
//     await new Promise(resolve => setTimeout(resolve, 300));

//     if (!peerConnectionRef.current) throw new Error('Failed to create peer connection');
//     const pcRef = peerConnectionRef.current;

//     // verify senders
//     let senders = pcRef.getSenders();
//     console.log(`📤 Initial senders count: ${senders.length}`);

//     if (senders.length === 0 && localStreamRef.current) {
//       console.warn('⚠️ No senders found, manually adding tracks...');
//       localStreamRef.current.getTracks().forEach(track => {
//         try {
//           const sender = pcRef.addTrack(track, localStreamRef.current);
//           console.log(`✅ Manually added ${track.kind} track:`, { senderId: sender.id?.substring(0, 8) });
//         } catch (error) {
//           console.error(`❌ Failed to manually add ${track.kind} track:`, error);
//           try {
//             const transceiver = pcRef.addTransceiver(track.kind, { direction: 'sendrecv', streams: [localStreamRef.current] });
//             console.log(`✅ Created transceiver for ${track.kind}`);
//           } catch (transceiverError) {
//             console.error(`❌ Failed to create transceiver:`, transceiverError);
//           }
//         }
//       });
//     }

//     // Role-based flow (caller / callee)
//     if (callInfo.isCaller) {
//       console.log('🎯 ROLE: CALLER - Will send offer after delay');

//       const baseDelay = 1000;
//       const randomDelay = Math.random() * 1000;
//       const totalDelay = baseDelay + randomDelay;

//       console.log(`⏳ Caller delay: ${Math.round(totalDelay)}ms`);

//       const offerTimeoutRef = setTimeout(async () => {
//         console.log('⏰ Caller delay complete, checking state...');
//         if (!peerConnectionRef.current || !socket?.connected || !callInfo.partnerId) {
//           console.warn('⚠️ Cannot send offer: connection not ready');
//           return;
//         }

//         const currentSignalingState = pcRef.signalingState;
//         const hasLocalOffer = pcRef.localDescription?.type === 'offer';
//         const hasRemoteOffer = pcRef.remoteDescription?.type === 'offer';

//         console.log('📊 Pre-offer state:', {
//           signalingState: currentSignalingState,
//           hasLocalOffer,
//           hasRemoteOffer,
//           senders: pcRef.getSenders().length,
//           receivers: pcRef.getReceivers().length
//         });

//         if (hasRemoteOffer) {
//           console.warn('⚠️ Race condition: Already have remote offer, becoming callee');
//           setCallInfo?.(prev => ({ ...prev, isCaller: false }));
//           try {
//             const answer = await pcRef.createAnswer();
//             await pcRef.setLocalDescription(answer);
//             sendWebRTCAnswer?.({
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

//         if (hasLocalOffer) {
//           console.log('ℹ️ Already have local offer, re-sending...');
//           sendWebRTCOffer?.({
//             to: callInfo.partnerId,
//             sdp: pcRef.localDescription,
//             callId: callInfo.callId,
//             roomId: callInfo.roomId,
//             metadata: { username: userProfile?.username || 'Anonymous', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
//           });
//           return;
//         }

//         // Normal create offer
//         try {
//           const offer = await pcRef.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true, voiceActivityDetection: true, iceRestart: false });
//           console.log('✅ Offer created:', offer.type);
//           await pcRef.setLocalDescription(offer);
//           console.log('✅ Local description (offer) set');

//           sendWebRTCOffer?.({
//             to: callInfo.partnerId,
//             sdp: offer,
//             callId: callInfo.callId,
//             roomId: callInfo.roomId,
//             metadata: { username: userProfile?.username || 'Anonymous', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
//           });
//           console.log('📤 Initial offer sent to partner');
//         } catch (error) {
//           console.error('❌ Failed to create/send offer:', error);
//           // retry once
//           setTimeout(async () => {
//             if (peerConnectionRef.current === pcRef) {
//               console.log('🔄 Retrying offer creation...');
//               try {
//                 const retryOffer = await pcRef.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
//                 await pcRef.setLocalDescription(retryOffer);
//                 sendWebRTCOffer?.({
//                   to: callInfo.partnerId,
//                   sdp: retryOffer,
//                   callId: callInfo.callId,
//                   roomId: callInfo.roomId,
//                   metadata: { username: userProfile?.username || 'Anonymous', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
//                 });
//                 console.log('📤 Retry offer sent');
//               } catch (retryError) {
//                 console.error('❌ Retry also failed:', retryError);
//               }
//             }
//           }, 1000);
//         }
//       }, totalDelay);

//       offerTimeoutRefs.current.push(offerTimeoutRef);
//     } else {
//       console.log('🎯 ROLE: CALLEE - Waiting for offer from caller...');
//       const offerWaitTimeout = setTimeout(() => {
//         console.log('⏰ Callee waiting timeout (15s), checking state...');
//         if (!pcRef.remoteDescription && setConnectionStatus) {
//           console.warn('⚠️ No offer received after 15 seconds');
//           if (socket?.connected && callInfo.partnerId) {
//             console.log('🔄 Callee becoming caller due to timeout...');
//             setCallInfo?.(prev => ({ ...prev, isCaller: true }));
//             pcRef.onnegotiationneeded?.();
//           }
//         }
//       }, 15000);

//       offerTimeoutRefs.current.push(offerWaitTimeout);
//     }

//     setTimeout(() => {
//       console.log('✅ WebRTC initialization sequence started');
//       console.log('📊 Initial connection state:', {
//         signalingState: pcRef.signalingState,
//         iceConnectionState: pcRef.iceConnectionState,
//         connectionState: pcRef.connectionState,
//         localDescription: pcRef.localDescription?.type || 'none',
//         remoteDescription: pcRef.remoteDescription?.type || 'none',
//         senders: pcRef.getSenders().length,
//         receivers: pcRef.getReceivers().length
//       });
//       forceStreamSync?.();
//     }, 1000);

//   } catch (error) {
//     console.error('❌ Failed to initialize WebRTC:', error);
//     addNotification?.('Failed to start video call', 'error');
//     initializationRef.current = false;
//     setConnectionStatus?.('failed');

//     if (reconnectAttemptsRef.current < (maxReconnectAttempts || 0)) {
//       reconnectAttemptsRef.current += 1;
//       console.log(`🔄 Attempting recovery (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
//       setTimeout(() => {
//         if (socket?.connected) {
//           initializeWebRTCConnection(deps); // retry
//         }
//       }, 2000 * reconnectAttemptsRef.current);
//     }
//   }
// }

export async function initializeWebRTCConnectionFn(deps) {
  const ts = () => new Date().toISOString().slice(11, 23); // [HH:mm:ss.SSS]

  const {
    partner,
    callInfoRef,
    initializationRef,
    setConnectionStatus,
    localStreamRef,
    initializeLocalStream,
    iceServers,
    fetchIceServers,
    createPeerConnection,
    peerConnectionRef,
    socket,
    addNotification,
    setCallInfo,
    offerTimeoutRefs,
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
    setIsRemoteAudioMuted,
    // assuming these are also passed when needed
    remoteStreamRef,
    remoteVideoRef,
    sendWebRTCIceCandidate
  } = deps;

  console.log(`[${ts()}] [INIT-WEBRTC] Starting WebRTC connection initialization`);

  // ─── GUARD CLAUSES ─────────────────────────────────────────────
  if (initializationRef.current) {
    console.warn(`[${ts()}] [INIT-WEBRTC] Already initializing — skipping duplicate call`);
    return;
  }

  if (!partner) {
    console.error(`[${ts()}] [INIT-WEBRTC] No partner — cannot proceed`, {
      partnerExists: !!partner,
      partnerId: partner?.id || partner?.partnerId || 'missing'
    });
    addNotification?.('No partner available', 'error');
    return;
  }

  // ─── ENSURE LOCAL STREAM ───────────────────────────────────────
  if (!localStreamRef.current || !localStreamRef.current.active) {
    console.warn(`[${ts()}] [INIT-WEBRTC] Local stream missing or inactive → forcing init`);

    await initializeLocalStream?.(true);

    if (!localStreamRef.current || !localStreamRef.current.active) {
      console.error(`[${ts()}] [INIT-WEBRTC] Local stream still invalid after forced init`, {
        hasStream: !!localStreamRef.current,
        active: localStreamRef.current?.active ?? false,
        tracks: localStreamRef.current?.getTracks()?.length ?? 0
      });
      addNotification?.('Failed to access camera/microphone', 'error');
      return;
    }

    console.log(`[${ts()}] [INIT-WEBRTC] Local stream ready after forced initialization`, {
      tracks: localStreamRef.current.getTracks().map(t => t.kind).join(', ')
    });
  }

  const callInfo = callInfoRef.current;

  if (!callInfo?.callId || !callInfo?.roomId) {
    console.error(`[${ts()}] [INIT-WEBRTC] Missing critical call info`, {
      hasCallId: !!callInfo?.callId,
      hasRoomId: !!callInfo?.roomId,
      hasPartnerId: !!callInfo?.partnerId
    });
    return;
  }

  // ─── ENTRY LOG ─────────────────────────────────────────────────
  console.log(`[${ts()}] [INIT-WEBRTC] Initializing connection`, {
    callId: callInfo.callId,
    roomId: callInfo.roomId,
    isCaller: callInfo.isCaller,
    partnerId: callInfo.partnerId?.substring(0, 8) + '...' || 'missing',
    socketConnected: socket?.connected ?? false,
    localTracks: localStreamRef.current?.getTracks()?.length ?? 0,
    streamActive: localStreamRef.current?.active ?? false
  });

  initializationRef.current = true;
  setConnectionStatus?.('connecting');

  try {
    // ─── ICE SERVERS ─────────────────────────────────────────────
    let servers = iceServers ?? [];
    if (servers.length === 0) {
      console.log(`[${ts()}] [ICE] No cached ICE servers — fetching fresh list`);
      servers = await fetchIceServers?.() ?? [];
      console.log(`[${ts()}] [ICE] Received ${servers.length} ICE server(s)`);
    } else {
      console.log(`[${ts()}] [ICE] Using ${servers.length} cached ICE server(s)`);
    }

    // ─── CREATE PEER CONNECTION ──────────────────────────────────
    console.log(`[${ts()}] [PC] Creating new RTCPeerConnection`);

    await createPeerConnection({
      servers,
      peerConnectionRef,
      localStreamRef,
      remoteStreamRef,
      remoteVideoRef,
      socket,
      callInfoRef,
      sendWebRTCIceCandidate,
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

    await new Promise(r => setTimeout(r, 400)); // let constructor and initial events settle

    if (!peerConnectionRef.current) {
      throw new Error("peerConnectionRef.current is null after createPeerConnection");
    }

    const pc = peerConnectionRef.current;

    console.log(`[${ts()}] [PC] PeerConnection created`, {
      signalingState: pc.signalingState,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState
    });

    // ─── VERIFY / FIX SENDERS ────────────────────────────────────
    let senders = pc.getSenders();
    console.log(`[${ts()}] [SENDERS] Initial senders count: ${senders.length}`);

    if (senders.length === 0 && localStreamRef.current) {
      console.warn(`[${ts()}] [SENDERS] No senders detected after create → manually adding tracks`);

      localStreamRef.current.getTracks().forEach(track => {
        try {
          const sender = pc.addTrack(track, localStreamRef.current);
          console.log(`[${ts()}] [SENDERS] Manually added ${track.kind} track`, {
            trackId: track.id?.substring(0, 8),
            senderId: sender?.id?.substring(0, 8),
            enabled: sender.track?.enabled
          });
        } catch (addErr) {
          console.error(`[${ts()}] [SENDERS] addTrack failed for ${track.kind}`, addErr);

          try {
            pc.addTransceiver(track.kind, {
              direction: 'sendrecv',
              streams: [localStreamRef.current]
            });
            console.log(`[${ts()}] [SENDERS] Created fallback transceiver for ${track.kind}`);
          } catch (txErr) {
            console.error(`[${ts()}] [SENDERS] addTransceiver also failed`, txErr);
          }
        }
      });

      senders = pc.getSenders(); // refresh
      console.log(`[${ts()}] [SENDERS] Senders after manual intervention: ${senders.length}`);
    }

    // ─── ROLE-SPECIFIC LOGIC ─────────────────────────────────────
    if (callInfo.isCaller) {
      console.log(`[${ts()}] [ROLE] Caller → preparing delayed offer`);

      const baseDelay = 1000;
      const jitter = Math.random() * 1000;
      const totalDelay = baseDelay + jitter;

      console.log(`[${ts()}] [OFFER-DELAY] Waiting ${Math.round(totalDelay)}ms (${baseDelay} + ${Math.round(jitter)} jitter)`);

      const offerTimeout = setTimeout(async () => {
        console.log(`[${ts()}] [OFFER-TIMEOUT] Delay complete — checking readiness`);

        if (!peerConnectionRef.current || !socket?.connected || !callInfo.partnerId) {
          console.warn(`[${ts()}] [OFFER] Cannot send offer — missing prerequisites`, {
            hasPC: !!peerConnectionRef.current,
            socketConnected: socket?.connected,
            hasPartnerId: !!callInfo.partnerId
          });
          return;
        }

        const state = {
          signaling: pc.signalingState,
          hasLocalOffer: pc.localDescription?.type === 'offer',
          hasRemoteOffer: pc.remoteDescription?.type === 'offer',
          senders: pc.getSenders().length,
          receivers: pc.getReceivers().length
        };

        console.log(`[${ts()}] [OFFER-STATE] Pre-offer snapshot`, state);

        // Race condition: already got remote offer → become callee
        if (state.hasRemoteOffer) {
          console.warn(`[${ts()}] [OFFER-RACE] Detected remote offer — switching to callee role`);
          setCallInfo?.(prev => ({ ...prev, isCaller: false }));

          try {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendWebRTCAnswer?.({
              to: callInfo.partnerId,
              sdp: answer,
              callId: callInfo.callId,
              roomId: callInfo.roomId
            });
            console.log(`[${ts()}] [ANSWER] Sent answer after race resolution`);
            return;
          } catch (answerErr) {
            console.error(`[${ts()}] [ANSWER] Failed to create/send answer in race handler`, answerErr);
          }
        }

        // Already have local offer → re-send
        if (state.hasLocalOffer) {
          console.log(`[${ts()}] [OFFER] Re-sending existing local offer`);
          sendWebRTCOffer?.({
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

        // Normal path: create new offer
        try {
          console.log(`[${ts()}] [OFFER] Creating new offer`);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
            voiceActivityDetection: true,
            iceRestart: false
          });

          console.log(`[${ts()}] [OFFER] Offer created → setting local description`);
          await pc.setLocalDescription(offer);

          console.log(`[${ts()}] [OFFER] Sending offer to partner`);
          sendWebRTCOffer?.({
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

          console.log(`[${ts()}] [OFFER] Initial offer sent successfully`);
        } catch (offerErr) {
          console.error(`[${ts()}] [OFFER] Failed to create/send offer`, {
            name: offerErr.name,
            message: offerErr.message
          });

          // Single retry
          setTimeout(async () => {
            if (peerConnectionRef.current === pc) {
              console.log(`[${ts()}] [OFFER-RETRY] Retrying offer creation`);
              try {
                const retryOffer = await pc.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true
                });
                await pc.setLocalDescription(retryOffer);
                sendWebRTCOffer?.({
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
                console.log(`[${ts()}] [OFFER-RETRY] Retry offer sent`);
              } catch (retryErr) {
                console.error(`[${ts()}] [OFFER-RETRY] Retry also failed`, retryErr);
              }
            }
          }, 1200);
        }
      }, totalDelay);

      offerTimeoutRefs.current.push(offerTimeout);
    } else {
      // ─── CALLEE ─────────────────────────────────────────────────
      console.log(`[${ts()}] [ROLE] Callee → waiting for incoming offer`);

      const waitTimeout = setTimeout(() => {
        console.log(`[${ts()}] [CALLEE-TIMEOUT] 15s timeout reached`);

        if (!pc.remoteDescription && setConnectionStatus) {
          console.warn(`[${ts()}] [CALLEE-TIMEOUT] No offer received while still connecting`);

          if (socket?.connected && callInfo.partnerId) {
            console.log(`[${ts()}] [CALLEE-TIMEOUT] Switching to caller role due to timeout`);
            setCallInfo?.(prev => ({ ...prev, isCaller: true }));
            pc.onnegotiationneeded?.();
          }
        }
      }, 15000);

      offerTimeoutRefs.current.push(waitTimeout);
    }

    // ─── FINAL SNAPSHOT & SYNC ───────────────────────────────────
    setTimeout(() => {
      console.log(`[${ts()}] [INIT-WEBRTC] Initialization phase completed`);

      if (peerConnectionRef.current) {
        const pcFinal = peerConnectionRef.current;
        console.log(`[${ts()}] [PC-FINAL] Connection state`, {
          signaling: pcFinal.signalingState,
          connection: pcFinal.connectionState,
          iceConnection: pcFinal.iceConnectionState,
          iceGathering: pcFinal.iceGatheringState,
          localDesc: pcFinal.localDescription?.type || 'none',
          remoteDesc: pcFinal.remoteDescription?.type || 'none',
          senders: pcFinal.getSenders().length,
          receivers: pcFinal.getReceivers().length
        });
      }

      console.log(`[${ts()}] [STREAM-SYNC] Forcing initial stream sync`);
      forceStreamSync?.();
    }, 1200);

  } catch (criticalError) {
    console.error(`[${ts()}] [INIT-WEBRTC] Critical failure during initialization`, {
      name: criticalError.name,
      message: criticalError.message,
      stack: criticalError.stack?.split('\n').slice(0, 4)
    });

    addNotification?.('Failed to start video call', 'error');
    initializationRef.current = false;
    setConnectionStatus?.('failed');

    // ─── RECONNECT LOGIC ─────────────────────────────────────────
    if (reconnectAttemptsRef.current < (maxReconnectAttempts || 3)) {
      reconnectAttemptsRef.current += 1;
      const delayMs = 2000 * reconnectAttemptsRef.current;

      console.log(`[${ts()}] [RECONNECT] Scheduling retry #${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delayMs}ms`);

      setTimeout(() => {
        if (socket?.connected) {
          console.log(`[${ts()}] [RECONNECT] Restarting WebRTC initialization`);
          initializeWebRTCConnectionFn(deps);
        } else {
          console.warn(`[${ts()}] [RECONNECT] Socket not connected — skipping retry`);
        }
      }, delayMs);
    }
  }
}