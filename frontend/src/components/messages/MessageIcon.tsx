import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../../services/messageService';

const MessageIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and every 10 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await messageService.getUnreadCount();
      console.log('💬 Unread message count:', data.count);
      setUnreadCount(data.count || 0);
    } catch (error: any) {
      console.error('❌ Error fetching unread message count:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  return (
    <div className="relative">
      <Link 
        to="/messages" 
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition inline-flex items-center"
        aria-label="Messages"
        title={`Messages ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-green-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default MessageIcon;
