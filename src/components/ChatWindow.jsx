// components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaImage, FaVideo, FaRandom, FaTimes, FaUser, FaHeart } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ 
  socket, 
  partner, 
  messages, 
  onSendMessage, 
  onTyping, 
  onDisconnect, 
  onNext,
  onInitiateVideoCall,
  typing,
  userProfile,
  chatMode
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPartnerInfo, setShowPartnerInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
      onTyping(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = () => {
    if (!typingTimeoutRef.current) {
      onTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '--:--';
    }
  };

  const isMessageFromMe = (msg) => {
    return msg.sender === 'me' || 
           (msg.senderName === userProfile?.username) ||
           (typeof msg.sender === 'string' && msg.sender.includes('me'));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-900/50 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {partner?.profile?.username?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">
                {partner?.profile?.username || 'Stranger'}
                {partner?.profile?.age && `, ${partner.profile.age}`}
              </h3>
              {partner?.compatibility && (
                <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full">
                  {partner.compatibility}% match
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-400">Online</span>
              </div>
              {partner?.profile?.interests?.length > 0 && (
                <span className="text-xs text-gray-400">
                  • {partner.profile.interests.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowPartnerInfo(true)}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-300 hover:text-white"
            title="Partner Info"
          >
            <FaUser />
          </button>
          
          {chatMode === 'text' && (
            <button 
              onClick={onInitiateVideoCall}
              className="p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 rounded-xl transition-all duration-200 text-white"
              title="Start Video Call"
            >
              <FaVideo />
            </button>
          )}
          
          <button 
            onClick={onNext}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl transition-all duration-200 text-white"
            title="Next Partner"
          >
            <FaRandom />
          </button>
          
          <button 
            onClick={onDisconnect}
            className="p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 rounded-xl transition-all duration-200 text-white"
            title="Disconnect"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
              <div className="text-4xl">💬</div>
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Start the conversation!
            </h3>
            <p className="text-gray-400 mb-4">Say hello to your match 👋</p>
            {partner?.sharedInterests?.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-center mb-2">
                  <FaHeart className="text-red-400 mr-2" />
                  <span className="text-gray-300">You both like:</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {partner.sharedInterests.map((interest, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = isMessageFromMe(msg);
              
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isMe 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 ml-3' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 mr-3'
                    } text-white font-bold`}>
                      {isMe 
                        ? userProfile?.username?.charAt(0)?.toUpperCase() || 'Y'
                        : partner?.profile?.username?.charAt(0)?.toUpperCase() || 'S'
                      }
                    </div>
                    <div>
                      <div className={`rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                          : 'bg-gray-800 text-white rounded-bl-none border border-gray-700'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <div className={`flex items-center text-xs mt-1 ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-gray-500">
                          {formatTime(msg.timestamp)}
                        </span>
                        {isMe && (
                          <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px]">
                            Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {typing && (
          <div className="flex items-center space-x-2 animate-pulse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-400">
              {partner?.profile?.username || 'Partner'} is typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-300 hover:text-yellow-400"
              title="Emoji"
            >
              <FaSmile />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-50">
                <EmojiPicker 
                  onEmojiClick={onEmojiClick}
                  theme="dark"
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
          
          <input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          
          <button 
            type="submit" 
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
              message.trim()
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!message.trim()}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>

      {/* Partner Info Modal */}
      {showPartnerInfo && partner && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowPartnerInfo(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Partner Information
              </h3>
              <button 
                onClick={() => setShowPartnerInfo(false)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {partner.profile?.username?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h4 className="text-xl font-bold">{partner.profile?.username || 'Stranger'}</h4>
                  <p className="text-gray-400">Connected just now</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {partner.profile?.age && (
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">Age</div>
                    <div className="font-medium">{partner.profile.age}</div>
                  </div>
                )}
                
                {partner.profile?.gender && partner.profile.gender !== 'not-specified' && (
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">Gender</div>
                    <div className="font-medium capitalize">{partner.profile.gender}</div>
                  </div>
                )}
                
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Chat Mode</div>
                  <div className="font-medium flex items-center">
                    {partner.profile?.chatMode === 'video' ? (
                      <>
                        <span className="text-red-400 mr-2">📹</span> Video
                      </>
                    ) : (
                      <>
                        <span className="text-blue-400 mr-2">💬</span> Text
                      </>
                    )}
                  </div>
                </div>
                
                {partner.compatibility && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 border border-green-500/30">
                    <div className="text-xs text-green-400 mb-1">Compatibility</div>
                    <div className="font-bold text-green-400">{partner.compatibility}%</div>
                  </div>
                )}
              </div>
              
              {partner.profile?.interests?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {partner.profile.interests.map((interest, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {partner.sharedInterests?.length > 0 && (
                <div>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <FaHeart className="text-red-400 mr-2" />
                    Shared Interests
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {partner.sharedInterests.map((interest, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;