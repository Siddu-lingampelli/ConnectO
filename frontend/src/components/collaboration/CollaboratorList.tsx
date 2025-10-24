import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import collaborationService, { type Collaborator } from '../../services/collaborationService';
import InviteCollaboratorModal from './InviteCollaboratorModal';

interface CollaboratorListProps {
  jobId: string;
  budget: number;
  assignedProviderId: string;
  status: string;
}

const CollaboratorList = ({ jobId, budget, assignedProviderId, status }: CollaboratorListProps) => {
  const currentUser = useSelector(selectCurrentUser);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [mainProvider, setMainProvider] = useState<any>(null);

  const isMainProvider = currentUser?._id === assignedProviderId;
  const canInvite = isMainProvider && (status === 'in_progress' || status === 'in-progress' || status === 'IN PROGRESS');

  useEffect(() => {
    loadCollaborators();
  }, [jobId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const response = await collaborationService.getCollaborators(jobId);
      setCollaborators(response.collaborators || []);
      setMainProvider(response.mainProvider);
    } catch (error: any) {
      // Silently handle permission errors - user is not authorized to view
      // This is expected for non-collaborators
      setCollaborators([]);
      setMainProvider(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (collaboratorId: string, response: 'accepted' | 'declined') => {
    try {
      await collaborationService.respondToInvitation(jobId, collaboratorId, response);
      toast.success(`Invitation ${response} successfully`);
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.message || 'Failed to respond to invitation');
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;

    try {
      await collaborationService.removeCollaborator(jobId, collaboratorId);
      toast.success('Collaborator removed successfully');
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove collaborator');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      invited: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const calculateAmount = (sharePercent: number) => {
    return ((budget * sharePercent) / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Always show for main provider, even if no collaborators yet
  if (!isMainProvider && collaborators.length === 0 && !mainProvider) {
    return null; // Don't show to non-main-provider if no data
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#0D2B1D] flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Team Collaboration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {collaborators.length === 0 ? 'No collaborators yet' : `${collaborators.length} collaborator${collaborators.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Collaborator
          </button>
        )}
      </div>

      {/* Main Provider */}
      {mainProvider && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0]/30 rounded-lg border border-[#6B8F71]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0D2B1D] rounded-full flex items-center justify-center text-white font-bold">
              {mainProvider.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#0D2B1D]">{mainProvider.fullName}</p>
                <span className="px-2 py-1 bg-[#0D2B1D] text-white text-xs rounded-full">
                  Main Provider
                </span>
              </div>
              <p className="text-sm text-gray-600">{mainProvider.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators List */}
      {collaborators.length > 0 ? (
        <div className="space-y-3">
          {collaborators.map((collaborator) => {
            const isCurrentUser = collaborator.providerId._id === currentUser?._id;
            const canRespond = isCurrentUser && collaborator.status === 'invited';
            const canRemoveThis = isMainProvider && collaborator.status !== 'accepted';

            return (
              <div
                key={collaborator._id}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#6B8F71] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-full flex items-center justify-center text-white font-semibold">
                      {collaborator.providerId.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">
                          {collaborator.providerId.fullName}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(collaborator.status)}`}>
                          {collaborator.status.charAt(0).toUpperCase() + collaborator.status.slice(1)}
                        </span>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{collaborator.providerId.email}</p>
                      {collaborator.role && (
                        <p className="text-sm text-gray-500 mt-1">Role: {collaborator.role}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <div className="text-[#345635] font-semibold">
                          Share: {collaborator.sharePercent}%
                        </div>
                        <div className="text-gray-600">
                          Amount: ₹{calculateAmount(collaborator.sharePercent)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Invited {new Date(collaborator.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-2">
                    {canRespond && (
                      <>
                        <button
                          onClick={() => handleRespond(collaborator._id, 'accepted')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(collaborator._id, 'declined')}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {canRemoveThis && (
                      <button
                        onClick={() => handleRemove(collaborator._id)}
                        className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove collaborator"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>No collaborators invited yet</p>
          {canInvite && (
            <p className="text-sm mt-2">Click "Invite Collaborator" to add team members</p>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteCollaboratorModal
          jobId={jobId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={loadCollaborators}
        />
      )}
    </div>
  );
};

export default CollaboratorList;
