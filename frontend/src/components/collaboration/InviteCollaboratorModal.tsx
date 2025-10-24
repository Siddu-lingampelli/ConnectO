import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import collaborationService from '../../services/collaborationService';
import { followService } from '../../services/followService';

interface InviteCollaboratorModalProps {
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FollowedProvider {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  providerType?: string;
  rating?: number;
}

const InviteCollaboratorModal = ({ jobId, onClose, onSuccess }: InviteCollaboratorModalProps) => {
  const currentUser = useSelector(selectCurrentUser);
  const [formData, setFormData] = useState({
    providerEmail: '',
    role: '',
    sharePercent: 0
  });
  const [loading, setLoading] = useState(false);
  const [followedProviders, setFollowedProviders] = useState<FollowedProvider[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<FollowedProvider | null>(null);

  useEffect(() => {
    loadFollowedProviders();
  }, []);

  const loadFollowedProviders = async () => {
    try {
      setLoadingFollowed(true);
      const response = await followService.getFollowing(currentUser?._id || '', 1, 100);
      // Filter only providers
      const providers = response.data.following.filter((user: any) => user.role === 'provider');
      setFollowedProviders(providers);
    } catch (error) {
      console.error('Failed to load followed providers:', error);
    } finally {
      setLoadingFollowed(false);
    }
  };

  const handleProviderSelect = (provider: FollowedProvider) => {
    setSelectedProvider(provider);
    setFormData({ ...formData, providerEmail: provider.email });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.providerEmail) {
      toast.error('Please enter provider email');
      return;
    }

    if (formData.sharePercent <= 0 || formData.sharePercent > 100) {
      toast.error('Share percentage must be between 1 and 100');
      return;
    }

    setLoading(true);
    try {
      // We'll send email, but backend needs to convert it to providerId
      await collaborationService.inviteCollaboratorByEmail(jobId, {
        providerEmail: formData.providerEmail,
        role: formData.role,
        sharePercent: formData.sharePercent
      });
      toast.success('Collaborator invited successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite collaborator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#0D2B1D]">Invite Collaborator</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Followed Providers List */}
        {!loadingFollowed && followedProviders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Followed Service Providers</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
              {followedProviders.map((provider) => (
                <div
                  key={provider._id}
                  onClick={() => handleProviderSelect(provider)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedProvider?._id === provider._id
                      ? 'bg-[#6B8F71] text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#345635] to-[#0D2B1D] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {provider.profilePicture ? (
                      <img src={provider.profilePicture} alt={provider.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      provider.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{provider.fullName}</p>
                    <p className={`text-sm truncate ${selectedProvider?._id === provider._id ? 'text-white/90' : 'text-gray-600'}`}>
                      {provider.email}
                    </p>
                    {provider.providerType && (
                      <p className={`text-xs ${selectedProvider?._id === provider._id ? 'text-white/80' : 'text-gray-500'}`}>
                        {provider.providerType}
                      </p>
                    )}
                  </div>
                  {provider.rating && (
                    <div className={`text-sm font-semibold ${selectedProvider?._id === provider._id ? 'text-white' : 'text-yellow-600'}`}>
                      ⭐ {provider.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider Email *
            </label>
            <input
              type="email"
              value={formData.providerEmail}
              onChange={(e) => setFormData({ ...formData, providerEmail: e.target.value })}
              placeholder="Enter provider's email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {followedProviders.length > 0 
                ? 'Select from above or enter email manually'
                : 'Enter the email address of the provider you want to invite'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role (Optional)
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Designer, Developer, Assistant"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Percentage * (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.sharePercent || ''}
              onChange={(e) => setFormData({ ...formData, sharePercent: Number(e.target.value) })}
              placeholder="Enter percentage (1-100)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This percentage will be deducted from the total project budget
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteCollaboratorModal;
