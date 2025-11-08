import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  backgroundCheck?: {
    status: string;
    requestedAt?: string;
    completedAt?: string;
    provider?: string;
    reportUrl?: string;
    notes?: string;
    checks?: any;
  };
}

const AdminBackgroundCheckManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    provider: '',
    notes: '',
    status: 'in_progress',
    reportUrl: '',
    checks: {
      criminalRecord: '',
      employmentHistory: '',
      educationHistory: '',
      referenceCheck: ''
    }
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await verificationService.getAllVerifications(filterStatus);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCheck = async (userId: string) => {
    const provider = prompt('Enter background check provider (optional):');
    const notes = prompt('Add any notes (optional):');

    setProcessing(true);
    try {
      await verificationService.requestBackgroundCheck(userId, provider || undefined, notes || undefined);
      alert('Background check requested successfully');
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request background check');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateCheck = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      await verificationService.updateBackgroundCheck(selectedUser._id, {
        status: formData.status,
        checks: formData.checks,
        reportUrl: formData.reportUrl || undefined,
        notes: formData.notes || undefined
      });
      alert('Background check updated successfully');
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update background check');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      not_requested: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.not_requested}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Background Check Manager</h2>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'not_requested', 'in_progress', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                loadUsers();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-1 flex items-center gap-3">
                      {getStatusBadge(user.backgroundCheck?.status || 'not_requested')}
                      {user.backgroundCheck?.requestedAt && (
                        <span className="text-xs text-gray-500">
                          Requested: {new Date(user.backgroundCheck.requestedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {(!user.backgroundCheck || user.backgroundCheck.status === 'not_requested') ? (
                    <button
                      onClick={() => handleRequestCheck(user._id)}
                      disabled={processing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                    >
                      Request Check
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData({
                          provider: user.backgroundCheck?.provider || '',
                          notes: user.backgroundCheck?.notes || '',
                          status: user.backgroundCheck?.status || 'in_progress',
                          reportUrl: user.backgroundCheck?.reportUrl || '',
                          checks: user.backgroundCheck?.checks || {
                            criminalRecord: '',
                            employmentHistory: '',
                            educationHistory: '',
                            referenceCheck: ''
                          }
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Update Background Check</h3>

              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Individual Checks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Individual Checks</label>
                  <div className="space-y-2">
                    {Object.keys(formData.checks).map((checkKey) => (
                      <div key={checkKey} className="flex items-center gap-3">
                        <span className="text-sm flex-1">{checkKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <select
                          value={formData.checks[checkKey as keyof typeof formData.checks]}
                          onChange={(e) => setFormData({
                            ...formData,
                            checks: { ...formData.checks, [checkKey]: e.target.value }
                          })}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Not Checked</option>
                          <option value="clear">Clear</option>
                          <option value="pending">Pending</option>
                          <option value="flagged">Flagged</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report URL</label>
                  <input
                    type="url"
                    value={formData.reportUrl}
                    onChange={(e) => setFormData({ ...formData, reportUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateCheck}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                >
                  {processing ? 'Updating...' : 'Update Check'}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackgroundCheckManager;
