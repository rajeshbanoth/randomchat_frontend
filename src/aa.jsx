// App.jsx - Updated typing event handling
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  FaUser, FaRandom, FaTimes, FaVideo, 
  FaComments, FaCog, FaHeart, FaSearch,
  FaPaperPlane, FaSmile, FaMicrophone,
  FaMicrophoneSlash, FaVideoSlash, FaArrowLeft,
  FaUsers, FaInfoCircle, FaCheckCircle, FaExclamationTriangle,
  FaExclamationCircle, FaCrown, FaStar, FaGlobe,
  FaQrcode
} from 'react-icons/fa';
import HomeScreen from './components/HomeScreen.jsx';
import TextChatScreen from './components/TextChatScreen.jsx';
import VideoChatScreen from './components/VideoChatScreen.jsx';

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
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
  
  const socketRef = useRef(null);
  const searchTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingEmittedRef = useRef(0);
  const typingDebounceRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Initializing socket connection...');
    
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 30000,
      autoConnect: true
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to server with ID:', newSocket.id);
      setConnected(true);
      
      const savedProfile = localStorage.getItem('omegle-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          console.log('📂 Loaded profile:', profile.username);
          
          // Update profile with socket ID
          const updatedProfile = {
            ...profile,
            socketId: newSocket.id,
            id: newSocket.id
          };
          
          setUserProfile(updatedProfile);
          setInterests(profile.interests || []);
          setCurrentChatMode(profile.chatMode || 'text');
          
          // Register with server
          newSocket.emit('register', updatedProfile);
          
        } catch (error) {
          console.error('Error loading profile:', error);
          localStorage.removeItem('omegle-profile');
          setCurrentScreen('profile');
        }
      } else {
        setCurrentScreen('profile');
      }
      
      addNotification('Connected to server', 'success');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      setConnected(false);
      addNotification('Disconnected from server', 'warning');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      setConnected(false);
      addNotification('Connection error', 'error');
    });

    newSocket.on('registered', (data) => {
      console.log('✅ Registered successfully:', data.profile?.username);
      if (data.profile) {
        const updatedProfile = {
          ...data.profile,
          id: newSocket.id
        };
        setUserProfile(updatedProfile);
        setInterests(data.profile.interests || []);
        setCurrentChatMode(data.profile.chatMode || 'text');
      }
      setCurrentScreen('home');
      addNotification(`Welcome ${data.profile?.username || 'User'}!`, 'success');
    });

    // TYPING EVENT LISTENERS - FIXED
    newSocket.on('partnerTyping', (data) => {
      console.log('⌨️ Partner Typing Event:', data);
      
      // Check if this typing event is from our current partner
      if (partner && data.userId === partner.id) {
        console.log('✅ Valid partner typing event');
        setPartnerTyping(true);
        
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to hide typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Auto-clearing partner typing (timeout)');
          setPartnerTyping(false);
        }, 3000);
      } else {
        console.log('❌ Typing event from non-partner or no partner');
      }
    });

    newSocket.on('partnerTypingStopped', (data) => {
      console.log('💤 Partner Typing Stopped Event:', data);
      
      // Check if this typing stopped event is from our current partner
      if (partner && data.userId === partner.id) {
        console.log('✅ Valid partner typing stopped event');
        setPartnerTyping(false);
        
        // Clear the timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    });

    newSocket.on('searching', () => {
      console.log('🔍 Searching for partner...');
      setSearching(true);
      setSearchTime(0);
      addNotification('Searching for partner...', 'info');
    });

    newSocket.on('matched', (data) => {
      console.log('🎯 Matched with partner:', data);
      setSearching(false);
      clearInterval(searchTimerRef.current);
      setPartnerTyping(false); // Reset typing on new match
      
      // Check if partner mode matches current mode
      const partnerMode = data.profile?.chatMode || 'text';
      if (partnerMode !== currentChatMode) {
        console.warn('Mode mismatch! Our mode:', currentChatMode, 'Partner mode:', partnerMode);
        addNotification('Partner mode mismatch. Please try again.', 'warning');
        
        // Disconnect and search again
        setTimeout(() => {
          startSearch(currentChatMode);
        }, 1000);
        return;
      }
      
      setPartner(data);
      setMessages([]);
      addNotification(`Matched with ${data.profile?.username || 'stranger'}`, 'success');
      
      // Update screen based on chat mode
      setCurrentScreen(currentChatMode === 'video' ? 'video-chat' : 'text-chat');
    });

    newSocket.on('partnerDisconnected', (data) => {
      console.log('🚫 Partner Disconnected Event:', data);
      
      // Clear typing indicator
      setPartnerTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Clear any typing debounce
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = null;
      }
      
      setPartner(null);
      
      // Add system message to chat
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Partner has left the chat',
        timestamp: Date.now(),
        sender: 'system'
      }]);
      
      addNotification('Partner disconnected', 'info');
      
      if (autoConnect && (currentScreen === 'text-chat' || currentScreen === 'video-chat')) {
        // Auto-reconnect if enabled - stay in same screen
        setTimeout(() => {
          if (!searching) {
            setSearching(true);
            setSearchTime(0);
            newSocket.emit('search', {
              mode: currentChatMode,
              interests: interests,
              genderPreference: userProfile?.genderPreference || 'any',
              ageRange: userProfile?.ageRange || { min: 18, max: 60 },
              isPremium: userProfile?.isPremium || false,
              timestamp: Date.now()
            });
            addNotification('Searching for new partner...', 'info');
          }
        }, 2000);
      }
    });

    newSocket.on('message', (data) => {
      console.log('💬 Message received:', data.text);
      setMessages(prev => [...prev, {
        text: data.text,
        sender: 'partner',
        timestamp: data.timestamp,
        senderName: data.senderName
      }]);
      
      // When we receive a message, clear partner typing
      setPartnerTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    });

    newSocket.on('stats', (data) => {
      setOnlineCount(data.online || 0);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      addNotification(error.message || 'An error occurred', 'error');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, [currentChatMode]);

  // Cleanup when partner changes
  useEffect(() => {
    // Clear typing indicators when partner changes
    setPartnerTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    lastTypingEmittedRef.current = 0;
  }, [partner]);

  // Search timer
  useEffect(() => {
    if (searching) {
      searchTimerRef.current = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    }
    
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, [searching]);

  const startSearch = (mode) => {
    if (!socketRef.current || !connected) {
      addNotification('Not connected to server', 'error');
      return;
    }

    if (!userProfile) {
      addNotification('Please create a profile first', 'error');
      setCurrentScreen('profile');
      return;
    }

    console.log(`Starting ${mode} chat search`);
    
    // Set the current screen and mode
    setCurrentChatMode(mode);
    setSearching(true);
    setPartner(null);
    setMessages([]);
    setSearchTime(0);
    setPartnerTyping(false);

    // Update profile with current mode
    const updatedProfile = {
      ...userProfile,
      chatMode: mode,
      interests: interests,
      socketId: socketRef.current.id,
      id: socketRef.current.id
    };
    
    setUserProfile(updatedProfile);
    localStorage.setItem('omegle-profile', JSON.stringify(updatedProfile));
    
    // Emit search event
    socketRef.current.emit('search', {
      mode: mode,
      interests: interests,
      genderPreference: userProfile.genderPreference || 'any',
      ageRange: userProfile.ageRange || { min: 18, max: 60 },
      isPremium: userProfile.isPremium || false,
      timestamp: Date.now()
    });
    
    // Show appropriate screen based on mode
    if (mode === 'video') {
      setCurrentScreen('video-chat');
    } else {
      setCurrentScreen('text-chat');
    }
    
    addNotification(`Searching for ${mode} chat partner...`, 'info');
  };

  const disconnectPartner = () => {
    if (!socketRef.current || !partner) return;

    socketRef.current.emit('disconnect-partner', {
      reason: 'user_request',
      timestamp: Date.now()
    });

    setPartner(null);
    setMessages([]);
    setPartnerTyping(false);
    addNotification('Disconnected from partner', 'info');
    setCurrentScreen('home');
  };

  const sendMessage = (text, isSystem = false) => {
    if (!socketRef.current || !text || !partner) return;

    const messageData = {
      text: text,
      type: isSystem ? 'system' : 'text',
      timestamp: Date.now(),
      senderId: userProfile?.id,
      senderName: userProfile?.username
    };

    if (!isSystem) {
      // Only emit regular messages to socket
      socketRef.current.emit('message', messageData);
    }
    
    setMessages(prev => [...prev, {
      ...messageData,
      sender: isSystem ? 'system' : 'me'
    }]);
    
    // Clear typing state after sending message
    handleTypingStop();
  };

  const nextPartner = () => {
    if (!socketRef.current) return;

    console.log('🔄 Switching to next partner...');
    
    // Clear typing states
    setPartnerTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    
    // Emit next request to server
    socketRef.current.emit('next', {
      reason: 'user_requested_next',
      timestamp: Date.now(),
      currentMode: currentChatMode
    });

    // Clear current partner but stay in the same screen
    setPartner(null);
    setMessages([]);
    setSearching(true);
    setSearchTime(0);
    
    // Add system message about disconnecting
    setMessages(prev => [...prev, {
      type: 'system',
      text: 'Disconnected. Searching for new partner...',
      timestamp: Date.now(),
      sender: 'system'
    }]);
    
    // Start searching for new partner without changing screen
    socketRef.current.emit('search', {
      mode: currentChatMode,
      interests: interests,
      genderPreference: userProfile?.genderPreference || 'any',
      ageRange: userProfile?.ageRange || { min: 18, max: 60 },
      isPremium: userProfile?.isPremium || false,
      timestamp: Date.now()
    });
    
    addNotification('Looking for next partner...', 'info');
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [notification, ...prev.slice(0, 3)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateInterests = (newInterests) => {
    setInterests(newInterests);
    
    if (userProfile) {
      const updatedProfile = { 
        ...userProfile, 
        interests: newInterests 
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('omegle-profile', JSON.stringify(updatedProfile));
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('register', updatedProfile);
      }
    }
  };

  const updateUserProfile = (profile) => {
    const fullProfile = {
      ...profile,
      socketId: socketRef.current?.id,
      id: socketRef.current?.id,
      chatMode: profile.chatMode || 'text',
      interests: profile.interests || [],
      genderPreference: profile.genderPreference || 'any',
      ageRange: profile.ageRange || { min: 18, max: 60 },
      isPremium: profile.isPremium || false,
      avatar: profile.avatar || null,
      bio: profile.bio || '',
      createdAt: profile.createdAt || Date.now()
    };
    
    setUserProfile(fullProfile);
    setInterests(fullProfile.interests || []);
    setCurrentChatMode(fullProfile.chatMode);
    localStorage.setItem('omegle-profile', JSON.stringify(fullProfile));
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('register', fullProfile);
    }
    
    setCurrentScreen('home');
    addNotification('Profile saved successfully!', 'success');
  };

  const toggleAutoConnect = () => {
    const newValue = !autoConnect;
    setAutoConnect(newValue);
    addNotification(
      newValue ? 'Auto-connect enabled' : 'Auto-connect disabled',
      'info'
    );
  };

  const formatSearchTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle typing start with debounce
  const handleTypingStart = () => {
    if (!socketRef.current || !partner) return;
    
    const now = Date.now();
    
    // Throttle typing events (max once per 500ms)
    if (now - lastTypingEmittedRef.current < 500) {
      return;
    }
    
    lastTypingEmittedRef.current = now;
    
    const typingData = {
      partnerId: partner.id,
      userId: userProfile?.id || socketRef.current.id,
      username: userProfile?.username,
      timestamp: now
    };
    
    console.log('⌨️ Emitting typing START:', typingData);
    socketRef.current.emit('typing', typingData);
    
    // Clear any existing typing stopped debounce
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
  };

  // Handle typing stop with debounce
  const handleTypingStop = () => {
    if (!socketRef.current || !partner) return;
    
    // Clear any existing debounce
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    
    // Debounce the typing stopped event
    typingDebounceRef.current = setTimeout(() => {
      const typingData = {
        partnerId: partner.id,
        userId: userProfile?.id || socketRef.current.id,
        timestamp: Date.now()
      };
      
      console.log('💤 Emitting typing STOP:', typingData);
      socketRef.current.emit('typingStopped', typingData);
      
      typingDebounceRef.current = null;
    }, 1000); // Wait 1 second before sending typing stopped
  };

  // Combined typing handler for TextChatScreen
  const handleTyping = (isTyping) => {
    if (isTyping) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleQRScan = () => {
    // Simulate QR code scanning
    addNotification('QR Scanner activated. Place QR code in view.', 'info');
    
    // Simulate finding a QR code after 2 seconds
    setTimeout(() => {
      const qrContent = 'https://omegle-clone.com/connect/' + Math.random().toString(36).substr(2, 9);
      addNotification(`QR Code detected: ${qrContent}`, 'success');
    }, 2000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'profile':
        return (
          <UserProfileScreen
            userProfile={userProfile}
            onSave={updateUserProfile}
            onCancel={() => userProfile ? setCurrentScreen('home') : null}
          />
        );

      case 'home':
        return (
          <HomeScreen
            userProfile={userProfile}
            onlineCount={onlineCount}
            interests={interests}
            onUpdateInterests={updateInterests}
            onUpdateProfile={() => setCurrentScreen('profile')}
            onStartTextChat={() => startSearch('text')}
            onStartVideoChat={() => startSearch('video')}
            connected={connected}
            currentMode={currentChatMode}
          />
        );

      case 'text-chat':
        if (searching && !partner) {
          return (
            <SearchingScreen
              mode="text"
              searchTime={searchTime}
              onScanQR={handleQRScan}
              onBack={() => {
                if (socketRef.current) {
                  socketRef.current.emit('cancel-search');
                }
                setCurrentScreen('home');
              }}
            />
          );
        }
        return (
          <TextChatScreen
            socket={socketRef.current}
            partner={partner}
            messages={messages}
            userProfile={userProfile}
            searching={searching}
            autoConnect={autoConnect}
            partnerTyping={partnerTyping}
            onSendMessage={sendMessage}
            onDisconnect={disconnectPartner}
            onNext={nextPartner}
            onToggleAutoConnect={toggleAutoConnect}
            onBack={() => {
              disconnectPartner();
              setCurrentScreen('home');
            }}
            onTyping={handleTyping}
            currentMode={currentChatMode}
          />
        );

      case 'video-chat':
        if (searching && !partner) {
          return (
            <SearchingScreen
              mode="video"
              searchTime={searchTime}
              onBack={() => {
                if (socketRef.current) {
                  socketRef.current.emit('cancel-search');
                }
                setCurrentScreen('home');
              }}
            />
          );
        }
        return (
          <VideoChatScreen
            socket={socketRef.current}
            partner={partner}
            messages={messages}
            userProfile={userProfile}
            searching={searching}
            autoConnect={autoConnect}
            partnerTyping={partnerTyping}
            onSendMessage={sendMessage}
            onDisconnect={disconnectPartner}
            onNext={nextPartner}
            onToggleAutoConnect={toggleAutoConnect}
            onBack={() => {
              disconnectPartner();
              setCurrentScreen('home');
            }}
            onTyping={handleTyping}
            currentMode={currentChatMode}
          />
        );

      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`backdrop-blur-lg rounded-lg p-3 border-l-4 shadow-lg transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-900/30 border-green-500' 
                : notification.type === 'error'
                ? 'bg-red-900/30 border-red-500'
                : notification.type === 'warning'
                ? 'bg-yellow-900/30 border-yellow-500'
                : 'bg-blue-900/30 border-blue-500'
            }`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex items-start">
              {notification.type === 'success' && <FaCheckCircle className="text-green-400 mr-2 mt-0.5" />}
              {notification.type === 'error' && <FaExclamationCircle className="text-red-400 mr-2 mt-0.5" />}
              {notification.type === 'warning' && <FaExclamationTriangle className="text-yellow-400 mr-2 mt-0.5" />}
              {notification.type === 'info' && <FaInfoCircle className="text-blue-400 mr-2 mt-0.5" />}
              <p className="text-sm flex-1">{notification.message}</p>
              <button className="ml-2 text-gray-400 hover:text-white">×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {renderScreen()}
      </main>

      {/* Connection Status Bar */}
      {currentScreen !== 'profile' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/50 px-4 py-2">
          <div className="max-w-6xl mx-auto flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span>{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {searching && (
                <div className="flex items-center">
                  <FaSearch className="text-yellow-400 mr-2 animate-pulse" />
                  <span>Searching: {formatSearchTime(searchTime)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaUsers className="text-blue-400 mr-2" />
                <span>{onlineCount} online</span>
              </div>
              
              {userProfile && (
                <div className="flex items-center space-x-2">
                  {userProfile.isPremium && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs rounded-full flex items-center">
                      <FaCrown className="mr-1" /> PREMIUM
                    </span>
                  )}
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs mr-2">
                      {userProfile.username?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline">{userProfile.username}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Searching Screen Component
const SearchingScreen = ({ mode, searchTime, onBack, onScanQR }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <div className="px-6 py-4 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            <span>Cancel Search</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onScanQR}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaQrcode />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="absolute inset-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
            </div>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl relative ${
              mode === 'video' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              {mode === 'video' ? <FaVideo className="animate-pulse" /> : <FaComments className="animate-pulse" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            Looking for {mode === 'video' ? 'Video' : 'Text'} Partner...
          </h2>
          
          <div className="mb-8">
            <div className="text-4xl font-bold mb-2">{formatTime(searchTime)}</div>
            <p className="text-gray-400">Searching time</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <FaGlobe className="text-green-400" />
              <span>Searching globally for matching profiles</span>
            </div>
            
            <button
              onClick={onScanQR}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center"
            >
              <FaQrcode className="mr-2" /> Scan QR Code
            </button>
            
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



// User Profile Screen Component
const UserProfileScreen = ({ userProfile, onSave, onCancel }) => {
  const [profileData, setProfileData] = useState({
    username: userProfile?.username || '',
    gender: userProfile?.gender || 'not-specified',
    age: userProfile?.age || 25,
    interests: userProfile?.interests || [],
    chatMode: userProfile?.chatMode || 'text',
    genderPreference: userProfile?.genderPreference || 'any',
    ageRange: userProfile?.ageRange || { min: 18, max: 60 },
    isPremium: userProfile?.isPremium || false,
    avatar: userProfile?.avatar || null,
    bio: userProfile?.bio || ''
  });

  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonInterests = [
    'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
    'Travel', 'Food', 'Art', 'Books', 'Fitness',
    'Science', 'Fashion', 'Photography', 'Animals', 'Cooking'
  ];



  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!profileData.username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim()) && profileData.interests.length < 10) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          avatar: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {userProfile ? 'Edit Profile' : 'Create Profile'}
            </h1>
            <p className="text-gray-400">Customize your chatting experience</p>
          </div>
          
          {userProfile && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-700 overflow-hidden mb-4">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <FaUser className="text-4xl text-white" />
                      </div>
                    )}
                  </div>
                  
                  <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    Upload Photo
                  </label>
                </div>
              </div>
              
              {/* Username and Age */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username *</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Age</label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profileData.age}
                      onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || 25})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="not-specified">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Tell others about yourself..."
                maxLength="200"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {profileData.bio.length}/200 characters
              </div>
            </div>
          </div>

          {/* Chat Preferences */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Chat Preferences</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chat Mode */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preferred Chat Mode</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="chatMode"
                      value="text"
                      checked={profileData.chatMode === 'text'}
                      onChange={(e) => setProfileData({...profileData, chatMode: e.target.value})}
                      className="text-blue-500"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FaComments />
                      </div>
                      <div>
                        <div className="font-medium">Text Chat</div>
                        <div className="text-sm text-gray-400">Text messages only</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="chatMode"
                      value="video"
                      checked={profileData.chatMode === 'video'}
                      onChange={(e) => setProfileData({...profileData, chatMode: e.target.value})}
                      className="text-red-500"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                        <FaVideo />
                      </div>
                      <div>
                        <div className="font-medium">Video Chat</div>
                        <div className="text-sm text-gray-400">Video + Text messages</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Preferences */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gender Preference</label>
                  <select
                    value={profileData.genderPreference}
                    onChange={(e) => setProfileData({...profileData, genderPreference: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="any">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age Range</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profileData.ageRange.min}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        ageRange: { ...profileData.ageRange, min: parseInt(e.target.value) || 18 }
                      })}
                      className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profileData.ageRange.max}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        ageRange: { ...profileData.ageRange, max: parseInt(e.target.value) || 60 }
                      })}
                      className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Interests</h2>
            <p className="text-gray-400 mb-4">Add interests to find better matches</p>
            
            {/* Interest Input */}
            <div className="flex space-x-3 mb-6">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="Add custom interest..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                disabled={!newInterest.trim() || profileData.interests.length >= 10}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            {/* Common Interests */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Popular Interests</h4>
              <div className="flex flex-wrap gap-2">
                {commonInterests.map(interest => (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => {
                      if (!profileData.interests.includes(interest) && profileData.interests.length < 10) {
                        setProfileData({
                          ...profileData,
                          interests: [...profileData.interests, interest]
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      profileData.interests.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected Interests */}
            {profileData.interests.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-400">Selected Interests ({profileData.interests.length}/10)</h4>
                  <button
                    type="button"
                    onClick={() => setProfileData({...profileData, interests: []})}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map(interest => (
                    <span 
                      key={interest} 
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                      <button 
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <FaCrown />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Premium Features</h2>
                <p className="text-gray-400 mb-4">Get priority matching and exclusive features</p>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={profileData.isPremium}
                      onChange={(e) => setProfileData({...profileData, isPremium: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${
                      profileData.isPremium ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-600'
                    }`}></div>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      profileData.isPremium ? 'transform translate-x-5' : ''
                    }`}></div>
                  </div>
                  <span className="font-medium">Enable Premium (Demo)</span>
                </label>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>Priority matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>Advanced filters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>No ads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span>Profile highlighting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !profileData.username.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : userProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;


