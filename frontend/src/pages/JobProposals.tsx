import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import { proposalService } from '../services/proposalService';
import type { Job, Proposal } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const JobProposals = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadJobAndProposals();
  }, [id, filterStatus]);

  const loadJobAndProposals = async () => {
    try {
      setLoading(true);
      if (!id) return;

      // Load job details
      const jobData = await jobService.getJob(id);
      setJob(jobData);

      // Load proposals
      const proposalsData = await proposalService.getJobProposals(
        id, 
        filterStatus !== 'all' ? filterStatus : undefined
      );
      setProposals(proposalsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.response?.data?.message || 'Failed to load proposals');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!window.confirm('Are you sure you want to accept this proposal? This will reject all other proposals for this job.')) {
      return;
    }

    try {
      setProcessingId(proposalId);
      await proposalService.updateProposalStatus(proposalId, 'accepted');
      toast.success('Proposal accepted successfully!');
      
      // Reload data
      await loadJobAndProposals();
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) {
      return;
    }

    try {
      setProcessingId(proposalId);
      await proposalService.updateProposalStatus(proposalId, 'rejected');
      toast.success('Proposal rejected');
      
      // Reload data
      await loadJobAndProposals();
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">⏳ Pending</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✅ Accepted</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">❌ Rejected</span>;
      case 'withdrawn':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">↩️ Withdrawn</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Only clients can access this page
  if (!currentUser || currentUser.role !== 'client') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only clients can view job proposals.</p>
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
            <p className="text-gray-600">Loading proposals...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Job not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/jobs')}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
            >
              ← Back to Jobs
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Job Proposals</h1>
            <p className="text-gray-600 mt-2">Review and manage proposals for your job</p>
          </div>

          {/* Job Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {job.category}
                  </span>
                  <span>📍 {job.location.city}, {job.location.area}</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    {job.status}
                  </span>
                </div>
                <p className="text-gray-700">{job.description}</p>
              </div>
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-green-600">
                  ₹{job.budget.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {job.budgetType === 'hourly' ? 'Per Hour' : 'Fixed Price'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{proposals.length}</div>
                <div className="text-sm text-gray-600">Total Proposals</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{acceptedCount}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({proposals.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('accepted')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'accepted'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Accepted ({acceptedCount})
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Proposals List */}
          {proposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600">
                {filterStatus === 'all' 
                  ? 'No service providers have applied to this job yet.' 
                  : `No ${filterStatus} proposals.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const provider = typeof proposal.provider !== 'string' ? proposal.provider : null;
                
                return (
                  <div key={proposal._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    {/* Provider Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {provider && (
                          <>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                              {provider.profilePicture ? (
                                <img 
                                  src={provider.profilePicture} 
                                  alt={provider.fullName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                provider.fullName?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{provider.fullName}</h3>
                                {getStatusBadge(proposal.status)}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                {provider.city && <span>📍 {provider.city}</span>}
                                {provider.rating && (
                                  <span>⭐ {provider.rating.toFixed(1)}</span>
                                )}
                                <span>✉️ {provider.email}</span>
                              </div>
                              {provider.skills && provider.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {provider.skills.slice(0, 5).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {provider.skills.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      +{provider.skills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Proposal Details */}
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          ₹{proposal.proposedBudget.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Proposed Budget
                        </div>
                        <div className="text-sm text-gray-600">
                          ⏱️ {proposal.estimatedDuration}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Cover Letter:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{proposal.coverLetter}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-500">
                          Submitted on {formatDate(proposal.createdAt)}
                        </div>
                        {provider && (
                          <button
                            onClick={() => navigate(`/profile/${provider.id || provider._id}`)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                          >
                            👤 View Profile
                          </button>
                        )}
                      </div>

                      {proposal.status === 'pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleRejectProposal(proposal._id)}
                            disabled={processingId === proposal._id}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                          >
                            {processingId === proposal._id ? 'Processing...' : 'Reject'}
                          </button>
                          <button
                            onClick={() => handleAcceptProposal(proposal._id)}
                            disabled={processingId === proposal._id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {processingId === proposal._id ? 'Processing...' : 'Accept Proposal'}
                          </button>
                        </div>
                      )}

                      {proposal.status === 'accepted' && provider && (
                        <button
                          onClick={() => navigate(`/messages?userId=${provider.id || provider._id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          💬 Message Provider
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobProposals;
