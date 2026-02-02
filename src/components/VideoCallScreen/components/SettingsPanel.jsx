import React from 'react';

const SettingsPanel = ({
  autoConnect,
  toggleAutoConnect,
  partner,
  connectionStatus,
  formatTime,
  callDuration,
  videoLayout,
  handleLayoutChange,
  hasLocalStream,
  usingPlaceholder,
  retryCount,
  retryLocalStream,
  createAndUsePlaceholder,
  forceStreamSync,
  addNotification,
  setShowSettings
}) => {
  const layouts = [
    'pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 
    'stack', 'cinema', 'speaker-view', 'focus-remote', 'focus-local'
  ];

  return (
    <div className="absolute top-14 sm:top-16 right-4 sm:right-6 bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-700/50 shadow-2xl w-64 sm:w-80 z-50 animate-slide-down">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
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
            <span className="ml-3 text-sm text-gray-300">Auto-reconnect</span>
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {(partner.profile?.username || partner.username || 'S').charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">{partner.profile?.username || partner.username || 'Stranger'}</div>
                  <div className="text-xs text-gray-400">
                    {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-400 mb-2">Connection</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{connectionStatus}</span>
                  <span className="text-xs text-gray-400">{formatTime(callDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Video Layout</h4>
          <div className="grid grid-cols-3 gap-2">
            {layouts.map((layout) => (
              <button
                key={layout}
                onClick={() => handleLayoutChange(layout)}
                className={`p-2 rounded-lg transition-all duration-300 ${videoLayout === layout ? 'bg-blue-500/20 border-blue-500/50' : 'bg-gray-800/30 border-gray-700/50'} border hover:scale-105`}
                title={layout.replace('-', ' ')}
              >
                <div className="text-xs text-gray-300 truncate">
                  {layout.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Video Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Camera Status</span>
              <span className={`text-xs ${hasLocalStream ? (usingPlaceholder ? 'text-purple-400' : 'text-green-400') : 'text-red-400'}`}>
                {hasLocalStream ? (usingPlaceholder ? 'Placeholder' : 'Connected') : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Retry Count</span>
              <span className="text-xs text-gray-400">{retryCount}</span>
            </div>
            
            <button
              onClick={retryLocalStream}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30 hover:scale-[1.02]"
            >
              Reinitialize Camera
            </button>
            
            <button
              onClick={createAndUsePlaceholder}
              className="w-full px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30 hover:scale-[1.02]"
            >
              {usingPlaceholder ? 'Refresh Placeholder' : 'Use Placeholder Video'}
            </button>
          </div>
        </div>
        
        {/* Quick Connection Test */}
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={() => {
              forceStreamSync();
              addNotification('Forced stream sync', 'info');
            }}
            className="w-full px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30 hover:scale-[1.02]"
          >
            Force Stream Sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;