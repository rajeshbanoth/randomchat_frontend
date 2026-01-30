import React, { useState, useEffect } from 'react';
import { FaComments, FaVideo, FaRandom, FaLock, FaMicrophoneSlash, FaVideoSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const QuickAccessCards = ({
  ageVerified,
  connected,
  userProfile,
  onStartTextChat,
  onStartVideoChat,
  setShowAgeVerification
}) => {
  const [permissionState, setPermissionState] = useState({
    video: null, // null: not checked, true: granted, false: denied
    audio: null,
    loading: false
  });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  // Check permissions on component mount
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      // Check video permission
      const videoPermission = await navigator.permissions.query({ name: 'camera' });
      const audioPermission = await navigator.permissions.query({ name: 'microphone' });

      setPermissionState(prev => ({
        ...prev,
        video: videoPermission.state === 'granted',
        audio: audioPermission.state === 'granted'
      }));
    } catch (error) {
      console.log('Permission query not supported in this browser');
    }
  };

  const requestMediaPermissions = async () => {
    setPermissionState(prev => ({ ...prev, loading: true }));
    setPermissionError(null);

    try {
      // Request both camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Stop all tracks to release the camera/mic
      stream.getTracks().forEach(track => track.stop());

      setPermissionState({
        video: true,
        audio: true,
        loading: false
      });

      return true;
    } catch (error) {
      console.error('Permission error:', error);
      
      // Determine which permission was denied
      const errorMessage = getPermissionErrorMessage(error);
      setPermissionError(errorMessage);
      
      // Update permission state based on error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        if (error.message.includes('video') || error.message.includes('camera')) {
          setPermissionState(prev => ({ ...prev, video: false, loading: false }));
        } else if (error.message.includes('audio') || error.message.includes('microphone')) {
          setPermissionState(prev => ({ ...prev, audio: false, loading: false }));
        } else {
          setPermissionState(prev => ({ ...prev, video: false, audio: false, loading: false }));
        }
      } else {
        setPermissionState(prev => ({ ...prev, loading: false }));
      }
      
      setShowPermissionPrompt(true);
      return false;
    }
  };

  const getPermissionErrorMessage = (error) => {
    if (error.name === 'NotAllowedError') {
      return 'Camera/microphone access was denied. Please allow access in your browser settings.';
    } else if (error.name === 'NotFoundError') {
      return 'No camera/microphone found. Please connect a camera and microphone.';
    } else if (error.name === 'NotReadableError') {
      return 'Camera/microphone is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      return 'Camera does not support the requested resolution.';
    } else {
      return 'Unable to access camera/microphone. Please check your device permissions.';
    }
  };

  const handleVideoChatClick = async () => {
    if (!ageVerified) {
      setShowAgeVerification(true);
      return;
    }

    // Check if we already have permission
    if (permissionState.video === null || permissionState.audio === null) {
      // First time checking, request permission
      const hasPermission = await requestMediaPermissions();
      if (hasPermission) {
        onStartVideoChat();
      }
    } else if (!permissionState.video || !permissionState.audio) {
      // Permissions were previously denied, show prompt
      setShowPermissionPrompt(true);
    } else {
      // We have permission, proceed
      onStartVideoChat();
    }
  };

  const openBrowserSettings = () => {
    // Note: Browser settings can't be opened programmatically for security reasons
    // We can show instructions instead
    setPermissionError(
      'To enable camera/microphone access:\n\n' +
      '1. Click the lock/camera/microphone icon in your browser address bar\n' +
      '2. Change camera/microphone settings to "Allow"\n' +
      '3. Refresh the page and try again'
    );
  };

  const PermissionPromptModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-yellow-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Camera & Microphone Required</h2>
          <p className="text-gray-400">Video chat needs access to your camera and microphone</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                permissionState.video ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {permissionState.video ? (
                  <FaVideo className="text-green-400" />
                ) : (
                  <FaVideoSlash className="text-red-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-white">Camera</h4>
                <p className="text-sm text-gray-400">
                  {permissionState.video ? 'Access granted' : 'Access required'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              permissionState.video 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {permissionState.video ? '✓' : '✗'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                permissionState.audio ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {permissionState.audio ? (
                  <FaMicrophoneSlash className="text-green-400" />
                ) : (
                  <FaMicrophoneSlash className="text-red-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-white">Microphone</h4>
                <p className="text-sm text-gray-400">
                  {permissionState.audio ? 'Access granted' : 'Access required'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              permissionState.audio 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {permissionState.audio ? '✓' : '✗'}
            </span>
          </div>

          {permissionError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm whitespace-pre-line">{permissionError}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={async () => {
              const hasPermission = await requestMediaPermissions();
              if (hasPermission) {
                setShowPermissionPrompt(false);
                onStartVideoChat();
              }
            }}
            disabled={permissionState.loading}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              permissionState.loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90'
            }`}
          >
            {permissionState.loading ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Requesting Access...
              </>
            ) : (
              'Allow Camera & Microphone'
            )}
          </button>
          
          <button
            onClick={() => {
              openBrowserSettings();
            }}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors text-sm"
          >
            Browser Settings Help
          </button>

          <button
            onClick={() => setShowPermissionPrompt(false)}
            className="w-full py-3 bg-gray-800/50 hover:bg-gray-700 rounded-xl font-medium transition-colors text-sm"
          >
            Cancel
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your camera and microphone are only used during video chats and are not recorded.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
        {/* Text Chat Card */}
        <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border transition-all duration-300 ${ageVerified ? 'border-gray-700 hover:border-blue-500 hover:scale-[1.02]' : 'border-yellow-500/50'}`}>
          {!ageVerified && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="text-center p-6">
                <FaLock className="text-yellow-400 text-4xl mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Verify Age First</h4>
                <p className="text-gray-300 mb-4">Quick age check required for chat access</p>
                <button
                  onClick={() => setShowAgeVerification(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90"
                >
                  Verify Now
                </button>
              </div>
            </div>
          )}
          
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
              <FaComments />
            </div>
          </div>
          
          <div className="text-center pt-4">
            <h3 className="text-2xl font-bold mb-4">Text Chat</h3>
            <p className="text-gray-400 mb-6">
              Connect instantly with random people through text messages
            </p>
            
            <button
              onClick={onStartTextChat}
              disabled={!connected || !userProfile || !ageVerified}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
                connected && userProfile && ageVerified
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 hover:scale-105'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              <FaRandom className="inline mr-2" />
              Start Random Chat
            </button>
          </div>
        </div>

        {/* Video Chat Card */}
        <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border transition-all duration-300 ${
          ageVerified 
            ? permissionState.video && permissionState.audio
              ? 'border-gray-700 hover:border-green-500 hover:scale-[1.02]'
              : 'border-yellow-500 hover:border-yellow-500 hover:scale-[1.02]'
            : 'border-yellow-500/50'
        }`}>
          {/* Age verification overlay */}
          {!ageVerified && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="text-center p-6">
                <FaLock className="text-yellow-400 text-4xl mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Age Verified Only</h4>
                <p className="text-gray-300 mb-4">Video chat requires age verification</p>
              </div>
            </div>
          )}
          
          {/* Permission status indicator */}
          {ageVerified && (
            <div className="absolute top-4 right-4 flex space-x-2">
              {permissionState.video && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <FaVideo size={10} />
                </div>
              )}
              {permissionState.audio && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <FaMicrophoneSlash size={10} />
                </div>
              )}
            </div>
          )}
          
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xl">
              <FaVideo />
            </div>
          </div>
          
          <div className="text-center pt-4">
            <h3 className="text-2xl font-bold mb-4">Video Chat</h3>
            <p className="text-gray-400 mb-6">
              Face-to-face video calls with random people
            </p>
            
            {/* Permission status info */}
            {ageVerified && (
              <div className="mb-4 space-y-2">
                {permissionState.video === false || permissionState.audio === false ? (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                    <FaExclamationTriangle className="mr-2" size={12} />
                    Camera/Mic access needed
                  </div>
                ) : permissionState.video === true && permissionState.audio === true ? (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                    <FaCheckCircle className="mr-2" size={12} />
                    Camera/Mic ready
                  </div>
                ) : null}
              </div>
            )}
            
            <button
              onClick={handleVideoChatClick}
              disabled={!connected || !userProfile || !ageVerified || permissionState.loading}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
                connected && userProfile && ageVerified
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 hover:scale-105'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {permissionState.loading ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Checking Permissions...
                </>
              ) : (
                <>
                  <FaRandom className="inline mr-2" />
                  Start Video Chat
                </>
              )}
            </button>
            
            {/* Permission help text */}
            {ageVerified && permissionState.video !== null && permissionState.audio !== null && (
              <p className="text-xs text-gray-500 mt-3">
                {permissionState.video && permissionState.audio 
                  ? '✓ Camera & microphone access granted'
                  : 'Click to request camera & microphone access'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Permission Prompt Modal */}
      {showPermissionPrompt && <PermissionPromptModal />}
    </>
  );
};

export default QuickAccessCards;