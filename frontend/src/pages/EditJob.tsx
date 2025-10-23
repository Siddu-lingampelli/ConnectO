import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const categories = [
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
  'IT & Tech Support',
  'Other Services'
];

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    city: '',
    area: ''
  });

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        toast.error('Invalid job ID');
        navigate('/jobs');
        return;
      }

      const job = await jobService.getJob(id);

      // Check if user owns this job
      const clientId = typeof job.client === 'object' ? job.client._id : job.client;
      if (clientId !== currentUser?._id) {
        toast.error('You can only edit your own jobs');
        navigate('/jobs');
        return;
      }

      // Check if job status allows editing
      if (job.status !== 'open') {
        toast.error('Cannot edit jobs that are not open');
        navigate('/jobs');
        return;
      }

      // Pre-fill form with existing job data
      setFormData({
        title: job.title,
        description: job.description,
        category: job.category,
        budget: job.budget.toString(),
        city: job.location.city,
        area: job.location.area
      });
    } catch (error: any) {
      console.error('Error loading job:', error);
      toast.error(error.response?.data?.message || 'Failed to load job');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      setSubmitting(true);

      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget: Number(formData.budget),
        location: {
          city: formData.city.trim(),
          area: formData.area.trim()
        }
      };

      await jobService.updateJob(id!, jobData);
      
      toast.success('Job updated successfully! ✅');
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Please login to edit a job.</p>
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
            <h2 className="text-2xl font-bold text-[#0D2B1D] mb-4">Access Denied</h2>
            <p className="text-[#6B8F71] mb-6">Only clients can edit jobs.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-medium hover:scale-105"
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
            <p className="text-[#6B8F71] font-medium">Loading job details...</p>
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
                <span className="text-3xl">✏️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">Edit Job</h1>
                <p className="text-[#6B8F71] mt-1">Update your job details and requirements</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Need experienced plumber for bathroom renovation"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                  minLength={10}
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  {formData.title.length}/10 characters minimum
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the job in detail. What needs to be done? Any specific requirements or expectations?"
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] resize-none"
                  required
                  minLength={50}
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  {formData.description.length}/50 characters minimum
                </p>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-[#345635] mb-2">
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
                  className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                  required
                />
                <p className="text-xs text-[#6B8F71] mt-1">
                  Enter your budget for this job
                </p>
              </div>

              {/* Location Section */}
              <div className="border-t-2 border-[#AEC3B0] pt-6">
                <h3 className="text-lg font-semibold text-[#0D2B1D] mb-4">📍 Job Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-[#345635] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                      required
                    />
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-[#345635] mb-2">
                      Area *
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Andheri West"
                      className="w-full px-4 py-3 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t-2 border-[#AEC3B0] pt-6">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all disabled:bg-gray-400 font-medium hover:scale-105"
                  >
                    {submitting ? '⏳ Updating Job...' : '✅ Update Job'}
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

export default EditJob;
