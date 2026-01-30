export const setupEventListeners = (
  handleVideoMatchReady,
  handleWebRTCOffer,
  handleWebRTCAnswer,
  handleWebRTCIceCandidate,
  handleWebRTCEnd
) => {
  const handleVideoCallReady = (event) => {
    console.log('🔔 Custom video-call-ready event:', event.detail);
    handleVideoMatchReady(event.detail);
  };
  
  const handleWebRTCOfferEvent = (event) => handleWebRTCOffer(event.detail);
  const handleWebRTCAnswerEvent = (event) => handleWebRTCAnswer(event.detail);
  const handleWebRTCIceCandidateEvent = (event) => handleWebRTCIceCandidate(event.detail);
  const handleWebRTCEndEvent = (event) => handleWebRTCEnd(event.detail);
  
  window.addEventListener('video-call-ready', handleVideoCallReady);
  window.addEventListener('webrtc-offer', handleWebRTCOfferEvent);
  window.addEventListener('webrtc-answer', handleWebRTCAnswerEvent);
  window.addEventListener('webrtc-ice-candidate', handleWebRTCIceCandidateEvent);
  window.addEventListener('webrtc-end', handleWebRTCEndEvent);
  
  return () => {
    window.removeEventListener('video-call-ready', handleVideoCallReady);
    window.removeEventListener('webrtc-offer', handleWebRTCOfferEvent);
    window.removeEventListener('webrtc-answer', handleWebRTCAnswerEvent);
    window.removeEventListener('webrtc-ice-candidate', handleWebRTCIceCandidateEvent);
    window.removeEventListener('webrtc-end', handleWebRTCEndEvent);
  };
};