import socketService from './socketService';

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private remoteUserId: string | null = null;

  // ICE servers configuration
  private iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ]
  };

  // Initialize WebRTC connection
  async initialize(callId: string, remoteUserId: string, isInitiator: boolean) {
    this.callId = callId;
    this.remoteUserId = remoteUserId;

    // Create peer connection
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Setup event listeners
    this.setupPeerConnectionListeners();

    // Setup socket signaling
    this.setupSignaling();

    if (isInitiator) {
      // Create and send offer
      await this.createOffer();
    }
  }

  // Get user media (camera and microphone)
  async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add tracks to peer connection
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw error;
    }
  }

  // Get display media (screen share)
  async getDisplayMedia(): Promise<MediaStream> {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track
      if (this.peerConnection && this.localStream) {
        const videoTrack = displayStream.getVideoTracks()[0];
        const sender = this.peerConnection
          .getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }

      return displayStream;
    } catch (error) {
      console.error('Failed to get display media:', error);
      throw error;
    }
  }

  // Setup peer connection event listeners
  private setupPeerConnectionListeners() {
    if (!this.peerConnection) return;

    // ICE candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.callId && this.remoteUserId) {
        socketService.sendIceCandidate({
          callId: this.callId,
          targetUserId: this.remoteUserId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    // Track event (receive remote stream)
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      this.remoteStream.addTrack(event.track);
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      
      if (this.peerConnection?.connectionState === 'failed') {
        console.error('WebRTC connection failed');
        // Attempt to reconnect
        this.restart();
      }
    };

    // ICE connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };
  }

  // Setup socket signaling
  private setupSignaling() {
    // Listen for offer
    socketService.onOffer(async (data) => {
      if (data.callId === this.callId) {
        await this.handleOffer(data.offer);
      }
    });

    // Listen for answer
    socketService.onAnswer(async (data) => {
      if (data.callId === this.callId) {
        await this.handleAnswer(data.answer);
      }
    });

    // Listen for ICE candidate
    socketService.onIceCandidate(async (data) => {
      if (data.callId === this.callId) {
        await this.handleIceCandidate(data.candidate);
      }
    });
  }

  // Create and send offer
  private async createOffer() {
    if (!this.peerConnection || !this.callId || !this.remoteUserId) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      socketService.sendOffer({
        callId: this.callId,
        targetUserId: this.remoteUserId,
        offer: offer
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }

  // Handle incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      if (this.callId && this.remoteUserId) {
        socketService.sendAnswer({
          callId: this.callId,
          targetUserId: this.remoteUserId,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }

  // Toggle audio mute
  toggleAudio(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  // Toggle video
  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Restart connection
  private async restart() {
    console.log('Restarting WebRTC connection...');
    // Implement connection restart logic if needed
  }

  // Close connection and cleanup
  close() {
    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.remoteUserId = null;

    console.log('WebRTC connection closed');
  }
}

export default WebRTCService;
