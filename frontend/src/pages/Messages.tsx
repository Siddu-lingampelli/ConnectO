import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { messageService, type Conversation } from '../services/messageService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const currentUser = useSelector(selectCurrentUser);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-select conversation from URL param
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [searchParams]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    
    // Auto-refresh conversations every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleNewMessage = () => {
    // Refresh conversations when a new message is sent
    loadConversations();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to view messages.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Conversation List - Left Side */}
            <div className="w-1/3 border-r border-gray-200">
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUserId}
                currentUserId={currentUser.id}
                onSelectConversation={handleSelectConversation}
                loading={loading}
              />
            </div>

            {/* Chat Window - Right Side */}
            <div className="flex-1">
              {selectedUserId ? (
                <ChatWindow
                  otherUserId={selectedUserId}
                  currentUser={currentUser}
                  onNewMessage={handleNewMessage}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-5xl">💬</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a Conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a conversation from the left to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
