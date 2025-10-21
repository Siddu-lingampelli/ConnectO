import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { messageService, type Message, type UserStatus, type FileAttachment } from '../../services/messageService';
import { userService } from '../../services/userService';
import type { User } from '../../types';

interface ChatWindowProps {
  otherUserId: string;
  currentUser: User;
  onNewMessage: () => void;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* Avatar with online status */}
          <div className="relative">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {otherUser.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online status indicator */}
            {userStatus?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
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

          {/* Live indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
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
            <span>{otherUser.fullName.split(' ')[0]} is typing...</span>
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
