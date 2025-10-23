import { useState, useEffect } from 'react';
import { type Conversation, messageService, type UserStatus } from '../../services/messageService';

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  currentUserId: string;
  onSelectConversation: (userId: string) => void;
  loading: boolean;
}

const ConversationList = ({
  conversations,
  selectedUserId,
  currentUserId,
  onSelectConversation,
  loading
}: ConversationListProps) => {
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUserId && p._id !== currentUserId);
  };

  // Load online statuses for all users
  useEffect(() => {
    const loadStatuses = async () => {
      const statuses: Record<string, UserStatus> = {};
      
      for (const conversation of conversations) {
        const otherUser = getOtherParticipant(conversation);
        if (otherUser) {
          try {
            const userId = otherUser.id || otherUser._id!;
            const status = await messageService.getUserStatus(userId);
            statuses[userId] = status;
          } catch (error) {
            console.error('Error loading status:', error);
          }
        }
      }
      
      setUserStatuses(statuses);
    };

    if (conversations.length > 0) {
      loadStatuses();
      
      // Refresh statuses every 5 seconds
      const interval = setInterval(loadStatuses, 5000);
      return () => clearInterval(interval);
    }
  }, [conversations]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#345635] mx-auto mb-4"></div>
          <p className="text-[#6B8F71] font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Emerald Theme */}
      <div className="p-4 border-b-2 border-[#E3EFD3] bg-gradient-to-r from-[#F8FBF9] to-white">
        <h2 className="text-xl font-bold text-[#0D2B1D]">Messages</h2>
        <p className="text-sm text-[#6B8F71] font-medium">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Conversation List - Emerald Theme */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-[#345635] font-medium">No conversations yet</p>
            <p className="text-sm text-[#6B8F71] mt-2">
              Start a conversation by clicking the message button on a user's profile
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            if (!otherUser) return null;

            const isSelected = selectedUserId === otherUser.id || selectedUserId === otherUser._id;
            const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

            return (
              <div
                key={conversation.id || conversation._id}
                onClick={() => onSelectConversation(otherUser.id || otherUser._id!)}
                className={`p-4 border-b border-[#E3EFD3] cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] border-l-4 border-l-[#345635] shadow-sm'
                    : 'hover:bg-[#F8FBF9] hover:scale-102'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar with online indicator - Emerald Theme */}
                  <div className="flex-shrink-0 relative">
                    {otherUser.profilePicture ? (
                      <img
                        src={otherUser.profilePicture}
                        alt={otherUser.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#AEC3B0]"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {otherUser.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online status indicator - Emerald */}
                    {userStatuses[otherUser.id || otherUser._id!]?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#6B8F71] border-2 border-white rounded-full animate-pulse-soft"></div>
                    )}
                  </div>

                  {/* Content - Emerald Theme */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[#0D2B1D] truncate">
                        {otherUser.fullName}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-[#6B8F71] flex-shrink-0 font-medium">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#6B8F71] truncate">
                        {userStatuses[otherUser.id || otherUser._id!]?.isTyping ? (
                          <span className="italic text-[#345635] font-medium">typing...</span>
                        ) : (
                          conversation.lastMessage?.content || 'No messages yet'
                        )}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        otherUser.role === 'provider'
                          ? 'bg-[#E3EFD3] text-[#345635]'
                          : 'bg-[#AEC3B0] text-[#0D2B1D]'
                      }`}>
                        {otherUser.role === 'provider' ? '🔧 Provider' : '👤 Client'}
                      </span>
                      {otherUser.city && (
                        <span className="text-xs text-[#6B8F71]">📍 {otherUser.city}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
