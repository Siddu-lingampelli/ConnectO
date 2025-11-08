import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Search, Eye, ZoomIn } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface IdVerification {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  idType: string;
  idNumber: string;
  idDocumentUrl: string;
  selfieUrl: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

const AdminIdVerificationReview: React.FC = () => {
  const [verifications, setVerifications] = useState<IdVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<IdVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      const response = await verificationService.getPendingIdVerifications();
      setVerifications(response.data || []);
    } catch (error) {
      console.error('Failed to load verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this ID verification?')) return;

    setProcessing(true);
    try {
      await verificationService.reviewIdVerification(userId, 'verified');
      alert('ID verification approved successfully');
      loadPendingVerifications();
      setSelectedVerification(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this ID verification?')) return;

    setProcessing(true);
    try {
      await verificationService.reviewIdVerification(userId, 'rejected', rejectionReason);
      alert('ID verification rejected');
      loadPendingVerifications();
      setSelectedVerification(null);
      setRejectionReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const filteredVerifications = verifications.filter(v =>
    v.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">ID Verification Review</h2>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
          {filteredVerifications.length} Pending
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or ID number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Verifications List */}
      {filteredVerifications.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVerifications.map((verification) => (
            <div
              key={verification.userId._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* User Info */}
                <div className="flex items-start gap-4 flex-1">
                  {verification.userId.avatar ? (
                    <img
                      src={verification.userId.avatar}
                      alt={verification.userId.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold">
                      {verification.userId.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{verification.userId.name}</h3>
                    <p className="text-sm text-gray-600">{verification.userId.email}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">ID Type:</span> {verification.idType.toUpperCase()}</p>
                      <p><span className="font-medium">ID Number:</span> {verification.idNumber}</p>
                      <p><span className="font-medium">Submitted:</span> {new Date(verification.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setSelectedVerification(verification)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Review ID Verification</h3>
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* User Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  {selectedVerification.userId.avatar ? (
                    <img
                      src={selectedVerification.userId.avatar}
                      alt={selectedVerification.userId.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                      {selectedVerification.userId.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold">{selectedVerification.userId.name}</h4>
                    <p className="text-gray-600">{selectedVerification.userId.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID Type:</span> {selectedVerification.idType.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">ID Number:</span> {selectedVerification.idNumber}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* ID Document */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ID Document</h4>
                  <div className="relative group">
                    <img
                      src={selectedVerification.idDocumentUrl}
                      alt="ID Document"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <a
                      href={selectedVerification.idDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-lg transition-all"
                    >
                      <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>

                {/* Selfie */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Selfie with ID</h4>
                  <div className="relative group">
                    <img
                      src={selectedVerification.selfieUrl}
                      alt="Selfie with ID"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <a
                      href={selectedVerification.selfieUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-lg transition-all"
                    >
                      <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a clear reason for rejection..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
                <div className="mt-2 text-xs text-gray-500">
                  <p>Common reasons:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>ID document is not clear/readable</li>
                    <li>Selfie does not match ID photo</li>
                    <li>ID appears to be expired</li>
                    <li>ID appears to be tampered/fake</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedVerification.userId._id)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Approve Verification'}
                </button>
                <button
                  onClick={() => handleReject(selectedVerification.userId._id)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Reject Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIdVerificationReview;
