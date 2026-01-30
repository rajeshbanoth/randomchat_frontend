import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import SettingsPanel from './components/SettingsPanel';
import QRScanner from './components/QRScanner';
import SearchingScreen from './components/SearchingScreen';
import DebugInfo from './components/DebugInfo';
import { themes } from './styles/animations';

const TextChatScreen = () => {
  const { 
    socket,
    partner,
    messages,
    searching,
    autoConnect,
    partnerTyping,
    sendMessage,
    disconnectPartner,
    nextPartner,
    toggleAutoConnect,
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

  // Get partner ID from different possible properties
  const getPartnerId = useCallback(() => {
    if (!partner) return null;
    return partner.id || partner._id || partner.userId || partner.partnerId;
  }, [partner]);

  // Typing event listeners
  useEffect(() => {
    if (!socket || !partner) return;
    const partnerId = getPartnerId();

    const handlePartnerTyping = (data) => {
      if (partnerId && (data.userId === partnerId || data.partnerId === partnerId)) {
        setLocalPartnerTyping(true);
        setTypingIndicatorId(data.userId);
       
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
       
        typingTimeoutRef.current = setTimeout(() => {
          setLocalPartnerTyping(false);
          setTypingIndicatorId(null);
        }, 3000);
      }
    };

    const handlePartnerTypingStopped = (data) => {
      if (partnerId && (data.userId === partnerId || data.partnerId === partnerId)) {
        setLocalPartnerTyping(false);
        setTypingIndicatorId(null);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    const handlePartnerDisconnect = () => {
      setPartnerDisconnected(true);
      setLocalPartnerTyping(false);
      setTypingIndicatorId(null);
    };

    socket.on('partnerTyping', handlePartnerTyping);
    socket.on('partnerTypingStopped', handlePartnerTypingStopped);
    socket.on('partnerDisconnected', handlePartnerDisconnect);

    return () => {
      socket.off('partnerTyping', handlePartnerTyping);
      socket.off('partnerTypingStopped', handlePartnerTypingStopped);
      socket.off('partnerDisconnected', handlePartnerDisconnect);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, partner, getPartnerId]);

  // Watch parent prop for typing
  useEffect(() => {
    if (partnerTyping && partner) {
      setLocalPartnerTyping(true);
      setTypingIndicatorId(getPartnerId());
     
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
     
      typingTimeoutRef.current = setTimeout(() => {
        setLocalPartnerTyping(false);
        setTypingIndicatorId(null);
      }, 3000);
    } else if (!partnerTyping) {
      setLocalPartnerTyping(false);
      setTypingIndicatorId(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [partnerTyping, partner, getPartnerId]);

  // Reset typing when partner changes
  useEffect(() => {
    setLocalPartnerTyping(false);
    setTypingIndicatorId(null);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [getPartnerId()]);

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

  const handleTypingStart = () => {
    // Emit typing event via socket if needed
    if (socket && partner) {
      const partnerId = getPartnerId();
      socket.emit('typing', { partnerId });
    }
  };

  const handleTypingStop = () => {
    // Emit typing stopped event via socket if needed
    if (socket && partner) {
      const partnerId = getPartnerId();
      socket.emit('typingStopped', { partnerId });
    }
  };

  // Handle typing with debounce
  const handleTyping = () => {
    if (!partner || partnerDisconnected) return;
   
    handleTypingStart();
   
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
   
    typingDebounceRef.current = setTimeout(() => {
      handleTypingStop();
    }, 1000);
  };

  const handleSend = () => {
    if (message.trim() && partner) {
      sendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
     
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      handleTypingStop();
     
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
    if (nextPartner) {
      nextPartner();
    }
  };

  const handleDisconnect = () => {
    if (disconnectPartner) {
      disconnectPartner();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    handleTyping();
  };

  const onBack = () => {
    disconnectPartner();
    setCurrentScreen('home');
  };

  // If we're searching and don't have a partner, show searching screen
  if (searching && !partner) {
    return (
      <SearchingScreen
        onBack={onBack}
        showScanner={showScanner}
        setShowScanner={setShowScanner}
        isScanning={isScanning}
        setIsScanning={setIsScanning}
        simulateScanner={simulateScanner}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        autoConnect={autoConnect}
        toggleAutoConnect={toggleAutoConnect}
        themes={themes}
        activeTheme={activeTheme}
      />
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} transition-all duration-500`}>
      {/* Debug Info */}
      <DebugInfo
        partner={partner}
        partnerTyping={partnerTyping}
        localPartnerTyping={localPartnerTyping}
        partnerDisconnected={partnerDisconnected}
        getPartnerId={getPartnerId}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full animate-float delay-1000"></div>
      </div>

      {/* Header */}
      <Header
        partner={partner}
        partnerDisconnected={partnerDisconnected}
        localPartnerTyping={localPartnerTyping}
        onBack={onBack}
        setShowScanner={setShowScanner}
        setActiveTheme={setActiveTheme}
        themes={themes}
        activeTheme={activeTheme}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
      />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        partner={partner}
        partnerDisconnected={partnerDisconnected}
        localPartnerTyping={localPartnerTyping}
        messagesEndRef={messagesEndRef}
        autoConnect={autoConnect}
        nextPartner={nextPartner}
      />

      {/* Media Options */}
      {mediaOptions && (
        <div className="px-6 py-4 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl">
          <div className="max-w-3xl mx-auto flex items-center justify-center space-x-4">
            {['FaCamera', 'FaImage', 'FaVideo', 'FaMicrophone', 'FaMapMarkerAlt'].map((icon, idx) => (
              <button key={idx} className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group">
                <i className={`group-hover:scale-110 transition-transform`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        handleTyping={handleTyping}
        handleTypingStop={handleTypingStop}
        handleSend={handleSend}
        handleKeyPress={handleKeyPress}
        setShowEmojiPicker={setShowEmojiPicker}
        showEmojiPicker={showEmojiPicker}
        onEmojiClick={onEmojiClick}
        setMediaOptions={setMediaOptions}
        mediaOptions={mediaOptions}
        partner={partner}
        partnerDisconnected={partnerDisconnected}
        inputRef={inputRef}
        handleDisconnect={handleDisconnect}
        handleNext={handleNext}
      />

      {/* QR Scanner Modal */}
      <QRScanner
        showScanner={showScanner}
        setShowScanner={setShowScanner}
        isScanning={isScanning}
        setIsScanning={setIsScanning}
        simulateScanner={simulateScanner}
        scannerRef={scannerRef}
      />

      {/* Settings Panel */}
      <SettingsPanel
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        autoConnect={autoConnect}
        toggleAutoConnect={toggleAutoConnect}
        partner={partner}
        partnerDisconnected={partnerDisconnected}
        setShowScanner={setShowScanner}
      />
    </div>
  );
};

export default TextChatScreen;