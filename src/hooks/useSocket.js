import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../utils/constants';

export const useSocket = (userProfile, onEvents) => {
  const socketRef = useRef(null);
  const { 
    onConnect, 
    onDisconnect, 
    onRegistered, 
    onMatched, 
    onPartnerDisconnected,
    onMessage,
    onTyping,
    onPartnerTyping,
    onPartnerTypingStopped,
    onSearching,
    onError 
  } = onEvents || {};

  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;

    // const newSocket = io(SOCKET_SERVER_URL, {
    //   transports: ['websocket', 'polling'],
    //   reconnection: true,
    //   reconnectionAttempts: 5,
    //   reconnectionDelay: 1000,
    //   timeout: 30000,
    //   autoConnect: true
    // });

    const newSocket = io({
  path: "/api/socket/socket.io",
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 30000,
  autoConnect: true,
});


    socketRef.current = newSocket;
    return newSocket;
  }, []);

  const connect = useCallback((profile) => {
    const socket = initializeSocket();
    
    socket.on('connect', () => {
      console.log('✅ Connected to server with ID:', socket.id);
      onConnect?.({ socketId: socket.id });
      
      if (profile) {
        const updatedProfile = {
          ...profile,
          socketId: socket.id,
          id: socket.id
        };
        onRegistered?.(updatedProfile);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      onError?.(error);
    });

    socket.on('registered', onRegistered);
    socket.on('matched', onMatched);
    socket.on('partnerDisconnected', onPartnerDisconnected);
    socket.on('message', onMessage);
    socket.on('partnerTyping', onPartnerTyping);
    socket.on('partnerTypingStopped', onPartnerTypingStopped);
    socket.on('searching', onSearching);
    socket.on('error', onError);
    socket.on('stats', (data) => {
      console.log('📊 Stats update:', data);
    });

    return socket;
  }, [initializeSocket, onConnect, onDisconnect, onRegistered, onMatched, 
      onPartnerDisconnected, onMessage, onTyping, onPartnerTyping, 
      onPartnerTypingStopped, onSearching, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emitEvent = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Emitted ${event}:`, data);
    }
  }, []);

  const isConnected = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emitEvent,
    isConnected,
    initializeSocket
  };
};