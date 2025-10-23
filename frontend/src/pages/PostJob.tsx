import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import { verificationService } from '../services/verificationService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const technicalCategories = [
  'Web Development',
  'Mobile App Development',
  'Software Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Content Writing',
  'Video Editing',
  'Data Entry',
  'Virtual Assistant',
  'SEO Services',
  'Social Media Management',
  'IT Support',
  'Other Technical Services'
];

const nonTechnicalCategories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Gardening',
  'AC Repair',
  'Appliance Repair',
  'Pest Control',
  'Moving & Packing',
  'Home Renovation',
  'Interior Design',
  'Beauty & Wellness',
  'Catering',
  'Photography',
  'Event Planning',
  'Other Non-Technical Services'
];

const PostJob = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    providerType: '',
    budget: '',
    deadline: '',
    city: currentUser?.city || '',
    area: currentUser?.area || '',
    address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    checkVerification();
  }, []);

  const checkVerification = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getVerificationStatus();
      const verified = data.verification.status === 'verified';
      setIsVerified(verified);
      
      if (!verified) {
        toast.error('You must be verified to post a job');
        setTimeout(() => navigate('/verification'), 2000);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to verify account status');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset category when provider type changes
    if (name === 'providerType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: '' // Reset category when provider type changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Get available categories based on provider type
  const getAvailableCategories = () => {
    if (formData.providerType === 'Technical') {
      return technicalCategories;
    } else if (formData.providerType === 'Non-Technical') {
      return nonTechnicalCategories;
    }
    return [];
  };

  const detectLocation = () => {
    if ('geolocation' in navigator) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setGettingLocation(false);
          toast.success('📍 Location detected successfully!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setGettingLocation(false);
          toast.error('Could not detect location. Please enable location access.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error('You must be verified to post a job');
      navigate('/verification');
      return;
    }

    // Validation
    if (formData.title.length < 10) {
      toast.error('Title must be at least 10 characters');
      return;
    }

    if (formData.description.length < 50) {
      toast.error('Description must be at least 50 characters');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (Number(formData.budget) <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    try {
      setSubmitting(true);

      const jobData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        providerType: formData.providerType as 'Technical' | 'Non-Technical',
        budget: Number(formData.budget),
        deadline: formData.deadline,
        location: {
          city: formData.city.trim(),
          area: formData.area.trim(),
          address: formData.address.trim() || undefined,
          ...(formData.latitude && formData.longitude && {
            latitude: formData.latitude,
            longitude: formData.longitude,
            coordinates: {
              type: 'Point',
              coordinates: [formData.longitude, formData.latitude] as [number, number]
            }
          })
        }
      };

      await jobService.createJob(jobData);
      
      toast.success('Job posted successfully! 🎉');
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error creating job:', error);
      
      if (error.response?.data?.requiresVerification) {
        toast.error('You must be verified to post a job');
        navigate('/verification');
      } else {
        toast.error(error.response?.data?.message || 'Failed to post job');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-[#345635] font-semibold text-lg">Please login to post a job.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentUser.role !== 'client') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-3">Access Denied</h2>
            <p className="text-[#6B8F71] mb-6">Only clients can post jobs.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-semibold hover:scale-105"
            >
              Browse Jobs Instead
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
            <p className="text-[#6B8F71] font-medium">Verifying account...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-4 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-3xl">📝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0D2B1D]">Post a New Job</h1>
                <p className="text-[#6B8F71] mt-1">
                  Describe your job requirements and connect with verified service providers
                </p>
              </div>
            </div>
          </div>

          {/* Verified Badge */}
          {isVerified && (
            <div className="bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0]/30 border-2 border-[#6B8F71] rounded-xl p-5 mb-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#0D2B1D] font-bold text-lg">Verified Client ✓</h3>
                  <p className="text-[#345635] text-sm">Your account is verified. You can post jobs.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Need experienced plumber for bathroom renovation"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/10 characters minimum
                </p>
              </div>

              {/* Provider Type - Now First */}
              <div>
                <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                  Service Provider Type *
                </label>
                <select
                  name="providerType"
                  value={formData.providerType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] bg-white"
                  required
                >
                  <option value="">Select provider type</option>
                  <option value="Technical">💻 Technical (Online/Remote Work)</option>
                  <option value="Non-Technical">🔧 Non-Technical (Field/On-site Work)</option>
                </select>
                <p className="text-xs text-[#6B8F71] mt-1">
                  Technical: Software, IT, Design, etc. | Non-Technical: Plumbing, Electrical, Carpentry, etc.
                </p>
              </div>

              {/* Category - Shows after Provider Type is selected */}
              {formData.providerType && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-[#6B8F71] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635] focus:border-[#345635] bg-white shadow-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {getAvailableCategories().map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <p className="text-xs text-[#345635] mt-1 font-medium">
                    {formData.providerType === 'Technical' 
                      ? '💻 Select from technical service categories'
                      : '🔧 Select from non-technical service categories'}
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the job in detail. What needs to be done? Any specific requirements or expectations?"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] resize-none"
                  required
                  minLength={50}
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  {formData.description.length}/50 characters minimum
                </p>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                  Budget (₹) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="5000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  Enter your budget for this job
                </p>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  When do you need this job completed?
                </p>
              </div>

              {/* Location Section */}
              <div className="border-t-2 border-[#AEC3B0] pt-6">
                <h3 className="text-lg font-bold text-[#0D2B1D] mb-4 flex items-center">
                  <span className="text-2xl mr-2">📍</span>
                  Job Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                      required
                    />
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                      Area *
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Andheri West"
                      className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                      required
                    />
                  </div>
                </div>

                {/* Address (Optional) */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#0D2B1D] mb-2">
                    Complete Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Building name, street, landmark..."
                    className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  />
                </div>

                {/* GPS Location (Optional) */}
                <div className="mt-4 p-5 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0]/30 rounded-xl border-2 border-[#6B8F71]">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-lg flex items-center justify-center">
                        <span className="text-xl">📍</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0D2B1D]">Enable GPS Location (Optional)</h4>
                        <p className="text-xs text-[#6B8F71]">
                          Help nearby providers find your job faster
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={gettingLocation}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold disabled:opacity-50 hover:scale-105"
                    >
                      {gettingLocation ? '⏳ Detecting...' : formData.latitude ? '✓ Located' : '📡 Detect'}
                    </button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="mt-3 text-xs text-[#345635] bg-white px-4 py-2.5 rounded-lg font-medium border-2 border-[#6B8F71]">
                      ✓ Location detected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t-2 border-[#AEC3B0] pt-6">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-semibold hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isVerified}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-semibold hover:scale-105"
                  >
                    {submitting ? '⏳ Posting Job...' : '📝 Post Job'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostJob;
