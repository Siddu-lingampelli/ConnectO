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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to edit proposals.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentUser.role !== 'provider') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">Only service providers can edit proposals.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposal...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Proposal not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Get job title safely
  const jobTitle = typeof proposal.job === 'object' ? proposal.job.title : 'Job';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Proposal</h1>
            <p className="text-gray-600 mt-2">
              Update your proposal for: <span className="font-semibold">{jobTitle}</span>
            </p>
          </div>

          {/* Proposal Status Info */}
          {proposal.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-yellow-900 font-semibold">Proposal Status: Pending</h3>
                  <p className="text-yellow-700 text-sm">You can edit your proposal while it's pending review.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  placeholder="Explain why you're the best fit for this job. Include relevant experience, skills, and your approach to completing the work."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                  minLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {coverLetter.length}/50 characters minimum
                </p>
              </div>

              {/* Proposed Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposed Budget (₹) *
                </label>
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder="5000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your proposed budget for this job
                </p>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration *
                </label>
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g., 2-3 days, 1 week, 2 weeks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long will it take you to complete this job?
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {submitting ? 'Updating Proposal...' : 'Update Proposal'}
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
