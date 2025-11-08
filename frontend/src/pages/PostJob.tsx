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
  
  // Get active role for dual role system
  const activeRole = currentUser?.activeRole || currentUser?.role || 'client';
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user is in client mode
  useEffect(() => {
    if (activeRole !== 'client') {
      toast.error('Only clients can post jobs. Switch to client mode first.');
      navigate('/dashboard');
    }
  }, [activeRole, navigate]);

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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
            <div className="text-center bg-white rounded-2xl shadow-soft border border-border p-12 max-w-md">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Login Required</h2>
              <p className="text-neutral-600 mb-6">Please login to post a job and connect with service providers.</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-soft"
              >
                Go to Login
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentUser.role !== 'client') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
            <div className="text-center bg-white rounded-2xl shadow-soft border border-border p-12 max-w-md">
              <div className="w-24 h-24 bg-red-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Access Denied</h2>
              <p className="text-neutral-600 mb-6">Only clients can post jobs. Switch to client mode or browse available jobs instead.</p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-soft"
              >
                Browse Jobs Instead
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600 font-medium">Verifying account...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-neutral-600 hover:text-primary transition-all duration-200 mb-6 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">Post a New Job</h1>
                <p className="text-neutral-600 text-lg">
                  Describe your job requirements and connect with verified service providers
                </p>
              </div>
            </div>
          </div>

          {/* Verified Badge */}
          {isVerified && (
            <div className="bg-surface border border-border rounded-xl p-6 mb-8 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-neutral-900 font-semibold text-lg flex items-center gap-2">
                    Verified Client
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </h3>
                  <p className="text-neutral-600 text-sm mt-1">Your account is verified. You can post jobs and hire providers.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-soft border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Need experienced plumber for bathroom renovation"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                  minLength={10}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  {formData.title.length}/10 characters minimum
                </p>
              </div>

              {/* Provider Type - Now First */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Service Provider Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="providerType"
                  value={formData.providerType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white transition-all"
                  required
                >
                  <option value="">Select provider type</option>
                  <option value="Technical">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Technical (Online/Remote Work)
                  </option>
                  <option value="Non-Technical">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Non-Technical (Field/On-site Work)
                  </option>
                </select>
                <p className="text-xs text-neutral-500 mt-2 flex items-start gap-2">
                  <svg className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Technical: Software, IT, Design, etc. | Non-Technical: Plumbing, Electrical, Carpentry, etc.</span>
                </p>
              </div>

              {/* Category - Shows after Provider Type is selected */}
              {formData.providerType && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white transition-all shadow-soft"
                    required
                  >
                    <option value="">Select a category</option>
                    {getAvailableCategories().map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <p className="text-xs text-primary mt-2 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {formData.providerType === 'Technical' 
                      ? 'Select from technical service categories'
                      : 'Select from non-technical service categories'}
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the job in detail. What needs to be done? Any specific requirements or expectations?"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  required
                  minLength={50}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  {formData.description.length}/50 characters minimum
                </p>
              </div>

              {/* Budget and Deadline Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Budget (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="5000"
                      min="0"
                      step="100"
                      className="w-full pl-8 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Enter your budget for this job
                  </p>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <svg className="w-5 h-5 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    When do you need this completed?
                  </p>
                </div>
              </div>

              {/* Location Section */}
              <div className="border-t border-border pt-8">
                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Job Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Andheri West"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Address (Optional) */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Complete Address <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Building name, street, landmark..."
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* GPS Location (Optional) */}
                <div className="mt-6 p-6 bg-surface rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">Enable GPS Location</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Help nearby providers find your job faster
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={gettingLocation}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-medium disabled:opacity-50 shadow-soft flex items-center gap-2"
                    >
                      {gettingLocation ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Detecting...
                        </>
                      ) : formData.latitude ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Located
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Detect Now
                        </>
                      )}
                    </button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="mt-3 text-xs text-neutral-600 bg-white px-4 py-3 rounded-xl font-medium border border-primary/20 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Location detected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-border pt-8">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3.5 border-2 border-border text-neutral-700 rounded-xl hover:bg-surface transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isVerified}
                    className="flex-1 px-6 py-3.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-soft flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostJob;
