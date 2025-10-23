import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { gamificationService, LeaderboardEntry } from '../services/gamificationService';
import { toast } from 'react-toastify';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerType, setProviderType] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const [myRank, setMyRank] = useState<any>(null);

  useEffect(() => {
    loadLeaderboard();
    loadStats();
    if (user && user.role === 'provider') {
      loadMyRank();
    }
  }, [providerType]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await gamificationService.getLeaderboard(
        'all', // Always use 'all' time period
        20,
        providerType === 'all' ? undefined : providerType
      );
      setLeaderboard(data);
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await gamificationService.getLeaderboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      // Don't show error toast for stats, it's not critical
    }
  };

  const loadMyRank = async () => {
    try {
      if (user?._id) {
        const data = await gamificationService.getUserRank(user._id);
        setMyRank(data);
      }
    } catch (error: any) {
      console.error('Error loading my rank:', error);
      // Don't show error toast, rank card will just not appear
    }
  };

  const getRankBadge = (rank: number) => {
    const badge = gamificationService.getRankBadge(rank);
    return (
      <span className={`text-2xl font-bold ${badge.color}`}>
        {badge.emoji}
      </span>
    );
  };

  const getLevelColor = (level: number) => {
    return gamificationService.getLevelColor(level);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button - Emerald Theme */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-[#345635] hover:text-[#0D2B1D] transition-all hover:scale-105 group font-medium"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* Header - Emerald Theme */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl flex items-center justify-center shadow-xl animate-pulse-soft">
              <span className="text-5xl">🏆</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#0D2B1D] mb-2">
            Leaderboard
          </h1>
          <p className="text-[#6B8F71] text-lg">
            See how you rank among the top service providers
          </p>
        </div>

        {/* My Rank Card (Only for Providers) - Emerald Theme */}
        {user?.role === 'provider' && myRank && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#6B8F71] p-6 mb-6 animate-fade-in-up hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#345635] mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#345635] to-[#6B8F71] rounded-full"></span>
                  Your Rank
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-5xl font-bold bg-gradient-to-r from-[#0D2B1D] to-[#345635] bg-clip-text text-transparent">#{myRank.rank}</p>
                    <p className="text-xs text-[#6B8F71] mt-1">out of {myRank.totalProviders}</p>
                  </div>
                  <div className="text-center px-6 py-3 bg-gradient-to-r from-[#AEC3B0] to-[#E3EFD3] rounded-xl shadow-md">
                    <p className="text-sm text-[#345635] font-medium">Top</p>
                    <p className="text-2xl font-bold text-[#0D2B1D]">{myRank.percentile}%</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <span className="text-sm text-[#6B8F71]">Level </span>
                  <span className={`text-3xl font-bold bg-gradient-to-r ${getLevelColor(myRank.user.level)} bg-clip-text text-transparent`}>
                    {myRank.user.level}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-[#E3EFD3]/50 rounded-lg">
                    <p className="text-xs text-[#6B8F71] mb-1">XP</p>
                    <p className="text-xl font-bold text-[#345635]">{myRank.user.xp}</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-[#E3EFD3]/50 rounded-lg">
                    <p className="text-xs text-[#6B8F71] mb-1">Badges</p>
                    <p className="text-xl font-bold text-[#345635]">{myRank.user.badges}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Emerald Theme */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E3EFD3] p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-sm text-[#6B8F71] mb-1 font-medium">Total Providers</p>
              <p className="text-2xl font-bold text-[#0D2B1D]">{stats.totalProviders}</p>
            </div>
            {stats.highestLevel && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E3EFD3] p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: '100ms' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-sm text-[#6B8F71] mb-1 font-medium">Highest Level</p>
                <p className="text-2xl font-bold text-[#0D2B1D]">{stats.highestLevel.level}</p>
                <p className="text-xs text-[#6B8F71]">{stats.highestLevel.name}</p>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E3EFD3] p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm text-[#6B8F71] mb-1 font-medium">Avg Level</p>
              <p className="text-2xl font-bold text-[#0D2B1D]">{stats.averages.avgLevel.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E3EFD3] p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-sm text-[#6B8F71] mb-1 font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-[#0D2B1D]">{stats.averages.avgRating.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Filters - Emerald Theme */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E3EFD3] p-5 mb-6 animate-fade-in-up hover:shadow-xl transition-all duration-300">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-[#345635]">Provider Type:</label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] transition-all bg-white text-[#345635] font-medium hover:border-[#6B8F71]"
              >
                <option value="all">All Types</option>
                <option value="Technical">💻 Technical</option>
                <option value="Non-Technical">🔧 Non-Technical</option>
              </select>
            </div>
            <div className="text-sm text-[#6B8F71] ml-auto flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#345635] rounded-full animate-pulse-soft"></span>
              Showing all-time rankings
            </div>
          </div>
        </div>

        {/* Leaderboard Table - Emerald Theme */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] overflow-hidden animate-fade-in-up">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#345635]"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <p className="text-[#6B8F71] font-medium">No providers found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0D2B1D] via-[#345635] to-[#6B8F71] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Provider</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Level</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">XP</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Badges</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Jobs</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EFD3]">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.user._id}
                      className={`hover:bg-[#F8FBF9] transition-all duration-200 ${
                        entry.user._id === user?._id ? 'bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] border-l-4 border-[#345635]' : ''
                      }`}
                    >
                      {/* Rank - Emerald Theme */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRankBadge(entry.rank)}
                        </div>
                      </td>
                      
                      {/* Provider - Emerald Theme */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.user.profilePicture ? (
                            <img
                              src={entry.user.profilePicture}
                              alt={entry.user.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#AEC3B0] shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#345635] to-[#6B8F71] flex items-center justify-center text-white font-bold shadow-md">
                              {entry.user.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#0D2B1D]">
                              {entry.user.fullName}
                              {entry.user._id === user?._id && (
                                <span className="ml-2 text-xs bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                  You
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[#6B8F71] mt-1">
                              {entry.user.city && <span>📍 {entry.user.city}</span>}
                              {entry.user.providerType && (
                                <span className={`px-2 py-0.5 rounded-full font-medium ${
                                  entry.user.providerType === 'Technical'
                                    ? 'bg-[#E3EFD3] text-[#345635]'
                                    : 'bg-[#AEC3B0] text-[#0D2B1D]'
                                }`}>
                                  {entry.user.providerType === 'Technical' ? '💻' : '🔧'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Level - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${getLevelColor(entry.level)} text-white font-bold shadow-lg hover:scale-110 transition-transform`}>
                          {entry.level}
                        </div>
                      </td>
                      
                      {/* XP - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-bold text-[#345635]">{entry.xp.toLocaleString()}</p>
                        <p className="text-xs text-[#6B8F71]">XP</p>
                      </td>
                      
                      {/* Badges - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-bold text-[#0D2B1D]">{entry.badges} 🏆</p>
                        <p className="text-xs text-[#6B8F71]">badges</p>
                      </td>
                      
                      {/* Jobs - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-bold text-[#345635]">{entry.completedJobs}</p>
                        <p className="text-xs text-[#6B8F71]">jobs</p>
                      </td>
                      
                      {/* Rating - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-[#0D2B1D]">
                            {entry.rating > 0 ? `${entry.rating.toFixed(1)} ⭐` : '—'}
                          </p>
                          {entry.totalReviews > 0 && (
                            <p className="text-xs text-[#6B8F71]">({entry.totalReviews} reviews)</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How XP Works - Emerald Theme */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] p-8 animate-fade-in-up hover:shadow-2xl transition-all duration-300">
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎮</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#0D2B1D]">How XP Works</h2>
            <p className="text-[#6B8F71] mt-2">Earn experience points to level up and climb the leaderboard</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border-2 border-[#AEC3B0] hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎯</span>
              </div>
              <div>
                <p className="font-bold text-[#0D2B1D]">Complete Demo Project</p>
                <p className="text-sm text-[#6B8F71] font-semibold">+50 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border-2 border-[#AEC3B0] hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <p className="font-bold text-[#0D2B1D]">Complete Job</p>
                <p className="text-sm text-[#6B8F71] font-semibold">+40 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border-2 border-[#AEC3B0] hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-3xl">⭐</span>
              </div>
              <div>
                <p className="font-bold text-[#0D2B1D]">Excellent Review (5 stars)</p>
                <p className="text-sm text-[#6B8F71] font-semibold">+50 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border-2 border-[#AEC3B0] hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-3xl">📅</span>
              </div>
              <div>
                <p className="font-bold text-[#0D2B1D]">Daily Login</p>
                <p className="text-sm text-[#6B8F71] font-semibold">+10 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border-2 border-[#AEC3B0] hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-3xl">✔️</span>
              </div>
              <div>
                <p className="font-bold text-[#0D2B1D]">Verification Complete</p>
                <p className="text-sm text-[#6B8F71] font-semibold">+75 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border-2 border-[#AEC3B0] hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <p className="font-bold text-[#0D2B1D]">Complete Profile</p>
                <p className="text-sm text-[#6B8F71] font-semibold">+20 XP</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0] rounded-xl shadow-md">
            <p className="text-sm text-white text-center font-semibold">
              💡 <strong>Level Up:</strong> You need 100 XP to advance to the next level!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
