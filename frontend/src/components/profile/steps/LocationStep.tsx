import { useState } from 'react';
import { toast } from 'react-toastify';

interface LocationStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  loading?: boolean;
}

const LocationStep = ({ data, onComplete, onBack, loading }: LocationStepProps) => {
  const [formData, setFormData] = useState({
    city: data.city || '',
    area: data.area || '',
    address: data.address || '',
    landmark: data.landmark || '',
    pincode: data.pincode || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city || !formData.area) {
      toast.error('Please fill in city and area');
      return;
    }

    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    onComplete({
      city: formData.city,
      area: formData.area,
      address: formData.address,
      landmark: formData.landmark,
      pincode: formData.pincode,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Details</h2>
        <p className="text-gray-600">Help providers find you easily</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>📍 Note:</strong> Your exact address will only be shared with service providers you hire.
        </p>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Mumbai"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Area/Locality <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="area"
          value={formData.area}
          onChange={handleChange}
          required
          placeholder="Andheri West"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Address (Optional)
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          placeholder="Building name, street, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nearby Landmark (Optional)
        </label>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          placeholder="Near Metro Station"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Pincode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pincode (Optional)
        </label>
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="400053"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">6-digit pincode</p>
      </div>

      {/* Summary */}
      {(formData.city || formData.area) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            📍 Your Location Summary:
          </p>
          <p className="text-gray-900">
            {[formData.area, formData.city, formData.pincode]
              .filter(Boolean)
              .join(', ')}
          </p>
          {formData.landmark && (
            <p className="text-sm text-gray-600 mt-1">
              Near: {formData.landmark}
            </p>
          )}
        </div>
      )}

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

export default LocationStep;
