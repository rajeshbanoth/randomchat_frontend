// // src/webrtc/forceStreamSync.js

// /**
//  * Force synchronization of local & remote streams
//  */
// export function forceStreamSyncFn({
//   localStreamRef,
//   localVideoRef,
//   peerConnectionRef,
//   remoteStreamRef,
//   remoteVideoRef,
//   setRemoteStream
// }) {
//   console.log('🔄 Forcing stream synchronization...');

//   // ===== LOCAL STREAM SYNC =====
//   if (localStreamRef.current && localVideoRef.current) {
//     if (localVideoRef.current.srcObject !== localStreamRef.current) {
//       localVideoRef.current.srcObject = localStreamRef.current;
//       console.log('✅ Synced local video element');
//     }

//     const localTracks = localStreamRef.current.getTracks();
//     console.log(
//       '📱 Local tracks:',
//       localTracks.map(t => ({
//         kind: t.kind,
//         enabled: t.enabled,
//         readyState: t.readyState
//       }))
//     );
//   }

//   // ===== REMOTE STREAM SYNC =====
//   if (peerConnectionRef.current) {
//     const pc = peerConnectionRef.current;
//     const receivers = pc.getReceivers();

//     console.log('📥 Checking receivers for remote tracks:', receivers.length);

//     receivers.forEach((receiver, idx) => {
//       if (receiver.track && receiver.track.readyState === 'live') {
//         console.log(`✅ Receiver ${idx} has live ${receiver.track.kind} track`);

//         if (!remoteStreamRef.current) {
//           remoteStreamRef.current = new MediaStream();
//           console.log('📹 Created new remote stream');
//         }

//         const existingTrack = remoteStreamRef.current
//           .getTracks()
//           .find(t => t.id === receiver.track.id);

//         if (!existingTrack) {
//           remoteStreamRef.current.addTrack(receiver.track);
//           console.log(`✅ Added ${receiver.track.kind} track to remote stream`);
//         }
//       }
//     });

//     if (remoteStreamRef.current && remoteVideoRef.current) {
//       if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
//         remoteVideoRef.current.srcObject = remoteStreamRef.current;
//         console.log('🎥 Updated remote video with synchronized stream');
//       }

//       setRemoteStream(remoteStreamRef.current);

//       console.log('📊 Final remote stream state:', {
//         tracks: remoteStreamRef.current.getTracks().length,
//         videoTracks: remoteStreamRef.current.getVideoTracks().length,
//         audioTracks: remoteStreamRef.current.getAudioTracks().length
//       });
//     }
//   }
// }


/**
 * Force synchronization of local & remote streams
 * Enhanced with detailed diagnostic logging
 */
export function forceStreamSyncFn({
  localStreamRef,
  localVideoRef,
  peerConnectionRef,
  remoteStreamRef,
  remoteVideoRef,
  setRemoteStream
}) {
  const ts = () => new Date().toISOString().slice(11, 23); // [HH:mm:ss.SSS]

  console.log(`[${ts()}] [FORCE-SYNC] Starting forced stream synchronization`);

  // ─── LOCAL STREAM SYNC ─────────────────────────────────────────
  if (!localStreamRef.current) {
    console.warn(`[${ts()}] [LOCAL-SYNC] No local stream reference available`);
  } else if (!localStreamRef.current.active) {
    console.warn(`[${ts()}] [LOCAL-SYNC] Local stream exists but is NOT active`, {
      id: localStreamRef.current.id?.substring(0, 8) || 'no-id',
      active: localStreamRef.current.active
    });
  } else if (!localVideoRef.current) {
    console.warn(`[${ts()}] [LOCAL-SYNC] localVideoRef.current is null — cannot attach local stream`);
  } else {
    // Check if already correctly attached
    const currentlyAttached = localVideoRef.current.srcObject === localStreamRef.current;

    console.log(`[${ts()}] [LOCAL-SYNC] Local stream status`, {
      hasStream: true,
      active: localStreamRef.current.active,
      trackCount: localStreamRef.current.getTracks().length,
      alreadyAttached: currentlyAttached
    });

    if (!currentlyAttached) {
      console.log(`[${ts()}] [LOCAL-SYNC] Attaching local stream to video element`);
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.playsInline = true;
      localVideoRef.current.muted = true; // local preview usually muted

      // Attempt to play (usually not needed for local, but good practice)
      localVideoRef.current.play()
        .then(() => console.log(`[${ts()}] [LOCAL-SYNC] Local video element started playing`))
        .catch(err => console.warn(`[${ts()}] [LOCAL-SYNC] Local video play() failed`, {
          name: err.name,
          message: err.message
        }));
    } else {
      console.debug(`[${ts()}] [LOCAL-SYNC] Local video already has correct srcObject`);
    }

    // Detailed local tracks report
    const localTracks = localStreamRef.current.getTracks();
    console.log(`[${ts()}] [LOCAL-TRACKS] ${localTracks.length} local tracks:`, 
      localTracks.map(t => ({
        kind: t.kind,
        id: t.id?.substring(0, 8) || 'no-id',
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted,
        label: t.label || '(no label)'
      }))
    );
  }

  // ─── REMOTE STREAM SYNC ────────────────────────────────────────
  if (!peerConnectionRef.current) {
    console.warn(`[${ts()}] [REMOTE-SYNC] No PeerConnection available — cannot sync remote tracks`);
  } else {
    const pc = peerConnectionRef.current;

    console.log(`[${ts()}] [REMOTE-SYNC] Checking receivers`, {
      signalingState: pc.signalingState,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      receiversCount: pc.getReceivers().length
    });

    const receivers = pc.getReceivers();

    if (receivers.length === 0) {
      console.warn(`[${ts()}] [REMOTE-SYNC] No receivers found in PeerConnection`);
    }

    let addedAny = false;

    receivers.forEach((receiver, idx) => {
      const track = receiver.track;

      if (!track) {
        console.debug(`[${ts()}] [REMOTE-SYNC] Receiver ${idx} has no track`);
        return;
      }

      console.log(`[${ts()}] [REMOTE-SYNC] Receiver ${idx} track:`, {
        kind: track.kind,
        id: track.id?.substring(0, 8) || 'no-id',
        readyState: track.readyState,
        enabled: track.enabled,
        muted: track.muted
      });

      if (track.readyState !== 'live') {
        console.warn(`[${ts()}] [REMOTE-SYNC] Track is not live (${track.readyState}) — skipping`);
        return;
      }

      if (!remoteStreamRef.current) {
        console.log(`[${ts()}] [REMOTE-SYNC] Creating new MediaStream for remote tracks`);
        remoteStreamRef.current = new MediaStream();
      }

      const rs = remoteStreamRef.current;

      const alreadyAdded = rs.getTracks().some(t => t.id === track.id);

      if (!alreadyAdded) {
        console.log(`[${ts()}] [REMOTE-SYNC] Adding new ${track.kind} track to remote stream`);
        rs.addTrack(track);
        addedAny = true;
      } else {
        console.debug(`[${ts()}] [REMOTE-SYNC] Track ${track.id?.substring(0,8)} already in remote stream`);
      }
    });

    // ─── ATTACH TO VIDEO ELEMENT & UPDATE STATE ──────────────────
    if (remoteStreamRef.current) {
      console.log(`[${ts()}] [REMOTE-SYNC] Final remote stream composition`, {
        trackCount: remoteStreamRef.current.getTracks().length,
        videoTracks: remoteStreamRef.current.getVideoTracks().length,
        audioTracks: remoteStreamRef.current.getAudioTracks().length
      });

      if (remoteVideoRef.current) {
        const currentlyAttached = remoteVideoRef.current.srcObject === remoteStreamRef.current;

        if (!currentlyAttached || addedAny) {
          console.log(`[${ts()}] [REMOTE-SYNC] Attaching/refreshing remote stream to video element`);
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.playsInline = true;
          remoteVideoRef.current.muted = false;

          // Force play attempt
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => console.log(`[${ts()}] [REMOTE-VIDEO] Remote video playback started`))
              .catch(err => {
                console.warn(`[${ts()}] [REMOTE-VIDEO] Auto-play failed`, {
                  name: err.name,
                  message: err.message
                });
              });
          }
        } else {
          console.debug(`[${ts()}] [REMOTE-SYNC] Remote video already has correct srcObject`);
        }
      } else {
        console.warn(`[${ts()}] [REMOTE-SYNC] remoteVideoRef.current is null — cannot attach stream`);
      }

      // Update React state if function is provided
      if (typeof setRemoteStream === 'function') {
        console.log(`[${ts()}] [STATE] Updating remote stream in React state`);
        setRemoteStream(remoteStreamRef.current);
      }
    } else {
      console.warn(`[${ts()}] [REMOTE-SYNC] No remote stream after receiver check`);
    }
  }

  console.log(`[${ts()}] [FORCE-SYNC] Stream synchronization complete`);
}