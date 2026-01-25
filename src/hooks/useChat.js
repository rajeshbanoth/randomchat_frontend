import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useTyping } from './useTyping';
import { CHAT_MODES, MESSAGE_TYPES } from '../utils/constants';
import { formatTime } from '../utils/helpers';

export const useChat = (initialMode = CHAT_MODES.TEXT) => {
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [autoConnect, setAutoConnect] = useState(true);
  const [chatMode, setChatMode] = useState(initialMode);
  
  const searchTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { socket, connect, disconnect, emitEvent, isConnected } = useSocket();
  const { partnerTyping, handleTyping } = useTyping(socket, partner);

  // Start search timer
  useEffect(() => {
    if (searching) {
      searchTimerRef.current = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
      setSearchTime(0);
    }
    
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, [searching]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSearch = useCallback((mode, userProfile) => {
    if (!isConnected()) return false;

    setChatMode(mode);
    setSearching(true);
    setPartner(null);
    setMessages([]);

    const searchData = {
      mode,
      interests: userProfile?.interests || [],
      genderPreference: userProfile?.genderPreference || 'any',
      ageRange: userProfile?.ageRange || { min: 18, max: 60 },
      isPremium: userProfile?.isPremium || false,
      timestamp: Date.now()
    };

    emitEvent('search', searchData);
    return true;
  }, [isConnected, emitEvent]);

  const sendMessage = useCallback((text, type = MESSAGE_TYPES.TEXT, metadata = {}) => {
    if (!socket || !partner || !text.trim()) return null;

    const messageData = {
      text: text.trim(),
      type,
      timestamp: Date.now(),
      senderId: socket.id,
      ...metadata
    };

    emitEvent('message', messageData);

    const newMessage = {
      ...messageData,
      sender: 'me'
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, [socket, partner, emitEvent]);

  const disconnectPartner = useCallback(() => {
    if (!socket || !partner) return;

    emitEvent('disconnect-partner', {
      reason: 'user_request',
      timestamp: Date.now()
    });

    setPartner(null);
    setMessages(prev => [...prev, {
      type: MESSAGE_TYPES.SYSTEM,
      text: 'You disconnected from the chat',
      timestamp: Date.now(),
      sender: 'system'
    }]);
  }, [socket, partner, emitEvent]);

  const nextPartner = useCallback(() => {
    if (!socket) return;

    emitEvent('next', {
      reason: 'user_requested_next',
      timestamp: Date.now(),
      currentMode: chatMode
    });

    setPartner(null);
    setMessages([]);
    setSearching(true);
  }, [socket, chatMode, emitEvent]);

  const addSystemMessage = useCallback((text) => {
    const systemMessage = {
      type: MESSAGE_TYPES.SYSTEM,
      text,
      timestamp: Date.now(),
      sender: 'system'
    };
    
    setMessages(prev => [...prev, systemMessage]);
    return systemMessage;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // State
    messages,
    partner,
    searching,
    searchTime,
    autoConnect,
    chatMode,
    partnerTyping,
    
    // Refs
    messagesEndRef,
    
    // Actions
    setPartner,
    setSearching,
    setAutoConnect,
    setChatMode,
    startSearch,
    sendMessage,
    disconnectPartner,
    nextPartner,
    addSystemMessage,
    clearMessages,
    handleTyping,
    scrollToBottom,
    
    // Socket
    socket,
    connect,
    disconnect,
    emitEvent,
    isConnected
  };
};