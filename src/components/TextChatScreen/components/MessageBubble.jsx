import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FaFileAlt } from 'react-icons/fa';

const MessageBubble = ({ msg, index, formatTime }) => {
  const isMe = msg.sender === 'me';
  const isSystem = msg.type === 'system';

  if (isSystem) {
    return (
      <div key={index} className="flex justify-center my-4 animate-fadeIn">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-full border border-gray-700/50">
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
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}
    >
      <div className={`relative max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
        isMe
          ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-br-none'
          : 'bg-gray-800/80 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/50'
      }`}>
        <div className={`absolute -bottom-1 ${isMe ? '-right-1' : '-left-1'} w-3 h-3 ${
          isMe ? 'bg-blue-600' : 'bg-gray-800/80'
        } transform rotate-45`}></div>
       
        {msg.type === 'image' && (
          <div className="mb-2 overflow-hidden rounded-lg">
            <img
              src={msg.content || 'https://via.placeholder.com/300x200'}
              alt="Shared"
              className="rounded-lg max-w-full h-auto transition-transform hover:scale-105 duration-300"
            />
          </div>
        )}
       
        {msg.type === 'file' && (
          <div className="mb-2 p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg flex items-center backdrop-blur-sm border border-gray-700/50">
            <FaFileAlt className="mr-3 text-blue-400" />
            <div className="flex-1">
              <div className="text-sm font-medium">{msg.fileName || 'File'}</div>
              <div className="text-xs text-gray-400">{msg.fileSize || 'Unknown size'}</div>
            </div>
          </div>
        )}
       
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>
       
        <div className={`flex items-center justify-between mt-2 text-xs ${
          isMe ? 'text-blue-200/90' : 'text-gray-400'
        }`}>
          <span>{formatTime(msg.timestamp)}</span>
          {isMe && (
            <div className="flex items-center ml-2">
              <div className="w-1 h-1 bg-white/50 rounded-full mx-[1px]"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full mx-[1px]"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full mx-[1px]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;