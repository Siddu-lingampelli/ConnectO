import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { selectCurrentUser, updateUser } from '../store/authSlice';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import DemoStatusCard from '../components/demo/DemoStatusCard';
import { 
  DocumentIcon, 
  UserIcon, 
  StarIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  CurrencyIcon,
  SmartphoneIcon
} from '../components/icons/PremiumIcons';

// Categories for exploration section
const categories = [
  { name: 'Web Development', jobs: '2,451' },
  { name: 'Graphic Design', jobs: '1,823' },
  { name: 'Digital Marketing', jobs: '1,567' },
  { name: 'Writing & Translation', jobs: '1,234' },
  { name: 'Video & Animation', jobs: '987' },
  { name: 'Music & Audio', jobs: '654' },
  { name: 'Programming & Tech', jobs: '2,103' },
  { name: 'Business', jobs: '876' },
];

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get the active role
  const activeRole = user?.activeRole || user?.role || 'client';

  // Fetch fresh user data
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const freshUserData = await authService.getMe();
        dispatch(updateUser(freshUserData));
      } catch (error: any) {
        console.error('Error refreshing user data:', error);
        if (error.response && error.response.status !== 401) {
          toast.error('Failed to refresh user data. Please refresh the page.');
        }
      }
    };
    refreshUserData();
  }, [dispatch]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">Please login to access dashboard.</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const verificationStatus = (user as any).verification?.status || 'unverified';
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Main Content - Full Width Layout */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-6 py-24">
          
          {/* Welcome Banner - Fiverr Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-2xl overflow-hidden mb-8 border border-border shadow-soft"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative px-6 py-8 sm:px-10 sm:py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Welcome Text */}
                <div className="flex-1">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tighter mb-2"
                  >
                    Welcome back, {user.fullName}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-text-secondary text-lg"
                  >
                    {activeRole === 'provider' 
                      ? 'Ready to find your next opportunity?' 
                      : 'Find the perfect freelancer for your project'}
                  </motion.p>
                </div>

                {/* Quick Stats */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex gap-4"
                >
                  <div className="bg-surface rounded-xl px-6 py-4 border border-border">
                    <div className="text-text-muted text-sm font-medium mb-1">Balance</div>
                    <div className="text-2xl font-semibold text-text-primary">₹0</div>
                  </div>
                  <div className="bg-surface rounded-xl px-6 py-4 border border-border">
                    <div className="text-text-muted text-sm font-medium mb-1">Rating</div>
                    <div className="text-2xl font-semibold text-text-primary flex items-center gap-1">
                      {user.rating ? user.rating.toFixed(1) : 'N/A'}
                      <svg className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Verification Alert */}
          {!isVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-warning/10 border border-warning/20 rounded-xl p-6 mb-8 flex items-start gap-4"
            >
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">Complete Your Profile</h3>
                <p className="text-text-secondary text-sm mb-3">
                  Verify your account to {activeRole === 'client' ? 'post jobs and hire freelancers' : 'apply for jobs and start earning'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/verification')}
                  className="bg-primary text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-200"
                >
                  Get Verified Now
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Demo Status Card - For Providers */}
          {activeRole === 'provider' && isVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mb-8"
            >
              <DemoStatusCard />
            </motion.div>
          )}

          {/* Recommended Actions Section - Fiverr Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-text-primary tracking-tighter mb-6">Recommended for you</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Action Card 1 */}
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer"
                onClick={() => navigate(activeRole === 'client' ? '/post-job' : '/jobs')}
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <DocumentIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {activeRole === 'client' ? 'Post a Project Brief' : 'Browse Available Jobs'}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {activeRole === 'client' 
                    ? 'Share your project details and connect with talented freelancers'
                    : 'Explore opportunities that match your skills and expertise'}
                </p>
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  Get Started
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>

              {/* Action Card 2 */}
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Add your skills, portfolio, and experience to stand out from the crowd
                </p>
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  Update Profile
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>

              {/* Action Card 3 */}
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <SmartphoneIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download ConnectO App</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Take your work with you - manage projects on the go with our mobile app
                </p>
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  Coming Soon
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Explore Categories Section - Fiverr Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/jobs')}
                className="text-emerald-600 font-medium text-sm flex items-center gap-1 hover:text-emerald-700"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + (index * 0.05) }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 cursor-pointer group shadow-soft hover:shadow-md"
                  onClick={() => navigate(`/jobs?category=${encodeURIComponent(category.name)}`)}
                >
                  <h3 className="font-semibold text-neutral-900 mb-1">{category.name}</h3>
                  <p className="text-neutral-600 text-sm">{category.jobs} jobs available</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-text-primary tracking-tighter mb-6">Your Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-semibold text-text-primary mb-1">{user.completedJobs || 0}</div>
                <div className="text-text-secondary text-sm">
                  {activeRole === 'provider' ? 'Completed Jobs' : 'Posted Jobs'}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <div className="text-3xl font-semibold text-text-primary mb-1">
                  {user.rating ? user.rating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-text-secondary text-sm">Your Rating</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <MessageCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-semibold text-text-primary mb-1">0</div>
                <div className="text-text-secondary text-sm">Messages</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <CurrencyIcon className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <div className="text-3xl font-semibold text-text-primary mb-1">₹0</div>
                <div className="text-text-secondary text-sm">Balance</div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
