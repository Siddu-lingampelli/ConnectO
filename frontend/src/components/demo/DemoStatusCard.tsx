import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../../store/authSlice';
import { demoService, type DemoProject } from '../../services/demoService';

const DemoStatusCard = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [demo, setDemo] = useState<DemoProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');

  const demoStatus = currentUser?.demoVerification?.status || 'not_assigned';

  useEffect(() => {
    loadDemo();
  }, []);

  const loadDemo = async () => {
    try {
      setLoading(true);
      const data = await demoService.getMyDemo();
      setDemo(data);
    } catch (error: any) {
      // No demo assigned yet - not an error
      if (error.response?.status !== 404) {
        console.error('Error loading demo:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // If demo is verified in user profile, don't show anything
  if (demoStatus === 'verified') {
    return null;
  }

  const handleRequestDemo = async () => {
    try {
      setRequesting(true);
      await demoService.requestDemo();
      toast.success('Demo request submitted! Admin will assign you a demo project soon.');
      // Reload user data or update demo status
      window.location.reload(); // Simple reload to refresh user data
    } catch (error: any) {
      console.error('Error requesting demo:', error);
      toast.error(error.response?.data?.message || 'Failed to request demo');
    } finally {
      setRequesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionLink && !submissionFile) {
      toast.error('Please provide submission link or file');
      return;
    }

    try {
      setSubmitting(true);
      await demoService.submitDemo({ submissionLink, submissionFile });
      toast.success('Demo submitted successfully!');
      loadDemo(); // Reload demo status
      setSubmissionLink('');
      setSubmissionFile('');
    } catch (error: any) {
      console.error('Error submitting demo:', error);
      toast.error(error.response?.data?.message || 'Failed to submit demo');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      Pending: 'bg-yellow-100 text-yellow-700',
      'Under Review': 'bg-blue-100 text-blue-700',
      Verified: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
    };

    const icons: any = {
      Pending: '⏳',
      'Under Review': '🔍',
      Verified: '✅',
      Rejected: '❌',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {icons[status]} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!demo) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border border-yellow-200">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {demoStatus === 'pending_request' ? 'Demo Request Pending' : 'Demo Project Required'}
            </h3>
            
            {demoStatus === 'pending_request' ? (
              <div>
                <p className="text-gray-700 mb-4">
                  Your demo request has been submitted! Admin will review and assign you a demo project soon.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-300">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="text-xl">⏳</span>
                    <strong>Status: Waiting for admin to assign demo project</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  You need to complete a demo project before applying for jobs. Click the button below to request a demo assignment from admin.
                </p>
                <button
                  onClick={handleRequestDemo}
                  disabled={requesting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {requesting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Requesting...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🎯</span>
                      Request Demo Project
                    </>
                  )}
                </button>
                <div className="bg-white rounded-lg p-4 border border-yellow-300 mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> After requesting, admin will review your profile and assign a suitable demo project. You'll receive a notification once it's assigned.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">📋 Demo Project Status</h3>
        {getStatusBadge(demo.status)}
      </div>

      <div className="space-y-4">
        {/* Demo Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{demo.demoTitle}</h4>
          <p className="text-gray-700 text-sm mb-3">{demo.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📌 Type: <strong>{demo.freelancerType}</strong></span>
            <span>📅 Assigned: {new Date(demo.dateAssigned).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Pending - Show Submission Form */}
        {demo.status === 'Pending' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Link (e.g., GitHub, Google Drive, Portfolio)
              </label>
              <input
                type="url"
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or File Path/URL
              </label>
              <input
                type="text"
                value={submissionFile}
                onChange={(e) => setSubmissionFile(e.target.value)}
                placeholder="Enter file URL or path"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Demo Project'}
            </button>
          </form>
        )}

        {/* Rejected - Show Retry Option */}
        {demo.status === 'Rejected' && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-700 font-semibold mb-2">❌ Demo Rejected</p>
              {demo.score !== undefined && (
                <p className="text-sm text-gray-700 mb-2">Score: <strong>{demo.score}/100</strong></p>
              )}
              {demo.adminComments && (
                <p className="text-sm text-gray-700">
                  <strong>Admin Feedback:</strong> {demo.adminComments}
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-700 font-medium">Resubmit your demo project:</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Link
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or File Path/URL
                </label>
                <input
                  type="text"
                  value={submissionFile}
                  onChange={(e) => setSubmissionFile(e.target.value)}
                  placeholder="Enter file URL or path"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Resubmitting...' : 'Resubmit Demo Project'}
              </button>
            </form>
          </div>
        )}

        {/* Under Review */}
        {demo.status === 'Under Review' && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-700 font-semibold mb-2">🔍 Under Review</p>
            <p className="text-sm text-gray-700 mb-2">Your demo has been submitted and is being reviewed by admin.</p>
            {demo.dateSubmitted && (
              <p className="text-sm text-gray-600">Submitted on: {new Date(demo.dateSubmitted).toLocaleDateString()}</p>
            )}
            {demo.submissionLink && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Link:</strong> <a href={demo.submissionLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{demo.submissionLink}</a>
              </p>
            )}
          </div>
        )}

        {/* Verified - This should not appear if demoStatus is 'verified' because we return early */}
        {demo.status === 'Verified' && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-green-700 font-semibold mb-2">✅ Demo Verified!</p>
            <p className="text-sm text-gray-700 mb-2">Congratulations! Your demo has been approved.</p>
            {demo.score !== undefined && (
              <p className="text-lg text-gray-900 mb-2">Score: <strong className="text-green-600">{demo.score}/100</strong></p>
            )}
            {demo.adminComments && (
              <p className="text-sm text-gray-700 mb-3">
                <strong>Admin Feedback:</strong> {demo.adminComments}
              </p>
            )}
            <p className="text-sm text-green-700 font-medium">✨ You can now apply for jobs!</p>
            <p className="text-xs text-gray-500 mt-2">This card will disappear once your profile is updated.</p>
          </div>
        )}

        {/* Activity Log */}
        {demo.activityLog && demo.activityLog.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity Log</h4>
            <div className="space-y-2">
              {demo.activityLog.slice(-3).reverse().map((log, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <div>
                    <strong>{log.action}</strong> - {log.details}
                    <div className="text-gray-500">{new Date(log.date).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoStatusCard;
