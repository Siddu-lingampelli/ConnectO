import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { verificationService } from '../../services/verificationService';
import CertificationForm from './CertificationForm';

interface Certification {
  _id: string;
  skill: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'invalid' | 'expired';
}

const CertificationManager: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const data = await verificationService.getVerificationOverview();
      setCertifications(data.data.skillCertifications || []);
    } catch (err: any) {
      setError('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (certId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    try {
      await verificationService.deleteCertification(certId);
      setCertifications(prev => prev.filter(c => c._id !== certId));
    } catch (err: any) {
      alert('Failed to delete certification');
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadCertifications();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      invalid: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      verified: <CheckCircle className="w-4 h-4" />,
      invalid: <XCircle className="w-4 h-4" />,
      expired: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Skill Certifications</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Certification
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6">
          <CertificationForm 
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {certifications.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No certifications yet</p>
          <p className="text-gray-400 text-sm mb-4">Add your professional certifications to boost your profile</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Add your first certification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{cert.certificationName}</h3>
                    {getStatusBadge(cert.verificationStatus)}
                  </div>
                  
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Skill:</span> {cert.skill}
                  </p>
                  
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Issued by:</span> {cert.issuingOrganization}
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    <span className="font-medium">Issue Date:</span> {new Date(cert.issueDate).toLocaleDateString()}
                    {cert.expiryDate && (
                      <span> • <span className="font-medium">Expires:</span> {new Date(cert.expiryDate).toLocaleDateString()}</span>
                    )}
                  </p>

                  {cert.credentialId && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium">Credential ID:</span> {cert.credentialId}
                    </p>
                  )}

                  <div className="flex gap-3">
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View Credential →
                      </a>
                    )}
                    {cert.certificateUrl && (
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View Certificate →
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(cert._id)}
                  className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete certification"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About Certifications</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add professional certifications to increase trust</li>
          <li>• Our team will verify each certification</li>
          <li>• Verified certifications appear on your public profile</li>
          <li>• Include credential URLs for faster verification</li>
        </ul>
      </div>
    </div>
  );
};

export default CertificationManager;
