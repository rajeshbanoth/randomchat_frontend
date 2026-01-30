import React from 'react';
import { 
  FaComments, FaTimes, FaSync, FaHeart, FaSearch,
  FaUserFriends, FaLightbulb, FaRobot
} from 'react-icons/fa';
import { HiOutlineSparkles, HiOutlineLightningBolt } from 'react-icons/hi';
import MessageBubble from './MessageBubble';

const ChatArea = ({
  messages,
  partner,
  partnerDisconnected,
  localPartnerTyping,
  messagesEndRef,
  autoConnect,
  nextPartner
}) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTypingIndicator = () => {
    if (!partner || !localPartnerTyping || partnerDisconnected) return null;
   
    return (
      <div className="flex justify-start mb-4">
        <div className="relative max-w-[75%] rounded-2xl px-4 py-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/30">
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gray-800/40 transform rotate-45"></div>
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

  // Initial state - no messages
  //sample registration
  const renderInitialEmptyState = () => {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-800/20 to-purple-800/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-blue-700/30">
          <FaUserFriends className="text-5xl text-blue-400" />
        </div>
        <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Start Chatting! ✨
        </h3>
        <p className="text-gray-300 mb-10 text-lg max-w-xl mx-auto">
          Say hello to start a conversation with your match
        </p>
        
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
    );
  };

  // Main chat with messages
  const renderChatWithMessages = () => {
    return (
      <div className="space-y-4 pb-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            msg={msg}
            index={index}
            formatTime={formatTime}
          />
        ))}
        {renderTypingIndicator()}
      </div>
    );
  };

  return (
    <div className="h-full">
      {messages.length === 0 ? renderInitialEmptyState() : renderChatWithMessages()}
      
      {partnerDisconnected && (
        <div className="text-center my-6 p-6 bg-gradient-to-r from-rose-900/20 to-red-900/20 backdrop-blur-sm rounded-2xl border border-rose-700/30">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <FaTimes className="text-red-400 text-xl" />
            <p className="text-red-400 font-medium">Partner has disconnected</p>
          </div>
          {autoConnect ? (
            <>
              <p className="text-gray-400 text-sm mb-4">
                Auto-searching for new partner...
              </p>
              <div className="w-full bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-progress"></div>
              </div>
            </>
          ) : (
            <button
              onClick={nextPartner}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-blue-300 text-sm transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50"
            >
              <FaSync className="inline mr-2 animate-spin" />
              Find Next Partner
            </button>
          )}
        </div>
      )}
      
      <div ref={messagesEndRef} className="h-px" />
    </div>
  );
};

export default ChatArea;