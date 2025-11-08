import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { followService } from '../services/followService';
import { selectCurrentUser } from '../store/authSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FollowButton from '../components/follow/FollowButton';

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  city?: string;
  skills?: string[];
  hourlyRate?: number;
  providerType?: string;
  isVerified?: boolean;
  role?: string;
}

const FollowersFollowing = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useSelector(selectCurrentUser);
  
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    (searchParams.get('tab') as 'followers' | 'following') || 'followers'
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    mutualFollowsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const targetUserId = userId || currentUser?._id;

  useEffect(() => {
    if (!targetUserId) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [targetUserId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, followersData, followingData] = await Promise.all([
        followService.getFollowStats(targetUserId!),
        followService.getFollowers(targetUserId!),
        followService.getFollowing(targetUserId!)
      ]);

      setStats(statsData);
      setFollowers(followersData.followers);
      setFollowing(followingData.following);
    } catch (error: any) {
      console.error('Error fetching follow data:', error);
      toast.error('Failed to load follow data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'followers' | 'following') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleFollowChange = () => {
    fetchData();
  };

  const filteredUsers = (activeTab === 'followers' ? followers : following).filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({ user }: { user: User }) => (
    <div
      className="bg-white rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* User Info */}
          <div 
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold mr-4">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                user.fullName.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-text-primary">
                  {user.fullName}
                </h3>
                {user.isVerified && (
                  <span className="inline-flex" title="Verified">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                )}
              </div>
              
              <p className="text-sm text-text-secondary mb-2">{user.email}</p>
              
              {user.city && (
                <p className="text-sm text-text-secondary flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.city}
                </p>
              )}
              
              {user.role === 'provider' && user.providerType && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.providerType}
                </span>
              )}
              
              {user.hourlyRate && (
                <p className="text-sm text-primary font-semibold mt-2">
                  ₹{user.hourlyRate}/hr
                </p>
              )}
            </div>
          </div>

          {/* Follow Button */}
          <div className="ml-4">
            <FollowButton
              userId={user._id}
              showLabel={true}
              size="sm"
              onFollowChange={handleFollowChange}
            />
          </div>
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-surface text-text-primary rounded-full text-xs font-medium border border-border"
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 5 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                +{user.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-24 mt-20">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-border p-8 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-text-primary tracking-tighter">
              {targetUserId === currentUser?._id ? 'Your' : "User's"} Connections
            </h1>
            
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:shadow-medium transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface rounded-xl p-6 text-center border border-border">
              <div className="text-3xl font-semibold text-text-primary">
                {stats.followersCount}
              </div>
              <div className="text-sm text-text-secondary font-medium mt-1">
                Followers
              </div>
            </div>
            
            <div className="bg-surface rounded-xl p-6 text-center border border-border">
              <div className="text-3xl font-semibold text-text-primary">
                {stats.followingCount}
              </div>
              <div className="text-sm text-text-secondary font-medium mt-1">
                Following
              </div>
            </div>
            
            {targetUserId === currentUser?._id && (
              <div className="bg-surface rounded-xl p-6 text-center border border-border">
                <div className="text-3xl font-semibold text-text-primary">
                  {stats.mutualFollowsCount}
                </div>
                <div className="text-sm text-text-secondary font-medium mt-1">
                  Mutual Connections
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleTabChange('followers')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'followers'
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary'
              }`}
            >
              Followers ({stats.followersCount})
            </button>
            
            <button
              onClick={() => handleTabChange('following')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'following'
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary'
              }`}
            >
              Following ({stats.followingCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
            <p className="text-text-primary text-xl font-medium">Loading connections...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-border p-12 text-center">
            <div className="w-20 h-20 bg-surface rounded-2xl mx-auto mb-4 flex items-center justify-center">
              {activeTab === 'followers' ? (
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-2">
              {searchQuery 
                ? 'No users found' 
                : activeTab === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet'
              }
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : activeTab === 'followers'
                  ? 'Start building connections to grow your network'
                  : 'Discover and follow users to stay connected'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/browse-providers')}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:shadow-medium transition-all duration-200"
              >
                Browse Users
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUsers.map(user => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FollowersFollowing;
