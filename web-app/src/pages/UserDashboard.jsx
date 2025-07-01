import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';
import ReportForm from '../ReportForm';
import ReportMap from '../components/ReportMap';
import NotificationCenter from '../components/NotificationCenter';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import GamificationDashboard from '../components/GamificationDashboard';
import CommunityDashboard from '../components/CommunityDashboard';
import MobileNavigation from '../components/MobileNavigation';

export default function UserDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const reportsLoaded = useRef(false);
  const statsLoaded = useRef(false);
  const fetchingReports = useRef(false);
  const fetchingStats = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async (force = false) => {
    if (fetchingReports.current || (reportsLoaded.current && !force)) return;
    try {
      fetchingReports.current = true;
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
      reportsLoaded.current = true;
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to load reports');
      }
    } finally {
      setLoading(false);
      fetchingReports.current = false;
    }
  };

  const fetchStats = async (force = false) => {
    if (fetchingStats.current || (statsLoaded.current && !force)) return;
    try {
      fetchingStats.current = true;
      const res = await api.get('/stats');
      setStats(res.data);
      statsLoaded.current = true;
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error('Failed to load stats:', err);
      }
    } finally {
      fetchingStats.current = false;
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('/notifications?unreadOnly=true');
      setUnreadNotifications(res.data.unreadCount || 0);
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error('Failed to fetch unread notifications:', err);
      }
    }
  };

  // Debounce refresh button
  const refreshTimeout = useRef(null);
  const handleRefresh = () => {
    if (refreshTimeout.current) return;
    setRefreshing(true);
    fetchReports(true);
    fetchStats(true);
    refreshTimeout.current = setTimeout(() => {
      setRefreshing(false);
      refreshTimeout.current = null;
    }, 2000);
  };

  useEffect(() => {
    fetchReports();
    fetchStats();
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !search || 
      report.description?.toLowerCase().includes(search.toLowerCase()) ||
      report.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesCategory = !categoryFilter || report.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const userReports = reports.filter(report => report.createdBy === user?.id);
  const userStats = {
    total: userReports.length,
    pending: userReports.filter(r => r.status === 'pending').length,
    inProgress: userReports.filter(r => r.status === 'in progress').length,
    resolved: userReports.filter(r => r.status === 'resolved').length,
  };

  const categories = Array.from(new Set(reports.map(r => r.category).filter(Boolean)));
  const statuses = ['pending', 'in progress', 'resolved'];

  const OverviewTab = () => (
    <div className="space-y-4 md:space-y-6">


      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-3 md:space-y-0">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome back, {user?.email}!</h2>
            <p className="text-green-100 text-sm md:text-base">Ready to make a difference in your community?</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all self-start"
            title="Refresh data"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : '🔄'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-xl md:text-2xl font-bold text-blue-600">{userStats.total}</div>
          <div className="text-xs md:text-sm text-gray-600">Your Reports</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-xl md:text-2xl font-bold text-yellow-600">{userStats.pending}</div>
          <div className="text-xs md:text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-xl md:text-2xl font-bold text-orange-600">{userStats.inProgress}</div>
          <div className="text-xs md:text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-xl md:text-2xl font-bold text-green-600">{userStats.resolved}</div>
          <div className="text-xs md:text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Global Stats */}
      {stats && (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Community Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.totalReports || 0}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</div>
              <div className="text-xs md:text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.resolvedReports || 0}</div>
              <div className="text-xs md:text-sm text-gray-600">Issues Resolved</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => setActiveTab('report')}
            className="bg-green-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">📝</span>
            New Report
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">🗺️</span>
            View Map
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className="bg-purple-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">📊</span>
            My Reports
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="bg-orange-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">👥</span>
            All Reports
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="bg-indigo-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">📈</span>
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('gamification')}
            className="bg-yellow-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">🏆</span>
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className="bg-pink-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <span className="mr-2">🤝</span>
            Community
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {userReports.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {userReports.slice(0, 3).map(report => (
              <div key={report._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base">{report.category}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{report.description?.substring(0, 50)}...</div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end space-y-1">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    report.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {report.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {userReports.length > 3 && (
            <button
              onClick={() => setActiveTab('my-reports')}
              className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all {userReports.length} reports →
            </button>
          )}
        </div>
      )}
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm md:text-base"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm md:text-base"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm md:text-base"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">All Reports</h3>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No reports found.</div>
          ) : (
            filteredReports.map(report => (
              <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{report.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        report.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.status}
                      </span>
                      {report.createdBy === user?.id && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Your Report
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{report.description || 'No description'}</p>
                    <div className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const MyReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Your Reports</h3>
          <button
            onClick={() => setActiveTab('report')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <span className="mr-2">📝</span>
            New Report
          </button>
        </div>
        
        {userReports.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-xl font-semibold mb-2">No reports yet</h4>
            <p className="text-gray-600 mb-6">Start making a difference by submitting your first report</p>
            <button
              onClick={() => setActiveTab('report')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userReports.map(report => (
              <div 
                key={report._id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800">{report.category}</span>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                      report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      report.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{report.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {report.imageUrl && (
                      <img 
                        src={report.imageUrl} 
                        alt="Report" 
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    <div className="text-sm text-gray-500">
                      📍 {report.location?.coordinates ? 
                        `${report.location.coordinates[1].toFixed(4)}, ${report.location.coordinates[0].toFixed(4)}` : 
                        'Location not available'
                      }
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ReportFormTab = () => (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Submit New Report</h3>
        <p className="text-gray-600 text-sm sm:text-base">Help keep your community clean by reporting environmental issues</p>
      </div>
      <ReportForm onSuccess={newReport => {
        setReports(prev => [newReport, ...prev]);
        setActiveTab('my-reports');
      }} />
    </div>
  );

  const MapTab = () => (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Reports Map</h3>
        <p className="text-gray-600 text-sm sm:text-base">View all community reports on an interactive map</p>
      </div>
      
      {reports.length === 0 ? (
        <div className="text-center text-gray-500 py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-4">🗺️</div>
          <h4 className="text-lg sm:text-xl font-semibold mb-2">No reports on map</h4>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Be the first to add a report to the community map</p>
          <button
            onClick={() => setActiveTab('report')}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Submit First Report
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-xs sm:text-sm text-blue-700">
              <span className="mr-2">💡</span>
              <span>Click on markers to view report details. {reports.length} reports found.</span>
            </div>
          </div>
          <div className="h-64 sm:h-96 border rounded-lg overflow-hidden">
            <ReportMap reports={reports} />
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', component: OverviewTab },
    { id: 'reports', name: 'All Reports', component: ReportsTab },
    { id: 'my-reports', name: 'My Reports', component: MyReportsTab },
    { id: 'report', name: 'New Report', component: ReportFormTab },
    { id: 'map', name: 'Map', component: MapTab },
    { id: 'analytics', name: 'Analytics', component: () => <AnalyticsDashboard isAdmin={false} /> },
    { id: 'gamification', name: 'Achievements', component: GamificationDashboard },
    { id: 'community', name: 'Community', component: CommunityDashboard },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || OverviewTab;

  return (
    <div className="min-h-screen bg-gray-50">

      
      {/* Header - Hidden on mobile */}
      <header className="hidden md:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">🌱 RashTrackr</div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Notifications"
              >
                <span className="text-lg sm:text-xl">🔔</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Profile"
              >
                <span className="text-lg sm:text-xl">👤</span>
              </button>
              <span className="text-xs sm:text-sm text-gray-600 hidden lg:block">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-4 md:py-8 md:pt-8 pt-20 pb-20">
        {/* Tabs - Hidden on mobile */}
        <div className="hidden md:block mb-4 md:mb-6">
          <nav className="flex flex-wrap space-x-4 md:space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 md:space-y-6">
          <ActiveComponent />
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation user={user} onLogout={handleLogout} />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => {
          setNotificationsOpen(false);
          fetchUnreadNotifications(); // Refresh count when closing
        }} 
      />

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="font-semibold text-gray-700 text-sm sm:text-base">Category:</label>
                <p className="text-gray-900 text-sm sm:text-base">{selectedReport.category}</p>
              </div>
              
              <div>
                <label className="font-semibold text-gray-700 text-sm sm:text-base">Description:</label>
                <p className="text-gray-900 text-sm sm:text-base">{selectedReport.description || 'No description'}</p>
              </div>
              
              <div>
                <label className="font-semibold text-gray-700 text-sm sm:text-base">Status:</label>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedReport.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  selectedReport.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedReport.status}
                </span>
              </div>
              
              <div>
                <label className="font-semibold text-gray-700 text-sm sm:text-base">Created:</label>
                <p className="text-gray-900 text-sm sm:text-base">{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
              
              {selectedReport.imageUrl && (
                <div>
                  <label className="font-semibold text-gray-700 text-sm sm:text-base">Image:</label>
                  <img 
                    src={selectedReport.imageUrl} 
                    alt="Report" 
                    className="mt-2 max-w-full h-auto rounded"
                  />
                </div>
              )}
              
              {selectedReport.location && selectedReport.location.coordinates && (
                <div>
                  <label className="font-semibold text-gray-700 text-sm sm:text-base">Location:</label>
                  <p className="text-gray-900 text-sm sm:text-base">
                    [{selectedReport.location.coordinates[1]}, {selectedReport.location.coordinates[0]}]
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}