import React, { useRef } from 'react';
import { FaTimes, FaShieldAlt, FaCheckCircle, FaSave } from 'react-icons/fa';

const SafetyWarningModal = ({
  isClosingModal,
  handleCloseModal,
  setShowSafetyTips,
  handleTermsAcceptance,
  handleClearAllData,
  activeSafetyTab,
  setActiveSafetyTab
}) => {
  const safetyModalRef = useRef(null);
  const safetyModalContentRef = useRef(null);

  const tabs = [
    { id: 'quick-tips', label: 'Quick Tips' },
    { id: 'age-verification', label: 'Age 18+' },
    { id: 'data-privacy', label: 'Privacy' },
    { id: 'emergency', label: 'Emergency' }
  ];

  return (
    <div className={`fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 transition-all duration-300 overflow-y-auto ${
      isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div 
        ref={safetyModalRef}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-2xl w-full border-2 border-blue-500 relative my-auto"
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => handleCloseModal(() => setShowSafetyTips(false))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Safety First</h2>
          <p className="text-gray-400">Important information to keep you safe</p>
        </div>
        
        {/* Safety Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSafetyTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSafetyTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div 
          ref={safetyModalContentRef}
          className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2"
        >
          {activeSafetyTab === 'quick-tips' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Essential Safety Tips</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Keep personal information private</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Be respectful to others</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Report inappropriate behavior</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Use common sense in conversations</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                <h4 className="font-bold text-green-300 mb-2">Good to Know</h4>
                <p className="text-gray-300">
                  All chats are anonymous. No registration required. Your data is stored only on your device.
                </p>
              </div>
            </div>
          )}
          
          {activeSafetyTab === 'age-verification' && (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">Age Restriction</h3>
                <p className="text-gray-300">
                  This platform is intended for users 18 years and older. Age verification helps ensure a safer environment for everyone.
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-bold text-white mb-2">Why we ask for age verification:</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Maintain age-appropriate conversations</li>
                  <li>• Filter out underage users</li>
                  <li>• Provide better content matching</li>
                  <li>• Comply with legal requirements</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeSafetyTab === 'data-privacy' && (
            <div className="space-y-4">
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                <h3 className="text-lg font-bold text-green-300 mb-2">Your Privacy Matters</h3>
                <p className="text-gray-300">
                  We use local storage to save your preferences on your device only. No data is sent to our servers.
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <FaSave className="text-green-400" />
                  <div>
                    <h4 className="font-bold text-white">Locally Stored Data</h4>
                    <p className="text-gray-400 text-sm">Stays on your device</p>
                  </div>
                </div>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Age verification status</li>
                  <li>• Your interests and preferences</li>
                  <li>• Profile information</li>
                  <li>• Terms acceptance</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeSafetyTab === 'emergency' && (
            <div className="space-y-4">
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                <h3 className="text-lg font-bold text-red-300 mb-2">Need Help?</h3>
                <p className="text-gray-300">
                  If you encounter illegal content or feel threatened, here are resources:
                </p>
              </div>
              
              <div className="space-y-2">
                <a 
                  href="https://www.missingkids.org/cybertipline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-white">CyberTipline</div>
                  <div className="text-gray-400 text-sm">Report online exploitation</div>
                </a>
                
                <a 
                  href="https://www.connectsafely.org/safety-tips/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-white">ConnectSafely Guides</div>
                  <div className="text-gray-400 text-sm">Online safety resources</div>
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTermsAcceptance}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold hover:opacity-90"
          >
            <FaCheckCircle className="inline mr-2" />
            I Understand & Continue
          </button>
          <button
            onClick={handleClearAllData}
            className="sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
          >
            Exit
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms and acknowledge you are 18+
        </p>
      </div>
    </div>
  );
};

export default SafetyWarningModal;