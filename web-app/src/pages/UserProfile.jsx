import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { useToast } from '../components/ToastContext';

export default function UserProfile() {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      setUserData(res.data);
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    try {
      setSaving(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        await api.put('/user/avatar', { avatar: base64 });
        setUserData(prev => ({
          ...prev,
          profile: { ...prev.profile, avatar: base64 }
        }));
        setAvatarFile(null);
        setAvatarPreview(null);
        showToast('Avatar updated successfully', 'success');
      };
      reader.readAsDataURL(avatarFile);
    } catch (err) {
      showToast('Failed to update avatar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={avatarPreview || userData?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.profile?.fullName || userData?.email)}&size=128&background=random`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
            <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              📷
            </label>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              Upload a profile picture to personalize your account
            </p>
            {avatarFile && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Selected: {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button
                  onClick={handleAvatarUpload}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Uploading...' : 'Upload Avatar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <ProfileForm userData={userData} onUpdate={fetchUserProfile} />
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        <AccountSettings userData={userData} onUpdate={fetchUserProfile} />
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <PasswordChange />
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // Handle account deletion
                showToast('Account deletion not implemented yet', 'warning');
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
      <NotificationSettings userData={userData} onUpdate={fetchUserProfile} />
    </div>
  );

  const PrivacyTab = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
      <PrivacySettings userData={userData} onUpdate={fetchUserProfile} />
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
        {userData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userData.stats.level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userData.stats.totalPoints}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userData.stats.totalReports}</div>
              <div className="text-sm text-gray-600">Reports</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{userData.stats.resolvedReports}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      {userData?.stats?.badges && userData.stats.badges.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userData.stats.badges.map((badge, index) => (
              <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'profile', name: 'Profile', component: ProfileTab },
    { id: 'settings', name: 'Settings', component: SettingsTab },
    { id: 'notifications', name: 'Notifications', component: NotificationsTab },
    { id: 'privacy', name: 'Privacy', component: PrivacyTab },
    { id: 'stats', name: 'Statistics', component: StatsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileTab;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">🌱 RashTrackr</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                <span className="mr-1">←</span>
                Back to Dashboard
              </button>
              <span className="text-sm text-gray-600">Profile Settings</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
        <ActiveComponent />
      </main>
    </div>
  );
}

// Profile Form Component
function ProfileForm({ userData, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Update form data when userData changes
  useEffect(() => {
    if (userData?.profile) {
      const newFormData = {
        firstName: userData.profile.firstName || '',
        lastName: userData.profile.lastName || '',
        displayName: userData.profile.displayName || '',
        bio: userData.profile.bio || '',
        location: userData.profile.location || '',
        phone: userData.profile.phone || '',
        website: userData.profile.website || '',
      };
      setFormData(newFormData);
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/user/profile', formData);
      showToast('Profile updated successfully', 'success');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Tell us about yourself..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="https://example.com"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

// Account Settings Component
function AccountSettings({ userData, onUpdate }) {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Update settings when userData changes
  useEffect(() => {
    if (userData?.settings) {
      setSettings({
        theme: userData.settings.theme || 'light',
        language: userData.settings.language || 'en',
        timezone: userData.settings.timezone || 'UTC',
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/settings', { settings });
      showToast('Settings updated successfully', 'success');
      onUpdate();
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <select
          value={settings.language}
          onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}

// Password Change Component
function PasswordChange() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast('Password changed successfully', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
        <input
          type="password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
          minLength="6"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
        <input
          type="password"
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
}

// Notification Settings Component
function NotificationSettings({ userData, onUpdate }) {
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      reportUpdates: true,
      communityUpdates: true,
      achievements: true,
    },
    push: {
      enabled: true,
      reportUpdates: true,
      communityUpdates: true,
      achievements: true,
    },
    inApp: {
      enabled: true,
      reportUpdates: true,
      communityUpdates: true,
      achievements: true,
    },
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Update notifications when userData changes
  useEffect(() => {
    if (userData?.notifications) {
      setNotifications({
        email: {
          enabled: userData.notifications.email?.enabled ?? true,
          reportUpdates: userData.notifications.email?.reportUpdates ?? true,
          communityUpdates: userData.notifications.email?.communityUpdates ?? true,
          achievements: userData.notifications.email?.achievements ?? true,
        },
        push: {
          enabled: userData.notifications.push?.enabled ?? true,
          reportUpdates: userData.notifications.push?.reportUpdates ?? true,
          communityUpdates: userData.notifications.push?.communityUpdates ?? true,
          achievements: userData.notifications.push?.achievements ?? true,
        },
        inApp: {
          enabled: userData.notifications.inApp?.enabled ?? true,
          reportUpdates: userData.notifications.inApp?.reportUpdates ?? true,
          communityUpdates: userData.notifications.inApp?.communityUpdates ?? true,
          achievements: userData.notifications.inApp?.achievements ?? true,
        },
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/notifications', { notifications });
      showToast('Notification preferences updated successfully', 'success');
      onUpdate();
    } catch (err) {
      showToast('Failed to update notification preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Notifications */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.email.enabled}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                email: { ...prev.email, enabled: e.target.checked }
              }))}
              className="mr-3"
            />
            Enable email notifications
          </label>
          {notifications.email.enabled && (
            <div className="ml-6 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.email.reportUpdates}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    email: { ...prev.email, reportUpdates: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Report updates
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.email.communityUpdates}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    email: { ...prev.email, communityUpdates: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Community updates
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.email.achievements}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    email: { ...prev.email, achievements: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Achievements
              </label>
            </div>
          )}
        </div>
      </div>
      {/* Push Notifications */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Push Notifications</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.push.enabled}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                push: { ...prev.push, enabled: e.target.checked }
              }))}
              className="mr-3"
            />
            Enable push notifications
          </label>
          {notifications.push.enabled && (
            <div className="ml-6 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.push.reportUpdates}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    push: { ...prev.push, reportUpdates: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Report updates
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.push.communityUpdates}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    push: { ...prev.push, communityUpdates: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Community updates
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.push.achievements}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    push: { ...prev.push, achievements: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Achievements
              </label>
            </div>
          )}
        </div>
      </div>
      {/* In-App Notifications */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">In-App Notifications</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.inApp.enabled}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                inApp: { ...prev.inApp, enabled: e.target.checked }
              }))}
              className="mr-3"
            />
            Enable in-app notifications
          </label>
          {notifications.inApp.enabled && (
            <div className="ml-6 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.inApp.reportUpdates}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    inApp: { ...prev.inApp, reportUpdates: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Report updates
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.inApp.communityUpdates}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    inApp: { ...prev.inApp, communityUpdates: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Community updates
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.inApp.achievements}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    inApp: { ...prev.inApp, achievements: e.target.checked }
                  }))}
                  className="mr-3"
                />
                Achievements
              </label>
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}

// Privacy Settings Component
function PrivacySettings({ userData, onUpdate }) {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    showJoinDate: true,
    allowMessages: true,
    dataSharing: true,
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Update privacy settings when userData changes
  useEffect(() => {
    if (userData?.privacy) {
      setPrivacy({
        profileVisibility: userData.privacy.profileVisibility || 'public',
        showEmail: userData.privacy.showEmail ?? false,
        showLocation: userData.privacy.showLocation ?? true,
        showJoinDate: userData.privacy.showJoinDate ?? true,
        allowMessages: userData.privacy.allowMessages ?? true,
        dataSharing: userData.privacy.dataSharing ?? true,
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/privacy', { privacy });
      showToast('Privacy settings updated successfully', 'success');
      onUpdate();
    } catch (err) {
      showToast('Failed to update privacy settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
        <select
          value={privacy.profileVisibility}
          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="public">Public - Anyone can see your profile</option>
          <option value="private">Private - Only you can see your profile</option>
          <option value="friends">Friends - Only friends can see your profile</option>
        </select>
      </div>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Profile Information</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={(e) => setPrivacy(prev => ({ ...prev, showEmail: e.target.checked }))}
              className="mr-3"
            />
            Show email address on profile
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.showLocation}
              onChange={(e) => setPrivacy(prev => ({ ...prev, showLocation: e.target.checked }))}
              className="mr-3"
            />
            Show location on profile
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.showJoinDate}
              onChange={(e) => setPrivacy(prev => ({ ...prev, showJoinDate: e.target.checked }))}
              className="mr-3"
            />
            Show join date on profile
          </label>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Communication</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.allowMessages}
              onChange={(e) => setPrivacy(prev => ({ ...prev, allowMessages: e.target.checked }))}
              className="mr-3"
            />
            Allow other users to send me messages
          </label>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Data & Analytics</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.dataSharing}
              onChange={(e) => setPrivacy(prev => ({ ...prev, dataSharing: e.target.checked }))}
              className="mr-3"
            />
            Allow data sharing for analytics and improvements
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Privacy Settings'}
      </button>
    </form>
  );
}
