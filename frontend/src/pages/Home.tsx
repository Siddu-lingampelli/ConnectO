import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<{
    totalReviews: number;
    averageRating: number;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, statsData] = await Promise.all([
          websiteReviewService.getApprovedReviews(6),
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
      title: "Support",
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-text-primary font-semibold text-lg tracking-tighter">ConnectO</div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/about')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              About
            </button>
            <button onClick={() => navigate('/services')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Services
            </button>
            <button onClick={() => navigate('/contact')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Contact
            </button>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign in
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
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
        className="pt-32 pb-20 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold text-text-primary tracking-tighter leading-[1.1] mb-6"
          >
            Professional services.
            <br />
            <span className="text-primary">Delivered.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your business with solutions built for the modern world
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button 
              onClick={() => navigate('/register')} 
              className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-soft hover:shadow-medium"
            >
              Get started
            </button>
            <button 
              onClick={() => navigate('/contact')} 
              className="px-8 py-4 border border-border text-text-primary rounded-xl font-semibold hover:bg-surface transition-colors"
            >
              Contact sales
            </button>
          </motion.div>
          {stats && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-8 text-sm text-text-muted"
            >
              <span>{stats.totalReviews.toLocaleString()} reviews</span>
              <span className="w-1 h-1 bg-border rounded-full"></span>
              <span>{stats.averageRating.toFixed(1)} rating</span>
              <span className="w-1 h-1 bg-border rounded-full"></span>
              <span>10K+ users</span>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-text-primary tracking-tighter mb-6">
              Everything you need
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Comprehensive solutions for every business requirement
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-6 bg-white border border-border rounded-2xl hover:shadow-soft transition-all duration-200"
              >
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-semibold text-text-primary tracking-tighter mb-6">
                Trusted by thousands
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                See what our customers have to say about their experience
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, index) => (
                <motion.div 
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-white border border-border rounded-2xl"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-warning' : 'text-border'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                    {review.review}
                  </p>
                  <div className="text-xs text-text-muted font-medium">
                    {review.user?.fullName || 'Anonymous'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary tracking-tighter mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
              Join thousands of businesses already using our platform
            </p>
            <button 
              onClick={() => navigate('/register')} 
              className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-soft hover:shadow-medium"
            >
              Get started for free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/features')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/pricing')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/security')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Security</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">Company</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/about')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">About</button></li>
                <li><button onClick={() => navigate('/blog')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Blog</button></li>
                <li><button onClick={() => navigate('/careers')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Careers</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/docs')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Documentation</button></li>
                <li><button onClick={() => navigate('/help')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/contact')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/privacy')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</button></li>
                <li><button onClick={() => navigate('/terms')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-text-muted">
              2024 ConnectO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
