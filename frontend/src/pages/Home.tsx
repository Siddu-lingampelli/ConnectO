import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';

// New Emerald Essence Home Page Design
const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
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

  const features = [
    {
      icon: '🔍',
      title: 'Smart Discovery',
      description: 'Advanced matching algorithm connects you with the perfect service providers based on your needs and preferences.'
    },
    {
      icon: '💼',
      title: 'Professional Tools',
      description: 'Complete suite of tools for portfolio management, proposal creation, and project tracking for providers.'
    },
    {
      icon: '💬',
      title: 'Real-time Chat',
      description: 'Instant messaging system with file sharing, allowing seamless communication between clients and providers.'
    },
    {
      icon: '🛡️',
      title: 'Secure Payments',
      description: 'Built-in escrow system and multiple payment options ensure safe and secure transactions for all parties.'
    },
    {
      icon: '⭐',
      title: 'Rating System',
      description: 'Transparent review and rating system helps build trust and maintain quality standards across the platform.'
    },
    {
      icon: '📍',
      title: 'Location Based',
      description: 'Find local service providers nearby or expand your reach as a provider with our geo-location features.'
    }
  ];

  const categories = [
    { name: 'Plumbing', icon: '🔧', gradient: 'from-[#0D2B1D] to-[#345635]' },
    { name: 'Electrical', icon: '⚡', gradient: 'from-[#345635] to-[#6B8F71]' },
    { name: 'Carpentry', icon: '🪚', gradient: 'from-[#6B8F71] to-[#AEC3B0]' },
    { name: 'Painting', icon: '🎨', gradient: 'from-[#0D2B1D] to-[#6B8F71]' },
    { name: 'Cleaning', icon: '🧹', gradient: 'from-[#345635] to-[#AEC3B0]' },
    { name: 'AC Repair', icon: '❄️', gradient: 'from-[#6B8F71] to-[#0D2B1D]' },
    { name: 'Gardening', icon: '🌱', gradient: 'from-[#AEC3B0] to-[#345635]' },
    { name: 'Pest Control', icon: '🐛', gradient: 'from-[#345635] to-[#0D2B1D]' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#AEC3B0]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-[#AEC3B0]/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/connecto-logo.png" 
                alt="ConnectO Logo" 
                className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-transform duration-300"
              />
              <span className="text-2xl font-bold text-[#0D2B1D]">ConnectO</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#0D2B1D] to-[#345635] text-white rounded-xl hover:shadow-xl transition-all font-semibold hover:scale-105 duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Panel</span>
                </button>
              )}
              
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 text-[#0D2B1D] hover:text-[#345635] font-semibold transition-colors hover:scale-105 duration-300"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0D2B1D] to-[#345635] text-white rounded-xl hover:shadow-xl transition-all font-semibold hover:scale-105 duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

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

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-5xl mx-auto text-center animate-on-scroll">
            <div className="inline-block mb-6">
              <span className="px-5 py-2 bg-[#0D2B1D] text-[#E3EFD3] text-sm font-medium rounded-full shadow-lg animate-pulse">
                🚀 Welcome to ConnectO
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0D2B1D] leading-tight mb-6">
              Connect with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#345635] to-[#6B8F71] mt-3 relative">
                Skilled Professionals
                <svg className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4" height="12" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C60 2 140 2 198 10" stroke="#6B8F71" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#345635] leading-relaxed mb-10 max-w-3xl mx-auto">
              Find verified service providers for all your needs. From plumbing to painting, electrical to gardening - 
              <span className="block mt-2 font-medium text-[#0D2B1D]">connect with experts in your area.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/register?role=client')}
                className="w-full sm:w-auto group px-10 py-4 bg-[#0D2B1D] text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-[#345635]/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Hire a Professional
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button
                onClick={() => navigate('/register?role=provider')}
                className="w-full sm:w-auto px-10 py-4 bg-white text-[#0D2B1D] border-2 border-[#6B8F71] rounded-xl font-semibold text-lg hover:bg-[#E3EFD3] hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Become a Provider
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto pt-8 border-t border-[#AEC3B0]">
              <div className="text-center animate-on-scroll">
                <div className="text-4xl md:text-5xl font-bold text-[#0D2B1D] mb-2">500+</div>
                <div className="text-sm md:text-base text-[#345635] font-medium">Verified Providers</div>
              </div>
              <div className="text-center animate-on-scroll">
                <div className="text-4xl md:text-5xl font-bold text-[#345635] mb-2">1000+</div>
                <div className="text-sm md:text-base text-[#345635] font-medium">Jobs Completed</div>
              </div>
              <div className="text-center animate-on-scroll">
                <div className="text-4xl md:text-5xl font-bold text-[#6B8F71] mb-2">95%</div>
                <div className="text-sm md:text-base text-[#345635] font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E3EFD3]/10 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0D2B1D] mb-4">
                Popular Service Categories
              </h2>
              <p className="text-xl text-[#345635]">
                Explore our wide range of services
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => navigate('/register')}
                  className="group animate-on-scroll bg-gradient-to-br from-white to-[#E3EFD3]/30 rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <div className="font-semibold text-[#0D2B1D] text-lg">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-[#E3EFD3]/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0D2B1D] mb-4">
                Why Choose ConnectO?
              </h2>
              <p className="text-xl text-[#345635]">
                Everything you need to connect with the right professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group animate-on-scroll bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#AEC3B0]/20"
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3 group-hover:text-[#345635] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[#345635] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {stats && stats.totalReviews > 0 && (
        <section className="py-20 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#0D2B1D] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#E3EFD3] rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6B8F71] rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-on-scroll">
                <div className="inline-block mb-4">
                  <span className="px-6 py-2 bg-[#E3EFD3] text-[#0D2B1D] text-sm font-bold rounded-full shadow-lg">
                    💚 CUSTOMER SATISFACTION
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Loved by Our Community
                </h2>
                <p className="text-xl text-[#AEC3B0] max-w-2xl mx-auto">
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
                <button
                  onClick={() => navigate('/reviews')}
                  className="px-10 py-4 bg-white text-[#0D2B1D] rounded-xl hover:bg-[#E3EFD3] transition-all font-semibold shadow-2xl hover:scale-105 duration-300"
                >
                  📖 View All Reviews
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
