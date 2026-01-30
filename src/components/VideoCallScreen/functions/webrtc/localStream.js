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
  if (isInitializing) {
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

    // Stop any existing stream FIRST (critical)
    if (localStreamRef.current) {
      console.log('🛑 Stopping existing local stream tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          console.log(`🛑 Stopped ${track.kind} track`);
        } catch (e) {
          console.warn('Error stopping track', e);
        }
      });
      localStreamRef.current = null;
    }

    // Short pause
    await new Promise(resolve => setTimeout(resolve, 100));

    // Build constraints
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

    // Track listeners
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

    if (localVideoRef?.current) {
      localVideoRef.current.srcObject = stream;
      console.log('✅ Local video element updated');

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
      return initializeLocalStreamFn({
        isInitializing: false, // allow re-entry
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

    // All retries failed
    setDeviceError('Cannot access camera or microphone. Please check permissions and ensure no other app is using the camera.');
    addNotification?.('Cannot access camera/microphone. Using placeholder.', 'error');

    const placeholder = createPlaceholderStreamFn({
      localStreamRef,
      setLocalStream,
      setHasLocalStream,
      localVideoRef,
      setIsVideoEnabled
    });

    return placeholder;
  } finally {
    setIsInitializing(false);
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
