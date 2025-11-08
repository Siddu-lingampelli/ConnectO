import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { toast } from 'react-toastify';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import collaborationService from '../services/collaborationService';
import { orderService } from '../services/orderService';

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

interface CollaborativeJob {
  _id: string;
  job: {
    _id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
  };
  client: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  provider: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  status: string;
  amount: number;
  deadline: string;
  createdAt: string;
  isMainProvider?: boolean;
  myRole?: string;
  myShare?: number;
}

const Collaboration = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'invitations' | 'active'>('invitations');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [collaborativeJobs, setCollaborativeJobs] = useState<CollaborativeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'provider') {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadInvitations(), loadCollaborativeJobs()]);
    setLoading(false);
  };

  const loadInvitations = async () => {
    try {
      const response = await collaborationService.getMyInvitations();
      setInvitations(response.invitations || []);
    } catch (error: any) {
      console.error('Failed to load invitations:', error);
    }
  };

  const loadCollaborativeJobs = async () => {
    try {
      // Get all orders where user is involved
      const response = await orderService.getMyOrders();
      
      // Cast orders to match our interface (they're compatible)
      const collaborativeOrders = (response.data || []) as any[];
      
      setCollaborativeJobs(collaborativeOrders);
    } catch (error: any) {
      console.error('Failed to load collaborative jobs:', error);
    }
  };

  const handleRespond = async (jobId: string, collaboratorId: string, response: 'accepted' | 'declined') => {
    try {
      setResponding(collaboratorId);
      await collaborationService.respondToInvitation(jobId, collaboratorId, response);
      toast.success(`Invitation ${response} successfully!`);
      await loadData(); // Reload both invitations and jobs
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

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      disputed: 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (currentUser?.role !== 'provider') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">This page is only available for service providers.</p>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
          <p className="text-gray-600">
            Manage your collaboration invitations and view projects you're working on with other providers
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('invitations')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'invitations'
                  ? 'text-[#345635] border-b-2 border-[#345635]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Invitations
              {invitations.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {invitations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'active'
                  ? 'text-[#345635] border-b-2 border-[#345635]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Collaborations
              {collaborativeJobs.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  {collaborativeJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#345635]"></div>
          </div>
        ) : (
          <>
            {/* Invitations Tab */}
            {activeTab === 'invitations' && (
              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Invitations</h3>
                    <p className="text-gray-600">You don't have any collaboration invitations at the moment.</p>
                  </div>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation._id}
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {invitation.jobTitle}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {invitation.jobDescription.substring(0, 150)}
                            {invitation.jobDescription.length > 150 ? '...' : ''}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                              {invitation.jobCategory}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                              {invitation.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Your Share</p>
                          <p className="text-xl font-bold text-green-600">
                            ₹{invitation.shareAmount} ({invitation.sharePercent}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                          <p className="text-xl font-semibold text-gray-900">₹{invitation.jobBudget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Deadline</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(invitation.jobDeadline)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4 pb-4 border-b">
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

                        <div className="ml-auto text-sm text-gray-500">
                          Invited {formatDate(invitation.invitedAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleRespond(invitation.jobId, invitation._id, 'accepted')}
                          disabled={responding === invitation._id}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {responding === invitation._id ? 'Processing...' : '✓ Accept Invitation'}
                        </button>
                        <button
                          onClick={() => handleRespond(invitation.jobId, invitation._id, 'declined')}
                          disabled={responding === invitation._id}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {responding === invitation._id ? 'Processing...' : '✗ Decline'}
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${invitation.jobId}`)}
                          className="px-6 py-3 border-2 border-[#345635] text-[#345635] rounded-lg hover:bg-[#345635] hover:text-white transition-all font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Active Collaborations Tab */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {collaborativeJobs.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Collaborations</h3>
                    <p className="text-gray-600">You're not currently working on any collaborative projects.</p>
                  </div>
                ) : (
                  collaborativeJobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/orders/${job._id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {typeof job.job === 'object' ? job.job.title : 'Job'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(job.status)}`}>
                              {job.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {typeof job.job === 'object' && (
                            <>
                              <p className="text-gray-600 mb-3">
                                {job.job.description.substring(0, 120)}...
                              </p>
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
                                {job.job.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Budget</p>
                          <p className="text-lg font-bold text-gray-900">₹{job.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Deadline</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(job.deadline)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Client</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {typeof job.client === 'object' ? job.client.fullName : 'Client'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Started</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(job.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#345635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">Team Collaboration</span>
                        </div>
                        <button className="text-[#345635] font-medium hover:text-[#0D2B1D]">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div></main>
      <Footer />
    </div>
  );
};

export default Collaboration;
