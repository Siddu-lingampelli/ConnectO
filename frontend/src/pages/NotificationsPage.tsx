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
      low: <span className="px-2 py-1 bg-[#E3EFD3] text-[#6B8F71] rounded-full text-xs font-semibold">Low</span>,
      normal: <span className="px-2 py-1 bg-gradient-to-r from-[#AEC3B0] to-[#E3EFD3] text-[#345635] rounded-full text-xs font-semibold">Normal</span>,
      high: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">High</span>,
      urgent: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Urgent</span>,
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
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[#345635] hover:text-[#0D2B1D] transition-colors group"
              title="Go back"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#0D2B1D]">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-[#6B8F71] mt-1 font-medium">{unreadCount} unread notifications</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-5 py-2.5 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all text-sm font-semibold hover:scale-105"
              >
                Mark all read
              </button>
            )}
            {notifications.some(n => n.read) && (
              <button
                onClick={handleClearRead}
                className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all text-sm font-semibold hover:scale-105"
              >
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 border-b-2 border-[#AEC3B0]">
          <button
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            className={`pb-3 px-1 font-semibold text-sm transition ${
              filter === 'all'
                ? 'border-b-2 border-[#345635] text-[#345635]'
                : 'text-[#6B8F71] hover:text-[#345635]'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setCurrentPage(1);
            }}
            className={`pb-3 px-1 font-semibold text-sm transition ${
              filter === 'unread'
                ? 'border-b-2 border-[#345635] text-[#345635]'
                : 'text-[#6B8F71] hover:text-[#345635]'
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
            <p className="text-[#6B8F71] font-medium">Loading notifications...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-6xl">🔔</span>
          </div>
          <h3 className="text-2xl font-bold text-[#0D2B1D] mb-2">No notifications</h3>
          <p className="text-[#6B8F71]">
            {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-2xl shadow-lg p-5 cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] ${
                !notification.read ? 'border-l-4 border-[#345635]' : 'border-2 border-[#AEC3B0]'
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#345635] to-[#6B8F71] flex items-center justify-center text-2xl shadow-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-semibold text-[#0D2B1D] ${
                          !notification.read ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2.5 h-2.5 bg-[#345635] rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-[#345635] mb-2">{notification.message}</p>
                      <div className="flex items-center gap-3 text-xs text-[#6B8F71] font-medium">
                        <span>{formatDate(notification.createdAt)}</span>
                        <span>•</span>
                        {getPriorityBadge(notification.priority)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="text-[#6B8F71] hover:text-red-600 transition-all ml-4 hover:scale-110"
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
                    <button className="mt-2 text-sm text-[#345635] hover:text-[#0D2B1D] font-semibold flex items-center gap-1 group">
                      View Details
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold hover:scale-105"
          >
            Previous
          </button>
          <span className="px-5 py-2.5 text-[#0D2B1D] font-bold bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-xl">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold hover:scale-105"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
