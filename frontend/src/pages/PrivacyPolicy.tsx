import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#0D2B1D] mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-[#6B8F71]">
            Last Updated: October 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to ConnectO. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">1.1 Personal Information</h3>
            <p className="text-gray-700 mb-3">When you register on ConnectO, we may collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Full name, email address, and phone number</li>
              <li>Profile picture and professional portfolio</li>
              <li>Government-issued ID for verification</li>
              <li>Payment and billing information</li>
              <li>Location data (with your permission)</li>
              <li>Professional skills, experience, and credentials</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">1.2 Usage Information</h3>
            <p className="text-gray-700 mb-3">We automatically collect certain information when you use our platform:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Browser type, device information, and IP address</li>
              <li>Pages visited, time spent, and click patterns</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Search queries and job interactions</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Create and manage your account</li>
              <li>Facilitate connections between clients and service providers</li>
              <li>Process payments and transactions securely</li>
              <li>Verify identity and credentials</li>
              <li>Send notifications about jobs, messages, and updates</li>
              <li>Improve our platform and user experience</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
              <li>Personalize your experience and recommendations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-3">We may share your information with:</p>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.1 Other Users</h3>
            <p className="text-gray-700 mb-4">
              Your public profile (name, photo, skills, reviews) is visible to other users. We share contact information only when you accept a job or hire a provider.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.2 Service Providers</h3>
            <p className="text-gray-700 mb-4">
              We work with third-party service providers for payment processing, analytics, cloud storage, and customer support. These providers are bound by confidentiality agreements.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">
              We may disclose your information if required by law, court order, or to protect the rights, property, or safety of ConnectO, our users, or others.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.4 Business Transfers</h3>
            <p className="text-gray-700">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure data storage with encrypted databases</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-700 mt-3">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">5. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, contact us at <a href="mailto:admin@vsconnecto.com" className="text-[#6B8F71] hover:text-[#345635]">admin@vsconnecto.com</a>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-3">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
              <li><strong>Performance Cookies:</strong> Help us improve our services</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand user behavior</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700">
              ConnectO is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">8. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and maintained on servers located outside your country. We ensure adequate safeguards are in place to protect your data in compliance with applicable laws.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. The "Last Updated" date at the top indicates when the policy was last revised.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-3">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="bg-[#E3EFD3] rounded-lg p-4 border-2 border-[#AEC3B0]">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:admin@vsconnecto.com" className="text-[#6B8F71] hover:text-[#345635]">admin@vsconnecto.com</a></p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 123 456 7890</p>
              <p className="text-gray-700"><strong>Address:</strong> ConnectO Headquarters, 123 Business Street, Bangalore, Karnataka, India - 560001</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="border-t-2 border-[#AEC3B0] pt-6">
            <p className="text-gray-700 font-semibold">
              By using ConnectO, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
