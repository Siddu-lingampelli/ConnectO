import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { verificationService, type VerificationStatus } from '../services/verificationService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Verification = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [panCardUrl, setPanCardUrl] = useState('');
  const [aadharCardUrl, setAadharCardUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getVerificationStatus();
      setVerificationStatus(data.verification);
    } catch (error: any) {
      console.error('Error loading verification status:', error);
      toast.error('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!panCardUrl.trim() || !aadharCardUrl.trim()) {
      toast.error('Please provide both PAN card and Aadhar card URLs');
      return;
    }

    try {
      setSubmitting(true);
      const response = await verificationService.submitVerification(panCardUrl.trim(), aadharCardUrl.trim());
      
      toast.success(response.message);
      
      // Reload verification status to update UI
      await loadVerificationStatus();
      
      // Clear form fields
      setPanCardUrl('');
      setAadharCardUrl('');
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // Give user time to see the success message
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to access verification.</p>
        </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (verificationStatus?.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Not Verified
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Account Verification</h1>
            <p className="text-gray-600 mt-2">
              Verify your account to {currentUser.role === 'client' ? 'post jobs' : 'accept work'}
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Verification Status</h2>
              {getStatusBadge()}
            </div>

            {verificationStatus?.status === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-green-900 font-semibold mb-1">Account Verified! ✓</h3>
                    <p className="text-green-700 text-sm">
                      Your account has been successfully verified. You can now {currentUser.role === 'client' ? 'post jobs and hire service providers' : 'accept job offers and work with clients'}.
                    </p>
                    {verificationStatus.verifiedAt && (
                      <p className="text-green-600 text-xs mt-2">
                        Verified on: {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(currentUser.role === 'client' ? '/post-job' : '/jobs')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {currentUser.role === 'client' ? 'Post a Job' : 'Browse Jobs'}
                  </button>
                </div>
              </div>
            )}

            {verificationStatus?.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-yellow-900 font-semibold mb-1">Under Review</h3>
                    <p className="text-yellow-700 text-sm">
                      Your verification documents are being reviewed by our team. This usually takes 24-48 hours.
                    </p>
                    {verificationStatus.submittedAt && (
                      <p className="text-yellow-600 text-xs mt-2">
                        Submitted on: {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {verificationStatus?.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-red-900 font-semibold mb-1">Verification Rejected</h3>
                    <p className="text-red-700 text-sm mb-2">
                      {verificationStatus.rejectionReason || 'Your documents did not meet our verification requirements.'}
                    </p>
                    <p className="text-red-600 text-xs">
                      Please submit valid documents again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Upload Form */}
          {(verificationStatus?.status === 'unverified' || verificationStatus?.status === 'rejected') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Verification Documents</h2>
              
              <div className="bg-emerald-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Required Documents:
                </h3>
                <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                  <li>PAN Card (Permanent Account Number)</li>
                  <li>Aadhar Card (Unique Identification Number)</li>
                </ul>
                <p className="text-emerald-700 text-xs mt-3 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Note: For this demo, you can provide image URLs. In production, you would upload actual documents.</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Card Image URL *
                  </label>
                  <input
                    type="url"
                    value={panCardUrl}
                    onChange={(e) => setPanCardUrl(e.target.value)}
                    placeholder="https://example.com/pan-card.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a URL to your PAN card image (for demo purposes)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Card Image URL *
                  </label>
                  <input
                    type="url"
                    value={aadharCardUrl}
                    onChange={(e) => setAadharCardUrl(e.target.value)}
                    placeholder="https://example.com/aadhar-card.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a URL to your Aadhar card image (for demo purposes)
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Demo URLs (You can use these):</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>PAN:</strong> https://i.imgur.com/example-pan.jpg</p>
                    <p><strong>Aadhar:</strong> https://i.imgur.com/example-aadhar.jpg</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Verification;
