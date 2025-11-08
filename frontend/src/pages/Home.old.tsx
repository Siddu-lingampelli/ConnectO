import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';
import { motion } from 'framer-motion';
import { 
  TargetIcon, 
  BriefcaseIcon, 
  MessageCircleIcon, 
  ShieldIcon, 
  StarIcon, 
  TrophyIcon,
  ZapIcon,
  CheckCircleIcon,
  UsersIcon,
  DocumentIcon
} from '../components/icons/PremiumIcons';

// New Emerald Essence Home Page Design
const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<any>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Redirect to dashboard if already logged in (except admin)
  useEffect(() => {
    if (isAuthenticated && currentUser?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Load reviews and stats
  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

  // Scroll animations
  useEffect(() => {
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-5 h-5 transition-all duration-300 ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const features = [
    {
      icon: <TargetIcon className="w-7 h-7" />,
      iconBg: 'from-emerald-500 to-teal-600',
      title: 'Smart Discovery',
      description: 'Advanced matching algorithm connects you with the perfect service providers based on your needs and preferences.'
    },
    {
      icon: <BriefcaseIcon className="w-7 h-7" />,
      iconBg: 'from-blue-500 to-indigo-600',
      title: 'Professional Tools',
      description: 'Complete suite of tools for portfolio management, proposal creation, and project tracking for providers.'
    },
    {
      icon: <MessageCircleIcon className="w-7 h-7" />,
      iconBg: 'from-purple-500 to-pink-600',
      title: 'Real-time Chat',
      description: 'Instant messaging system with file sharing, allowing seamless communication between clients and providers.'
    },
    {
      icon: <ShieldIcon className="w-7 h-7" />,
      iconBg: 'from-amber-500 to-orange-600',
      title: 'Secure Payments',
      description: 'Built-in escrow system and multiple payment options ensure safe and secure transactions for all parties.'
    },
    {
      icon: <StarIcon className="w-7 h-7" />,
      iconBg: 'from-yellow-400 to-amber-500',
      title: 'Rating System',
      description: 'Transparent review and rating system helps build trust and maintain quality standards across the platform.'
    },
    {
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
      iconBg: 'from-red-500 to-rose-600',
      title: 'Location Based',
      description: 'Find local service providers nearby or expand your reach as a provider with our geo-location features.'
    }
  ];

  const categories = [
    { 
      name: 'Plumbing', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>, 
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'from-blue-600 to-cyan-700'
    },
    { 
      name: 'Electrical', 
      icon: <ZapIcon className="w-8 h-8" />, 
      gradient: 'from-yellow-400 to-amber-500',
      hoverGradient: 'from-yellow-500 to-amber-600'
    },
    { 
      name: 'Carpentry', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>, 
      gradient: 'from-amber-600 to-orange-600',
      hoverGradient: 'from-amber-700 to-orange-700'
    },
    { 
      name: 'Painting', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>, 
      gradient: 'from-pink-500 to-rose-600',
      hoverGradient: 'from-pink-600 to-rose-700'
    },
    { 
      name: 'Cleaning', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>, 
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'from-emerald-600 to-teal-700'
    },
    { 
      name: 'AC Repair', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>, 
      gradient: 'from-sky-400 to-blue-600',
      hoverGradient: 'from-sky-500 to-blue-700'
    },
    { 
      name: 'Gardening', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>, 
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'from-green-600 to-emerald-700'
    },
    { 
      name: 'Pest Control', 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>, 
      gradient: 'from-indigo-500 to-purple-600',
      hoverGradient: 'from-indigo-600 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Premium Header with Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src="/assets/images/connecto-logo.png" 
                  alt="ConnectO Logo" 
                  className="relative w-12 h-12 rounded-2xl object-cover shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                ConnectO
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              {currentUser?.role === 'admin' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:shadow-2xl transition-all font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Panel</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 text-gray-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-lg"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Premium Design */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 min-h-[90vh] flex items-center"
      >
        {/* Advanced Gradient Mesh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <motion.div 
            animate={{ 
              x: [0, 100, -50, 0],
              y: [0, -80, 50, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/40 via-cyan-500/30 to-transparent rounded-full mix-blend-overlay filter blur-3xl opacity-70"
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 80, 0],
              y: [0, 100, -60, 0],
              scale: [1, 1.2, 1.1, 1],
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-violet-500/40 via-purple-500/30 to-transparent rounded-full mix-blend-overlay filter blur-3xl opacity-60"
          />
          <motion.div 
            animate={{ 
              x: [0, 60, -40, 0],
              y: [0, -50, 70, 0],
              scale: [1, 1.15, 0.95, 1]
            }}
            transition={{ 
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-500/30 via-rose-500/25 to-transparent rounded-full mix-blend-overlay filter blur-3xl opacity-50"
          />
          
          {/* Grid overlay for depth */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Side - Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-medium rounded-full inline-flex items-center gap-2.5 shadow-2xl">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent font-semibold">
                    Join 50,000+ satisfied clients
                  </span>
                </div>
              </motion.div>
              
              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight">
                  Your trusted
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent relative"
                  >
                    service marketplace
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                      className="absolute -bottom-3 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-full origin-left"
                    />
                  </motion.span>
                </h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl font-light"
                >
                  Connect with verified professionals for all your service needs. From plumbing to tech support, find skilled experts ready to help.
                </motion.p>
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Get started free</span>
                  <motion.svg 
                    className="w-5 h-5"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/browse-providers')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  <span>Browse services</span>
                </motion.button>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 border-2 border-slate-900 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">
                      <span className="text-white font-semibold">4.9/5</span> from 2,500+ reviews
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">10,000+</p>
                    <p className="text-sm text-gray-400">Verified professionals</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Modern Bento Grid Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative hidden lg:block"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
              
              {/* Bento Grid */}
              <div className="relative grid grid-cols-2 gap-4">
                {/* Large stat card - Top left */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className="col-span-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <UsersIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
                      />
                      <span className="text-xs text-gray-300 font-medium">Live</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-2">Active Professionals</p>
                    <p className="text-5xl font-bold text-white mb-1">10,000+</p>
                    <p className="text-sm text-cyan-400 font-medium">↗ 25% this month</p>
                  </div>
                </motion.div>

                {/* Small stat card - Bottom left */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className="bg-gradient-to-br from-violet-500/90 to-purple-600/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <TrophyIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Projects Done</p>
                  <p className="text-3xl font-bold text-white">50k+</p>
                </motion.div>

                {/* Small stat card - Bottom right */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className="bg-gradient-to-br from-cyan-500/90 to-blue-600/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <StarIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Satisfaction</p>
                  <p className="text-3xl font-bold text-white">98%</p>
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center gap-2"
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} className="w-4 h-4 text-white fill-white -ml-0.5 first:ml-0" />
                    ))}
                  </div>
                  <span className="text-white font-bold text-sm">4.9/5</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6 font-semibold text-sm">
              <ZapIcon className="w-4 h-4" />
              <span>Why choose us</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything you need,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                all in one place
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines powerful features with intuitive design to make connecting with service professionals effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Grid */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full mb-6 font-semibold text-sm">
              <TargetIcon className="w-4 h-4" />
              <span>Popular services</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find the{' '}
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                perfect service
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse through our wide range of professional services, each verified and rated by our community
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="group bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {stats && stats.totalReviews > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"
            />
          </div>

          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-on-scroll">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 mb-4 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-white text-sm font-semibold">CUSTOMER SATISFACTION</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Loved by Our Community
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Real experiences from real users who trust ConnectO
                </p>
              </div>

              {reviews.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {reviews.map((review, index) => (
                    <div
                      key={review._id}
                      className="animate-on-scroll bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="mb-4">
                        {renderStars(review.rating)}
                      </div>
                      <h3 className="font-bold text-xl text-[#0D2B1D] mb-3">
                        {review.title}
                      </h3>
                      <p className="text-[#345635] text-sm leading-relaxed mb-4 line-clamp-4">
                        "{review.review}"
                      </p>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center animate-on-scroll">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/reviews')}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-2xl hover:shadow-white/20 transition-all duration-300"
                >
                  <DocumentIcon className="w-5 h-5" />
                  View All Reviews
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-3xl p-12 text-center shadow-2xl animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-[#E3EFD3] mb-10">
              Join thousands of clients and providers on ConnectO today
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-[#0D2B1D] rounded-xl hover:bg-[#E3EFD3] transition-all shadow-lg hover:shadow-2xl font-semibold text-lg hover:scale-110 duration-300"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D2B1D] text-white py-12">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <span className="text-xl font-bold">ConnectO</span>
                </div>
                <p className="text-[#AEC3B0] text-sm">
                  Connecting clients with skilled service providers across India
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-[#E3EFD3]">For Clients</h4>
                <ul className="space-y-2 text-[#AEC3B0] text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Find Providers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-[#E3EFD3]">For Providers</h4>
                <ul className="space-y-2 text-[#AEC3B0] text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Find Jobs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Create Profile</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Get Verified</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-[#E3EFD3]">Support</h4>
                <ul className="space-y-2 text-[#AEC3B0] text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms & Privacy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#345635] pt-8 text-center text-[#AEC3B0] text-sm">
              <p>&copy; 2025 ConnectO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
