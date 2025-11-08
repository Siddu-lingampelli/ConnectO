import React, { useState } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' }
];

const IdVerificationForm: React.FC = () => {
  const [formData, setFormData] = useState<{
    idType: 'aadhaar' | 'pan' | 'passport' | 'driving_license' | 'voter_id';
    idNumber: string;
    idDocumentUrl: string;
    selfieUrl: string;
  }>({
    idType: 'aadhaar',
    idNumber: '',
    idDocumentUrl: '',
    selfieUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file: File, field: 'idDocumentUrl' | 'selfieUrl') => {
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to your backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, [field]: data.url }));
    } catch (err) {
      setError(`Failed to upload ${field === 'idDocumentUrl' ? 'ID document' : 'selfie'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.idNumber || !formData.idDocumentUrl || !formData.selfieUrl) {
      setError('Please fill all fields and upload both documents');
      return;
    }

    try {
      await verificationService.submitIdVerification(formData);
      setSuccess(true);
      setFormData({
        idType: 'aadhaar',
        idNumber: '',
        idDocumentUrl: '',
        selfieUrl: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit verification');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ID Verification</h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">ID verification submitted successfully! We'll review it within 24-48 hours.</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ID Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Type *
          </label>
          <select
            value={formData.idType}
            onChange={(e) => setFormData({ ...formData, idType: e.target.value as typeof formData.idType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {ID_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Number *
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            placeholder="Enter your ID number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* ID Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Document *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.idDocumentUrl ? (
              <div className="space-y-2">
                <img 
                  src={formData.idDocumentUrl} 
                  alt="ID Document" 
                  className="max-h-48 mx-auto rounded"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, idDocumentUrl: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload ID document</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'idDocumentUrl')}
                />
              </label>
            )}
          </div>
        </div>

        {/* Selfie Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selfie with ID *
          </label>
          <p className="text-xs text-gray-500 mb-2">Please hold your ID next to your face</p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.selfieUrl ? (
              <div className="space-y-2">
                <img 
                  src={formData.selfieUrl} 
                  alt="Selfie" 
                  className="max-h-48 mx-auto rounded"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selfieUrl: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload selfie</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'selfieUrl')}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Submit for Verification'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Verification Process</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your ID will be reviewed by our team within 24-48 hours</li>
          <li>• Ensure all details are clearly visible in the photos</li>
          <li>• The selfie must show your face and the ID clearly</li>
          <li>• Your personal information is securely encrypted</li>
        </ul>
      </div>
    </div>
  );
};

export default IdVerificationForm;
