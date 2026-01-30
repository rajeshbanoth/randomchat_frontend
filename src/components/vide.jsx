import React, { useState, useEffect, useCallback } from 'react';
import {
  FaArrowLeft, FaRandom, FaTimes, FaUser,
  FaHeart, FaVideo, FaVideoSlash, FaMicrophone,
  FaMicrophoneSlash, FaDesktop, FaPhone, FaVolumeUp,
  FaVolumeMute, FaExpand, FaCompress, FaPalette,
  FaCog, FaQrcode, FaSync, FaUsers,
  FaEllipsisV, FaCamera,
  FaRegCopy, FaLink, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';
import { useChat } from '../context/ChatContext';
import { useMediaStreams } from '../hooks/useMediaStreams';
import { useWebRTC } from '../hooks/useWebRTC';
import { useVideoChatControls } from '../hooks/useVideoChatControls';
import {
  formatTime,
  renderConnectionStatus,
  getPartnerInitial,
  getPartnerName
} from '../utils/VideoChatUtils';
import { setupEventListeners } from '../utils/eventHandlers';
// import { checkDevicePermissions } from '../utils/mediaUtils';

const VideoChatScreen = () => {
  const {
    socket,
    partner,
    userProfile,
    searching,
    autoConnect,
    disconnectPartner,
    nextPartner,
    toggleAutoConnect,
    addNotification,
    setCurrentScreen,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate,
    sendWebRTCEnd,
    debugGetState,
    debugForcePartnerUpdate
  } = useChat();
  
  // Custom Hooks
  const mediaStreams = useMediaStreams();
  const webRTC = useWebRTC(
    socket,
    partner,
    userProfile,
    addNotification,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate,
    sendWebRTCEnd,
    mediaStreams.localStreamRef,
    mediaStreams.remoteStreamRef,
    mediaStreams.remoteVideoRef,
    mediaStreams.forceStreamSync,
    mediaStreams.setIsRemoteAudioMuted,
    mediaStreams.setIsRemoteVideoMuted
  );
  
  const controls = useVideoChatControls();
  
  // Combined cleanup
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up video call');
    webRTC.cleanupWebRTC();
    mediaStreams.cleanupMediaStreams();
    controls.cleanupControls();
  }, [webRTC.cleanupWebRTC, mediaStreams.cleanupMediaStreams, controls.cleanupControls]);
  
  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    console.log('📵 Disconnecting video call');
    
    if (socket && webRTC.callInfo.partnerId && webRTC.callInfo.callId) {
      sendWebRTCEnd({
        to: webRTC.callInfo.partnerId,
        reason: 'user_ended',
        callId: webRTC.callInfo.callId,
        roomId: webRTC.callInfo.roomId
      });
    }
    
    cleanup();
    
    setCurrentScreen('home');
    
    if (disconnectPartner) {
      disconnectPartner();
    }
    
    addNotification('Video call ended', 'info');
  }, [
    socket,
    webRTC.callInfo,
    sendWebRTCEnd,
    cleanup,
    setCurrentScreen,
    disconnectPartner,
    addNotification
  ]);
  
  // Handle next partner
  const handleNext = useCallback(() => {
    console.log('⏭️ Switching to next partner');
    handleDisconnect();
    setTimeout(() => {
      if (nextPartner) {
        nextPartner();
      }
    }, 500);
  }, [handleDisconnect, nextPartner]);
  
  // Copy room link
  const copyRoomLink = useCallback(() => {
    const link = `${window.location.origin}/video/${webRTC.callInfo.roomId || webRTC.callInfo.callId}`;
    navigator.clipboard.writeText(link);
    addNotification('Room link copied to clipboard', 'success');
  }, [webRTC.callInfo, addNotification]);
  
  // Toggle screen share with proper dependencies
  const toggleScreenShare = useCallback(() => {
    mediaStreams.toggleScreenShare(webRTC.peerConnectionRef, addNotification);
  }, [mediaStreams.toggleScreenShare, webRTC.peerConnectionRef, addNotification]);
  
  // Effects
  useEffect(() => {
    console.log('🎬 VideoChatScreen mounted');
    
    // Initialize
    webRTC.startCallTimer();
    mediaStreams.initializeLocalStream();
    
    // Setup event listeners
    const cleanupEventListeners = setupEventListeners(
      (data) => webRTC.handleVideoMatchReady(data, debugForcePartnerUpdate),
      webRTC.handleWebRTCOffer,
      webRTC.handleWebRTCAnswer,
      webRTC.handleWebRTCIceCandidate,
      (data) => webRTC.handleWebRTCEnd(data, handleDisconnect)
    );
    
    // Auto-hide controls
    controls.autoHideControls();
    
    // Show controls on mouse move
    const handleMouseMove = () => {
      controls.showControlsTemporarily();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      console.log('🧹 VideoChatScreen cleanup');
      cleanup();
      cleanupEventListeners();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Initialize WebRTC when all conditions are met
  useEffect(() => {
    const shouldInitialize = 
      mediaStreams.localStreamRef.current && 
      partner && 
      webRTC.callInfo.callId && 
      webRTC.callInfo.roomId && 
      !webRTC.initializationRef.current &&
      !webRTC.callInfo.initialized;
    
    if (shouldInitialize) {
      console.log('🚀 Conditions met for WebRTC initialization');
      webRTC.initializeWebRTCConnection(
        mediaStreams.isVideoEnabled,
        mediaStreams.isAudioEnabled,
        mediaStreams.initializeLocalStream
      );
      webRTC.setCallInfo(prev => ({ ...prev, initialized: true }));
    }
  }, [
    mediaStreams.localStreamRef.current,
    partner,
    webRTC.callInfo,
    webRTC.initializeWebRTCConnection,
    mediaStreams.isVideoEnabled,
    mediaStreams.isAudioEnabled,
    mediaStreams.initializeLocalStream
  ]);
  
  // Process queued ICE candidates when remote description is set
  useEffect(() => {
    if (webRTC.peerConnectionRef.current?.remoteDescription && 
        webRTC.queuedIceCandidatesRef.current.length > 0) {
      console.log('🎯 Remote description set, processing queued candidates');
      webRTC.processQueuedIceCandidates();
    }
  }, [webRTC.peerConnectionRef.current?.remoteDescription, webRTC.processQueuedIceCandidates]);
  
  // Monitor connection state
  useEffect(() => {
    const monitorInterval = setInterval(() => {
      if (webRTC.peerConnectionRef.current) {
        const pc = webRTC.peerConnectionRef.current;
        const state = {
          signalingState: pc.signalingState,
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          iceGatheringState: pc.iceGatheringState,
          localDescription: pc.localDescription?.type,
          remoteDescription: pc.remoteDescription?.type,
          senders: pc.getSenders().length,
          receivers: pc.getReceivers().length,
          transceivers: pc.getTransceivers().length
        };
        
        if (JSON.stringify(state) !== JSON.stringify(webRTC.lastConnectionStateRef.current)) {
          console.log('📡 Connection state update:', state);
          webRTC.lastConnectionStateRef.current = state;
          
          if (state.signalingState === 'stable') {
            if (state.localDescription === 'offer' && !webRTC.callInfo.isCaller) {
              console.log('🔄 Auto-correcting: We are caller (have local offer)');
              webRTC.setCallInfo(prev => ({ ...prev, isCaller: true }));
            } else if (state.localDescription === 'answer' && webRTC.callInfo.isCaller) {
              console.log('🔄 Auto-correcting: We are callee (have local answer)');
              webRTC.setCallInfo(prev => ({ ...prev, isCaller: false }));
            }
          }
        }
      }
    }, 2000);
    
    return () => clearInterval(monitorInterval);
  }, [webRTC.callInfo.isCaller, webRTC.lastConnectionStateRef, webRTC.setCallInfo]);
  
  // Check for orphaned tracks periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (webRTC.peerConnectionRef.current && !mediaStreams.remoteStreamRef.current?.getTracks().length) {
        console.log('🔍 Checking for orphaned tracks...');
        
        const receivers = webRTC.peerConnectionRef.current.getReceivers();
        receivers.forEach(receiver => {
          if (receiver.track && receiver.track.readyState === 'live') {
            console.log(`🎯 Found orphaned ${receiver.track.kind} track, adding to stream`);
            
            if (!mediaStreams.remoteStreamRef.current) {
              mediaStreams.remoteStreamRef.current = new MediaStream();
            }
            
            if (!mediaStreams.remoteStreamRef.current.getTracks().find(t => t.id === receiver.track.id)) {
              mediaStreams.remoteStreamRef.current.addTrack(receiver.track);
              
              if (mediaStreams.remoteVideoRef.current) {
                mediaStreams.remoteVideoRef.current.srcObject = mediaStreams.remoteStreamRef.current;
                console.log('✅ Updated remote video with orphaned track');
              }
              
              mediaStreams.setRemoteStream(mediaStreams.remoteStreamRef.current);
            }
          }
        });
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [webRTC.peerConnectionRef, mediaStreams]);
  
  // Render helper functions
  const renderDeviceError = () => {
    if (mediaStreams.deviceError) {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 z-40 max-w-md">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Device Error</h3>
            <p className="text-gray-300 mb-4">
              {mediaStreams.deviceError}
            </p>
            <div className="space-y-3">
              <button
                onClick={mediaStreams.retryLocalStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-all duration-300"
              >
                Retry Connection
              </button>
              <button
                onClick={() => {
                  addNotification('Using placeholder video', 'info');
                  mediaStreams.setDeviceError(null);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg font-medium hover:opacity-90 transition-all duration-300 border border-gray-700"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // If searching and no partner, show searching screen
  if (searching && !partner) {
    return (
      <div className={`h-screen flex flex-col bg-gradient-to-br ${controls.themes[controls.activeTheme]} transition-all duration-500`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('home')}
              className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-700/50">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Searching for video chat...
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Searching Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="text-center max-w-md">
            {/* Animated Video Icon */}
            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
              </div>
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl relative animate-float">
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
                <FaVideo className="relative animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Looking for video partner...
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              We're searching for someone who wants to video chat
            </p>
            
            <div className="space-y-4 max-w-xs mx-auto">
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm group"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  Cancel Search
                </span>
              </button>
              
              <button
                onClick={() => controls.setShowSettings(!controls.showSettings)}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-xl font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm group"
              >
                <FaCog className="inline mr-3 group-hover:rotate-180 transition-transform" />
                Video Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${controls.themes[controls.activeTheme]} transition-all duration-500`}>
      {/* Device Error Overlay */}
      {renderDeviceError()}
      
      {/* Header */}
      <div className={`relative px-6 py-4 border-b border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${controls.showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDisconnect}
              className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-gray-800/40 backdrop-blur-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">End Call</span>
            </button>
            
            {partner && (
              <div className="group flex items-center space-x-4 hover:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm transition-all duration-300">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                      {getPartnerInitial(partner)}
                    </div>
                  </div>
                  {webRTC.partnerDisconnected ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse border-2 border-gray-900"></div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {getPartnerName(partner)}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    {renderConnectionStatus(webRTC.connectionStatus, webRTC.callDuration)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={controls.cycleTheme}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaPalette className="group-hover:rotate-180 transition-transform" />
            </button>
            {webRTC.callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
                title="Copy Room Link"
              >
                <FaLink className="group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              onClick={() => controls.setShowSettings(!controls.showSettings)}
              className="p-2.5 hover:bg-gray-800/40 rounded-xl transition-all duration-300 backdrop-blur-sm group"
            >
              <FaCog className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Video Area */}
      <div className="video-container flex-1 relative overflow-hidden bg-black">
        {/* Remote Video (Partner) */}
        <div className="absolute inset-0">
          <video
            ref={mediaStreams.remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Remote Video Status Overlay */}
          {(!mediaStreams.remoteStream || webRTC.connectionStatus !== 'connected') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center mb-8 border border-gray-700/50">
                {webRTC.connectionStatus === 'connecting' ? (
                  <div className="text-5xl text-blue-400 animate-pulse">
                    <FaVideo />
                  </div>
                ) : (
                  <div className="text-5xl text-gray-600">
                    <FaUser />
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {webRTC.connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for partner'}
              </h3>
              <p className="text-gray-400 mb-10 text-lg">
                {webRTC.connectionStatus === 'connecting'
                  ? 'Establishing video connection...'
                  : 'Partner video will appear here'}
              </p>
              
              {/* Remote Mute Indicators */}
              {mediaStreams.remoteStream && (
                <div className="space-y-2">
                  {mediaStreams.isRemoteVideoMuted && (
                    <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                      <FaVideoSlash className="inline mr-2" />
                      <span>Partner camera is off</span>
                    </div>
                  )}
                  {mediaStreams.isRemoteAudioMuted && (
                    <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                      <FaMicrophoneSlash className="inline mr-2" />
                      <span>Partner microphone is muted</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Local Video (Self) - Picture-in-Picture */}
        {mediaStreams.hasLocalStream && (
          <div className={`absolute ${controls.isFullscreen ? 'top-8 right-8 w-64 h-48' : 'top-4 right-4 w-48 h-36'} transition-all duration-300 rounded-xl overflow-hidden border-2 border-gray-700/50 bg-black shadow-2xl`}>
            <video
              ref={mediaStreams.localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Local Video Status Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              {!mediaStreams.isVideoEnabled && (
                <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs">
                  <FaVideoSlash />
                </div>
              )}
              {!mediaStreams.isAudioEnabled && (
                <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs">
                  <FaMicrophoneSlash />
                </div>
              )}
              {mediaStreams.isScreenSharing && (
                <div className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded text-xs">
                  <MdScreenShare />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Connection Status Banner */}
        {webRTC.connectionStatus === 'connecting' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium">Establishing secure connection...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Bar */}
      <div className={`relative p-6 border-t border-gray-800/30 bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${controls.showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-6">
            {/* Toggle Video */}
            <button
              onClick={mediaStreams.toggleVideo}
              disabled={!mediaStreams.hasLocalStream}
              className={`p-4 rounded-full transition-all duration-300 ${mediaStreams.isVideoEnabled
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${mediaStreams.isVideoEnabled ? 'border-blue-500/30' : 'border-red-500/30'} group ${!mediaStreams.hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {mediaStreams.isVideoEnabled ? (
                <FaVideo className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaVideoSlash className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Toggle Audio */}
            <button
              onClick={mediaStreams.toggleAudio}
              disabled={!mediaStreams.hasLocalStream}
              className={`p-4 rounded-full transition-all duration-300 ${mediaStreams.isAudioEnabled
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300'} backdrop-blur-sm border ${mediaStreams.isAudioEnabled ? 'border-green-500/30' : 'border-red-500/30'} group ${!mediaStreams.hasLocalStream ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {mediaStreams.isAudioEnabled ? (
                <FaMicrophone className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaMicrophoneSlash className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all duration-300 ${mediaStreams.isScreenSharing
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300'
                : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300'} backdrop-blur-sm border ${mediaStreams.isScreenSharing ? 'border-purple-500/30' : 'border-gray-700/30'} group`}
            >
              {mediaStreams.isScreenSharing ? (
                <MdStopScreenShare className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <MdScreenShare className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {/* End Call */}
            <button
              onClick={handleDisconnect}
              className="p-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 group"
            >
              <FaPhone className="text-2xl group-hover:rotate-90 transition-transform" />
            </button>
            
            {/* Next Partner */}
            <button
              onClick={handleNext}
              className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full transition-all duration-300 backdrop-blur-sm border border-purple-500/30 group"
            >
              <FaRandom className="text-2xl group-hover:rotate-180 transition-transform" />
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={controls.toggleFullscreen}
              className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
            >
              {controls.isFullscreen ? (
                <FaCompress className="text-2xl group-hover:scale-110 transition-transform" />
              ) : (
                <FaExpand className="text-2xl group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
          
          {/* Additional Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => {
                const debugState = debugGetState?.();
                console.log('Debug State:', debugState);
                console.log('Call Info:', webRTC.callInfo);
                webRTC.checkStreamState();
                addNotification('Debug info logged to console', 'info');
              }}
              className="px-4 py-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 hover:from-gray-700/30 hover:to-gray-800/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
            >
              <FaInfoCircle className="inline mr-2" />
              Debug Stream
            </button>
            
            {webRTC.callInfo.roomId && (
              <button
                onClick={copyRoomLink}
                className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
              >
                <FaRegCopy className="inline mr-2" />
                Copy Room Link
              </button>
            )}
            
            {!mediaStreams.hasLocalStream && (
              <button
                onClick={mediaStreams.retryLocalStream}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-yellow-500/30"
              >
                <FaSync className="inline mr-2" />
                Retry Camera
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      {controls.showSettings && (
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {getPartnerInitial(partner)}
                    </div>
                    <div>
                      <div className="font-medium">{getPartnerName(partner)}</div>
                      <div className="text-xs text-gray-400">
                        {partner.profile?.age || partner.age ? `${partner.profile?.age || partner.age} years` : 'Age not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-800">
                    <div className="text-xs text-gray-400 mb-2">Connection</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{webRTC.connectionStatus}</span>
                      <span className="text-xs text-gray-400">{formatTime(webRTC.callDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Video Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Camera Status</span>
                  <span className={`text-xs ${mediaStreams.hasLocalStream ? 'text-green-400' : 'text-red-400'}`}>
                    {mediaStreams.hasLocalStream ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Retry Count</span>
                  <span className="text-xs text-gray-400">{controls.retryCount}</span>
                </div>
                
                <button
                  onClick={mediaStreams.retryLocalStream}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                >
                  Reinitialize Camera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatScreen;