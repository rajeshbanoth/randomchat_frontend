import React from 'react';
import { FaHandPeace, FaSmile, FaShieldAlt, FaSave } from 'react-icons/fa';

const WelcomeModal = ({ isClosingModal, setShowWelcome, setShowSafetyTips }) => {
  return (
    <div className={`fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <FaHandPeace className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Omegle Pro!</h2>
          <p className="text-gray-300">Connect with people around the world</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <FaSmile className="text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white">Make New Friends</h4>
              <p className="text-gray-400 text-sm">Connect with people who share your interests</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FaShieldAlt className="text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white">Safe & Controlled</h4>
              <p className="text-gray-400 text-sm">Your data stays on your device. Age verification ensures safety.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FaSave className="text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white">Auto-Save Feature</h4>
              <p className="text-gray-400 text-sm">Your preferences are saved locally in your browser</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowWelcome(false);
              setShowSafetyTips(true);
            }}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-medium hover:opacity-90"
          >
            Safety First
          </button>
          <button
            onClick={() => setShowWelcome(false)}
            className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl font-medium hover:opacity-90"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;