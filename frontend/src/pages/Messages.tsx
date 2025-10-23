import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3]">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-[#6B8F71] text-lg font-medium">Please login to view messages.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Back Button & Header - Emerald Theme */}
        <div className="mb-6 animate-fade-in-up">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#345635] hover:text-[#0D2B1D] mb-4 transition-all hover:scale-105 group font-medium"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💬</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#0D2B1D]">Messages</h1>
              <p className="text-[#6B8F71] text-lg">Connect with clients and service providers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#E3EFD3] animate-fade-in-up" style={{ height: 'calc(100vh - 280px)', animationDelay: '100ms' }}>
          <div className="flex h-full">
            {/* Conversation List - Left Side - Emerald Theme */}
            <div className="w-1/3 border-r-2 border-[#E3EFD3] bg-gradient-to-b from-[#F8FBF9] to-white">
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUserId}
                currentUserId={currentUser.id}
                onSelectConversation={handleSelectConversation}
                loading={loading}
              />
            </div>

            {/* Chat Window - Right Side - Emerald Theme */}
            <div className="flex-1 bg-white">
              {selectedUserId ? (
                <ChatWindow
                  otherUserId={selectedUserId}
                  currentUser={currentUser}
                  onNewMessage={handleNewMessage}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#F8FBF9] to-white">
                  <div className="text-center animate-fade-in-up">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl animate-pulse-soft">
                      <span className="text-7xl">💬</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                      Select a Conversation
                    </h3>
                    <p className="text-[#6B8F71] text-lg">
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
