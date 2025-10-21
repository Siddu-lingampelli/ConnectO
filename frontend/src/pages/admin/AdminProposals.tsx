import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';

interface Proposal {
  _id: string;
  provider: {
    _id: string;
    fullName: string;
    email: string;
  };
  job: {
    _id: string;
    title: string;
  };
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AdminProposals = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadProposals();
  }, [currentPage, statusFilter, searchQuery, refreshKey]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await adminService.getAllProposals(params);
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
    const styles: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      withdrawn: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const proposalStats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Proposals</h2>
            <p className="text-gray-600 mt-1">Oversee all proposals submitted on the platform</p>
          </div>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Proposals</div>
            <div className="text-3xl font-bold text-gray-900">{proposalStats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{proposalStats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Accepted</div>
            <div className="text-3xl font-bold text-green-600">{proposalStats.accepted}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-600">{proposalStats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Proposals</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by provider, job title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading proposals...</p>
            </div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Found</h3>
            <p className="text-gray-600">No proposals match your current filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {proposal.job?.title || 'Job Title Not Available'}
                      </h3>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Provider:</span> {proposal.provider?.fullName || 'Unknown'} ({proposal.provider?.email || 'N/A'})
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Cover Letter:</span> {proposal.coverLetter.substring(0, 150)}
                        {proposal.coverLetter.length > 150 && '...'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Budget:</span> ₹{proposal.proposedBudget.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Duration:</span> {proposal.estimatedDuration}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Submitted:</span> {formatDate(proposal.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last updated: {formatDate(proposal.updatedAt)}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedProposal(proposal)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {proposal.job?._id && (
                      <button
                        onClick={() => navigate(`/jobs/${proposal.job._id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        View Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
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

        {/* Proposal Detail Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-2xl font-bold text-gray-900">Proposal Details</h3>
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Job</h4>
                  <p className="text-gray-700">{selectedProposal.job?.title || 'Not Available'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Provider</h4>
                  <p className="text-gray-700">{selectedProposal.provider?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{selectedProposal.provider?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  {getStatusBadge(selectedProposal.status)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.coverLetter}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Proposed Budget</h4>
                    <p className="text-2xl font-bold text-green-600">₹{selectedProposal.proposedBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Estimated Duration</h4>
                    <p className="text-2xl font-bold text-blue-600">{selectedProposal.estimatedDuration}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                  <p className="text-sm text-gray-600">Submitted: {formatDate(selectedProposal.createdAt)}</p>
                  <p className="text-sm text-gray-600">Last Updated: {formatDate(selectedProposal.updatedAt)}</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedProposal.job?._id && (
                  <button
                    onClick={() => {
                      navigate(`/jobs/${selectedProposal.job._id}`);
                      setSelectedProposal(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Job
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProposals;
