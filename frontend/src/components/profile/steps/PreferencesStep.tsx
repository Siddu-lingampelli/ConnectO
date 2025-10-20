import { useState } from 'react';
import { toast } from 'react-toastify';

interface PreferencesStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const categories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Appliance Repair',
  'AC Repair',
  'Computer Repair',
  'Mobile Repair',
  'Pest Control',
  'Gardening',
  'Home Renovation',
  'Interior Design',
  'Photography',
  'Videography',
  'Catering',
  'Event Planning',
  'Tutoring',
  'Fitness Training',
  'Beauty & Salon',
];

const budgetRanges = [
  'Under ₹500',
  '₹500 - ₹1,000',
  '₹1,000 - ₹2,500',
  '₹2,500 - ₹5,000',
  'Above ₹5,000',
  'Flexible',
];

const communicationPreferences = [
  'Phone Call',
  'WhatsApp',
  'In-App Chat',
  'Email',
  'Video Call',
];

const PreferencesStep = ({ data, onNext, onBack }: PreferencesStepProps) => {
  const [formData, setFormData] = useState({
    categories: data.preferences?.categories || [],
    budget: data.preferences?.budget || '',
    communicationPreference: data.preferences?.communicationPreference || '',
  });

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((c: string) => c !== category),
      });
    } else {
      if (formData.categories.length >= 5) {
        toast.warning('You can select maximum 5 categories');
        return;
      }
      setFormData({
        ...formData,
        categories: [...formData.categories, category],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.categories.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }

    if (!formData.budget) {
      toast.error('Please select your budget range');
      return;
    }

    if (!formData.communicationPreference) {
      toast.error('Please select your communication preference');
      return;
    }

    onNext({ preferences: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h2>
        <p className="text-gray-600">Help us match you with the right service providers</p>
      </div>

      {/* Service Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Services You're Interested In <span className="text-red-500">*</span>
        </label>
        {formData.categories.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Selected ({formData.categories.length}/5):
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((cat: string) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="hover:bg-blue-700 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                formData.categories.includes(category)
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-blue-400 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Typical Budget per Service <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {budgetRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setFormData({ ...formData, budget: range })}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                formData.budget === range
                  ? 'border-green-600 bg-green-50 text-green-600'
                  : 'border-gray-300 hover:border-green-400 text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Communication Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Communication Method <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {communicationPreferences.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setFormData({ ...formData, communicationPreference: pref })}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                formData.communicationPreference === pref
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-300 hover:border-purple-400 text-gray-700'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          ← Back
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

export default PreferencesStep;
