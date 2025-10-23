import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import api from '../lib/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface WishlistItem {
  _id: string;
  itemType: 'provider' | 'client' | 'job';
  itemId: any;
  notes: string;
  addedAt: string;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'provider' | 'client' | 'job'>('all');
  const [counts, setCounts] = useState({ provider: 0, client: 0, job: 0 });

  useEffect(() => {
    if (currentUser) {
      loadWishlist();
    }
  }, [currentUser, activeTab]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const filter = activeTab === 'all' ? '' : `?itemType=${activeTab}`;
      const response = await api.get(`/wishlist${filter}`);
      setWishlist(response.data.data);
      setCounts(response.data.counts);
    } catch (error: any) {
      console.error('Load wishlist error:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  };

  const handleItemClick = (item: WishlistItem) => {
    if (item.itemType === 'job') {
      navigate(`/jobs/${item.itemId._id}`);
    } else {
      navigate(`/profile/${item.itemId._id}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Please login to view your wishlist.</p>
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
            onClick={() => navigate(-1)}
            className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-6 transition-all duration-300 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="mb-8 flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-4xl">❤️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#0D2B1D]">My Wishlist</h1>
              <p className="text-[#6B8F71] mt-1">
                {currentUser.role === 'client' 
                  ? 'Save your favorite service providers for quick access'
                  : 'Save potential clients and interesting jobs'
                }
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-2 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-md'
                  : 'text-[#6B8F71] hover:bg-[#E3EFD3]'
              }`}
            >
              All ({counts.provider + counts.client + counts.job})
            </button>
            
            {currentUser.role === 'client' && (
              <button
                onClick={() => setActiveTab('provider')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'provider'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-md'
                    : 'text-[#6B8F71] hover:bg-[#E3EFD3]'
                }`}
              >
                Providers ({counts.provider})
              </button>
            )}

            {currentUser.role === 'provider' && (
              <>
                <button
                  onClick={() => setActiveTab('client')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'client'
                      ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-md'
                      : 'text-[#6B8F71] hover:bg-[#E3EFD3]'
                  }`}
                >
                  Clients ({counts.client})
                </button>
                <button
                  onClick={() => setActiveTab('job')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'job'
                      ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-md'
                      : 'text-[#6B8F71] hover:bg-[#E3EFD3]'
                  }`}
                >
                  Jobs ({counts.job})
                </button>
              </>
            )}
          </div>

          {/* Wishlist Items */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
                <p className="text-[#6B8F71] font-medium">Loading wishlist...</p>
              </div>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0D2B1D] mb-2">
                No Items in Wishlist
              </h3>
              <p className="text-[#6B8F71] mb-6">
                Start adding your favorite {currentUser.role === 'client' ? 'providers' : 'clients and jobs'} to your wishlist!
              </p>
              <button
                onClick={() => navigate(currentUser.role === 'client' ? '/browse-providers' : '/jobs')}
                className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
              >
                {currentUser.role === 'client' ? 'Browse Providers' : 'Browse Jobs'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Item Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] rounded-full text-xs font-medium">
                      {item.itemType === 'provider' ? '👤 Provider' : item.itemType === 'client' ? '👔 Client' : '💼 Job'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.itemId._id);
                      }}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all"
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Item Content */}
                  {item.itemType === 'job' ? (
                    <>
                      <h3 className="text-lg font-bold text-[#0D2B1D] mb-2">
                        {item.itemId.title}
                      </h3>
                      <p className="text-sm text-[#6B8F71] mb-3 line-clamp-2">
                        {item.itemId.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-xs">
                          {item.itemId.category}
                        </span>
                        <span className="text-[#345635] font-semibold">
                          ₹{item.itemId.budget}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
                          {item.itemId.profilePicture ? (
                            <img 
                              src={item.itemId.profilePicture} 
                              alt={item.itemId.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            item.itemId.fullName?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#0D2B1D]">
                            {item.itemId.fullName}
                          </h3>
                          {item.itemId.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-[#6B8F71]">{item.itemId.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {item.itemId.skills && item.itemId.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.itemId.skills.slice(0, 2).map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {item.itemId.skills.length > 2 && (
                            <span className="px-2 py-1 bg-[#E3EFD3] text-[#6B8F71] rounded-full text-xs">
                              +{item.itemId.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Added Date */}
                  <div className="mt-4 pt-4 border-t-2 border-[#AEC3B0]">
                    <p className="text-xs text-[#6B8F71]">
                      Added {new Date(item.addedAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
