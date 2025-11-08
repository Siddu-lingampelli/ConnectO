import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';

const Landing = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(true);
  const [initialRole, setInitialRole] = useState<'client' | 'provider'>('client');
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (location.pathname === '/register') {
      setShowLogin(false);
      const role = searchParams.get('role');
      if (role === 'provider') {
        setInitialRole('provider');
      }
    } else if (location.pathname === '/login') {
      setShowLogin(true);
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await websiteReviewService.getApprovedReviews(6);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await websiteReviewService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Trusted by professionals worldwide</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
                {t('landing.heroTitle')}
                <span className="block mt-2">{t('landing.heroTitleHighlight')}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">{t('landing.heroSubtitle')}</p>
              <div className="flex items-center gap-4 pt-4">
                <button onClick={() => setShowLogin(false)} className="px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  {t('landing.getStarted')}
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-gray-700 font-medium hover:text-gray-900 transition-colors">
                  {t('landing.learnMore')}
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
              <div className="flex gap-2 mb-8 p-1 bg-gray-50 rounded-lg">
                <button className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${showLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setShowLogin(true)}>
                  {t('auth.login')}
                </button>
                <button className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${!showLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setShowLogin(false)}>
                  {t('auth.register')}
                </button>
              </div>
              <div>
                {showLogin ? <LoginForm onSuccess={handleAuthSuccess} /> : <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setShowLogin(true)} initialRole={initialRole} />}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">{t('landing.whyChoose')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('landing.whyChooseSubtitle')}</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Landing;
