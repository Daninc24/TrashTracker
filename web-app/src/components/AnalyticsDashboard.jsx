import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function AnalyticsDashboard({ isAdmin = false }) {
  const [analytics, setAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Debounce filter changes to prevent excessive API calls
  const debouncedPeriod = useDebounce(period, 500);
  const debouncedCategoryFilter = useDebounce(categoryFilter, 500);
  const debouncedStatusFilter = useDebounce(statusFilter, 500);

  const fetchAnalytics = async () => {
    if (isFetching) return; // Prevent multiple simultaneous requests
    
    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: debouncedPeriod,
        ...(debouncedCategoryFilter && { category: debouncedCategoryFilter }),
        ...(debouncedStatusFilter && { status: debouncedStatusFilter })
      });

      const [analyticsRes, userRes] = await Promise.all([
        api.get(`/stats/advanced?${params}`),
        api.get(`/stats/user?period=${debouncedPeriod}`)
      ]);

      setAnalytics(analyticsRes.data);
      setUserAnalytics(userRes.data);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to load analytics');
      }
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [debouncedPeriod, debouncedCategoryFilter, debouncedStatusFilter]);

  const handleExport = async (format = 'csv') => {
    try {
      const params = new URLSearchParams({
        period,
        format,
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await api.get(`/stats/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${period}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
        <button 
          onClick={fetchAnalytics}
          className="ml-2 text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || !userAnalytics) {
    return <div className="text-center text-gray-600 p-4">No analytics data available</div>;
  }

  // Chart configurations
  const dailyTrendsData = {
    labels: analytics.dailyTrends.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Total Reports',
        data: analytics.dailyTrends.map(item => item.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Resolved',
        data: analytics.dailyTrends.map(item => item.resolved),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'In Progress',
        data: analytics.dailyTrends.map(item => item.inProgress),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: analytics.categoryStats.map(item => item._id),
    datasets: [
      {
        data: analytics.categoryStats.map(item => item.count),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const statusData = {
    labels: analytics.statusStats.map(item => item._id),
    datasets: [
      {
        data: analytics.statusStats.map(item => item.count),
        backgroundColor: [
          '#10B981', // resolved
          '#F59E0B', // in progress
          '#6B7280', // pending
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const userActivityData = {
    labels: userAnalytics.dailyActivity.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Your Reports',
        data: userAnalytics.dailyActivity.map(item => item.reports),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
            <p className="text-gray-600">
              {isAdmin ? 'Community insights and performance metrics' : 'Your personal activity and impact'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {isAdmin && (
              <>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="trash">Trash</option>
                  <option value="recycling">Recycling</option>
                  <option value="hazardous">Hazardous</option>
                  <option value="organic">Organic</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </>
            )}
            
            <button
              onClick={() => handleExport('csv')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <span className="mr-2">📊</span>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin ? analytics.performanceMetrics.totalReports : userAnalytics.userStats.totalReports}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin ? analytics.performanceMetrics.resolutionRate : userAnalytics.userStats.resolutionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin ? analytics.performanceMetrics.avgResolutionTime : 'N/A'} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Reports/Day</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin ? analytics.performanceMetrics.avgReportsPerDay.toFixed(1) : userAnalytics.userStats.avgReportsPerDay.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Daily Trends</h3>
          <div className="h-80">
            <Line data={dailyTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
          <div className="h-80">
            <Bar data={userActivityData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <div className="h-80">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="h-80">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Contributors (Admin Only) */}
      {isAdmin && analytics.topContributors.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reports
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topContributors.map((contributor, index) => (
                  <tr key={contributor._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contributor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contributor.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📈 Activity Trend</h4>
            <p className="text-blue-700 text-sm">
              {analytics.dailyTrends[analytics.dailyTrends.length - 1]?.total > analytics.dailyTrends[0]?.total 
                ? 'Report submissions are increasing over time' 
                : 'Report submissions are stable'}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Resolution Rate</h4>
            <p className="text-green-700 text-sm">
              {isAdmin 
                ? `${analytics.performanceMetrics.resolutionRate}% of reports are being resolved`
                : `${userAnalytics.userStats.resolutionRate}% of your reports have been resolved`
              }
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🎯 Most Common Issue</h4>
            <p className="text-yellow-700 text-sm">
              {analytics.categoryStats[0]?._id || 'No data'} is the most reported category
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">📊 Performance</h4>
            <p className="text-purple-700 text-sm">
              {isAdmin 
                ? `Average ${analytics.performanceMetrics.avgReportsPerDay.toFixed(1)} reports per day`
                : `You submit an average of ${userAnalytics.userStats.avgReportsPerDay.toFixed(1)} reports per day`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 