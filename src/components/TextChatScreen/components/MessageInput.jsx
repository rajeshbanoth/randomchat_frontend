// import React from 'react';
// import EmojiPicker from 'emoji-picker-react';
// import { MdAttachFile, MdEmojiEmotions, MdSend } from 'react-icons/md';
// import { FaTimes, FaRandom } from 'react-icons/fa';

// const MessageInput = ({
//   message,
//   setMessage,
//   handleTyping,
//   handleTypingStop,
//   handleSend,
//   handleKeyPress,
//   setShowEmojiPicker,
//   showEmojiPicker,
//   onEmojiClick,
//   setMediaOptions,
//   mediaOptions,
//   partner,
//   partnerDisconnected,
//   inputRef,
//   handleDisconnect,
//   handleNext
// }) => {
//   return (
//     <div className="relative p-6 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl">
//       <div className="max-w-3xl mx-auto">
//         <div className="flex items-center space-x-3">
//           {/* Media Button */}
//           {/* <button
//             onClick={() => setMediaOptions(!mediaOptions)}
//             className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group"
//           >
//             <MdAttachFile className="text-xl group-hover:rotate-12 transition-transform" />
//           </button> */}
         
//           {/* Emoji Picker */}
//           <div className="relative">
//             <button
//               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//               className="p-3.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50 group"
//             >
//               <MdEmojiEmotions className="text-xl group-hover:scale-110 transition-transform" />
//             </button>
           
//             {showEmojiPicker && (
//               <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-700/50">
//                 <EmojiPicker
//                   onEmojiClick={onEmojiClick}
//                   theme="dark"
//                   width={320}
//                   height={400}
//                   previewConfig={{ showPreview: false }}
//                 />
//               </div>
//             )}
//           </div>
         
//           {/* Input Field */}
//           <div className="flex-1 relative">
//             <input
//               ref={inputRef}
//               type="text"
//               value={message}
//               onChange={(e) => {
//                 setMessage(e.target.value);
//                 if (e.target.value.length > 0) {
//                   handleTyping();
//                 } else {
//                   handleTypingStop();
//                 }
//               }}
//               onKeyPress={handleKeyPress}
//               onBlur={handleTypingStop}
//               placeholder="Type your message here..."
//               className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 backdrop-blur-sm transition-all duration-300"
//               disabled={!partner || partnerDisconnected}
//               autoFocus
//             />
           
//             {/* Character Count */}
//             {message.length > 0 && (
//               <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
//                 {message.length}/500
//               </div>
//             )}
//           </div>
         
//           {/* Send Button */}
//           <button
//             onClick={handleSend}
//             disabled={!message.trim() || !partner || partnerDisconnected}
//             className="p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-xl font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-500/20 group"
//           >
//             <MdSend className="text-xl group-hover:translate-x-0.5 transition-transform" />
//           </button>
//         </div>

//         {/* Controls */}
//         <div className="flex justify-center space-x-4 mt-4">
//           <button
//             onClick={handleDisconnect}
//             disabled={partnerDisconnected}
//             className="px-5 py-2.5 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 rounded-xl font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2 backdrop-blur-sm group"
//           >
//             <FaTimes className="group-hover:rotate-90 transition-transform" />
//             <span>Disconnect</span>
//           </button>
         
//           <button
//             onClick={handleNext}
//             className="px-5 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl font-medium transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 flex items-center space-x-2 backdrop-blur-sm group"
//           >
//             <FaRandom className="group-hover:rotate-180 transition-transform" />
//             <span>Next Partner</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageInput;


// components/MessageInput.jsx (updated)
import React from 'react';
import { FaSmile, FaPaperPlane, FaPaperclip, FaMicrophone, FaVideo, FaPhoneAlt, FaEllipsisH } from 'react-icons/fa';

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
  inputRef,
  handleDisconnect,
  handleNext,
  isMobile = false
}) => {
  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  return (
    <div className="w-full px-4 py-3">
      <div className={`max-w-4xl mx-auto ${isMobile ? 'space-y-3' : 'space-y-2'}`}>
        {/* Quick Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMediaOptions(!mediaOptions)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                mediaOptions 
                  ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-700/50' 
                  : 'bg-gradient-to-b from-gray-800/30 to-gray-900/30 hover:from-gray-700/40 hover:to-gray-800/40 border border-gray-700/50'
              }`}
              title={mediaOptions ? "Hide Media" : "Show Media"}
            >
              <FaPaperclip className="text-gray-400" />
            </button>
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                showEmojiPicker 
                  ? 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 border border-yellow-700/50' 
                  : 'bg-gradient-to-b from-gray-800/30 to-gray-900/30 hover:from-gray-700/40 hover:to-gray-800/40 border border-gray-700/50'
              }`}
              title="Emoji"
            >
              <FaSmile className={`${showEmojiPicker ? 'text-yellow-400' : 'text-gray-400'}`} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {partner && (
              <>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-gradient-to-r from-rose-900/30 to-rose-800/30 hover:from-rose-800/40 hover:to-rose-700/40 rounded-lg border border-rose-700/50 text-rose-300 text-sm transition-all duration-200"
                >
                  {isMobile ? 'End' : 'Disconnect'}
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-900/30 to-blue-800/30 hover:from-blue-800/40 hover:to-blue-700/40 rounded-lg border border-blue-700/50 text-blue-300 text-sm transition-all duration-200"
                >
                  {isMobile ? 'Next' : 'Next Partner'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Input Area */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              onBlur={handleTypingStop}
              placeholder={partner ? `Message ${partner.profile?.username || partner.username || 'Partner'}...` : "Type a message..."}
              className="w-full bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 resize-none min-h-[48px] max-h-32"
              rows="1"
              disabled={!partner || partnerDisconnected}
            />
            
            {/* Character Count */}
            {message.length > 0 && (
              <div className="absolute -bottom-6 right-2 text-xs text-gray-500">
                {message.length}/1000
              </div>
            )}
          </div>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || !partner || partnerDisconnected}
            className={`flex-shrink-0 p-3.5 rounded-xl transition-all duration-200 ${
              message.trim() && partner
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95'
                : 'bg-gradient-to-b from-gray-800/30 to-gray-900/30 border border-gray-700/50'
            }`}
          >
            <FaPaperPlane className={`${message.trim() && partner ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;