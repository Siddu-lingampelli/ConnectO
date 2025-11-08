import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CollaboratorList from '../components/collaboration/CollaboratorList';
import type { Job } from '../types';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useSelector(selectCurrentUser);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const rehireProviderId = searchParams.get('rehire');

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJob(id!);
      setJob(data);
    } catch (error: any) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      open: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ').replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse All Jobs
            </button>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  const client = typeof job.client === 'object' ? job.client : null;
  const assignedProvider = typeof job.assignedProvider === 'object' ? job.assignedProvider : null;
  const isOwner = currentUser?._id === job.client;
  const isProvider = currentUser?.role === 'provider';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Job Header Card */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  {getStatusBadge(job.status)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {job.category}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location?.city ? `${job.location.city}${job.location.area ? `, ${job.location.area}` : ''}` : 'Location not specified'}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isOwner && job.status === 'open' && (
                  <button
                    onClick={() => navigate(`/jobs/${job._id}/edit`)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Edit Job
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => navigate(`/jobs/${job._id}/proposals`)}
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium"
                  >
                    View Proposals ({job.proposalsCount || 0})
                  </button>
                )}
                {isProvider && job.status === 'open' && (
                  <button
                    onClick={() => navigate(`/jobs/${job._id}/apply${rehireProviderId ? `?rehire=${rehireProviderId}` : ''}`)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {rehireProviderId && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {rehireProviderId ? 'Submit Rehire Proposal' : 'Apply Now'}
                  </button>
                )}
                {rehireProviderId && !isProvider && (
                  <div className="px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Rehire request for this provider
                  </div>
                )}
              </div>
            </div>

            {/* Budget and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="text-sm text-text-secondary mb-1">Budget</div>
                <div className="text-2xl font-bold text-primary">₹{job.budget.toLocaleString()}</div>
                {job.budgetType && (
                  <div className="text-xs text-text-secondary mt-1 capitalize">{job.budgetType}</div>
                )}
              </div>
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="text-sm text-text-secondary mb-1">Deadline</div>
                <div className="text-2xl font-bold text-primary">{formatDate(job.deadline)}</div>
              </div>
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="text-sm text-text-secondary mb-1">Provider Type</div>
                <div className="text-lg font-bold text-primary flex items-center gap-2">
                  {job.providerType === 'Technical' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Technical
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Non-Technical
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-surface rounded-lg shadow-soft p-8 mb-6 border border-border">
            <h2 className="text-xl font-bold text-text-primary mb-4">Job Description</h2>
            <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>

          {/* Location Details */}
          {job.location && (
            <div className="bg-surface rounded-lg shadow-soft p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-text-primary mb-4">Location Details</h2>
              <div className="space-y-3">
                {job.location.city && (
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-text-primary min-w-[100px]">City:</span>
                    <span className="text-text-secondary">{job.location.city}</span>
                  </div>
                )}
                {job.location.area && (
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-text-primary min-w-[100px]">Area:</span>
                    <span className="text-text-secondary">{job.location.area}</span>
                  </div>
                )}
                {job.location.address && (
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-text-primary min-w-[100px]">Address:</span>
                    <span className="text-text-secondary">{job.location.address}</span>
                  </div>
                )}
              {job.location.latitude && job.location.longitude && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">GPS Location Available</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    Coordinates: {job.location.latitude.toFixed(6)}, {job.location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Client Information */}
          {client && (
            <div className="bg-surface rounded-lg shadow-soft p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-text-primary mb-4">Client Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {client.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">{client.fullName}</h3>
                  {client.email && <p className="text-text-secondary">{client.email}</p>}
                  {client.phone && <p className="text-text-secondary">{client.phone}</p>}
                  {client.city && (
                    <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {client.city}, {client.area || ''}
                    </p>
                  )}
                  {client.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-text-primary">{client.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {!isOwner && (
                  <button
                    onClick={() => navigate(`/profile/${client._id}`)}
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    View Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Assigned Provider (if any) */}
          {assignedProvider && (
            <div className="bg-surface rounded-lg shadow-soft p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-text-primary mb-4">Assigned Service Provider</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {assignedProvider.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">{assignedProvider.fullName}</h3>
                  {assignedProvider.email && <p className="text-text-secondary">{assignedProvider.email}</p>}
                  {assignedProvider.phone && <p className="text-text-secondary">{assignedProvider.phone}</p>}
                  {assignedProvider.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-text-primary">{assignedProvider.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/profile/${assignedProvider._id}`)}
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          )}

          {/* Team Collaboration - Only visible to service providers */}
          {assignedProvider && assignedProvider._id && (
            <CollaboratorList
              jobId={job._id}
              budget={job.budget}
              assignedProviderId={assignedProvider._id}
              status={job.status}
            />
          )}

          {/* Metadata */}
          <div className="bg-surface rounded-lg shadow-soft p-8 border border-border">
            <h2 className="text-xl font-bold text-text-primary mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-text-primary">Job ID:</span>
                <span className="text-text-secondary ml-2">{job._id}</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Posted On:</span>
                <span className="text-text-secondary ml-2">{formatDateTime(job.createdAt)}</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Last Updated:</span>
                <span className="text-text-secondary ml-2">{formatDateTime(job.updatedAt)}</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Proposals Count:</span>
                <span className="text-text-secondary ml-2">{job.proposalsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div></main>
      <Footer />
    </div>
  );
};

export default JobDetails;
