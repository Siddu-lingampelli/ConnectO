import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import type { User } from '../../types';

const AdminVerifications = () => {
  const [verifications, setVerifications] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingVerifications();
      setVerifications(response.data);
    } catch (error: any) {
      console.error('Error loading verifications:', error);
      toast.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (user: User) => {
    if (!user._id) {
      toast.error('Invalid user ID');
      return;
    }

    if (!window.confirm(`Approve verification for ${user.fullName}?`)) {
      return;
    }

    try {
      setProcessing(true);
      await adminService.updateVerificationStatus(user._id, 'verified');
      toast.success(`Verification approved for ${user.fullName}`);
      loadPendingVerifications();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (user: User) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowModal(true);
  };

  const submitRejection = async () => {
    if (!selectedUser || !selectedUser._id) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      await adminService.updateVerificationStatus(
        selectedUser._id!,  // Non-null assertion since we check above
        'rejected',
        rejectionReason
      );
      toast.success(`Verification rejected for ${selectedUser.fullName}`);
      setShowModal(false);
      setSelectedUser(null);
      loadPendingVerifications();
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pending Verifications</h2>
            <p className="text-gray-600 mt-1">Review and approve user verification documents</p>
          </div>
          <button
            onClick={loadPendingVerifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Verifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading verifications...</p>
            </div>
          </div>
        ) : verifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending verifications to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {verifications.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* User Info */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{user.fullName}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {user.role}
                          </span>
                          {user.phone && <span className="text-sm text-gray-500">📞 {user.phone}</span>}
                          {user.city && <span className="text-sm text-gray-500">📍 {user.city}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="text-sm font-medium">{formatDate(user.verification?.submittedAt)}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* PAN Card */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">PAN Card</h4>
                        <span className="text-2xl">🪪</span>
                      </div>
                      {user.verification?.panCardUrl ? (
                        <a
                          href={user.verification.panCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm underline block truncate"
                        >
                          {user.verification.panCardUrl}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not provided</p>
                      )}
                    </div>

                    {/* Aadhar Card */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Aadhar Card</h4>
                        <span className="text-2xl">🆔</span>
                      </div>
                      {user.verification?.aadharCardUrl ? (
                        <a
                          href={user.verification.aadharCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm underline block truncate"
                        >
                          {user.verification.aadharCardUrl}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(user)}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✓ Approve Verification
                    </button>
                    <button
                      onClick={() => handleReject(user)}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Verification
            </h3>
            <p className="text-gray-600 mb-4">
              You are rejecting verification for <strong>{selectedUser.fullName}</strong>.
              Please provide a reason:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., 'Documents are unclear', 'Invalid documents')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVerifications;
