import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import RehireButton from '../components/rehire/RehireButton';

const OngoingJobs = () => {
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

  const handleAcceptDelivery = async (orderId: string) => {
    if (!confirm('Are you sure you want to accept this delivery and release payment to the provider?')) {
      return;
    }

    try {
      await orderService.acceptDelivery(orderId);
      toast.success('Delivery accepted! Payment released to provider.');
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await orderService.cancelOrder(orderId, reason);
      toast.success('Order cancelled successfully');
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
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
      pending: { bg: 'bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0]', text: 'text-[#345635]', label: '⏳ Pending Start', icon: '⏳' },
      in_progress: { bg: 'bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0]', text: 'text-white', label: '🔨 In Progress', icon: '🔨' },
      completed: { bg: 'bg-gradient-to-r from-[#345635] to-[#6B8F71]', text: 'text-white', label: '✅ Completed', icon: '✅' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: '❌ Cancelled', icon: '❌' },
      disputed: { bg: 'bg-orange-100', text: 'text-orange-800', label: '⚠️ Disputed', icon: '⚠️' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text} shadow-md`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const config = {
      pending: { bg: 'bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0]', text: 'text-[#345635]', label: '💰 Payment Pending' },
      paid: { bg: 'bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0]', text: 'text-white', label: '💳 Escrowed' },
      released: { bg: 'bg-gradient-to-r from-[#345635] to-[#6B8F71]', text: 'text-white', label: '✅ Paid to Provider' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: '↩️ Refunded' }
    };

    const paymentConfig = config[paymentStatus as keyof typeof config] || config.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${paymentConfig.bg} ${paymentConfig.text} shadow-md`}>
        {paymentConfig.label}
      </span>
    );
  };

  if (!currentUser || currentUser.role !== 'client') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-2">Access Denied</h2>
            <p className="text-[#345635]">This page is only for clients.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-6 transition-all duration-300 group animate-fade-in-up"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-3xl">💼</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">Ongoing Jobs</h1>
                <p className="text-[#6B8F71] mt-1">Track your hired service providers and project progress</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-[#6B8F71] mb-2 font-medium">Active Jobs</div>
              <div className="text-3xl font-bold text-[#0D2B1D]">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-[#E3EFD3] to-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-[#345635] mb-2 font-medium">⏳ Starting Soon</div>
              <div className="text-3xl font-bold text-[#0D2B1D]">{stats.pending}</div>
            </div>
            <div className="bg-gradient-to-br from-[#6B8F71]/10 to-white rounded-xl shadow-lg p-5 border-2 border-[#6B8F71] hover:border-[#345635] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-[#345635] mb-2 font-medium">🔨 In Progress</div>
              <div className="text-3xl font-bold text-[#0D2B1D]">{stats.in_progress}</div>
            </div>
            <div className="bg-gradient-to-br from-[#AEC3B0]/20 to-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-[#345635] mb-2 font-medium">✅ Completed</div>
              <div className="text-3xl font-bold text-[#0D2B1D]">{stats.completed}</div>
            </div>
            <div className="bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl shadow-xl p-5 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-sm opacity-90 mb-2 font-medium">💳 Total Spent</div>
              <div className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-8 border-2 border-[#AEC3B0] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Jobs' },
                { value: 'pending', label: '⏳ Pending' },
                { value: 'in_progress', label: '🔨 In Progress' },
                { value: 'completed', label: '✅ Completed' },
                { value: 'cancelled', label: '❌ Cancelled' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    activeFilter === filter.value
                      ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                      : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12 animate-fade-in-up">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
                <p className="text-[#6B8F71] font-medium">Loading jobs...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center animate-fade-in-up">
              <div className="w-28 h-28 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">No Ongoing Jobs</h3>
              <p className="text-[#6B8F71] mb-8 text-lg">Post a job and hire a service provider to get started!</p>
              <button
                onClick={() => navigate('/post-job')}
                className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium hover:scale-105"
              >
                Post a Job
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const job = typeof order.job !== 'string' ? order.job : null;
                const provider = typeof order.provider !== 'string' ? order.provider : null;

                return (
                  <div 
                    key={order._id} 
                    className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] overflow-hidden hover:shadow-2xl hover:border-[#6B8F71] transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                            {job?.title || 'Job Title'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.payment?.status || 'pending')}
                            {job && (
                              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] text-sm font-semibold shadow-md">
                                {job.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-4xl font-bold bg-gradient-to-r from-[#345635] to-[#6B8F71] bg-clip-text text-transparent">
                            ₹{order.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-[#6B8F71] font-medium">Project Budget</div>
                        </div>
                      </div>

                      {/* Provider Info */}
                      {provider && (
                        <div className="bg-gradient-to-br from-[#E3EFD3] to-white rounded-xl p-5 mb-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] transition-all duration-300">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white">
                                {provider.profilePicture ? (
                                  <img 
                                    src={provider.profilePicture} 
                                    alt={provider.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  provider.fullName?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-[#0D2B1D] text-lg">{provider.fullName}</p>
                                <div className="flex items-center text-sm text-[#6B8F71] font-medium">
                                  {provider.city && <span>📍 {provider.city}</span>}
                                  {provider.rating && (
                                    <span className="ml-3">⭐ {provider.rating.toFixed(1)}</span>
                                  )}
                                </div>
                                {provider.skills && provider.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {provider.skills.slice(0, 3).map((skill, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-gradient-to-r from-[#AEC3B0] to-[#E3EFD3] text-[#345635] text-xs rounded-full font-semibold"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/messages?userId=${typeof order.provider === 'string' ? order.provider : provider._id}`)}
                              className="px-6 py-2.5 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all duration-300 text-sm font-semibold hover:scale-105"
                            >
                              💬 Message Provider
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 text-sm">
                        <div className="bg-white rounded-lg p-4 border-2 border-[#AEC3B0]">
                          <div className="text-[#6B8F71] mb-1 font-medium">Started</div>
                          <div className="font-bold text-[#0D2B1D] text-base">
                            {order.startDate ? formatDate(order.startDate) : 'Not started'}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-2 border-[#6B8F71]">
                          <div className="text-[#6B8F71] mb-1 font-medium">Deadline</div>
                          <div className="font-bold text-[#0D2B1D] text-base">
                            {formatDate(order.deadline)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-2 border-[#AEC3B0]">
                          <div className="text-[#6B8F71] mb-1 font-medium">Completed</div>
                          <div className="font-bold text-[#0D2B1D] text-base">
                            {order.completedDate ? formatDate(order.completedDate) : 'Not completed'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-5 border-t-2 border-[#AEC3B0]">
                        {order.status === 'pending' && (
                          <div className="flex items-center space-x-3 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] px-5 py-3 rounded-xl">
                            <span className="text-2xl">⏳</span>
                            <span className="font-semibold text-[#345635]">Waiting for provider to start work</span>
                          </div>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <div className="flex items-center space-x-3 bg-gradient-to-r from-[#6B8F71]/20 to-[#AEC3B0]/20 px-5 py-3 rounded-xl border-2 border-[#6B8F71]">
                            <span className="text-2xl">🔨</span>
                            <span className="font-semibold text-[#345635]">Provider is working on your job</span>
                          </div>
                        )}

                        {order.status === 'completed' && order.payment?.status !== 'released' && (
                          <button
                            onClick={() => handleAcceptDelivery(order._id)}
                            className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
                          >
                            ✅ Accept Delivery & Release Payment
                          </button>
                        )}

                        {order.status === 'completed' && order.payment?.status === 'released' && (
                          <>
                            <div className="flex items-center space-x-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] px-5 py-3 rounded-xl text-white">
                              <span className="text-2xl">✅</span>
                              <span className="font-semibold">Job completed! Payment released.</span>
                            </div>
                            {/* Rehire Button for Completed Orders */}
                            {provider && provider._id && (
                              <RehireButton
                                providerId={provider._id}
                                providerName={provider.fullName}
                                size="md"
                              />
                            )}
                          </>
                        )}

                        {(order.status === 'pending' || order.status === 'in_progress') && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 font-semibold hover:scale-105"
                          >
                            ❌ Cancel Order
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all duration-300 font-semibold hover:scale-105"
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

export default OngoingJobs;
