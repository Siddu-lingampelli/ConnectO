import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, type Notification } from '../services/notificationService';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [currentPage, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({
        page: currentPage,
        limit: 20,
        unreadOnly: filter === 'unread',
      });
      setNotifications(data.notifications);
      setTotalPages(data.pagination.pages);
      setUnreadCount(data.pagination.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id ? { ...n, read: true } : n))
        );
      }

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationService.clearReadNotifications();
      await loadNotifications();
      toast.success('Read notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], string> = {
      profile_incomplete: '📝',
      demo_assigned: '🎯',
      demo_pending: '⏰',
      demo_reviewed: '📊',
      demo_verified: '✅',
      demo_rejected: '❌',
      proposal_received: '📨',
      proposal_accepted: '🎉',
      proposal_rejected: '📋',
      message_received: '💬',
      job_posted: '💼',
      job_completed: '✅',
      payment_received: '💰',
      review_received: '⭐',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const badges = {
      low: <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">Low</span>,
      normal: <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">Normal</span>,
      high: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">High</span>,
      urgent: <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Urgent</span>,
    };
    return badges[priority];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notifications</p>
            )}
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Mark all read
              </button>
            )}
            {notifications.some(n => n.read) && (
              <button
                onClick={handleClearRead}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            className={`pb-3 px-1 font-medium text-sm transition ${
              filter === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setCurrentPage(1);
            }}
            className={`pb-3 px-1 font-medium text-sm transition ${
              filter === 'unread'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-lg shadow-md p-5 cursor-pointer transition hover:shadow-lg ${
                !notification.read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-semibold text-gray-900 ${
                          !notification.read ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        <span>•</span>
                        {getPriorityBadge(notification.priority)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="text-gray-400 hover:text-red-600 transition ml-4"
                      aria-label="Delete notification"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Action Button */}
                  {notification.actionUrl && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
