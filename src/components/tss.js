

// src/components/TextChatScreen.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaArrowLeft, FaRandom, FaTimes, FaUser,
  FaHeart, FaPaperPlane, FaSmile, FaSearch,
  FaSync, FaUsers, FaCog, FaComments,
  FaQrcode, FaCamera, FaVideo, FaImage,
  FaMicrophone, FaFileAlt, FaMapMarkerAlt,
  FaEllipsisV, FaPhone, FaVideo as FaVideoCall,
  FaVolumeUp, FaPalette, FaBolt, FaUserFriends
} from 'react-icons/fa';
import { MdEmojiEmotions, MdAttachFile, MdSend } from 'react-icons/md';
import { HiOutlineSparkles } from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../context/ChatContext';

const TextChatScreen = () => {
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
    toggleAutoConnect,
    addNotification,
    onBack,
    handleTypingStart,
    handleTypingStop,
    
                setCurrentScreen
     
  } = useChat();

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);
  const [mediaOptions, setMediaOptions] = useState(false);
  const [localPartnerTyping, setLocalPartnerTyping] = useState(false);
  const [activeTheme, setActiveTheme] = useState('midnight');
  const [typingIndicatorId, setTypingIndicatorId] = useState(null);
 
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scannerRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const inputRef = useRef(null);
  const themes = {
    midnight: 'from-gray-900 to-black',
    ocean: 'from-blue-900/30 to-teal-900/30',
    cosmic: 'from-purple-900/30 to-pink-900/30',
    forest: 'from-emerald-900/30 to-green-900/30',
    sunset: 'from-orange-900/30 to-rose-900/30'
  };
  // Get partner ID from different possible properties
  const getPartnerId = useCallback(() => {
    if (!partner) return null;
   
    // Try different property names that might contain the partner ID
    const id = partner.id || partner._id || partner.userId || partner.partnerId;
    console.log('🆔 Partner ID lookup:', {
      partner,
      id,
      keys: Object.keys(partner || {})
    });
    return id;
  }, [partner]);
  // Debug logging for typing
  useEffect(() => {
    const partnerId = getPartnerId();
    console.log('🔍 TextChatScreen Debug:', {
      partner,
      partnerId,
      partnerTypingProp: partnerTyping,
      localPartnerTyping,
      typingIndicatorId
    });
  }, [partnerTyping, localPartnerTyping, partner, typingIndicatorId, getPartnerId]);
  // Listen for direct typing events from socket
  useEffect(() => {
    if (!socket || !partner) return;
    const partnerId = getPartnerId();
    console.log('🎧 Setting up socket listeners for partner:', partnerId);
    const handlePartnerTyping = (data) => {
      console.log('⌨️ Direct socket typing event:', data);
      const currentPartnerId = getPartnerId();
      console.log('Comparing event userId:', data.userId, 'with partnerId:', currentPartnerId);
     
      if (currentPartnerId && data.userId === currentPartnerId) {
        console.log('✅ Matched partner, showing typing indicator');
        setLocalPartnerTyping(true);
        setTypingIndicatorId(data.userId);
       
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
       
        // Set timeout to clear typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Clearing typing indicator after timeout');
          setLocalPartnerTyping(false);
          setTypingIndicatorId(null);
        }, 3000);
      } else if (currentPartnerId && data.partnerId === currentPartnerId) {
        // Sometimes the event might have userId/partnerId swapped
        console.log('✅ Matched via partnerId, showing typing indicator');
        setLocalPartnerTyping(true);
        setTypingIndicatorId(data.userId);
       
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
       
        typingTimeoutRef.current = setTimeout(() => {
          setLocalPartnerTyping(false);
          setTypingIndicatorId(null);
        }, 3000);
      } else {
        console.log('❌ No match, ignoring typing event');
      }
    };
    const handlePartnerTypingStopped = (data) => {
      console.log('💤 Direct socket typing stopped:', data);
      const currentPartnerId = getPartnerId();
     
      if (currentPartnerId && (data.userId === currentPartnerId || data.partnerId === currentPartnerId)) {
        console.log('✅ Matched partner, hiding typing indicator');
        setLocalPartnerTyping(false);
        setTypingIndicatorId(null);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };
    const handlePartnerDisconnect = (data) => {
      console.log('🔌 Partner disconnected via socket');
      setPartnerDisconnected(true);
      setLocalPartnerTyping(false);
      setTypingIndicatorId(null);
    };
    socket.on('partnerTyping', handlePartnerTyping);
    socket.on('partnerTypingStopped', handlePartnerTypingStopped);
    socket.on('partnerDisconnected', handlePartnerDisconnect);
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('partnerTyping', handlePartnerTyping);
      socket.off('partnerTypingStopped', handlePartnerTypingStopped);
      socket.off('partnerDisconnected', handlePartnerDisconnect);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, partner, getPartnerId]);
  // Also watch parent prop for typing
  useEffect(() => {
    console.log('📝 Parent partnerTyping prop changed:', partnerTyping);
    if (partnerTyping && partner) {
      console.log('✅ Showing typing from parent prop');
      setLocalPartnerTyping(true);
      setTypingIndicatorId(getPartnerId());
     
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
     
      // Auto-clear after 3 seconds if no update
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-clearing typing from parent prop');
        setLocalPartnerTyping(false);
        setTypingIndicatorId(null);
      }, 3000);
    } else if (!partnerTyping) {
      console.log('❌ Hiding typing from parent prop');
      setLocalPartnerTyping(false);
      setTypingIndicatorId(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [partnerTyping, partner, getPartnerId]);
  // Reset typing when partner changes
  useEffect(() => {
    console.log('🔄 Partner changed, resetting typing');
    setLocalPartnerTyping(false);
    setTypingIndicatorId(null);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [getPartnerId()]); // Use partner ID as dependency
  // Reset partner disconnected state when we get a new partner
  useEffect(() => {
    if (partner && partnerDisconnected) {
      setPartnerDisconnected(false);
    }
  }, [partner]);
  // Scroll to bottom when messages change or typing shows
  useEffect(() => {
    scrollToBottom();
  }, [messages, localPartnerTyping]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // Simulated QR code scanner
  const simulateScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowScanner(false);
      alert('QR Code scanned successfully! Content: https://example.com/chat-link');
    }, 2000);
  };
  // Handle typing with debounce and emit event to parent
  const handleTyping = () => {
    if (!partner || partnerDisconnected) return;
   
    console.log('⌨️ User started typing, emitting typing event');
   
    handleTypingStart();
   
    // Clear previous debounce timeout for typing stopped
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
   
    // Set new debounce timeout for typing stopped
    typingDebounceRef.current = setTimeout(() => {
      console.log('💤 User stopped typing (debounce), emitting stopped');
      handleTypingStop();
    }, 1000);
  };
  const handleSend = () => {
    if (message.trim() && partner) {
      console.log('📤 Sending message');
      sendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
     
      // Clear typing indicator immediately when sending
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      handleTypingStop();
     
      // Focus back on input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleNext = () => {
    console.log('⏭️ Next button clicked');
    if (nextPartner) {
      nextPartner();
    }
  };
  const handleDisconnect = () => {
    console.log('🔌 Disconnect button clicked');
    if (disconnectPartner) {
      disconnectPartner();
    }
  };
  const onEmojiClick = (emojiData) => {
    console.log('😊 Emoji clicked');
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    handleTyping();
  };
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const renderMessage = (msg, index) => {
    const isMe = msg.sender === 'me';
    const isSystem = msg.type === 'system';
    if (isSystem) {
      return (
        <div key={index} className="flex justify-center my-4 animate-fadeIn">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-full border border-gray-700/50">
            <HiOutlineSparkles className="text-yellow-400 mr-2" />
            <span className="text-gray-300 text-sm">{msg.text}</span>
            {msg.timestamp && (
              <span className="text-xs text-gray-500 ml-2">
                {formatTime(msg.timestamp)}
              </span>
            )}
          </div>
        </div>
      );
    }
    return (
      <div
        key={index}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}
      >
        <div className={`relative max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
          isMe
            ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-br-none'
            : 'bg-gray-800/80 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/50'
        }`}>
          <div className={`absolute -bottom-1 ${isMe ? '-right-1' : '-left-1'} w-3 h-3 ${
            isMe ? 'bg-blue-600' : 'bg-gray-800/80'
          } transform rotate-45`}></div>
         
          {msg.type === 'image' && (
            <div className="mb-2 overflow-hidden rounded-lg">
              <img
                src={msg.content || 'https://via.placeholder.com/300x200'}
                alt="Shared"
                className="rounded-lg max-w-full h-auto transition-transform hover:scale-105 duration-300"
              />
            </div>
          )}
         
          {msg.type === 'file' && (
            <div className="mb-2 p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg flex items-center backdrop-blur-sm border border-gray-700/50">
              <FaFileAlt className="mr-3 text-blue-400" />
              <div className="flex-1">
                <div className="text-sm font-medium">{msg.fileName || 'File'}</div>
                <div className="text-xs text-gray-400">{msg.fileSize || 'Unknown size'}</div>
              </div>
            </div>
          )}
         
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>
         
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isMe ? 'text-blue-200/90' : 'text-gray-400'
          }`}>
            <span>{formatTime(msg.timestamp)}</span>
            {isMe && (
              <div className="flex items-center ml-2">
                <div className="w-1 h-1 bg-white/50 rounded-full mx-[1px]"></div>
                <div className="w-1 h-1 bg-white/50 rounded-full mx-[1px]"></div>
                <div className="w-1 h-1 bg-white/50 rounded-full mx-[1px]"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderTypingIndicator = () => {
    if (!partner || !localPartnerTyping || partnerDisconnected) return null;
   
    return (
      <div className="flex justify-start mb-4 animate-fadeIn">
        <div className="relative max-w-[75%] rounded-2xl px-4 py-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/30 shadow-lg">
          {/* Corner accent */}
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gray-800/40 transform rotate-45"></div>
         
          {/* Typing dots animation */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"
                   style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"
                   style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"
                   style={{animationDelay: '300ms'}}></div>
            </div>
            <span className="text-sm text-gray-400 italic">
              {partner.profile?.username || partner.username || 'Partner'} is typing...
            </span>
          </div>
        </div>
      </div>
    );
  };
  // Debug overlay for typing state
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      const partnerId = getPartnerId();
      return (
        <div className="fixed top-20 left-4 bg-black/80 backdrop-blur-sm text-xs p-3 rounded-xl z-50 border border-gray-700/50">
          <div className="font-bold mb-2 text-yellow-400">Debug Info</div>
          <div className="space-y-1">
            <div>Partner: {partner?.profile?.username || partner?.username || 'None'}</div>
            <div>Partner Object Keys: {partner ? Object.keys(partner).join(', ') : 'None'}</div>
            <div>Partner ID: {partnerId || 'None'}</div>
            <div className={`font-bold ${partnerTyping ? 'text-green-400' : 'text-red-400'}`}>
              Parent Typing: {partnerTyping ? '✅ YES' : '❌ NO'}
            </div>
            <div className={`font-bold ${localPartnerTyping ? 'text-green-400' : 'text-red-400'}`}>
              Local Typing: {localPartnerTyping ? '✅ YES' : '❌ NO'}
            </div>
            <div>Disconnected: {partnerDisconnected ? '✅ YES' : '❌ NO'}</div>
          </div>
        </div>
      );
    }
    return null;
  };
  // If we're searching and don't have a partner, show searching screen
  if (searching && !partner) {
    return (
      <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
        </div>
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
           
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Searching...
                </span>
              </div>
             
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <FaCog className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        {/* Searching Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="text-center max-w-md">
            {/* Animated Orb */}
            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
              </div>
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl relative animate-float">
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
                <FaSearch className="relative animate-pulse" />
              </div>
            </div>
           
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Looking for a partner...
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              We're searching for someone who matches your interests
            </p>
           
            <div className="space-y-4 max-w-xs mx-auto">
              <button
                onClick={onBack}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  Cancel Search
                </span>
              </button>
             
              <button
                onClick={() => setShowScanner(true)}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 group flex items-center justify-center"
              >
                <FaQrcode className="mr-3 group-hover:rotate-12 transition-transform" />
                Scan QR Code
              </button>
            </div>
          </div>
        </div>
        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Scan QR Code</h3>
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setIsScanning(false);
                  }}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                >
                  <FaTimes />
                </button>
              </div>
             
              <div className="relative">
                <div
                  ref={scannerRef}
                  className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-gray-700/50"
                >
                  {isScanning ? (
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-300">Scanning...</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 border-2 border-green-500 border-dashed animate-pulse"></div>
                      <div className="text-center z-10">
                        <FaQrcode className="text-5xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Position QR code within frame</p>
                      </div>
                    </>
                  )}
                </div>
               
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={simulateScanner}
                    disabled={isScanning}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                  >
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                  </button>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl font-medium transition-colors backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 shadow-2xl w-64 z-50">
            <div className="space-y-4">
              <div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoConnect}
                      onChange={toggleAutoConnect}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                      autoConnect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                    }`}></div>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      autoConnect ? 'transform translate-x-5' : ''
                    }`}></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-300">Auto-connect</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Automatically search for next partner
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
      {/* Debug Info */}
      {renderDebugInfo()}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full animate-float delay-1000"></div>
      </div>
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={()=>{
                disconnectPartner();
                setCurrentScreen('home');
              }}
              className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
           
            {partner && (
              <div className="group flex items-center space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                  </div>
                  {partnerDisconnected ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border-2 border-gray-900"></div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {partner.profile?.username || partner.username || 'Stranger'}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    {partnerDisconnected ? (
                      <span className="text-red-400">Disconnected</span>
                    ) : localPartnerTyping ? (
                      <span className="text-yellow-400 flex items-center">
                        <div className="flex space-x-1 mr-2">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        <span className="text-yellow-400">typing...</span>
                      </span>
                    ) : partner.compatibility ? (
                      <span className="text-emerald-400 flex items-center">
                        <FaHeart size={10} className="mr-1 animate-pulse" />
                        {partner.compatibility}% match
                      </span>
                    ) : (
                      <span className="text-cyan-400">Online</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
         
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowScanner(true)}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaQrcode className="group-hover:rotate-12 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTheme(prev => Object.keys(themes)[(Object.keys(themes).indexOf(prev) + 1) % Object.keys(themes).length])}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaPalette className="group-hover:rotate-180 transition-transform" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaCog className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-gray-700/50">
                <FaComments className="text-5xl text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Start the Conversation!
              </h3>
              <p className="text-gray-400 mb-10 text-lg">Say hello to your match 👋</p>
             
              {partner && (
                <div className="inline-block p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                  <p className="text-gray-300 mb-2">
                    Connected with <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">{partner.profile?.username || partner.username || 'Stranger'}</span>
                  </p>
                  {partner.compatibility && (
                    <div className="flex items-center justify-center space-x-2">
                      <FaHeart className="text-rose-500 animate-pulse" />
                      <span className="text-emerald-400">
                        {partner.compatibility}% compatibility!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => renderMessage(msg, index))}
              {renderTypingIndicator()}
            </div>
          )}
         
          {partnerDisconnected && (
            <div className="text-center my-6 p-6 bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 animate-pulse">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <FaTimes className="text-red-400 text-xl" />
                <p className="text-red-400 font-medium">Partner has disconnected</p>
              </div>
              {autoConnect && (
                <p className="text-gray-400 text-sm">
                  Searching for new partner...
                </p>
              )}
            </div>
          )}
         
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Media Options */}
      {mediaOptions && (
        <div className="px-6 py-4 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl">
          <div className="max-w-3xl mx-auto flex items-center justify-center space-x-4">
            <button className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group">
              <FaCamera className="group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group">
              <FaImage className="group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group">
              <FaVideo className="group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group">
              <FaMicrophone className="group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group">
              <FaMapMarkerAlt className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}
      {/* Message Input */}
      <div className="relative p-6 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Media Button */}
            <button
              onClick={() => setMediaOptions(!mediaOptions)}
              className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group"
            >
              <MdAttachFile className="text-xl group-hover:rotate-12 transition-transform" />
            </button>
           
            {/* Emoji Picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group"
              >
                <MdEmojiEmotions className="text-xl group-hover:scale-110 transition-transform" />
              </button>
             
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-700/50">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme="dark"
                    width={320}
                    height={400}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>
           
            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (e.target.value.length > 0) {
                    handleTyping();
                  } else {
                    handleTypingStop();
                    if (typingDebounceRef.current) {
                      clearTimeout(typingDebounceRef.current);
                    }
                  }
                }}
                onKeyPress={handleKeyPress}
                onBlur={() => {
                  handleTypingStop();
                  if (typingDebounceRef.current) {
                    clearTimeout(typingDebounceRef.current);
                  }
                }}
                placeholder="Type your message here..."
                className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 backdrop-blur-sm transition-all duration-300"
                disabled={!partner || partnerDisconnected}
                autoFocus
              />
             
              {/* Character Count */}
              {message.length > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {message.length}/500
                </div>
              )}
            </div>
           
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || !partner || partnerDisconnected}
              className="p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-xl font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-500/20 group"
            >
              <MdSend className="text-xl group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
         {partnerDisconnected && autoConnect && (
  <div className="text-center my-6 p-6 bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20">
    <div className="flex items-center justify-center space-x-3 mb-2">
      <FaTimes className="text-red-400 text-xl" />
      <p className="text-red-400 font-medium">Partner has disconnected</p>
    </div>
    {/* <p className="text-gray-400 text-sm mb-4">
      Auto-searching for new partner... ({searchTime}s)
    </p> */}
    <button
      onClick={() => {
        console.log('🔄 Manual retry search');
        nextPartner();
      }}
      className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-blue-300 text-sm transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50"
    >
      <FaSync className="inline mr-2" />
      Retry Search
    </button>
  </div>
)}
          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleDisconnect}
              disabled={partnerDisconnected}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 rounded-xl font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2 backdrop-blur-sm group"
            >
              <FaTimes className="group-hover:rotate-90 transition-transform" />
              <span>Disconnect</span>
            </button>
           
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl font-medium transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 flex items-center space-x-2 backdrop-blur-sm group"
            >
              <FaRandom className="group-hover:rotate-180 transition-transform" />
              <span>Next Partner</span>
            </button>
          </div>
        </div>
      </div>
      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Scan QR Code</h3>
              <button
                onClick={() => {
                  setShowScanner(false);
                  setIsScanning(false);
                }}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              >
                <FaTimes />
              </button>
            </div>
           
            <div className="relative">
              <div
                ref={scannerRef}
                className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-gray-700/50"
              >
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Scanning...</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 border-2 border-green-500 border-dashed animate-pulse"></div>
                    <div className="text-center z-10">
                      <FaQrcode className="text-5xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Position QR code within frame</p>
                    </div>
                  </>
                )}
              </div>
             
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={simulateScanner}
                  disabled={isScanning}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                >
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </button>
                <button
                  onClick={() => setShowScanner(false)}
                  className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl font-medium transition-colors backdrop-blur-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 shadow-2xl w-64 z-50">
          <div className="space-y-4">
            <div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoConnect}
                    onChange={toggleAutoConnect}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                    autoConnect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                  }`}></div>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    autoConnect ? 'transform translate-x-5' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-300">Auto-connect</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Automatically search for next partner
              </p>
            </div>
           
            {partner && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Partner Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {(partner.profile?.username || partner.username || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{partner.profile?.username || partner.username || 'Stranger'}</div>
                      <div className="text-xs text-gray-400">
                        {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                      </div>
                    </div>
                  </div>
                 
                  <div className="pt-2 border-t border-gray-800">
                    <div className="text-xs text-gray-400 mb-2">Status</div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        partnerDisconnected ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm">
                        {partnerDisconnected ? 'Disconnected' : 'Online'}
                      </span>
                    </div>
                  </div>
                 
                  {partner.profile?.interests?.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Interests</div>
                      <div className="flex flex-wrap gap-1">
                        {partner.profile.interests.slice(0, 3).map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs backdrop-blur-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
           
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => setShowScanner(true)}
                className="w-full px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center space-x-2 backdrop-blur-sm group"
              >
                <FaQrcode className="group-hover:rotate-12 transition-transform" />
                <span>Scan QR Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
       
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
       
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
       
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
       
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
       
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TextChatScreen;