import { useState } from 'react';
import { toast } from 'react-toastify';

interface DocumentsStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  loading?: boolean;
}

const DocumentsStep = ({ data, onComplete, onBack, loading }: DocumentsStepProps) => {
  const [formData, setFormData] = useState({
    idProof: data.documents?.idProof || '',
    addressProof: data.documents?.addressProof || '',
    certifications: data.documents?.certifications || [],
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Simulated file upload (replace with actual upload logic)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'idProof' | 'addressProof' | 'certification'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    setUploadingDoc(docType);

    try {
      // TODO: Implement actual file upload to server
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await uploadService.uploadDocument(formData);
      
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock uploaded file URL
      const mockUrl = `https://example.com/uploads/${file.name}`;
      
      if (docType === 'certification') {
        setFormData({
          ...formData,
          certifications: [...formData.certifications, mockUrl],
        });
      } else {
        setFormData({
          ...formData,
          [docType]: mockUrl,
        });
      }
      
      toast.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_: string, i: number) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Documents are optional, but show warning if none uploaded
    if (!formData.idProof && !formData.addressProof && formData.certifications.length === 0) {
      const confirmed = window.confirm(
        'You haven\'t uploaded any documents. You can add them later from profile settings. Continue?'
      );
      if (!confirmed) return;
    }

    onComplete({ documents: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-gray-600">Upload your identity and certifications (optional but recommended)</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Note:</strong> Uploading documents helps build trust with clients and increases your chances of getting hired.
        </p>
      </div>

      {/* ID Proof */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Proof (Aadhaar/PAN/Driving License)
        </label>
        {formData.idProof ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 text-2xl">✓</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">ID Proof uploaded</p>
              <p className="text-xs text-green-700">{formData.idProof.split('/').pop()}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, idProof: '' })}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="idProof"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(e, 'idProof')}
              className="hidden"
              disabled={uploadingDoc === 'idProof'}
            />
            <label
              htmlFor="idProof"
              className="cursor-pointer"
            >
              {uploadingDoc === 'idProof' ? (
                <div className="text-blue-600">Uploading...</div>
              ) : (
                <>
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-sm text-gray-600">
                    Click to upload ID Proof
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, or PDF (max 5MB)
                  </p>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Address Proof */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Proof (Utility Bill/Rental Agreement)
        </label>
        {formData.addressProof ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 text-2xl">✓</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Address Proof uploaded</p>
              <p className="text-xs text-green-700">{formData.addressProof.split('/').pop()}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, addressProof: '' })}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="addressProof"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(e, 'addressProof')}
              className="hidden"
              disabled={uploadingDoc === 'addressProof'}
            />
            <label
              htmlFor="addressProof"
              className="cursor-pointer"
            >
              {uploadingDoc === 'addressProof' ? (
                <div className="text-blue-600">Uploading...</div>
              ) : (
                <>
                  <div className="text-4xl mb-2">🏠</div>
                  <p className="text-sm text-gray-600">
                    Click to upload Address Proof
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, or PDF (max 5MB)
                  </p>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications (Optional)
        </label>
        {formData.certifications.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.certifications.map((cert: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <span className="text-blue-600">📜</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Certificate {index + 1}
                  </p>
                  <p className="text-xs text-blue-700">{cert.split('/').pop()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="certification"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e, 'certification')}
            className="hidden"
            disabled={uploadingDoc === 'certification'}
          />
          <label
            htmlFor="certification"
            className="cursor-pointer"
          >
            {uploadingDoc === 'certification' ? (
              <div className="text-blue-600">Uploading...</div>
            ) : (
              <>
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-sm text-gray-600">
                  Click to upload Certifications
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or PDF (max 5MB)
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-300"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Completing...' : 'Complete Profile 🎉'}
        </button>
      </div>
    </form>
  );
};

export default DocumentsStep;
