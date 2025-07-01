import React, { useState, useContext } from 'react';
import ReportMap from '../components/ReportMap';
import NotificationCenter from '../components/NotificationCenter';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { AuthContext } from '../AuthContext';

function UsersTab() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updating, setUpdating] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [banningId, setBanningId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [bulkAction, setBulkAction] = React.useState('');
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [userStats, setUserStats] = React.useState(null);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [exportLoading, setExportLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    import('../api').then(api => {
      api.default.getUsers()
        .then(res => {
          if (mounted) {
            setUsers(res.data.users);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) {
            setError('Failed to load users');
            setLoading(false);
          }
        });
    });
    return () => { mounted = false; };
  }, []);

  const handleRoleChange = (id, newRole) => {
    setUpdating(id);
    import('../api').then(api => {
      api.default.updateUserRole(id, newRole)
        .then(res => {
          setUsers(users => users.map(u => u._id === id ? { ...u, role: newRole } : u));
        })
        .catch(() => {
          // Optionally show a toast or error
        })
        .finally(() => setUpdating(null));
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    import('../api').then(api => {
      api.default.deleteUser(id)
        .then(() => {
          setUsers(users => users.filter(u => u._id !== id));
        })
        .catch(() => {
          alert('Failed to delete user');
        })
        .finally(() => setDeletingId(null));
    });
  };

  const handleToggleStatus = (id) => {
    const user = users.find(u => u._id === id);
    const action = user.active ? 'ban' : 'unban';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    setBanningId(id);
    import('../api').then(api => {
      api.default.toggleUserStatus(id)
        .then(res => {
          setUsers(users => users.map(u => u._id === id ? { ...u, active: !u.active } : u));
          alert(res.data.message);
        })
        .catch(() => {
          alert(`Failed to ${action} user`);
        })
        .finally(() => setBanningId(null));
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    const action = bulkAction;
    const count = selectedUsers.length;
    
    if (!window.confirm(`Are you sure you want to ${action} ${count} user(s)?`)) return;
    
    setBulkLoading(true);
    import('../api').then(api => {
      let apiCall;
      
      switch (action) {
        case 'delete':
          apiCall = api.default.bulkDeleteUsers(selectedUsers);
          break;
        case 'make-admin':
          apiCall = api.default.bulkUpdateUserRoles(selectedUsers, 'admin');
          break;
        case 'make-user':
          apiCall = api.default.bulkUpdateUserRoles(selectedUsers, 'user');
          break;
        case 'ban':
          apiCall = api.default.bulkUpdateUserStatus(selectedUsers, false);
          break;
        case 'unban':
          apiCall = api.default.bulkUpdateUserStatus(selectedUsers, true);
          break;
        default:
          setBulkLoading(false);
          return;
      }
      
      apiCall
        .then(res => {
          alert(res.data.message);
          
          // Update local state based on action
          switch (action) {
            case 'delete':
              setUsers(users => users.filter(u => !selectedUsers.includes(u._id)));
              break;
            case 'make-admin':
            case 'make-user':
              const newRole = action === 'make-admin' ? 'admin' : 'user';
              setUsers(users => users.map(u => 
                selectedUsers.includes(u._id) ? { ...u, role: newRole } : u
              ));
              break;
            case 'ban':
            case 'unban':
              const newStatus = action === 'ban' ? false : true;
              setUsers(users => users.map(u => 
                selectedUsers.includes(u._id) ? { ...u, active: newStatus } : u
              ));
              break;
            default:
              // Handle any other actions if needed
              break;
          }
          
          setSelectedUsers([]);
          setBulkAction('');
        })
        .catch(() => {
          alert(`Failed to ${action} users`);
        })
        .finally(() => setBulkLoading(false));
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserStats(null);
    setStatsLoading(true);
    
    import('../api').then(api => {
      api.default.getUserStats(user._id)
        .then(res => {
          setUserStats(res.data);
        })
        .catch(() => {
          setUserStats({ error: 'Failed to load user statistics' });
        })
        .finally(() => setStatsLoading(false));
    });
  };

  const handleExport = () => {
    setExportLoading(true);
    
    const filters = {};
    if (roleFilter) filters.role = roleFilter;
    if (statusFilter) filters.active = statusFilter === 'active';
    if (search) filters.search = search;
    
    import('../api').then(api => {
      api.default.exportUsers(filters)
        .then(response => {
          // Create blob and download
          const blob = new Blob([response.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(() => {
          alert('Failed to export users');
        })
        .finally(() => setExportLoading(false));
    });
  };

  // Filter users based on search, role filter, and status filter
  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? u.active : !u.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <div className="text-blue-500">Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-1"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          {exportLoading ? 'Exporting...' : '📊 Export CSV'}
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-blue-800">
              {selectedUsers.length} user(s) selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Choose action...</option>
              <option value="delete">Delete Selected</option>
              <option value="make-admin">Make Admin</option>
              <option value="make-user">Make User</option>
              <option value="ban">Ban Selected</option>
              <option value="unban">Unban Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {bulkLoading ? 'Processing...' : 'Apply'}
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2 h-4 w-4"
                />
                Select All
              </th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr><td colSpan={6} className="p-2 text-gray-400">No users found.</td></tr>
            )}
            {filteredUsers.map(u => (
              <tr key={u._id} className={`border-b ${!u.active ? 'bg-red-50' : ''}`}>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    onChange={() => handleSelectUser(u._id)}
                    className="mr-2 h-4 w-4"
                  />
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u._id, e.target.value)}
                    disabled={updating === u._id}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  {updating === u._id && <span className="ml-2 text-xs text-blue-500">Updating...</span>}
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.active ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="p-2">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    onClick={() => handleViewUser(u)}
                  >
                    View
                  </button>
                  <button
                    className={`px-2 py-1 rounded text-xs ${
                      u.active 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}
                    onClick={() => handleToggleStatus(u._id)}
                    disabled={banningId === u._id}
                  >
                    {banningId === u._id ? 'Updating...' : (u.active ? 'Ban' : 'Unban')}
                  </button>
                  <button
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                    onClick={() => handleDelete(u._id)}
                    disabled={deletingId === u._id}
                  >
                    {deletingId === u._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setSelectedUser(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">User Details</h3>
            <UserProfileModalTabs user={selectedUser} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedReport, setSelectedReport] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const reportsLoaded = React.useRef(false);
  const fetchingReports = React.useRef(false);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const fetchReports = (force = false) => {
    if (fetchingReports.current || (reportsLoaded.current && !force)) return;
    setLoading(true);
    setError(null);
    fetchingReports.current = true;
    import('../api').then(api => {
      api.default.getReports()
        .then(res => {
          setReports(res.data.reports || res.data);
          setLoading(false);
          reportsLoaded.current = true;
        })
        .catch(() => {
          setError('Failed to load reports');
          setLoading(false);
        })
        .finally(() => {
          fetchingReports.current = false;
        });
    });
  };

  // Debounce refresh button
  const refreshTimeout = React.useRef(null);
  const handleRefresh = () => {
    if (refreshTimeout.current) return;
    setRefreshing(true);
    fetchReports(true);
    refreshTimeout.current = setTimeout(() => {
      setRefreshing(false);
      refreshTimeout.current = null;
    }, 2000);
  };

  // Get unique categories and statuses for filter dropdowns
  const categories = Array.from(new Set(reports.map(r => r.category).filter(Boolean)));
  const statuses = Array.from(new Set(reports.map(r => r.status).filter(Boolean)));

  // Filter and search logic
  const filteredReports = reports.filter(r => {
    return (
      (!statusFilter || r.status === statusFilter) &&
      (!categoryFilter || r.category === categoryFilter) &&
      (!search ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(search.toLowerCase()))
      )
    );
  });

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    setDeletingId(id);
    import('../api').then(api => {
      api.default.deleteReport(id)
        .then(() => {
          setReports(reports => reports.filter(r => r._id !== id));
        })
        .catch(() => {
          alert('Failed to delete report');
        })
        .finally(() => setDeletingId(null));
    });
  };

  const handleStatusChange = (id, newStatus) => {
    import('../api').then(api => {
      api.default.updateReportStatus(id, newStatus)
        .then(res => {
          setReports(reports => reports.map(r => r._id === id ? { ...r, status: newStatus } : r));
        })
        .catch(() => {
          alert('Failed to update status');
        });
    });
  };

  if (loading) return <div className="text-blue-500">Loading reports...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search description or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 && (
              <tr><td colSpan={5} className="p-2 text-gray-400">No reports found.</td></tr>
            )}
            {filteredReports.map(r => (
              <tr key={r._id} className="border-b">
                <td className="p-2">{r.category}</td>
                <td className="p-2">{r.description || 'No description'}</td>
                <td className="p-2">
                  <select
                    value={r.status}
                    onChange={e => handleStatusChange(r._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">pending</option>
                    <option value="in progress">in progress</option>
                    <option value="resolved">resolved</option>
                  </select>
                </td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    onClick={() => setSelectedReport(r)}
                  >
                    View
                  </button>
                  <button
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                    onClick={() => handleDelete(r._id)}
                    disabled={deletingId === r._id}
                  >
                    {deletingId === r._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for viewing report details */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setSelectedReport(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">Report Details</h3>
            <div className="mb-2"><b>Category:</b> {selectedReport.category}</div>
            <div className="mb-2"><b>Description:</b> {selectedReport.description || 'No description'}</div>
            <div className="mb-2"><b>Status:</b> {selectedReport.status}</div>
            <div className="mb-2"><b>Created:</b> {new Date(selectedReport.createdAt).toLocaleString()}</div>
            {selectedReport.imageUrl && (
              <div className="mb-2"><b>Image:</b><br /><img src={selectedReport.imageUrl} alt="Report" className="max-w-full max-h-48 mt-1 rounded" /></div>
            )}
            {selectedReport.location && selectedReport.location.coordinates && (
              <div className="mb-2"><b>Location:</b> [{selectedReport.location.coordinates[1]}, {selectedReport.location.coordinates[0]}]</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOverviewTab({ onNavigateTab }) {
  const [overview, setOverview] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    import('../api').then(api => {
      api.default.get('/admin/overview')
        .then(res => {
          setOverview(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load admin overview');
          setLoading(false);
        });
    });
  }, []);

  if (loading) return <div className="mb-8 text-blue-500">Loading overview...</div>;
  if (error) return <div className="mb-8 text-red-500">{error}</div>;

  const { userStats, reportStats, recentActivity } = overview || {};

  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Total Users</div>
          <div className="text-2xl font-bold">{userStats?.total ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Active Users (7d)</div>
          <div className="text-2xl font-bold">{userStats?.active ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">New Users (7d)</div>
          <div className="text-2xl font-bold">{userStats?.new ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Total Reports</div>
          <div className="text-2xl font-bold">{reportStats?.total ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Pending Reports</div>
          <div className="text-2xl font-bold">{reportStats?.pending ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">In Progress</div>
          <div className="text-2xl font-bold">{reportStats?.inProgress ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Resolved</div>
          <div className="text-2xl font-bold">{reportStats?.resolved ?? '--'}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Flagged</div>
          <div className="text-2xl font-bold">{reportStats?.flagged ?? '--'}</div>
        </div>
      </div>
      {/* Quick Links */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => onNavigateTab?.(1)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">User Management</button>
        <button onClick={() => onNavigateTab?.(2)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Report Management</button>
        <button onClick={() => onNavigateTab?.(4)} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Analytics</button>
      </div>
      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <div className="text-lg font-semibold mb-2">Recent Users</div>
          <ul className="text-sm divide-y">
            {recentActivity?.users?.map(u => (
              <li key={u._id} className="py-1 flex flex-col">
                <span className="font-medium">{u.name || u.email}</span>
                <span className="text-gray-500">{u.email}</span>
                <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleString()}</span>
                <span className="text-xs text-blue-600">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-lg font-semibold mb-2">Recent Reports</div>
          <ul className="text-sm divide-y">
            {recentActivity?.reports?.map(r => (
              <li key={r._id} className="py-1 flex flex-col">
                <span className="font-medium">{r.category}</span>
                <span className="text-xs text-gray-500">{r.status}</span>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                {r.flagged && <span className="text-xs text-red-600 font-bold">Flagged</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-lg font-semibold mb-2">Recent Admin Actions</div>
          <ul className="text-sm divide-y">
            {recentActivity?.audit?.map(a => (
              <li key={a._id || a.timestamp} className="py-1 flex flex-col">
                <span className="font-medium">{a.action}</span>
                <span className="text-xs text-gray-500">{a.userEmail}</span>
                <span className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</span>
                <span className="text-xs text-blue-600">{a.resource}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function UserProfileModalTabs({ user }) {
  const [tab, setTab] = React.useState('profile');
  const [profile, setProfile] = React.useState(null);
  const [reports, setReports] = React.useState([]);
  const [auditLogs, setAuditLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    import('../api').then(api => {
      api.default.getAdminUserProfile(user._id)
        .then(res => {
          setProfile(res.data.user);
          setReports(res.data.reports);
          setAuditLogs(res.data.auditLogs);
        })
        .catch(() => setError('Failed to load user details'))
        .finally(() => setLoading(false));
    });
  }, [user._id]);

  const handleExportGDPR = () => {
    setExporting(true);
    setExportError(null);
    import('../api').then(api => {
      api.default.exportAdminUserData(user._id)
        .then(res => {
          const data = JSON.stringify(res.data, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `user-gdpr-${user._id}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(() => setExportError('Failed to export user data'))
        .finally(() => setExporting(false));
    });
  };

  if (loading) return <div className="text-blue-500">Loading user details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex gap-4 border-b mb-4">
        <button className={`py-2 px-4 ${tab === 'profile' ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`py-2 px-4 ${tab === 'reports' ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setTab('reports')}>Reports</button>
        <button className={`py-2 px-4 ${tab === 'audit' ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setTab('audit')}>Audit Logs</button>
        <button className={`py-2 px-4 ${tab === 'gdpr' ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setTab('gdpr')}>GDPR Export</button>
      </div>
      {tab === 'profile' && profile && (
        <div className="space-y-2">
          <div><b>Email:</b> {profile.email || 'N/A'}</div>
          <div><b>Name:</b> {profile.name || profile.displayName || profile.email || 'N/A'}</div>
          <div><b>Role:</b> {profile.role || 'N/A'}</div>
          <div><b>Status:</b> <span className={`ml-2 px-2 py-1 rounded text-xs ${profile.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{profile.active ? 'Active' : 'Banned'}</span></div>
          <div><b>Created:</b> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}</div>
          <div><b>User ID:</b> {profile._id || 'N/A'}</div>
          {/* Add more fields as needed (gamification, community, etc.) */}
        </div>
      )}
      {tab === 'reports' && (
        <div>
          <h4 className="font-semibold mb-2">Recent Reports</h4>
          {reports.length === 0 ? <div className="text-gray-500">No reports found.</div> : (
            <ul className="space-y-2">
              {reports.map(r => (
                <li key={r._id} className="border rounded p-2">
                  <div><b>Category:</b> {r.category}</div>
                  <div><b>Status:</b> {r.status}</div>
                  <div><b>Date:</b> {new Date(r.createdAt).toLocaleString()}</div>
                  <div><b>Description:</b> {r.description || 'N/A'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'audit' && (
        <div>
          <h4 className="font-semibold mb-2">Recent Audit Logs</h4>
          {auditLogs.length === 0 ? <div className="text-gray-500">No audit logs found.</div> : (
            <ul className="space-y-2">
              {auditLogs.map(log => (
                <li key={log._id} className="border rounded p-2">
                  <div><b>Action:</b> {log.action}</div>
                  <div><b>Resource:</b> {log.resource}</div>
                  <div><b>Date:</b> {new Date(log.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'gdpr' && (
        <div>
          <h4 className="font-semibold mb-2">Export User Data (GDPR)</h4>
          <button
            onClick={handleExportGDPR}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export User Data'}
          </button>
          {exportError && <div className="text-red-500 mt-2">{exportError}</div>}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { name: 'Dashboard', component: (props) => <AdminOverviewTab {...props} /> },
  { name: 'Users', component: UsersTab },
  { name: 'Reports', component: ReportsTab },
  { name: 'Map', component: ReportMap },
  { name: 'Analytics', component: () => <AnalyticsDashboard isAdmin={true} /> },
];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count on mount
  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await import('../api').then(api => 
          api.default.getNotifications({ unreadOnly: true, limit: 1 })
        );
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!user || user.role !== 'admin') {
    return <div className="text-red-500 font-bold text-center mt-10">Access denied. Admins only.</div>;
  }

  const TabComponent = TABS[tab].component;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow h-screen p-6 hidden md:block">
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-bold">Admin</div>
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-800"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {TABS.map((t, i) => (
            <button
              key={t.name}
              className={`text-left px-4 py-2 rounded transition font-medium ${tab === i ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setTab(i)}
            >
              {t.name}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {TABS.map((t, i) => (
              <button
                key={t.name}
                className={`px-3 py-1 rounded ${tab === i ? 'bg-blue-100 text-blue-700' : 'bg-white border'}`}
                onClick={() => setTab(i)}
              >
                {t.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-800"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
        <TabComponent onNavigateTab={setTab} />
      </main>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
} 