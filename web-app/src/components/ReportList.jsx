import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { useToast } from './ToastContext';

export default function ReportList({ 
  reports, 
  loading, 
  error, 
  onRefresh,
  showFilters = true,
  showActions = true,
  maxHeight = 'none'
}) {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [filteredReports, setFilteredReports] = useState(reports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedReports, setLikedReports] = useState(new Set());

  useEffect(() => {
    setFilteredReports(reports);
  }, [reports]);

  useEffect(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        report.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  const handleLike = async (reportId) => {
    try {
      const response = await api.put(`/reports/${reportId}/like`);
      const newLikedReports = new Set(likedReports);
      
      if (response.data.isLiked) {
        newLikedReports.add(reportId);
      } else {
        newLikedReports.delete(reportId);
      }
      
      setLikedReports(newLikedReports);
      
      // Update the report in the list
      const updatedReports = reports.map(report => 
        report._id === reportId 
          ? { ...report, likes: response.data.likes }
          : report
      );
      onRefresh(updatedReports);
    } catch (err) {
      showToast('Failed to update like', 'error');
    }
  };

  const handleShare = async (reportId) => {
    try {
      await api.put(`/reports/${reportId}/share`);
      showToast('Report shared successfully!', 'success');
      
      // Update the report in the list
      const updatedReports = reports.map(report => 
        report._id === reportId 
          ? { ...report, shares: report.shares + 1 }
          : report
      );
      onRefresh(updatedReports);
    } catch (err) {
      showToast('Failed to share report', 'error');
    }
  };

  const handleComment = async (reportId) => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await api.post(`/reports/${reportId}/comments`, {
        text: commentText.trim()
      });
      
      setCommentText('');
      setSelectedReport(null);
      showToast('Comment added successfully!', 'success');
      
      // Update the report in the list
      const updatedReports = reports.map(report => 
        report._id === reportId 
          ? { ...report, comments: response.data.comments }
          : report
      );
      onRefresh(updatedReports);
    } catch (err) {
      showToast('Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'duplicate': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-500',
      'medium': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    };
    return colors[priority] || 'text-blue-500';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'minor': 'text-green-500',
      'moderate': 'text-yellow-500',
      'major': 'text-orange-500',
      'critical': 'text-red-500'
    };
    return colors[severity] || 'text-yellow-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-20">
        <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></span>
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
          onClick={onRefresh}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const categories = Array.from(new Set(reports.map(r => r.category).filter(Boolean)));
  const statuses = ['pending', 'in_progress', 'resolved', 'rejected', 'duplicate'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 shadow-sm border space-y-4">
          <h3 className="font-semibold text-gray-800">Filters & Search</h3>
          
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Date Updated</option>
                <option value="priority">Priority</option>
                <option value="severity">Severity</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="desc"
                checked={sortOrder === 'desc'}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mr-2"
              />
              Newest First
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="asc"
                checked={sortOrder === 'asc'}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mr-2"
              />
              Oldest First
            </label>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredReports.length} of {reports.length} reports
      </div>

      {/* Reports List */}
      <div className={`space-y-4 ${maxHeight !== 'none' ? `max-h-${maxHeight} overflow-y-auto` : ''}`}>
        {filteredReports.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
            <p className="text-gray-500">No reports found matching your criteria.</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{report.category}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className={getPriorityColor(report.priority)}>
                        Priority: {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                      </span>
                      <span className={getSeverityColor(report.severity)}>
                        Severity: {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                      </span>
                      <span>📍 {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}</span>
                    </div>
                  </div>
                  
                  {showActions && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike(report._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          likedReports.has(report._id) || report.likes?.includes(user?.id)
                            ? 'text-red-500 bg-red-50'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title="Like"
                      >
                        ❤️ {report.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => handleShare(report._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Share"
                      >
                        📤 {report.shares || 0}
                      </button>
                      <button
                        onClick={() => setSelectedReport(selectedReport === report._id ? null : report._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
                        title="View Details"
                      >
                        {selectedReport === report._id ? '📖' : '👁️'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-3">{report.description}</p>

                {/* Tags */}
                {report.tags && report.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {report.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Image */}
                {report.imageUrl && (
                  <div className="mb-3">
                    <img 
                      src={report.imageUrl} 
                      alt="Report" 
                      className="max-w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  {report.address && (
                    <div>
                      <span className="font-medium">Address:</span> {report.address}
                    </div>
                  )}
                  {report.estimatedCleanupTime && (
                    <div>
                      <span className="font-medium">Est. Time:</span> {report.estimatedCleanupTime} min
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Views:</span> {report.views || 0}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(report.createdAt)}
                  </div>
                </div>

                {/* Comments Section */}
                {selectedReport === report._id && (
                  <div className="border-t pt-3 mt-3">
                    <h4 className="font-medium text-gray-800 mb-2">Comments ({report.comments?.length || 0})</h4>
                    
                    {/* Comments List */}
                    {report.comments && report.comments.length > 0 && (
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {report.comments.map(comment => (
                          <div key={comment._id} className="bg-gray-50 p-2 rounded">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-700">
                                {comment.user?.profile?.firstName || comment.user?.email || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(report._id)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={submittingComment}
                      />
                      <button
                        onClick={() => handleComment(report._id)}
                        disabled={!commentText.trim() || submittingComment}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {submittingComment ? '...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 