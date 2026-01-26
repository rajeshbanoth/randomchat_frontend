// // src/context/ChatContext.jsx
// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';

// const SOCKET_SERVER_URL = 'http://localhost:5000';

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [currentScreen, setCurrentScreen] = useState('home');
//   const [userProfile, setUserProfile] = useState(null);
//   const [partner, setPartner] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [onlineCount, setOnlineCount] = useState(0);
//   const [searching, setSearching] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [interests, setInterests] = useState([]);
//   const [autoConnect, setAutoConnect] = useState(true);
//   const [currentChatMode, setCurrentChatMode] = useState('text');
//   const [searchTime, setSearchTime] = useState(0);
//   const [partnerTyping, setPartnerTyping] = useState(false);
  
//   const socketRef = useRef(null);
//   const searchTimerRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const lastTypingEmittedRef = useRef(0);
//   const typingDebounceRef = useRef(null);


//   // Debug useEffect for search state
// useEffect(() => {
//   console.log('🔍 Search State Update:', {
//     searching,
//     partner: partner ? partner.profile?.username : 'None',
//     searchTime,
//     currentScreen,
//     autoConnect
//   });
// }, [searching, partner, searchTime, currentScreen, autoConnect]);

// // Debug useEffect for socket events
// useEffect(() => {
//   if (!socketRef.current) return;
  
//   const handleSearchEvent = (data) => {
//     console.log('🔍 Socket search event fired:', data);
//   };
  
//   socketRef.current.on('search', handleSearchEvent);
  
//   return () => {
//     socketRef.current.off('search', handleSearchEvent);
//   };
// }, [socketRef.current]);

//   const addNotification = (message, type = 'info') => {
//     const id = Date.now();
//     const notification = { id, message, type };
    
//     setNotifications(prev => [notification, ...prev.slice(0, 3)]);
    
//     setTimeout(() => {
//       setNotifications(prev => prev.filter(n => n.id !== id));
//     }, 4000);
//   };

//   const startSearch = (mode) => {
//     if (!socketRef.current || !connected) {
//       addNotification('Not connected to server', 'error');
//       return;
//     }

//     if (!userProfile) {
//       addNotification('Please create a profile first', 'error');
//       setCurrentScreen('profile');
//       return;
//     }

//     console.log(`Starting ${mode} chat search`);
    
//     setCurrentChatMode(mode);
//     setSearching(true);
//     setPartner(null);
//     setMessages([]);
//     setSearchTime(0);
//     setPartnerTyping(false);

//     const updatedProfile = {
//       ...userProfile,
//       chatMode: mode,
//       interests: interests,
//       socketId: socketRef.current.id,
//       id: socketRef.current.id
//     };
    
//     setUserProfile(updatedProfile);
//     localStorage.setItem('omegle-profile', JSON.stringify(updatedProfile));
    
//     socketRef.current.emit('search', {
//       mode: mode,
//       interests: interests,
//       genderPreference: userProfile.genderPreference || 'any',
//       ageRange: userProfile.ageRange || { min: 18, max: 60 },
//       isPremium: userProfile.isPremium || false,
//       timestamp: Date.now()
//     });
    
//     if (mode === 'video') {
//       setCurrentScreen('video-chat');
//     } else {
//       setCurrentScreen('text-chat');
//     }
    
//     addNotification(`Searching for ${mode} chat partner...`, 'info');
//   };

//   const resetSearchState = () => {
//   console.log('🔄 Resetting search state');
  
//   // Clear all timers
//   if (searchTimerRef.current) {
//     clearInterval(searchTimerRef.current);
//     searchTimerRef.current = null;
//   }
  
//   if (typingTimeoutRef.current) {
//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = null;
//   }
  
//   if (typingDebounceRef.current) {
//     clearTimeout(typingDebounceRef.current);
//     typingDebounceRef.current = null;
//   }
  
//   // Reset states
//   setPartner(null);
//   setMessages([]);
//   setSearchTime(0);
//   setPartnerTyping(false);
//   setSearching(false);
  
//   lastTypingEmittedRef.current = 0;
// };

//   const disconnectPartner = () => {
//     if (!socketRef.current || !partner) return;

//     socketRef.current.emit('disconnect-partner', {
//       reason: 'user_request',
//       timestamp: Date.now()
//     });

//     setPartner(null);
//     setMessages([]);
//     setPartnerTyping(false);
//     addNotification('Disconnected from partner', 'info');
//     setCurrentScreen('home');
//   };

//   const sendMessage = (text, isSystem = false) => {
//     if (!socketRef.current || !text || !partner) return;

//     const messageData = {
//       text: text,
//       type: isSystem ? 'system' : 'text',
//       timestamp: Date.now(),
//       senderId: userProfile?.id,
//       senderName: userProfile?.username
//     };

//     if (!isSystem) {
//       socketRef.current.emit('message', messageData);
//     }
    
//     setMessages(prev => [...prev, {
//       ...messageData,
//       sender: isSystem ? 'system' : 'me'
//     }]);
    
//     handleTypingStop();
//   };

// const nextPartner = () => {
//   if (!socketRef.current) return;

//   // If we're already searching, don't start another search
//   if (searching) {
//     console.log('⚠️ Already searching, skipping duplicate nextPartner call');
//     return;
//   }

//   console.log('🔄 Switching to next partner...');
  
//   // Clear all timeouts
//   setPartnerTyping(false);
//   if (typingTimeoutRef.current) {
//     clearTimeout(typingTimeoutRef.current);
//   }
//   if (typingDebounceRef.current) {
//     clearTimeout(typingDebounceRef.current);
//   }
  
//   // If we have a partner, disconnect first
//   if (partner) {
//     console.log('🔌 Disconnecting from current partner before searching');
//     socketRef.current.emit('next', {
//       reason: 'user_requested_next',
//       timestamp: Date.now(),
//       currentMode: currentChatMode,
//       partnerId: partner.id || partner._id
//     });
//   }
  
//   // Clear partner and start searching
//   setPartner(null);
//   setMessages([]);
//   setSearching(true);
//   setSearchTime(0);
  
//   // Add system message
//   setMessages(prev => [...prev, {
//     type: 'system',
//     text: 'Disconnected. Searching for new partner...',
//     timestamp: Date.now(),
//     sender: 'system'
//   }]);
  
//   // Clear any existing search timer
//   if (searchTimerRef.current) {
//     clearInterval(searchTimerRef.current);
//   }
  
//   // Start new search timer
//   searchTimerRef.current = setInterval(() => {
//     setSearchTime(prev => prev + 1);
//   }, 1000);
  
//   // Prepare search data
//   const searchData = {
//     mode: currentChatMode,
//     interests: interests || [],
//     genderPreference: userProfile?.genderPreference || 'any',
//     ageRange: userProfile?.ageRange || { min: 18, max: 60 },
//     isPremium: userProfile?.isPremium || false,
//     socketId: socketRef.current.id,
//     userId: userProfile?.id || socketRef.current.id,
//     username: userProfile?.username || 'Anonymous',
//     timestamp: Date.now()
//   };
  
//   console.log('🔍 Emitting search from nextPartner:', searchData);
//   socketRef.current.emit('search', searchData);
  
//   addNotification('Looking for next partner...', 'info');
// };

//   const updateInterests = (newInterests) => {
//     setInterests(newInterests);
    
//     if (userProfile) {
//       const updatedProfile = { 
//         ...userProfile, 
//         interests: newInterests 
//       };
//       setUserProfile(updatedProfile);
//       localStorage.setItem('omegle-profile', JSON.stringify(updatedProfile));
      
//       if (socketRef.current?.connected) {
//         socketRef.current.emit('register', updatedProfile);
//       }
//     }
//   };

//   const updateUserProfile = (profile) => {
//     const fullProfile = {
//       ...profile,
//       socketId: socketRef.current?.id,
//       id: socketRef.current?.id,
//       chatMode: profile.chatMode || 'text',
//       interests: profile.interests || [],
//       genderPreference: profile.genderPreference || 'any',
//       ageRange: profile.ageRange || { min: 18, max: 60 },
//       isPremium: profile.isPremium || false,
//       avatar: profile.avatar || null,
//       bio: profile.bio || '',
//       createdAt: profile.createdAt || Date.now()
//     };
    
//     setUserProfile(fullProfile);
//     setInterests(fullProfile.interests || []);
//     setCurrentChatMode(fullProfile.chatMode);
//     localStorage.setItem('omegle-profile', JSON.stringify(fullProfile));
    
//     if (socketRef.current?.connected) {
//       socketRef.current.emit('register', fullProfile);
//     }
    
//     setCurrentScreen('home');
//     addNotification('Profile saved successfully!', 'success');
//   };

//   const handleTypingStart = () => {
//     if (!socketRef.current || !partner) return;
    
//     const now = Date.now();
    
//     if (now - lastTypingEmittedRef.current < 500) {
//       return;
//     }
    
//     lastTypingEmittedRef.current = now;
    
//     const typingData = {
//       partnerId: partner.id,
//       userId: userProfile?.id || socketRef.current.id,
//       username: userProfile?.username,
//       timestamp: now
//     };
    
//     console.log('⌨️ Emitting typing START:', typingData);
//     socketRef.current.emit('typing', typingData);
    
//     if (typingDebounceRef.current) {
//       clearTimeout(typingDebounceRef.current);
//     }
//   };

//   const handleTypingStop = () => {
//     if (!socketRef.current || !partner) return;
    
//     if (typingDebounceRef.current) {
//       clearTimeout(typingDebounceRef.current);
//     }
    
//     typingDebounceRef.current = setTimeout(() => {
//       const typingData = {
//         partnerId: partner.id,
//         userId: userProfile?.id || socketRef.current.id,
//         timestamp: Date.now()
//       };
      
//       console.log('💤 Emitting typing STOP:', typingData);
//       socketRef.current.emit('typingStopped', typingData);
      
//       typingDebounceRef.current = null;
//     }, 1000);
//   };

//   // Initialize socket connection
//   useEffect(() => {
//     if (socketRef.current && socketRef.current.connected) {
//       console.log('Socket already connected');
//       return;
//     }

//     console.log('Initializing socket connection...');
    
//     const newSocket = io(SOCKET_SERVER_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 30000,
//       autoConnect: true
//     });
    
//     socketRef.current = newSocket;
//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//       console.log('✅ Connected to server with ID:', newSocket.id);
//       setConnected(true);
      
//       const savedProfile = localStorage.getItem('omegle-profile');
//       if (savedProfile) {
//         try {
//           const profile = JSON.parse(savedProfile);
//           console.log('📂 Loaded profile:', profile.username);
          
//           const updatedProfile = {
//             ...profile,
//             socketId: newSocket.id,
//             id: newSocket.id
//           };
          
//           setUserProfile(updatedProfile);
//           setInterests(profile.interests || []);
//           setCurrentChatMode(profile.chatMode || 'text');
          
//           newSocket.emit('register', updatedProfile);
          
//         } catch (error) {
//           console.error('Error loading profile:', error);
//           localStorage.removeItem('omegle-profile');
//           setCurrentScreen('profile');
//         }
//       } else {
//         setCurrentScreen('profile');
//       }
      
//       addNotification('Connected to server', 'success');
//     });

//     newSocket.on('disconnect', (reason) => {
//       console.log('🔌 Disconnected from server:', reason);
//       setConnected(false);
//       addNotification('Disconnected from server', 'warning');
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('Connection error:', error.message);
//       setConnected(false);
//       addNotification('Connection error', 'error');
//     });

//     newSocket.on('registered', (data) => {
//       console.log('✅ Registered successfully:', data.profile?.username);
//       if (data.profile) {
//         const updatedProfile = {
//           ...data.profile,
//           id: newSocket.id
//         };
//         setUserProfile(updatedProfile);
//         setInterests(data.profile.interests || []);
//         setCurrentChatMode(data.profile.chatMode || 'text');
//       }
//       setCurrentScreen('home');
//       addNotification(`Welcome ${data.profile?.username || 'User'}!`, 'success');
//     });

//     newSocket.on('partnerTyping', (data) => {
//       console.log('⌨️ Partner Typing Event:', data);
      
//       if (partner && data.userId === partner.id) {
//         console.log('✅ Valid partner typing event');
//         setPartnerTyping(true);
        
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
        
//         typingTimeoutRef.current = setTimeout(() => {
//           console.log('⏰ Auto-clearing partner typing (timeout)');
//           setPartnerTyping(false);
//         }, 3000);
//       } else {
//         console.log('❌ Typing event from non-partner or no partner');
//       }
//     });

//     newSocket.on('partnerTypingStopped', (data) => {
//       console.log('💤 Partner Typing Stopped Event:', data);
      
//       if (partner && data.userId === partner.id) {
//         console.log('✅ Valid partner typing stopped event');
//         setPartnerTyping(false);
        
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//           typingTimeoutRef.current = null;
//         }
//       }
//     });

//     newSocket.on('searching', () => {
//       console.log('🔍 Searching for partner...');
//       setSearching(true);
//       setSearchTime(0);
//       addNotification('Searching for partner...', 'info');
//     });

// newSocket.on('matched', (data) => {
//   console.log('🎯 Matched with partner:', {
//     partnerId: data.id,
//     username: data.profile?.username,
//     mode: data.profile?.chatMode,
//     data: data
//   });
  
//   // Clear search timer
//   if (searchTimerRef.current) {
//     clearInterval(searchTimerRef.current);
//     searchTimerRef.current = null;
//   }
  
//   setSearching(false);
//   setPartnerTyping(false);
  
//   const partnerMode = data.profile?.chatMode || 'text';
//   if (partnerMode !== currentChatMode) {
//     console.warn('Mode mismatch! Our mode:', currentChatMode, 'Partner mode:', partnerMode);
//     addNotification('Partner mode mismatch. Please try again.', 'warning');
    
//     setTimeout(() => {
//       startSearch(currentChatMode);
//     }, 1000);
//     return;
//   }
  
//   // Set partner and clear messages
//   setPartner(data);
//   setMessages([]);
  
//   addNotification(`Matched with ${data.profile?.username || 'stranger'}`, 'success');
  
//   // Ensure we're on the correct screen
//   if (currentChatMode === 'video' && currentScreen !== 'video-chat') {
//     setCurrentScreen('video-chat');
//   } else if (currentChatMode === 'text' && currentScreen !== 'text-chat') {
//     setCurrentScreen('text-chat');
//   }
// });

//     newSocket.on('partnerDisconnected', (data) => {
//   console.log('🚫 Partner Disconnected Event:', data);
  
//   // Clear all timeouts first
//   setPartnerTyping(false);
//   if (typingTimeoutRef.current) {
//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = null;
//   }
  
//   if (typingDebounceRef.current) {
//     clearTimeout(typingDebounceRef.current);
//     typingDebounceRef.current = null;
//   }
  
//   // Clear search timer if exists
//   if (searchTimerRef.current) {
//     clearInterval(searchTimerRef.current);
//     searchTimerRef.current = null;
//   }
  
//   setPartner(null);
  
//   // Add disconnect message
//   setMessages(prev => [...prev, {
//     type: 'system',
//     text: 'Partner has left the chat',
//     timestamp: Date.now(),
//     sender: 'system'
//   }]);
  
//   addNotification('Partner disconnected', 'info');
  
//   // Handle auto-connect
//   if (autoConnect && (currentScreen === 'text-chat' || currentScreen === 'video-chat')) {
//     console.log('🔄 Auto-connect triggered after partner disconnect');
    
//     // Clear any previous search state
//     setSearching(false);
    
//     // Wait a moment then start new search
//     setTimeout(() => {
//       console.log('🔍 Starting auto-connect search...');
      
//       // Force state reset
//       setPartner(null);
//       setMessages([]);
//       setSearching(true);
//       setSearchTime(0);
      
//       // Start search timer
//       searchTimerRef.current = setInterval(() => {
//         setSearchTime(prev => prev + 1);
//       }, 1000);
      
//       // Prepare search data
//       const searchData = {
//         mode: currentChatMode,
//         interests: interests || [],
//         genderPreference: userProfile?.genderPreference || 'any',
//         ageRange: userProfile?.ageRange || { min: 18, max: 60 },
//         isPremium: userProfile?.isPremium || false,
//         socketId: newSocket.id,
//         userId: userProfile?.id || newSocket.id,
//         username: userProfile?.username || 'Anonymous',
//         timestamp: Date.now()
//       };
      
//       console.log('📤 Emitting search for auto-connect:', searchData);
//       newSocket.emit('search', searchData);
      
//       addNotification('Searching for new partner...', 'info');
      
//     }, 500); // Reduced delay to 500ms
//   }
// });

//     // newSocket.on('partnerDisconnected', (data) => {
//     //   console.log('🚫 Partner Disconnected Event:', data);
      
//     //   setPartnerTyping(false);
//     //   if (typingTimeoutRef.current) {
//     //     clearTimeout(typingTimeoutRef.current);
//     //     typingTimeoutRef.current = null;
//     //   }
      
//     //   if (typingDebounceRef.current) {
//     //     clearTimeout(typingDebounceRef.current);
//     //     typingDebounceRef.current = null;
//     //   }
      
//     //   setPartner(null);
      
//     //   setMessages(prev => [...prev, {
//     //     type: 'system',
//     //     text: 'Partner has left the chat',
//     //     timestamp: Date.now(),
//     //     sender: 'system'
//     //   }]);
      
//     //   addNotification('Partner disconnected', 'info');
      
//     //   if (autoConnect && (currentScreen === 'text-chat' || currentScreen === 'video-chat')) {
//     //     setTimeout(() => {
//     //       if (!searching) {
//     //         setSearching(true);
//     //         setSearchTime(0);
//     //         newSocket.emit('search', {
//     //           mode: currentChatMode,
//     //           interests: interests,
//     //           genderPreference: userProfile?.genderPreference || 'any',
//     //           ageRange: userProfile?.ageRange || { min: 18, max: 60 },
//     //           isPremium: userProfile?.isPremium || false,
//     //           timestamp: Date.now()
//     //         });
//     //         addNotification('Searching for new partner...', 'info');
//     //       }
//     //     }, 2000);
//     //   }
//     // });

//     newSocket.on('message', (data) => {
//       console.log('💬 Message received:', data.text);
//       setMessages(prev => [...prev, {
//         text: data.text,
//         sender: 'partner',
//         timestamp: data.timestamp,
//         senderName: data.senderName
//       }]);
      
//       setPartnerTyping(false);
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = null;
//       }
//     });

//     newSocket.on('stats', (data) => {
//       setOnlineCount(data.online || 0);
//     });

//     newSocket.on('error', (error) => {
//       console.error('Socket error:', error);
//       addNotification(error.message || 'An error occurred', 'error');
//     });

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//       if (searchTimerRef.current) {
//         clearInterval(searchTimerRef.current);
//       }
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       if (typingDebounceRef.current) {
//         clearTimeout(typingDebounceRef.current);
//       }
//     };
//   }, [currentChatMode]);

//   useEffect(() => {
//     setPartnerTyping(false);
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = null;
//     }
//     if (typingDebounceRef.current) {
//       clearTimeout(typingDebounceRef.current);
//       typingDebounceRef.current = null;
//     }
//     lastTypingEmittedRef.current = 0;
//   }, [partner]);

//   useEffect(() => {
//     if (searching) {
//       searchTimerRef.current = setInterval(() => {
//         setSearchTime(prev => prev + 1);
//       }, 1000);
//     } else {
//       if (searchTimerRef.current) {
//         clearInterval(searchTimerRef.current);
//       }
//     }
    
//     return () => {
//       if (searchTimerRef.current) {
//         clearInterval(searchTimerRef.current);
//       }
//     };
//   }, [searching]);

//   return (
//     <ChatContext.Provider value={{
//       socket,
//       connected,
//       currentScreen,
//       setCurrentScreen,
//       userProfile,
//       partner,
//       messages,
//       onlineCount,
//       searching,
//       setSearching,
//       notifications,
//       interests,
//       setInterests,
//       autoConnect,
//       setAutoConnect,
//       currentChatMode,
//       searchTime,
//       partnerTyping,
//       startSearch,
//       disconnectPartner,
//       sendMessage,
//       nextPartner,
//       addNotification,
//       updateInterests,
//       updateUserProfile,
//       handleTypingStart,
//       handleTypingStop,
//     }}>
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => useContext(ChatContext);



// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

// Constants
const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const LOCAL_STORAGE_KEYS = {
  PROFILE: 'omegle-profile',
  SETTINGS: 'omegle-settings'
};
const TYPING_DEBOUNCE_MS = 500;
const TYPING_TIMEOUT_MS = 3000;
const SEARCH_UPDATE_INTERVAL_MS = 1000;

// Error classes for better error handling
class ChatError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }
}

class ValidationError extends ChatError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class SocketError extends ChatError {
  constructor(message, details = {}) {
    super(message, 'SOCKET_ERROR', details);
    this.name = 'SocketError';
  }
}

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // State
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userProfile, setUserProfile] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [interests, setInterests] = useState([]);
  const [autoConnect, setAutoConnect] = useState(true);
  const [currentChatMode, setCurrentChatMode] = useState('text');
  const [searchTime, setSearchTime] = useState(0);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Refs
  const socketRef = useRef(null);
  const searchTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingEmittedRef = useRef(0);
  const typingDebounceRef = useRef(null);
  const isMountedRef = useRef(true);
  const autoSearchTimeoutRef = useRef(null);

  // Refs for state values
  const partnerRef = useRef(null);
  const currentChatModeRef = useRef('text');
  const autoConnectRef = useRef(true);
  const currentScreenRef = useRef('home');
  const userProfileRef = useRef(null);
  const interestsRef = useRef([]);
  const searchingRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    partnerRef.current = partner;
  }, [partner]);

  useEffect(() => {
    currentChatModeRef.current = currentChatMode;
  }, [currentChatMode]);

  useEffect(() => {
    autoConnectRef.current = autoConnect;
  }, [autoConnect]);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    interestsRef.current = interests;
  }, [interests]);

  useEffect(() => {
    searchingRef.current = searching;
  }, [searching]);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Safely update state only if component is mounted
   */
  const safeSetState = useCallback((setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  /**
   * Add notification with type safety and validation
   */
  const addNotification = useCallback((message, type = 'info') => {
    try {
      if (!message || typeof message !== 'string') {
        throw new ValidationError('Notification message must be a non-empty string');
      }

      const validTypes = ['info', 'success', 'warning', 'error'];
      if (!validTypes.includes(type)) {
        throw new ValidationError(`Invalid notification type: ${type}`);
      }

      const id = Date.now() + Math.random();
      const notification = { id, message, type, timestamp: Date.now() };
      
      safeSetState(setNotifications, prev => [notification, ...prev.slice(0, 4)]);
      
      setTimeout(() => {
        safeSetState(setNotifications, prev => prev.filter(n => n.id !== id));
      }, 5000);

      return id;
    } catch (error) {
      console.error('Failed to add notification:', error);
      return null;
    }
  }, [safeSetState]);

  /**
   * Clear all timers and timeouts
   */
  const clearAllTimers = useCallback(() => {
    try {
      const timers = [
        { ref: searchTimerRef, type: 'interval' },
        { ref: typingTimeoutRef, type: 'timeout' },
        { ref: typingDebounceRef, type: 'timeout' },
        { ref: autoSearchTimeoutRef, type: 'timeout' }
      ];

      timers.forEach(({ ref, type }) => {
        if (ref.current) {
          if (type === 'interval') {
            clearInterval(ref.current);
          } else {
            clearTimeout(ref.current);
          }
          ref.current = null;
        }
      });

      lastTypingEmittedRef.current = 0;
    } catch (error) {
      console.error('Error clearing timers:', error);
    }
  }, []);

  /**
   * Validate profile data
   */
  const validateProfile = useCallback((profile) => {
    if (!profile) {
      throw new ValidationError('Profile is required');
    }

    if (!profile.username || typeof profile.username !== 'string' || profile.username.trim().length === 0) {
      throw new ValidationError('Username is required and must be a non-empty string');
    }

    if (profile.username.length > 20) {
      throw new ValidationError('Username must be less than 20 characters');
    }

    const validGenders = ['male', 'female', 'other', 'any'];
    if (profile.genderPreference && !validGenders.includes(profile.genderPreference)) {
      throw new ValidationError(`Invalid gender preference. Must be one of: ${validGenders.join(', ')}`);
    }

    if (profile.ageRange) {
      if (typeof profile.ageRange.min !== 'number' || typeof profile.ageRange.max !== 'number') {
        throw new ValidationError('Age range must have numeric min and max values');
      }
      if (profile.ageRange.min < 13 || profile.ageRange.max > 100) {
        throw new ValidationError('Age range must be between 13 and 100');
      }
      if (profile.ageRange.min > profile.ageRange.max) {
        throw new ValidationError('Minimum age cannot be greater than maximum age');
      }
    }

    if (profile.interests && !Array.isArray(profile.interests)) {
      throw new ValidationError('Interests must be an array');
    }

    const validChatModes = ['text', 'video'];
    if (profile.chatMode && !validChatModes.includes(profile.chatMode)) {
      throw new ValidationError(`Invalid chat mode. Must be one of: ${validChatModes.join(', ')}`);
    }

    return true;
  }, []);

  /**
   * Save profile to localStorage
   */
  const saveProfileToStorage = useCallback((profile) => {
    try {
      validateProfile(profile);
      const profileData = {
        ...profile,
        lastUpdated: Date.now()
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }, [validateProfile]);

  /**
   * Load profile from localStorage
   */
  const loadProfileFromStorage = useCallback(() => {
    try {
      const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE);
      if (!savedProfile) return null;

      const profile = JSON.parse(savedProfile);
      validateProfile(profile);
      
      return profile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PROFILE);
      return null;
    }
  }, [validateProfile]);

  // ==================== TYPING HANDLERS ====================

  /**
   * Handle typing start with debouncing
   */
  const handleTypingStart = useCallback(() => {
    try {
      if (!socketRef.current || !socketRef.current.connected) {
        throw new SocketError('Socket not connected');
      }

      const currentPartner = partnerRef.current;
      if (!currentPartner) {
        throw new ValidationError('No partner to send typing indicator to');
      }

      const now = Date.now();
      
      if (now - lastTypingEmittedRef.current < TYPING_DEBOUNCE_MS) {
        return false;
      }
      
      lastTypingEmittedRef.current = now;
      
      const typingData = {
        partnerId: currentPartner.id || currentPartner._id,
        userId: userProfileRef.current?.id || socketRef.current.id,
        username: userProfileRef.current?.username || 'Anonymous',
        timestamp: now,
        chatMode: currentChatModeRef.current
      };
      
      console.log('Emitting typing start:', typingData);
      socketRef.current.emit('typing', typingData);
      
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send typing start:', error);
      return false;
    }
  }, []);

  /**
   * Handle typing stop with debouncing
   */
  const handleTypingStop = useCallback(() => {
    try {
      if (!socketRef.current || !socketRef.current.connected) {
        throw new SocketError('Socket not connected');
      }

      const currentPartner = partnerRef.current;
      if (!currentPartner) {
        throw new ValidationError('No partner to send typing indicator to');
      }

      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      
      typingDebounceRef.current = setTimeout(() => {
        const typingData = {
          partnerId: currentPartner.id || currentPartner._id,
          userId: userProfileRef.current?.id || socketRef.current.id,
          timestamp: Date.now()
        };
        
        console.log('Emitting typing stop:', typingData);
        socketRef.current.emit('typingStopped', typingData);
        
        typingDebounceRef.current = null;
      }, TYPING_DEBOUNCE_MS);
      
      return true;
    } catch (error) {
      console.error('Failed to send typing stop:', error);
      return false;
    }
  }, []);

  // ==================== CHAT FUNCTIONS ====================

  /**
   * Send a message to the current partner
   */
  const sendMessage = useCallback((text, isSystem = false) => {
    try {
      if (!socketRef.current || !socketRef.current.connected) {
        throw new SocketError('Socket not connected');
      }

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new ValidationError('Message text is required');
      }

      if (text.length > 1000) {
        throw new ValidationError('Message too long (max 1000 characters)');
      }

      const currentPartner = partnerRef.current;
      if (!currentPartner && !isSystem) {
        throw new ValidationError('No partner to send message to');
      }

      const currentUserProfile = userProfileRef.current;
      const messageData = {
        text: text.trim(),
        type: isSystem ? 'system' : 'text',
        timestamp: Date.now(),
        senderId: currentUserProfile?.id || socketRef.current.id,
        senderName: currentUserProfile?.username || 'Anonymous',
        partnerId: currentPartner?.id
      };

      if (!isSystem) {
        socketRef.current.emit('message', messageData);
      }
      
      const messageToAdd = {
        ...messageData,
        sender: isSystem ? 'system' : 'me',
        id: Date.now() + Math.random()
      };
      
      safeSetState(setMessages, prev => [...prev, messageToAdd]);
      
      if (!isSystem) {
        handleTypingStop();
      }

      console.log('Message sent:', { 
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        isSystem,
        partnerId: currentPartner?.id 
      });

      return messageToAdd.id;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = error instanceof ValidationError 
        ? error.message 
        : 'Failed to send message';
      
      addNotification(errorMessage, 'error');
      return null;
    }
  }, [addNotification, safeSetState, handleTypingStop]);

  /**
   * Start searching for a chat partner
   */
  const startSearch = useCallback((mode) => {
    try {

      console.log("mode selected",  mode);
      if (!socketRef.current || !socketRef.current.connected) {
        throw new SocketError('Not connected to server', { connected, socketExists: !!socketRef.current });
      }

      const currentUserProfile = userProfileRef.current;
      if (!currentUserProfile) {
        addNotification('Please create a profile first', 'error');
        safeSetState(setCurrentScreen, 'profile');
        return false;
      }

      const validModes = ['text', 'video'];
      if (!validModes.includes(mode)) {
        throw new ValidationError(`Invalid chat mode: ${mode}`, { validModes });
      }

      console.log(`Starting ${mode} chat search`);
      
      // Reset search state
      clearAllTimers();
      
      safeSetState(setCurrentChatMode, mode);
      safeSetState(setSearching, true);
      safeSetState(setPartner, null);
      safeSetState(setMessages, []);
      safeSetState(setSearchTime, 0);
      safeSetState(setPartnerTyping, false);

      // Update profile with current mode
      const currentInterests = interestsRef.current;
      const updatedProfile = {
        ...currentUserProfile,
        chatMode: mode,
        interests: currentInterests,
        socketId: socketRef.current.id,
        id: socketRef.current.id,
        lastActive: Date.now()
      };

      if (!saveProfileToStorage(updatedProfile)) {
        throw new ChatError('Failed to save profile');
      }

      safeSetState(setUserProfile, updatedProfile);

      // Emit search event
      const searchData = {
        mode,
        interests: currentInterests || [],
        genderPreference: currentUserProfile.genderPreference || 'any',
        ageRange: currentUserProfile.ageRange || { min: 18, max: 60 },
        isPremium: currentUserProfile.isPremium || false,
        socketId: socketRef.current.id,
        userId: currentUserProfile.id || socketRef.current.id,
        username: currentUserProfile.username,
        timestamp: Date.now()
      };

      socketRef.current.emit('search', searchData);
      
      // Navigate to appropriate screen
      if (mode === 'video') {
        safeSetState(setCurrentScreen, 'video-chat');
      } else {
        safeSetState(setCurrentScreen, 'text-chat');
      }
      
      // Start search timer
      searchTimerRef.current = setInterval(() => {
        safeSetState(setSearchTime, prev => prev + 1);
      }, SEARCH_UPDATE_INTERVAL_MS);

      addNotification(`Searching for ${mode} chat partner...`, 'info');
      
      console.log('Search started with data:', {
        mode,
        interests: currentInterests,
        profile: updatedProfile.username
      });

      return true;
    } catch (error) {
      console.error('Failed to start search:', error);
      
      let errorMessage = 'Failed to start search';
      if (error instanceof ValidationError) {
        errorMessage = `Invalid input: ${error.message}`;
      } else if (error instanceof SocketError) {
        errorMessage = 'Connection issue. Please check your internet connection.';
      }
      
      addNotification(errorMessage, 'error');
      safeSetState(setSearching, false);
      
      return false;
    }
  }, [clearAllTimers, saveProfileToStorage, addNotification, safeSetState]);

  /**
   * Reset all search-related state
   */
  const resetSearchState = useCallback(() => {
    try {
      console.log('Resetting search state');
      
      clearAllTimers();
      
      safeSetState(setPartner, null);
      safeSetState(setMessages, []);
      safeSetState(setSearchTime, 0);
      safeSetState(setPartnerTyping, false);
      safeSetState(setSearching, false);
      
      addNotification('Search reset successfully', 'info');
      
      return true;
    } catch (error) {
      console.error('Failed to reset search state:', error);
      addNotification('Failed to reset search', 'error');
      return false;
    }
  }, [clearAllTimers, addNotification, safeSetState]);

  /**
   * Disconnect from current partner
   */
  const disconnectPartner = useCallback(() => {
    try {
      if (!socketRef.current || !socketRef.current.connected) {
        throw new SocketError('Socket not connected');
      }

      const currentPartner = partnerRef.current;
      if (!currentPartner) {
        throw new ValidationError('No partner to disconnect from');
      }

      const currentUserProfile = userProfileRef.current;
      const disconnectData = {
        reason: 'user_request',
        partnerId: currentPartner.id || currentPartner._id,
        timestamp: Date.now(),
        userId: currentUserProfile?.id || socketRef.current.id
      };

      socketRef.current.emit('disconnect-partner', disconnectData);

      safeSetState(setPartner, null);
      safeSetState(setMessages, []);
      safeSetState(setPartnerTyping, false);
      
      addNotification('Disconnected from partner', 'info');
      safeSetState(setCurrentScreen, 'home');

      console.log('Partner disconnected:', disconnectData);
      return true;
    } catch (error) {
      console.error('Failed to disconnect partner:', error);
      
      const errorMessage = error instanceof ValidationError 
        ? error.message 
        : 'Failed to disconnect from partner';
      
      addNotification(errorMessage, 'error');
      return false;
    }
  }, [addNotification, safeSetState]);

  /**
   * Find next partner
   */
  const nextPartner = useCallback(() => {
    try {
      if (!socketRef.current || !socketRef.current.connected) {
        throw new SocketError('Socket not connected');
      }

      if (searchingRef.current) {
        console.warn('Already searching for a partner');
        addNotification('Already searching for a partner', 'warning');
        return false;
      }

      console.log('Switching to next partner...');
      
      // Clear all timeouts and typing indicators
      clearAllTimers();
      
      // Disconnect from current partner if exists
      const currentPartner = partnerRef.current;
      if (currentPartner) {
        const disconnectData = {
          reason: 'user_requested_next',
          timestamp: Date.now(),
          currentMode: currentChatModeRef.current,
          partnerId: currentPartner.id || currentPartner._id,
          userId: userProfileRef.current?.id || socketRef.current.id
        };
        
        socketRef.current.emit('next', disconnectData);
        console.log('Emitted next event:', disconnectData);
      }
      
      // Reset states
      safeSetState(setPartner, null);
      safeSetState(setMessages, []);
      safeSetState(setSearching, true);
      safeSetState(setSearchTime, 0);
      
      // Add system message
      safeSetState(setMessages, prev => [...prev, {
        type: 'system',
        text: 'Disconnected. Searching for new partner...',
        timestamp: Date.now(),
        sender: 'system',
        id: Date.now() + Math.random()
      }]);
      
      // Start search timer
      searchTimerRef.current = setInterval(() => {
        safeSetState(setSearchTime, prev => prev + 1);
      }, SEARCH_UPDATE_INTERVAL_MS);
      
      // Prepare and emit search
      const currentUserProfile = userProfileRef.current;
      const currentInterests = interestsRef.current;
      const searchData = {
        mode: currentChatModeRef.current,
        interests: currentInterests || [],
        genderPreference: currentUserProfile?.genderPreference || 'any',
        ageRange: currentUserProfile?.ageRange || { min: 18, max: 60 },
        isPremium: currentUserProfile?.isPremium || false,
        socketId: socketRef.current.id,
        userId: currentUserProfile?.id || socketRef.current.id,
        username: currentUserProfile?.username || 'Anonymous',
        timestamp: Date.now()
      };
      
      console.log('Emitting search for next partner:', searchData);
      socketRef.current.emit('search', searchData);
      
      addNotification('Looking for next partner...', 'info');
      
      return true;
    } catch (error) {
      console.error('Failed to find next partner:', error);
      
      const errorMessage = error instanceof SocketError 
        ? 'Connection issue. Please check your internet connection.'
        : 'Failed to find next partner';
      
      addNotification(errorMessage, 'error');
      safeSetState(setSearching, false);
      return false;
    }
  }, [clearAllTimers, addNotification, safeSetState]);

  /**
   * Handle auto-search after partner disconnect
   */
  const handleAutoSearch = useCallback(() => {
    try {
      const shouldAutoSearch = autoConnectRef.current && 
        (currentScreenRef.current === 'text-chat' || currentScreenRef.current === 'video-chat');
      
      if (!shouldAutoSearch) {
        console.log('Auto-search is disabled or not in chat screen');
        return;
      }

      console.log('Starting auto-search...');
      
      // Clear any existing timeout
      if (autoSearchTimeoutRef.current) {
        clearTimeout(autoSearchTimeoutRef.current);
        autoSearchTimeoutRef.current = null;
      }

      // Check if socket is connected
      if (!socketRef.current || !socketRef.current.connected) {
        console.log('Socket not connected, cannot auto-search');
        addNotification('Waiting for connection to resume...', 'warning');
        
        // Try again in 2 seconds
        autoSearchTimeoutRef.current = setTimeout(() => {
          handleAutoSearch();
        }, 2000);
        return;
      }

      // Don't start a new search if already searching
      if (searchingRef.current) {
        console.log('Already searching, skipping auto-search');
        return;
      }

      // Reset states
      safeSetState(setPartner, null);
      safeSetState(setMessages, []);
      safeSetState(setSearching, true);
      safeSetState(setSearchTime, 0);
      
      // Start search timer
      searchTimerRef.current = setInterval(() => {
        safeSetState(setSearchTime, prev => prev + 1);
      }, SEARCH_UPDATE_INTERVAL_MS);
      
      // Prepare search data
      const currentUserProfile = userProfileRef.current;
      const currentInterests = interestsRef.current;
      const searchData = {
        mode: currentChatModeRef.current,
        interests: currentInterests || [],
        genderPreference: currentUserProfile?.genderPreference || 'any',
        ageRange: currentUserProfile?.ageRange || { min: 18, max: 60 },
        isPremium: currentUserProfile?.isPremium || false,
        socketId: socketRef.current.id,
        userId: currentUserProfile?.id || socketRef.current.id,
        username: currentUserProfile?.username || 'Anonymous',
        timestamp: Date.now()
      };
      
      console.log('Emitting search for auto-search:', searchData);
      socketRef.current.emit('search', searchData);
      
      addNotification('Searching for new partner...', 'info');
      
    } catch (error) {
      console.error('Auto-search failed:', error);
      
      // Try again in 2 seconds
      autoSearchTimeoutRef.current = setTimeout(() => {
        handleAutoSearch();
      }, 2000);
    }
  }, [addNotification, safeSetState]);

  /**
   * Update user interests
   */
  const updateInterests = useCallback((newInterests) => {
    try {
      if (!Array.isArray(newInterests)) {
        throw new ValidationError('Interests must be an array');
      }

      // Validate each interest
      newInterests.forEach((interest, index) => {
        if (typeof interest !== 'string' || interest.trim().length === 0) {
          throw new ValidationError(`Invalid interest at index ${index}: must be a non-empty string`);
        }
        if (interest.length > 20) {
          throw new ValidationError(`Interest at index ${index} too long (max 20 characters)`);
        }
      });

      // Remove duplicates
      const uniqueInterests = [...new Set(newInterests.map(i => i.trim().toLowerCase()))];
      
      safeSetState(setInterests, uniqueInterests);
      
      const currentUserProfile = userProfileRef.current;
      if (currentUserProfile) {
        const updatedProfile = { 
          ...currentUserProfile, 
          interests: uniqueInterests,
          lastUpdated: Date.now()
        };
        
        safeSetState(setUserProfile, updatedProfile);
        
        if (!saveProfileToStorage(updatedProfile)) {
          throw new ChatError('Failed to save updated interests');
        }
        
        if (socketRef.current?.connected) {
          socketRef.current.emit('register', updatedProfile);
        }
      }

      console.log('Interests updated:', uniqueInterests);
      addNotification('Interests updated successfully', 'success');
      
      return true;
    } catch (error) {
      console.error('Failed to update interests:', error);
      
      const errorMessage = error instanceof ValidationError 
        ? `Invalid interests: ${error.message}`
        : 'Failed to update interests';
      
      addNotification(errorMessage, 'error');
      return false;
    }
  }, [saveProfileToStorage, addNotification, safeSetState]);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback((profile) => {
    try {
      validateProfile(profile);
      
      const fullProfile = {
        ...profile,
        socketId: socketRef.current?.id,
        id: socketRef.current?.id || profile.id,
        chatMode: profile.chatMode || 'text',
        interests: profile.interests || [],
        genderPreference: profile.genderPreference || 'any',
        ageRange: profile.ageRange || { min: 18, max: 60 },
        isPremium: profile.isPremium || false,
        avatar: profile.avatar || null,
        bio: profile.bio || '',
        createdAt: profile.createdAt || Date.now(),
        lastUpdated: Date.now()
      };
      
      safeSetState(setUserProfile, fullProfile);
      safeSetState(setInterests, fullProfile.interests || []);
      safeSetState(setCurrentChatMode, fullProfile.chatMode);
      
      if (!saveProfileToStorage(fullProfile)) {
        throw new ChatError('Failed to save profile');
      }
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('register', fullProfile);
      }
      
      safeSetState(setCurrentScreen, 'home');
      addNotification('Profile saved successfully!', 'success');
      
      console.log('Profile updated:', {
        username: fullProfile.username,
        interests: fullProfile.interests.length
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      const errorMessage = error instanceof ValidationError 
        ? `Invalid profile: ${error.message}`
        : 'Failed to save profile';
      
      addNotification(errorMessage, 'error');
      return false;
    }
  }, [validateProfile, saveProfileToStorage, addNotification, safeSetState]);

  // ==================== SOCKET EVENT HANDLERS ====================

  // Setup socket event handlers
  const setupSocketEventHandlers = useCallback((socketInstance) => {
    if (!socketInstance) return;

    console.log('Setting up socket event handlers...');

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Connected to server with ID:', socketInstance.id);
      safeSetState(setConnected, true);
      safeSetState(setConnectionError, null);
      
      const savedProfile = loadProfileFromStorage();
      if (savedProfile) {
        try {
          const updatedProfile = {
            ...savedProfile,
            socketId: socketInstance.id,
            id: socketInstance.id
          };
          
          safeSetState(setUserProfile, updatedProfile);
          safeSetState(setInterests, savedProfile.interests || []);
          safeSetState(setCurrentChatMode, savedProfile.chatMode || 'text');
          
          socketInstance.emit('register', updatedProfile);
          
          addNotification(`Welcome back, ${savedProfile.username}!`, 'success');
        } catch (error) {
          console.error('Error loading profile:', error);
          safeSetState(setCurrentScreen, 'profile');
        }
      } else {
        safeSetState(setCurrentScreen, 'profile');
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      safeSetState(setConnected, false);
      addNotification('Disconnected from server', 'warning');
      
      // If we were in a chat and autoConnect is enabled, clear partner
      if (autoConnectRef.current && 
          (currentScreenRef.current === 'text-chat' || currentScreenRef.current === 'video-chat')) {
        safeSetState(setPartner, null);
        safeSetState(setMessages, prev => [...prev, {
          type: 'system',
          text: 'Connection lost. Reconnecting...',
          timestamp: Date.now(),
          sender: 'system',
          id: Date.now() + Math.random()
        }]);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      safeSetState(setConnected, false);
      safeSetState(setConnectionError, error.message);
      addNotification('Connection error. Retrying...', 'error');
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      safeSetState(setConnected, true);
      safeSetState(setConnectionError, null);
      addNotification('Reconnected to server', 'success');
      
      // Re-register profile after reconnection
      const currentUserProfile = userProfileRef.current;
      if (currentUserProfile && socketInstance.connected) {
        const updatedProfile = {
          ...currentUserProfile,
          socketId: socketInstance.id,
          id: socketInstance.id
        };
        socketInstance.emit('register', updatedProfile);
        
        // If we were in a chat and autoConnect is enabled, start searching
        if (autoConnectRef.current && 
            (currentScreenRef.current === 'text-chat' || currentScreenRef.current === 'video-chat') &&
            !partnerRef.current) {
          setTimeout(() => {
            handleAutoSearch();
          }, 1000);
        }
      }
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      addNotification(error.message || 'An error occurred', 'error');
    });

    // Registration events
    socketInstance.on('registered', (data) => {
      console.log('Registered successfully:', data.profile?.username);
      if (data.profile) {
        const updatedProfile = {
          ...data.profile,
          id: socketInstance.id
        };
        safeSetState(setUserProfile, updatedProfile);
        safeSetState(setInterests, data.profile.interests || []);
        safeSetState(setCurrentChatMode, data.profile.chatMode || 'text');
      }
      safeSetState(setCurrentScreen, 'home');
    });

    // Chat events
    socketInstance.on('partnerTyping', (data) => {
      console.log('Partner typing event:', data);
      
      const currentPartner = partnerRef.current;
      if (currentPartner && data.userId === (currentPartner.id || currentPartner._id)) {
        safeSetState(setPartnerTyping, true);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          safeSetState(setPartnerTyping, false);
        }, TYPING_TIMEOUT_MS);
      }
    });

    socketInstance.on('partnerTypingStopped', (data) => {
      console.log('Partner typing stopped event:', data);
      
      const currentPartner = partnerRef.current;
      if (currentPartner && data.userId === (currentPartner.id || currentPartner._id)) {
        safeSetState(setPartnerTyping, false);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    });

    socketInstance.on('searching', () => {
      console.log('Searching for partner...');
      safeSetState(setSearching, true);
      safeSetState(setSearchTime, 0);
      addNotification('Searching for partner...', 'info');
    });

    // socketInstance.on('matched', (data) => {
    //   console.log('Matched with partner:', data);
      
    //   if (searchTimerRef.current) {
    //     clearInterval(searchTimerRef.current);
    //     searchTimerRef.current = null;
    //   }
      
    //   safeSetState(setSearching, false);
    //   safeSetState(setPartnerTyping, false);
      
    //   const partnerMode = data.profile?.chatMode || 'text';
    //   const currentMode = currentChatModeRef.current;
    //   if (partnerMode !== currentMode) {
    //     console.warn('Mode mismatch:', { currentMode, partnerMode });
    //     addNotification('Partner mode mismatch. Please try again.', 'warning');
        
    //     // Try to search again after a delay
    //     setTimeout(() => {
    //       handleAutoSearch();
    //     }, 1000);
    //     return;
    //   }
      
    //   safeSetState(setPartner, data);
    //   safeSetState(setMessages, []);
      
    //   addNotification(`Matched with ${data.profile?.username || 'stranger'}`, 'success');
    // });


    // Update the matched event handler in setupSocketEventHandlers
// Fix the matched event handler (remove early return)
socketInstance.on('matched', (data) => {
  console.log('Matched with partner:', data);
  
  if (searchTimerRef.current) {
    clearInterval(searchTimerRef.current);
    searchTimerRef.current = null;
  }
  
  safeSetState(setSearching, false);
  safeSetState(setPartnerTyping, false);
  
  const partnerMode = data.matchMode || data.profile?.chatMode || 'text';
  const currentMode = currentChatModeRef.current;
  
  console.log('Mode check:', { partnerMode, currentMode });
  
  // Only warn about mode mismatch, don't prevent setting partner
  if (partnerMode !== currentMode) {
    console.warn('Mode mismatch:', { currentMode, partnerMode });
    addNotification('Partner mode mismatch, but continuing...', 'warning');
  }
  
  // CRITICAL: Set partner state
  safeSetState(setPartner, data);
  
  // Also update partnerRef immediately
  partnerRef.current = data;
  
  // Clear messages when matched
  safeSetState(setMessages, []);
  
  // Navigate to appropriate screen based on mode
  const targetScreen = partnerMode === 'video' ? 'video-chat' : 'text-chat';
  safeSetState(setCurrentScreen, targetScreen);
  
  addNotification(`Matched with ${data.profile?.username || 'stranger'}`, 'success');
  
  // Dispatch event for VideoChatScreen
  if (partnerMode === 'video') {
    console.log('Dispatching video-match event for VideoChatScreen');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('video-match', { 
        detail: { 
          partner: data,
          timestamp: Date.now()
        } 
      }));
    }, 100);
  }
});

// Handle video-match-ready event from server
socketInstance.on('video-match-ready', (data) => {
  console.log('Video match ready event received:', data);
  
  // Update partner with video call info
  safeSetState(setPartner, prevPartner => {
    if (prevPartner && (prevPartner.partnerId === data.partnerId || prevPartner.id === data.partnerId)) {
      return {
        ...prevPartner,
        videoCallId: data.callId,
        roomId: data.roomId,
        partnerProfile: data.partnerProfile
      };
    }
    return prevPartner;
  });
  
  // Also update partnerRef
  if (partnerRef.current && (partnerRef.current.partnerId === data.partnerId || partnerRef.current.id === data.partnerId)) {
    partnerRef.current = {
      ...partnerRef.current,
      videoCallId: data.callId,
      roomId: data.roomId,
      partnerProfile: data.partnerProfile
    };
  }
  
  addNotification('Video call is ready to start!', 'success');
  
  // Notify VideoChatScreen
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('video-call-ready', { 
      detail: data 
    }));
  }, 100);
});

// WebRTC signaling handlers
socketInstance.on('webrtc-offer', (data) => {
  console.log('WebRTC offer received:', data);
  // This will be handled by VideoChatScreen
  window.dispatchEvent(new CustomEvent('webrtc-offer', { detail: data }));
});

socketInstance.on('webrtc-answer', (data) => {
  console.log('WebRTC answer received:', data);
  window.dispatchEvent(new CustomEvent('webrtc-answer', { detail: data }));
});

socketInstance.on('webrtc-ice-candidate', (data) => {
  console.log('WebRTC ICE candidate received:', data);
  window.dispatchEvent(new CustomEvent('webrtc-ice-candidate', { detail: data }));
});

socketInstance.on('webrtc-end', (data) => {
  console.log('WebRTC call ended:', data);
  window.dispatchEvent(new CustomEvent('webrtc-end', { detail: data }));
  
  // Reset video call state
  safeSetState(setPartner, prev => {
    if (prev) {
      const { videoCallId, ...rest } = prev;
      return rest;
    }
    return prev;
  });
});

socketInstance.on('webrtc-error', (data) => {
  console.error('WebRTC error:', data);
  window.dispatchEvent(new CustomEvent('webrtc-error', { detail: data }));
  addNotification(`WebRTC error: ${data.error || 'Unknown'}`, 'error');
});
    socketInstance.on('partnerDisconnected', (data) => {
      console.log('Partner disconnected:', data);
      
      clearAllTimers();
      safeSetState(setPartner, null);
      
      safeSetState(setMessages, prev => [...prev, {
        type: 'system',
        text: 'Partner has left the chat',
        timestamp: Date.now(),
        sender: 'system',
        id: Date.now() + Math.random()
      }]);
      
      addNotification('Partner disconnected', 'info');
      
      // Handle auto-search
      setTimeout(() => {
        handleAutoSearch();
      }, 1000);
    });

    socketInstance.on('message', (data) => {
      console.log('Message received:', data.text);
      safeSetState(setMessages, prev => [...prev, {
        text: data.text,
        sender: 'partner',
        timestamp: data.timestamp,
        senderName: data.senderName,
        id: Date.now() + Math.random()
      }]);
      
      safeSetState(setPartnerTyping, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    });

    socketInstance.on('stats', (data) => {
      safeSetState(setOnlineCount, data.online || 0);
    });
  }, [addNotification, safeSetState, clearAllTimers, loadProfileFromStorage, handleAutoSearch]);

  // ==================== EFFECTS ====================

  // Initialize socket connection - RUNS ONLY ONCE
  useEffect(() => {
    isMountedRef.current = true;

    if (socketRef.current) {
      console.log('Socket already initialized');
      return;
    }

    console.log('Initializing socket connection...');
    
    try {
      const newSocket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 30000,
        autoConnect: true,
        withCredentials: true
      });
      
      socketRef.current = newSocket;
      safeSetState(setSocket, newSocket);

      setupSocketEventHandlers(newSocket);
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      addNotification('Failed to connect to server', 'error');
      safeSetState(setConnectionError, error.message);
    }

    return () => {
      console.log('Cleaning up socket connection...');
      isMountedRef.current = false;
      
      clearAllTimers();
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array - runs only once

  // Clean up typing indicator when partner changes
  useEffect(() => {
    safeSetState(setPartnerTyping, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    lastTypingEmittedRef.current = 0;
  }, [partner, safeSetState]);

  // Handle search timer
  useEffect(() => {
    if (searching) {
      searchTimerRef.current = setInterval(() => {
        safeSetState(setSearchTime, prev => prev + 1);
      }, SEARCH_UPDATE_INTERVAL_MS);
    } else {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    }
    
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, [searching, safeSetState]);


  // In your ChatProvider component, add these functions:
const debugGetState = useCallback(() => {
  return {
    partnerRef: partnerRef.current,
    partnerState: partner,
    socketConnected: socket?.connected,
    socketId: socket?.id,
    currentChatMode,
    searching,
    messagesCount: messages.length
  };
}, [partner, socket, currentChatMode, searching, messages]);

const debugForcePartnerUpdate = useCallback((partnerData) => {
  console.log('Force updating partner:', partnerData);
  safeSetState(setPartner, partnerData);
  partnerRef.current = partnerData;
  return true;
}, [safeSetState]);

  // ==================== CONTEXT VALUE ====================

  const contextValue = {
    // State
    socket,
    connected,
    currentScreen,
    userProfile,
    partner,
    messages,
    onlineCount,
    searching,
    notifications,
    interests,
    autoConnect,
    currentChatMode,
    searchTime,
    partnerTyping,
    connectionError,


    debugGetState,      // Add this
  debugForcePartnerUpdate , // Add this,
    
    // Actions
    setCurrentScreen: (screen) => safeSetState(setCurrentScreen, screen),
    setSearching: (value) => safeSetState(setSearching, value),
    setInterests: (value) => safeSetState(setInterests, value),
    setAutoConnect: (value) => safeSetState(setAutoConnect, value),
    
    // Functions
    startSearch,
    disconnectPartner,
    sendMessage,
    nextPartner,
    addNotification,
    updateInterests,
    updateUserProfile,
    handleTypingStart,
    handleTypingStop,
    resetSearchState,


     // WebRTC functions
  sendWebRTCOffer: (data) => {
    if (socket?.connected) {
      socket.emit('webrtc-offer', data);
      console.log('WebRTC offer sent:', data);
    }
  },
  sendWebRTCAnswer: (data) => {
    if (socket?.connected) {
      socket.emit('webrtc-answer', data);
      console.log('WebRTC answer sent:', data);
    }
  },
  sendWebRTCIceCandidate: (data) => {
    if (socket?.connected) {
      socket.emit('webrtc-ice-candidate', data);
      console.log('WebRTC ICE candidate sent:', data);
    }
  },
  sendWebRTCEnd: (data) => {
    if (socket?.connected) {
      socket.emit('webrtc-end', data);
      console.log('WebRTC end sent:', data);
    }
  }
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Export error classes for testing
export { ChatError, ValidationError, SocketError };