import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'react-toastify';
import api from '../lib/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/contact', formData);
      
      toast.success(response.data.message || 'Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again or email us directly at admin@vsconnecto.com');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <div className="bg-white rounded-xl shadow-soft border border-border p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  📧
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Email Us</h3>
                  <a href="mailto:admin@vsconnecto.com" className="text-text-secondary hover:text-text-primary transition-colors">
                    admin@vsconnecto.com
                  </a>
                  <p className="text-sm text-text-secondary mt-1">We'll respond within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-soft border border-border p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  📞
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Call Us</h3>
                  <a href="tel:+911234567890" className="text-text-secondary hover:text-text-primary transition-colors">
                    +91 123 456 7890
                  </a>
                  <p className="text-sm text-text-secondary mt-1">Mon-Fri 9am to 6pm IST</p>
                </div>
              </div>
            </div>

            {/* Location */}
                        <div className="bg-surface rounded-lg p-4 border border-border">
              <p className="text-text-secondary"><strong>Email:</strong> <a href="mailto:admin@vsconnecto.com" className="text-text-secondary hover:text-text-primary">admin@vsconnecto.com</a></p>
              <p className="text-text-secondary"><strong>Phone:</strong> +91 123 456 7890</p>
              <p className="text-text-secondary"><strong>Address:</strong> ConnectO Headquarters, 123 Business Street, Bangalore, Karnataka, India - 560001</p>
            </div>

            {/* Social Media */}
            <div className="bg-primary rounded-xl shadow-soft p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">💼</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-soft border border-border p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-text-primary mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="verification">Verification Issues</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-text-primary mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-lg font-semibold hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-soft border border-border p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-text-primary mb-2">How do I become a verified provider?</h3>
              <p className="text-text-secondary text-sm">Complete your profile, submit required documents through the verification page, and our team will review within 24-48 hours.</p>
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-2">What payment methods do you accept?</h3>
              <p className="text-text-secondary text-sm">We accept all major credit/debit cards, UPI, net banking, and digital wallets for secure transactions.</p>
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-2">How does the rating system work?</h3>
              <p className="text-text-secondary text-sm">After job completion, clients can rate providers on a 5-star scale with written reviews. All reviews are verified and moderated.</p>
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-2">Is my personal information safe?</h3>
              <p className="text-text-secondary text-sm">Yes! We use industry-standard encryption and never share your personal data without your consent. Read our Privacy Policy for details.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
