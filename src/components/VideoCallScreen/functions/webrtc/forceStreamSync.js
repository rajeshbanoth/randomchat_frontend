// src/webrtc/forceStreamSync.js

/**
 * Force synchronization of local & remote streams
 */
export function forceStreamSyncFn({
  localStreamRef,
  localVideoRef,
  peerConnectionRef,
  remoteStreamRef,
  remoteVideoRef,
  setRemoteStream
}) {
  console.log('🔄 Forcing stream synchronization...');

  // ===== LOCAL STREAM SYNC =====
  if (localStreamRef.current && localVideoRef.current) {
    if (localVideoRef.current.srcObject !== localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      console.log('✅ Synced local video element');
    }

    const localTracks = localStreamRef.current.getTracks();
    console.log(
      '📱 Local tracks:',
      localTracks.map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState
      }))
    );
  }

  // ===== REMOTE STREAM SYNC =====
  if (peerConnectionRef.current) {
    const pc = peerConnectionRef.current;
    const receivers = pc.getReceivers();

    console.log('📥 Checking receivers for remote tracks:', receivers.length);

    receivers.forEach((receiver, idx) => {
      if (receiver.track && receiver.track.readyState === 'live') {
        console.log(`✅ Receiver ${idx} has live ${receiver.track.kind} track`);

        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          console.log('📹 Created new remote stream');
        }

        const existingTrack = remoteStreamRef.current
          .getTracks()
          .find(t => t.id === receiver.track.id);

        if (!existingTrack) {
          remoteStreamRef.current.addTrack(receiver.track);
          console.log(`✅ Added ${receiver.track.kind} track to remote stream`);
        }
      }
    });

    if (remoteStreamRef.current && remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        console.log('🎥 Updated remote video with synchronized stream');
      }

      setRemoteStream(remoteStreamRef.current);

      console.log('📊 Final remote stream state:', {
        tracks: remoteStreamRef.current.getTracks().length,
        videoTracks: remoteStreamRef.current.getVideoTracks().length,
        audioTracks: remoteStreamRef.current.getAudioTracks().length
      });
    }
  }
}
