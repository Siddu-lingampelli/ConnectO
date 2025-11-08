import React, { useState, useEffect } from 'react';
import { Award, Search, CheckCircle, XCircle, Clock, ExternalLink, ZoomIn } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface Certification {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  skill: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'invalid' | 'expired';
  submittedAt: string;
}

const AdminCertificationReview: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, [filterStatus]);

  const loadCertifications = async () => {
    try {
      const response = await verificationService.getAllVerifications(filterStatus);
      // Extract certifications from users
      const allCerts: Certification[] = [];
      response.data.forEach((user: any) => {
        if (user.skillCertifications) {
          user.skillCertifications.forEach((cert: any) => {
            if (!filterStatus || filterStatus === 'all' || cert.verificationStatus === filterStatus) {
              allCerts.push({
                ...cert,
                userId: {
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar
                }
              });
            }
          });
        }
      });
      setCertifications(allCerts);
    } catch (error) {
      console.error('Failed to load certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, certId: string, status: 'verified' | 'invalid' | 'expired') => {
    if (!confirm(`Are you sure you want to mark this certification as ${status}?`)) return;

    setProcessing(true);
    try {
      await verificationService.verifyCertification(userId, certId, status);
      alert(`Certification marked as ${status}`);
      loadCertifications();
      setSelectedCert(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update certification');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      invalid: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-4 h-4" />,
      verified: <CheckCircle className="w-4 h-4" />,
      invalid: <XCircle className="w-4 h-4" />,
      expired: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredCertifications = certifications.filter(cert =>
    cert.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificationName.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Award className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Certification Review</h2>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
          {filteredCertifications.length} Certifications
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, skill, or certification name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'invalid', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications List */}
      {filteredCertifications.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No certifications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCertifications.map((cert) => (
            <div
              key={cert._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Certification Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* User Avatar */}
                  {cert.userId.avatar ? (
                    <img
                      src={cert.userId.avatar}
                      alt={cert.userId.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {cert.userId.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{cert.certificationName}</h3>
                      {getStatusBadge(cert.verificationStatus)}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">User:</span> {cert.userId.name} ({cert.userId.email})
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Skill:</span> {cert.skill}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Issued by:</span> {cert.issuingOrganization}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Issue Date:</span> {new Date(cert.issueDate).toLocaleDateString()}
                        {cert.expiryDate && (
                          <> • <span className="font-medium">Expires:</span> {new Date(cert.expiryDate).toLocaleDateString()}</>
                        )}
                      </p>
                      {cert.credentialId && (
                        <p className="text-gray-600">
                          <span className="font-medium">Credential ID:</span> {cert.credentialId}
                        </p>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-3 mt-3">
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Verify Credential
                        </a>
                      )}
                      {cert.certificateUrl && (
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <ZoomIn className="w-4 h-4" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {cert.verificationStatus === 'pending' && (
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Review Certification</h3>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* User & Certification Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  {selectedCert.userId.avatar ? (
                    <img
                      src={selectedCert.userId.avatar}
                      alt={selectedCert.userId.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {selectedCert.userId.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{selectedCert.userId.name}</h4>
                    <p className="text-sm text-gray-600">{selectedCert.userId.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Certification:</span>
                      <p className="text-gray-900">{selectedCert.certificationName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Skill:</span>
                      <p className="text-gray-900">{selectedCert.skill}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Issuing Organization:</span>
                      <p className="text-gray-900">{selectedCert.issuingOrganization}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Issue Date:</span>
                      <p className="text-gray-900">{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
                    </div>
                    {selectedCert.expiryDate && (
                      <div>
                        <span className="font-medium text-gray-700">Expiry Date:</span>
                        <p className="text-gray-900">{new Date(selectedCert.expiryDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedCert.credentialId && (
                      <div>
                        <span className="font-medium text-gray-700">Credential ID:</span>
                        <p className="text-gray-900">{selectedCert.credentialId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Links */}
              <div className="mb-6 space-y-3">
                {selectedCert.credentialUrl && (
                  <a
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border-2 border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <ExternalLink className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Verify Credential Online</h4>
                      <p className="text-sm text-emerald-700">{selectedCert.credentialUrl}</p>
                    </div>
                  </a>
                )}
                {selectedCert.certificateUrl && (
                  <a
                    href={selectedCert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ZoomIn className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">View Certificate Document</h4>
                      <p className="text-sm text-blue-700">Click to view/download certificate</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleVerify(selectedCert.userId._id, selectedCert._id, 'verified')}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Verify'}
                </button>
                <button
                  onClick={() => handleVerify(selectedCert.userId._id, selectedCert._id, 'invalid')}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Invalid'}
                </button>
                <button
                  onClick={() => handleVerify(selectedCert.userId._id, selectedCert._id, 'expired')}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Expired'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificationReview;
