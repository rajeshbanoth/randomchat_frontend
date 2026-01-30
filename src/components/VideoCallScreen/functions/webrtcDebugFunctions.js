// webrtcDebugFunctions.js
// Exports two factory functions (named the same) that accept refs/state and return the real functions.
// The returned functions keep the same names: processQueuedIceCandidates and monitorStreams.

/**
 * Factory named `processQueuedIceCandidates`.
 * Usage: const processQueuedIceCandidates = processQueuedIceCandidates({ peerConnectionRef, queuedIceCandidatesRef, processingCandidatesRef });
 * Returns: async function processQueuedIceCandidates() { ... }
 */
export function processQueuedIceCandidates({ peerConnectionRef, queuedIceCandidatesRef, processingCandidatesRef }) {
  return async function processQueuedIceCandidates() {
    if (processingCandidatesRef.current || !queuedIceCandidatesRef.current.length) {
      return;
    }

    processingCandidatesRef.current = true;

    console.log(`🔄 Processing ${queuedIceCandidatesRef.current.length} queued ICE candidates`);

    try {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        const candidates = [...queuedIceCandidatesRef.current];
        queuedIceCandidatesRef.current = [];

        for (const candidate of candidates) {
          try {
            await peerConnectionRef.current.addIceCandidate(candidate);
            console.log('✅ Added queued ICE candidate');
          } catch (err) {
            console.error('❌ Failed to add queued ICE candidate:', err);
            // Put it back in queue
            queuedIceCandidatesRef.current.push(candidate);
          }
        }
      } else {
        console.log('ℹ️ PeerConnection or remoteDescription not ready yet. Will wait.');
      }
    } catch (error) {
      console.error('❌ Error processing queued ICE candidates:', error);
    } finally {
      processingCandidatesRef.current = false;
    }
  };
}

/**
 * Factory named `monitorStreams`.
 * Usage: const monitorStreams = monitorStreams({ localStreamRef, remoteStreamRef, peerConnectionRef, localVideoRef, remoteVideoRef, callInfo });
 * Returns: function monitorStreams() { ... }
 */
export function monitorStreams({ localStreamRef, remoteStreamRef, peerConnectionRef, localVideoRef, remoteVideoRef, callInfo }) {
  return function monitorStreams() {
    console.log('🔍 STREAM MONITOR ===');

    // Local Stream
    if (localStreamRef.current) {
      const localTracks = localStreamRef.current.getTracks();
      console.log('📱 Local Stream:', {
        active: localStreamRef.current.active,
        tracks: localTracks.length,
        video: localTracks.filter(t => t.kind === 'video').map(t => ({
          enabled: t.enabled,
          readyState: t.readyState,
          id: t.id?.substring(0, 8)
        })),
        audio: localTracks.filter(t => t.kind === 'audio').map(t => ({
          enabled: t.enabled,
          readyState: t.readyState,
          id: t.id?.substring(0, 8)
        }))
      });
    } else {
      console.log('📱 Local Stream: Not available');
    }

    // Remote Stream
    if (remoteStreamRef.current) {
      const remoteTracks = remoteStreamRef.current.getTracks();
      console.log('📹 Remote Stream:', {
        active: remoteStreamRef.current.active,
        tracks: remoteTracks.length,
        video: remoteTracks.filter(t => t.kind === 'video').map(t => ({
          enabled: t.enabled,
          readyState: t.readyState,
          id: t.id?.substring(0, 8)
        })),
        audio: remoteTracks.filter(t => t.kind === 'audio').map(t => ({
          enabled: t.enabled,
          readyState: t.readyState,
          id: t.id?.substring(0, 8)
        }))
      });
    } else {
      console.log('📹 Remote Stream: Not available');
    }

    // Peer Connection
    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;
      console.log('🔗 Peer Connection:', {
        signalingState: pc.signalingState,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        localDescription: pc.localDescription?.type || 'none',
        remoteDescription: pc.remoteDescription?.type || 'none'
      });

      // Senders
      try {
        const senders = pc.getSenders();
        console.log('📤 Senders:', senders.length);
        senders.forEach((sender, idx) => {
          console.log(`  Sender ${idx}:`, {
            track: sender.track?.kind,
            trackId: sender.track?.id?.substring(0, 8),
            enabled: sender.track?.enabled,
            readyState: sender.track?.readyState
          });
        });
      } catch (e) {
        console.warn('⚠️ Could not enumerate senders:', e);
      }

      // Receivers
      try {
        const receivers = pc.getReceivers();
        console.log('📥 Receivers:', receivers.length);
        receivers.forEach((receiver, idx) => {
          console.log(`  Receiver ${idx}:`, {
            track: receiver.track?.kind,
            trackId: receiver.track?.id?.substring(0, 8),
            enabled: receiver.track?.enabled,
            readyState: receiver.track?.readyState
          });
        });
      } catch (e) {
        console.warn('⚠️ Could not enumerate receivers:', e);
      }

      // Transceivers
      try {
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
      } catch (e) {
        console.warn('⚠️ Could not enumerate transceivers:', e);
      }
    } else {
      console.log('🔗 Peer Connection: Not available');
    }

    // Video elements
    console.log('🎥 Video Elements:', {
      localVideo: {
        hasSrcObject: !!localVideoRef.current?.srcObject,
        playing: !!localVideoRef.current && !localVideoRef.current?.paused,
        readyState: localVideoRef.current?.readyState
      },
      remoteVideo: {
        hasSrcObject: !!remoteVideoRef.current?.srcObject,
        playing: !!remoteVideoRef.current && !remoteVideoRef.current?.paused,
        readyState: remoteVideoRef.current?.readyState
      }
    });

    // Call info
    console.log('📞 Call Info:', {
      callId: callInfo.callId,
      roomId: callInfo.roomId,
      isCaller: callInfo.isCaller,
      partnerId: callInfo.partnerId ? callInfo.partnerId.substring(0, 8) : null,
      initialized: callInfo.initialized
    });

    console.log('=== END MONITOR ===');
  };
}



// webrtcHelpers.js
// Export factory functions with the same names you expect inside the component.
// Each exported function returns a function with the same name that uses the provided refs/state setters.

export function startStatsCollection({ statsIntervalRef, peerConnectionRef, getConnectionStatus, setCallStats }) {
  return function startStatsCollection() {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      try {
        const connectionStatus = typeof getConnectionStatus === 'function' ? getConnectionStatus() : getConnectionStatus;
        if (peerConnectionRef.current && connectionStatus === 'connected') {
          const stats = await peerConnectionRef.current.getStats();
          let audioStats = { inbound: {}, outbound: {} };
          let videoStats = { inbound: {}, outbound: {} };

          // In some browsers stats is an RTCStatsReport map-like object
          const iter = typeof stats.forEach === 'function' ? stats : Array.from(stats.values?.() ?? []);
          (iter.forEach ? iter : Array.prototype).forEach.call(iter, report => {
            if (!report || !report.type) return;

            if (report.type === 'inbound-rtp') {
              if (report.kind === 'audio' || report.mediaType === 'audio') {
                audioStats.inbound = {
                  packetsReceived: report.packetsReceived,
                  packetsLost: report.packetsLost,
                  jitter: report.jitter,
                  bytesReceived: report.bytesReceived
                };
              } else if (report.kind === 'video' || report.mediaType === 'video') {
                videoStats.inbound = {
                  framesReceived: report.framesReceived,
                  framesDecoded: report.framesDecoded,
                  framesDropped: report.framesDropped,
                  bytesReceived: report.bytesReceived,
                  frameWidth: report.frameWidth,
                  frameHeight: report.frameHeight,
                  framesPerSecond: report.framesPerSecond
                };
              }
            } else if (report.type === 'outbound-rtp') {
              if (report.kind === 'audio' || report.mediaType === 'audio') {
                audioStats.outbound = {
                  packetsSent: report.packetsSent,
                  bytesSent: report.bytesSent
                };
              } else if (report.kind === 'video' || report.mediaType === 'video') {
                videoStats.outbound = {
                  framesSent: report.framesSent,
                  framesEncoded: report.framesEncoded,
                  bytesSent: report.bytesSent,
                  frameWidth: report.frameWidth,
                  frameHeight: report.frameHeight,
                  framesPerSecond: report.framesPerSecond
                };
              }
            } else if (report.type === 'candidate-pair' && (report.state === 'succeeded' || report.nominated === true || report.state === 'succeeded')) {
              // Some browsers use currentRoundTripTime
              const rttMs = (typeof report.currentRoundTripTime === 'number') ? report.currentRoundTripTime * 1000 : report.roundTripTime ? report.roundTripTime * 1000 : undefined;
              setCallStats(prev => ({
                ...prev,
                rtt: rttMs ?? prev?.rtt,
                availableOutgoingBitrate: report.availableOutgoingBitrate ?? prev?.availableOutgoingBitrate
              }));
            }
          });

          setCallStats(prev => ({
            ...prev,
            audio: audioStats,
            video: videoStats,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error getting stats:', error);
      }
    }, 2000);
  };
}

export function attemptReconnect({ reconnectAttemptsRef, maxReconnectAttempts, addNotification, getCallInfo, initializeWebRTCConnection }) {
  return function attemptReconnect() {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      addNotification('Failed to reconnect after multiple attempts', 'error');
      return;
    }

    reconnectAttemptsRef.current += 1;
    addNotification(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`, 'warning');

    setTimeout(() => {
      const callInfo = typeof getCallInfo === 'function' ? getCallInfo() : getCallInfo;
      if (callInfo?.callId && callInfo?.roomId) {
        console.log('🔄 Attempting reconnect');
        if (typeof initializeWebRTCConnection === 'function') {
          initializeWebRTCConnection();
        } else {
          console.warn('initializeWebRTCConnection not provided to attemptReconnect factory.');
        }
      } else {
        console.warn('No callInfo available for reconnect.');
      }
    }, 2000);
  };
}

export function fetchIceServers({ setIceServers, fetchUrl = 'https://randomchat-lfo7.onrender.com/webrtc/config' }) {
  return async function fetchIceServers() {
    try {
      const response = await fetch(fetchUrl);
      const config = await response.json();
      console.log('🧊 ICE servers loaded:', config.iceServers?.length || 0);

      if (config.iceServers && config.iceServers.length > 0) {
        setIceServers(config.iceServers);
        return config.iceServers;
      } else {
        const fallbackServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ];
        setIceServers(fallbackServers);
        return fallbackServers;
      }
    } catch (error) {
      console.error('Failed to fetch ICE servers:', error);
      const fallbackServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ];
      setIceServers(fallbackServers);
      return fallbackServers;
    }
  };
}

export function createPlaceholderStream({ localStreamRef, setLocalStream, setHasLocalStream, setIsVideoEnabled, localVideoRef }) {
  return function createPlaceholderStream() {
    console.log('🎭 Creating placeholder stream');

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let animationFrame = null;
    let pulseValue = 0;

    const drawPlaceholder = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pulseValue = (pulseValue + 0.05) % (Math.PI * 2);
      const pulseSize = Math.abs(Math.sin(pulseValue)) * 10 + 70;

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 20, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('👤', canvas.width / 2, canvas.height / 2 - 10);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px Arial';
      ctx.fillText('Camera Unavailable', canvas.width / 2, canvas.height / 2 + 60);

      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Arial';
      ctx.fillText('Please check camera permissions', canvas.width / 2, canvas.height / 2 + 90);

      animationFrame = requestAnimationFrame(drawPlaceholder);
    };

    drawPlaceholder();
    const stream = canvas.captureStream(15); // 15 FPS
    stream._animationFrame = animationFrame;

    localStreamRef.current = stream;
    setLocalStream(stream);
    setHasLocalStream(true);
    setIsVideoEnabled(false);

    if (localVideoRef?.current) {
      try {
        localVideoRef.current.srcObject = stream;
      } catch (e) {
        console.warn('Unable to set placeholder stream to video element', e);
      }
    }

    return stream;
  };
}

export function initializeLocalStream({
  isInitializingGetter,
  setIsInitializing,
  setDeviceError,
  localStreamRef,
  localVideoRef,
  setLocalStream,
  setHasLocalStream,
  setIsVideoEnabled,
  setIsAudioEnabled,
  streamRetryCountRef,
  maxStreamRetries = 3,
  addNotification,
  createPlaceholderStreamFn
}) {
  return async function initializeLocalStream(forceRetry = false) {
    if (isInitializingGetter() && !forceRetry) {
      console.log('⏳ Already initializing local stream');
      return null;
    }

    setIsInitializing(true);
    setDeviceError(null);

    console.log('🎥 Requesting media devices...');

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');

      console.log('📱 Available devices:', {
        video: videoDevices.length,
        audio: audioDevices.length,
        devices: devices.map(d => ({
          kind: d.kind,
          label: d.label,
          deviceId: d.deviceId
        }))
      });

      if (localStreamRef.current) {
        console.log('🛑 Stopping existing local stream tracks...');
        localStreamRef.current.getTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
          console.log(`🛑 Stopped ${track.kind} track`);
        });
        localStreamRef.current = null;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

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

      if (videoDevices.length === 0) {
        console.warn('⚠️ No video devices found, using audio only');
        constraints.video = false;
      } else {
        constraints.video.deviceId = { exact: videoDevices[0].deviceId };
      }

      if (audioDevices.length === 0) {
        console.warn('⚠️ No audio devices found, using video only');
        constraints.audio = false;
      } else {
        constraints.audio.deviceId = { exact: audioDevices[0].deviceId };
      }

      let stream = null;
      let attemptCount = 0;
      const maxAttempts = 3;

      while (!stream && attemptCount < maxAttempts) {
        attemptCount++;
        console.log(`🔄 Attempt ${attemptCount}/${maxAttempts} to get media stream`);

        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log(`✅ Got stream on attempt ${attemptCount}`);
        } catch (error) {
          console.warn(`⚠️ Attempt ${attemptCount} failed:`, error.name, error.message);

          if (attemptCount < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (attemptCount === 2) {
              console.log('🔄 Trying without specific device IDs...');
              constraints = {
                video: videoDevices.length > 0,
                audio: audioDevices.length > 0
              };
            } else if (attemptCount === 3) {
              console.log('🔄 Trying with minimal constraints...');
              constraints = {
                video: videoDevices.length > 0 ? {
                  width: { min: 320, ideal: 640, max: 1280 },
                  height: { min: 240, ideal: 480, max: 720 },
                  frameRate: { ideal: 15, max: 30 }
                } : false,
                audio: audioDevices.length > 0
              };
            }
          }
        }
      }

      if (!stream) {
        throw new Error('Could not access media devices after multiple attempts');
      }

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      console.log('✅ Stream obtained:', {
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        videoEnabled: videoTracks[0]?.enabled ?? false,
        audioEnabled: audioTracks[0]?.enabled ?? false
      });

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
        localVideoRef.current.play().catch(err => {
          console.warn('⚠️ Local video auto-play failed:', err);
        });
      }

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
        await new Promise(resolve => setTimeout(resolve, 1000 * streamRetryCountRef.current));
        return initializeLocalStream(forceRetry || true);
      }

      setDeviceError('Cannot access camera or microphone. Please check permissions and ensure no other app is using the camera.');
      addNotification('Cannot access camera/microphone. Using placeholder.', 'error');

      if (typeof createPlaceholderStreamFn === 'function') {
        return createPlaceholderStreamFn();
      }
      return null;
    } finally {
      setIsInitializing(false);
    }
  };
}
