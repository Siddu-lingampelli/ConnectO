import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Initialize socket connection
  connect(token: string) {
    if (this.socket?.connected) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Setup default event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnecting... Attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect', () => {
      console.log('✅ Socket reconnected');
    });
  }

  // Emit event
  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Listen to event
  on(event: string, callback: Function) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Register socket listener
    this.socket.on(event, (...args: any[]) => callback(...args));
  }

  // Remove listener
  off(event: string, callback?: Function) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);
      
      // Remove from stored listeners
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    } else {
      // Remove all listeners for this event
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // ============ CALL EVENTS ============

  // Listen for incoming video call
  onIncomingVideoCall(callback: (data: {
    callId: string;
    chatId: string;
    caller: { id: string; name: string; avatar?: string };
    roomId: string;
  }) => void) {
    this.on('incoming_video_call', callback);
  }

  // Listen for incoming voice call
  onIncomingVoiceCall(callback: (data: {
    callId: string;
    chatId: string;
    caller: { id: string; name: string; avatar?: string };
    roomId: string;
  }) => void) {
    this.on('incoming_voice_call', callback);
  }

  // Listen for incoming screen share
  onIncomingScreenShare(callback: (data: {
    sessionId: string;
    chatId: string;
    sharer: { id: string; name: string; avatar?: string };
  }) => void) {
    this.on('incoming_screen_share', callback);
  }

  // Listen for call accepted
  onCallAccepted(callback: (data: {
    callId: string;
    participantId: string;
    participantName: string;
  }) => void) {
    this.on('call_accepted', callback);
  }

  // Listen for call declined
  onCallDeclined(callback: (data: {
    callId: string;
    reason?: string;
  }) => void) {
    this.on('call_declined', callback);
  }

  // Listen for call ended
  onCallEnded(callback: (data: {
    callId: string;
    endedBy: string;
    duration: number;
  }) => void) {
    this.on('call_ended', callback);
  }

  // Listen for participant joined
  onParticipantJoined(callback: (data: {
    callId: string;
    participant: { id: string; name: string; avatar?: string };
  }) => void) {
    this.on('participant_joined', callback);
  }

  // Listen for participant left
  onParticipantLeft(callback: (data: {
    callId: string;
    participantId: string;
  }) => void) {
    this.on('participant_left', callback);
  }

  // ============ WEBRTC SIGNALING ============

  // Send WebRTC offer
  sendOffer(data: {
    callId: string;
    targetUserId: string;
    offer: RTCSessionDescriptionInit;
  }) {
    this.emit('webrtc_offer', data);
  }

  // Listen for WebRTC offer
  onOffer(callback: (data: {
    callId: string;
    fromUserId: string;
    offer: RTCSessionDescriptionInit;
  }) => void) {
    this.on('webrtc_offer', callback);
  }

  // Send WebRTC answer
  sendAnswer(data: {
    callId: string;
    targetUserId: string;
    answer: RTCSessionDescriptionInit;
  }) {
    this.emit('webrtc_answer', data);
  }

  // Listen for WebRTC answer
  onAnswer(callback: (data: {
    callId: string;
    fromUserId: string;
    answer: RTCSessionDescriptionInit;
  }) => void) {
    this.on('webrtc_answer', callback);
  }

  // Send ICE candidate
  sendIceCandidate(data: {
    callId: string;
    targetUserId: string;
    candidate: RTCIceCandidateInit;
  }) {
    this.emit('ice_candidate', data);
  }

  // Listen for ICE candidate
  onIceCandidate(callback: (data: {
    callId: string;
    fromUserId: string;
    candidate: RTCIceCandidateInit;
  }) => void) {
    this.on('ice_candidate', callback);
  }

  // ============ MESSAGE EVENTS ============

  // Listen for new message
  onNewMessage(callback: (message: any) => void) {
    this.on('new_message', callback);
  }

  // Listen for typing indicator
  onUserTyping(callback: (data: { chatId: string; userId: string; userName: string }) => void) {
    this.on('user_typing', callback);
  }

  // Send typing indicator
  sendTyping(chatId: string) {
    this.emit('typing', { chatId });
  }

  // Stop typing indicator
  sendStopTyping(chatId: string) {
    this.emit('stop_typing', { chatId });
  }

  // ============ NOTIFICATION EVENTS ============

  // Listen for notifications
  onNotification(callback: (notification: any) => void) {
    this.on('notification', callback);
  }

  // Mark notification as read
  markNotificationRead(notificationId: string) {
    this.emit('mark_notification_read', { notificationId });
  }

  // ============ USER STATUS ============

  // Listen for user online/offline
  onUserStatusChange(callback: (data: { userId: string; status: 'online' | 'offline' }) => void) {
    this.on('user_status_change', callback);
  }

  // Update own status
  updateStatus(status: 'online' | 'offline' | 'busy') {
    this.emit('update_status', { status });
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
