import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  // Redirect to dashboard if already logged in (except admin)
  useEffect(() => {
    if (isAuthenticated && currentUser?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  const features = [
    {
      icon: '🔍',
      title: 'Find Skilled Professionals',
      description: 'Browse through verified service providers across various categories'
    },
    {
      icon: '💼',
      title: 'Post Jobs Easily',
      description: 'Create job listings and receive proposals from qualified providers'
    },
    {
      icon: '⭐',
      title: 'Verified Providers',
      description: 'All service providers are verified with document authentication'
    },
    {
      icon: '💬',
      title: 'Direct Communication',
      description: 'Chat directly with providers and clients through our messaging system'
    },
    {
      icon: '💰',
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with order tracking'
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your ongoing projects and completed work with detailed tracking'
    }
  ];

  const categories = [
    { name: 'Plumbing', icon: '🔧' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Carpentry', icon: '🪚' },
    { name: 'Painting', icon: '🎨' },
    { name: 'Cleaning', icon: '🧹' },
    { name: 'AC Repair', icon: '❄️' },
    { name: 'Gardening', icon: '🌱' },
    { name: 'Pest Control', icon: '🐛' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">VS</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ConnectO</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Admin Panel Button - Only visible for admin users */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold"
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
                className="px-6 py-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {' '}Skilled Professionals
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Find verified service providers for all your needs. From plumbing to painting,
            electrical to gardening - connect with experts in your area.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register?role=client')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Hire a Professional
            </button>
            <button
              onClick={() => navigate('/register?role=provider')}
              className="w-full sm:w-auto px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold text-lg"
            >
              Become a Provider
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600 mt-1">Verified Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">1000+</div>
              <div className="text-gray-600 mt-1">Jobs Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">95%</div>
              <div className="text-gray-600 mt-1">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Popular Service Categories
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Explore our wide range of services
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105 border border-blue-100"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="font-semibold text-gray-900">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Why Choose VSConnectO?
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Everything you need to connect with the right professionals
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sign Up</h3>
                <p className="text-blue-100">
                  Create your account as a client or service provider
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connect</h3>
                <p className="text-blue-100">
                  Browse profiles or post jobs to find the right match
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Get It Done</h3>
                <p className="text-blue-100">
                  Work together and complete projects seamlessly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of clients and providers on VSConnectO today
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">VS</span>
                  </div>
                  <span className="text-xl font-bold">ConnectO</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Connecting clients with skilled service providers across India
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">For Clients</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white">Find Providers</a></li>
                  <li><a href="#" className="hover:text-white">Post a Job</a></li>
                  <li><a href="#" className="hover:text-white">How It Works</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">For Providers</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white">Find Jobs</a></li>
                  <li><a href="#" className="hover:text-white">Create Profile</a></li>
                  <li><a href="#" className="hover:text-white">Get Verified</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Terms & Privacy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 VSConnectO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
