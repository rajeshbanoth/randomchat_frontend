import React from 'react';
import { FaQrcode } from 'react-icons/fa';

const SettingsPanel = ({
  showSettings,
  setShowSettings,
  autoConnect,
  toggleAutoConnect,
  partner,
  partnerDisconnected,
  setShowScanner
}) => {
  if (!showSettings) return null;

  return (
    <div className="absolute top-16 right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 shadow-2xl w-64 z-50">
      <div className="space-y-4">
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoConnect}
                onChange={toggleAutoConnect}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                autoConnect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
              }`}></div>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                autoConnect ? 'transform translate-x-5' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-sm text-gray-300">Auto-connect</span>
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Automatically search for next partner
          </p>
        </div>
       
        {partner && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Partner Info</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {(partner.profile?.username || partner.username || 'S').charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{partner.profile?.username || partner.username || 'Stranger'}</div>
                  <div className="text-xs text-gray-400">
                    {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                  </div>
                </div>
              </div>
             
              <div className="pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-400 mb-2">Status</div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    partnerDisconnected ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm">
                    {partnerDisconnected ? 'Disconnected' : 'Online'}
                  </span>
                </div>
              </div>
             
              {partner.profile?.interests?.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Interests</div>
                  <div className="flex flex-wrap gap-1">
                    {partner.profile.interests.slice(0, 3).map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs backdrop-blur-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
       
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={() => {
              setShowScanner(true);
              setShowSettings(false);
            }}
            className="w-full px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center space-x-2 backdrop-blur-sm group"
          >
            <FaQrcode className="group-hover:rotate-12 transition-transform" />
            <span>Scan QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;