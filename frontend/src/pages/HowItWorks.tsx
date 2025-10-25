import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#0D2B1D] mb-4">
            How ConnectO Works
          </h1>
          <p className="text-xl text-[#6B8F71] max-w-3xl mx-auto">
            Simple steps to connect service providers with clients
          </p>
        </div>

        {/* For Service Providers */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0D2B1D] mb-2">For Service Providers</h2>
            <p className="text-lg text-[#6B8F71]">Start your journey as a service provider in 5 easy steps</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#AEC3B0]"></div>

            {/* Steps */}
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 md:text-right">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6">
                    <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">1. Create Your Account</h3>
                    <p className="text-gray-700">Sign up with your email and basic information. Choose to register as a service provider.</p>
                  </div>
                </div>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="flex-1"></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1"></div>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="flex-1 md:text-left">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6">
                    <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">2. Complete Your Profile</h3>
                    <p className="text-gray-700">Add your skills, experience, portfolio, and service categories. The more detailed, the better!</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 md:text-right">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6">
                    <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">3. Get Verified</h3>
                    <p className="text-gray-700">Submit your documents for verification. This builds trust with clients and increases your visibility.</p>
                  </div>
                </div>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="flex-1"></div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1"></div>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  4
                </div>
                <div className="flex-1 md:text-left">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6">
                    <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">4. Receive Job Requests</h3>
                    <p className="text-gray-700">Browse available jobs or receive direct requests from clients. Apply to jobs that match your skills.</p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 md:text-right">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6">
                    <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">5. Deliver & Earn</h3>
                    <p className="text-gray-700">Complete the work, get paid securely, and build your reputation with positive reviews!</p>
                  </div>
                </div>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  5
                </div>
                <div className="flex-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16 border-t-2 border-[#AEC3B0]"></div>

        {/* For Clients */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0D2B1D] mb-2">For Clients</h2>
            <p className="text-lg text-[#6B8F71]">Find the perfect service provider in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Client Step 1 */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">Post Your Job</h3>
              <p className="text-gray-700">Describe your requirements, budget, and timeline. Be as detailed as possible to attract the right providers.</p>
            </div>

            {/* Client Step 2 */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">Review Proposals</h3>
              <p className="text-gray-700">Receive proposals from interested service providers. Check their profiles, portfolios, and reviews.</p>
            </div>

            {/* Client Step 3 */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">Hire & Collaborate</h3>
              <p className="text-gray-700">Choose the best provider, discuss details via chat, and start your project with confidence.</p>
            </div>

            {/* Client Step 4 */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-[#0D2B1D] mb-3">Pay & Review</h3>
              <p className="text-gray-700">Make secure payments upon completion and leave a review to help others in the community.</p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gradient-to-r from-[#345635] to-[#6B8F71] rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-[#E3EFD3]">Safe and secure payment processing with buyer protection</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-xl font-bold mb-2">Real-time Chat</h3>
              <p className="text-[#E3EFD3]">Communicate directly with clients or providers instantly</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-xl font-bold mb-2">Rating System</h3>
              <p className="text-[#E3EFD3]">Transparent reviews and ratings for quality assurance</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="text-xl font-bold mb-2">Location Search</h3>
              <p className="text-[#E3EFD3]">Find nearby service providers on an interactive map</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold mb-2">Verification</h3>
              <p className="text-[#E3EFD3]">Identity and skill verification for trusted professionals</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
              <p className="text-[#E3EFD3]">Gamification with rewards for top performers</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 border-2 border-[#AEC3B0] shadow-lg">
          <h2 className="text-3xl font-bold text-[#0D2B1D] mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-[#6B8F71] mb-6">
            Join thousands of satisfied users on ConnectO today!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Sign Up Now
            </a>
            <a
              href="/about"
              className="px-8 py-3 bg-white text-[#0D2B1D] rounded-full font-semibold hover:shadow-lg transition-all border-2 border-[#345635]"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
