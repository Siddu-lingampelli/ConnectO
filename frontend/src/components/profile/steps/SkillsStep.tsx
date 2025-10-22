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

// Technical Skills by Category
const technicalSkills = {
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'Rust', 'Scala', 'Perl', 'R', 'MATLAB'
  ],
  'Frontend Development': [
    'React', 'Angular', 'Vue.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS',
    'Bootstrap', 'jQuery', 'Redux', 'Webpack', 'Sass', 'Less', 'Material-UI'
  ],
  'Backend Development': [
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET',
    'Ruby on Rails', 'Laravel', 'FastAPI', 'NestJS', 'GraphQL', 'REST API'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Ionic', 'Xamarin', 'Swift UI', 'Jetpack Compose'
  ],
  'Database': [
    'MongoDB', 'MySQL', 'PostgreSQL', 'SQL Server', 'Oracle', 'Redis',
    'Cassandra', 'DynamoDB', 'Firebase', 'SQLite', 'MariaDB'
  ],
  'Design & Creative': [
    'UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Adobe Photoshop',
    'Adobe Illustrator', 'Canva', 'InDesign', 'After Effects', 'Premiere Pro',
    'Blender', '3D Modeling', 'Animation', 'Logo Design', 'Brand Identity'
  ],
  'Digital Marketing': [
    'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing',
    'Google Ads', 'Facebook Ads', 'Instagram Marketing', 'LinkedIn Marketing',
    'Analytics', 'Copywriting', 'Marketing Strategy', 'PPC'
  ],
  'Writing & Content': [
    'Content Writing', 'Technical Writing', 'Copywriting', 'Blog Writing',
    'Article Writing', 'SEO Writing', 'Proofreading', 'Editing', 'Translation'
  ],
  'Business & Admin': [
    'Project Management', 'Data Entry', 'Virtual Assistant', 'Excel',
    'PowerPoint', 'Research', 'Customer Service', 'Accounting', 'Bookkeeping'
  ],
  'DevOps & Cloud': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
    'Jenkins', 'Git', 'Linux', 'Terraform', 'Ansible'
  ]
};

// Non-Technical Skills by Category
const nonTechnicalSkills = {
  'Home Services': [
    'Plumbing', 'Pipe Fitting', 'Leak Repair', 'Drain Cleaning', 'Electrical Work',
    'Wiring', 'Appliance Repair', 'Carpentry', 'Furniture Assembly', 'Painting',
    'Wall Painting', 'Home Renovation', 'Ceiling Work', 'Door Installation',
    'Window Installation', 'Flooring', 'Tiling', 'Masonry', 'Welding'
  ],
  'Cleaning Services': [
    'House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Carpet Cleaning',
    'Window Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Move-in/Move-out Cleaning',
    'Sanitization', 'Pest Control', 'Laundry', 'Ironing'
  ],
  'Events & Personal': [
    'Event Planning', 'Catering', 'Photography', 'Videography', 'DJ Services',
    'Decoration', 'Wedding Planning', 'Birthday Planning', 'Party Planning',
    'MC/Host', 'Makeup Artist', 'Hair Styling', 'Mehendi Artist'
  ],
  'Tutoring & Education': [
    'Mathematics Tutoring', 'Science Tutoring', 'English Tutoring', 'Physics',
    'Chemistry', 'Biology', 'History', 'Geography', 'Computer Basics',
    'Music Lessons', 'Dance Classes', 'Art Classes', 'Yoga', 'Fitness Training'
  ],
  'Health & Wellness': [
    'Nursing', 'Physiotherapy', 'Massage Therapy', 'Nutritionist', 'Counseling',
    'Personal Training', 'Yoga Instructor', 'Meditation', 'First Aid'
  ],
  'Pet Care': [
    'Dog Walking', 'Pet Sitting', 'Pet Grooming', 'Pet Training', 'Veterinary Care',
    'Pet Boarding', 'Aquarium Maintenance'
  ],
  'Beauty & Personal Care': [
    'Hair Cutting', 'Hair Styling', 'Makeup', 'Facial', 'Manicure', 'Pedicure',
    'Waxing', 'Threading', 'Spa Services', 'Massage'
  ],
  'Automotive': [
    'Car Repair', 'Car Wash', 'Car Detailing', 'Bike Repair', 'Tire Service',
    'Oil Change', 'AC Repair', 'Denting & Painting'
  ],
  'Delivery & Transport': [
    'Delivery Service', 'Moving & Packing', 'Driver Service', 'Courier Service',
    'Logistics', 'Warehouse'
  ],
  'Security & Safety': [
    'Security Guard', 'CCTV Installation', 'Fire Safety', 'First Aid Training',
    'Home Security', 'Watchman'
  ]
};

const SkillsStep = ({ data, onNext, onBack }: SkillsStepProps) => {
  const [formData, setFormData] = useState({
    skills: data.skills || [],
    experience: data.experience || '',
    hourlyRate: data.hourlyRate || '',
    availability: data.availability || [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get provider type from previous step
  const providerType = data.providerType || '';
  
  // Get relevant skills based on provider type
  const relevantSkills: Record<string, string[]> = providerType === 'Technical' ? technicalSkills : nonTechnicalSkills;
  const skillCategories = Object.keys(relevantSkills);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = (skill?: string) => {
    const skillToAdd = skill || skillInput.trim();
    
    if (!skillToAdd) return;
    
    if (formData.skills.includes(skillToAdd)) {
      toast.error('Skill already added');
      return;
    }

    if (formData.skills.length >= 15) {
      toast.warning('Maximum 15 skills allowed');
      return;
    }

    setFormData({
      ...formData,
      skills: [...formData.skills, skillToAdd],
    });
    setSkillInput('');
    toast.success(`Added ${skillToAdd}`);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {providerType && (
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-3 ${
              providerType === 'Technical' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {providerType === 'Technical' ? '💻' : '🔧'} {providerType} Skills
            </span>
          )}
          Skills & Rates
        </h2>
        <p className="text-gray-600">Tell us about your expertise and pricing</p>
      </div>

      {!providerType && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">⚠️ Please select a provider type in the previous step to see relevant skills</p>
        </div>
      )}

      {/* Skill Categories */}
      {providerType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Skills by Category
          </label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {skillCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                  selectedCategory === category
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-blue-400 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Skill Suggestions */}
          {selectedCategory && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                📌 {selectedCategory} Skills - Click to add:
              </p>
              <div className="flex flex-wrap gap-2">
                {(relevantSkills[selectedCategory] || [])
                  .filter((skill: string) => !formData.skills.includes(skill))
                  .map((skill: string) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            placeholder={providerType === 'Technical' ? 'e.g., React, Python, UI Design' : 'e.g., Plumbing, Cleaning, Catering'}
            disabled={!providerType}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => addSkill()}
            disabled={!providerType}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill: string) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
              >
                ✓ {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Added {formData.skills.length}/15 skills {formData.skills.length === 0 && '(Add at least 1)'}
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
