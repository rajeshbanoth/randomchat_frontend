// // components/VideoChatScreen.jsx - Updated to use WebRTCManager class
// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   FaArrowLeft, FaRandom, FaTimes, FaUser,
//   FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash,
//   FaPaperPlane, FaSearch, FaSync, FaCog,
//   FaUsers, FaHeart, FaComment, FaExpand, FaCompress,
//   FaExclamationTriangle, FaWifi, FaSignal, FaInfoCircle
// } from 'react-icons/fa';
// import WebRTCManager from './WebRTCManager';

// const VideoChatScreen = ({
//   socket,
//   partner,
//   messages,
//   userProfile,
//   searching,
//   autoConnect,
//   onSendMessage,
//   onDisconnect,
//   onNext,
//   onToggleAutoConnect,
//   onBack,
//   currentMode
// }) => {
//   const [message, setMessage] = useState('');
//   const [showChat, setShowChat] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [fullscreen, setFullscreen] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState('connecting');
//   const [webrtcError, setWebrtcError] = useState(null);
//   const [callStats, setCallStats] = useState({
//     bitrate: 0,
//     packetLoss: 0,
//     connectionQuality: 'good'
//   });
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [isReconnecting, setIsReconnecting] = useState(false);
  
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const callTimerRef = useRef(null);
//   const webrtcManagerRef = useRef(null);

//   // Initialize WebRTC when partner is connected
//   useEffect(() => {
//     if (partner && !searching && currentMode === 'video') {
//       initializeWebRTC();
//     }

//     return () => {
//       cleanupWebRTC();
//       if (callTimerRef.current) {
//         clearInterval(callTimerRef.current);
//       }
//     };
//   }, [partner, searching, currentMode]);

//   const initializeWebRTC = async () => {
//     try {
//       console.log('Initializing WebRTC for video chat');
      
//       if (!socket || !partner) {
//         throw new Error('Socket or partner not available');
//       }

//       // Clean up any existing WebRTC manager
//       if (webrtcManagerRef.current) {
//         webrtcManagerRef.current.cleanup();
//       }

//       // Generate a unique call ID
//       const callId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
//       // Create WebRTC manager instance
//       webrtcManagerRef.current = new WebRTCManager({
//         socket,
//         callId,
//         partnerId: partner.partnerId,
//         userProfile: {
//           ...userProfile,
//           socketId: socket.id
//         },
//         onLocalStream: (stream) => {
//           console.log('🎬 Local stream received');
//           setLocalStream(stream);
//           if (localVideoRef.current) {
//             localVideoRef.current.srcObject = stream;
//             localVideoRef.current.play().catch(console.error);
//           }
//         },
//         onRemoteStream: (stream) => {
//           console.log('🎬 Remote stream received');
//           setRemoteStream(stream);
//           if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = stream;
//             remoteVideoRef.current.play().catch(console.error);
//           }
//         },
//         onCallEnded: () => {
//           console.log('📞 Call ended');
//           handlePartnerDisconnected();
//         },
//         onConnectionStateChange: (state) => {
//           console.log('🔗 Connection state changed:', state);
//           setConnectionStatus(state);
//         },
//         onError: (error) => {
//           console.error('❌ WebRTC error:', error);
//           setWebrtcError(error.message);
//         },
//         onStatsUpdate: (stats) => {
//           setCallStats(stats);
//         }
//       });

//       // Initialize WebRTC connection
//       await webrtcManagerRef.current.initialize();
      
//       // Start call timer
//       startCallTimer();
      
//       console.log('✅ WebRTC initialization complete');

//     } catch (error) {
//       console.error('❌ Failed to initialize WebRTC:', error);
//       setWebrtcError(error.message);
//     }
//   };

//   const startCallTimer = () => {
//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//     }
    
//     callTimerRef.current = setInterval(() => {
//       setCallDuration(prev => prev + 1);
//     }, 1000);
//   };

//   const cleanupWebRTC = () => {
//     console.log('Cleaning up WebRTC resources...');
    
//     if (webrtcManagerRef.current) {
//       webrtcManagerRef.current.cleanup();
//       webrtcManagerRef.current = null;
//     }
    
//     // Clear video elements
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = null;
//     }
    
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = null;
//     }
    
//     // Clear timer
//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//       callTimerRef.current = null;
//     }
    
//     // Reset state
//     setConnectionStatus('disconnected');
//     setCallDuration(0);
//     setLocalStream(null);
//     setRemoteStream(null);
//     setWebrtcError(null);
//     setIsMuted(false);
//     setIsVideoOff(false);
//   };

//   const handlePartnerDisconnected = () => {
//     console.log('Partner disconnected in video call');
//     cleanupWebRTC();
    
//     if (autoConnect) {
//       // Auto search for new partner
//       setTimeout(() => {
//         onNext();
//       }, 2000);
//     } else {
//       // Return to home after delay
//       setTimeout(() => {
//         onBack();
//       }, 3000);
//     }
//   };

//   const toggleAudio = () => {
//     if (webrtcManagerRef.current) {
//       const newState = webrtcManagerRef.current.toggleAudio(isMuted);
//       setIsMuted(!newState);
//     }
//   };

//   const toggleVideo = () => {
//     if (webrtcManagerRef.current) {
//       const newState = webrtcManagerRef.current.toggleVideo(isVideoOff);
//       setIsVideoOff(!newState);
//     }
//   };

//   const toggleFullscreen = () => {
//     if (!fullscreen) {
//       document.documentElement.requestFullscreen();
//       setFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setFullscreen(false);
//     }
//   };

//   const handleSend = () => {
//     if (message.trim() && partner) {
//       onSendMessage(message);
//       setMessage('');
//     }
//   };

//   const handleDisconnect = () => {
//     if (webrtcManagerRef.current) {
//       webrtcManagerRef.current.endCall();
//     }
//     cleanupWebRTC();
//     onDisconnect();
//   };

//   const handleNext = () => {
//     if (webrtcManagerRef.current) {
//       webrtcManagerRef.current.endCall();
//     }
//     cleanupWebRTC();
//     onNext();
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getConnectionStatusColor = () => {
//     switch (connectionStatus) {
//       case 'connected':
//         return 'bg-green-500';
//       case 'connecting':
//         return 'bg-yellow-500';
//       case 'disconnected':
//         return 'bg-red-500';
//       case 'failed':
//         return 'bg-red-500';
//       default:
//         return 'bg-gray-500';
//     }
//   };

//   if (searching && !partner) {
//     return (
//       <div className="h-screen flex flex-col bg-black">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
//           <div className="max-w-6xl mx-auto flex items-center justify-between">
//             <button
//               onClick={onBack}
//               className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
//             >
//               <FaArrowLeft />
//               <span>Back to Home</span>
//             </button>
            
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm">Searching for video partner...</span>
//               </div>
              
//               <button
//                 onClick={() => setShowSettings(!showSettings)}
//                 className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
//               >
//                 <FaCog />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Searching Screen */}
//         <div className="flex-1 flex flex-col items-center justify-center p-6">
//           <div className="text-center max-w-md">
//             <div className="relative mb-8">
//               <div className="absolute inset-0">
//                 <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-ping"></div>
//               </div>
//               <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-4xl relative">
//                 <FaVideo className="animate-pulse" />
//               </div>
//             </div>
            
//             <h2 className="text-2xl font-bold mb-4">Looking for video partner...</h2>
//             <p className="text-gray-400 mb-8">
//               We're searching for someone to start a video call with
//             </p>
            
//             <div className="space-y-4">
//               <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
//                 <FaExclamationTriangle />
//                 <span>Make sure your camera and microphone are accessible</span>
//               </div>
              
//               <button
//                 onClick={onBack}
//                 className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
//               >
//                 Cancel Search
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Settings Panel */}
//         {showSettings && (
//           <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 border border-gray-700 shadow-2xl w-64">
//             <div className="space-y-4">
//               <div>
//                 <label className="flex items-center cursor-pointer">
//                   <div className="relative">
//                     <input
//                       type="checkbox"
//                       checked={autoConnect}
//                       onChange={(e) => onToggleAutoConnect(e.target.checked)}
//                       className="sr-only"
//                     />
//                     <div className={`w-10 h-5 rounded-full transition-colors ${
//                       autoConnect ? 'bg-green-500' : 'bg-gray-600'
//                     }`}></div>
//                     <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
//                       autoConnect ? 'transform translate-x-5' : ''
//                     }`}></div>
//                   </div>
//                   <span className="ml-3 text-sm text-gray-300">Auto-connect</span>
//                 </label>
//                 <p className="text-xs text-gray-400 mt-1">
//                   Automatically search for next partner
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-black">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-sm z-10">
//         <div className="max-w-6xl mx-auto flex items-center justify-between">
//           <button
//             onClick={onBack}
//             className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
//           >
//             <FaArrowLeft />
//             <span>Back</span>
//           </button>
          
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`}></div>
//               <span className="text-sm capitalize">{connectionStatus}</span>
//               <FaVideo className="text-red-400" />
//               <span className="text-sm">{formatTime(callDuration)}</span>
//             </div>
            
//             {partner && (
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
//                   {partner.profile?.username?.charAt(0) || 'S'}
//                 </div>
//                 <span className="font-medium">{partner.profile?.username || 'Stranger'}</span>
//               </div>
//             )}
            
//             <button
//               onClick={toggleFullscreen}
//               className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
//             >
//               {fullscreen ? <FaCompress /> : <FaExpand />}
//             </button>
            
//             <button
//               onClick={() => setShowSettings(!showSettings)}
//               className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
//             >
//               <FaCog />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* WebRTC Error Display */}
//       {webrtcError && (
//         <div className="bg-red-500/20 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
//           <div className="flex items-center">
//             <FaExclamationTriangle className="text-red-400 mr-2" />
//             <div>
//               <p className="text-red-200 font-medium">WebRTC Error</p>
//               <p className="text-red-300 text-sm">{webrtcError}</p>
//             </div>
//             <button
//               onClick={() => setWebrtcError(null)}
//               className="ml-auto text-red-300 hover:text-red-100"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Connection Quality Indicator */}
//       {connectionStatus === 'connected' && (
//         <div className={`px-4 py-2 mx-4 mt-4 rounded ${
//           callStats.connectionQuality === 'good' ? 'bg-green-500/20 text-green-400' :
//           callStats.connectionQuality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
//           'bg-red-500/20 text-red-400'
//         }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               {callStats.connectionQuality === 'good' && <FaWifi className="mr-2" />}
//               {callStats.connectionQuality === 'fair' && <FaSignal className="mr-2" />}
//               {callStats.connectionQuality === 'poor' && <FaExclamationTriangle className="mr-2" />}
//               <span className="capitalize">{callStats.connectionQuality} connection</span>
//             </div>
//             <div className="text-sm">
//               {callStats.bitrate > 0 && `${Math.round(callStats.bitrate / 1000)} kbps`}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Video Area */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Main Video */}
//         <div className="flex-1 relative bg-gray-950">
//           {/* Remote Video */}
//           <div className="absolute inset-0">
//             <video
//               ref={remoteVideoRef}
//               autoPlay
//               playsInline
//               className="w-full h-full object-cover"
//             />
            
//             {(!remoteStream || connectionStatus !== 'connected') && (
//               <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
//                 <div className="text-center">
//                   <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
//                     <FaUser className="text-4xl text-gray-600" />
//                   </div>
//                   <h3 className="text-2xl font-bold mb-2">
//                     {partner?.profile?.username || 'Stranger'}
//                   </h3>
//                   <p className="text-gray-400 capitalize">{connectionStatus}...</p>
//                   {isReconnecting && (
//                     <div className="mt-4 flex items-center justify-center">
//                       <FaSync className="animate-spin mr-2" />
//                       <span>Reconnecting...</span>
//                     </div>
//                   )}
//                   {partner?.compatibility && (
//                     <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm mt-2">
//                       <FaHeart className="mr-1" /> {partner.compatibility}% Match
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
            
//             {/* Local Video Preview */}
//             <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-700 bg-gray-900">
//               <video
//                 ref={localVideoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute bottom-2 right-2 flex space-x-1">
//                 {isMuted && (
//                   <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
//                     <FaMicrophoneSlash size={10} />
//                   </div>
//                 )}
//                 {isVideoOff && (
//                   <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
//                     <FaVideoSlash size={10} />
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Controls */}
//             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
//               <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
//                 <button
//                   onClick={toggleAudio}
//                   className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                     isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
//                   } transition-colors`}
//                 >
//                   {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
//                 </button>
                
//                 <button
//                   onClick={toggleVideo}
//                   className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                     isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
//                   } transition-colors`}
//                 >
//                   {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
//                 </button>
                
//                 <button
//                   onClick={handleDisconnect}
//                   className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center hover:opacity-90"
//                 >
//                   <FaTimes />
//                 </button>
                
//                 <button
//                   onClick={handleNext}
//                   className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:opacity-90"
//                 >
//                   <FaRandom />
//                 </button>
                
//                 <button
//                   onClick={() => setShowChat(!showChat)}
//                   className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center relative"
//                 >
//                   <FaComment />
//                   {messages.length > 0 && (
//                     <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center">
//                       {messages.length}
//                     </span>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Chat Panel */}
//         {showChat && (
//           <div className="w-80 border-l border-gray-800 bg-gray-900/80 backdrop-blur-sm flex flex-col">
//             {/* Chat Header */}
//             <div className="p-4 border-b border-gray-800">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-bold">Chat</h3>
//                 <button
//                   onClick={() => setShowChat(false)}
//                   className="p-1 hover:bg-gray-800 rounded"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4">
//               {messages.length > 0 ? (
//                 <div className="space-y-4">
//                   {messages.map((msg, index) => {
//                     const isMe = msg.sender === 'me';
                    
//                     return (
//                       <div
//                         key={index}
//                         className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
//                       >
//                         <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
//                           isMe
//                             ? 'bg-blue-500 text-white'
//                             : 'bg-gray-800 text-white'
//                         }`}>
//                           <p className="text-sm">{msg.text}</p>
//                           <div className="text-xs mt-1 opacity-75">
//                             {msg.senderName || (isMe ? 'You' : 'Partner')}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   <div ref={messagesEndRef} />
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <p className="text-gray-400">No messages yet</p>
//                 </div>
//               )}
//             </div>

//             {/* Message Input */}
//             <div className="p-4 border-t border-gray-800">
//               <div className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//                   placeholder="Type a message..."
//                   className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={!message.trim() || !partner}
//                   className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <FaPaperPlane />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Settings Panel */}
//       {showSettings && (
//         <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 border border-gray-700 shadow-2xl w-64">
//           <div className="space-y-4">
//             <div>
//               <label className="flex items-center cursor-pointer">
//                 <div className="relative">
//                   <input
//                     type="checkbox"
//                     checked={autoConnect}
//                     onChange={(e) => onToggleAutoConnect(e.target.checked)}
//                     className="sr-only"
//                   />
//                   <div className={`w-10 h-5 rounded-full transition-colors ${
//                     autoConnect ? 'bg-green-500' : 'bg-gray-600'
//                   }`}></div>
//                   <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
//                     autoConnect ? 'transform translate-x-5' : ''
//                   }`}></div>
//                 </div>
//                 <span className="ml-3 text-sm text-gray-300">Auto-connect</span>
//               </label>
//               <p className="text-xs text-gray-400 mt-1">
//                 Automatically search for next partner
//               </p>
//             </div>
            
//             <div>
//               <h4 className="text-sm font-medium text-gray-400 mb-2">Connection Status</h4>
//               <div className="flex items-center space-x-2">
//                 <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`}></div>
//                 <span className="text-sm capitalize">{connectionStatus}</span>
//               </div>
//             </div>
            
//             <div>
//               <h4 className="text-sm font-medium text-gray-400 mb-2">Call Stats</h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Quality:</span>
//                   <span className="capitalize">{callStats.connectionQuality}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Bitrate:</span>
//                   <span>{callStats.bitrate > 0 ? `${Math.round(callStats.bitrate / 1000)} kbps` : '--'}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Packet Loss:</span>
//                   <span>{callStats.packetLoss > 0 ? `${callStats.packetLoss.toFixed(1)}%` : '--'}</span>
//                 </div>
//               </div>
//             </div>
            
//             {partner && (
//               <div>
//                 <h4 className="text-sm font-medium text-gray-400 mb-2">Partner Info</h4>
//                 <div className="space-y-2">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
//                       {partner.profile?.username?.charAt(0) || 'S'}
//                     </div>
//                     <div className="text-sm">
//                       <div className="font-medium">{partner.profile?.username || 'Stranger'}</div>
//                       <div className="text-xs text-gray-400">{formatTime(callDuration)} call</div>
//                     </div>
//                   </div>
//                   {partner.profile?.chatMode && (
//                     <div className="text-xs text-gray-400">
//                       Mode: {partner.profile.chatMode === 'video' ? 'Video Chat' : 'Text Chat'}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoChatScreen;



import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FaArrowLeft, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaPhoneSlash, FaPaperPlane, FaSyncAlt, FaDesktop, FaRedoAlt, FaStop,
  FaRecordVinyl, FaCloudDownloadAlt, FaExchangeAlt, FaUserSlash,
  FaSmile, FaImage, FaGift, FaFilter, FaMagic, FaRobot, 
  FaVolumeUp, FaVolumeMute, FaLanguage, FaMusic, FaGamepad,
  FaFire, FaHeart, FaBolt, FaGhost, FaRandom
} from 'react-icons/fa';
import { GiSoundWaves } from 'react-icons/gi';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../context/ChatContext';
import './OmegleMobile.css';

// ICE servers configuration
const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

const VideoChatScreen = () => {
  const {
    socket,
    partner,
    messages,
    userProfile,
    searching,
    autoConnect,
    partnerTyping,
    sendMessage,
    disconnectPartner,
    nextPartner,
    addNotification,
    handleTypingStart,
    handleTypingStop,
    setCurrentScreen
  } = useChat();

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const socketRef = useRef(null);
  const partnerRef = useRef(partner);
  const messageEndRef = useRef(null);
  const swipeAreaRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // State
  const [inCall, setInCall] = useState(false);
  const [callInitiator, setCallInitiator] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState(null);
  const [callTimeSeconds, setCallTimeSeconds] = useState(0);
  const [callingState, setCallingState] = useState('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [audioMeter, setAudioMeter] = useState(0);
  const [partnerAudioLevel, setPartnerAudioLevel] = useState(0);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [chatTheme, setChatTheme] = useState('default');
  const [quickReactions, setQuickReactions] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState(100);
  const [matchEffects, setMatchEffects] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState('online');
  const [autoSkipTimer, setAutoSkipTimer] = useState(null);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [interestTags, setInterestTags] = useState(['video chat', 'random']);
  const [commonInterests, setCommonInterests] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper for partner and socket refs
  useEffect(() => { partnerRef.current = partner; }, [partner]);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  // Timer for call duration
  useEffect(() => {
    let timer = null;
    if (inCall) {
      timer = setInterval(() => setCallTimeSeconds(s => s + 1), 1000);
    } else {
      setCallTimeSeconds(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  // Format time
  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Enumerate devices
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audio = devices.filter(d => d.kind === 'audioinput');
      const video = devices.filter(d => d.kind === 'videoinput');
      setDevices({ audio, video });
      if (video.length > 0 && !selectedVideoDeviceId) {
        setSelectedVideoDeviceId(video[0].deviceId);
      }
    } catch (err) {
      console.error('Device enumeration failed', err);
    }
  }, [selectedVideoDeviceId]);

  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  // === MISSING FUNCTIONS ===

  // Start local media (camera + mic)
  const startLocalMedia = useCallback(async (videoDeviceId = null) => {
    try {
      setIsConnecting(true);
      const constraints = {
        audio: true,
        video: videoEnabled ? (videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true) : false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Add tracks to peer connection if it exists
      if (pcRef.current && stream) {
        // Remove existing tracks first
        const senders = pcRef.current.getSenders();
        senders.forEach(sender => {
          if (sender.track) {
            pcRef.current.removeTrack(sender);
          }
        });

        // Add new tracks
        stream.getTracks().forEach(track => {
          try {
            pcRef.current.addTrack(track, stream);
          } catch (err) {
            console.warn('addTrack failed', err);
          }
        });
      }

      // Ensure audio/video enabled state follows actual tracks
      setAudioEnabled(stream.getAudioTracks().some(t => t.enabled));
      setVideoEnabled(stream.getVideoTracks().some(t => t.enabled));

      setIsConnecting(false);
      return stream;
    } catch (err) {
      console.error('getUserMedia failed', err);
      addNotification('Unable to access camera/microphone', 'error');
      setIsConnecting(false);
      throw err;
    }
  }, [videoEnabled, addNotification]);

  // Stop local media
  const stopLocalMedia = useCallback(() => {
    try {
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error('stopLocalMedia error', err);
    }
  }, []);

  // Create RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    if (!socketRef.current) throw new Error('Socket not ready');

    const pc = new RTCPeerConnection({ 
      iceServers: DEFAULT_ICE_SERVERS,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        try {
          socketRef.current.emit('webrtc-ice-candidate', {
            to: partnerRef.current?.partnerId || partnerRef.current?.id,
            candidate: event.candidate
          });
        } catch (err) {
          console.error('Emit ICE failed', err);
        }
      }
    };

    pc.ontrack = (event) => {
      try {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          // Start monitoring partner audio
          monitorPartnerAudio(event.streams[0]);
        }
      } catch (err) {
        console.error('Set remote stream failed', err);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionQuality(
        state === 'connected' ? 100 :
        state === 'connecting' ? 60 :
        state === 'disconnected' ? 20 : 0
      );
      
      if (state === 'connected') {
        setCallingState('in-call');
        setInCall(true);
      } else if (state === 'disconnected' || state === 'failed') {
        setCallingState('idle');
        setInCall(false);
        addNotification('Connection lost. Reconnecting...', 'warning');
        setTimeout(() => {
          if (pcRef.current && partnerRef.current) {
            reconnectCall();
          }
        }, 2000);
      }
    };

    pcRef.current = pc;
    return pc;
  }, []);

  // Reconnect call
  const reconnectCall = useCallback(async () => {
    try {
      if (!pcRef.current || !partnerRef.current) return;
      
      const pc = pcRef.current;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socketRef.current.emit('webrtc-offer', {
        to: partnerRef.current.partnerId,
        sdp: offer
      });
      
      addNotification('Reconnecting...', 'info');
    } catch (err) {
      console.error('Reconnection failed:', err);
    }
  }, []);

  // Monitor partner audio for visualization
  const monitorPartnerAudio = (stream) => {
    try {
      if (!stream.getAudioTracks().length) return;
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setPartnerAudioLevel(average / 256);
        
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (err) {
      console.error('Audio monitoring error:', err);
    }
  };

  // Start outgoing call
  const startCall = useCallback(async () => {
    try {
      if (!socketRef.current) throw new Error('No socket');
      if (!partnerRef.current) throw new Error('No partner');

      setCallInitiator(true);
      setCallingState('dialing');
      
      // Show matching animation
      setMatchEffects(true);
      setTimeout(() => setMatchEffects(false), 2000);

      const pc = createPeerConnection();
      await startLocalMedia(selectedVideoDeviceId);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: true
      });
      await pc.setLocalDescription(offer);

      socketRef.current.emit('webrtc-offer', {
        to: partnerRef.current?.partnerId || partnerRef.current?.id,
        sdp: offer,
        metadata: {
          interests: interestTags,
          theme: chatTheme,
          language: translationEnabled ? 'auto' : null
        }
      });

      setInCall(true);
      addNotification('🤝 Connected with stranger!', 'success');
      
      // Start auto-skip timer if enabled
      if (autoSkipTimer) {
        setSkipCountdown(30);
      }
    } catch (err) {
      console.error('startCall error', err);
      addNotification('Failed to connect', 'error');
      setCallingState('idle');
      setMatchEffects(false);
    }
  }, [createPeerConnection, startLocalMedia, selectedVideoDeviceId, interestTags, chatTheme, translationEnabled, autoSkipTimer, addNotification]);

  // Accept incoming offer
  const acceptCall = useCallback(async (offer) => {
    try {
      setCallingState('ringing');
      const pc = createPeerConnection();
      await startLocalMedia(selectedVideoDeviceId);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('webrtc-answer', {
        to: partnerRef.current?.partnerId || partnerRef.current?.id,
        sdp: answer
      });

      setInCall(true);
      setIncomingOffer(null);
      setCallingState('in-call');
      addNotification('Call accepted', 'success');
    } catch (err) {
      console.error('acceptCall failed', err);
      addNotification('Failed to accept call', 'error');
      setCallingState('idle');
    }
  }, [createPeerConnection, startLocalMedia, selectedVideoDeviceId, addNotification]);

  // End call and cleanup
  const endCall = useCallback((emit = true) => {
    try {
      setInCall(false);
      setCallInitiator(false);
      setCallingState('idle');

      // Stop recorder
      if (isRecording) {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        }
        setIsRecording(false);
      }

      // Close peer connection
      try { 
        if (pcRef.current) {
          pcRef.current.close();
        }
      } catch (e) {}
      pcRef.current = null;

      // Stop local and screen streams
      stopLocalMedia();
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        setSharingScreen(false);
      }

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }

      if (emit && socketRef.current && partnerRef.current) {
        socketRef.current.emit('webrtc-end', {
          to: partnerRef.current?.partnerId || partnerRef.current?.id,
          reason: 'hangup'
        });
      }

      addNotification('Call ended', 'info');
    } catch (err) {
      console.error('endCall failed', err);
    }
  }, [isRecording, stopLocalMedia, addNotification]);

  // Toggle mic
  const toggleAudio = useCallback(() => {
    try {
      const stream = localStreamRef.current;
      if (!stream) return;
      stream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
      setAudioEnabled(stream.getAudioTracks().some(t => t.enabled));
    } catch (err) {
      console.error('toggleAudio', err);
    }
  }, []);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    try {
      const stream = localStreamRef.current;
      if (!stream) return;
      stream.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
      setVideoEnabled(stream.getVideoTracks().some(t => t.enabled));
    } catch (err) {
      console.error('toggleVideo', err);
    }
  }, []);

  // Switch camera
  const switchCamera = useCallback(async (deviceId) => {
    try {
      if (!deviceId) return;
      setSelectedVideoDeviceId(deviceId);
      
      const wasInCall = !!pcRef.current && inCall;
      if (wasInCall) {
        // Get new stream with new camera
        const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: { exact: deviceId } }, 
          audio: true 
        });
        
        // Replace video track in pc
        const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          const newTrack = newStream.getVideoTracks()[0];
          await sender.replaceTrack(newTrack);
        }
        
        // Update local stream element
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        localStreamRef.current = newStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
      } else {
        await startLocalMedia(deviceId);
      }
      addNotification('Camera switched', 'success');
    } catch (err) {
      console.error('switchCamera failed', err);
      addNotification('Failed to switch camera', 'error');
    }
  }, [inCall, startLocalMedia, addNotification]);

  // Screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!sharingScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: "always" },
          audio: true 
        });
        screenStreamRef.current = screenStream;
        setSharingScreen(true);

        // Replace video sender track with screen track
        const sender = pcRef.current?.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && screenStream.getVideoTracks()[0]) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }

        // When user stops sharing, revert to camera
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          setSharingScreen(false);
          if (localStreamRef.current && pcRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];
            const videoSender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
            if (videoSender && cameraTrack) {
              videoSender.replaceTrack(cameraTrack);
            }
          }
          screenStreamRef.current = null;
        });
      } else {
        // Stop sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
        }
        setSharingScreen(false);
      }
    } catch (err) {
      console.error('toggleScreenShare failed', err);
      addNotification('Failed to share screen', 'error');
    }
  }, [sharingScreen, addNotification]);

  // Recording functions
  const startRecording = useCallback(() => {
    try {
      const remoteStream = remoteVideoRef.current?.srcObject;
      const localStream = localStreamRef.current;
      if (!remoteStream && !localStream) {
        addNotification('No tracks to record', 'warning');
        return;
      }

      const mixedStream = new MediaStream();
      if (localStream) localStream.getTracks().forEach(t => mixedStream.addTrack(t));
      if (remoteStream) remoteStream.getTracks().forEach(t => mixedStream.addTrack(t));

      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const mr = new MediaRecorder(mixedStream, options);
      recorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `call-recording-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        addNotification('Recording downloaded', 'success');
      };

      mr.start();
      setIsRecording(true);
      addNotification('Recording started', 'info');
    } catch (err) {
      console.error('startRecording failed', err);
      addNotification('Failed to start recording', 'error');
    }
  }, [addNotification]);

  const stopRecording = useCallback(() => {
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      setIsRecording(false);
    } catch (err) {
      console.error('stopRecording failed', err);
    }
  }, []);

  // === CONTINUING WITH THE REST OF THE COMPONENT ===

  // Initialize swipe gesture
  useEffect(() => {
    const element = swipeAreaRef.current;
    if (!element) return;

    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      const progress = Math.min(Math.max(diff / 150, -1), 1);
      setSwipeProgress(Math.abs(progress));
      
      // Visual feedback
      if (progress > 0.7) {
        element.style.transform = `translateX(${progress * 100}px)`;
        element.style.opacity = `${1 - Math.abs(progress) * 0.5}`;
      }
    };

    const handleTouchEnd = () => {
      if (Math.abs(swipeProgress) > 0.7) {
        handleSwipeNext();
      } else {
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
      }
      setIsSwiping(false);
      setSwipeProgress(0);
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSwiping, swipeProgress]);

  // Smooth transition when partner disconnects
  useEffect(() => {
    if (!partner && inCall) {
      startDisconnectAnimation();
    }
  }, [partner, inCall]);

  const startDisconnectAnimation = () => {
    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.style.transition = 'all 0.5s ease';
      remoteVideo.style.opacity = '0';
      remoteVideo.style.transform = 'scale(0.9)';
    }
    
    // Show disconnect message
    addNotification('Stranger disconnected', 'info');
    
    // Auto-connect to next partner after delay
    clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      nextPartner();
      if (remoteVideo) {
        remoteVideo.style.opacity = '1';
        remoteVideo.style.transform = 'scale(1)';
      }
    }, 1500);
  };

  // Audio visualization for local stream
  useEffect(() => {
    let animationId;
    let localAnalyser;
    let localSource;
    let localDataArray;

    const setupLocalAudioMeter = async () => {
      if (!localStreamRef.current || !audioEnabled) return;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        localAnalyser = audioContext.createAnalyser();
        localSource = audioContext.createMediaStreamSource(localStreamRef.current);
        localSource.connect(localAnalyser);
        localAnalyser.fftSize = 256;
        localDataArray = new Uint8Array(localAnalyser.frequencyBinCount);

        const updateMeter = () => {
          if (!localAnalyser) return;
          localAnalyser.getByteFrequencyData(localDataArray);
          const average = localDataArray.reduce((a, b) => a + b) / localDataArray.length;
          setAudioMeter(average / 256);
          animationId = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (err) {
        console.error('Local audio meter error:', err);
      }
    };

    setupLocalAudioMeter();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (localSource) localSource.disconnect();
    };
  }, [audioEnabled, inCall]);

  // Auto-skip timer for inactive chats
  useEffect(() => {
    let timer;
    if (inCall && autoSkipTimer && partner) {
      timer = setInterval(() => {
        setSkipCountdown(prev => {
          if (prev <= 1) {
            handleAutoSkip();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSkipCountdown(5);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [inCall, autoSkipTimer, partner]);

  const handleAutoSkip = () => {
    addNotification('Auto-skipping inactive chat...', 'warning');
    handleSwipeNext();
  };

  // Handle incoming signaling
  useEffect(() => {
    if (!socket) return;

    const onOffer = async (payload) => {
      try {
        const fromId = payload.from || payload.callerId || payload.userId;
        // Make sure this is for our current partner
        if (!partner || (fromId !== (partner.partnerId || partner.id))) {
          console.warn('Offer from unknown user - ignoring', fromId);
          return;
        }

        setIncomingOffer(payload.sdp);
        setCallingState('ringing');
        addNotification(`${partner.profile?.username || 'Partner'} is calling`, 'info');
      } catch (err) {
        console.error('onOffer error', err);
      }
    };

    const onAnswer = async (payload) => {
      try {
        if (!pcRef.current) {
          console.warn('No PC for answer');
          return;
        }
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        setCallingState('in-call');
        setInCall(true);
        addNotification('Call connected', 'success');
      } catch (err) {
        console.error('onAnswer error', err);
      }
    };

    const onIce = async (payload) => {
      try {
        if (!pcRef.current) return;
        if (!payload || !payload.candidate) return;
        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (err) {
        console.error('onIce add failed', err);
      }
    };

    const onCallEnded = (payload) => {
      console.log('Call ended signaled', payload);
      endCall(false);
    };

    const onReject = () => {
      setCallingState('idle');
      setIncomingOffer(null);
      addNotification('Call rejected by partner', 'warning');
    };

    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIce);
    socket.on('webrtc-reject', onReject);
    socket.on('webrtc-end', onCallEnded);

    return () => {
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIce);
      socket.off('webrtc-reject', onReject);
      socket.off('webrtc-end', onCallEnded);
    };
  }, [socket, partner, endCall, addNotification]);

  // Video filters
  const videoFilters = {
    none: 'none',
    vintage: 'sepia(0.5) contrast(1.2)',
    noir: 'grayscale(100%) contrast(1.4)',
    vibrant: 'saturate(1.8) brightness(1.1)',
    cool: 'hue-rotate(180deg) saturate(1.5)',
    warm: 'hue-rotate(-30deg) sepia(0.3)',
    neon: 'contrast(1.5) brightness(1.2) saturate(2)',
    blur: 'blur(4px)'
  };

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    if (localVideoRef.current) {
      localVideoRef.current.style.filter = videoFilters[filter];
    }
  };

  // Auto-translation
  const translateMessage = async (text, targetLang = 'en') => {
    if (!translationEnabled) return text;
    
    setIsTranslating(true);
    try {
      // Mock translation - replace with actual API
      const translated = `[Translated] ${text}`;
      return translated;
    } catch (err) {
      console.error('Translation error:', err);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  // Enhanced message sending
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim()) return;
    
    let finalText = messageText;
    
    if (translationEnabled) {
      finalText = await translateMessage(messageText);
    }
    
    sendMessage(finalText);
    
    // Add typing animation
    setTypingIndicator(true);
    setTimeout(() => setTypingIndicator(false), 1000);
    
    setMessageText('');
    setShowEmoji(false);
  }, [messageText, translationEnabled, sendMessage]);

  // Quick reactions
  const sendQuickReaction = (reaction) => {
    const reactions = {
      like: '👍',
      love: '❤️',
      laugh: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };

    sendMessage(reactions[reaction]);
    setQuickReactions(prev => [...prev, { type: reaction, timestamp: Date.now() }]);
  };

  // Smooth next partner transition
  const handleSwipeNext = () => {
    // Animate current video out
    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      remoteVideo.style.transform = 'translateX(-100%)';
      remoteVideo.style.opacity = '0';
    }

    // Animate local video
    const localVideo = localVideoRef.current;
    if (localVideo) {
      localVideo.style.transition = 'transform 0.3s ease';
      localVideo.style.transform = 'scale(0.8)';
    }

    // Wait for animation then switch
    setTimeout(() => {
      nextPartner();
      disconnectPartner();
      endCall(false);
      
      // Reset animations
      if (remoteVideo) {
        remoteVideo.style.transform = 'translateX(0)';
        remoteVideo.style.opacity = '1';
      }
      if (localVideo) {
        localVideo.style.transform = 'scale(1)';
      }
    }, 300);
  };

  // Handle partner typing status
  useEffect(() => {
    if (partnerTyping) {
      setPartnerStatus('typing');
    } else {
      setPartnerStatus('online');
    }
  }, [partnerTyping]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      endCall(true);
      stopLocalMedia();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Render connection quality indicator
  const renderQualityIndicator = () => {
    let color = 'bg-green-500';
    if (connectionQuality < 70) color = 'bg-yellow-500';
    if (connectionQuality < 30) color = 'bg-red-500';

    return (
      <div className="quality-indicator">
        <div className="quality-dot"></div>
        <span className="quality-text">{connectionQuality}%</span>
      </div>
    );
  };

  // Render quick reactions bar
  const renderQuickReactions = () => {
    const reactions = [
      { icon: '👍', label: 'Like' },
      { icon: '❤️', label: 'Love' },
      { icon: '😂', label: 'Haha' },
      { icon: '😮', label: 'Wow' },
      { icon: '😢', label: 'Sad' },
    ];

    return (
      <div className="quick-reactions">
        {reactions.map((reaction, idx) => (
          <button
            key={idx}
            onClick={() => sendQuickReaction(reaction.label.toLowerCase())}
            className="reaction-btn"
          >
            {reaction.icon}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="omegle-mobile-container">
      {/* Match Animation */}
      {matchEffects && (
        <div className="match-animation">
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="match-text">Connected!</div>
        </div>
      )}

      {/* Connecting Overlay */}
      {isConnecting && (
        <div className="connecting-overlay">
          <div className="connecting-spinner"></div>
          <div className="connecting-text">Connecting...</div>
        </div>
      )}

      {/* Main Video Area with Swipe Gesture */}
      <div 
        ref={swipeAreaRef}
        className="video-swipe-area"
        style={{
          transform: `translateX(${swipeProgress * 100}px)`,
          opacity: 1 - Math.abs(swipeProgress) * 0.5
        }}
      >
        {/* Remote Video */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="remote-video"
          style={{ filter: activeFilter === 'blur' ? 'blur(4px)' : 'none' }}
        />
        
        {/* Connection Quality */}
        {inCall && renderQualityIndicator()}
        
        {/* Local Video PIP */}
        <div className="local-video-pip">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="local-video"
            style={{ filter: videoFilters[activeFilter] }}
          />
          {audioMeter > 0.1 && (
            <div className="audio-indicator">
              <GiSoundWaves className="text-green-400" />
            </div>
          )}
        </div>

        {/* Swipe Hint */}
        {partner && (
          <div className="swipe-hint">
            <FaRandom className="mr-2" />
            Swipe left to skip
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="enhanced-controls">
        {/* Top Control Row */}
        <div className="control-row top">
          <button onClick={() => setCurrentScreen('home')} className="control-btn back">
            <FaArrowLeft />
          </button>
          
          <div className="call-info">
            <div className="partner-name">
              {partner?.profile?.username || 'Stranger'}
              {partnerStatus === 'typing' && <span className="typing-dots">•••</span>}
            </div>
            <div className="call-timer">
              {inCall ? `⏱️ ${formatTime(callTimeSeconds)}` : (partner ? 'Connected' : 'Searching...')}
            </div>
          </div>
          
          <button onClick={() => setShowEffects(!showEffects)} className="control-btn effects">
            <FaMagic />
          </button>
        </div>

        {/* Quick Reactions */}
        {inCall && renderQuickReactions()}

        {/* Main Control Row */}
        <div className="control-row main">
          <button 
            onClick={toggleAudio} 
            className={`control-btn ${!audioEnabled ? 'muted' : ''}`}
            disabled={!localStreamRef.current}
          >
            {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          
          <button 
            onClick={toggleVideo} 
            className={`control-btn ${!videoEnabled ? 'muted' : ''}`}
            disabled={!localStreamRef.current}
          >
            {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>
          
          <button 
            onClick={toggleScreenShare} 
            className={`control-btn ${sharingScreen ? 'active' : ''}`}
            disabled={!localStreamRef.current}
          >
            <FaDesktop />
          </button>
          
          {partner && (
            <button 
              onClick={handleSwipeNext}
              className="control-btn skip"
            >
              <FaSyncAlt className="animate-spin-once" />
            </button>
          )}
          
          <button onClick={() => endCall(true)} className="control-btn end-call">
            <FaPhoneSlash />
          </button>
        </div>

        {/* Start Call Button (when not in call) */}
        {!inCall && partner && (
          <div className="start-call-section">
            <button 
              onClick={startCall}
              className="start-call-btn"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Start Video Call'}
            </button>
          </div>
        )}

        {/* Effects Panel */}
        {showEffects && (
          <div className="effects-panel">
            <div className="effects-grid">
              {Object.keys(videoFilters).map(filter => (
                <button
                  key={filter}
                  onClick={() => applyFilter(filter)}
                  className={`effect-btn ${activeFilter === filter ? 'active' : ''}`}
                  style={{ filter: videoFilters[filter] }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Modal */}
      {incomingOffer && (
        <div className="incoming-call-modal">
          <div className="modal-content">
            <h3>Incoming Call</h3>
            <p>{partner?.profile?.username || 'Stranger'} is calling...</p>
            <div className="modal-buttons">
              <button onClick={() => acceptCall(incomingOffer)} className="accept-btn">
                Accept
              </button>
              <button onClick={() => setIncomingOffer(null)} className="reject-btn">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <div className={`chat-drawer ${showEmoji ? 'expanded' : ''}`}>
        <div className="chat-header">
          <h3>Chat</h3>
          <div className="chat-header-actions">
            <button onClick={() => setTranslationEnabled(!translationEnabled)} 
                    className={`translation-btn ${translationEnabled ? 'active' : ''}`}>
              <FaLanguage />
            </button>
            <button onClick={() => setShowEmoji(!showEmoji)} className="emoji-toggle">
              <FaSmile />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                {msg.text}
                {translatedMessages[msg.id] && (
                  <div className="translated-text">
                    {translatedMessages[msg.id]}
                  </div>
                )}
              </div>
              <div className="message-time">
                {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}
          {typingIndicator && (
            <div className="typing-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <button onClick={() => setShowEmoji(!showEmoji)} className="input-btn">
            <FaSmile />
          </button>
          
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTypingStart();
            }}
            onBlur={handleTypingStop}
            placeholder="Type a message..."
            className="message-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <button 
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="send-btn"
          >
            <FaPaperPlane />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="emoji-picker-container">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setMessageText(prev => prev + emojiData.emoji);
                setShowEmoji(false);
              }}
              skinTonesDisabled
              searchDisabled={false}
              height={300}
              width="100%"
            />
          </div>
        )}
      </div>

      {/* Auto-skip Countdown */}
      {autoSkipTimer && skipCountdown < 10 && partner && (
        <div className="auto-skip-countdown">
          Auto-skip in {skipCountdown}s
        </div>
      )}
    </div>
  );
};

export default VideoChatScreen;