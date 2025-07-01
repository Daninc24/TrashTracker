import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from './ToastContext';

export default function CommunityDashboard() {
  const [teams, setTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [socialConnections, setSocialConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const { showToast } = useToast();

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    tagline: '',
    isPublic: true,
    allowJoinRequests: true,
    requireApproval: true,
    maxMembers: 50
  });

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    type: 'weekly',
    category: 'reports',
    target: 10,
    metric: 'reports',
    reward: { points: 100, experience: 50 },
    startDate: '',
    endDate: '',
    maxParticipants: 100,
    requirements: { minLevel: 1 },
    tags: []
  });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const [teamsRes, challengesRes, socialRes] = await Promise.all([
        api.get('/community/teams'),
        api.get('/community/challenges'),
        api.get('/community/social-connections')
      ]);

      setTeams(teamsRes.data.teams || []);
      setChallenges(challengesRes.data.challenges || []);
      setSocialConnections(socialRes.data);
    } catch (error) {
      console.error('Error loading community data:', error);
      showToast('Failed to load community data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/community/teams', teamForm);
      showToast('Team created successfully!', 'success');
      setShowCreateTeam(false);
      setTeamForm({
        name: '',
        description: '',
        tagline: '',
        isPublic: true,
        allowJoinRequests: true,
        requireApproval: true,
        maxMembers: 50
      });
      loadCommunityData();
    } catch (error) {
      console.error('Error creating team:', error);
      showToast(error.response?.data?.error || 'Failed to create team', 'error');
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      await api.post('/community/challenges', challengeForm);
      showToast('Challenge created successfully!', 'success');
      setShowCreateChallenge(false);
      setChallengeForm({
        title: '',
        description: '',
        type: 'weekly',
        category: 'reports',
        target: 10,
        metric: 'reports',
        reward: { points: 100, experience: 50 },
        startDate: '',
        endDate: '',
        maxParticipants: 100,
        requirements: { minLevel: 1 },
        tags: []
      });
      loadCommunityData();
    } catch (error) {
      console.error('Error creating challenge:', error);
      showToast(error.response?.data?.error || 'Failed to create challenge', 'error');
    }
  };

  const handleJoinTeam = async (teamId, message = '') => {
    try {
      await api.post(`/community/teams/${teamId}/join`, { message });
      showToast('Join request sent successfully!', 'success');
      loadCommunityData();
    } catch (error) {
      console.error('Error joining team:', error);
      showToast(error.response?.data?.error || 'Failed to join team', 'error');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`/community/challenges/${challengeId}/join`);
      showToast('Successfully joined challenge!', 'success');
      loadCommunityData();
    } catch (error) {
      console.error('Error joining challenge:', error);
      showToast(error.response?.data?.error || 'Failed to join challenge', 'error');
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      await api.post(`/community/users/${userId}/follow`);
      showToast('Successfully followed user!', 'success');
      loadCommunityData();
    } catch (error) {
      console.error('Error following user:', error);
      showToast(error.response?.data?.error || 'Failed to follow user', 'error');
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await api.post(`/community/users/${userId}/friend-request`);
      showToast('Friend request sent!', 'success');
      loadCommunityData();
    } catch (error) {
      console.error('Error sending friend request:', error);
      showToast(error.response?.data?.error || 'Failed to send friend request', 'error');
    }
  };

  const handleRespondToFriendRequest = async (requestId, action) => {
    try {
      await api.put(`/community/friend-requests/${requestId}`, { action });
      showToast(`Friend request ${action}ed!`, 'success');
      loadCommunityData();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      showToast(error.response?.data?.error || 'Failed to respond to friend request', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-2 px-4 font-medium rounded-t-lg transition-colors ${
              activeTab === 'teams' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-2 px-4 font-medium rounded-t-lg transition-colors ${
              activeTab === 'challenges' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`py-2 px-4 font-medium rounded-t-lg transition-colors ${
              activeTab === 'social' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Social
          </button>
        </div>
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Community Teams</h2>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Team
            </button>
          </div>

          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team._id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.tagline}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{team.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{team.members.length} members</span>
                    <span>Level {team.stats.level}</span>
                  </div>
                  
                  <button
                    onClick={() => handleJoinTeam(team._id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Join Team
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🤝</div>
              <p>No teams available. Be the first to create one!</p>
            </div>
          )}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Community Challenges</h2>
            <button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Challenge
            </button>
          </div>

          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge._id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                      challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {challenge.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div>Target: {challenge.target} {challenge.metric}</div>
                    <div>Reward: {challenge.reward.points} points</div>
                    <div>Participants: {challenge.currentParticipants}/{challenge.maxParticipants || '∞'}</div>
                  </div>
                  
                  {challenge.status === 'active' && (
                    <button
                      onClick={() => handleJoinChallenge(challenge._id)}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏆</div>
              <p>No challenges available. Be the first to create one!</p>
            </div>
          )}
        </div>
      )}

      {/* Social Tab */}
      {activeTab === 'social' && socialConnections && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Social Connections</h2>
          
          {/* Friend Requests */}
          {socialConnections.friendRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Friend Requests</h3>
              <div className="space-y-3">
                {socialConnections.friendRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {request.from.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{request.from.username}</div>
                        <div className="text-sm text-gray-600">Level {request.from.stats?.level || 1}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespondToFriendRequest(request._id, 'accept')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondToFriendRequest(request._id, 'reject')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Friends ({socialConnections.friends.length})</h3>
            {socialConnections.friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialConnections.friends.map((friend) => (
                  <div key={friend._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{friend.username}</div>
                      <div className="text-sm text-gray-600">Level {friend.stats?.level || 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No friends yet. Start connecting with other users!</p>
              </div>
            )}
          </div>

          {/* Followers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Followers ({socialConnections.followers.length})</h3>
            {socialConnections.followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialConnections.followers.map((follower) => (
                  <div key={follower._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {follower.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{follower.username}</div>
                      <div className="text-sm text-gray-600">Level {follower.stats?.level || 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No followers yet. Keep reporting to gain followers!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={teamForm.tagline}
                  onChange={(e) => setTeamForm({...teamForm, tagline: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create Challenge</h3>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={challengeForm.title}
                  onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={challengeForm.type}
                    onChange={(e) => setChallengeForm({...challengeForm, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <input
                    type="number"
                    value={challengeForm.target}
                    onChange={(e) => setChallengeForm({...challengeForm, target: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Challenge
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateChallenge(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 