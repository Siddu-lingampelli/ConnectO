import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, DollarSign, Calendar, Clock, 
  User, Award, FileText, Send, ArrowLeft, AlertCircle,
  CheckCircle, TrendingUp, Target
} from 'lucide-react';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import { proposalService } from '../services/proposalService';
import type { Job } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const ApplyJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  // Get active role for dual role system
  const activeRole = currentUser?.activeRole || currentUser?.role || 'client';
  
  // Check verification and demo status
  const isVerified = currentUser?.verification?.status === 'verified';
  const demoStatus = currentUser?.demoVerification?.status;
  const isDemoVerified = demoStatus === 'verified';
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  // Check if user is in provider mode
  useEffect(() => {
    if (activeRole !== 'provider') {
      toast.error('Only providers can apply to jobs. Switch to provider mode first.');
      navigate('/jobs');
      return;
    }
    
    if (!isVerified) {
      toast.error('Please complete verification before applying to jobs.');
      navigate('/verification');
      return;
    }
    
    if (!isDemoVerified) {
      toast.error('Please complete and pass the demo project before applying to jobs.');
      navigate('/demo-project');
      return;
    }
  }, [activeRole, isVerified, isDemoVerified, navigate]);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const jobData = await jobService.getJob(id);
      setJob(jobData);
      // Set proposed budget to job budget by default
      setProposedBudget(jobData.budget.toString());
    } catch (error: any) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !job) {
      toast.error('Job information is missing');
      return;
    }

    // Check provider type match
    if (currentUser?.providerType !== job.providerType) {
      toast.error(`This job requires ${job.providerType} service providers. Your profile is set as ${currentUser?.providerType}.`);
      return;
    }

    if (coverLetter.length < 50) {
      toast.error('Cover letter must be at least 50 characters');
      return;
    }

    if (!proposedBudget || parseFloat(proposedBudget) <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    if (!estimatedDuration) {
      toast.error('Please provide estimated duration');
      return;
    }

    try {
      setSubmitting(true);
      
      await proposalService.createProposal({
        jobId: id,
        coverLetter: coverLetter.trim(),
        proposedBudget: parseFloat(proposedBudget),
        estimatedDuration: estimatedDuration.trim(),
      });

      toast.success('Proposal submitted successfully!');
      
      // Navigate back to jobs page after a short delay
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      
      // Show specific error message for provider type mismatch
      if (error.response?.data?.providerTypeMismatch) {
        toast.error(`❌ ${error.response.data.message}`, { autoClose: 5000 });
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit proposal');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Only providers can access this page
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Please login to apply for jobs.</p>
        </div></main>
        <Footer />
      </div>
    );
  }

  if (currentUser.role !== 'provider') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-3">Access Denied</h2>
            <p className="text-[#6B8F71] mb-6">Only service providers can apply for jobs.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
            >
              Browse Jobs
            </button>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  // Check if provider's demo project is verified
  if (demoStatus !== 'verified') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="max-w-2xl bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">Demo Project Verification Required</h2>
            <p className="text-[#345635] mb-6">
              {demoStatus === 'not_assigned' || !demoStatus
                ? 'You need to complete a demo project before applying for jobs. Please wait for admin to assign you a demo task.'
                : demoStatus === 'pending'
                ? 'Your demo project is pending submission. Please complete and submit it first.'
                : demoStatus === 'under_review'
                ? 'Your demo project is under review. Please wait for admin approval before applying for jobs.'
                : demoStatus === 'rejected'
                ? `Your demo project was rejected${currentUser.demoVerification?.score ? ` with a score of ${currentUser.demoVerification.score}/100` : ''}. You need a score of at least 60 to apply for jobs. Please resubmit your demo.`
                : 'Your demo project status is unclear. Please contact admin.'}
            </p>
            {currentUser.demoVerification?.adminComments && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <strong>Admin Feedback:</strong> {currentUser.demoVerification.adminComments}
                </p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium hover:scale-105"
              >
                Browse Jobs
              </button>
            </div>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
            <p className="text-[#6B8F71] font-medium">Loading job details...</p>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Job not found.</p>
        </div></main>
        <Footer />
      </div>
    );
  }

  const client = typeof job.client !== 'string' ? job.client : null;

  // Check if provider type matches job requirement
  const providerTypeMismatch = currentUser?.providerType !== job.providerType;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-4 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Jobs</span>
            </button>
            <div className="flex items-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-3xl">📝</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">Apply for Job</h1>
                <p className="text-[#6B8F71] mt-1">Submit your proposal to the client</p>
              </div>
            </div>
          </div>

          {/* Provider Type Mismatch Warning */}
          {providerTypeMismatch && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="text-3xl mr-4">🚫</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Cannot Apply - Provider Type Mismatch</h3>
                  <p className="text-red-800 mb-3">
                    This job requires <strong>{job.providerType}</strong> service providers, 
                    but your profile is set as <strong>{currentUser?.providerType}</strong>.
                  </p>
                  <p className="text-sm text-red-700">
                    You can only apply to jobs that match your provider type. 
                    Please browse jobs suitable for {currentUser?.providerType} providers.
                  </p>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Browse Suitable Jobs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Job Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 mb-6 hover:shadow-2xl hover:border-[#6B8F71] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#0D2B1D] mb-2">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B8F71]">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white font-medium">
                    {job.category}
                  </span>
                  {job.location?.city && (
                    <span>📍 {job.location.city}{job.location.area && `, ${job.location.area}`}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#345635]">
                  ₹{job.budget.toLocaleString()}
                </div>
                <div className="text-sm text-[#6B8F71]">
                  {job.budgetType === 'hourly' ? 'Per Hour' : 'Fixed Price'}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#AEC3B0] pt-4">
              <h3 className="font-semibold text-[#0D2B1D] mb-2">Job Description:</h3>
              <p className="text-[#345635] mb-4">{job.description}</p>

              {client && (
                <div className="bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl p-4 mt-4 border-l-4 border-[#345635]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-[#0D2B1D]">About the Client:</h4>
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${client.id || client._id}`)}
                      className="px-4 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium text-sm hover:scale-105"
                    >
                      👤 View Full Profile
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {client.profilePicture ? (
                        <img 
                          src={client.profilePicture} 
                          alt={client.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        client.fullName?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0D2B1D]">{client.fullName}</p>
                      <div className="flex items-center text-sm text-[#6B8F71]">
                        {client.city && <span>📍 {client.city}</span>}
                        {client.rating && (
                          <span className="ml-3">⭐ {client.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Proposal Form */}
          <div className={`bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 ${providerTypeMismatch ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold text-[#0D2B1D] mb-4">Your Proposal</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you're the best fit for this job. Minimum 50 characters."
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                  disabled={providerTypeMismatch}
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  {coverLetter.length}/50 characters minimum
                </p>
              </div>

              {/* Proposed Budget */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Proposed Budget (₹) *
                </label>
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  disabled={providerTypeMismatch}
                  placeholder="Enter your proposed budget"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  Client's budget: ₹{job.budget.toLocaleString()} ({job.budgetType})
                </p>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Estimated Duration *
                </label>
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g., 2-3 days, 1 week, 2 weeks"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                  disabled={providerTypeMismatch}
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  How long will it take to complete this job?
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] border-2 border-[#AEC3B0] rounded-xl p-4">
                <h4 className="font-semibold text-[#0D2B1D] mb-2">💡 Tips for a Great Proposal:</h4>
                <ul className="list-disc list-inside text-[#345635] text-sm space-y-1">
                  <li>Personalize your cover letter for this specific job</li>
                  <li>Highlight relevant experience and skills</li>
                  <li>Be realistic with your budget and timeline</li>
                  <li>Proofread before submitting</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting || providerTypeMismatch}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all font-medium ${
                    providerTypeMismatch 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white hover:shadow-xl disabled:bg-gray-400 hover:scale-105'
                  }`}
                >
                  {submitting ? 'Submitting...' : providerTypeMismatch ? 'Cannot Apply' : '✨ Submit Proposal'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div></main>
      <Footer />
    </div>
  );
};

export default ApplyJob;
