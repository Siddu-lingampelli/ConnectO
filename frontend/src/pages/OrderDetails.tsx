import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import type { Order } from '../types';
import type { Review } from '../services/reviewService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ReviewModal from '../components/ReviewModal';
import OrderLocationMap from '../components/OrderLocationMap';
import CollaboratorList from '../components/collaboration/CollaboratorList';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadOrder();
    loadReview();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const orderData = await orderService.getOrder(id);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
      navigate(currentUser?.role === 'provider' ? '/my-orders' : '/ongoing-jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadReview = async () => {
    try {
      if (!id) return;
      const reviewData = await reviewService.getOrderReview(id);
      setReview(reviewData);
    } catch (error: any) {
      console.error('Error loading review:', error);
      // It's okay if review doesn't exist yet
    }
  };

  const handleReviewSuccess = () => {
    loadReview(); // Reload review after submission
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order || !id) return;
    
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      await loadOrder();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptDelivery = async () => {
    if (!order || !id) return;
    
    if (!window.confirm('Are you sure you want to accept this delivery and release payment?')) {
      return;
    }

    try {
      setUpdating(true);
      await orderService.acceptDelivery(id);
      toast.success('Delivery accepted! Payment released to provider.');
      await loadOrder();
    } catch (error: any) {
      console.error('Error accepting delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !id) return;
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setUpdating(true);
      await orderService.cancelOrder(id);
      toast.success('Order cancelled');
      navigate(currentUser?.role === 'provider' ? '/my-orders' : '/ongoing-jobs');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      disputed: 'bg-orange-100 text-orange-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-red-100 text-red-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to view order details.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Order not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const job = typeof order.job !== 'string' ? order.job : null;
  const client = typeof order.client !== 'string' ? order.client : null;
  const provider = typeof order.provider !== 'string' ? order.provider : null;
  
  const isProvider = currentUser.role === 'provider';
  const otherPerson = isProvider ? client : provider;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(isProvider ? '/my-orders' : '/ongoing-jobs')}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
            >
              ← Back to {isProvider ? 'My Work' : 'Ongoing Work'}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-2">Complete information about this project</p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Order Status</h3>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${getStatusBadge(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Status</h3>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${getPaymentStatusBadge(order.paymentStatus || 'pending')}`}>
                {(order.paymentStatus || 'pending').toUpperCase()}
              </span>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Project Amount</h3>
              <div className="text-3xl font-bold text-green-600">
                ₹{order.amount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Job Details */}
          {job && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-2">
                    {job.category}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Description:</h4>
                  <p className="text-gray-600">{job.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">📍 Location:</h4>
                    <p className="text-gray-600">{job.location.city}, {job.location.area}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">💰 Budget Type:</h4>
                    <p className="text-gray-600 capitalize">{job.budgetType}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Person Details (Client or Provider) */}
          {otherPerson && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {isProvider ? '👤 Client Details' : '🔧 Service Provider Details'}
              </h2>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                    {otherPerson.profilePicture ? (
                      <img 
                        src={otherPerson.profilePicture} 
                        alt={otherPerson.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      otherPerson.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{otherPerson.fullName}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <span className="font-semibold mr-2">📧 Email:</span>
                        <span>{otherPerson.email}</span>
                      </div>
                      {otherPerson.phone && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-semibold mr-2">📱 Phone:</span>
                          <span>{otherPerson.phone}</span>
                        </div>
                      )}
                      {otherPerson.city && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-semibold mr-2">📍 Location:</span>
                          <span>{otherPerson.city}{otherPerson.area ? `, ${otherPerson.area}` : ''}</span>
                        </div>
                      )}
                      {otherPerson.rating && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-semibold mr-2">⭐ Rating:</span>
                          <span className="text-yellow-600 font-semibold">{otherPerson.rating.toFixed(1)} / 5.0</span>
                          <span className="ml-2 text-sm">({otherPerson.completedJobs || 0} jobs completed)</span>
                        </div>
                      )}
                    </div>

                    {/* Provider-specific details */}
                    {!isProvider && provider && (
                      <div className="mt-4 space-y-3">
                        {provider.bio && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-1">About:</h4>
                            <p className="text-gray-600">{provider.bio}</p>
                          </div>
                        )}
                        {provider.skills && provider.skills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {provider.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {provider.services && provider.services.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Services:</h4>
                            <div className="flex flex-wrap gap-2">
                              {provider.services.map((service, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => navigate(`/profile/${otherPerson.id || otherPerson._id}`)}
                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    📋 View Full Profile
                  </button>
                  <button
                    onClick={() => navigate(`/messages?userId=${otherPerson.id || otherPerson._id}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    💬 Send Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team Collaboration - Only visible to service providers */}
          {isProvider && order.job && provider && (
            <CollaboratorList
              jobId={typeof order.job === 'string' ? order.job : order.job._id}
              budget={order.amount}
              assignedProviderId={provider._id || ''}
              status={order.status}
            />
          )}

          {/* Location Map - Show both client and provider locations */}
          {(order.status === 'in_progress' || order.status === 'completed') && client && provider && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Location Sharing</h2>
              <OrderLocationMap
                client={client}
                provider={provider}
                currentUserRole={currentUser.role as 'client' | 'provider'}
              />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Project Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Started</h4>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.startDate && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">Work Begin Date</h4>
                    <p className="text-sm text-gray-600">{formatDate(order.startDate)}</p>
                  </div>
                </div>
              )}
              {order.completionDate && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">Completed On</h4>
                    <p className="text-sm text-gray-600">{formatDate(order.completionDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {/* Provider Actions */}
              {isProvider && order.status !== 'completed' && order.status !== 'cancelled' && (
                <>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      disabled={updating}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      🚀 Start Working
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={updating}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      ✅ Mark as Completed
                    </button>
                  )}
                </>
              )}

              {/* Client Actions */}
              {!isProvider && order.status === 'completed' && order.paymentStatus === 'pending' && (
                <button
                  onClick={handleAcceptDelivery}
                  disabled={updating}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  ✅ Accept Delivery & Release Payment
                </button>
              )}

              {/* Leave Review Button - Only for clients on completed orders */}
              {!isProvider && order.status === 'completed' && !review && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  ⭐ Leave a Review
                </button>
              )}

              {/* View Review Button - If review exists */}
              {!isProvider && order.status === 'completed' && review && (
                <div className="px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                  ✅ Review Submitted
                </div>
              )}

              {/* Rehire Provider Button - Only for clients on completed orders */}
              {!isProvider && order.status === 'completed' && provider && (
                <button
                  onClick={() => navigate(`/job-details/${order.job}?rehire=${provider._id}`)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium flex items-center gap-2 shadow-md"
                >
                  🔄 Rehire {provider.fullName?.split(' ')[0]}
                </button>
              )}

              {/* Cancel Option */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={updating}
                  className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                >
                  ❌ Cancel Order
                </button>
              )}

              {/* Back Button */}
              <button
                onClick={() => navigate(isProvider ? '/my-orders' : '/ongoing-jobs')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                ← Back to List
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Review Modal */}
      {showReviewModal && order && (
        <ReviewModal
          orderId={order._id}
          providerName={typeof order.provider === 'string' ? 'Provider' : order.provider.fullName}
          jobTitle={typeof order.job === 'string' ? 'Job' : order.job.title}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default OrderDetails;
