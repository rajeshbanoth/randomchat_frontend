// components/MessageInput.jsx
import React, { useEffect, useRef } from 'react';
import { FaSmile, FaPaperPlane, FaPaperclip } from 'react-icons/fa';

const MessageInput = ({
  message,
  setMessage,
  handleTyping,
  handleTypingStop,
  handleSend,
  handleKeyPress,
  setShowEmojiPicker,
  showEmojiPicker,
  onEmojiClick,
  setMediaOptions,
  mediaOptions,
  partner,
  partnerDisconnected,
  inputRef: externalInputRef,
  handleDisconnect,
  handleNext,
  isMobile = false,
}) => {
  const internalInputRef = useRef(null);
  const inputRef = externalInputRef || internalInputRef;

  // Auto-scroll / keyboard handling on mobile
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      // Small delay → keyboard has time to appear
      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });

        // Extra scroll to bottom of page (helps iOS)
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
      }, 300);
    };

    input.addEventListener('focus', handleFocus);

    // VisualViewport helps on iOS when keyboard resizes viewport
    const handleViewportResize = () => {
      if (window.visualViewport) {
        setTimeout(handleFocus, 100);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      input.removeEventListener('focus', handleFocus);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, [inputRef]);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    if (value.trim().length > 0) {
      handleTyping?.();
    } else {
      handleTypingStop?.();
    }
  };

  const isDisabled = !partner || partnerDisconnected;

  return (
    <div 
      className={`
        w-full px-4 py-3 bg-gradient-to-t from-gray-950 via-gray-900 to-transparent
        border-t border-gray-800/40 backdrop-blur-md
        sticky bottom-0 z-50
      `}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className={`max-w-4xl mx-auto ${isMobile ? 'space-y-3' : 'space-y-2'}`}>
        {/* Quick actions row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMediaOptions?.(!mediaOptions)}
              disabled={isDisabled}
              className={`p-3 rounded-full transition-all ${
                mediaOptions
                  ? 'bg-blue-900/40 border-blue-600/50'
                  : 'bg-gray-800/40 hover:bg-gray-700/50 border-gray-700/60'
              } border disabled:opacity-40`}
              title="Attach"
            >
              <FaPaperclip className="text-lg text-gray-300" />
            </button>

            <button
              onClick={() => setShowEmojiPicker?.(!showEmojiPicker)}
              disabled={isDisabled}
              className={`p-3 rounded-full transition-all ${
                showEmojiPicker
                  ? 'bg-yellow-900/40 border-yellow-600/50'
                  : 'bg-gray-800/40 hover:bg-gray-700/50 border-gray-700/60'
              } border disabled:opacity-40`}
              title="Emoji"
            >
              <FaSmile className={`text-lg ${showEmojiPicker ? 'text-yellow-400' : 'text-gray-300'}`} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {partner && (
              <>
                <button
                  onClick={handleDisconnect}
                  disabled={partnerDisconnected}
                  className="px-4 py-2 bg-gradient-to-r from-rose-900/50 to-rose-800/50 hover:from-rose-800/60 hover:to-rose-700/60 rounded-lg border border-rose-700/50 text-rose-200 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {isMobile ? 'End' : 'Disconnect'}
                </button>

                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-900/50 to-purple-800/50 hover:from-indigo-800/60 hover:to-purple-700/60 rounded-lg border border-indigo-700/50 text-indigo-200 text-sm font-medium transition-all"
                >
                  {isMobile ? 'Next' : 'Next Partner'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main input area */}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              onBlur={handleTypingStop}
              placeholder={
                partner
                  ? `Message ${partner.profile?.username || partner.username || 'Partner'}...`
                  : "Type a message..."
              }
              disabled={isDisabled}
              rows={1}
              className={`
                w-full bg-gray-900/60 backdrop-blur-md border border-gray-700/60 
                rounded-2xl px-5 py-3.5 text-white placeholder-gray-500 
                focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                resize-none min-h-[52px] max-h-32 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />

            {/* Character counter */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-4 text-xs text-gray-400 pointer-events-none">
                {message.length}/1000
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || isDisabled}
            className={`
              flex-shrink-0 p-4 rounded-2xl transition-all duration-200
              ${message.trim() && !isDisabled
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 shadow-lg shadow-blue-500/20'
                : 'bg-gray-800/40 border border-gray-700/50 cursor-not-allowed'
              }
            `}
          >
            <FaPaperPlane
              className={`text-xl ${message.trim() && !isDisabled ? 'text-white' : 'text-gray-500'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;