// src/webrtc/attemptReconnect.js
/**
 * attemptReconnect will try reconnecting up to max attempts.
 *
 * @param {Object} params
 * @param {React.MutableRefObject<number>} params.reconnectAttemptsRef
 * @param {number} params.maxReconnectAttempts
 * @param {(msg: string, type?: string) => void} params.addNotification - function to show notifications
 * @param {Object} params.callInfo - should contain callId and roomId
 * @param {() => void} params.initializeWebRTCConnection - function to re-init connection
 */
export function attemptReconnectFn({ reconnectAttemptsRef, maxReconnectAttempts, addNotification, callInfo, initializeWebRTCConnection }) {
  if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
    addNotification('Failed to reconnect after multiple attempts', 'error');
    return;
  }

  reconnectAttemptsRef.current += 1;
  addNotification(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`, 'warning');

  setTimeout(() => {
    if (callInfo?.callId && callInfo?.roomId) {
      console.log('🔄 Attempting reconnect');
      initializeWebRTCConnection();
    } else {
      console.warn('Reconnect aborted: missing callInfo.callId or callInfo.roomId');
    }
  }, 2000);
}
