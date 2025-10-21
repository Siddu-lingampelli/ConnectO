import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService, type AnalyticsData } from '../../services/adminService';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics(period);
      setAnalytics(data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    'all': 'All Time'
  };

  if (loading && !analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Platform performance and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (60s)
            </label>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Time Period</label>
          <div className="flex gap-2">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key as typeof period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {analytics && (
          <>
            {/* User Registrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">User Registrations</h3>
              {analytics.userRegistrations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No registration data available</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Total Users</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.userRegistrations.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Average per Day</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(analytics.userRegistrations.reduce((sum, item) => sum + item.count, 0) / 
                          Math.max(analytics.userRegistrations.length, 1)).toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {analytics.userRegistrations.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 w-24">{item._id}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                            style={{
                              width: `${(item.count / Math.max(...analytics.userRegistrations.map(x => x.count))) * 100}%`
                            }}
                          >
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Jobs Posted */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Jobs Posted</h3>
              {analytics.jobsPosted.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No job posting data available</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Total Jobs</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.jobsPosted.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Average per Day</div>
                      <div className="text-2xl font-bold text-pink-600">
                        {(analytics.jobsPosted.reduce((sum, item) => sum + item.count, 0) / 
                          Math.max(analytics.jobsPosted.length, 1)).toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {analytics.jobsPosted.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 w-24">{item._id}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                            style={{
                              width: `${(item.count / Math.max(...analytics.jobsPosted.map(x => x.count))) * 100}%`
                            }}
                          >
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Jobs by Category */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Jobs by Category</h3>
              {analytics.jobsByCategory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.jobsByCategory.map((item, index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-red-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-indigo-500',
                      'bg-orange-500'
                    ];
                    const color = colors[index % colors.length];
                    const total = analytics.jobsByCategory.reduce((sum, x) => sum + x.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);

                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                          {item.count}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{item._id}</div>
                          <div className="text-sm text-gray-600">{percentage}% of total jobs</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Cities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Cities by Jobs</h3>
              {analytics.topCities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No location data available</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topCities.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item._id}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mt-1">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                            style={{
                              width: `${(item.count / Math.max(...analytics.topCities.map(x => x.count))) * 100}%`
                            }}
                          >
                            {item.count} jobs
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
