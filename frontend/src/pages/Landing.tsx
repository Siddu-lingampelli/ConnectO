import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const Landing = () => {
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Welcome to VSConnectO
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with service providers or offer your services
            </p>
          </section>

          {/* Auth Section */}
          <section className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex gap-4 mb-6 border-b">
                <button
                  className={`flex-1 pb-2 font-medium transition-colors ${
                    showLogin
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
                <button
                  className={`flex-1 pb-2 font-medium transition-colors ${
                    !showLogin
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setShowLogin(false)}
                >
                  Register
                </button>
              </div>

              {showLogin ? (
                <LoginForm onSuccess={handleAuthSuccess} />
              ) : (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setShowLogin(true)}
                />
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Find Services</h3>
              <p className="text-gray-600">
                Browse and discover quality service providers
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Offer Services</h3>
              <p className="text-gray-600">
                Showcase your skills and connect with clients
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Easy Communication</h3>
              <p className="text-gray-600">
                Chat with providers or clients in real-time
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
