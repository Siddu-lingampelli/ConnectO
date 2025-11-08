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
      <span className={`text-2xl font-semibold ${badge.color}`}>
        {badge.emoji}
      </span>
    );
  };

  const getLevelColor = (level: number) => {
    return gamificationService.getLevelColor(level);
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Back Button - Emerald Theme */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-primary hover:text-text-primary transition-all  group font-medium"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* Header - Emerald Theme */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-text-primary tracking-tighter mb-2">
            Leaderboard
          </h1>
          <p className="text-text-secondary text-lg">
            See how you rank among the top service providers
          </p>
        </div>

        {/* My Rank Card (Only for Providers) - Emerald Theme */}
        {user?.role === 'provider' && myRank && (
          <div className="bg-white rounded-2xl shadow-soft border border-primary/30 p-6 mb-6 animate-fade-in-up hover:shadow-medium transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Your Rank
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-5xl font-semibold text-primary">#{myRank.rank}</p>
                    <p className="text-xs text-text-secondary mt-1">out of {myRank.totalProviders}</p>
                  </div>
                  <div className="text-center px-6 py-3 bg-surface rounded-xl border border-border">
                    <p className="text-sm text-text-secondary font-medium">Top</p>
                    <p className="text-2xl font-semibold text-text-primary">{myRank.percentile}%</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <span className="text-sm text-text-secondary">Level </span>
                  <span className={`text-3xl font-semibold bg-gradient-to-r ${getLevelColor(myRank.user.level)} bg-clip-text text-transparent`}>
                    {myRank.user.level}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-[#E3EFD3]/50 rounded-xl">
                    <p className="text-xs text-text-secondary mb-1">XP</p>
                    <p className="text-xl font-semibold text-primary">{myRank.user.xp}</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-[#E3EFD3]/50 rounded-xl">
                    <p className="text-xs text-text-secondary mb-1">Badges</p>
                    <p className="text-xl font-semibold text-primary">{myRank.user.badges}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Emerald Theme */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-soft border border-border p-5 text-center hover:shadow-soft transition-all duration-200 animate-fade-in-up group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl mx-auto mb-3 flex items-center justify-center ">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary mb-1 font-medium">Total Providers</p>
              <p className="text-2xl font-semibold text-text-primary">{stats.totalProviders}</p>
            </div>
            {stats.highestLevel && (
              <div className="bg-white rounded-2xl shadow-soft border border-border p-5 text-center hover:shadow-soft transition-all duration-200 animate-fade-in-up group" style={{ animationDelay: '100ms' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/70 to-primary/40 rounded-xl mx-auto mb-3 flex items-center justify-center ">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary mb-1 font-medium">Highest Level</p>
                <p className="text-2xl font-semibold text-text-primary">{stats.highestLevel.level}</p>
                <p className="text-xs text-text-secondary">{stats.highestLevel.name}</p>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-soft border border-border p-5 text-center hover:shadow-soft transition-all duration-200 animate-fade-in-up group" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-surface to-surface rounded-xl mx-auto mb-3 flex items-center justify-center ">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary mb-1 font-medium">Avg Level</p>
              <p className="text-2xl font-semibold text-text-primary">{stats.averages.avgLevel.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-border p-5 text-center hover:shadow-soft transition-all duration-200 animate-fade-in-up group" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/70 to-primary/40 rounded-xl mx-auto mb-3 flex items-center justify-center ">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary mb-1 font-medium">Avg Rating</p>
              <p className="text-2xl font-semibold text-text-primary">{stats.averages.avgRating.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Filters - Emerald Theme */}
        <div className="bg-white rounded-2xl shadow-soft border border-border p-5 mb-6 animate-fade-in-up hover:shadow-soft transition-all duration-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-primary">Provider Type:</label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-[#6B8F71] focus:border-primary transition-all bg-white text-primary font-medium hover:border-primary"
              >
                <option value="all">All Types</option>
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>
            <div className="text-sm text-text-secondary ml-auto flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#345635] rounded-full animate-pulse-soft"></span>
              Showing all-time rankings
            </div>
          </div>
        </div>

        {/* Leaderboard Table - Emerald Theme */}
        <div className="bg-white rounded-2xl shadow-medium border border-border overflow-hidden animate-fade-in-up">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-surface to-surface rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-text-secondary font-medium">No providers found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0D2B1D] via-[#345635] to-[#6B8F71] text-white">
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
                <tbody className="divide-y divide-[#E3EFD3]">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.user._id}
                      className={`hover:bg-[#F8FBF9] transition-all duration-200 ${
                        entry.user._id === user?._id ? 'bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] border-l-4 border-primary' : ''
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
                              className="w-12 h-12 rounded-full object-cover border border-border "
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold ">
                              {entry.user.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-text-primary">
                              {entry.user.fullName}
                              {entry.user._id === user?._id && (
                                <span className="ml-2 text-xs bg-gradient-to-r from-primary to-primary-dark text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                  You
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                              {entry.user.city && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {entry.user.city}
                                </span>
                              )}
                              {entry.user.providerType && (
                                <span className={`px-2 py-0.5 rounded-full font-medium ${
                                  entry.user.providerType === 'Technical'
                                    ? 'bg-[#E3EFD3] text-primary'
                                    : 'bg-[#AEC3B0] text-text-primary'
                                }`}>
                                  {entry.user.providerType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Level - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${getLevelColor(entry.level)} text-white font-semibold shadow-soft hover:scale-110 transition-transform`}>
                          {entry.level}
                        </div>
                      </td>
                      
                      {/* XP - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-semibold text-primary">{entry.xp.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary">XP</p>
                      </td>
                      
                      {/* Badges - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-semibold text-text-primary">{entry.badges}</p>
                        <p className="text-xs text-text-secondary">badges</p>
                      </td>
                      
                      {/* Jobs - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-semibold text-primary">{entry.completedJobs}</p>
                        <p className="text-xs text-text-secondary">jobs</p>
                      </td>
                      
                      {/* Rating - Emerald Theme */}
                      <td className="px-6 py-4 text-center">
                        <div>
                          {entry.rating > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <p className="text-lg font-semibold text-text-primary">{entry.rating.toFixed(1)}</p>
                              <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </div>
                          ) : (
                            <p className="text-lg font-semibold text-text-primary">—</p>
                          )}
                          {entry.totalReviews > 0 && (
                            <p className="text-xs text-text-secondary">({entry.totalReviews} reviews)</p>
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
        <div className="mt-8 bg-white rounded-2xl shadow-medium border border-border p-8 animate-fade-in-up hover:shadow-medium transition-all duration-200">
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-soft">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-text-primary">How XP Works</h2>
            <p className="text-text-secondary mt-2">Earn experience points to level up and climb the leaderboard</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border border-border  transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center  ">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Complete Demo Project</p>
                <p className="text-sm text-text-secondary font-semibold">+50 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border border-border  transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/70 to-primary/40 rounded-xl flex items-center justify-center  ">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Complete Job</p>
                <p className="text-sm text-text-secondary font-semibold">+40 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border border-border  transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-surface to-surface rounded-xl flex items-center justify-center  ">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Excellent Review (5 stars)</p>
                <p className="text-sm text-text-secondary font-semibold">+50 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border border-border  transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center  ">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Daily Login</p>
                <p className="text-sm text-text-secondary font-semibold">+10 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border border-border  transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/70 to-primary/40 rounded-xl flex items-center justify-center  ">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Verification Complete</p>
                <p className="text-sm text-text-secondary font-semibold">+75 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl border border-border  transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-surface to-surface rounded-xl flex items-center justify-center  ">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Complete Profile</p>
                <p className="text-sm text-text-secondary font-semibold">+20 XP</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/70 to-primary/40 rounded-xl ">
            <p className="text-sm text-white text-center font-semibold flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <strong>Level Up:</strong> You need 100 XP to advance to the next level!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
