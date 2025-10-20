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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending', icon: '⏳' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🔨 In Progress', icon: '🔨' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Completed', icon: '✅' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Cancelled', icon: '❌' },
      disputed: { bg: 'bg-orange-100', text: 'text-orange-800', label: '⚠️ Disputed', icon: '⚠️' }
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
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: '💰 Payment Pending' },
      paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: '💳 Paid' },
      released: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Payment Released' },
      refunded: { bg: 'bg-red-100', text: 'text-red-800', label: '↩️ Refunded' }
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This page is only for service providers.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your ongoing work</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-md p-4 border border-yellow-200">
              <div className="text-sm text-yellow-700 mb-1">⏳ Pending</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-md p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">🔨 In Progress</div>
              <div className="text-2xl font-bold text-blue-900">{stats.in_progress}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-md p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">✅ Completed</div>
              <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-md p-4 text-white">
              <div className="text-sm opacity-90 mb-1">💰 Total Earnings</div>
              <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-2 mb-6">
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: '⏳ Pending' },
                { value: 'in_progress', label: '🔨 In Progress' },
                { value: 'completed', label: '✅ Completed' },
                { value: 'cancelled', label: '❌ Cancelled' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Start applying to jobs to get your first order!</p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                  <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {job?.title || 'Job Title'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.payment?.status || 'pending')}
                            {job && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                {job.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">
                            ₹{order.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Project Amount</div>
                        </div>
                      </div>

                      {/* Client Info */}
                      {client && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                                <p className="font-semibold text-gray-900">{client.fullName}</p>
                                <div className="flex items-center text-sm text-gray-600">
                                  {client.city && <span>📍 {client.city}</span>}
                                  {client.rating && (
                                    <span className="ml-3">⭐ {client.rating.toFixed(1)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/messages?userId=${typeof order.client === 'string' ? order.client : client._id}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              💬 Message Client
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-gray-600">Started</div>
                          <div className="font-semibold text-gray-900">
                            {order.startDate ? formatDate(order.startDate) : 'Not started'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Deadline</div>
                          <div className="font-semibold text-gray-900">
                            {formatDate(order.deadline)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Completed</div>
                          <div className="font-semibold text-gray-900">
                            {order.completedDate ? formatDate(order.completedDate) : 'Not completed'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStartWork(order._id)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            🚀 Start Work
                          </button>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => handleMarkComplete(order._id)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            ✅ Mark as Completed
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
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
