// src/MainContent.jsx
import React, { useState, useEffect } from 'react';
import { useChat } from './context/ChatContext';
import HomeScreen from './components/HomeScreen/HomeScreen';
import TextChatScreen from './components/TextChatScreen/TextChatScreen';
import VideoChatScreen from './components/VideoCallScreen/VideoCallScreen';
import SearchingScreen from './components/SearchingScreen';
import UserProfileScreen from './components/UserProfileScreen';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaUsers, 
  FaCrown, 
  FaSearch,
  FaSync,
  FaTimes
} from 'react-icons/fa';
import { formatSearchTime } from './utils/helpers';

function MainContent() {
  const {
    socket,
    currentScreen,
    setCurrentScreen,
    userProfile,
    updateUserProfile,
    searching,
    setSearching,
    currentChatMode,
    searchTime,
    startSearch,
    partner,
    messages,
    sendMessage,
    disconnectPartner,
    nextPartner,
    autoConnect,
    setAutoConnect,
    partnerTyping,
    notifications,
    onlineCount,
    interests,
    setInterests,
    connected,
    addNotification,
    handleTypingStart,
    handleTypingStop,
  } = useChat();

  const [showAutoConnectHint, setShowAutoConnectHint] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Check if it's the user's first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hasSeenAutoConnectHint');
    if (!hasSeenHint) {
      setIsFirstVisit(true);
      // Show hint after a delay
      const timer = setTimeout(() => {
        setShowAutoConnectHint(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsFirstVisit(false);
    }
  }, []);

  const toggleAutoConnect = () => {
    const newValue = !autoConnect;
    setAutoConnect(newValue);
    addNotification(
      newValue 
        ? 'Auto-connect enabled: Will automatically search for next partner' 
        : 'Auto-connect disabled: Manual search required',
      'info'
    );
    
    // Save to localStorage
    const settings = JSON.parse(localStorage.getItem('omegle-settings') || '{}');
    settings.autoConnect = newValue;
    localStorage.setItem('omegle-settings', JSON.stringify(settings));
  };

  const handleCloseHint = () => {
    setShowAutoConnectHint(false);
    localStorage.setItem('hasSeenAutoConnectHint', 'true');
  };

  const handleTyping = (isTyping) => {
    if (isTyping) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleQRScan = () => {
    addNotification('QR Scanner activated. Place QR code in view.', 'info');
    setTimeout(() => {
      const qrContent = 'https://omegle-clone.com/connect/' + Math.random().toString(36).substr(2, 9);
      addNotification(`QR Code detected: ${qrContent}`, 'success');
    }, 2000);
  };

  // AutoConnectToggle Component
  const AutoConnectToggle = () => (
    <div className="relative">
      <button
        onClick={toggleAutoConnect}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 group ${
          autoConnect 
            ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/30 border-green-700/50 hover:from-green-800/50 hover:to-emerald-800/40 shadow-lg shadow-green-500/10' 
            : 'bg-gradient-to-r from-gray-800/40 to-gray-900/30 border-gray-700/50 hover:from-gray-700/50 hover:to-gray-800/40'
        }`}
        title={autoConnect ? "Auto-connect is ON" : "Auto-connect is OFF"}
      >
        {autoConnect ? (
          <FaSync className="text-green-400 animate-spin-slow" />
        ) : (
          <FaSync className="text-gray-400" />
        )}
        <span className="text-sm font-medium hidden md:inline">
          Auto-connect: 
        </span>
        <span className={`text-sm font-medium md:ml-1 ${autoConnect ? "text-green-400" : "text-gray-400"}`}>
          {autoConnect ? "ON" : "OFF"}
        </span>
        <div className={`w-8 h-5 flex items-center rounded-full transition-all duration-300 ${
          autoConnect ? 'bg-gradient-to-r from-green-500 to-emerald-500 justify-end' : 'bg-gradient-to-r from-gray-600 to-gray-700 justify-start'
        }`}>
          <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm"></div>
        </div>
      </button>

      {/* Hint tooltip for first-time users */}
      {showAutoConnectHint && isFirstVisit && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-xl rounded-xl p-4 border border-blue-500/50 shadow-2xl z-50 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <FaSync className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Smart Auto-Connect</h3>
                <p className="text-blue-200 text-sm">Never stop chatting!</p>
              </div>
            </div>
            <button 
              onClick={handleCloseHint}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800/50 rounded-full"
              title="Close hint"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className={`p-1.5 rounded-full mt-0.5 ${autoConnect ? 'bg-green-500/20' : 'bg-gray-700/50'}`}>
                <div className={`w-2 h-2 rounded-full ${autoConnect ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              </div>
              <p className="text-sm text-blue-100">
                When <span className="font-semibold text-green-300">enabled</span>, the app will automatically search for a new partner when your current chat ends.
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-full mt-0.5 bg-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <p className="text-sm text-blue-100">
                Perfect for continuous conversations without manual searching!
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-blue-800/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-300">Try it now:</span>
              <button
                onClick={() => {
                  toggleAutoConnect();
                  handleCloseHint();
                }}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                  autoConnect 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-300' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                }`}
              >
                {autoConnect ? 'Turn OFF' : 'Turn ON'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent subtle hint for all users */}
      {!showAutoConnectHint && autoConnect && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gradient-to-r from-green-900/80 to-emerald-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-700/30 text-green-300 animate-pulse-slow">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <span>Auto-searching active</span>
          </div>
        </div>
      )}
    </div>
  );

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
            onUpdateInterests={setInterests}
            onUpdateProfile={() => setCurrentScreen('profile')}
            onStartTextChat={() => startSearch('text')}
            onStartVideoChat={() => startSearch('video')}
            connected={connected}
            currentMode={currentChatMode}
          />
        );
      case 'text-chat':
      case 'video-chat':
        if (searching && !partner) {
          return (
            <SearchingScreen
              mode={currentChatMode}
              searchTime={searchTime}
              onBack={() => {
                setSearching(false);
                setCurrentScreen('home');
              }}
              onScanQR={handleQRScan}
            />
          );
        }
        return currentScreen === 'text-chat' ? (
          <TextChatScreen
            socket={socket}
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
            mode={currentChatMode}
            onBack={() => {
              setSearching(false);
              setCurrentScreen('home');
            }}
            onScanQR={handleQRScan}
            searchTime={searchTime}
            disconnectPartner={disconnectPartner}
            setCurrentScreen={setCurrentScreen}
            onTyping={handleTyping}
          />
        ) : (
          <VideoChatScreen
            socket={socket}
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
            disconnectPartner={disconnectPartner}
            setCurrentScreen={setCurrentScreen}
            onTyping={handleTyping}
          />
        );
      default:
        return (
          <HomeScreen  
            userProfile={userProfile}
            onlineCount={onlineCount}
            interests={interests}
            onUpdateInterests={setInterests}
            onUpdateProfile={() => setCurrentScreen('profile')}
            onStartTextChat={() => startSearch('text')}
            onStartVideoChat={() => startSearch('video')}
            connected={connected}
            currentMode={currentChatMode} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative">
      {/* Floating Auto-Connect Toggle */}
      <div className="fixed top-24 right-6 z-40 hidden lg:block">
        <AutoConnectToggle />
      </div>

      {/* Mobile Auto-Connect Toggle */}
      <div className="fixed top-4 right-16 z-40 lg:hidden">
        <div className="relative">
          <button
            onClick={toggleAutoConnect}
            className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm border-2 transition-all duration-300 group ${
              autoConnect 
                ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/40 border-green-600 shadow-lg shadow-green-500/20' 
                : 'bg-gradient-to-r from-gray-800/50 to-gray-900/40 border-gray-600'
            }`}
            title={autoConnect ? "Auto-connect ON" : "Auto-connect OFF"}
          >
            {autoConnect ? (
              <FaSync className="text-green-400 text-xl animate-spin-slow" />
            ) : (
              <FaSync className="text-gray-400 text-xl" />
            )}
          </button>
          
          {/* Mobile Status Badge */}
          {autoConnect && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
          )}
        </div>
      </div>

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
          >
            <div className="flex items-start">
              {notification.type === 'success' && <FaCheckCircle className="text-green-400 mr-2 mt-0.5" />}
              {notification.type === 'error' && <FaExclamationCircle className="text-red-400 mr-2 mt-0.5" />}
              {notification.type === 'warning' && <FaExclamationTriangle className="text-yellow-400 mr-2 mt-0.5" />}
              {notification.type === 'info' && <FaInfoCircle className="text-blue-400 mr-2 mt-0.5" />}
              <p className="text-sm flex-1">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {renderScreen()}
      </main>

      {/* Enhanced Connection Status Bar with auto-connect toggle */}
      {currentScreen !== 'profile' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 via-gray-900/80 to-gray-900/90 backdrop-blur-sm border-t border-gray-800/50 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              
              {/* Left side - Status info */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                {searching && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-900/30 to-amber-900/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-700/30">
                    <FaSearch className="text-yellow-400 animate-pulse" />
                    <span className="text-sm">
                      Searching: <span className="font-semibold text-yellow-300">{formatSearchTime(searchTime)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Center - Auto-connect toggle for desktop */}
              <div className="hidden md:block">
                <AutoConnectToggle />
              </div>
              
              {/* Right side - User info */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-900/30 to-indigo-900/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-700/30">
                  <FaUsers className="text-blue-400" />
                  <span className="text-sm font-medium">{onlineCount}</span>
                  <span className="text-sm text-blue-300 hidden sm:inline">online</span>
                </div>
                
                {userProfile && (
                  <div className="flex items-center space-x-3">
                    {userProfile.isPremium && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-xs rounded-full flex items-center shadow-lg shadow-yellow-500/20">
                        <FaCrown className="mr-1.5" /> <span className="font-bold">PREMIUM</span>
                      </span>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">
                        {userProfile.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium hidden lg:inline">{userProfile.username}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Auto-connect status indicator */}
            <div className="mt-2 md:hidden">
              <div className={`flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full text-sm ${
                autoConnect 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-700/30 text-green-300' 
                  : 'bg-gradient-to-r from-gray-800/30 to-gray-900/20 border border-gray-700/30 text-gray-400'
              }`}>
                <FaSync className={autoConnect ? "animate-spin-slow" : ""} />
                <span>Auto-connect: <span className="font-semibold">{autoConnect ? "ON" : "OFF"}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainContent;