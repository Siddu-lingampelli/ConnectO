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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary font-medium">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-primary hover:text-text-primary transition-all group font-medium"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
                <FiGift className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-4xl font-semibold text-text-primary tracking-tighter mb-2">
              Referral Program
            </h1>
            <p className="text-text-secondary text-lg">
              Invite friends and earn rewards! Get ₹50 credits + 100 XP for each successful referral.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Referrals</p>
                <p className="text-4xl font-semibold text-text-primary mt-1">{stats?.referralCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FiUsers className="text-primary" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Available Credits</p>
                <p className="text-4xl font-semibold text-primary mt-1">₹{stats?.referralCredits || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FiDollarSign className="text-primary" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Earnings</p>
                <p className="text-4xl font-semibold text-text-primary mt-1">₹{stats?.referralEarnings || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FiAward className="text-primary" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Reward Per Referral</p>
                <p className="text-2xl font-semibold text-primary mt-1">₹50 + 100 XP</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FiGift className="text-primary" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-border p-8 mb-8 animate-fade-in-up hover:shadow-medium transition-all duration-200">
          <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Your Referral Code
          </h2>
          
          {stats?.referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-surface rounded-2xl p-6 font-mono text-3xl font-semibold text-center text-primary border-2 border-primary/30 shadow-soft">
                  {stats.referralCode}
                </div>
                <button
                  onClick={copyReferralCode}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:shadow-medium transition-all duration-200 flex items-center gap-2"
                >
                  <FiCopy size={20} /> Copy
                </button>
                <button
                  onClick={shareReferral}
                  className="px-8 py-4 bg-primary/80 text-white rounded-xl font-medium hover:shadow-medium transition-all duration-200 flex items-center gap-2"
                >
                  <FiShare2 size={20} /> Share
                </button>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-sm text-text-secondary font-medium">
                  <strong>Share this link:</strong>{' '}
                  <code className="bg-white px-3 py-1.5 rounded-lg text-primary font-mono text-xs border border-border">
                    {window.location.origin}/register?ref={stats.referralCode}
                  </code>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-surface rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-soft">
                <FiGift className="text-primary" size={60} />
              </div>
              <p className="text-text-secondary mb-6 text-lg font-medium">You don't have a referral code yet</p>
              <button
                onClick={generateReferralCode}
                className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:shadow-medium transition-all duration-200"
              >
                Generate Referral Code
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 animate-fade-in-up">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-primary hover:border-border'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('referred')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'referred'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-primary hover:border-border'
                }`}
              >
                People You Invited ({stats?.referredUsers.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'leaderboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-primary hover:border-border'
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
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-soft border border-border p-8 animate-fade-in-up hover:shadow-medium transition-all duration-200">
              <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-surface rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4 shadow-soft">
                    1
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">Share Your Code</h3>
                  <p className="text-sm text-text-secondary">
                    Share your unique referral code with friends and family
                  </p>
                </div>

                <div className="text-center p-6 bg-surface rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4 shadow-soft">
                    2
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">They Sign Up</h3>
                  <p className="text-sm text-text-secondary">
                    When they register using your code, you get rewards
                  </p>
                </div>

                <div className="text-center p-6 bg-surface rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-16 h-16 bg-primary/60 rounded-full flex items-center justify-center text-text-primary text-2xl font-semibold mx-auto mb-4 shadow-soft">
                    3
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">Earn Rewards</h3>
                  <p className="text-sm text-text-secondary">
                    Get credits + XP based on who you refer
                  </p>
                </div>
              </div>
            </div>

            {/* Role-Specific Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Benefits */}
              <div className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  For Service Providers
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Dynamic Rewards</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Provider: <span className="font-semibold text-primary">₹75 + 150 XP</span><br/>
                        Client: <span className="font-semibold text-primary">₹60 + 110 XP</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Build Your Team</h3>
                      <p className="text-xs text-text-secondary mt-1">5 providers = "Team Builder" badge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Priority Verification</h3>
                      <p className="text-xs text-text-secondary mt-1">10+ referrals unlock faster approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Network Architect</h3>
                      <p className="text-xs text-text-secondary mt-1">10+ providers = Exclusive badge</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Benefits */}
              <div className="bg-white rounded-2xl shadow-soft border border-border p-6 hover:shadow-medium transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  For Clients
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Premium Rewards</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Client: <span className="font-semibold text-primary">₹100 + 120 XP</span><br/>
                        Provider: <span className="font-semibold text-primary">₹80 + 130 XP</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Community Builder</h3>
                      <p className="text-xs text-text-secondary mt-1">5 clients = Special badge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Talent Scout</h3>
                      <p className="text-xs text-text-secondary mt-1">5 providers = Talent Scout badge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface rounded-xl p-3 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">Posting Credits</h3>
                      <p className="text-xs text-text-secondary mt-1">Use for job postings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reward Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Referral Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Credits</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">XP</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Bonus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-surface transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-text-primary">Provider → Provider</td>
                      <td className="px-4 py-3 text-primary font-semibold">₹75</td>
                      <td className="px-4 py-3 text-primary font-semibold">150 XP</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">Team Building</td>
                    </tr>
                    <tr className="hover:bg-surface transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-text-primary">Client → Client</td>
                      <td className="px-4 py-3 text-primary font-semibold">₹100</td>
                      <td className="px-4 py-3 text-primary font-semibold">120 XP</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">Community Builder</td>
                    </tr>
                    <tr className="hover:bg-surface transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-text-primary">Client → Provider</td>
                      <td className="px-4 py-3 text-primary font-semibold">₹80</td>
                      <td className="px-4 py-3 text-primary font-semibold">130 XP</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">Talent Scout</td>
                    </tr>
                    <tr className="hover:bg-surface transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-text-primary">Provider → Client</td>
                      <td className="px-4 py-3 text-primary font-semibold">₹60</td>
                      <td className="px-4 py-3 text-primary font-semibold">110 XP</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">Network Expansion</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Badge Milestones */}
            <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Badge Milestones
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <FiGift className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">First Referral</h3>
                  <p className="text-xs text-text-secondary">1 referral</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Champion</h3>
                  <p className="text-xs text-text-secondary">5 referrals</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Master</h3>
                  <p className="text-xs text-text-secondary">10 referrals</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Trusted</h3>
                  <p className="text-xs text-text-secondary">10+ (Priority)</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Super</h3>
                  <p className="text-xs text-text-secondary">25 referrals</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Legend</h3>
                  <p className="text-xs text-text-secondary">50 referrals</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <FiUsers className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Team Builder</h3>
                  <p className="text-xs text-text-secondary">5 providers</p>
                </div>
                <div className="bg-surface p-3 rounded-xl border border-border hover:shadow-soft transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">Community</h3>
                  <p className="text-xs text-text-secondary">5 clients</p>
                </div>
              </div>
            </div>

            {stats?.referredBy && (
              <div className="p-4 bg-surface border border-border rounded-xl">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">You were referred by:</strong> {stats.referredBy.name} ({stats.referredBy.email})
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'referred' && (
          <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">People You Invited</h2>
            {stats?.referredUsers && stats.referredUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.referredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-surface rounded-xl hover:shadow-soft transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{user.name}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'provider' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUsers className="text-text-muted mx-auto mb-4" size={60} />
                <p className="text-text-secondary">No referrals yet</p>
                <p className="text-sm text-text-muted mt-2">
                  Start inviting friends to earn rewards!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Top Referrers</h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      entry.id === currentUser?._id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-surface hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-orange-600' :
                        'bg-primary'
                      }`}>
                        {entry.rank <= 3 ? `#${entry.rank}` : `#${entry.rank}`}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {entry.name}
                          {entry.id === currentUser?._id && (
                            <span className="ml-2 text-xs text-primary font-medium">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-text-secondary capitalize">{entry.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-text-primary">{entry.referralCount} referrals</p>
                      <p className="text-sm text-text-secondary">₹{entry.totalEarnings} earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiAward className="text-text-muted mx-auto mb-4" size={60} />
                <p className="text-text-secondary">No leaderboard data yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
