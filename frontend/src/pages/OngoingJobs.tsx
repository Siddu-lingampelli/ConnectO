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
      pending: { bg: 'bg-gradient-to-r from-primary/10 to-primary/20', text: 'text-primary', label: 'Pending Start', icon: '' },
      in_progress: { bg: 'bg-gradient-to-r from-primary/70 to-primary/40', text: 'text-white', label: 'In Progress', icon: '' },
      completed: { bg: 'bg-gradient-to-r from-primary to-primary-dark', text: 'text-white', label: 'Completed', icon: '' },
      cancelled: { bg: 'bg-surface', text: 'text-text-primary', label: 'Cancelled', icon: '' },
      disputed: { bg: 'bg-warning/10', text: 'text-warning', label: 'Disputed', icon: '' }
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
      pending: { bg: 'bg-gradient-to-r from-primary/10 to-primary/20', text: 'text-primary', label: 'Payment Pending' },
      paid: { bg: 'bg-gradient-to-r from-primary/70 to-primary/40', text: 'text-white', label: 'Escrowed' },
      released: { bg: 'bg-gradient-to-r from-primary to-primary-dark', text: 'text-white', label: 'Paid to Provider' },
      refunded: { bg: 'bg-surface', text: 'text-text-primary', label: 'Refunded' }
    };

    const paymentConfig = config[paymentStatus as keyof typeof config] || config.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${paymentConfig.bg} ${paymentConfig.text} shadow-md`}>
        {paymentConfig.label}
      </span>
    );
  };

  if (!currentUser || currentUser.role !== 'client') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-soft border border-border p-12 animate-fade-in-up">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Access Denied</h2>
            <p className="text-text-secondary">This page is only for clients.</p>
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
            className="flex items-center text-primary hover:text-primary-dark mb-6 transition-all duration-200 group animate-fade-in-up"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center mb-3">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mr-4 shadow-soft">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-text-primary tracking-tighter">Ongoing Jobs</h1>
                <p className="text-text-secondary mt-1">Track your hired service providers and project progress</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-200">
              <div className="text-sm text-text-secondary mb-2 font-medium">Active Jobs</div>
              <div className="text-3xl font-semibold text-text-primary">{stats.total}</div>
            </div>
            <div className="bg-surface rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-200">
              <div className="text-sm text-text-secondary mb-2 font-medium">Starting Soon</div>
              <div className="text-3xl font-semibold text-text-primary">{stats.pending}</div>
            </div>
            <div className="bg-surface rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-200">
              <div className="text-sm text-text-secondary mb-2 font-medium">In Progress</div>
              <div className="text-3xl font-semibold text-text-primary">{stats.in_progress}</div>
            </div>
            <div className="bg-surface rounded-xl shadow-soft p-5 border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-200">
              <div className="text-sm text-text-secondary mb-2 font-medium">Completed</div>
              <div className="text-3xl font-semibold text-text-primary">{stats.completed}</div>
            </div>
            <div className="bg-primary rounded-xl shadow-soft p-5 text-white hover:shadow-medium transition-all duration-200">
              <div className="text-sm opacity-90 mb-2 font-medium">Total Spent</div>
              <div className="text-3xl font-semibold">₹{stats.totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-soft p-3 mb-8 border border-border animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Jobs' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    activeFilter === filter.value
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-soft scale-105'
                      : 'bg-[#E3EFD3] text-primary hover:bg-[#AEC3B0] hover:scale-102'
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-[#345635] mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">Loading jobs...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-border p-12 text-center animate-fade-in-up">
              <div className="w-28 h-28 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl">📋</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">No Ongoing Jobs</h3>
              <p className="text-text-secondary mb-8 text-lg">Post a job and hire a service provider to get started!</p>
              <button
                onClick={() => navigate('/post-job')}
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-medium transition-all duration-200 font-medium"
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
                    className="bg-white rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold text-text-primary mb-3">
                            {job?.title || 'Job Title'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.payment?.status || 'pending')}
                            {job && (
                              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 text-primary text-sm font-semibold shadow-md">
                                {job.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-4xl font-semibold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                            ₹{order.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-text-secondary font-medium">Project Budget</div>
                        </div>
                      </div>

                      {/* Provider Info */}
                      {provider && (
                        <div className="bg-gradient-to-br from-surface to-white rounded-xl p-5 mb-5 border border-border hover:border-primary/30 transition-all duration-200">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-soft ring-2 ring-white">
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
                                <p className="font-semibold text-text-primary text-lg">{provider.fullName}</p>
                                <div className="flex items-center text-sm text-text-secondary font-medium">
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
                                        className="px-3 py-1 bg-gradient-to-r from-[#AEC3B0] to-[#E3EFD3] text-primary text-xs rounded-full font-semibold"
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
                              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-medium transition-all duration-200 text-sm font-semibold"
                            >
                              💬 Message Provider
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 text-sm">
                        <div className="bg-white rounded-xl p-4 border border-border">
                          <div className="text-text-secondary mb-1 font-medium">Started</div>
                          <div className="font-semibold text-text-primary text-base">
                            {order.startDate ? formatDate(order.startDate) : 'Not started'}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-[#6B8F71]">
                          <div className="text-text-secondary mb-1 font-medium">Deadline</div>
                          <div className="font-semibold text-text-primary text-base">
                            {formatDate(order.deadline)}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-border">
                          <div className="text-text-secondary mb-1 font-medium">Completed</div>
                          <div className="font-semibold text-text-primary text-base">
                            {order.completedDate ? formatDate(order.completedDate) : 'Not completed'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-5 border-t-2 border-border">
                        {order.status === 'pending' && (
                          <div className="flex items-center space-x-3 bg-primary/10 px-5 py-3 rounded-xl">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-primary">Waiting for provider to start work</span>
                          </div>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <div className="flex items-center space-x-3 bg-primary/10 px-5 py-3 rounded-xl border border-primary/30">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-semibold text-primary">Provider is working on your job</span>
                          </div>
                        )}

                        {order.status === 'completed' && order.payment?.status !== 'released' && (
                          <button
                            onClick={() => handleAcceptDelivery(order._id)}
                            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 font-semibold"
                          >
                            Accept Delivery & Release Payment
                          </button>
                        )}

                        {order.status === 'completed' && order.payment?.status === 'released' && (
                          <>
                            <div className="flex items-center space-x-3 bg-primary px-5 py-3 rounded-xl text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
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
                            className="px-6 py-3 border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200 font-semibold"
                          >
                            Cancel Order
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-6 py-3 border border-[#6B8F71] text-primary rounded-xl hover:bg-[#E3EFD3] transition-all duration-200 font-semibold"
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

export default OngoingJobs;
