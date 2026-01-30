import React, { useState, useMemo } from 'react';
import { 
  HiOutlineSparkles, HiOutlineCheck, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineShieldExclamation 
} from 'react-icons/hi';
import { 
  FaFileAlt, FaImage, FaVideo, FaMusic, FaMapMarkerAlt, 
  FaExternalLinkAlt, FaPhone, FaFacebook, FaTwitter, FaInstagram,
  FaWhatsapp, FaSnapchat, FaLinkedin, FaTelegram, FaTiktok
} from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { MdWarning, MdSecurity } from 'react-icons/md';

const MessageBubble = ({ msg, index, formatTime }) => {
  const isMe = msg.sender === 'me';
  const isSystem = msg.type === 'system';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState(null);

  // Enhanced regex patterns for detection
  const detectionPatterns = {
    phoneNumbers: /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    socialMedia: {
      facebook: /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb)\.com\/[A-Za-z0-9._-]+\/?/gi,
      twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+\/?/gi,
      instagram: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/[A-Za-z0-9._]+\/?/gi,
      whatsapp: /(?:https?:\/\/)?(?:wa\.me\/|whatsapp\.com\/)(?:\?phone=)?\d+/gi,
      linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[A-Za-z0-9._-]+\/?/gi,
      telegram: /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[A-Za-z0-9_]+\/?/gi,
      tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[A-Za-z0-9._]+\/?/gi,
      snapchat: /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/[A-Za-z0-9._]+\/?/gi
    },
    urls: /(https?:\/\/[^\s]+)/g,
    dangerousDomains: /(?:bit\.ly|tinyurl|shorte\.st|adf\.ly|ouo\.io|bc\.vc|goo\.gl|is\.gd|v\.gd|tr\.im|cli\.gs|yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|qr\.ae|adfoc\.us|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|tr\.im|link\.zip)/gi
  };

  // Check for sensitive information
  const detectSensitiveInfo = useMemo(() => {
    const text = msg.text || '';
    const warnings = [];
    
    // Check phone numbers
    const phoneMatches = text.match(detectionPatterns.phoneNumbers);
    if (phoneMatches) {
      warnings.push({
        type: 'phone',
        count: phoneMatches.length,
        icon: <FaPhone className="text-rose-400" />,
        message: `${phoneMatches.length} phone number(s) detected`
      });
    }

    // Check emails
    const emailMatches = text.match(detectionPatterns.email);
    if (emailMatches) {
      warnings.push({
        type: 'email',
        count: emailMatches.length,
        icon: <MdWarning className="text-amber-400" />,
        message: `${emailMatches.length} email address(es) detected`
      });
    }

    // Check social media links
    let socialCount = 0;
    const socialTypes = [];
    Object.entries(detectionPatterns.socialMedia).forEach(([platform, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        socialCount += matches.length;
        socialTypes.push(platform);
      }
    });
    
    if (socialCount > 0) {
      warnings.push({
        type: 'social',
        count: socialCount,
        icon: <FaTwitter className="text-sky-400" />,
        message: `${socialCount} social media link(s) detected`,
        platforms: socialTypes
      });
    }

    // Check for dangerous/shortened URLs
    const urlMatches = text.match(detectionPatterns.urls);
    if (urlMatches) {
      const dangerousUrls = urlMatches.filter(url => 
        detectionPatterns.dangerousDomains.test(url)
      );
      if (dangerousUrls.length > 0) {
        warnings.push({
          type: 'dangerous',
          count: dangerousUrls.length,
          icon: <HiOutlineShieldExclamation className="text-red-500" />,
          message: `${dangerousUrls.length} potentially unsafe link(s) detected`
        });
      }
    }

    // Check for excessive links (spam detection)
    if (urlMatches && urlMatches.length > 3) {
      warnings.push({
        type: 'excessive',
        count: urlMatches.length,
        icon: <MdSecurity className="text-purple-400" />,
        message: `Warning: ${urlMatches.length} links detected (possible spam)`
      });
    }

    return warnings;
  }, [msg.text]);

  // Render text with highlighted warnings and proper handling
  const renderTextWithWarnings = (text) => {
    if (!text) return text;

    // Create a warning overlay if sensitive info is detected
    if (detectSensitiveInfo.length > 0 && !isMe) {
      return (
        <div className="relative">
          <div className="relative z-10">
            {renderTextWithLinks(text)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-amber-500/5 rounded-lg blur-sm"></div>
        </div>
      );
    }

    return renderTextWithLinks(text);
  };

  // Function to detect URLs in text
  const detectUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  // Enhanced URL rendering with safety warnings
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
      
      const isDangerous = detectionPatterns.dangerousDomains.test(url);
      
      parts.push(
        <span key={`link-${i}`} className="inline-flex items-center group relative">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`inline-flex items-center transition-colors px-1 py-0.5 rounded ${
              isDangerous 
                ? 'text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30'
                : 'text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30'
            }`}
            onClick={(e) => {
              if (isDangerous) {
                e.preventDefault();
                setWarningType('dangerous');
                setShowWarning(true);
              }
            }}
          >
            {url.length > 25 ? `${url.substring(0, 25)}...` : url}
            <FaExternalLinkAlt className="ml-1 text-xs" />
            {isDangerous && (
              <HiOutlineExclamationCircle className="ml-1 text-xs text-rose-400" />
            )}
          </a>
          
          {/* URL preview tooltip */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-xs max-w-xs">
              <div className="font-medium text-gray-300 mb-1">Link Preview</div>
              <div className="text-gray-400 truncate">{url}</div>
              {isDangerous && (
                <div className="flex items-center mt-1 text-rose-400 text-xs">
                  <HiOutlineShieldExclamation className="mr-1" />
                  Shortened URL - Proceed with caution
                </div>
              )}
            </div>
          </div>
        </span>
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

  // Warning modal component
  const renderWarningModal = () => {
    if (!showWarning) return null;

    const warningMessages = {
      dangerous: {
        title: "⚠️ Potentially Unsafe Link Detected",
        message: "This link appears to be shortened or from a potentially unsafe domain. Shortened URLs can hide the true destination.",
        action: "Are you sure you want to proceed?"
      },
      phone: {
        title: "📞 Phone Number Detected",
        message: "This message contains phone number(s). Be cautious when sharing personal contact information with strangers.",
        action: "Proceed with caution"
      },
      social: {
        title: "🌐 Social Media Links Detected",
        message: "This message contains social media profile links. Avoid connecting personal accounts with strangers.",
        action: "Stay safe online"
      }
    };

    const warning = warningMessages[warningType] || warningMessages.dangerous;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6 animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 flex items-center justify-center mr-3">
              <HiOutlineShieldExclamation className="text-2xl text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{warning.title}</h3>
              <p className="text-sm text-gray-400">Security Alert</p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-6">{warning.message}</p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-2">Message snippet:</div>
            <div className="text-gray-300 text-sm font-mono truncate">
              {msg.text?.substring(0, 100)}...
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowWarning(false);
                setWarningType(null);
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg text-gray-300 font-medium transition-all duration-200"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                // Allow the link to proceed
                setShowWarning(false);
                setWarningType(null);
                // You could add analytics here
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg text-white font-medium transition-all duration-200"
            >
              Proceed Anyway
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center text-xs text-gray-500">
              <MdSecurity className="mr-1" />
              <span>Tip: Never share personal information with strangers</span>
            </div>
          </div>
        </div>
      </div>
    );
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
    <>
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
          {/* FIXED: Warning badge positioned ABOVE message bubble */}
          {detectSensitiveInfo.length > 0 && !isMe && (
            <div className="absolute -top-6 left-0 right-0 flex justify-center mb-2 z-10">
              <div 
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 backdrop-blur-sm border border-amber-500/30 cursor-pointer group/warning shadow-lg hover:shadow-amber-500/10 transition-shadow"
                onClick={() => {
                  setWarningType(detectSensitiveInfo[0].type);
                  setShowWarning(true);
                }}
              >
                <MdWarning className="text-amber-400 mr-2 text-sm" />
                <span className="text-xs text-amber-300 font-medium">
                  {detectSensitiveInfo.length} warning{detectSensitiveInfo.length > 1 ? 's' : ''}
                </span>
                <div className="ml-2 opacity-0 group-hover/warning:opacity-100 transition-opacity duration-200">
                  <HiOutlineExclamationCircle className="text-xs text-amber-400" />
                </div>
              </div>
            </div>
          )}

          {/* Message bubble - add margin-top if warning exists */}
          <div className={`relative rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
            detectSensitiveInfo.length > 0 && !isMe ? 'mt-6' : ''
          } ${
            isMe
              ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-br-none group-hover:shadow-blue-500/20'
              : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white rounded-bl-none border border-gray-700/30 group-hover:border-gray-600/50'
          }`}>
            
            {/* Message type indicator */}
            {getMessageIcon() && (
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center z-10">
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
                {renderTextWithWarnings(displayText)}
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
              {detectSensitiveInfo.length > 0 && !isMe && (
                <button 
                  onClick={() => {
                    setWarningType(detectSensitiveInfo[0].type);
                    setShowWarning(true);
                    setShowOptions(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors text-left flex items-center"
                >
                  <span className="mr-2">⚠️</span>
                  View Warnings
                </button>
              )}
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
      
      {/* Warning Modal */}
      {renderWarningModal()}
    </>
  );
};

export default MessageBubble;