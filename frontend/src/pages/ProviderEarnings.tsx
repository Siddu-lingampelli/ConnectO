import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import analyticsService, { type ProviderEarningsData, type PerformanceMetrics } from '../services/analyticsService';

const ProviderEarnings = () => {
  const [earnings, setEarnings] = useState<ProviderEarningsData | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365' | 'all'>('30');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [earningsData, performanceData] = await Promise.all([
        analyticsService.getProviderEarnings(period),
        analyticsService.getProviderPerformance(period)
      ]);
      setEarnings(earningsData);
      setPerformance(performanceData);
    } catch (error: any) {
      console.error('Error loading earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    '7': 'Last 7 Days',
    '30': 'Last 30 Days',
    '90': 'Last 90 Days',
    '365': 'This Year',
    'all': 'All Time'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !earnings) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading earnings data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Earnings Analytics</h1>
            <p className="text-gray-600 mt-1">Track your income and performance</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Time Period</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key as typeof period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {earnings && performance && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Wallet Balance</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.summary.walletBalance)}</div>
                <div className="text-sm opacity-80">Available to withdraw</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Total Earned</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.summary.totalEarned)}</div>
                <div className="text-sm opacity-80">Lifetime earnings</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Period Earnings</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.summary.currentPeriodEarnings)}</div>
                <div className="flex items-center gap-1 text-sm">
                  {earnings.summary.growthRate >= 0 ? (
                    <span className="text-green-200">↑ {earnings.summary.growthRate}%</span>
                  ) : (
                    <span className="text-red-200">↓ {Math.abs(earnings.summary.growthRate)}%</span>
                  )}
                  <span className="opacity-80">vs previous period</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Pending Amount</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.summary.pendingAmount)}</div>
                <div className="text-sm opacity-80">In progress orders</div>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">{performance.completionRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {performance.completedOrders} of {performance.totalOrders} orders
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{performance.averageRating.toFixed(1)} ⭐</div>
                  <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                  <div className="text-xs text-gray-500 mt-1">{performance.totalReviews} reviews</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{performance.averageResponseTime}h</div>
                  <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
                  <div className="text-xs text-gray-500 mt-1">To job postings</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{formatCurrency(performance.earningsPerJob)}</div>
                  <div className="text-sm text-gray-600 mt-1">Earnings per Job</div>
                  <div className="text-xs text-gray-500 mt-1">Average value</div>
                </div>
              </div>
            </div>

            {/* Daily Earnings Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Daily Earnings</h3>
              {earnings.dailyEarnings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No earnings data for this period</p>
              ) : (
                <div className="space-y-3">
                  {earnings.dailyEarnings.map((day, index) => {
                    const maxAmount = Math.max(...earnings.dailyEarnings.map(d => d.amount));
                    const percentage = (day.amount / maxAmount) * 100;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 w-24">{day._id}</div>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-8 flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            >
                              {formatCurrency(day.amount)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 w-20 text-right">{day.count} orders</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Earnings by Category */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">💼 Earnings by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnings.earningsByCategory.map((category, index) => {
                  const colors = [
                    'from-blue-500 to-indigo-500',
                    'from-green-500 to-emerald-500',
                    'from-purple-500 to-pink-500',
                    'from-orange-500 to-red-500',
                    'from-yellow-500 to-orange-500',
                    'from-teal-500 to-cyan-500'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={index} className={`bg-gradient-to-br ${colorClass} rounded-lg p-6 text-white`}>
                      <div className="text-lg font-semibold mb-2 capitalize">
                        {category._id.replace('_', ' ')}
                      </div>
                      <div className="text-3xl font-bold mb-1">{formatCurrency(category.amount)}</div>
                      <div className="text-sm opacity-90">{category.count} transactions</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Clients */}
            {earnings.topClients.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">👥 Top Clients</h3>
                <div className="space-y-4">
                  {earnings.topClients.map((client, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        #{index + 1}
                      </div>
                      {client.profilePicture ? (
                        <img
                          src={client.profilePicture}
                          alt={client.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {client.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{formatCurrency(client.totalEarned)}</div>
                        <div className="text-sm text-gray-600">{client.jobsCompleted} jobs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">💳 Recent Transactions</h3>
              <div className="space-y-3">
                {earnings.recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent transactions</p>
                ) : (
                  earnings.recentTransactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize">
                            {transaction.category.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProviderEarnings;
