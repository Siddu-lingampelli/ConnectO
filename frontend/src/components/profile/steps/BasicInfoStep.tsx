import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/authSlice';

interface BasicInfoStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirstStep?: boolean;
}

const BasicInfoStep = ({ data, onNext, onBack, isFirstStep }: BasicInfoStepProps) => {
  const currentUser = useSelector(selectCurrentUser);
  const isProvider = currentUser?.role === 'provider';
  
  const [formData, setFormData] = useState({
    phone: data.phone || '',
    city: data.city || '',
    area: data.area || '',
    bio: data.bio || '',
    providerType: data.providerType || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.city || !formData.area) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate provider type for service providers
    if (isProvider && !formData.providerType) {
      toast.error('Please select your work type (Technical or Non-Technical)');
      return;
    }

    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with your contact details</p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="9876543210"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">10-digit mobile number</p>
      </div>

      {/* Provider Type - Only for Service Providers */}
      {isProvider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Type <span className="text-red-500">*</span>
          </label>
          <select
            name="providerType"
            value={formData.providerType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select your work type</option>
            <option value="Technical">Technical (Online/Remote Work)</option>
            <option value="Non-Technical">Non-Technical (Field/On-site Work)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {formData.providerType === 'Technical' 
              ? '💻 Technical: Software, IT, Design, Digital Marketing, etc.'
              : formData.providerType === 'Non-Technical'
              ? '🔧 Non-Technical: Home Services, Repairs, Beauty, Fitness, etc.'
              : 'Choose the type of work you provide'}
          </p>
        </div>
      )}

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

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio (Optional)
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">Max 500 characters</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isFirstStep
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next Step →
        </button>
      </div>
    </form>
  );
};

export default BasicInfoStep;
