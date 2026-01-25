// src/MainContent.jsx
import React from 'react';
import { useChat } from './context/ChatContext';
import HomeScreen from './components/HomeScreen';
import TextChatScreen from './components/TextChatScreen';
import VideoChatScreen from './components/VideoChatScreen';
import SearchingScreen from './components/SearchingScreen';
import UserProfileScreen from './components/UserProfileScreen';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaUsers, FaCrown,FaSearch } from 'react-icons/fa';
import { formatSearchTime } from './utils/helpers';

function MainContent() {
  const {
    socket,  // Added here
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
    handleTypingStop
  } = useChat();

  const toggleAutoConnect = () => {
    setAutoConnect(!autoConnect);
    addNotification(autoConnect ? 'Auto-connect disabled' : 'Auto-connect enabled', 'info');
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
            // onBack={() => {
            //     console.log('Disconnecting from partner...');
            //  if (partner) {
            //     disconnectPartner();
            //   }
            //   setSearching(false);
            //   setCurrentScreen('home');
        
            // }}

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
            
            // onBack={() => {
            //   disconnectPartner();
            //   setCurrentScreen('home');
            // }}
            onTyping={handleTyping}
          />
        );
      default:
        return <HomeScreen  userProfile={userProfile}
            onlineCount={onlineCount}
            interests={interests}
            onUpdateInterests={setInterests}
            onUpdateProfile={() => setCurrentScreen('profile')}
            onStartTextChat={() => startSearch('text')}
            onStartVideoChat={() => startSearch('video')}
            connected={connected}
            currentMode={currentChatMode} />;
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

export default MainContent;