import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../store/authSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchProviders from '../components/search/SearchProviders';
import SearchClients from '../components/search/SearchClients';

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to access dashboard.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Get verification status from user object
  const verificationStatus = (user as any).verification?.status || 'unverified';
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.fullName}! 👋
            </h1>
            <p className="text-gray-600">
              {user.role === 'provider'
                ? 'Find clients who need your services'
                : 'Find the perfect service provider for your needs'}
            </p>
          </div>

          {/* Verification Alert */}
          {!isVerified && (
            <div className={`mb-6 rounded-lg p-4 border ${
              verificationStatus === 'pending'
                ? 'bg-yellow-50 border-yellow-200'
                : verificationStatus === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {verificationStatus === 'pending' ? (
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  ) : verificationStatus === 'rejected' ? (
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    verificationStatus === 'pending'
                      ? 'text-yellow-800'
                      : verificationStatus === 'rejected'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {verificationStatus === 'pending'
                      ? '⏳ Verification Pending'
                      : verificationStatus === 'rejected'
                      ? '❌ Verification Rejected'
                      : '🔒 Account Not Verified'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    verificationStatus === 'pending'
                      ? 'text-yellow-700'
                      : verificationStatus === 'rejected'
                      ? 'text-red-700'
                      : 'text-blue-700'
                  }`}>
                    {verificationStatus === 'pending'
                      ? 'Your verification documents are under review. This usually takes 24-48 hours.'
                      : verificationStatus === 'rejected'
                      ? 'Your verification was rejected. Please submit valid documents again.'
                      : `Get verified to ${user.role === 'client' ? 'post jobs and hire providers' : 'accept job offers and work with clients'}. Submit your PAN card and Aadhar card.`}
                  </p>
                  <button
                    onClick={() => navigate('/verification')}
                    className={`mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                      verificationStatus === 'pending'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : verificationStatus === 'rejected'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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

          {/* Search Section */}
          <div className="mb-8">
            {user.role === 'provider' ? (
              <SearchClients />
            ) : (
              <SearchProviders />
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {user.role === 'provider' ? 'Jobs Completed' : 'Jobs Posted'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{user.completedJobs || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.rating ? `${user.rating.toFixed(1)} ⭐` : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">
                {user.role === 'provider'
                  ? 'Start browsing available jobs'
                  : 'Post a job to get started'}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
