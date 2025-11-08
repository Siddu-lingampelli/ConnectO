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
  const activeRole = currentUser?.activeRole || currentUser?.role || 'client';
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
          <p className="text-text-secondary font-medium">Please login to view your wishlist.</p>
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
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:text-text-primary mb-6 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="mb-8 flex items-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4 shadow-soft">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-text-primary tracking-tighter">My Wishlist</h1>
              <p className="text-text-secondary mt-1">
                {activeRole === 'client' 
                  ? 'Save your favorite service providers for quick access'
                  : 'Save potential clients and interesting jobs'
                }
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-soft border border-border p-2 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-surface'
              }`}
            >
              All ({counts.provider + counts.client + counts.job})
            </button>
            
            {activeRole === 'client' && (
              <button
                onClick={() => setActiveTab('provider')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'provider'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface'
                }`}
              >
                Providers ({counts.provider})
              </button>
            )}

            {activeRole === 'provider' && (
              <>
                <button
                  onClick={() => setActiveTab('client')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'client'
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface'
                  }`}
                >
                  Clients ({counts.client})
                </button>
                <button
                  onClick={() => setActiveTab('job')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'job'
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface'
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">Loading wishlist...</p>
              </div>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-border p-12 text-center">
              <div className="w-24 h-24 bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No Items in Wishlist
              </h3>
              <p className="text-text-secondary mb-6">
                Start adding your favorite {activeRole === 'client' ? 'providers' : 'clients and jobs'} to your wishlist!
              </p>
              <button
                onClick={() => navigate(activeRole === 'client' ? '/browse-providers' : '/jobs')}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 font-semibold"
              >
                {activeRole === 'client' ? 'Browse Providers' : 'Browse Jobs'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Item Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {item.itemType === 'provider' ? 'Provider' : item.itemType === 'client' ? 'Client' : 'Job'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.itemId._id);
                      }}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all duration-200"
                      title="Remove from wishlist"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Content */}
                  {item.itemType === 'job' ? (
                    <>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {item.itemId.title}
                      </h3>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {item.itemId.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-surface text-primary rounded-full text-xs font-medium">
                          {item.itemId.category}
                        </span>
                        <span className="text-primary font-semibold">
                          ₹{item.itemId.budget}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold mr-3">
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
                          <h3 className="text-lg font-semibold text-text-primary">
                            {item.itemId.fullName}
                          </h3>
                          {item.itemId.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <svg className="w-4 h-4 text-warning fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-text-secondary">{item.itemId.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {item.itemId.skills && item.itemId.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.itemId.skills.slice(0, 2).map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-[#E3EFD3] text-primary rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {item.itemId.skills.length > 2 && (
                            <span className="px-2 py-1 bg-[#E3EFD3] text-text-secondary rounded-full text-xs">
                              +{item.itemId.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Added Date */}
                  <div className="mt-4 pt-4 border-t-2 border-border">
                    <p className="text-xs text-text-secondary">
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
      </div></main>
      <Footer />
    </div>
  );
};

export default Wishlist;
