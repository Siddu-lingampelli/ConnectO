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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to view your proposals.</p>
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
            <p className="text-gray-600">Only service providers can view proposals.</p>
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
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
            <p className="text-gray-600 mt-2">
              View and manage all your job proposals
            </p>
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => { setFilterStatus('accepted'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'accepted'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => { setFilterStatus('rejected'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading proposals...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && proposals.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? 'You haven\'t submitted any proposals yet. Browse jobs to get started!' 
                  : `No ${filterStatus} proposals found.`}
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                  <div key={proposal._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    {/* Job Info Header */}
                    {job && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{job.category}</span>
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
                        <div className="text-sm text-gray-600">Your Budget</div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{proposal.proposedBudget.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {proposal.estimatedDuration}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Submitted</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatDate(proposal.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Cover Letter:</h4>
                      <p className="text-gray-700 line-clamp-3">{proposal.coverLetter}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        {proposal.status === 'accepted' && (
                          <span className="text-sm text-green-600 font-medium">🎉 Congratulations! This proposal was accepted</span>
                        )}
                        {proposal.status === 'rejected' && (
                          <span className="text-sm text-red-600">This proposal was rejected</span>
                        )}
                        {proposal.status === 'pending' && (
                          <span className="text-sm text-yellow-600">Waiting for client response</span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        {job && (
                          <button
                            onClick={() => navigate(`/jobs/${typeof proposal.job === 'string' ? proposal.job : proposal.job._id}`)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                          >
                            View Job
                          </button>
                        )}
                        {proposal.status === 'pending' && (
                          <button
                            onClick={() => navigate(`/proposals/${proposal._id}/edit`)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                          >
                            Edit Proposal
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
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProposals;
