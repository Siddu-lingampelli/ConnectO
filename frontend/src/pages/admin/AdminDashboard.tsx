import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService, DashboardStats } from '../../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Monitor your platform's performance and activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Growth</p>
                <p className="text-2xl font-bold">+{stats?.users.growthRate}%</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Total Users</h3>
            <p className="text-3xl font-bold">{stats?.users.total.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-blue-400 flex justify-between text-sm">
              <span>Clients: {stats?.users.clients}</span>
              <span>Providers: {stats?.users.providers}</span>
            </div>
          </div>

          {/* Total Jobs */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💼</div>
              <div className="text-right">
                <p className="text-green-100 text-sm">Growth</p>
                <p className="text-2xl font-bold">+{stats?.jobs.growthRate}%</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Total Jobs</h3>
            <p className="text-3xl font-bold">{stats?.jobs.total.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-green-400 text-sm">
              <span>Open Jobs: {stats?.jobs.open}</span>
            </div>
          </div>

          {/* Pending Verifications */}
          <div
            className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate('/admin/verifications')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⏳</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                Action Required
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Pending Verifications</h3>
            <p className="text-3xl font-bold">{stats?.verifications.pending.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-yellow-400 text-sm">
              <span>Verified: {stats?.verifications.verified}</span>
            </div>
          </div>

          {/* Total Proposals */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📝</div>
              <div className="text-right">
                <p className="text-purple-100 text-sm">All Time</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Total Proposals</h3>
            <p className="text-3xl font-bold">{stats?.proposals.total.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-purple-400 text-sm">
              <span>Submitted by providers</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Users */}
          <div
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-3xl">
                👥
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{stats?.users.recent} new this month</span>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Review Verifications */}
          <div
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => navigate('/admin/verifications')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-3xl">
                ✅
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Review Verifications</h3>
                <p className="text-sm text-gray-600">Approve or reject documents</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-orange-600 font-semibold">
                {stats?.verifications.pending} pending
              </span>
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Manage Jobs */}
          <div
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => navigate('/admin/jobs')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-3xl">
                💼
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Manage Jobs</h3>
                <p className="text-sm text-gray-600">Oversee all job postings</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{stats?.jobs.recent} new this month</span>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Platform Analytics */}
          <div
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => navigate('/admin/analytics')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-3xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
                <p className="text-sm text-gray-600">View insights and trends</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Real-time data</span>
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Manage Proposals */}
          <div
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => navigate('/admin/proposals')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center text-3xl">
                📝
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Manage Proposals</h3>
                <p className="text-sm text-gray-600">Review all proposals</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{stats?.proposals.total} total proposals</span>
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Demo Projects */}
          <div
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => navigate('/admin/demos')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center text-3xl">
                🎯
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Demo Projects</h3>
                <p className="text-sm text-gray-600">Review freelancer demos</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Verify freelancer skills</span>
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Health */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Active Users</span>
                <span className="font-semibold text-green-600">✓ Normal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Job Posting Rate</span>
                <span className="font-semibold text-blue-600">✓ Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">Verification Queue</span>
                <span className="font-semibold text-yellow-600">⚠ Needs Attention</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Avg. Job Value</span>
                <span className="font-semibold text-gray-900">₹15,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Success Rate</span>
                <span className="font-semibold text-gray-900">87%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">User Satisfaction</span>
                <span className="font-semibold text-gray-900">4.6/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
