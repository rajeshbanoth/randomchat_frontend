import React, { useState } from 'react';
import { HiOutlineSparkles, HiOutlineCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import { FaFileAlt, FaImage, FaVideo, FaMusic, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';

const MessageBubble = ({ msg, index, formatTime }) => {
  const isMe = msg.sender === 'me';
  const isSystem = msg.type === 'system';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Function to detect URLs in text
  const detectUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  // Function to render text with URLs
  const renderTextWithLinks = (text) => {
    const urls = detectUrls(text);
    if (urls.length === 0) return text;

    let lastIndex = 0;
    const parts = [];
    
    urls.forEach((url, i) => {
      const urlIndex = text.indexOf(url, lastIndex);
      if (urlIndex > lastIndex) {
        parts.push(text.substring(lastIndex, urlIndex));
      }
      
      parts.push(
        <a
          key={`link-${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 underline transition-colors"
        >
          {url.length > 30 ? `${url.substring(0, 30)}...` : url}
          <FaExternalLinkAlt className="ml-1 text-xs" />
        </a>
      );
      
      lastIndex = urlIndex + url.length;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Check if text should be expandable
  const shouldBeExpandable = msg.text && msg.text.length > 300;
  const displayText = shouldBeExpandable && !isExpanded 
    ? `${msg.text.substring(0, 300)}...` 
    : msg.text;

  // Get message type icon
  const getMessageIcon = () => {
    if (msg.type === 'image') return <FaImage className="text-blue-400" />;
    if (msg.type === 'video') return <FaVideo className="text-purple-400" />;
    if (msg.type === 'audio') return <FaMusic className="text-pink-400" />;
    if (msg.type === 'location') return <FaMapMarkerAlt className="text-red-400" />;
    if (msg.type === 'file') return <FaFileAlt className="text-green-400" />;
    return null;
  };

  if (isSystem) {
    return (
      <div key={index} className="flex justify-center my-4 animate-fadeIn">
        <div className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/30">
          <HiOutlineSparkles className="text-yellow-400 mr-2" />
          <span className="text-gray-300 text-sm">{msg.text}</span>
          {msg.timestamp && (
            <span className="text-xs text-gray-500 ml-2">
              {formatTime(msg.timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      key={index}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn group`}
    >
      {/* Sender Avatar for incoming messages */}
      {!isMe && msg.senderName && (
        <div className="flex-shrink-0 mr-2 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
            {msg.senderName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="relative max-w-[85%]">
        {/* Message bubble */}
        <div className={`relative rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
          isMe
            ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-br-none group-hover:shadow-blue-500/20'
            : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/30 group-hover:border-gray-600/50'
        }`}>
          
          {/* Message type indicator */}
          {getMessageIcon() && (
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
              {getMessageIcon()}
            </div>
          )}

          {/* Sender name for incoming messages */}
          {!isMe && msg.senderName && (
            <div className="mb-1">
              <span className="text-xs font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {msg.senderName}
              </span>
            </div>
          )}

          {/* Media content */}
          {msg.type === 'image' && (
            <div className="mb-3 overflow-hidden rounded-xl border border-gray-700/50">
              <img
                src={msg.content || 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?auto=format&fit=crop&w=600'}
                alt="Shared"
                className="w-full h-auto max-h-64 object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => window.open(msg.content || '#', '_blank')}
              />
            </div>
          )}

          {msg.type === 'file' && (
            <div className="mb-3 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-3">
                  <FaFileAlt className="text-xl text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{msg.fileName || 'Document'}</div>
                  <div className="text-xs text-gray-400 mt-1">{msg.fileSize || 'Unknown size'}</div>
                </div>
                <button className="ml-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-blue-300 text-xs transition-colors">
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Message text with proper word wrapping */}
          <div className="relative">
            <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
              {renderTextWithLinks(displayText)}
            </div>
            
            {/* Expand button for long messages */}
            {shouldBeExpandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs px-2 py-1 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/40 hover:to-gray-800/40 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Message footer */}
          <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
            isMe ? 'border-blue-400/20' : 'border-gray-700/30'
          }`}>
            <div className={`text-xs flex items-center ${
              isMe ? 'text-blue-200/80' : 'text-gray-400'
            }`}>
              <span className="mr-2">{formatTime(msg.timestamp)}</span>
              
              {/* Status indicators for sent messages */}
              {isMe && (
                <span className="ml-auto flex items-center">
                  {msg.status === 'sent' && <HiOutlineCheck className="text-blue-300" />}
                  {msg.status === 'delivered' && <HiOutlineCheck className="text-blue-300" />}
                  {msg.status === 'read' && <HiOutlineCheckCircle className="text-green-400" />}
                  {!msg.status && <span className="w-2 h-2 rounded-full bg-blue-300/50 animate-pulse"></span>}
                </span>
              )}
            </div>
            
            {/* Message options button */}
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`ml-2 p-1 rounded-lg transition-colors ${
                isMe 
                  ? 'hover:bg-blue-600/30 text-blue-200/60 hover:text-blue-200'
                  : 'hover:bg-gray-700/30 text-gray-500 hover:text-gray-400'
              }`}
            >
              <BsThreeDots className="text-sm" />
            </button>
          </div>
        </div>

        {/* Message options dropdown */}
        {showOptions && (
          <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-full mt-1 z-10 min-w-32 bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-xl overflow-hidden animate-slide-down`}>
            <button className="w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors text-left flex items-center">
              <span className="mr-2">📋</span>
              Copy text
            </button>
            <button className="w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors text-left flex items-center">
              <span className="mr-2">🔗</span>
              Copy link
            </button>
            <button className="w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors text-left flex items-center">
              <span className="mr-2">📤</span>
              Forward
            </button>
            <div className="border-t border-gray-700/50"></div>
            <button className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left flex items-center">
              <span className="mr-2">🗑️</span>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* My avatar for sent messages */}
      {isMe && (
        <div className="flex-shrink-0 ml-2 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
            M
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;