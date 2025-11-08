import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const MyOrders = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    totalEarnings: 0
  });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [activeFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders(activeFilter === 'all' ? undefined : activeFilter);
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await orderService.getOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStartWork = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'in_progress');
      toast.success('Work started!');
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start work');
    }
  };

  const handleMarkComplete = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'completed');
      toast.success('Work marked as completed! Waiting for client approval.');
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as complete');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-gradient-to-r from-primary/10 to-primary/20', text: 'text-primary', label: 'Pending', icon: '' },
      in_progress: { bg: 'bg-gradient-to-r from-primary/70 to-primary/40', text: 'text-white', label: 'In Progress', icon: '' },
      completed: { bg: 'bg-primary', text: 'text-white', label: 'Completed', icon: '' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled', icon: '' },
      disputed: { bg: 'bg-warning/10', text: 'text-warning', label: 'Disputed', icon: '' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const config = {
      pending: { bg: 'bg-surface', text: 'text-text-primary', label: 'Payment Pending' },
      paid: { bg: 'bg-primary/10', text: 'text-primary', label: 'Paid' },
      released: { bg: 'bg-primary/20', text: 'text-primary', label: 'Payment Released' },
      refunded: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refunded' }
    };

    const paymentConfig = config[paymentStatus as keyof typeof config] || config.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${paymentConfig.bg} ${paymentConfig.text}`}>
        {paymentConfig.label}
      </span>
    );
  };

  if (!currentUser || currentUser.role !== 'provider') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-soft border border-border p-12">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">Access Denied</h2>
            <p className="text-text-secondary">This page is only for service providers.</p>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full"><div className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary hover:text-text-primary mb-6 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mr-4 shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-text-primary tracking-tighter">My Orders</h1>
                <p className="text-text-secondary mt-1">Track and manage your ongoing work</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-soft p-5 border border-border hover:border-primary hover:shadow-soft transition-all duration-200 ">
              <div className="text-sm text-text-secondary mb-1 font-medium">Total Orders</div>
              <div className="text-2xl font-semibold text-text-primary">{stats.total}</div>
            </div>
            <div className="bg-surface rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-200">
              <div className="text-sm text-text-secondary mb-1 font-medium">Pending</div>
              <div className="text-2xl font-semibold text-text-primary">{stats.pending}</div>
            </div>
            <div className="bg-surface rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-200">
              <div className="text-sm text-text-secondary mb-1 font-medium">In Progress</div>
              <div className="text-2xl font-semibold text-text-primary">{stats.in_progress}</div>
            </div>
            <div className="bg-surface rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-200">
              <div className="text-sm text-text-secondary mb-1 font-medium">Completed</div>
              <div className="text-2xl font-semibold text-text-primary">{stats.completed}</div>
            </div>
            <div className="bg-primary rounded-xl shadow-soft p-5 text-white hover:shadow-medium transition-all duration-200">
              <div className="text-sm opacity-90 mb-1 font-medium">Total Earnings</div>
              <div className="text-2xl font-semibold">₹{stats.totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-soft p-3 mb-8 border border-border">
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                    activeFilter === filter.value
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-primary hover:bg-primary/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">Loading orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-border p-12 text-center">
              <div className="w-28 h-28 bg-surface rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-14 h-14 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">No Orders Yet</h3>
              <p className="text-text-secondary mb-8 text-lg">Start applying to jobs to get your first order!</p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 font-semibold"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const job = typeof order.job !== 'string' ? order.job : null;
                const client = typeof order.client !== 'string' ? order.client : null;

                return (
                  <div key={order._id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-soft transition-all duration-200">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-text-primary mb-2">
                            {job?.title || 'Job Title'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.payment?.status || 'pending')}
                            {job && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {job.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-semibold text-primary">
                            ₹{order.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-text-muted">Project Amount</div>
                        </div>
                      </div>

                      {/* Client Info */}
                      {client && (
                        <div className="bg-surface rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {client.profilePicture ? (
                                  <img 
                                    src={client.profilePicture} 
                                    alt={client.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  client.fullName?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-text-primary">{client.fullName}</p>
                                <div className="flex items-center text-sm text-text-secondary gap-3">
                                  {client.city && (
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      {client.city}
                                    </span>
                                  )}
                                  {client.rating && (
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4 text-warning fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      {client.rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/messages?userId=${typeof order.client === 'string' ? order.client : client._id}`)}
                              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 text-sm font-semibold flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Message Client
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-text-secondary">Started</div>
                          <div className="font-semibold text-text-primary">
                            {order.startDate ? formatDate(order.startDate) : 'Not started'}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-secondary">Deadline</div>
                          <div className="font-semibold text-text-primary">
                            {formatDate(order.deadline)}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-secondary">Completed</div>
                          <div className="font-semibold text-text-primary">
                            {order.completedDate ? formatDate(order.completedDate) : 'Not completed'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStartWork(order._id)}
                            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 font-semibold"
                          >
                            Start Work
                          </button>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => handleMarkComplete(order._id)}
                            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 font-semibold"
                          >
                            Mark as Completed
                          </button>
                        )}

                        {order.status === 'completed' && order.payment?.status === 'released' && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <span className="text-2xl">🎉</span>
                            <span className="font-semibold">Payment Released! Great work!</span>
                          </div>
                        )}

                        {order.status === 'completed' && order.payment?.status !== 'released' && (
                          <div className="flex items-center space-x-2 text-yellow-600">
                            <span className="text-2xl">⏳</span>
                            <span className="font-semibold">Waiting for client to accept delivery</span>
                          </div>
                        )}

                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-6 py-2 border border-border rounded-xl hover:bg-surface transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div></main>
      <Footer />
    </div>
  );
};

export default MyOrders;
