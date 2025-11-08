import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white rounded-2xl shadow-soft border border-border max-w-md"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-text-primary text-lg font-medium">Please login to view messages.</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button & Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 text-text-primary hover:text-primary mb-4 transition-colors group font-medium"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </motion.button>

            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-soft"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-text-primary">Messages</h1>
                <p className="text-text-secondary text-lg">Connect with clients and service providers</p>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-medium overflow-hidden border border-border" style={{ height: 'calc(100vh - 280px)' }}>
            <div className="flex h-full">
              {/* Conversation List - Left Side */}
              <div className="w-1/3 border-r border-border bg-surface">
                <ConversationList
                  conversations={conversations}
                  selectedUserId={selectedUserId}
                  currentUserId={(currentUser.id || currentUser._id) as string}
                  onSelectConversation={handleSelectConversation}
                  loading={loading}
                />
              </div>

              {/* Chat Window - Right Side */}
              <div className="flex-1 bg-white">
                {selectedUserId ? (
                  <ChatWindow
                    otherUserId={selectedUserId}
                    currentUser={currentUser}
                    onNewMessage={handleNewMessage}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-surface">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-32 h-32 bg-primary/10 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary mb-3">
                        Select a Conversation
                      </h3>
                      <p className="text-text-secondary text-lg">
                        Choose a conversation from the left to start messaging
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;

