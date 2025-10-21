import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { updateUser } from '../../store/authSlice';
import type { User } from '../../types';

interface AccountSettingsProps {
  user: User;
}

const AccountSettings = ({ user }: AccountSettingsProps) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    city: user.city || '',
    area: user.area || '',
    bio: user.bio || '',
    // Provider-specific fields
    providerType: user.providerType || '',
    skills: user.skills || [],
    services: user.services || [],
    experience: user.experience || '',
    hourlyRate: user.hourlyRate || 0,
    availability: user.availability || [],
    // Client-specific fields
    preferences: user.preferences || { categories: [], budget: '', communicationPreference: '' },
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const dataToUpdate: any = {
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        area: formData.area,
        bio: formData.bio,
      };
      
      // Add provider-specific fields
      if (user.role === 'provider') {
        dataToUpdate.providerType = formData.providerType;
        dataToUpdate.skills = formData.skills;
        dataToUpdate.services = formData.services;
        dataToUpdate.experience = formData.experience;
        dataToUpdate.hourlyRate = formData.hourlyRate;
      }
      
      // Add client-specific fields
      if (user.role === 'client') {
        dataToUpdate.preferences = formData.preferences;
      }
      
      const updatedUser = await userService.updateProfile(dataToUpdate);
      dispatch(updateUser(updatedUser));
      toast.success('Account settings updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      area: user.area || '',
      bio: user.bio || '',
      providerType: user.providerType || '',
      skills: user.skills || [],
      services: user.services || [],
      experience: user.experience || '',
      hourlyRate: user.hourlyRate || 0,
      availability: user.availability || [],
      preferences: user.preferences || { categories: [], budget: '', communicationPreference: '' },
    });
    setIsEditing(false);
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };
  
  const handleAddService = () => {
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData({
        ...formData,
        services: [...formData.services, serviceInput.trim()]
      });
      setServiceInput('');
    }
  };
  
  const handleRemoveService = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s !== service)
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Change Photo
              </button>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={true}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area/Locality
          </label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
            {user.role === 'provider' ? '🔧 Service Provider' : user.role === 'client' ? '👤 Client' : '👑 Admin'}
          </div>
        </div>

        {/* Service Provider Specific Fields */}
        {user.role === 'provider' && (
          <>
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            </div>

            {/* Provider Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Type
              </label>
              <select
                name="providerType"
                value={formData.providerType}
                onChange={(e) => setFormData({ ...formData, providerType: e.target.value as 'Technical' | 'Non-Technical' | '' })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Type</option>
                <option value="Technical">💻 Technical (IT, Software, Tech Support)</option>
                <option value="Non-Technical">🔧 Non-Technical (Plumbing, Electrical, etc.)</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              {isEditing && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add a skill (e.g., Plumbing, Electrical)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills added yet</span>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services Offered
              </label>
              {isEditing && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    placeholder="Add a service (e.g., AC Repair, House Painting)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.services.length > 0 ? (
                  formData.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {service}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No services added yet</span>
                )}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., 5 years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., 500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </>
        )}

        {/* Client Specific Fields */}
        {user.role === 'client' && (
          <>
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            </div>

            {/* Preferred Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typical Budget Range
              </label>
              <select
                name="budget"
                value={formData.preferences.budget}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, budget: e.target.value }
                })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Budget Range</option>
                <option value="0-1000">₹0 - ₹1,000</option>
                <option value="1000-5000">₹1,000 - ₹5,000</option>
                <option value="5000-10000">₹5,000 - ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000+">₹25,000+</option>
              </select>
            </div>

            {/* Communication Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Communication Method
              </label>
              <select
                name="communicationPreference"
                value={formData.preferences.communicationPreference}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, communicationPreference: e.target.value }
                })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Method</option>
                <option value="chat">💬 In-App Chat</option>
                <option value="phone">📞 Phone Call</option>
                <option value="email">📧 Email</option>
                <option value="any">✅ Any Method</option>
              </select>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Danger Zone */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left">
              <div className="font-medium">Deactivate Account</div>
              <div className="text-sm text-gray-600">Temporarily disable your account</div>
            </button>
            <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left">
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-gray-600">Permanently delete your account and all data</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
