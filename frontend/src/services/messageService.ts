import api from '../lib/api';

export interface Message {
  id: string;
  _id?: string;
  conversation: string;
  sender: {
    id: string;
    _id?: string;
    fullName: string;
    profilePicture?: string;
    email: string;
  };
  receiver: {
    id: string;
    _id?: string;
    fullName: string;
    profilePicture?: string;
    email: string;
  };
  content: string;
  type?: 'text' | 'file' | 'image';
  attachments?: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  _id?: string;
  participants: Array<{
    id: string;
    _id?: string;
    fullName: string;
    profilePicture?: string;
    email: string;
    role: string;
    city?: string;
  }>;
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export const messageService = {
  // Get conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<{ success: boolean; data: { conversations: Conversation[] } }>(
      '/messages/conversations'
    );
    return response.data.data.conversations;
  },

  // Get messages with a user
  getMessages: async (userId: string): Promise<Message[]> => {
    const response = await api.get<{ success: boolean; data: { messages: Message[] } }>(
      `/messages/conversation/${userId}`
    );
    return response.data.data.messages;
  },

  // Send message
  sendMessage: async (receiverId: string, content: string, type = 'text'): Promise<Message> => {
    const response = await api.post<{ success: boolean; data: { message: Message } }>(
      '/messages/send',
      {
        receiverId,
        content,
        type,
      }
    );
    return response.data.data.message;
  },

  // Mark as read
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.put(`/messages/read/${conversationId}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: { count: number } }>(
      '/messages/unread'
    );
    return response.data.data.count;
  },
};
