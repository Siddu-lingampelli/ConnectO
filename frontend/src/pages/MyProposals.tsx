import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { proposalService } from '../services/proposalService';
import type { Proposal } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const MyProposals = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProposals();
  }, [filterStatus, currentPage]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await proposalService.getMyProposals(
        filterStatus !== 'all' ? filterStatus : undefined,
        currentPage,
        10
      );
      setProposals(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Only providers can access this page
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Please login to view your proposals.</p>
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
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">Access Denied</h2>
            <p className="text-[#6B8F71] mb-6">Only service providers can view proposals.</p>
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
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">My Proposals</h1>
                <p className="text-[#6B8F71] mt-1">View and manage all your job proposals</p>
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'pending'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                ⏳ Pending
              </button>
              <button
                onClick={() => { setFilterStatus('accepted'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'accepted'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                ✅ Accepted
              </button>
              <button
                onClick={() => { setFilterStatus('rejected'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  filterStatus === 'rejected'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
                }`}
              >
                ❌ Rejected
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
              <p className="text-[#6B8F71] font-medium">Loading proposals...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && proposals.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">No Proposals Yet</h3>
              <p className="text-[#6B8F71] mb-8 text-lg">
                {filterStatus === 'all' 
                  ? 'You haven\'t submitted any proposals yet. Browse jobs to get started!' 
                  : `No ${filterStatus} proposals found.`}
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
              >
                Browse Jobs
              </button>
            </div>
          )}

          {/* Proposals List */}
          {!loading && proposals.length > 0 && (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const job = typeof proposal.job !== 'string' ? proposal.job : null;
                const client = job && typeof job.client !== 'string' ? job.client : null;
                
                return (
                  <div key={proposal._id} className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 hover:shadow-2xl hover:border-[#6B8F71] transition-all duration-300 hover:scale-[1.01]">
                    {/* Job Info Header */}
                    {job && (
                      <div className="mb-4 pb-4 border-b-2 border-[#AEC3B0]">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#0D2B1D] mb-2">{job.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-[#6B8F71] mb-2">
                              <span className="px-2 py-1 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] rounded-full font-medium">{job.category}</span>
                              {job.location && <span>📍 {job.location.city}</span>}
                              {client && <span>👤 {client.fullName}</span>}
                            </div>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Proposal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-[#6B8F71]">Your Budget</div>
                        <div className="text-2xl font-bold text-[#345635]">
                          ₹{proposal.proposedBudget.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#6B8F71]">Duration</div>
                        <div className="text-lg font-semibold text-[#0D2B1D]">
                          {proposal.estimatedDuration}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#6B8F71]">Submitted</div>
                        <div className="text-lg font-semibold text-[#0D2B1D]">
                          {formatDate(proposal.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    <div className="bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] rounded-xl p-4 mb-4 border-l-4 border-[#345635]">
                      <h4 className="font-semibold text-[#0D2B1D] mb-2">Cover Letter:</h4>
                      <p className="text-[#345635] line-clamp-3">{proposal.coverLetter}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-[#AEC3B0]">
                      <div>
                        {proposal.status === 'accepted' && (
                          <span className="text-sm text-[#345635] font-medium">🎉 Congratulations! This proposal was accepted</span>
                        )}
                        {proposal.status === 'rejected' && (
                          <span className="text-sm text-red-600">This proposal was rejected</span>
                        )}
                        {proposal.status === 'pending' && (
                          <span className="text-sm text-[#6B8F71]">⏳ Waiting for client response</span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        {job && (
                          <button
                            onClick={() => navigate(`/jobs/${typeof proposal.job === 'string' ? proposal.job : proposal.job._id}`)}
                            className="px-4 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium hover:scale-105"
                          >
                            View Job
                          </button>
                        )}
                        {proposal.status === 'pending' && (
                          <button
                            onClick={() => navigate(`/proposals/${proposal._id}/edit`)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
                          >
                            ✏️ Edit Proposal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold hover:scale-105"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 text-[#0D2B1D] font-bold bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-xl">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div></main>
      <Footer />
    </div>
  );
};

export default MyProposals;
