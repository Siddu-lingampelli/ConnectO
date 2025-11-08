import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';

const Landing = () => {
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
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-warning' : 'text-border'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span className="text-sm font-semibold text-primary tracking-tighter">Welcome to ConnectO</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-semibold text-text-primary tracking-tighter leading-[1.1]">
                Connect with
                <br />
                <span className="text-primary">trusted professionals</span>
              </h1>
              
              <p className="text-xl text-text-secondary leading-relaxed max-w-xl">
                Find skilled service providers or offer your expertise. Build meaningful connections and grow your business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowLogin(false)}
                  className="group px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-soft hover:shadow-medium transition-all duration-200 hover:bg-primary-dark"
                >
                  <span className="flex items-center justify-center gap-2">
                    Get Started
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-surface text-text-primary rounded-xl font-semibold hover:bg-border transition-all duration-200"
                >
                  Learn More
                </button>
              </div>

              {/* Trust Indicators */}
              {stats && (
                <div className="flex items-center gap-8 pt-8 border-t border-border">
                  <div>
                    <div className="text-3xl font-semibold text-text-primary">10K+</div>
                    <div className="text-sm text-text-muted">Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-text-primary">5K+</div>
                    <div className="text-sm text-text-muted">Projects Done</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-semibold text-text-primary">{stats.averageRating.toFixed(1)}</span>
                      <svg className="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="text-sm text-text-muted">Avg Rating</div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Auth Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:ml-auto w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-large p-8 border border-border">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-surface p-1.5 rounded-xl">
                  <button
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      showLogin 
                        ? 'bg-white text-text-primary shadow-subtle' 
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                    onClick={() => setShowLogin(true)}
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      !showLogin 
                        ? 'bg-white text-text-primary shadow-subtle' 
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                    onClick={() => setShowLogin(false)}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Auth Forms */}
                <motion.div
                  key={showLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showLogin ? (
                    <LoginForm onSuccess={handleAuthSuccess} />
                  ) : (
                    <RegisterForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToLogin={() => setShowLogin(true)}
                      initialRole={initialRole}
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 bg-secondary-light rounded-full mb-6">
                <span className="text-sm font-semibold text-secondary">Why Choose ConnectO</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-semibold text-text-primary tracking-tighter mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Professional tools and features designed for modern service providers and clients
              </p>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Smart Discovery',
                description: 'Find the perfect match with our intelligent search and recommendation system',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                title: 'Verified Profiles',
                description: 'Work with confidence through our comprehensive verification process',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Real-Time Communication',
                description: 'Connect instantly with built-in messaging and collaboration tools',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secure Payments',
                description: 'Safe and seamless transactions with enterprise-grade security',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ),
                title: 'Review System',
                description: 'Build trust with transparent ratings and authentic feedback',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Project Analytics',
                description: 'Track performance and gain insights to optimize your business',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-8 border border-border hover:shadow-medium transition-all duration-200">
                  <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {stats && stats.totalReviews > 0 && (
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-success/10 rounded-full mb-6">
                <span className="text-sm font-semibold text-success">Trusted by Thousands</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-semibold text-text-primary tracking-tighter mb-6">
                What our users say
              </h2>
              <div className="flex items-center justify-center gap-8 text-text-muted">
                <span className="text-3xl font-semibold text-text-primary">{stats.averageRating.toFixed(1)}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span>{stats.totalReviews} reviews</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-border hover:shadow-soft transition-all duration-200"
                >
                  <div className="mb-4">
                    {renderStars(review.rating)}
                  </div>

                  <h3 className="font-semibold text-text-primary mb-2">
                    {review.title}
                  </h3>

                  <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                    {review.review}
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {review.user.profilePicture ? (
                      <img
                        src={review.user.profilePicture}
                        alt={review.user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center font-semibold">
                        {review.user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-text-primary text-sm">
                        {review.user.fullName}
                      </div>
                      <div className="text-xs text-text-muted capitalize">
                        {review.user.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/reviews')}
                className="px-8 py-4 bg-surface text-text-primary rounded-xl font-semibold hover:bg-border transition-all duration-200"
              >
                View All Reviews
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-semibold text-text-primary tracking-tighter mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Join thousands of professionals already using ConnectO to grow their business
            </p>
            <button
              onClick={() => setShowLogin(false)}
              className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-soft hover:shadow-medium transition-all duration-200 hover:bg-primary-dark"
            >
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
