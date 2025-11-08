import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, DollarSign, Calendar, Clock, 
  User, Award, FileText, Send, ArrowLeft, AlertCircle,
  CheckCircle, TrendingUp, Target, Sparkles
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
  
  const activeRole = currentUser?.activeRole || currentUser?.role || 'client';
  const isVerified = currentUser?.verification?.status === 'verified';
  const demoStatus = currentUser?.demoVerification?.status;
  const isDemoVerified = demoStatus === 'verified';
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

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
      
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      
      if (error.response?.data?.providerTypeMismatch) {
        toast.error(`❌ ${error.response.data.message}`, { autoClose: 5000 });
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit proposal');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-2xl shadow-soft border border-border p-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Login Required</h2>
            <p className="text-text-secondary mb-6">Please login to apply for jobs</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl font-medium hover:shadow-medium transition-all"
            >
              Login Now
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
            <p className="text-text-secondary font-medium">Loading job details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary font-medium">Job not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const client = typeof job.client !== 'string' ? job.client : null;
  const providerTypeMismatch = currentUser?.providerType !== job.providerType;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Jobs</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl flex items-center justify-center shadow-soft">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-primary">Apply for Job</h1>
                <p className="text-text-secondary mt-1">Submit your proposal to the client</p>
              </div>
            </div>
          </motion.div>

          {/* Provider Type Mismatch Warning */}
          {providerTypeMismatch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Cannot Apply - Provider Type Mismatch</h3>
                  <p className="text-red-800 mb-3">
                    This job requires <strong>{job.providerType}</strong> service providers, 
                    but your profile is set as <strong>{currentUser?.providerType}</strong>.
                  </p>
                  <p className="text-sm text-red-700 mb-4">
                    You can only apply to jobs that match your provider type.
                  </p>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                  >
                    Browse Suitable Jobs
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Proposal Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#6B8F71]" />
                  Your Proposal
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you're the best fit for this job. Highlight your relevant experience and skills..."
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all"
                      required
                      disabled={providerTypeMismatch}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-text-secondary">
                        {coverLetter.length}/50 characters minimum
                      </p>
                      {coverLetter.length >= 50 && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Great!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proposed Budget */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Proposed Budget (₹) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      <input
                        type="number"
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(e.target.value)}
                        disabled={providerTypeMismatch}
                        placeholder="Enter your proposed budget"
                        min="0"
                        step="1"
                        className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      Client's budget: ₹{job.budget.toLocaleString()} ({job.budgetType})
                    </p>
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Estimated Duration *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      <input
                        type="text"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="e.g., 2-3 days, 1 week, 2 weeks"
                        className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all"
                        required
                        disabled={providerTypeMismatch}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      How long will it take to complete this job?
                    </p>
                  </div>

                  {/* Tips Box */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-xl p-4 border-l-4 border-[#345635]"
                  >
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#345635]" />
                      Tips for a Great Proposal
                    </h4>
                    <ul className="space-y-2 text-sm text-text-primary">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#345635] mt-0.5 flex-shrink-0" />
                        <span>Personalize your cover letter for this specific job</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#345635] mt-0.5 flex-shrink-0" />
                        <span>Highlight relevant experience and skills</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#345635] mt-0.5 flex-shrink-0" />
                        <span>Be realistic with your budget and timeline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#345635] mt-0.5 flex-shrink-0" />
                        <span>Proofread before submitting</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting || providerTypeMismatch}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        providerTypeMismatch 
                          ? 'bg-surface text-text-secondary cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white hover:shadow-medium disabled:bg-surface hover:scale-[1.02]'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : providerTypeMismatch ? (
                        'Cannot Apply'
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Proposal
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/jobs')}
                      className="px-6 py-3 border-2 border-border text-text-primary rounded-xl hover:bg-surface transition-all font-semibold hover:scale-[1.02]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Sidebar - Job Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-soft border border-border p-6 sticky top-24">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#6B8F71]" />
                  Job Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg text-text-primary mb-2">{job.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-xs font-semibold">
                        {job.category}
                      </span>
                      {job.providerType && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.providerType === 'Technical'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {job.providerType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-[#6B8F71]" />
                      <div>
                        <p className="text-xs text-text-secondary">Budget</p>
                        <p className="font-bold text-text-primary">₹{job.budget.toLocaleString()}</p>
                      </div>
                    </div>

                    {job.location?.city && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#6B8F71]" />
                        <div>
                          <p className="text-xs text-text-secondary">Location</p>
                          <p className="font-semibold text-text-primary">{job.location.city}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#6B8F71]" />
                      <div>
                        <p className="text-xs text-text-secondary">Posted</p>
                        <p className="font-semibold text-text-primary">
                          {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-[#6B8F71]" />
                      <div>
                        <p className="text-xs text-text-secondary">Proposals</p>
                        <p className="font-semibold text-text-primary">{job.proposals?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {client && (
                    <>
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-text-secondary mb-3">CLIENT</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold shadow-soft">
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
                          <div className="flex-1">
                            <p className="font-semibold text-text-primary">{client.fullName}</p>
                            {client.city && (
                              <p className="text-xs text-text-secondary flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {client.city}
                              </p>
                            )}
                            {client.rating && (
                              <p className="text-xs text-text-secondary flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {client.rating.toFixed(1)} rating
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/profile/${client.id || client._id}`)}
                          className="w-full px-4 py-2 border-2 border-border text-text-primary rounded-xl hover:bg-surface transition-all font-medium text-sm"
                        >
                          View Profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyJob;
