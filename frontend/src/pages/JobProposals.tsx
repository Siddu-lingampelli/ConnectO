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
        return <span className="px-3 py-1 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] rounded-full text-sm font-medium">⏳ Pending</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-full text-sm font-medium">✅ Accepted</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">❌ Rejected</span>;
      case 'withdrawn':
        return <span className="px-3 py-1 bg-[#E3EFD3] text-[#6B8F71] rounded-full text-sm font-medium">↩️ Withdrawn</span>;
      default:
        return <span className="px-3 py-1 bg-[#E3EFD3] text-[#6B8F71] rounded-full text-sm font-medium">{status}</span>;
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-3">Access Denied</h2>
            <p className="text-[#6B8F71] mb-6">Only clients can view job proposals.</p>
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
            <p className="text-[#6B8F71] font-medium">Loading proposals...</p>
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

  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
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
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">Job Proposals</h1>
                <p className="text-[#6B8F71] mt-1">Review and manage proposals for your job</p>
              </div>
            </div>
          </div>

          {/* Job Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 mb-6 hover:shadow-2xl hover:border-[#6B8F71] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#0D2B1D] mb-2">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B8F71] mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white font-medium">
                    {job.category}
                  </span>
                  {job.location?.city && (
                    <span>📍 {job.location.city}{job.location.area && `, ${job.location.area}`}</span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0] text-white font-medium">
                    {job.status}
                  </span>
                </div>
                <p className="text-[#345635]">{job.description}</p>
              </div>
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-[#345635]">
                  ₹{job.budget.toLocaleString()}
                </div>
                <div className="text-sm text-[#6B8F71]">
                  {job.budgetType === 'hourly' ? 'Per Hour' : 'Fixed Price'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0D2B1D]">{proposals.length}</div>
                <div className="text-sm text-[#6B8F71] font-medium">Total Proposals</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#E3EFD3] to-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#345635]">{pendingCount}</div>
                <div className="text-sm text-[#6B8F71] font-medium">⏳ Pending</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#6B8F71]/10 to-white rounded-xl shadow-lg p-5 border-2 border-[#6B8F71] hover:border-[#345635] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#345635]">{acceptedCount}</div>
                <div className="text-sm text-[#6B8F71] font-medium">✅ Accepted</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-lg p-5 border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
                <div className="text-sm text-red-500 font-medium">❌ Rejected</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-8 border-2 border-[#AEC3B0]">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                All ({proposals.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'pending'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                ⏳ Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('accepted')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'accepted'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                ✅ Accepted ({acceptedCount})
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'rejected'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                ❌ Rejected ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Proposals List */}
          {proposals.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">No Proposals Yet</h3>
              <p className="text-[#6B8F71] text-lg">
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
                  <div key={proposal._id} className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-2xl hover:border-[#6B8F71] transition-all duration-300 hover:scale-[1.01]">
                    {/* Provider Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {provider && (
                          <>
                            <div className="w-16 h-16 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
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
                                <h3 className="text-xl font-bold text-[#0D2B1D]">{provider.fullName}</h3>
                                {getStatusBadge(proposal.status)}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B8F71] mb-2">
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
                                      className="px-2 py-1 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] text-xs rounded-full font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {provider.skills.length > 5 && (
                                    <span className="px-2 py-1 bg-[#E3EFD3] text-[#6B8F71] text-xs rounded-full font-medium">
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
                        <div className="text-2xl font-bold text-[#345635] mb-1">
                          ₹{proposal.proposedBudget.toLocaleString()}
                        </div>
                        <div className="text-sm text-[#6B8F71] mb-2">
                          Proposed Budget
                        </div>
                        <div className="text-sm text-[#6B8F71]">
                          ⏱️ {proposal.estimatedDuration}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] border-l-4 border-[#345635] rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-[#0D2B1D] mb-2">Cover Letter:</h4>
                      <p className="text-[#345635] whitespace-pre-wrap">{proposal.coverLetter}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-[#AEC3B0]">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-[#6B8F71]">
                          Submitted on {formatDate(proposal.createdAt)}
                        </div>
                        {provider && (
                          <button
                            onClick={() => navigate(`/profile/${provider.id || provider._id}`)}
                            className="px-4 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium text-sm hover:scale-105"
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
                            className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium disabled:opacity-50 hover:scale-105"
                          >
                            {processingId === proposal._id ? 'Processing...' : '❌ Reject'}
                          </button>
                          <button
                            onClick={() => handleAcceptProposal(proposal._id)}
                            disabled={processingId === proposal._id}
                            className="px-4 py-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium disabled:opacity-50 hover:scale-105"
                          >
                            {processingId === proposal._id ? 'Processing...' : '✅ Accept Proposal'}
                          </button>
                        </div>
                      )}

                      {proposal.status === 'accepted' && provider && (
                        <button
                          onClick={() => navigate(`/messages?userId=${provider.id || provider._id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
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
      </div></main>
      <Footer />
    </div>
  );
};

export default JobProposals;
