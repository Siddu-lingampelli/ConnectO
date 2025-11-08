import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Download, Trash2, FileText, AlertTriangle, 
  CheckCircle, Clock, Database,
  Activity, Calendar, XCircle
} from 'lucide-react';
import { selectCurrentUser } from '../store/authSlice';
import { gdprService } from '../services/gdprService';
import { toast } from 'react-toastify';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const GDPRSettings = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Consent preferences
  const [consents, setConsents] = useState({
    marketingEmails: false,
    dataSharing: false,
    profileVisibility: 'public'
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadGDPRData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadGDPRData = async () => {
    try {
      setLoading(true);
      const [complianceData, logsData, exportsData, deletionData] = await Promise.all([
        gdprService.getCompliance(),
        gdprService.getAuditLogs(1, 10),
        gdprService.getDataExports(),
        gdprService.getDeletionStatus()
      ]);

      setCompliance(complianceData.compliance);
      setAuditLogs(logsData.logs || []);
      setExports(exportsData.exports || []);
      setDeletionStatus(deletionData.deletion);

      if (complianceData.compliance.consentManagement) {
        setConsents(complianceData.compliance.consentManagement);
      }
    } catch (error: any) {
      console.error('Error loading GDPR data:', error);
      toast.error('Failed to load GDPR settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (exportType = 'full', format = 'json') => {
    try {
      await gdprService.requestDataExport(exportType, format);
      toast.success('Data export request submitted! You will be notified when it\'s ready.');
      loadGDPRData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request data export');
    }
  };

  const handleDownloadExport = async (exportId: string) => {
    try {
      await gdprService.downloadDataExport(exportId);
      toast.success('Download started!');
      loadGDPRData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download export');
    }
  };

  const handleRequestDeletion = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action will be scheduled for 30 days from now and can be cancelled during this period.'
    );
    
    if (!confirmed) return;

    const reason = prompt('Please tell us why you want to delete your account (required):');
    if (!reason) return;

    try {
      await gdprService.requestAccountDeletion({
        reason: 'other',
        reasonDetails: reason,
        dataBackupRequested: true
      });
      toast.success('Account deletion scheduled successfully. You have 30 days to cancel.');
      loadGDPRData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request account deletion');
    }
  };

  const handleCancelDeletion = async () => {
    try {
      await gdprService.cancelAccountDeletion('Changed my mind');
      toast.success('Account deletion cancelled successfully');
      loadGDPRData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel deletion');
    }
  };

  const handleUpdateConsent = async (key: string, value: any) => {
    try {
      const updated = { ...consents, [key]: value };
      setConsents(updated);
      await gdprService.updateConsent(updated);
      toast.success('Consent preferences updated');
    } catch (error: any) {
      toast.error('Failed to update consent preferences');
      loadGDPRData(); // Reload to get correct state
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mx-auto mb-4"></div>
            <p className="text-text-primary font-medium">Loading GDPR Settings...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl flex items-center justify-center shadow-soft">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-primary">Privacy & Data</h1>
                <p className="text-text-secondary mt-1">Manage your data and privacy settings (GDPR Compliant)</p>
              </div>
            </div>

            {/* Warning Banner if deletion scheduled */}
            {deletionStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Account Deletion Scheduled</h3>
                    <p className="text-red-700 mb-4">
                      Your account is scheduled to be deleted on {formatDate(deletionStatus.scheduledDate)}.
                      You have until then to cancel this request.
                    </p>
                    <button
                      onClick={handleCancelDeletion}
                      className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                      Cancel Deletion
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border overflow-x-auto">
              {['overview', 'audit-logs', 'exports', 'consent', 'delete'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-[#345635] border-b-2 border-[#345635]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && compliance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Data Portability */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <Download className="w-8 h-8 text-[#345635]" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Data Portability</h3>
                    <p className="text-text-secondary text-sm mt-1">Export your data anytime</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-text-secondary">Total Exports: {compliance.dataPortability.totalExports}</p>
                  {compliance.dataPortability.lastExport && (
                    <p className="text-text-secondary text-sm">
                      Last Export: {formatDate(compliance.dataPortability.lastExport.createdAt)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleExportData('full', 'json')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl font-semibold hover:shadow-medium transition-all"
                >
                  Request Data Export
                </button>
              </div>

              {/* Right to Erasure */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Right to Erasure</h3>
                    <p className="text-text-secondary text-sm mt-1">Delete your account and data</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-text-secondary">
                    Status: {deletionStatus ? 'Deletion Pending' : 'Active'}
                  </p>
                  <p className="text-text-secondary text-sm">
                    You can request complete account deletion with 30-day grace period
                  </p>
                </div>
                {!deletionStatus && (
                  <button
                    onClick={handleRequestDeletion}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Request Account Deletion
                  </button>
                )}
              </div>

              {/* Audit Trail */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <Activity className="w-8 h-8 text-[#345635]" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Audit Trail</h3>
                    <p className="text-text-secondary text-sm mt-1">Track all account activities</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-text-secondary">Total Logs: {compliance.auditTrail.totalLogs}</p>
                  <p className="text-text-secondary text-sm">
                    Complete history of all actions on your account
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className="w-full px-4 py-2 bg-[#6B8F71] text-white rounded-xl font-semibold hover:bg-[#345635] transition-colors"
                >
                  View Audit Logs
                </button>
              </div>

              {/* Data Access */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <Database className="w-8 h-8 text-[#345635]" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Data Access</h3>
                    <p className="text-text-secondary text-sm mt-1">What data we collect</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(compliance.dataAccess).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-soft border border-border"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-text-secondary text-center py-8">No audit logs found</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log._id} className="flex items-start gap-4 p-4 bg-background rounded-xl">
                      <Activity className="w-5 h-5 text-[#345635] mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{log.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(log.createdAt)}
                          </span>
                          <span className="px-2 py-1 bg-[#E3EFD3] text-[#345635] rounded-md text-xs font-medium">
                            {log.action}
                          </span>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            log.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {log.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Exports Tab */}
          {activeTab === 'exports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Request New Export</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleExportData('full', 'json')}
                    className="p-4 border-2 border-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-[#345635] mx-auto mb-2" />
                    <p className="font-semibold text-text-primary">Full Export (JSON)</p>
                    <p className="text-text-secondary text-sm mt-1">All your data in JSON format</p>
                  </button>
                  <button
                    onClick={() => handleExportData('full', 'csv')}
                    className="p-4 border-2 border-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-[#345635] mx-auto mb-2" />
                    <p className="font-semibold text-text-primary">Full Export (CSV)</p>
                    <p className="text-text-secondary text-sm mt-1">All your data in CSV format</p>
                  </button>
                  <button
                    onClick={() => handleExportData('profile', 'json')}
                    className="p-4 border-2 border-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-[#345635] mx-auto mb-2" />
                    <p className="font-semibold text-text-primary">Profile Only</p>
                    <p className="text-text-secondary text-sm mt-1">Just profile data</p>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Your Exports</h2>
                <div className="space-y-4">
                  {exports.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No exports found</p>
                  ) : (
                    exports.map((exp) => (
                      <div key={exp._id} className="flex items-center justify-between p-4 bg-background rounded-xl">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(exp.status)}
                          <div>
                            <p className="font-medium text-text-primary">{exp.exportType} ({exp.format})</p>
                            <p className="text-text-secondary text-sm">{formatDate(exp.requestDate)}</p>
                            {exp.fileSize && (
                              <p className="text-text-secondary text-xs">
                                Size: {(exp.fileSize / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        {exp.status === 'completed' && (
                          <button
                            onClick={() => handleDownloadExport(exp._id)}
                            className="px-4 py-2 bg-[#345635] text-white rounded-xl font-semibold hover:bg-[#6B8F71] transition-colors"
                          >
                            <Download className="w-4 h-4 inline mr-2" />
                            Download
                          </button>
                        )}
                        {exp.status === 'processing' && (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold">
                            Processing...
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Consent Tab */}
          {activeTab === 'consent' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-soft border border-border"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">Manage Consents</h2>
              <div className="space-y-6">
                {/* Marketing Emails */}
                <div className="flex items-start justify-between p-4 bg-background rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary">Marketing Emails</h3>
                    <p className="text-text-secondary text-sm mt-1">
                      Receive promotional emails and newsletters
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.marketingEmails}
                      onChange={(e) => handleUpdateConsent('marketingEmails', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#AEC3B0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#345635]"></div>
                  </label>
                </div>

                {/* Data Sharing */}
                <div className="flex items-start justify-between p-4 bg-background rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary">Data Sharing</h3>
                    <p className="text-text-secondary text-sm mt-1">
                      Allow anonymized data sharing for platform improvement
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.dataSharing}
                      onChange={(e) => handleUpdateConsent('dataSharing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#AEC3B0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#345635]"></div>
                  </label>
                </div>

                {/* Profile Visibility */}
                <div className="p-4 bg-background rounded-xl">
                  <h3 className="font-bold text-text-primary mb-3">Profile Visibility</h3>
                  <div className="space-y-2">
                    {['public', 'connections', 'private'].map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option}
                          checked={consents.profileVisibility === option}
                          onChange={(e) => handleUpdateConsent('profileVisibility', e.target.value)}
                          className="w-4 h-4 text-[#345635] focus:ring-[#345635]"
                        />
                        <span className="text-text-primary capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Delete Tab */}
          {activeTab === 'delete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-soft border-2 border-red-200"
            >
              <div className="text-center max-w-2xl mx-auto">
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-4">Delete Your Account</h2>
                <p className="text-text-secondary mb-6">
                  This action will permanently delete your account and all associated data after a 30-day grace period.
                  You can cancel this request at any time during the grace period.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                  <h3 className="font-bold text-red-900 mb-2">What will be deleted:</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                    <li>Your profile information</li>
                    <li>All messages and conversations</li>
                    <li>Job postings and proposals</li>
                    <li>Orders and payment history</li>
                    <li>Reviews and ratings</li>
                    <li>All uploaded files</li>
                  </ul>
                </div>
                {!deletionStatus ? (
                  <button
                    onClick={handleRequestDeletion}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                  >
                    Request Account Deletion
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-red-600 font-semibold">
                      Deletion scheduled for: {formatDate(deletionStatus.scheduledDate)}
                    </p>
                    <button
                      onClick={handleCancelDeletion}
                      className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                      Cancel Deletion Request
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GDPRSettings;
