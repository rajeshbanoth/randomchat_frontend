import { useState, useRef, useCallback, useEffect } from 'react';

export const useTyping = (socket, partner, onTypingEvent) => {
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const lastTypingEmittedRef = useRef(0);

  // Handle user typing start
  const handleTypingStart = useCallback(() => {
    if (!socket || !partner) return;
    
    const now = Date.now();
    if (now - lastTypingEmittedRef.current < 500) return;
    
    lastTypingEmittedRef.current = now;
    
    const typingData = {
      partnerId: partner.id,
      userId: socket.id,
      timestamp: now
    };
    
    socket.emit('typing', typingData);
    
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
  }, [socket, partner]);

  // Handle user typing stop
  const handleTypingStop = useCallback(() => {
    if (!socket || !partner) return;
    
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    
    typingDebounceRef.current = setTimeout(() => {
      const typingData = {
        partnerId: partner.id,
        userId: socket.id,
        timestamp: Date.now()
      };
      
      socket.emit('typingStopped', typingData);
      typingDebounceRef.current = null;
    }, 1000);
  }, [socket, partner]);

  // Combined handler for TextChatScreen
  const handleTyping = useCallback((isTyping) => {
    if (isTyping) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  }, [handleTypingStart, handleTypingStop]);

  // Listen for partner typing events
  useEffect(() => {
    if (!socket || !partner) return;

    const handlePartnerTyping = (data) => {
      if (data.userId === partner.id) {
        setPartnerTyping(true);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 3000);
      }
    };

    const handlePartnerTypingStopped = (data) => {
      if (data.userId === partner.id) {
        setPartnerTyping(false);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    };

    socket.on('partnerTyping', handlePartnerTyping);
    socket.on('partnerTypingStopped', handlePartnerTypingStopped);

    return () => {
      socket.off('partnerTyping', handlePartnerTyping);
      socket.off('partnerTypingStopped', handlePartnerTypingStopped);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, [socket, partner]);

  // Reset when partner changes
  useEffect(() => {
    setPartnerTyping(false);
    lastTypingEmittedRef.current = 0;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
  }, [partner?.id]);

  return {
    isTyping,
    partnerTyping,
    handleTypingStart,
    handleTypingStop,
    handleTyping,
    setIsTyping,
    setPartnerTyping
  };
};