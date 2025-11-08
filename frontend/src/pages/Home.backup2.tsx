import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<{
    totalReviews: number;
    averageRating: number;
    totalUsers: number;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, statsData] = await Promise.all([
          websiteReviewService.getReviews({ limit: 6 }),
          websiteReviewService.getStats()
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const features = [
    {
      title: "Enterprise Grade",
      description: "Built for scale with security at its core"
    },
    {
      title: "Lightning Fast",
      description: "Optimized performance across all devices"
    },
    {
      title: "24/7 Support",
      description: "Always here when you need us"
    },
    {
      title: "Simple Pricing",
      description: "Transparent costs with no hidden fees"
    }
  ];

  const services = [
    { title: "Web Development", description: "Modern, responsive websites" },
    { title: "Mobile Apps", description: "iOS and Android applications" },
    { title: "Cloud Solutions", description: "Scalable infrastructure" },
    { title: "Data Analytics", description: "Insights that matter" },
    { title: "UI/UX Design", description: "Beautiful, intuitive interfaces" },
    { title: "Consulting", description: "Expert strategic guidance" },
    { title: "Integration", description: "Seamless system connections" },
    { title: "Security", description: "Enterprise-grade protection" }
  ];

  return (
    <div 
      className="min-h-screen bg-white" 
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-black font-semibold text-base">Brand</div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/about')} className="text-sm text-black/60 hover:text-black transition-colors">
              About
            </button>
            <button onClick={() => navigate('/services')} className="text-sm text-black/60 hover:text-black transition-colors">
              Services
            </button>
            <button onClick={() => navigate('/contact')} className="text-sm text-black/60 hover:text-black transition-colors">
              Contact
            </button>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-sm text-black/60 hover:text-black transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-sm text-black/60 hover:text-black transition-colors"
                >
                  Sign in
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="text-sm bg-black text-white px-6 py-2 rounded-full hover:bg-black/90 transition-colors"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-semibold text-black tracking-tight leading-[1.1] mb-6">
            Professional services.
            <br />
            Delivered.
          </h1>
          <p className="text-xl text-black/60 mb-12 max-w-2xl mx-auto">
            Transform your business with solutions built for the modern world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => navigate('/register')} 
              className="bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-black/90 transition-colors"
            >
              Get started
            </button>
            <button 
              onClick={() => navigate('/contact')} 
              className="border border-black/10 text-black px-8 py-3 rounded-full text-base font-medium hover:bg-black/[0.02] transition-colors"
            >
              Contact sales
            </button>
          </div>
          {stats && (
            <div className="flex items-center justify-center gap-8 text-sm text-black/50">
              <span>{stats.totalReviews.toLocaleString()} reviews</span>
              <span></span>
              <span>{stats.averageRating.toFixed(1)} rating</span>
              <span></span>
              <span>{stats.totalUsers.toLocaleString()}+ users</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="py-20 px-6 bg-black/[0.02]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <div key={index}>
                <h3 className="text-base font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-black/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="py-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold text-black mb-16 text-center">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="p-6 border border-black/5 rounded-2xl hover:border-black/10 transition-colors"
              >
                <h3 className="text-base font-semibold text-black mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-black/60">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="py-20 px-6 bg-black/[0.02]"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-semibold text-black mb-16 text-center">
              Trusted by thousands
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <div 
                  key={review._id}
                  className="p-6 bg-white border border-black/5 rounded-2xl"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-black' : 'text-black/10'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-black/60 mb-4">
                    {review.comment}
                  </p>
                  <div className="text-xs text-black/50">
                    {review.reviewerName || 'Anonymous'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="py-24 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-semibold text-black mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-black/60 mb-10">
            Join thousands of businesses already using our platform.
          </p>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-black/90 transition-colors"
          >
            Get started for free
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-black mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/features')} className="text-sm text-black/60 hover:text-black transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/pricing')} className="text-sm text-black/60 hover:text-black transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/security')} className="text-sm text-black/60 hover:text-black transition-colors">Security</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black mb-4">Company</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/about')} className="text-sm text-black/60 hover:text-black transition-colors">About</button></li>
                <li><button onClick={() => navigate('/blog')} className="text-sm text-black/60 hover:text-black transition-colors">Blog</button></li>
                <li><button onClick={() => navigate('/careers')} className="text-sm text-black/60 hover:text-black transition-colors">Careers</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/docs')} className="text-sm text-black/60 hover:text-black transition-colors">Documentation</button></li>
                <li><button onClick={() => navigate('/help')} className="text-sm text-black/60 hover:text-black transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/contact')} className="text-sm text-black/60 hover:text-black transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/privacy')} className="text-sm text-black/60 hover:text-black transition-colors">Privacy</button></li>
                <li><button onClick={() => navigate('/terms')} className="text-sm text-black/60 hover:text-black transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-black/5 text-center">
            <p className="text-sm text-black/50">
               2024 Brand. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
