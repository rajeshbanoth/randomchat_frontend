import React from 'react';
import VideoOverlay from './VideoOverlay';

const VideoLayout = ({
  videoLayout,
  isChangingLayout,
  videoContainerRef,
  localVideoRef,
  remoteVideoRef,
  remoteStream,
  connectionStatus,
  usingPlaceholder,
  isScreenSharing,
  localStreamRef,
  screenStreamRef,
  isVideoEnabled,
  isAudioEnabled,
  isRemoteVideoMuted,
  isRemoteAudioMuted,
  isMobile
}) => {
  const layoutAnimations = {
    pip: "animate-fade-in",
    'grid-horizontal': "animate-slide-in-up",
    'grid-vertical': "animate-slide-in-left",
    'side-by-side': "animate-scale-in",
    stack: "animate-fade-in",
    'focus-remote': "animate-slide-in-right",
    'focus-local': "animate-slide-in-left",
    cinema: "animate-fade-in",
    'speaker-view': "animate-slide-in-up"
  };
  
  const containerClass = `absolute inset-0 transition-all duration-500 ease-in-out ${
    isChangingLayout ? 'opacity-90 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
  }`;
  
  // Common video props
  const localVideoProps = {
    ref: localVideoRef,
    autoPlay: true,
    playsInline: true,
    muted: true,
    className: "w-full h-full object-cover",
    onLoadedMetadata: () => console.log('🎥 Local video metadata loaded'),
    onCanPlay: () => console.log('✅ Local video can play'),
    onError: (e) => console.error('Local video error:', e)
  };
  
  const remoteVideoProps = {
    ref: remoteVideoRef,
    autoPlay: true,
    playsInline: true,
    className: "w-full h-full object-cover",
    onLoadedMetadata: () => console.log('🎥 Remote video metadata loaded'),
    onCanPlay: () => console.log('✅ Remote video can play'),
    onError: (e) => console.error('Remote video error:', e)
  };
  
  const renderLayout = () => {
    switch(videoLayout) {
      case 'grid-horizontal':
        return (
          <div ref={videoContainerRef} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full gap-2 p-2 ${layoutAnimations['grid-horizontal']} ${containerClass}`}>
            {/* Remote Video */}
            <div className={`${isMobile ? 'h-1/2' : 'flex-1'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video */}
            <div className={`${isMobile ? 'h-1/2' : 'flex-1'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={false}
              />
            </div>
          </div>
        );
        
      case 'grid-vertical':
        return (
          <div ref={videoContainerRef} className={`flex ${isMobile ? 'flex-row' : 'flex-col'} h-full gap-2 p-2 ${layoutAnimations['grid-vertical']} ${containerClass}`}>
            {/* Remote Video */}
            <div className={`${isMobile ? 'w-1/2' : 'h-1/2'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video */}
            <div className={`${isMobile ? 'w-1/2' : 'h-1/2'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={false}
              />
            </div>
          </div>
        );
        
      case 'side-by-side':
        return (
          <div ref={videoContainerRef} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full gap-3 p-3 ${layoutAnimations['side-by-side']} ${containerClass}`}>
            {/* Remote Video - 70% on desktop, 2/3 on mobile */}
            <div className={`${isMobile ? 'h-2/3' : 'w-[70%]'} relative rounded-2xl overflow-hidden ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video - 30% on desktop, 1/3 on mobile */}
            <div className={`${isMobile ? 'h-1/3' : 'w-[30%]'} relative rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={false}
              />
            </div>
          </div>
        );
        
      case 'stack':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.stack} ${containerClass}`}>
            {/* Remote Video - Full Background */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video - Corner Overlay */}
            <div className={`absolute ${isMobile ? 'bottom-4 left-4 w-32 h-24' : 'bottom-8 left-8 w-64 h-48'} rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={true}
              />
            </div>
          </div>
        );
        
      case 'cinema':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.cinema} ${containerClass}`}>
            {/* Remote Video - Centered with black bars */}
            <div className={`absolute inset-0 bg-black flex items-center justify-center`}>
              <div className={`relative ${isMobile ? 'w-full h-auto' : 'w-auto h-full'} max-w-full max-h-full`}>
                <video 
                  {...remoteVideoProps} 
                  className={`${isMobile ? 'w-full h-auto' : 'w-auto h-full'} object-contain`}
                />
                <VideoOverlay
                  type="remote"
                  isRemoteVideoMuted={isRemoteVideoMuted}
                  isRemoteAudioMuted={isRemoteAudioMuted}
                  connectionStatus={connectionStatus}
                />
              </div>
            </div>
            
            {/* Local Video - Small Corner */}
            <div className={`absolute ${isMobile ? 'top-4 right-4 w-32 h-24' : 'top-8 right-8 w-48 h-36'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={true}
              />
            </div>
          </div>
        );
        
      case 'speaker-view':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['speaker-view']} ${containerClass}`}>
            {/* Main Speaker (Remote) - Larger area */}
            <div className={`absolute ${isMobile ? 'inset-x-0 top-0 h-3/4' : 'inset-x-0 top-0 h-3/4'} ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video - Smaller at bottom */}
            <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4 h-32' : 'bottom-8 left-1/3 right-1/3 h-1/4'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={true}
              />
            </div>
          </div>
        );
        
      case 'focus-remote':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['focus-remote']} ${containerClass}`}>
            {/* Remote Video - Full Screen */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video - Small PIP */}
            <div className={`absolute ${isMobile ? 'top-4 right-4 w-32 h-24' : 'top-8 right-8 w-48 h-36'} rounded-xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={true}
              />
            </div>
          </div>
        );
        
      case 'focus-local':
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations['focus-local']} ${containerClass}`}>
            {/* Local Video - Full Screen */}
            <div className={`absolute inset-0`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={false}
              />
            </div>
            
            {/* Remote Video - Small PIP */}
            <div className={`absolute ${isMobile ? 'top-4 left-4 w-32 h-24' : 'top-8 left-8 w-48 h-36'} rounded-xl overflow-hidden border-2 border-gray-700/50`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
                isSmall={true}
              />
            </div>
          </div>
        );
        
      case 'pip':
      default:
        return (
          <div ref={videoContainerRef} className={`relative h-full ${layoutAnimations.pip} ${containerClass}`}>
            {/* Remote Video - Full Screen */}
            <div className={`absolute inset-0 ${!remoteStream ? 'bg-gradient-to-br from-gray-900 to-black' : ''}`}>
              <video {...remoteVideoProps} />
              <VideoOverlay
                type="remote"
                isRemoteVideoMuted={isRemoteVideoMuted}
                isRemoteAudioMuted={isRemoteAudioMuted}
                connectionStatus={connectionStatus}
              />
            </div>
            
            {/* Local Video - PIP */}
            <div className={`absolute ${isMobile ? 'top-4 right-4 w-40 h-30' : 'top-8 right-8 w-64 h-48'} rounded-2xl overflow-hidden border-2 ${usingPlaceholder ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
              <video {...localVideoProps} />
              <VideoOverlay
                type="local"
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isSmall={true}
              />
            </div>
          </div>
        );
    }
  };

  return renderLayout();
};

export default VideoLayout;