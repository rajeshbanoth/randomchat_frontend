// lib/WebRTCManager.js - Create this new file
class WebRTCManager {
  constructor({ 
    socket, 
    callId, 
    partnerId, 
    userProfile,
    onLocalStream,
    onRemoteStream,
    onCallEnded,
    onConnectionStateChange,
    onError,
    onStatsUpdate
  }) {
    this.socket = socket;
    this.callId = callId;
    this.partnerId = partnerId;
    this.userProfile = userProfile;
    this.onLocalStream = onLocalStream;
    this.onRemoteStream = onRemoteStream;
    this.onCallEnded = onCallEnded;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onError = onError;
    this.onStatsUpdate = onStatsUpdate;
    
    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.remoteStream = null;
    this.statsInterval = null;
    this.isCaller = false;
    this.pendingCandidates = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    
    console.log('🎬 WebRTCManager created for call:', callId);
  }

  // Initialize WebRTC connection
  async initialize() {
    try {
      console.log('🔧 Initializing WebRTC connection...');
      
      // Determine if this user is the caller
      this.isCaller = this.socket?.id === this.userProfile?.socketId || false;
      
      // Get local media stream
      await this.getLocalMedia();
      
      // Create peer connection
      this.createPeerConnection();
      
      // Add local tracks to peer connection
      this.addLocalTracks();
      
      // Set up data channel for chat
      this.setupDataChannel();
      
      // Set up signaling listeners
      this.setupSignalingListeners();
      
      // Create and send offer if caller
      if (this.isCaller) {
        console.log('📤 Caller: Creating and sending offer...');
        setTimeout(() => this.createAndSendOffer(), 1000);
      }
      
      // Start stats collection
      this.startStatsCollection();
      
      console.log('✅ WebRTC initialization complete');
      
    } catch (error) {
      console.error('❌ Error initializing WebRTC:', error);
      if (this.onError) this.onError(error);
    }
  }

  async getLocalMedia() {
    try {
      console.log('🎥 Requesting camera and microphone access...');
      
      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2
        }
      };

      // Try with ideal constraints first
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.log('⚠️ Falling back to basic constraints...');
        // Fallback to basic constraints
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      }

      console.log('✅ Got local stream:', this.localStream);
      
      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      // Listen for track ended events
      this.localStream.getTracks().forEach(track => {
        track.onended = () => {
          console.log('Track ended:', track.kind);
          if (this.onError) this.onError(new Error(`${track.kind} track ended`));
        };
      });

    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  createPeerConnection() {
    console.log('🔗 Creating RTCPeerConnection...');
    
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Set up event handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        console.log('🧊 ICE candidate generated');
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          callId: this.callId,
          to: this.partnerId,
          timestamp: Date.now()
        });
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState;
      console.log('❄️ ICE connection state:', state);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
      
      if (state === 'disconnected' || state === 'failed') {
        console.log('🔌 Connection lost, attempting to reconnect...');
        this.reconnect();
      }
    };

    this.peerConnection.onsignalingstatechange = () => {
      console.log('📡 Signaling state:', this.peerConnection.signalingState);
    };

    this.peerConnection.ontrack = (event) => {
      console.log('🎬 Received remote track:', event.track.kind);
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        
        // Set up track ended listener
        event.track.onended = () => {
          console.log('Remote track ended:', event.track.kind);
        };
        
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection.connectionState);
      
      if (this.peerConnection.connectionState === 'connected') {
        console.log('✅ Peer connection established!');
        // Process any pending ICE candidates
        this.processPendingCandidates();
      }
      
      if (this.peerConnection.connectionState === 'closed' || 
          this.peerConnection.connectionState === 'failed') {
        console.log('❌ Peer connection closed/failed');
        if (this.onCallEnded) this.onCallEnded();
      }
    };

    this.peerConnection.onnegotiationneeded = async () => {
      console.log('🔄 Negotiation needed');
      if (this.isCaller) {
        await this.createAndSendOffer();
      }
    };
  }

  addLocalTracks() {
    if (!this.peerConnection || !this.localStream) return;
    
    console.log('➕ Adding local tracks to peer connection...');
    
    this.localStream.getTracks().forEach(track => {
      console.log(`Adding ${track.kind} track:`, track.id);
      this.peerConnection.addTrack(track, this.localStream);
    });
  }

  setupDataChannel() {
    if (!this.peerConnection) return;
    
    if (this.isCaller) {
      // Caller creates the data channel
      this.dataChannel = this.peerConnection.createDataChannel('chat', {
        ordered: true,
        maxPacketLifeTime: 3000
      });
      this.setupDataChannelListeners();
    } else {
      // Callee listens for data channel
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannelListeners();
      };
    }
  }

  setupDataChannelListeners() {
    if (!this.dataChannel) return;
    
    this.dataChannel.onopen = () => {
      console.log('📨 Data channel opened');
    };
    
    this.dataChannel.onclose = () => {
      console.log('📨 Data channel closed');
    };
    
    this.dataChannel.onmessage = (event) => {
      console.log('📨 Data channel message:', event.data);
      // Handle chat messages if needed
    };
    
    this.dataChannel.onerror = (error) => {
      console.error('📨 Data channel error:', error);
    };
  }

  setupSignalingListeners() {
    if (!this.socket) return;

    // Listen for WebRTC offers
    this.socket.on('video-offer', async (data) => {
      if (data.callId === this.callId && data.from === this.partnerId && !this.isCaller) {
        console.log('📥 Received offer from partner');
        
        try {
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          
          // Add any pending ICE candidates
          this.pendingCandidates.forEach(candidate => {
            this.peerConnection.addIceCandidate(candidate);
          });
          this.pendingCandidates = [];
          
          // Create and send answer
          const answer = await this.peerConnection.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          
          await this.peerConnection.setLocalDescription(answer);
          
          this.socket.emit('video-answer', {
            answer: answer,
            callId: this.callId,
            to: this.partnerId,
            timestamp: Date.now()
          });
          
          console.log('📤 Sent answer to partner');
          
        } catch (error) {
          console.error('❌ Error handling offer:', error);
        }
      }
    });

    // Listen for WebRTC answers
    this.socket.on('video-answer', async (data) => {
      if (data.callId === this.callId && data.from === this.partnerId && this.isCaller) {
        console.log('📥 Received answer from partner');
        
        try {
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          
          // Add any pending ICE candidates
          this.pendingCandidates.forEach(candidate => {
            this.peerConnection.addIceCandidate(candidate);
          });
          this.pendingCandidates = [];
          
        } catch (error) {
          console.error('❌ Error handling answer:', error);
        }
      }
    });

    // Listen for ICE candidates
    this.socket.on('ice-candidate', async (data) => {
      if (data.callId === this.callId && data.from === this.partnerId && data.candidate) {
        console.log('🧊 Received ICE candidate from partner');
        
        const candidate = new RTCIceCandidate(data.candidate);
        
        // If connection is established, add candidate immediately
        if (this.peerConnection.remoteDescription) {
          try {
            await this.peerConnection.addIceCandidate(candidate);
          } catch (error) {
            console.error('❌ Error adding ICE candidate:', error);
          }
        } else {
          // Store candidate for later
          this.pendingCandidates.push(candidate);
        }
      }
    });

    // Listen for call ended
    this.socket.on('video-call-ended', (data) => {
      if (data.callId === this.callId) {
        console.log('📞 Call ended by partner');
        this.cleanup();
        if (this.onCallEnded) {
          this.onCallEnded();
        }
      }
    });
  }

  async createAndSendOffer() {
    if (!this.peerConnection) return;
    
    try {
      console.log('📤 Creating offer...');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: false
      });
      
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('video-offer', {
        offer: offer,
        callId: this.callId,
        to: this.partnerId,
        timestamp: Date.now()
      });
      
      console.log('📤 Offer sent to partner');
      
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  processPendingCandidates() {
    if (this.pendingCandidates.length > 0) {
      console.log(`📝 Processing ${this.pendingCandidates.length} pending ICE candidates`);
      
      this.pendingCandidates.forEach(async (candidate) => {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('❌ Error adding pending ICE candidate:', error);
        }
      });
      
      this.pendingCandidates = [];
    }
  }

  startStatsCollection() {
    this.statsInterval = setInterval(async () => {
      if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
        try {
          const stats = await this.peerConnection.getStats();
          let bitrate = 0;
          let packetLoss = 0;

          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              if (report.bytesReceived && report.timestamp) {
                const timeDiff = report.timestamp - (report.lastTimestamp || report.timestamp);
                const bytesDiff = report.bytesReceived - (report.lastBytesReceived || report.bytesReceived);
                if (timeDiff > 0) {
                  bitrate = (bytesDiff * 8) / (timeDiff / 1000);
                }
              }
              
              if (report.packetsLost !== undefined && report.packetsReceived !== undefined) {
                const totalPackets = report.packetsLost + report.packetsReceived;
                if (totalPackets > 0) {
                  packetLoss = (report.packetsLost / totalPackets) * 100;
                }
              }
            }
          });

          const connectionQuality = packetLoss > 10 ? 'poor' : packetLoss > 5 ? 'fair' : 'good';
          
          const statsData = { bitrate, packetLoss, connectionQuality };
          
          if (this.onStatsUpdate) {
            this.onStatsUpdate(statsData);
          }
          
        } catch (error) {
          console.error('Error collecting stats:', error);
        }
      }
    }, 2000);
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      if (this.onCallEnded) this.onCallEnded();
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.cleanup();
      this.initialize().catch(error => {
        console.error('❌ Reconnection failed:', error);
      });
    }, 2000);
  }

  cleanup() {
    console.log('🧹 Cleaning up WebRTC resources...');
    
    // Clear stats interval
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    // Clean up remote stream
    if (this.remoteStream) {
      this.remoteStream = null;
    }
    
    // Clean up data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    // Clear pending candidates
    this.pendingCandidates = [];
    
    // Remove socket listeners
    if (this.socket) {
      this.socket.off('video-offer');
      this.socket.off('video-answer');
      this.socket.off('ice-candidate');
      this.socket.off('video-call-ended');
    }
    
    this.reconnectAttempts = 0;
  }

  // Public methods
  toggleAudio(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
      return !muted;
    }
    return false;
  }

  toggleVideo(videoOff) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoOff;
      });
      return !videoOff;
    }
    return false;
  }

  sendChatMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify({
          type: 'chat',
          message: message,
          timestamp: Date.now(),
          sender: this.userProfile?.username || 'User'
        }));
        return true;
      } catch (error) {
        console.error('❌ Error sending message via data channel:', error);
        return false;
      }
    }
    return false;
  }

  endCall() {
    console.log('📞 Ending WebRTC call');
    
    if (this.socket) {
      this.socket.emit('video-call-end', {
        callId: this.callId,
        reason: 'user_ended',
        timestamp: Date.now()
      });
    }
    
    this.cleanup();
  }
}

export default WebRTCManager;