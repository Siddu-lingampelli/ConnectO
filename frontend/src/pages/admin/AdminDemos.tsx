import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { demoService, type DemoProject, type DemoStats } from '../../services/demoService';

const AdminDemos = () => {
  const [demos, setDemos] = useState<DemoProject[]>([]);
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);
  const [reviewScore, setReviewScore] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Assign Demo Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    freelancerId: '',
    freelancerEmail: '',
    freelancerType: 'Technical' as 'Technical' | 'Non-Technical',
    demoTitle: '',
    description: '',
  });

  useEffect(() => {
    loadDemos();
    loadStats();
  }, [currentPage, statusFilter, typeFilter, refreshKey]);

  const loadDemos = async () => {
    try {
      setLoading(true);
      const data = await demoService.getAllDemos({
        status: statusFilter,
        type: typeFilter,
        page: currentPage,
        limit: 10,
      });
      setDemos(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error: any) {
      console.error('Error loading demos:', error);
      toast.error('Failed to load demos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await demoService.getDemoStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAssignDemo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignFormData.freelancerId && !assignFormData.freelancerEmail) {
      toast.error('Please provide freelancer ID or email');
      return;
    }

    try {
      await demoService.assignDemo({
        freelancerId: assignFormData.freelancerId || undefined,
        freelancerEmail: assignFormData.freelancerEmail || undefined,
        freelancerType: assignFormData.freelancerType,
        demoTitle: assignFormData.demoTitle,
        description: assignFormData.description,
      });

      toast.success('Demo project assigned successfully! 🎉');
      setShowAssignModal(false);
      setAssignFormData({
        freelancerId: '',
        freelancerEmail: '',
        freelancerType: 'Technical',
        demoTitle: '',
        description: '',
      });
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error assigning demo:', error);
      toast.error(error.response?.data?.message || 'Failed to assign demo');
    }
  };

  const handleReviewDemo = async (demo: DemoProject) => {
    const score = parseInt(reviewScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Please enter a valid score (0-100)');
      return;
    }

    try {
      await demoService.reviewDemo(demo._id, {
        score,
        adminComments: reviewComments,
      });

      toast.success(`Demo ${score >= 60 ? 'verified' : 'rejected'} successfully`);
      setSelectedDemo(null);
      setReviewScore('');
      setReviewComments('');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error reviewing demo:', error);
      toast.error(error.response?.data?.message || 'Failed to review demo');
    }
  };

  const handleDeleteDemo = async (demoId: string) => {
    if (!window.confirm('Are you sure you want to delete this demo project?')) {
      return;
    }

    try {
      await demoService.deleteDemo(demoId);
      toast.success('Demo project deleted successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error deleting demo:', error);
      toast.error('Failed to delete demo');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      Pending: 'bg-yellow-100 text-yellow-700',
      'Under Review': 'bg-blue-100 text-blue-700',
      Verified: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Demo Projects Management</h2>
            <p className="text-gray-600 mt-1">Assign, review, and score freelancer demo projects</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Assign Demo
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total Demos</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Under Review</div>
              <div className="text-3xl font-bold text-blue-600">{stats.byStatus.underReview}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Verified</div>
              <div className="text-3xl font-bold text-green-600">{stats.byStatus.verified}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Score</div>
              <div className="text-3xl font-bold text-purple-600">{stats.averageScore}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demos List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading demos...</p>
            </div>
          </div>
        ) : demos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Demo Projects Found</h3>
            <p className="text-gray-600">No demos match your current filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {demos.map((demo) => (
              <div key={demo._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{demo.demoTitle}</h3>
                      {getStatusBadge(demo.status)}
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {demo.freelancerType}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{demo.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Freelancer:</strong> {demo.freelancer.fullName} ({demo.freelancer.email})
                      </span>
                      <span>
                        <strong>Assigned:</strong> {new Date(demo.dateAssigned).toLocaleDateString()}
                      </span>
                      {demo.dateSubmitted && (
                        <span>
                          <strong>Submitted:</strong> {new Date(demo.dateSubmitted).toLocaleDateString()}
                        </span>
                      )}
                      {demo.score !== undefined && (
                        <span>
                          <strong>Score:</strong> {demo.score}/100
                        </span>
                      )}
                    </div>
                    {demo.submissionLink && (
                      <div className="mt-2 text-sm">
                        <strong>Submission:</strong>{' '}
                        <a
                          href={demo.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {demo.submissionLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  {demo.status === 'Under Review' && (
                    <button
                      onClick={() => {
                        setSelectedDemo(demo);
                        setReviewScore('');
                        setReviewComments('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Review & Score
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDemo(demo._id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
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

        {/* Assign Demo Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-2xl font-bold text-gray-900">Assign Demo Project</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAssignDemo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Freelancer ID or Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignFormData.freelancerEmail || assignFormData.freelancerId}
                    onChange={(e) => setAssignFormData({
                      ...assignFormData,
                      freelancerEmail: e.target.value,
                      freelancerId: '',
                    })}
                    placeholder="Enter freelancer email or ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Freelancer Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignFormData.freelancerType}
                    onChange={(e) => setAssignFormData({
                      ...assignFormData,
                      freelancerType: e.target.value as 'Technical' | 'Non-Technical',
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Technical">Technical</option>
                    <option value="Non-Technical">Non-Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demo Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignFormData.demoTitle}
                    onChange={(e) => setAssignFormData({ ...assignFormData, demoTitle: e.target.value })}
                    placeholder="E.g., Build a Simple Landing Page"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={assignFormData.description}
                    onChange={(e) => setAssignFormData({ ...assignFormData, description: e.target.value })}
                    placeholder="Describe the demo project task in detail..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Demo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {selectedDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Review Demo Project</h3>
                <button
                  onClick={() => setSelectedDemo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedDemo.demoTitle}</h4>
                  <p className="text-sm text-gray-700 mb-2">{selectedDemo.description}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Freelancer:</strong> {selectedDemo.freelancer.fullName}
                  </p>
                  {selectedDemo.submissionLink && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Submission:</strong>{' '}
                      <a
                        href={selectedDemo.submissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedDemo.submissionLink}
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(e.target.value)}
                    placeholder="Enter score (60+ to verify)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Score ≥ 60 = Verified, Score &lt; 60 = Rejected</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Comments (Optional)
                  </label>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Provide feedback to the freelancer..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setSelectedDemo(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReviewDemo(selectedDemo)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDemos;
