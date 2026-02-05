// src/webrtc/localStream.js
// Contains initializeLocalStream and createPlaceholderStream
/**
 * initializeLocalStream attempts to getUserMedia with robust retries and fallbacks.
 *
 * @param {Object} params
 * @param {boolean} params.isInitializing - current boolean state (to avoid duplicate inits)
 * @param {(v:boolean) => void} params.setIsInitializing
 * @param {(err:string|null) => void} params.setDeviceError
 * @param {React.MutableRefObject<MediaStream|null>} params.localStreamRef
 * @param {(stream: MediaStream|null) => void} params.setLocalStream
 * @param {(b: boolean) => void} params.setHasLocalStream
 * @param {React.MutableRefObject<HTMLVideoElement|null>} params.localVideoRef
 * @param {(b:boolean) => void} params.setIsVideoEnabled
 * @param {(b:boolean) => void} params.setIsAudioEnabled
 * @param {React.MutableRefObject<number>} params.streamRetryCountRef
 * @param {number} params.maxStreamRetries
 * @param {(msg:string, type?: string) => void} params.addNotification
 * @returns {Promise<MediaStream>} - obtained stream or placeholder stream
 */
export async function initializeLocalStreamFn({
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
  maxStreamRetries = 3,
  addNotification
}) {
  const ts = () => new Date().toISOString().slice(11, 23); // [HH:mm:ss.SSS]

  if (isInitializing) {
    console.warn(`[${ts()}] [MEDIA-INIT] Already initializing — skipping duplicate call`);
    return null;
  }

  console.log(`[${ts()}] [MEDIA-INIT] Starting local stream initialization`);

  setIsInitializing(true);
  setDeviceError(null);

  try {
    // ─── DEVICE ENUMERATION (very useful for debugging) ────────────
    console.log(`[${ts()}] [DEVICES] Enumerating media devices...`);
    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoInputs = devices.filter(d => d.kind === 'videoinput');
    const audioInputs = devices.filter(d => d.kind === 'audioinput');

    console.log(`[${ts()}] [DEVICES] Found devices`, {
      videoCount: videoInputs.length,
      audioCount: audioInputs.length,
      videoDevices: videoInputs.map(d => ({
        label: d.label || '(no label - permission missing?)',
        deviceId: d.deviceId.substring(0, 8) + '...',
        groupId: d.groupId || 'none'
      })),
      audioDevices: audioInputs.map(d => ({
        label: d.label || '(no label - permission missing?)',
        deviceId: d.deviceId.substring(0, 8) + '...',
        groupId: d.groupId || 'none'
      }))
    });

    // ─── CLEAN UP EXISTING STREAM ─────────────────────────────────
    if (localStreamRef.current) {
      console.log(`[${ts()}] [CLEANUP] Stopping existing local stream tracks`);
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          console.log(`[${ts()}] [CLEANUP] Stopped ${track.kind} track (id: ${track.id?.substring(0,8)})`);
        } catch (stopErr) {
          console.warn(`[${ts()}] [CLEANUP] Error stopping ${track.kind} track`, {
            message: stopErr.message
          });
        }
      });
      localStreamRef.current = null;
    }

    await new Promise(r => setTimeout(r, 120)); // small breathing room

    // ─── BUILD CONSTRAINTS (logged per attempt) ────────────────────
    let baseConstraints = {
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

    // ─── MULTI-ATTEMPT LOGIC ──────────────────────────────────────
    let stream = null;
    let attempt = 0;
    const MAX_ATTEMPTS = 3;

    while (!stream && attempt < MAX_ATTEMPTS) {
      attempt++;
      console.log(`[${ts()}] [GUM-ATTEMPT] Trying getUserMedia — attempt ${attempt}/${MAX_ATTEMPTS}`);

      let currentConstraints = { ...baseConstraints };

      if (attempt === 2) {
        console.log(`[${ts()}] [GUM-ADAPT] Attempt 2 → removing exact deviceId`);
        if (videoInputs.length > 0) currentConstraints.video = true;
        if (audioInputs.length > 0) currentConstraints.audio = true;
      } else if (attempt === 3) {
        console.log(`[${ts()}] [GUM-ADAPT] Attempt 3 → minimal constraints`);
        currentConstraints = {
          video: videoInputs.length > 0 ? {
            width: { min: 320, ideal: 640, max: 1280 },
            height: { min: 240, ideal: 480, max: 720 },
            frameRate: { ideal: 15, max: 30 }
          } : false,
          audio: audioInputs.length > 0
        };
      }

      console.log(`[${ts()}] [GUM-CONSTRAINTS] Using constraints:`, currentConstraints);

      try {
        stream = await navigator.mediaDevices.getUserMedia(currentConstraints);
        console.log(`[${ts()}] [GUM-SUCCESS] getUserMedia succeeded on attempt ${attempt}`);
      } catch (gumErr) {
        console.warn(`[${ts()}] [GUM-FAIL] Attempt ${attempt} failed`, {
          name: gumErr.name,
          message: gumErr.message,
          stack: gumErr.stack?.split('\n').slice(0, 3)
        });

        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 600));
        }
      }
    }

    // ─── HANDLE FAILURE AFTER ALL ATTEMPTS ─────────────────────────
    if (!stream) {
      throw new Error(`getUserMedia failed after ${MAX_ATTEMPTS} attempts`);
    }

    // ─── STREAM SUCCESS HANDLING ──────────────────────────────────
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    console.log(`[${ts()}] [STREAM-INFO] Stream acquired successfully`, {
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
      totalTracks: stream.getTracks().length,
      active: stream.active,
      id: stream.id?.substring(0, 8)
    });

    // Detailed track report
    if (videoTracks.length > 0) {
      console.log(`[${ts()}] [VIDEO-TRACK]`, {
        id: videoTracks[0].id?.substring(0, 8),
        enabled: videoTracks[0].enabled,
        readyState: videoTracks[0].readyState,
        muted: videoTracks[0].muted,
        label: videoTracks[0].label || '(no label)'
      });
    }
    if (audioTracks.length > 0) {
      console.log(`[${ts()}] [AUDIO-TRACK]`, {
        id: audioTracks[0].id?.substring(0, 8),
        enabled: audioTracks[0].enabled,
        readyState: audioTracks[0].readyState,
        muted: audioTracks[0].muted,
        label: audioTracks[0].label || '(no label)'
      });
    }

    // ─── ATTACH EVENT LISTENERS ───────────────────────────────────
    videoTracks.forEach(track => {
      track.onended = () => {
        console.warn(`[${ts()}] [TRACK-EVENT] Video track ended`);
        setIsVideoEnabled(false);
      };
      track.onmute = () => {
        console.log(`[${ts()}] [TRACK-EVENT] Video track muted`);
        setIsVideoEnabled(false);
      };
      track.onunmute = () => {
        console.log(`[${ts()}] [TRACK-EVENT] Video track unmuted`);
        setIsVideoEnabled(true);
      };
    });

    audioTracks.forEach(track => {
      track.onended = () => {
        console.warn(`[${ts()}] [TRACK-EVENT] Audio track ended`);
        setIsAudioEnabled(false);
      };
      track.onmute = () => {
        console.log(`[${ts()}] [TRACK-EVENT] Audio track muted`);
        setIsAudioEnabled(false);
      };
      track.onunmute = () => {
        console.log(`[${ts()}] [TRACK-EVENT] Audio track unmuted`);
        setIsAudioEnabled(true);
      };
    });

    // ─── APPLY STREAM TO STATE & VIDEO ELEMENT ────────────────────
    localStreamRef.current = stream;
    setLocalStream(stream);
    setHasLocalStream(true);

    if (localVideoRef?.current) {
      console.log(`[${ts()}] [LOCAL-VIDEO] Attaching stream to local video element`);
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.playsInline = true;
      localVideoRef.current.muted = true; // local preview usually muted

      const playPromise = localVideoRef.current.play();
      playPromise
        .then(() => console.log(`[${ts()}] [LOCAL-VIDEO] Local preview playback started`))
        .catch(err => console.warn(`[${ts()}] [LOCAL-VIDEO] Local preview play() failed`, {
          name: err.name,
          message: err.message
        }));
    } else {
      console.warn(`[${ts()}] [LOCAL-VIDEO] localVideoRef.current is null — preview not shown`);
    }

    setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0]?.enabled !== false);
    setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0]?.enabled !== false);

    streamRetryCountRef.current = 0;
    console.log(`[${ts()}] [MEDIA-INIT] Local stream initialization successful`);

    return stream;

  } catch (error) {
    console.error(`[${ts()}] [MEDIA-FAIL] Failed to initialize local stream`, {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 4)
    });

    streamRetryCountRef.current = (streamRetryCountRef.current || 0) + 1;

    if (streamRetryCountRef.current < maxStreamRetries) {
      console.log(`[${ts()}] [RETRY] Retrying getUserMedia (${streamRetryCountRef.current}/${maxStreamRetries})`);
      setDeviceError(`Failed to access camera/microphone. Retrying (${streamRetryCountRef.current}/${maxStreamRetries})...`);

      await new Promise(r => setTimeout(r, 1000 * streamRetryCountRef.current));

      return initializeLocalStreamFn({
        isInitializing: false,
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
    }

    // ─── FINAL FAILURE → FALLBACK TO PLACEHOLDER ──────────────────
    console.error(`[${ts()}] [MEDIA-FINAL] All retries failed — falling back to placeholder`);

    setDeviceError('Cannot access camera or microphone. Using placeholder instead.');
    addNotification?.('Cannot access camera/microphone. Using placeholder.', 'error');

    // Assuming createPlaceholderStreamFn is defined elsewhere
    const placeholder = createPlaceholderStreamFn?.({
      localStreamRef,
      setLocalStream,
      setHasLocalStream,
      localVideoRef,
      setIsVideoEnabled
    });

    if (placeholder) {
      console.log(`[${ts()}] [PLACEHOLDER] Placeholder stream activated`);
      return placeholder;
    } else {
      console.error(`[${ts()}] [PLACEHOLDER] Failed to create placeholder stream`);
      return null;
    }

  } finally {
    setIsInitializing(false);
    console.log(`[${ts()}] [MEDIA-INIT] Initialization function completed (isInitializing = false)`);
  }
}

/**
 * createPlaceholderStream creates a canvas-based placeholder stream and hooks it up.
 *
 * @param {Object} params
 * @param {React.MutableRefObject<MediaStream|null>} params.localStreamRef
 * @param {(stream: MediaStream|null) => void} params.setLocalStream
 * @param {(b: boolean) => void} params.setHasLocalStream
 * @param {React.MutableRefObject<HTMLVideoElement|null>} params.localVideoRef
 * @param {(b: boolean) => void} params.setIsVideoEnabled
 * @returns {MediaStream}
 */
export function createPlaceholderStreamFn({ localStreamRef, setLocalStream, setHasLocalStream, localVideoRef, setIsVideoEnabled }) {
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
    const pulseSize = Math.sin(pulseValue) * 10 + 70;

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

  // store for cleanup if needed
  stream._animationFrame = animationFrame;

  localStreamRef.current = stream;
  setLocalStream(stream);
  setHasLocalStream(true);
  setIsVideoEnabled(false);

  if (localVideoRef?.current) {
    localVideoRef.current.srcObject = stream;
  }

  return stream;
}
