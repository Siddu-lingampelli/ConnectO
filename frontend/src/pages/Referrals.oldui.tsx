import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RootState } from '../store';
import referralService from '../services/referralService';
import { FiCopy, FiShare2, FiGift, FiUsers, FiDollarSign, FiAward } from 'react-icons/fi';

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  profilePicture?: string;
}

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  referralCredits: number;
  referralEarnings: number;
  referredBy: {
    name: string;
    email: string;
    referralCode: string;
  } | null;
  referredUsers: ReferredUser[];
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  role: string;
  profilePicture?: string;
  referralCount: number;
  totalEarnings: number;
  credits: number;
}

const Referrals = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'referred' | 'leaderboard'>('overview');

  useEffect(() => {
    if (currentUser) {
      fetchReferralStats();
      fetchLeaderboard();
    }
  }, [currentUser]);

  const fetchReferralStats = async () => {
    if (!currentUser?._id) return;
    
    try {
      setLoading(true);
      const response = await referralService.getReferralStats(currentUser._id);
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error: any) {
      console.error('Error fetching referral stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load referral stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await referralService.getReferralLeaderboard(10);
      if (response.success) {
        setLeaderboard(response.leaderboard);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      toast.success('Referral code copied to clipboard!');
    }
  };

  const shareReferral = () => {
    if (stats?.referralCode) {
      const shareUrl = `${window.location.origin}/register?ref=${stats.referralCode}`;
      const shareText = `Join ConnectO using my referral code ${stats.referralCode} and get special benefits! ${shareUrl}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join ConnectO',
          text: shareText,
          url: shareUrl,
        }).catch((error) => console.log('Error sharing:', error));
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success('Referral link copied to clipboard!');
      }
    }
  };

  const generateReferralCode = async () => {
    if (!currentUser?._id) return;
    
    try {
      const response = await referralService.generateReferralCode(currentUser._id);
      if (response.success) {
        toast.success('Referral code generated successfully!');
        fetchReferralStats();
      }
    } catch (error: any) {
      console.error('Error generating referral code:', error);
      toast.error(error.response?.data?.message || 'Failed to generate referral code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#345635] mx-auto"></div>
          <p className="mt-4 text-[#6B8F71] font-medium">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9] py-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header - Emerald Theme */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[#345635] hover:text-[#0D2B1D] transition-all hover:scale-105 group"
              title="Go back"
            >
              <svg className="w-7 h-7 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl flex items-center justify-center shadow-xl">
                <FiGift className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">
                  Referral Program
                </h1>
                <p className="mt-1 text-[#6B8F71] text-lg">
                  Invite friends and earn rewards! Get ₹50 credits + 100 XP for each successful referral.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Emerald Theme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#E3EFD3] text-sm font-medium">Total Referrals</p>
                <p className="text-4xl font-bold mt-1">{stats?.referralCount || 0}</p>
              </div>
              <FiUsers className="text-5xl text-[#AEC3B0]" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Available Credits</p>
                <p className="text-4xl font-bold mt-1">₹{stats?.referralCredits || 0}</p>
              </div>
              <FiDollarSign className="text-5xl text-[#E3EFD3]" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-2xl shadow-xl p-6 text-[#0D2B1D] hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#345635] text-sm font-medium">Total Earnings</p>
                <p className="text-4xl font-bold mt-1">₹{stats?.referralEarnings || 0}</p>
              </div>
              <FiAward className="text-5xl text-[#6B8F71]" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#AEC3B0] text-sm font-medium">Reward Per Referral</p>
                <p className="text-2xl font-bold mt-1">₹50 + 100 XP</p>
              </div>
              <FiGift className="text-5xl text-[#6B8F71]" />
            </div>
          </div>
        </div>

        {/* Referral Code Section - Emerald Theme */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] p-8 mb-8 animate-fade-in-up hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-[#0D2B1D] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-8 bg-gradient-to-b from-[#345635] to-[#6B8F71] rounded-full"></span>
            Your Referral Code
          </h2>
          
          {stats?.referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-2xl p-6 font-mono text-3xl font-bold text-center text-[#0D2B1D] border-4 border-[#6B8F71] shadow-lg">
                  {stats.referralCode}
                </div>
                <button
                  onClick={copyReferralCode}
                  className="px-8 py-4 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  <FiCopy className="text-xl" /> Copy
                </button>
                <button
                  onClick={shareReferral}
                  className="px-8 py-4 bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  <FiShare2 className="text-xl" /> Share
                </button>
              </div>

              <div className="bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] border-2 border-[#AEC3B0] rounded-2xl p-4">
                <p className="text-sm text-[#345635] font-medium">
                  <strong>Share this link:</strong>{' '}
                  <code className="bg-white px-3 py-1.5 rounded-lg text-[#0D2B1D] font-mono text-xs border border-[#AEC3B0]">
                    {window.location.origin}/register?ref={stats.referralCode}
                  </code>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <FiGift className="text-6xl text-[#345635]" />
              </div>
              <p className="text-[#6B8F71] mb-6 text-lg font-medium">You don't have a referral code yet</p>
              <button
                onClick={generateReferralCode}
                className="px-8 py-4 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
              >
                Generate Referral Code
              </button>
            </div>
          )}
        </div>

        {/* Tabs - Emerald Theme */}
        <div className="mb-6 animate-fade-in-up">
          <div className="border-b-2 border-[#E3EFD3]">
            <nav className="-mb-0.5 flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
                  activeTab === 'overview'
                    ? 'border-[#345635] text-[#0D2B1D] scale-105'
                    : 'border-transparent text-[#6B8F71] hover:text-[#345635] hover:border-[#AEC3B0]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('referred')}
                className={`pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
                  activeTab === 'referred'
                    ? 'border-[#345635] text-[#0D2B1D] scale-105'
                    : 'border-transparent text-[#6B8F71] hover:text-[#345635] hover:border-[#AEC3B0]'
                }`}
              >
                People You Invited ({stats?.referredUsers.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
                  activeTab === 'leaderboard'
                    ? 'border-[#345635] text-[#0D2B1D] scale-105'
                    : 'border-transparent text-[#6B8F71] hover:text-[#345635] hover:border-[#AEC3B0]'
                }`}
              >
                Leaderboard
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* How It Works - Emerald Theme */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] p-8 animate-fade-in-up hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-[#0D2B1D] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-gradient-to-b from-[#345635] to-[#6B8F71] rounded-full"></span>
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-[#E3EFD3] to-[#F8FBF9] rounded-2xl border-2 border-[#AEC3B0] hover:scale-105 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    1
                  </div>
                  <h3 className="font-bold text-[#0D2B1D] mb-2">Share Your Code</h3>
                  <p className="text-sm text-[#6B8F71]">
                    Share your unique referral code with friends and family
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-[#E3EFD3] to-[#F8FBF9] rounded-2xl border-2 border-[#AEC3B0] hover:scale-105 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    2
                  </div>
                  <h3 className="font-bold text-[#0D2B1D] mb-2">They Sign Up</h3>
                  <p className="text-sm text-[#6B8F71]">
                    When they register using your code, you get rewards
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-[#E3EFD3] to-[#F8FBF9] rounded-2xl border-2 border-[#AEC3B0] hover:scale-105 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-full flex items-center justify-center text-[#0D2B1D] text-2xl font-bold mx-auto mb-4 shadow-lg">
                    3
                  </div>
                  <h3 className="font-bold text-[#0D2B1D] mb-2">Earn Rewards</h3>
                  <p className="text-sm text-[#6B8F71]">
                    Get credits + XP based on who you refer
                  </p>
                </div>
              </div>
            </div>

            {/* Role-Specific Benefits - Emerald Theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Benefits */}
              <div className="bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl shadow-xl p-6 border-2 border-[#0D2B1D] text-white hover:scale-102 transition-all animate-fade-in-up">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💼</span>
                  For Service Providers
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all">
                    <span className="text-lg">🎯</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Dynamic Rewards</h3>
                      <p className="text-xs text-[#E3EFD3] mt-1">
                        Provider: <span className="font-bold">₹75 + 150 XP</span><br/>
                        Client: <span className="font-bold">₹60 + 110 XP</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all">
                    <span className="text-lg">🤝</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Build Your Team</h3>
                      <p className="text-xs text-[#E3EFD3] mt-1">5 providers = "Team Builder" badge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all">
                    <span className="text-lg">✅</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Priority Verification</h3>
                      <p className="text-xs text-[#E3EFD3] mt-1">10+ referrals unlock faster approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all">
                    <span className="text-lg">🏗️</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Network Architect</h3>
                      <p className="text-xs text-[#E3EFD3] mt-1">10+ providers = Exclusive badge</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Benefits */}
              <div className="bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-2xl shadow-xl p-6 border-2 border-[#345635] text-white hover:scale-102 transition-all animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  For Clients
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                    <span className="text-lg">💰</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 text-sm">Premium Rewards</h3>
                      <p className="text-xs text-green-700 mt-1">
                        Client: <span className="font-bold">₹100 + 120 XP</span><br/>
                        Provider: <span className="font-bold">₹80 + 130 XP</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                    <span className="text-lg">🌟</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 text-sm">Community Builder</h3>
                      <p className="text-xs text-green-700 mt-1">5 clients = Special badge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                    <span className="text-lg">🔍</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 text-sm">Talent Scout</h3>
                      <p className="text-xs text-green-700 mt-1">5 providers = Talent Scout badge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                    <span className="text-lg">💳</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 text-sm">Posting Credits</h3>
                      <p className="text-xs text-green-700 mt-1">Use for job postings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Breakdown Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                Reward Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Referral Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Credits</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">XP</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Bonus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-blue-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Provider → Provider</td>
                      <td className="px-4 py-3 text-blue-600 font-bold">₹75</td>
                      <td className="px-4 py-3 text-purple-600 font-bold">150 XP</td>
                      <td className="px-4 py-3 text-sm text-gray-600">🤝 Team Building</td>
                    </tr>
                    <tr className="hover:bg-green-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Client → Client</td>
                      <td className="px-4 py-3 text-green-600 font-bold">₹100</td>
                      <td className="px-4 py-3 text-purple-600 font-bold">120 XP</td>
                      <td className="px-4 py-3 text-sm text-gray-600">🌟 Community Builder</td>
                    </tr>
                    <tr className="hover:bg-orange-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Client → Provider</td>
                      <td className="px-4 py-3 text-orange-600 font-bold">₹80</td>
                      <td className="px-4 py-3 text-purple-600 font-bold">130 XP</td>
                      <td className="px-4 py-3 text-sm text-gray-600">💼 Talent Scout</td>
                    </tr>
                    <tr className="hover:bg-indigo-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Provider → Client</td>
                      <td className="px-4 py-3 text-indigo-600 font-bold">₹60</td>
                      <td className="px-4 py-3 text-purple-600 font-bold">110 XP</td>
                      <td className="px-4 py-3 text-sm text-gray-600">🚀 Network Expansion</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Badge Milestones */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏅</span>
                Badge Milestones
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-2xl mb-1">🎁</div>
                  <h3 className="font-semibold text-gray-900 text-sm">First Referral</h3>
                  <p className="text-xs text-gray-600">1 referral</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-1">🏆</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Champion</h3>
                  <p className="text-xs text-gray-600">5 referrals</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-1">👑</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Master</h3>
                  <p className="text-xs text-gray-600">10 referrals</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                  <div className="text-2xl mb-1">✅</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Trusted</h3>
                  <p className="text-xs text-gray-600">10+ (Priority)</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg border border-orange-200">
                  <div className="text-2xl mb-1">⭐</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Super</h3>
                  <p className="text-xs text-gray-600">25 referrals</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-3 rounded-lg border border-cyan-200">
                  <div className="text-2xl mb-1">💎</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Legend</h3>
                  <p className="text-xs text-gray-600">50 referrals</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg border border-blue-300">
                  <div className="text-2xl mb-1">🤝</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Team Builder</h3>
                  <p className="text-xs text-gray-600">5 providers</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-lg border border-green-300">
                  <div className="text-2xl mb-1">🌟</div>
                  <h3 className="font-semibold text-gray-900 text-sm">Community</h3>
                  <p className="text-xs text-gray-600">5 clients</p>
                </div>
              </div>
            </div>

            {stats?.referredBy && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>You were referred by:</strong> {stats.referredBy.name} ({stats.referredBy.email})
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'referred' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">People You Invited</h2>
            {stats?.referredUsers && stats.referredUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.referredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'provider' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No referrals yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start inviting friends to earn rewards!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Referrers</h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      entry.id === currentUser?._id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-orange-600' :
                        'bg-blue-600'
                      }`}>
                        {entry.rank === 1 ? '🥇' :
                         entry.rank === 2 ? '🥈' :
                         entry.rank === 3 ? '🥉' :
                         `#${entry.rank}`}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.name}
                          {entry.id === currentUser?._id && (
                            <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{entry.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{entry.referralCount} referrals</p>
                      <p className="text-sm text-gray-600">₹{entry.totalEarnings} earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiAward className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No leaderboard data yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
