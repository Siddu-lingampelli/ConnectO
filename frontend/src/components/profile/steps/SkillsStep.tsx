import { useState } from 'react';
import { toast } from 'react-toastify';

interface SkillsStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const availabilityOptions = [
  'Monday - Friday',
  'Weekends Only',
  'All Days',
  'Flexible',
  'By Appointment',
];

const SkillsStep = ({ data, onNext, onBack }: SkillsStepProps) => {
  const [formData, setFormData] = useState({
    skills: data.skills || [],
    experience: data.experience || '',
    hourlyRate: data.hourlyRate || '',
    availability: data.availability || [],
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    
    if (formData.skills.includes(skillInput)) {
      toast.error('Skill already added');
      return;
    }

    if (formData.skills.length >= 10) {
      toast.warning('Maximum 10 skills allowed');
      return;
    }

    setFormData({
      ...formData,
      skills: [...formData.skills, skillInput],
    });
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s: string) => s !== skill),
    });
  };

  const toggleAvailability = (option: string) => {
    if (formData.availability.includes(option)) {
      setFormData({
        ...formData,
        availability: formData.availability.filter((a: string) => a !== option),
      });
    } else {
      setFormData({
        ...formData,
        availability: [...formData.availability, option],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (!formData.experience) {
      toast.error('Please enter your years of experience');
      return;
    }

    if (!formData.hourlyRate) {
      toast.error('Please enter your hourly rate');
      return;
    }

    if (parseInt(formData.hourlyRate) < 50 || parseInt(formData.hourlyRate) > 10000) {
      toast.error('Hourly rate should be between ₹50 and ₹10,000');
      return;
    }

    if (formData.availability.length === 0) {
      toast.error('Please select your availability');
      return;
    }

    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Rates</h2>
        <p className="text-gray-600">Tell us about your expertise and pricing</p>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Skills <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="e.g., Pipe Fitting, Leak Repair"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill: string) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                ✓ {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Added {formData.skills.length}/10 skills
        </p>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
          min="0"
          max="50"
          placeholder="5"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hourly Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hourly Rate (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="hourlyRate"
          value={formData.hourlyRate}
          onChange={handleChange}
          required
          min="50"
          max="10000"
          placeholder="500"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Recommended: ₹300 - ₹1500 per hour
        </p>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Availability <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {availabilityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleAvailability(option)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                formData.availability.includes(option)
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-blue-400 text-gray-700'
              }`}
            >
              {option}
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

export default SkillsStep;
