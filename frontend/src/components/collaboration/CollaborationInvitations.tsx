import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import collaborationService from '../../services/collaborationService';

interface Invitation {
  _id: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  jobBudget: number;
  jobDeadline: string;
  jobStatus: string;
  mainProvider: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  client: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  role: string;
  sharePercent: number;
  shareAmount: string;
  invitedAt: string;
  status: string;
}

const CollaborationInvitations = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await collaborationService.getMyInvitations();
      setInvitations(response.invitations || []);
    } catch (error: any) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (jobId: string, collaboratorId: string, response: 'accepted' | 'declined') => {
    try {
      setResponding(collaboratorId);
      await collaborationService.respondToInvitation(jobId, collaboratorId, response);
      toast.success(`Invitation ${response} successfully!`);
      loadInvitations(); // Reload to remove the invitation
    } catch (error: any) {
      toast.error(error.message || 'Failed to respond to invitation');
    } finally {
      setResponding(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show if no invitations
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            🎉 Collaboration Invitations
          </h2>
          <p className="text-sm text-gray-600">
            You have {invitations.length} pending invitation{invitations.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation._id}
            className="bg-white rounded-lg p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {invitation.jobTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {invitation.jobDescription.substring(0, 100)}
                  {invitation.jobDescription.length > 100 ? '...' : ''}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {invitation.jobCategory}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    {invitation.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Your Share</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{invitation.shareAmount} ({invitation.sharePercent}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Budget</p>
                <p className="text-lg font-semibold text-gray-900">₹{invitation.jobBudget}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(invitation.jobDeadline)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {invitation.mainProvider.profilePicture ? (
                    <img
                      src={invitation.mainProvider.profilePicture}
                      alt={invitation.mainProvider.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    invitation.mainProvider.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Main Provider</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {invitation.mainProvider.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                  {invitation.client.profilePicture ? (
                    <img
                      src={invitation.client.profilePicture}
                      alt={invitation.client.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    invitation.client.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {invitation.client.fullName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleRespond(invitation.jobId, invitation._id, 'accepted')}
                disabled={responding === invitation._id}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {responding === invitation._id ? 'Processing...' : '✓ Accept Invitation'}
              </button>
              <button
                onClick={() => handleRespond(invitation.jobId, invitation._id, 'declined')}
                disabled={responding === invitation._id}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {responding === invitation._id ? 'Processing...' : '✗ Decline'}
              </button>
              <button
                onClick={() => navigate(`/jobs/${invitation.jobId}`)}
                className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
              >
                View Details →
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Invited {formatDate(invitation.invitedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborationInvitations;
