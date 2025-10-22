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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            See how you rank among the top service providers
          </p>
        </div>

        {/* My Rank Card (Only for Providers) */}
        {user?.role === 'provider' && myRank && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Rank</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">#{myRank.rank}</p>
                    <p className="text-xs text-gray-500">out of {myRank.totalProviders}</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                    <p className="text-sm text-gray-600">Top</p>
                    <p className="text-xl font-bold text-green-600">{myRank.percentile}%</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Level </span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${getLevelColor(myRank.user.level)} bg-clip-text text-transparent`}>
                    {myRank.user.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">XP</p>
                    <p className="text-lg font-bold text-blue-600">{myRank.user.xp}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Badges</p>
                    <p className="text-lg font-bold text-yellow-600">{myRank.user.badges}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Providers</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalProviders}</p>
            </div>
            {stats.highestLevel && (
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Highest Level</p>
                <p className="text-2xl font-bold text-purple-600">{stats.highestLevel.level}</p>
                <p className="text-xs text-gray-500">{stats.highestLevel.name}</p>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Avg Level</p>
              <p className="text-2xl font-bold text-green-600">{stats.averages.avgLevel.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.averages.avgRating.toFixed(1)} ⭐</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Provider Type:</label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Technical">💻 Technical</option>
                <option value="Non-Technical">🔧 Non-Technical</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 ml-auto">
              📊 Showing all-time rankings
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No providers found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Provider</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Level</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">XP</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Badges</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Jobs</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.user._id}
                      className={`hover:bg-blue-50 transition-colors ${
                        entry.user._id === user?._id ? 'bg-blue-100' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRankBadge(entry.rank)}
                        </div>
                      </td>
                      
                      {/* Provider */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.user.profilePicture ? (
                            <img
                              src={entry.user.profilePicture}
                              alt={entry.user.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {entry.user.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {entry.user.fullName}
                              {entry.user._id === user?._id && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {entry.user.city && <span>📍 {entry.user.city}</span>}
                              {entry.user.providerType && (
                                <span className={`px-2 py-0.5 rounded-full ${
                                  entry.user.providerType === 'Technical'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {entry.user.providerType === 'Technical' ? '💻' : '🔧'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Level */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getLevelColor(entry.level)} text-white font-bold shadow-lg`}>
                          {entry.level}
                        </div>
                      </td>
                      
                      {/* XP */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-bold text-blue-600">{entry.xp.toLocaleString()}</p>
                      </td>
                      
                      {/* Badges */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-bold text-yellow-600">{entry.badges} 🏆</p>
                      </td>
                      
                      {/* Jobs */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-semibold text-gray-700">{entry.completedJobs}</p>
                      </td>
                      
                      {/* Rating */}
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-yellow-600">
                            {entry.rating > 0 ? entry.rating.toFixed(1) : '—'}
                          </p>
                          {entry.totalReviews > 0 && (
                            <p className="text-xs text-gray-500">({entry.totalReviews} reviews)</p>
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

        {/* How XP Works */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎮 How XP Works</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-3xl">🎯</span>
              <div>
                <p className="font-semibold text-gray-900">Complete Demo Project</p>
                <p className="text-sm text-gray-600">+50 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Complete Job</p>
                <p className="text-sm text-gray-600">+40 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-3xl">⭐</span>
              <div>
                <p className="font-semibold text-gray-900">Excellent Review (5 stars)</p>
                <p className="text-sm text-gray-600">+50 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-3xl">📅</span>
              <div>
                <p className="font-semibold text-gray-900">Daily Login</p>
                <p className="text-sm text-gray-600">+10 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
              <span className="text-3xl">✔️</span>
              <div>
                <p className="font-semibold text-gray-900">Verification Complete</p>
                <p className="text-sm text-gray-600">+75 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <span className="text-3xl">👤</span>
              <div>
                <p className="font-semibold text-gray-900">Complete Profile</p>
                <p className="text-sm text-gray-600">+20 XP</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center">
            💡 <strong>Level Up:</strong> You need 100 XP to advance to the next level!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
