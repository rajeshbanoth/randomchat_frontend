import React from 'react';
import { FaComments, FaTimes, FaSync, FaHeart } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
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
      <div className="flex justify-start mb-4 animate-fadeIn">
        <div className="relative max-w-[75%] rounded-2xl px-4 py-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/30 shadow-lg">
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

  return (
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
        )}
       
        {partnerDisconnected && (
          <div className="text-center my-6 p-6 bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 animate-pulse">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <FaTimes className="text-red-400 text-xl" />
              <p className="text-red-400 font-medium">Partner has disconnected</p>
            </div>
            {autoConnect && (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  Auto-searching for new partner...
                </p>
                <button
                  onClick={nextPartner}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-blue-300 text-sm transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50"
                >
                  <FaSync className="inline mr-2" />
                  Retry Search
                </button>
              </>
            )}
          </div>
        )}
       
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;