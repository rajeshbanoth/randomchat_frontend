// src/webrtc/fetchIceServers.js
/**
 * fetchIceServers loads ICE servers from remote endpoint or uses a fallback list.
 *
 * @param {Object} params
 * @param {(servers: any[]) => void} params.setIceServers - React setter for ice servers
 * @returns {Promise<any[]>} - iceServers array
 */
export async function fetchIceServersFn({ setIceServers }) {
  try {
    const response = await fetch('https://randomchat-lfo7.onrender.com/webrtc/config');
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
}
