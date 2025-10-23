import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../lib/api';

interface RehireButtonProps {
  providerId: string;
  providerName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RehireButton = ({ 
  providerId, 
  providerName,
  className = '',
  size = 'md' 
}: RehireButtonProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rehireInfo, setRehireInfo] = useState<any>(null);

  const loadRehireInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/provider/${providerId}/rehire-info`);
      setRehireInfo(response.data.data);
      setShowModal(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info('No previous orders found. You can still hire this provider!');
        navigate(`/profile/${providerId}`);
      } else {
        toast.error('Failed to load rehire information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostNewJob = () => {
    setShowModal(false);
    navigate('/post-job');
  };

  const handleViewProfile = () => {
    setShowModal(false);
    navigate(`/profile/${providerId}`);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <>
      <button
        onClick={loadRehireInfo}
        disabled={loading}
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white 
          rounded-xl hover:shadow-xl transition-all font-medium 
          hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
          ${className}
        `}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>🔄</span>
            <span>Rehire</span>
          </>
        )}
      </button>

      {/* Rehire Modal */}
      {showModal && rehireInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#AEC3B0]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔄</span>
                  <div>
                    <h2 className="text-2xl font-bold">Rehire {providerName}</h2>
                    <p className="text-[#E3EFD3] text-sm">Quick access to hire this provider again</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#0D2B1D]">
                    {rehireInfo.stats.totalOrders}
                  </div>
                  <div className="text-xs text-[#6B8F71] mt-1">Past Orders</div>
                </div>
                <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#0D2B1D]">
                    ₹{rehireInfo.stats.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#6B8F71] mt-1">Total Spent</div>
                </div>
                <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#0D2B1D]">
                    {rehireInfo.stats.averageRating > 0 ? '⭐ ' + rehireInfo.stats.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-[#6B8F71] mt-1">Avg Rating</div>
                </div>
                <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-4 text-center">
                  <div className="text-sm font-bold text-[#0D2B1D]">
                    {new Date(rehireInfo.stats.lastCompletedDate).toLocaleDateString('en-IN', { 
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-[#6B8F71] mt-1">Last Order</div>
                </div>
              </div>

              {/* Past Orders */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#0D2B1D] mb-3 flex items-center gap-2">
                  <span>📜</span>
                  <span>Past Orders</span>
                </h3>
                <div className="space-y-3">
                  {rehireInfo.pastOrders.slice(0, 3).map((order: any) => (
                    <div 
                      key={order._id}
                      className="border-2 border-[#AEC3B0] rounded-xl p-4 hover:bg-[#E3EFD3] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0D2B1D]">{order.job?.title}</h4>
                          <div className="flex items-center gap-3 mt-2 text-sm text-[#6B8F71]">
                            <span>💰 ₹{order.amount?.toLocaleString()}</span>
                            {order.rating && (
                              <span>⭐ {order.rating}/5</span>
                            )}
                            <span>📅 {new Date(order.completedAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Info */}
              <div className="bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {rehireInfo.provider.profilePicture ? (
                      <img 
                        src={rehireInfo.provider.profilePicture} 
                        alt={rehireInfo.provider.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      rehireInfo.provider.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0D2B1D]">{rehireInfo.provider.fullName}</h4>
                    <div className="flex items-center gap-2 text-sm text-[#6B8F71]">
                      {rehireInfo.provider.rating && (
                        <span>⭐ {rehireInfo.provider.rating.toFixed(1)}</span>
                      )}
                      {rehireInfo.provider.completedJobs && (
                        <span>• {rehireInfo.provider.completedJobs} jobs</span>
                      )}
                      {rehireInfo.provider.hourlyRate && (
                        <span>• ₹{rehireInfo.provider.hourlyRate}/hr</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleViewProfile}
                  className="flex-1 px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium"
                >
                  View Profile
                </button>
                <button
                  onClick={handlePostNewJob}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
                >
                  Post New Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RehireButton;
