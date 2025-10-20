import { useState } from 'react';
import { toast } from 'react-toastify';
import type { User } from '../../types';

interface PrivacySettingsProps {
  user: User;
}

const PrivacySettings = ({ user }: PrivacySettingsProps) => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Privacy settings updated successfully!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
        <p className="text-gray-600 mt-1">Control your privacy and data sharing preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show profile to everyone</p>
                <p className="text-sm text-gray-600">Your profile will be visible to all users</p>
              </div>
              <input
                type="radio"
                name="profileVisibility"
                defaultChecked
                className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">
                  {user.role === 'provider' ? 'Show only to potential clients' : 'Show only to hired providers'}
                </p>
                <p className="text-sm text-gray-600">Limited profile visibility</p>
              </div>
              <input
                type="radio"
                name="profileVisibility"
                className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Private profile</p>
                <p className="text-sm text-gray-600">Only you can see your profile</p>
              </div>
              <input
                type="radio"
                name="profileVisibility"
                className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show phone number</p>
                <p className="text-sm text-gray-600">Display your phone number on your profile</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show email address</p>
                <p className="text-sm text-gray-600">Display your email address on your profile</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show location details</p>
                <p className="text-sm text-gray-600">Display your full address</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Activity & Stats */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity & Statistics</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show job history</p>
                <p className="text-sm text-gray-600">Display your completed jobs</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show ratings and reviews</p>
                <p className="text-sm text-gray-600">Display reviews from others</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show online status</p>
                <p className="text-sm text-gray-600">Let others see when you're active</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Data Sharing */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sharing</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Share analytics data</p>
                <p className="text-sm text-gray-600">Help us improve the platform with usage data</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Personalized recommendations</p>
                <p className="text-sm text-gray-600">Use my data to suggest relevant jobs/providers</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Search Engine Visibility */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Engine Visibility</h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium text-gray-900">Public Profile Indexing</p>
                <p className="text-sm text-gray-600 mt-1">
                  Allow search engines like Google to index your profile. This can help you get discovered by potential
                  {user.role === 'provider' ? ' clients' : ' providers'}.
                </p>
              </div>
            </div>
          </div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Allow search engines to index my profile</span>
          </label>
        </div>

        {/* Data Download & Deletion */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Data Rights</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📥</span>
                <div>
                  <p className="font-medium text-gray-900">Download your data</p>
                  <p className="text-sm text-gray-600">Get a copy of all your personal data</p>
                </div>
              </div>
            </button>

            <button className="w-full px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🗑️</span>
                <div>
                  <p className="font-medium text-red-600">Request data deletion</p>
                  <p className="text-sm text-gray-600">Permanently delete all your data</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
