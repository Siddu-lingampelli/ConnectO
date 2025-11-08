import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            About ConnectO
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Bridging the gap between skilled service providers and clients seeking quality services
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-border p-8 mb-8">
          <div className="flex items-start gap-4">
            
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-4">Our Mission</h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                ConnectO is dedicated to creating a seamless platform where skilled professionals—both technical and non-technical—can showcase their expertise and connect with clients who need their services. We believe in empowering service providers with the tools they need to grow their business while ensuring clients have access to verified, trusted professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-primary text-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="flex items-start gap-4">
            
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg text-white/90 leading-relaxed">
                To become India's most trusted service marketplace, where quality meets convenience. We envision a future where every skilled professional has equal opportunities to succeed, and every client can find reliable services at their fingertips.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-8">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* For Service Providers */}
            <div className="bg-white rounded-xl shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-6"><svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <h3 className="text-xl font-bold text-text-primary mb-3">For Service Providers</h3>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Create professional profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Showcase your portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Get verified credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Receive job requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Build your reputation</span>
                </li>
              </ul>
            </div>

            {/* For Clients */}
            <div className="bg-white rounded-xl shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-6"><svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <h3 className="text-xl font-bold text-text-primary mb-3">For Clients</h3>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Find verified professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Browse portfolios & reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Post job requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Compare service providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Secure payment options</span>
                </li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="bg-white rounded-xl shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-6"><svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Platform Features</h3>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Location-based search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Real-time chat & notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Rating & review system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Wishlist & favorites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-secondary">✓</span>
                  <span>Community engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-2xl shadow-soft border border-border p-8 mb-8">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Trust & Transparency</h3>
                <p className="text-text-secondary">We prioritize verified profiles and honest reviews to build a trustworthy community.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Quality Service</h3>
                <p className="text-text-secondary">We ensure high standards through verification processes and quality checks.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Empowerment</h3>
                <p className="text-text-secondary">We empower service providers with tools and opportunities to grow their business.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Innovation</h3>
                <p className="text-text-secondary">We continuously improve our platform with cutting-edge technology and features.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-primary rounded-2xl shadow-soft p-8 text-white mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-text-muted">Service Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-text-muted">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-text-muted">Jobs Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-text-muted">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-surface rounded-2xl p-8 border border-border">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Join ConnectO Today!</h2>
          <p className="text-lg text-text-secondary mb-6">
            Whether you're a service provider looking to grow your business or a client seeking quality services, ConnectO is here for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-full font-semibold hover:shadow-soft transition-all"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-white text-text-primary rounded-full font-semibold hover:shadow-soft transition-all border border-primary"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
