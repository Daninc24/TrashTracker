import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from './ToastContext';

export default function GamificationDashboard() {
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState('points');
  const { showToast } = useToast();
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGamificationData();
  }, [leaderboardType]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progressRes, achievementsRes, leaderboardRes, globalStatsRes] = await Promise.all([
        api.get('/gamification/progress'),
        api.get('/gamification/achievements/user'),
        api.get(`/gamification/leaderboard?type=${leaderboardType}`),
        api.get('/gamification/stats/global')
      ]);

      setProgress(progressRes.data);
      setAchievements(achievementsRes.data);
      setLeaderboard(leaderboardRes.data);
      setGlobalStats(globalStatsRes.data);
    } catch (error) {
      setError(
        error.response?.status === 401 || error.response?.status === 403
          ? 'You are not authorized to view achievements. Please log in.'
          : 'Failed to load gamification data. Please try again.'
      );
      showToast('Failed to load gamification data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 25) return 'text-purple-600';
    if (level >= 15) return 'text-red-600';
    if (level >= 10) return 'text-orange-600';
    if (level >= 5) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '💎';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '📝';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        {error && (
          <div className="text-red-500 text-center mb-2">{error}</div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <button
          onClick={loadGamificationData}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {progress && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className={`text-3xl font-bold ${getLevelColor(progress.level)}`}>
                {progress.level}
              </div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {progress.totalPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {progress.streak} {getStreakEmoji(progress.streak)}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {progress.achievements}
              </div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>

          {/* Experience Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Experience: {progress.experience} / {progress.experienceToNext}</span>
              <span>{progress.progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-800">{progress.totalReports}</div>
              <div className="text-gray-600">Reports</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">{progress.resolvedReports}</div>
              <div className="text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">{progress.longestStreak}</div>
              <div className="text-gray-600">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">{progress.achievements}/{progress.totalAchievements}</div>
              <div className="text-gray-600">Achievements</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Achievements</h2>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-green-600 mt-1">+{achievement.points} points</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏆</div>
            <p>No achievements unlocked yet. Keep reporting to earn achievements!</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
          <select 
            value={leaderboardType} 
            onChange={(e) => setLeaderboardType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="points">Points</option>
            <option value="reports">Reports</option>
            <option value="streak">Streak</option>
            <option value="level">Level</option>
          </select>
        </div>
        
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{entry.user.username}</div>
                  <div className="text-sm text-gray-600">Level {entry.stats.level}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {leaderboardType === 'points' && `${entry.stats.totalPoints.toLocaleString()} pts`}
                    {leaderboardType === 'reports' && `${entry.stats.totalReports} reports`}
                    {leaderboardType === 'streak' && `${entry.stats.longestStreak} days`}
                    {leaderboardType === 'level' && `Level ${entry.stats.level}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No leaderboard data available</p>
          </div>
        )}
      </div>

      {/* Global Stats */}
      {globalStats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{globalStats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{globalStats.totalReports.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{globalStats.totalResolved.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(globalStats.avgLevel)}</div>
              <div className="text-sm text-gray-600">Avg Level</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 