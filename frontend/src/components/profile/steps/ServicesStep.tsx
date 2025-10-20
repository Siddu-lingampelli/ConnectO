import { useState } from 'react';
import { toast } from 'react-toastify';

interface ServicesStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const serviceCategories = [
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
  'Others',
];

const ServicesStep = ({ data, onNext, onBack }: ServicesStepProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services || []);
  const [customService, setCustomService] = useState('');

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      if (selectedServices.length >= 5) {
        toast.warning('You can select maximum 5 services');
        return;
      }
      setSelectedServices([...selectedServices, service]);
    }
  };

  const addCustomService = () => {
    if (!customService.trim()) {
      return;
    }
    if (selectedServices.length >= 5) {
      toast.warning('You can select maximum 5 services');
      return;
    }
    if (selectedServices.includes(customService)) {
      toast.error('Service already added');
      return;
    }
    setSelectedServices([...selectedServices, customService]);
    setCustomService('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    onNext({ services: selectedServices });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Services You Offer</h2>
        <p className="text-gray-600">Select the services you provide (max 5)</p>
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Selected Services ({selectedServices.length}/5):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => toggleService(service)}
                  className="hover:bg-blue-700 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Service Categories Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose from popular services:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {serviceCategories.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                selectedServices.includes(service)
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-blue-400 text-gray-700'
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Service Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or add a custom service:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customService}
            onChange={(e) => setCustomService(e.target.value)}
            placeholder="Enter service name"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addCustomService}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Add
          </button>
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

export default ServicesStep;
