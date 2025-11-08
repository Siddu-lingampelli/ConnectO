import { useState, useEffect, useRef } from 'react';
import { Video, Phone, ScreenShare } from 'lucide-react';
import { toast } from 'react-toastify';
import { messageService, type Message, type UserStatus, type FileAttachment } from '../../services/messageService';
import { userService } from '../../services/userService';
import socketService from '../../services/socketService';
import type { User } from '../../types';

interface ChatWindowProps {
  otherUserId: string;
  currentUser: User;
  onNewMessage: () => void;
}

interface IncomingCall {
  callId: string;
  type: 'video' | 'voice';
  caller: {
    id: string;
    name: string;
    avatar?: string;
  };
  roomId?: string;
}

const ChatWindow = ({ otherUserId, currentUser, onNewMessage }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'voice' | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Call button handlers
  const handleVideoCall = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Generate unique call ID
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const roomId = `room_${callId}`;
      
      setIsInCall(true);
      setCallType('video');
      setActiveCallId(callId);
      
      // Emit video call event via Socket.io (matching backend expected format)
      socketService.emit('initiate_video_call', {
        callId,
        roomId,
        recipientId: otherUserId,
        chatId: `chat_${currentUser.id || currentUser._id}_${otherUserId}`,
        callerAvatar: currentUser.profilePicture
      });

      toast.success('📹 Calling ' + (otherUser?.fullName || 'user') + '...', {
        position: 'top-center',
        autoClose: 2000,
      });

      console.log('📹 Video call initiated:', { callId, recipientId: otherUserId });
    } catch (error: any) {
      console.error('Failed to start video call:', error);
      toast.error('Could not access camera/microphone. Please check permissions.', {
        position: 'top-center',
      });
    }
  };

  const handleVoiceCall = async () => {
    try {
      // Request microphone permission only
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      // Generate unique call ID
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const roomId = `room_${callId}`;
      
      setIsInCall(true);
      setCallType('voice');
      setActiveCallId(callId);
      
      // Emit voice call event via Socket.io (matching backend expected format)
      socketService.emit('initiate_voice_call', {
        callId,
        roomId,
        recipientId: otherUserId,
        chatId: `chat_${currentUser.id || currentUser._id}_${otherUserId}`,
        callerAvatar: currentUser.profilePicture
      });

      toast.success('📞 Calling ' + (otherUser?.fullName || 'user') + '...', {
        position: 'top-center',
        autoClose: 2000,
      });

      console.log('📞 Voice call initiated:', { callId, recipientId: otherUserId });
    } catch (error: any) {
      console.error('Failed to start voice call:', error);
      toast.error('Could not access microphone. Please check permissions.', {
        position: 'top-center',
      });
    }
  };

  const handleScreenShare = () => {
    toast.info('�️ Screen sharing will be available in the next update. Stay tuned!', {
      position: 'top-center',
      autoClose: 3000,
    });
  };

  const handleEndCall = () => {
    // Emit end call event (matching backend expected format)
    if (activeCallId) {
      socketService.emit('end_call', {
        callId: activeCallId,
        participantIds: [otherUserId], // Notify the other user
        duration: 0
      });
    }

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsInCall(false);
    setCallType(null);
    setActiveCallId(null);
    setCallerId(null);
    
    toast.info('Call ended', {
      position: 'top-center',
      autoClose: 2000,
    });

    console.log('🔚 Call ended by user');
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      // Request media permissions based on call type
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: incomingCall.type === 'video', 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Emit accept call event (matching backend expected format)
      socketService.emit('accept_call', {
        callId: incomingCall.callId,
        callerId: callerId // Send back to the caller
      });

      setIsInCall(true);
      setCallType(incomingCall.type);
      setActiveCallId(incomingCall.callId);
      setIncomingCall(null);
      
      toast.success('Call accepted!', {
        position: 'top-center',
        autoClose: 2000,
      });

      console.log('✅ Call accepted:', incomingCall.callId);
    } catch (error: any) {
      console.error('Failed to accept call:', error);
      toast.error('Could not access camera/microphone.', {
        position: 'top-center',
      });
      handleDeclineCall();
    }
  };

  const handleDeclineCall = () => {
    if (!incomingCall) return;
    
    // Emit decline call event (matching backend expected format)
    socketService.emit('decline_call', {
      callId: incomingCall.callId,
      callerId: callerId,
      reason: 'User declined'
    });
    
    toast.info('Call declined', {
      position: 'top-center',
      autoClose: 2000,
    });
    
    setIncomingCall(null);
    setCallerId(null);
    console.log('❌ Call declined:', incomingCall.callId);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load other user's info
  useEffect(() => {
    const loadOtherUser = async () => {
      try {
        const user = await userService.getUserById(otherUserId);
        setOtherUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Failed to load user info');
      }
    };
    loadOtherUser();
  }, [otherUserId]);

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessages(otherUserId);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Auto-refresh messages every 3 seconds for live updates
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  // Update online status on mount/unmount
  useEffect(() => {
    messageService.updateOnlineStatus(true).catch(console.error);
    
    return () => {
      messageService.updateOnlineStatus(false).catch(console.error);
    };
  }, []);

  // Poll for user status (online/typing)
  useEffect(() => {
    const loadUserStatus = async () => {
      try {
        const status = await messageService.getUserStatus(otherUserId);
        setUserStatus(status);
      } catch (error) {
        console.error('Error loading user status:', error);
      }
    };

    loadUserStatus();
    const interval = setInterval(loadUserStatus, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [otherUserId]);

  // Socket.io integration for real-time call signaling
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, Socket.io not connecting');
      return;
    }

    try {
      // Connect socket
      socketService.connect(token);
      console.log('🔌 Attempting Socket.io connection...');

      // Listen for incoming video calls
      socketService.onIncomingVideoCall((data) => {
        console.log('📹 Incoming video call:', data);
        setIncomingCall({
          callId: data.callId,
          type: 'video',
          caller: data.caller,
          roomId: data.roomId
        });
        setCallerId(data.caller.id);
      });

      // Listen for incoming voice calls
      socketService.onIncomingVoiceCall((data) => {
        console.log('📞 Incoming voice call:', data);
        setIncomingCall({
          callId: data.callId,
          type: 'voice',
          caller: data.caller,
          roomId: data.roomId
        });
        setCallerId(data.caller.id);
      });

      // Listen for call accepted
      socketService.onCallAccepted((data) => {
        console.log('✅ Call accepted:', data);
        toast.success(`${data.participantName} accepted the call!`, {
          position: 'top-center',
          autoClose: 2000,
        });
      });

      // Listen for call declined
      socketService.onCallDeclined((data) => {
        console.log('❌ Call declined:', data);
        toast.error('Call was declined', {
          position: 'top-center',
          autoClose: 2000,
        });
        handleEndCall();
      });

      // Listen for call ended
      socketService.onCallEnded((data) => {
        console.log('🔚 Call ended:', data);
        handleEndCall();
      });
    } catch (error) {
      console.error('❌ Socket.io connection error:', error);
    }

    return () => {
      try {
        // Cleanup socket listeners on unmount
        socketService.off('incoming_video_call');
        socketService.off('incoming_voice_call');
        socketService.off('call_accepted');
        socketService.off('call_declined');
        socketService.off('call_ended');
        console.log('🧹 Socket listeners cleaned up');
      } catch (error) {
        console.error('Error cleaning up socket listeners:', error);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle typing indicator
  const handleTyping = () => {
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    messageService.updateTypingStatus(otherUserId, true).catch(console.error);

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      messageService.updateTypingStatus(otherUserId, false).catch(console.error);
    }, 2000);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (10MB max)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending) return;

    try {
      setSending(true);
      setUploadingFiles(true);
      
      // Upload files first if any
      let attachments: FileAttachment[] = [];
      if (selectedFiles.length > 0) {
        toast.info('Uploading files...');
        attachments = await Promise.all(
          selectedFiles.map(file => messageService.uploadFile(file))
        );
      }

      // Send message with attachments
      const message = await messageService.sendMessage(
        otherUserId, 
        newMessage.trim() || '📎 Attachment', 
        'text',
        attachments.length > 0 ? attachments : undefined
      );
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await messageService.updateTypingStatus(otherUserId, false);
      
      // Add message to local state immediately
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setSelectedFiles([]);
      scrollToBottom();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent to refresh conversations
      onNewMessage();
      
      toast.success('Message sent!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
      setUploadingFiles(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                {incomingCall.caller.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {incomingCall.caller.name || 'Unknown User'}
              </h3>
              <p className="text-gray-600 mb-6">
                {incomingCall.type === 'video' ? '📹 Incoming Video Call' : '📞 Incoming Voice Call'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeclineCall}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Interface */}
      {isInCall && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          {/* Call Header */}
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-semibold">{otherUser?.fullName}</h3>
              <p className="text-sm text-gray-300">
                {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
              </p>
            </div>
            <button
              onClick={handleEndCall}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              End Call
            </button>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative bg-black">
            {callType === 'video' ? (
              <>
                {/* Remote Video (Full Screen) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              /* Voice Call UI */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-5xl font-bold">
                    {otherUser?.fullName?.charAt(0).toUpperCase() || otherUser?.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {otherUser?.fullName || otherUser?.email || 'Unknown User'}
                  </h3>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-300">Connected</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="bg-gray-800 p-6 flex justify-center space-x-4">
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            {callType === 'video' && (
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* Avatar with online status */}
          <div className="relative">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser?.fullName || otherUser?.email || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {otherUser?.fullName?.charAt(0).toUpperCase() || otherUser?.email?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            {/* Online status indicator */}
            {userStatus?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{otherUser?.fullName || otherUser?.email || 'Unknown User'}</h3>
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Online/Last Seen Status */}
              {userStatus?.isOnline ? (
                <span className="text-xs text-green-600 font-medium">● Online</span>
              ) : userStatus?.lastSeen ? (
                <span className="text-xs text-gray-500">
                  Last seen {new Date(userStatus.lastSeen).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              ) : null}
              
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                otherUser.role === 'provider'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {otherUser.role === 'provider' ? '🔧 Provider' : '👤 Client'}
              </span>
              {otherUser.city && (
                <span className="text-xs text-gray-500">📍 {otherUser.city}</span>
              )}
            </div>
          </div>

          {/* Live indicator + Call Buttons */}
          <div className="flex items-center space-x-2">
            {/* Video Call Button */}
            <button
              onClick={handleVideoCall}
              className="p-2 hover:bg-emerald-50 rounded-full transition-colors group"
              title="Start Video Call"
            >
              <Video className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </button>

            {/* Voice Call Button */}
            <button
              onClick={handleVoiceCall}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors group"
              title="Start Voice Call"
            >
              <Phone className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>

            {/* Screen Share Button */}
            <button
              onClick={handleScreenShare}
              className="p-2 hover:bg-purple-50 rounded-full transition-colors group"
              title="Share Screen"
            >
              <ScreenShare className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            </button>

            {/* Live indicator */}
            <div className="flex items-center space-x-1 ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>
        
        {/* Typing Indicator */}
        {userStatus?.isTyping && (
          <div className="mt-2 text-sm text-gray-600 italic flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>{(otherUser?.fullName || otherUser?.email || 'User').split(' ')[0]} is typing...</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Divider */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {date}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                  {dateMessages.map((message) => {
                    const isCurrentUser = 
                      message.sender.id === currentUser.id || 
                      message.sender._id === currentUser.id;

                    return (
                      <div
                        key={message.id || message._id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          } rounded-lg px-4 py-2 shadow-sm`}
                        >
                          {/* Message Content */}
                          {message.content && (
                            <p className="break-words">{message.content}</p>
                          )}
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className={`space-y-2 ${message.content ? 'mt-2' : ''}`}>
                              {message.attachments.map((attachment, idx) => {
                                const isImage = attachment.mimetype?.startsWith('image/');
                                const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${attachment.url}`;
                                
                                return (
                                  <div key={idx} className={`${isCurrentUser ? 'bg-blue-700' : 'bg-gray-50'} rounded-lg p-2`}>
                                    {isImage ? (
                                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={fileUrl}
                                          alt={attachment.originalName}
                                          className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                                          style={{ maxHeight: '300px' }}
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center space-x-2 ${
                                          isCurrentUser ? 'text-white' : 'text-blue-600'
                                        } hover:underline`}
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="text-sm">
                                          <div className="font-medium">{attachment.originalName}</div>
                                          <div className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                            {(attachment.size / 1024).toFixed(1)} KB
                                          </div>
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className={`flex items-center justify-end space-x-2 mt-1`}>
                            <span
                              className={`text-xs ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-blue-100">
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex space-x-3">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploadingFiles}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Attach files"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending || uploadingFiles}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || uploadingFiles}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {uploadingFiles ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Messages update automatically • Max file size: 10MB
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
