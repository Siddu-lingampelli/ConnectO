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
      className="bg-white rounded-xl shadow-md border-2 border-[#AEC3B0] hover:shadow-lg transition-all overflow-hidden hover:scale-102"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* User Info */}
          <div 
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
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
                <h3 className="text-lg font-bold text-[#0D2B1D]">
                  {user.fullName}
                </h3>
                {user.isVerified && (
                  <span className="text-[#345635]" title="Verified">✓</span>
                )}
              </div>
              
              <p className="text-sm text-[#6B8F71] mb-2">{user.email}</p>
              
              {user.city && (
                <p className="text-sm text-[#6B8F71]">📍 {user.city}</p>
              )}
              
              {user.role === 'provider' && user.providerType && (
                <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635]">
                  {user.providerType}
                </span>
              )}
              
              {user.hourlyRate && (
                <p className="text-sm text-[#345635] font-semibold mt-2">
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
                className="px-2 py-1 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 5 && (
              <span className="px-2 py-1 bg-[#E3EFD3] text-[#6B8F71] rounded-full text-xs font-medium">
                +{user.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-[#AEC3B0] to-[#6B8F71]">
      <Header />
      
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-4 border-[#345635]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#0D2B1D]">
              {targetUserId === currentUser?._id ? 'Your' : "User's"} Connections
            </h1>
            
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-[#6B8F71] text-white rounded-lg hover:bg-[#345635] transition-all"
            >
              ← Back
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#0D2B1D]">
                {stats.followersCount}
              </div>
              <div className="text-sm text-[#345635] font-medium mt-1">
                Followers
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#0D2B1D]">
                {stats.followingCount}
              </div>
              <div className="text-sm text-[#345635] font-medium mt-1">
                Following
              </div>
            </div>
            
            {targetUserId === currentUser?._id && (
              <div className="bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#0D2B1D]">
                  {stats.mutualFollowsCount}
                </div>
                <div className="text-sm text-[#345635] font-medium mt-1">
                  Mutual Connections
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleTabChange('followers')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'followers'
                  ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg'
                  : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0]'
              }`}
            >
              Followers ({stats.followersCount})
            </button>
            
            <button
              onClick={() => handleTabChange('following')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'following'
                  ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg'
                  : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0]'
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
              className="w-full px-4 py-3 pl-12 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635] focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B8F71] text-xl">
              🔍
            </span>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
            <p className="text-[#0D2B1D] text-xl font-semibold">Loading connections...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-4 border-[#AEC3B0]">
            <div className="text-6xl mb-4">
              {activeTab === 'followers' ? '👥' : '🔗'}
            </div>
            <h3 className="text-2xl font-bold text-[#0D2B1D] mb-2">
              {searchQuery 
                ? 'No users found' 
                : activeTab === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet'
              }
            </h3>
            <p className="text-[#6B8F71] mb-6">
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
                className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-lg font-semibold hover:from-[#0D2B1D] hover:to-[#345635] transition-all"
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
