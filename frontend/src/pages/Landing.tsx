import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';

// New Emerald Essence Landing Page Design
const Landing = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(true);
  const [initialRole, setInitialRole] = useState<'client' | 'provider'>('client');
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Check if we're on /login or /register route
  useEffect(() => {
    if (location.pathname === '/register') {
      setShowLogin(false);
      // Get role from URL parameter
      const role = searchParams.get('role');
      if (role === 'provider') {
        setInitialRole('provider');
      }
    } else if (location.pathname === '/login') {
      setShowLogin(true);
    }
  }, [location.pathname, searchParams]);

  // Load reviews and stats
  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

  // Scroll animations
  useEffect(() => {
    setIsVisible(true);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
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
          <span
            key={i}
            className={`text-lg transition-all duration-300 ${
              i < rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#AEC3B0]">
      <Header />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#6B8F71] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#345635] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#AEC3B0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Hero Content */}
              <div className="text-left space-y-8 animate-on-scroll">
                <div className="inline-block">
                  <span className="px-4 py-2 bg-[#0D2B1D] text-[#E3EFD3] text-sm font-medium rounded-full shadow-lg animate-pulse">
                    🚀 {t('landing.welcome')}
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0D2B1D] leading-tight">
                  {t('landing.heroTitle')}
                  <span className="block text-[#345635] mt-2 relative">
                    {t('landing.heroTitleHighlight')}
                    <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C60 2 140 2 198 10" stroke="#6B8F71" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-[#345635] leading-relaxed font-light">
                  {t('landing.heroSubtitle')}
                  <span className="block mt-2 font-medium text-[#0D2B1D]">{t('landing.heroSubtitleBold')}</span>
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => setShowLogin(false)}
                    className="group px-8 py-4 bg-[#0D2B1D] text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-[#345635]/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    {t('landing.getStarted')}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 bg-white text-[#0D2B1D] border-2 border-[#6B8F71] rounded-xl font-semibold text-lg hover:bg-[#E3EFD3] hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    {t('landing.learnMore')}
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-8 pt-8 border-t border-[#AEC3B0]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0D2B1D]">10K+</div>
                    <div className="text-sm text-[#345635] font-medium">{t('landing.activeUsers')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0D2B1D]">5K+</div>
                    <div className="text-sm text-[#345635] font-medium">{t('landing.projectsDone')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0D2B1D]">4.8★</div>
                    <div className="text-sm text-[#345635] font-medium">{t('landing.avgRating')}</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Auth Card */}
              <div className="animate-on-scroll">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-[#AEC3B0]/30 hover:shadow-[#345635]/20 transition-all duration-500">
                  {/* Tab Switcher */}
                  <div className="flex gap-2 mb-8 bg-[#E3EFD3] p-2 rounded-xl">
                    <button
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        showLogin
                          ? 'bg-[#0D2B1D] text-white shadow-lg scale-105'
                          : 'text-[#345635] hover:bg-[#AEC3B0]/30'
                      }`}
                      onClick={() => setShowLogin(true)}
                    >
                      {t('auth.login')}
                    </button>
                    <button
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        !showLogin
                          ? 'bg-[#0D2B1D] text-white shadow-lg scale-105'
                          : 'text-[#345635] hover:bg-[#AEC3B0]/30'
                      }`}
                      onClick={() => setShowLogin(false)}
                    >
                      {t('auth.register')}
                    </button>
                  </div>

                  {/* Auth Forms */}
                  <div className="transition-all duration-500">
                    {showLogin ? (
                      <LoginForm onSuccess={handleAuthSuccess} />
                    ) : (
                      <RegisterForm
                        onSuccess={handleAuthSuccess}
                        onSwitchToLogin={() => setShowLogin(true)}
                        initialRole={initialRole}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E3EFD3]/10 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0D2B1D] mb-4">
                {t('landing.whyChoose')}
              </h2>
              <p className="text-xl text-[#345635] max-w-2xl mx-auto">
                {t('landing.whyChooseSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                  {t('landing.smartDiscovery')}
                </h3>
                                <p className="text-[#345635] leading-relaxed">
                  {t('landing.smartDiscoveryDesc')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                  {t('landing.verifiedProfiles')}
                </h3>
                <p className="text-[#345635] leading-relaxed">
                  {t('landing.verifiedProfilesDesc')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                  {t('landing.realTimeChat')}
                </h3>
                <p className="text-[#345635] leading-relaxed">
                  {t('landing.realTimeChatDesc')}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0D2B1D] to-[#6B8F71] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                  {t('landing.securePayments')}
                </h3>
                <p className="text-[#345635] leading-relaxed">
                  {t('landing.securePaymentsDesc')}
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#AEC3B0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                  {t('landing.reviewSystem')}
                </h3>
                <p className="text-[#345635] leading-relaxed">
                  {t('landing.reviewSystemDesc')}
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6B8F71] to-[#0D2B1D] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">
                  {t('landing.projectTracking')}
                </h3>
                <p className="text-[#345635] leading-relaxed">
                  {t('landing.projectTrackingDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {stats && stats.totalReviews > 0 ? (
        <section className="py-20 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#0D2B1D] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#E3EFD3] rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6B8F71] rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16 animate-on-scroll">
                <div className="inline-block mb-4">
                  <span className="px-6 py-2 bg-[#E3EFD3] text-[#0D2B1D] text-sm font-bold rounded-full shadow-lg">
                    💚 CUSTOMER SATISFACTION
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Loved by Our Community
                </h2>
                <p className="text-xl text-[#AEC3B0] max-w-2xl mx-auto mb-8">
                  Real experiences from real users who trust ConnectO
                </p>

                {/* Stats Cards */}
                <div className="flex justify-center gap-6 flex-wrap">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-[#E3EFD3] mb-2">
                      {stats.averageRating.toFixed(1)} ★
                    </div>
                    <div className="text-sm text-[#AEC3B0] font-medium">Average Rating</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-[#E3EFD3] mb-2">
                      {stats.totalReviews}+
                    </div>
                    <div className="text-sm text-[#AEC3B0] font-medium">Happy Users</div>
                  </div>
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {reviews.map((review, index) => (
                  <div
                    key={review._id}
                    className="animate-on-scroll bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Stars */}
                    <div className="mb-4">
                      {renderStars(review.rating)}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-xl text-[#0D2B1D] mb-3 group-hover:text-[#345635] transition-colors">
                      {review.title}
                    </h3>

                    {/* Review Text */}
                    <p className="text-[#345635] text-sm leading-relaxed mb-4 line-clamp-4">
                      "{review.review}"
                    </p>

                    {/* User Info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-[#AEC3B0]/30">
                      {review.user.profilePicture ? (
                        <img
                          src={review.user.profilePicture}
                          alt={review.user.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6B8F71]"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {review.user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-[#0D2B1D]">
                          {review.user.fullName}
                        </div>
                        <div className="text-xs text-[#6B8F71] capitalize font-medium">
                          {review.user.role}
                        </div>
                      </div>
                      {review.isFeatured && (
                        <span className="text-yellow-400 text-xl">🏆</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="text-center flex gap-4 justify-center flex-wrap animate-on-scroll">
                <button
                  onClick={() => navigate('/reviews')}
                  className="px-8 py-4 bg-white text-[#0D2B1D] rounded-xl hover:bg-[#E3EFD3] transition-all font-semibold shadow-2xl hover:scale-105 duration-300 flex items-center gap-2"
                >
                  <span>📖</span>
                  View All {stats.totalReviews} Reviews
                </button>
                <button
                  onClick={() => navigate('/submit-review')}
                  className="px-8 py-4 bg-[#E3EFD3] text-[#0D2B1D] rounded-xl hover:bg-white transition-all font-semibold shadow-2xl hover:scale-105 duration-300 flex items-center gap-2"
                >
                  <span>✍️</span>
                  Share Your Experience
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : stats ? (
        /* No Reviews Yet */
        <section className="py-20 bg-gradient-to-br from-[#6B8F71] to-[#345635]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-on-scroll">
              <div className="text-8xl mb-8 animate-bounce">⭐</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Be Our First Reviewer!
              </h2>
              <p className="text-xl text-[#E3EFD3] mb-10 leading-relaxed">
                Share your experience with ConnectO and help others discover what makes our platform special.
              </p>
              <button
                onClick={() => navigate('/submit-review')}
                className="px-10 py-5 bg-white text-[#0D2B1D] rounded-xl hover:bg-[#E3EFD3] transition-all font-bold text-lg shadow-2xl hover:scale-110 duration-300"
              >
                ✍️ Write the First Review
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Loading */
        <section className="py-20 bg-gradient-to-br from-[#AEC3B0] to-[#6B8F71]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-[#0D2B1D] mb-6"></div>
              <h3 className="text-2xl font-semibold text-white">
                Loading reviews...
              </h3>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Landing;
