import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface CertificationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CertificationForm: React.FC<CertificationFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    skill: '',
    certificationName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    certificateUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError('');
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, certificateUrl: data.url }));
    } catch (err) {
      setError('Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.skill || !formData.certificationName || !formData.issuingOrganization || !formData.issueDate) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const submitData: any = {
        skill: formData.skill,
        certificationName: formData.certificationName,
        issuingOrganization: formData.issuingOrganization,
        issueDate: formData.issueDate
      };

      if (formData.expiryDate) submitData.expiryDate = formData.expiryDate;
      if (formData.credentialId) submitData.credentialId = formData.credentialId;
      if (formData.credentialUrl) submitData.credentialUrl = formData.credentialUrl;
      if (formData.certificateUrl) submitData.certificateUrl = formData.certificateUrl;

      await verificationService.addCertification(submitData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add certification');
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Certification</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Skill */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill *
          </label>
          <input
            type="text"
            value={formData.skill}
            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
            placeholder="e.g., Web Development, Plumbing, Graphic Design"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Certification Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certification Name *
          </label>
          <input
            type="text"
            value={formData.certificationName}
            onChange={(e) => setFormData({ ...formData, certificationName: e.target.value })}
            placeholder="e.g., AWS Certified Developer, Master Plumber License"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Issuing Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issuing Organization *
          </label>
          <input
            type="text"
            value={formData.issuingOrganization}
            onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
            placeholder="e.g., Amazon Web Services, National Plumbing Association"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date *
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Credential ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credential ID (Optional)
          </label>
          <input
            type="text"
            value={formData.credentialId}
            onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
            placeholder="Enter credential/license ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Credential URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credential URL (Optional)
          </label>
          <input
            type="url"
            value={formData.credentialUrl}
            onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Link to verify your credential online</p>
        </div>

        {/* Certificate Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate Document (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {formData.certificateUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">✓ Certificate uploaded</p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, certificateUrl: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Upload certificate image/PDF</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Add Certification'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CertificationForm;
