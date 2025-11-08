import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#0D2B1D] mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-[#6B8F71]">
            Last Updated: October 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-[#AEC3B0] p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to ConnectO! These Terms of Service ("Terms") govern your access to and use of our platform. By accessing or using ConnectO, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our service.
            </p>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">1. Definitions</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>"Platform"</strong> refers to the ConnectO website and mobile applications</li>
              <li><strong>"Service Provider"</strong> refers to users who offer services on the platform</li>
              <li><strong>"Client"</strong> refers to users who hire service providers</li>
              <li><strong>"User"</strong> refers to any person using the platform (clients or service providers)</li>
              <li><strong>"Job"</strong> refers to any service request posted by a client</li>
              <li><strong>"We," "Us," "Our"</strong> refers to ConnectO and its operators</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">2. Eligibility</h2>
            <p className="text-gray-700 mb-3">To use ConnectO, you must:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the platform under applicable laws</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">3. Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              You must create an account to use most features of ConnectO. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.2 Account Security</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Choose a strong, unique password</li>
              <li>Do not share your password with anyone</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>You are liable for any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">3.3 Account Termination</h3>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, or any other reason we deem necessary to protect the platform and its users.
            </p>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">4. User Conduct and Prohibited Activities</h2>
            <p className="text-gray-700 mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide false, inaccurate, or misleading information</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post inappropriate, offensive, or illegal content</li>
              <li>Engage in fraudulent activities or scams</li>
              <li>Circumvent platform fees or payment systems</li>
              <li>Use automated tools (bots, scrapers) without authorization</li>
              <li>Interfere with platform security or functionality</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to reverse engineer or copy our technology</li>
            </ul>
          </section>

          {/* Service Provider Terms */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">5. Service Provider Terms</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">5.1 Verification</h3>
            <p className="text-gray-700 mb-4">
              Service providers must complete identity verification and may be required to submit credentials, licenses, or certifications relevant to their services.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">5.2 Service Quality</h3>
            <p className="text-gray-700 mb-4">
              Service providers agree to deliver services professionally, on time, and as described. Failure to maintain quality standards may result in account suspension or termination.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">5.3 Pricing and Fees</h3>
            <p className="text-gray-700 mb-4">
              Service providers set their own rates. ConnectO charges a service fee (platform commission) on completed transactions. Current fee structures are available on your dashboard.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">5.4 Independent Contractor</h3>
            <p className="text-gray-700">
              Service providers are independent contractors, not employees of ConnectO. You are responsible for your own taxes, insurance, and legal compliance.
            </p>
          </section>

          {/* Client Terms */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">6. Client Terms</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">6.1 Job Posting</h3>
            <p className="text-gray-700 mb-4">
              Clients must provide accurate, detailed job descriptions including scope, budget, and timeline. Misleading job posts may be removed.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">6.2 Payment Obligations</h3>
            <p className="text-gray-700 mb-4">
              Clients agree to pay for services as agreed upon with the service provider. Payment must be made through the platform's secure payment system.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">6.3 Fair Treatment</h3>
            <p className="text-gray-700">
              Clients must treat service providers with respect and professionalism. Abusive behavior or unfair treatment may result in account restrictions.
            </p>
          </section>

          {/* Payments and Fees */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">7. Payments and Fees</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">7.1 Payment Processing</h3>
            <p className="text-gray-700 mb-4">
              All payments must be processed through ConnectO's integrated payment system. We use secure third-party payment processors to handle transactions.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">7.2 Service Fees</h3>
            <p className="text-gray-700 mb-4">
              ConnectO charges service fees on completed transactions. Fees are clearly displayed before confirming any transaction.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">7.3 Refunds and Disputes</h3>
            <p className="text-gray-700">
              Refund policies depend on the service agreement between client and provider. In case of disputes, our support team will mediate to reach a fair resolution.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">8. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">8.1 Platform Content</h3>
            <p className="text-gray-700 mb-4">
              ConnectO and its content (logo, design, code, text) are protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, or distribute our content without permission.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">8.2 User Content</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of content you post (profiles, portfolios, messages). By posting content, you grant ConnectO a license to use, display, and distribute it on the platform.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">8.3 Copyright Infringement</h3>
            <p className="text-gray-700">
              We respect intellectual property rights. If you believe content on our platform infringes your copyright, contact us at <a href="mailto:admin@vsconnecto.com" className="text-[#6B8F71] hover:text-[#345635]">admin@vsconnecto.com</a>.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">9. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-[#345635] mb-3">9.1 Platform "As Is"</h3>
            <p className="text-gray-700 mb-4">
              ConnectO is provided "as is" without warranties of any kind. We do not guarantee uninterrupted, error-free service or that all content is accurate.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">9.2 Third-Party Services</h3>
            <p className="text-gray-700 mb-4">
              We are not responsible for the quality, safety, or legality of services provided by service providers. Clients hire providers at their own risk.
            </p>

            <h3 className="text-xl font-semibold text-[#345635] mb-3">9.3 Limitation of Liability</h3>
            <p className="text-gray-700">
              ConnectO shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the fees paid to us in the past 12 months.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">10. Dispute Resolution</h2>
            <p className="text-gray-700 mb-3">
              In case of disputes between users or with ConnectO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>First, attempt to resolve through direct communication</li>
              <li>Contact our support team for mediation</li>
              <li>Disputes not resolved through mediation will be subject to binding arbitration</li>
              <li>Arbitration will be conducted in Bangalore, Karnataka, India</li>
              <li>Indian laws govern these Terms and any disputes</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">12. Termination</h2>
            <p className="text-gray-700 mb-3">
              You may terminate your account at any time from your settings. Upon termination:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your profile and content will be removed</li>
              <li>Ongoing projects must be completed or cancelled</li>
              <li>Outstanding payments must be settled</li>
              <li>Some data may be retained for legal or operational purposes</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">13. Contact Information</h2>
            <p className="text-gray-700 mb-3">
              For questions about these Terms, contact us:
            </p>
            <div className="bg-[#E3EFD3] rounded-lg p-4 border-2 border-[#AEC3B0]">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:admin@vsconnecto.com" className="text-[#6B8F71] hover:text-[#345635]">admin@vsconnecto.com</a></p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 123 456 7890</p>
              <p className="text-gray-700"><strong>Address:</strong> ConnectO Headquarters, 123 Business Street, Bangalore, Karnataka, India - 560001</p>
            </div>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">14. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">15. Entire Agreement</h2>
            <p className="text-gray-700">
              These Terms, along with our Privacy Policy, constitute the entire agreement between you and ConnectO regarding the use of the platform.
            </p>
          </section>

          {/* Acceptance */}
          <section className="border-t-2 border-[#AEC3B0] pt-6">
            <p className="text-gray-700 font-semibold">
              By using ConnectO, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;

