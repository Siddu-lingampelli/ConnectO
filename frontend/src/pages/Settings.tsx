import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AccountSettings from '../components/settings/AccountSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import PaymentSettings from '../components/settings/PaymentSettings';
import PortfolioSettings from '../components/settings/PortfolioSettings';
import LocationSettings from '../components/LocationSettings';
import WebsiteReviewForm from '../components/WebsiteReviewForm';
import { 
  UserIcon, 
  LockIcon, 
  BellIcon, 
  ShieldIcon, 
  BriefcaseIcon, 
  StarIcon 
} from '../components/icons/PremiumIcons';

type SettingsTab = 'account' | 'security' | 'notifications' | 'privacy' | 'payment' | 'portfolio' | 'location' | 'review' | 'gdpr';

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'account');

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['account', 'security', 'notifications', 'privacy', 'payment', 'portfolio', 'location', 'review', 'gdpr'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium">Please login to access settings.</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <LockIcon className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldIcon className="w-5 h-5" /> },
    // GDPR Compliance - Privacy & Data Management
    { id: 'gdpr', label: 'Privacy & Data', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> },
    // Only show payment and portfolio for clients and providers
    ...(user.role !== 'admin' ? [{ id: 'payment' as SettingsTab, label: 'Payment', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }] : []),
    ...(user.role === 'provider' ? [{ id: 'portfolio' as SettingsTab, label: 'Portfolio', icon: <BriefcaseIcon className="w-5 h-5" /> }] : []),
    // Location settings for all users
    { id: 'location', label: 'Location', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    // Review the website
    { id: 'review', label: 'Review Site', icon: <StarIcon className="w-5 h-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings user={user} />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings user={user} />;
      case 'privacy':
        return <PrivacySettings user={user} />;
      case 'gdpr':
        // Redirect to dedicated GDPR page
        navigate('/gdpr-settings');
        return null;
      case 'payment':
        return <PaymentSettings user={user} />;
      case 'portfolio':
        return user.role === 'provider' ? <PortfolioSettings user={user} /> : null;
      case 'location':
        return <LocationSettings />;
      case 'review':
        return <WebsiteReviewForm onSuccess={() => navigate('/dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button - Emerald Theme */}
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-all group font-medium"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </motion.button>

          {/* Header - Emerald Theme */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation - Emerald Theme */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sticky top-24">
                <nav className="space-y-2">
                  {tabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105 font-bold'
                          : 'text-[#345635] hover:bg-[#E3EFD3] hover:scale-102 font-medium'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="flex items-center">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Content Area - Emerald Theme */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
                {renderTabContent()}
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
