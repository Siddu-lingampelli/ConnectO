import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n/config'; // Initialize i18n

// Components
import Chatbot from './components/Chatbot';
import AdvancedVoiceNavigator from './components/voice/AdvancedVoiceNavigator';
import EnhancedAIAssistant from './components/ai/EnhancedAIAssistant';

// Pages
import Home from './pages/Home';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Verification from './pages/Verification';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import EditProposal from './pages/EditProposal';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import JobProposals from './pages/JobProposals';
import MyOrders from './pages/MyOrders';
import MyProposals from './pages/MyProposals';
import OngoingJobs from './pages/OngoingJobs';
import OrderDetails from './pages/OrderDetails';
import NotFound from './pages/NotFound';
import NotificationsPage from './pages/NotificationsPage';
import BrowseProviders from './pages/BrowseProviders';
import Leaderboard from './pages/Leaderboard';
import Referrals from './pages/Referrals';
import FindNearbyProviders from './pages/FindNearbyProviders';
import SubmitReview from './pages/SubmitReview';
import UserReviews from './pages/UserReviews';
import Wishlist from './pages/Wishlist';
import FollowersFollowing from './pages/FollowersFollowing';
import Collaboration from './pages/Collaboration';
import Community from './pages/Community';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ProviderEarnings from './pages/ProviderEarnings';
import GDPRSettings from './pages/GDPRSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminJobs from './pages/admin/AdminJobs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminProposals from './pages/admin/AdminProposals';
import AdminDemos from './pages/admin/AdminDemos';

// Middleware
import ProtectedRoute from './middleware/protectedRoute';

function App() {
  return (
    <>
      {/* AI Chatbot Assistant - Available on all pages */}
      <Chatbot />
      
      {/* Advanced Voice Navigation - Available on all pages */}
      <AdvancedVoiceNavigator />
      
      {/* Enhanced AI Assistant - Available on all pages */}
      <EnhancedAIAssistant />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Landing />} />
        <Route path="/register" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId?"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gdpr-settings"
          element={
            <ProtectedRoute>
              <GDPRSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification"
          element={
            <ProtectedRoute>
              <Verification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute>
              <ProviderEarnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-providers"
          element={
            <ProtectedRoute>
              <BrowseProviders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <Referrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-nearby"
          element={
            <ProtectedRoute>
              <FindNearbyProviders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-review"
          element={
            <ProtectedRoute>
              <SubmitReview />
            </ProtectedRoute>
          }
        />
        <Route path="/reviews" element={<UserReviews />} />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/followers-following/:userId?"
          element={
            <ProtectedRoute>
              <FollowersFollowing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaboration"
          element={
            <ProtectedRoute>
              <Collaboration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/apply"
          element={
            <ProtectedRoute>
              <ApplyJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute>
              <EditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:id/edit"
          element={
            <ProtectedRoute>
              <EditProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/proposals"
          element={
            <ProtectedRoute>
              <JobProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-proposals"
          element={
            <ProtectedRoute>
              <MyProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ongoing-jobs"
          element={
            <ProtectedRoute>
              <OngoingJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute>
              <AdminVerifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute>
              <AdminJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/proposals"
          element={
            <ProtectedRoute>
              <AdminProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/demos"
          element={
            <ProtectedRoute>
              <AdminDemos />
            </ProtectedRoute>
          }
        />

        {/* Public Information Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
