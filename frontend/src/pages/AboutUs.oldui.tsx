import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#0D2B1D] mb-4">
            About ConnectO
          </h1>
          <p className="text-xl text-[#6B8F71] max-w-3xl mx-auto">
            Bridging the gap between skilled service providers and clients seeking quality services
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <h2 className="text-3xl font-bold text-[#0D2B1D] mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                ConnectO is dedicated to creating a seamless platform where skilled professionals—both technical and non-technical—can showcase their expertise and connect with clients who need their services. We believe in empowering service providers with the tools they need to grow their business while ensuring clients have access to verified, trusted professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">👁️</div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg text-[#E3EFD3] leading-relaxed">
                To become India's most trusted service marketplace, where quality meets convenience. We envision a future where every skilled professional has equal opportunities to succeed, and every client can find reliable services at their fingertips.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#0D2B1D] text-center mb-8">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* For Service Providers */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">For Service Providers</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Create professional profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Showcase your portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Get verified credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Receive job requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Build your reputation</span>
                </li>
              </ul>
            </div>

            {/* For Clients */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">For Clients</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Find verified professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Browse portfolios & reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Post job requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Compare service providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Secure payment options</span>
                </li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">Platform Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Location-based search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Real-time chat & notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Rating & review system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Wishlist & favorites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B8F71]">✓</span>
                  <span>Community engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#0D2B1D] text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🤝</div>
              <div>
                <h3 className="text-xl font-bold text-[#0D2B1D] mb-2">Trust & Transparency</h3>
                <p className="text-gray-700">We prioritize verified profiles and honest reviews to build a trustworthy community.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-xl font-bold text-[#0D2B1D] mb-2">Quality Service</h3>
                <p className="text-gray-700">We ensure high standards through verification processes and quality checks.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-3xl">🌟</div>
              <div>
                <h3 className="text-xl font-bold text-[#0D2B1D] mb-2">Empowerment</h3>
                <p className="text-gray-700">We empower service providers with tools and opportunities to grow their business.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="text-xl font-bold text-[#0D2B1D] mb-2">Innovation</h3>
                <p className="text-gray-700">We continuously improve our platform with cutting-edge technology and features.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-[#0D2B1D] to-[#345635] rounded-2xl shadow-lg p-8 text-white mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-[#AEC3B0]">Service Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-[#AEC3B0]">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-[#AEC3B0]">Jobs Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-[#AEC3B0]">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-[#E3EFD3] rounded-2xl p-8 border-2 border-[#AEC3B0]">
          <h2 className="text-3xl font-bold text-[#0D2B1D] mb-4">Join ConnectO Today!</h2>
          <p className="text-lg text-[#6B8F71] mb-6">
            Whether you're a service provider looking to grow your business or a client seeking quality services, ConnectO is here for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-white text-[#0D2B1D] rounded-full font-semibold hover:shadow-lg transition-all border-2 border-[#345635]"
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
