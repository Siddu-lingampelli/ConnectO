import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectCurrentUser, updateUser } from '../store/authSlice';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchProviders from '../components/search/SearchProviders';
import SearchClients from '../components/search/SearchClients';
import DemoStatusCard from '../components/demo/DemoStatusCard';
import RecommendationsCard from '../components/recommendations/RecommendationsCard';
import CollaborationInvitations from '../components/collaboration/CollaborationInvitations';

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  // Get the active role - use activeRole if available, fallback to role
  const activeRole = user?.activeRole || user?.role || 'client';

  // Animate on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch fresh user data on component mount to ensure verification status is up-to-date
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const freshUserData = await authService.getMe();
        dispatch(updateUser(freshUserData));
      } catch (error: any) {
        console.error('Error refreshing user data:', error);
        // Only show error if it's not just the backend being unavailable
        if (error.response) {
          // Backend responded with an error
          if (error.response.status !== 401) {
            // Don't show error for authentication issues, just let it redirect
            toast.error('Failed to refresh user data. Please refresh the page.');
          }
        }
        // Silently fail for network errors (backend not running)
      }
    };

    refreshUserData();
  }, [dispatch]); // Run on mount and when dispatch changes

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse-soft">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-[#345635] text-lg font-medium">Please login to access dashboard.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get verification status from user object
  const verificationStatus = (user as any).verification?.status || 'unverified';
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section with Animation */}
          <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gradient-to-r from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-2xl p-8 shadow-xl relative overflow-hidden">
              {/* Animated background patterns */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                    <span className="text-4xl">
                      {activeRole === 'provider' ? '💼' : '🎯'}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                      Welcome back, {user.fullName} 
                      <span className="animate-bounce inline-block"></span>
                    </h1>
                    <p className="text-[#E3EFD3] text-lg">
                      {activeRole === 'provider'
                        ? 'Ready to find your next opportunity?'
                        : 'Find the perfect service provider for your needs'}
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats in Welcome Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-[#E3EFD3] text-sm mb-1">
                      {activeRole === 'provider' ? 'Completed' : 'Posted'}
                    </div>
                    <div className="text-white text-2xl font-bold">{user.completedJobs || 0}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-[#E3EFD3] text-sm mb-1">Rating</div>
                    <div className="text-white text-2xl font-bold flex items-center gap-1">
                      {user.rating ? user.rating.toFixed(1) : 'N/A'}
                      <span className="text-yellow-300"></span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-[#E3EFD3] text-sm mb-1">Balance</div>
                    <div className="text-white text-2xl font-bold">₹0</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-[#E3EFD3] text-sm mb-1">Messages</div>
                    <div className="text-white text-2xl font-bold">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Alert - Emerald Theme */}
          {!isVerified && (
            <div className={`mb-6 rounded-2xl p-6 border-2 shadow-lg transition-all duration-700 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${
              verificationStatus === 'pending'
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                : verificationStatus === 'rejected'
                ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
                : 'bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0]/30 border-[#6B8F71]'
            }`} style={{ transitionDelay: '100ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    verificationStatus === 'pending'
                      ? 'bg-yellow-400'
                      : verificationStatus === 'rejected'
                      ? 'bg-red-400'
                      : 'bg-gradient-to-br from-[#6B8F71] to-[#345635]'
                  } shadow-lg`}>
                    {verificationStatus === 'pending' ? (
                      <svg className="w-7 h-7 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    ) : verificationStatus === 'rejected' ? (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    verificationStatus === 'pending'
                      ? 'text-yellow-900'
                      : verificationStatus === 'rejected'
                      ? 'text-red-900'
                      : 'text-[#0D2B1D]'
                  }`}>
                    {verificationStatus === 'pending'
                      ? ' Verification Pending'
                      : verificationStatus === 'rejected'
                      ? '❌Verification Rejected'
                      : ' Account Not Verified'}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    verificationStatus === 'pending'
                      ? 'text-yellow-800'
                      : verificationStatus === 'rejected'
                      ? 'text-red-800'
                      : 'text-[#345635]'
                  }`}>
                    {verificationStatus === 'pending'
                      ? 'Your verification documents are under review. This usually takes 24-48 hours.'
                      : verificationStatus === 'rejected'
                      ? 'Your verification was rejected. Please submit valid documents again.'
                      : `Get verified to ${activeRole === 'client' ? 'post jobs and hire providers' : 'accept job offers and work with clients'}. Submit your PAN card and Aadhar card.`}
                  </p>
                  <button
                    onClick={() => navigate('/verification')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg ${
                      verificationStatus === 'pending'
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : verificationStatus === 'rejected'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white hover:from-[#0D2B1D] hover:to-[#345635]'
                    }`}
                  >
                    {verificationStatus === 'pending'
                      ? 'View Status'
                      : verificationStatus === 'rejected'
                      ? 'Resubmit Documents'
                      : 'Get Verified Now →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Collaboration Invitations for Providers */}
          {activeRole === 'provider' && (
            <div className={`mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '150ms' }}>
              <CollaborationInvitations />
            </div>
          )}

          {/* Search Section with Animation */}
          <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            {activeRole === 'provider' ? (
              <SearchClients />
            ) : (
              <SearchProviders />
            )}
          </div>

          {/* Demo Project Status for Providers */}
          {activeRole === 'provider' && (
            <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
              <DemoStatusCard />
            </div>
          )}

          {/* Quick Actions - Emerald Theme */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-gradient-to-b from-[#345635] to-[#6B8F71] rounded-full"></span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {user.role === 'admin' ? (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform"></span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Admin Dashboard</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Platform overview & stats</p>
                </button>

                <button
                  onClick={() => navigate('/admin/users')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#345635] hover:to-[#6B8F71] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">👥</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Manage Users</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">View all clients & providers</p>
                </button>

                <button
                  onClick={() => navigate('/admin/verifications')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#6B8F71] hover:to-[#AEC3B0] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">✅</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Verifications</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Review & approve requests</p>
                </button>

                <button
                  onClick={() => navigate('/jobs')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">All Jobs</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Monitor platform jobs</p>
                </button>
              </>
            ) : activeRole === 'provider' ? (
              <>
                <button
                  onClick={() => navigate('/jobs')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">🔍</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Browse Jobs</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Find new job opportunities</p>
                </button>

                <button
                  onClick={() => navigate('/my-proposals')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#345635] hover:to-[#6B8F71] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">📝</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">My Proposals</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">View & edit your proposals</p>
                </button>

                <button
                  onClick={() => navigate('/my-orders')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#6B8F71] hover:to-[#AEC3B0] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">💼</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">My Active Work</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">View ongoing jobs & deliveries</p>
                </button>

                <button
                  onClick={() => navigate('/messages')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Messages</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Chat with clients</p>
                </button>

                <button
                  onClick={() => navigate('/leaderboard')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#345635] hover:to-[#6B8F71] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">🏆</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Leaderboard</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">See your ranking & earn XP</p>
                </button>

                <button
                  onClick={() => navigate('/referrals')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#6B8F71] hover:to-[#AEC3B0] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">🎁</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Referrals</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Invite friends & earn ₹50 + 100 XP</p>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">⚙️</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Settings & Portfolio</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Manage profile & showcase work</p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/post-job')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">➕</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Post a Job</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Hire service providers</p>
                </button>

                <button
                  onClick={() => navigate('/browse-providers')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#345635] hover:to-[#6B8F71] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">🔍</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Browse Providers</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Find service providers</p>
                </button>

                <button
                  onClick={() => navigate('/jobs')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#6B8F71] hover:to-[#AEC3B0] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">My Jobs</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Manage posted jobs</p>
                </button>

                <button
                  onClick={() => navigate('/ongoing-jobs')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">⚙️</span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Ongoing Work</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Track work progress</p>
                </button>

                <button
                  onClick={() => navigate('/leaderboard')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#345635] hover:to-[#6B8F71] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform"></span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Leaderboard</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">See top contributors & rankings</p>
                </button>

                <button
                  onClick={() => navigate('/referrals')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#6B8F71] hover:to-[#AEC3B0] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#AEC3B0] to-[#E3EFD3] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform"></span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Referrals</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Invite friends & earn ₹100 + 120 XP</p>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="group bg-white hover:bg-gradient-to-br hover:from-[#0D2B1D] hover:to-[#345635] border-2 border-[#AEC3B0] hover:border-transparent text-left rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-on-scroll"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#345635] to-[#6B8F71] group-hover:bg-white rounded-xl flex items-center justify-center shadow-md transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform"></span>
                    </div>
                    <svg className="w-6 h-6 text-[#6B8F71] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B1D] group-hover:text-white mb-2 transition-colors">Settings</h3>
                  <p className="text-[#6B8F71] group-hover:text-[#E3EFD3] text-sm transition-colors">Manage your preferences</p>
                </button>
              </>
            )}
            </div>
          </div>

          {/* AI-Powered Recommendations */}
          <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
            <RecommendationsCard />
          </div>

          {/* Recent Activity - Emerald Theme */}
          <div className={`bg-white rounded-2xl shadow-lg border-2 border-[#E3EFD3] p-8 hover:shadow-2xl transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-8 bg-gradient-to-b from-[#345635] to-[#6B8F71] rounded-full"></span>
              <h2 className="text-2xl font-bold text-[#0D2B1D]">Recent Activity</h2>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse-soft">
                <span className="text-4xl"></span>
              </div>
              <p className="text-[#345635] font-semibold text-lg mb-2">No recent activity</p>
              <p className="text-[#6B8F71] mt-2">
                {activeRole === 'provider'
                  ? 'Start browsing available jobs to get started'
                  : 'Post a job to find the perfect service provider'}
              </p>
              <button
                onClick={() => navigate(activeRole === 'provider' ? '/jobs' : '/post-job')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-xl font-semibold hover:from-[#0D2B1D] hover:to-[#345635] transition-all hover:scale-105 hover:shadow-lg"
              >
                {activeRole === 'provider' ? 'Browse Jobs →' : 'Post a Job →'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
