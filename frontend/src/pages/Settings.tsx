import { useState, useEffect } from 'react';
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

type SettingsTab = 'account' | 'security' | 'notifications' | 'privacy' | 'payment' | 'portfolio' | 'location' | 'review';

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'account');

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['account', 'security', 'notifications', 'privacy', 'payment', 'portfolio', 'location', 'review'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3]">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-[#6B8F71] text-lg font-medium">Please login to access settings.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    // Only show payment and portfolio for clients and providers
    ...(user.role !== 'admin' ? [{ id: 'payment' as SettingsTab, label: 'Payment', icon: '💳' }] : []),
    ...(user.role === 'provider' ? [{ id: 'portfolio' as SettingsTab, label: 'Portfolio', icon: '💼' }] : []),
    // Location settings for all users
    { id: 'location', label: 'Location', icon: '🗺️' },
    // Review the website
    { id: 'review', label: 'Review Site', icon: '⭐' },
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button - Emerald Theme */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#345635] hover:text-[#0D2B1D] mb-6 transition-all hover:scale-105 group font-medium"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>

          {/* Header - Emerald Theme */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">Settings</h1>
                <p className="text-[#6B8F71] text-lg">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation - Emerald Theme */}
            <div className="lg:col-span-1 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] p-5 sticky top-24">
                <nav className="space-y-2">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105 font-bold'
                          : 'text-[#345635] hover:bg-[#E3EFD3] hover:scale-102 font-medium'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-2xl">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area - Emerald Theme */}
            <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] p-8 hover:shadow-2xl transition-shadow duration-300">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
