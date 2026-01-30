// src/webrtc/startStatsCollection.js
// Exports startStatsCollection and stopStatsCollection.
// Usage: call startStatsCollection({...}) and later stopStatsCollection(statsIntervalRef).

/**
 * @param {Object} params
 * @param {React.MutableRefObject<RTCPeerConnection>} params.peerConnectionRef
 * @param {React.MutableRefObject<number|null>} params.statsIntervalRef
 * @param {() => string} params.getConnectionStatus - function returning current connectionStatus
 * @param {(updater: Function|Object) => void} params.setCallStats - React setter for callStats
 */
export function startStatsCollectionFn({ peerConnectionRef, statsIntervalRef, getConnectionStatus, setCallStats }) {
  // clear any existing interval
  if (statsIntervalRef.current) {
    clearInterval(statsIntervalRef.current);
  }

  statsIntervalRef.current = setInterval(async () => {
    // Only collect when connected and peerConnection exists
    if (!peerConnectionRef.current || getConnectionStatus() !== 'connected') {
      return;
    }

    try {
      const stats = await peerConnectionRef.current.getStats();
      let audioStats = { inbound: {}, outbound: {} };
      let videoStats = { inbound: {}, outbound: {} };

      stats.forEach(report => {
        // inbound-rtp
        if (report.type === 'inbound-rtp') {
          if (report.kind === 'audio') {
            audioStats.inbound = {
              packetsReceived: report.packetsReceived,
              packetsLost: report.packetsLost,
              jitter: report.jitter,
              bytesReceived: report.bytesReceived
            };
          } else if (report.kind === 'video') {
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
        // outbound-rtp
        } else if (report.type === 'outbound-rtp') {
          if (report.kind === 'audio') {
            audioStats.outbound = {
              packetsSent: report.packetsSent,
              bytesSent: report.bytesSent
            };
          } else if (report.kind === 'video') {
            videoStats.outbound = {
              framesSent: report.framesSent,
              framesEncoded: report.framesEncoded,
              bytesSent: report.bytesSent,
              frameWidth: report.frameWidth,
              frameHeight: report.frameHeight,
              framesPerSecond: report.framesPerSecond
            };
          }
        // candidate-pair for RTT / bitrate
        } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          // currentRoundTripTime is seconds -> convert to ms
          setCallStats(prev => ({
            ...prev,
            rtt: (report.currentRoundTripTime ?? 0) * 1000,
            availableOutgoingBitrate: report.availableOutgoingBitrate
          }));
        }
      });

      setCallStats(prev => ({
        ...prev,
        audio: audioStats,
        video: videoStats,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error getting stats:', error);
    }
  }, 2000);
}

export function stopStatsCollectionFn(statsIntervalRef) {
  if (statsIntervalRef && statsIntervalRef.current) {
    clearInterval(statsIntervalRef.current);
    statsIntervalRef.current = null;
  }
}
