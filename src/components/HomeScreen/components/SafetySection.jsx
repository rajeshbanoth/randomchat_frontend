import React from 'react';
import { FaShieldAlt, FaChevronRight, FaCheckCircle } from 'react-icons/fa';

const SafetySection = ({
  showSafetyTips,
  setShowSafetyTips,
  handleClearAllData
}) => {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-700">
        <button
          onClick={() => setShowSafetyTips(!showSafetyTips)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showSafetyTips ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
              <FaShieldAlt className={`${showSafetyTips ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Safety Information</h3>
              <p className="text-gray-400 text-sm">Important guidelines and resources</p>
            </div>
          </div>
          <FaChevronRight className={`transition-transform ${showSafetyTips ? 'rotate-90' : ''}`} />
        </button>
        
        {showSafetyTips && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-300 mb-3">Quick Safety Tips</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Keep personal information private</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Be respectful to others</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Report inappropriate behavior</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-green-300 mb-3">Your Privacy</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-400">💾</span>
                    <span className="font-medium">Data stored locally</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Your age verification, profile, and interests are saved only on your device. No data is sent to servers.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
              >
                Clear All Stored Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetySection;