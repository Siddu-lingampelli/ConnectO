import { useState } from 'react';
import { toast } from 'react-toastify';

interface ServicesStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

// Technical and Non-Technical fields (category + subcategories)
export const serviceCategories = [
  {
    type: 'Technical',
    label: 'Technical Fields (Online/Remote)',
    categories: [
      {
        name: 'Software Development & IT',
        subcategories: [
          'Frontend Web Development',
          'Backend Web Development',
          'Full-Stack Development',
          'E-commerce Development',
          'iOS App Development',
          'Android App Development',
          'Cross-Platform App Development',
          'Data Science & Analytics',
          'Machine Learning Engineering',
          'Deep Learning',
          'NLP',
          'Cloud Architecture',
          'CI/CD & Automation',
          'Containerization',
          'Ethical Hacking',
          'Security Analysis',
          'IT Support',
          'Database Administration',
          'QA & Software Testing',
        ],
      },
      {
        name: 'Design & Creative',
        subcategories: [
          'Logo Design & Branding',
          'Social Media Graphics',
          'Print Design',
          'Packaging Design',
          'UI Design',
          'UX Design',
          'Prototyping & Wireframing',
          'Video Editing',
          'Motion Graphics & Animation',
          '3D Modeling & Rendering',
          'VFX',
          'Digital Illustration',
          'Character Design',
          'NFT Art',
        ],
      },
      {
        name: 'Writing & Translation',
        subcategories: [
          'Article & Blog Writing',
          'Copywriting',
          'Technical Writing',
          'Editing & Proofreading',
          'Translation & Localization',
          'Transcription',
        ],
      },
      {
        name: 'Digital Marketing',
        subcategories: [
          'SEO',
          'Social Media Marketing',
          'PPC Campaign Management',
          'Email Marketing',
          'Content Strategy',
          'Marketing Analytics',
        ],
      },
      {
        name: 'Business & Admin Support',
        subcategories: [
          'Virtual Assistance',
          'Data Entry & Web Research',
          'Customer Support',
          'Project Management',
        ],
      },
    ],
  },
  {
    type: 'Non-Technical',
    label: 'Non-Technical Fields (On-Site)',
    categories: [
      {
        name: 'Home Services & Repairs',
        subcategories: [
          'Plumbing',
          'Electrical Work',
          'Carpentry & Woodworking',
          'Painting',
          'HVAC Repair',
          'Handyman Services',
          'Appliance Repair',
          'Furniture Assembly',
          'Pest Control',
        ],
      },
      {
        name: 'Events & Personal Services',
        subcategories: [
          'Event Planning',
          'Photography',
          'Videography',
          'DJ Services',
          'Catering',
          'Personal Chef',
          'Makeup Artistry',
          'Hair Styling',
        ],
      },
      {
        name: 'Cleaning & Maintenance',
        subcategories: [
          'Home Cleaning',
          'Office Cleaning',
          'Gardening & Landscaping',
          'Car Washing & Detailing',
        ],
      },
      {
        name: 'Lessons & Tutoring',
        subcategories: [
          'Academic Tutoring',
          'Music Lessons',
          'Art Classes',
          'Fitness Training',
          'Yoga & Meditation',
        ],
      },
      {
        name: 'Health & Pet Care',
        subcategories: [
          'Massage Therapy',
          'Pet Grooming',
          'Pet Sitting & Dog Walking',
        ],
      },
    ],
  },
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

      {/* Service Categories by Type */}
      <div className="space-y-6">
        {serviceCategories.map((serviceType) => (
          <div key={serviceType.type}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {serviceType.label}
            </h3>
            <div className="space-y-4">
              {serviceType.categories.map((category) => (
                <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">{category.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() => toggleService(subcategory)}
                        className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedServices.includes(subcategory)
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-blue-400 text-gray-700'
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
