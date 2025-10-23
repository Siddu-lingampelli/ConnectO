import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { proposalService } from '../services/proposalService';
import type { Proposal } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const EditProposal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  useEffect(() => {
    loadProposal();
  }, [id]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        toast.error('Invalid proposal ID');
        navigate('/jobs');
        return;
      }

      const proposalData = await proposalService.getProposal(id);

      // Check if user owns this proposal
      const providerId = typeof proposalData.provider === 'object' 
        ? proposalData.provider._id 
        : proposalData.provider;
        
      if (providerId !== currentUser?._id) {
        toast.error('You can only edit your own proposals');
        navigate('/jobs');
        return;
      }

      // Check if proposal status allows editing
      if (proposalData.status === 'accepted') {
        toast.error('Cannot edit accepted proposals');
        navigate('/jobs');
        return;
      }

      if (proposalData.status === 'rejected') {
        toast.error('Cannot edit rejected proposals');
        navigate('/jobs');
        return;
      }

      // Pre-fill form with existing proposal data
      setProposal(proposalData);
      setCoverLetter(proposalData.coverLetter);
      setProposedBudget(proposalData.proposedBudget.toString());
      setEstimatedDuration(proposalData.estimatedDuration.toString());
    } catch (error: any) {
      console.error('Error loading proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to load proposal');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !proposal) {
      toast.error('Proposal information is missing');
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
      
      await proposalService.updateProposal(id, {
        coverLetter: coverLetter.trim(),
        proposedBudget: parseFloat(proposedBudget),
        estimatedDuration: estimatedDuration.trim(),
      });

      toast.success('Proposal updated successfully! ✅');
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error updating proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to update proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // Only providers can access this page
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Please login to edit proposals.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentUser.role !== 'provider') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">Access Denied</h2>
            <p className="text-[#6B8F71] mb-6">Only service providers can edit proposals.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
            >
              Browse Jobs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
            <p className="text-[#6B8F71] font-medium">Loading proposal...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Proposal not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Get job title safely
  const jobTitle = typeof proposal.job === 'object' ? proposal.job.title : 'Job';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-4 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-3xl">✏️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">Edit Proposal</h1>
                <p className="text-[#6B8F71] mt-1">
                  Update your proposal for: <span className="font-semibold">{jobTitle}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Proposal Status Info */}
          {proposal.status === 'pending' && (
            <div className="bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] border-2 border-[#6B8F71] rounded-2xl p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-[#345635] mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-[#0D2B1D] font-semibold">Proposal Status: Pending</h3>
                  <p className="text-[#345635] text-sm">You can edit your proposal while it's pending review.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  placeholder="Explain why you're the best fit for this job. Include relevant experience, skills, and your approach to completing the work."
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] resize-none"
                  required
                  minLength={50}
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  {coverLetter.length}/50 characters minimum
                </p>
              </div>

              {/* Proposed Budget */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Your Proposed Budget (₹) *
                </label>
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder="5000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  Enter your proposed budget for this job
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
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  How long will it take you to complete this job?
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="border-t-2 border-[#AEC3B0] pt-6">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all disabled:bg-gray-400 font-medium hover:scale-105"
                  >
                    {submitting ? '⏳ Updating Proposal...' : '✅ Update Proposal'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProposal;
