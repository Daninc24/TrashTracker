import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePWA } from '../contexts/PWAContext';

export default function MobileNavigation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = usePWA();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/dashboard',
      show: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📝',
      path: '/dashboard?tab=reports',
      show: true
    },
    {
      id: 'map',
      label: 'Map',
      icon: '🗺️',
      path: '/dashboard?tab=map',
      show: true
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      path: '/dashboard?tab=gamification',
      show: true
    },
    {
      id: 'community',
      label: 'Community',
      icon: '🤝',
      path: '/dashboard?tab=community',
      show: true
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive(item.path) 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-green-600'
              } transition-colors`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold text-green-600">🌱 RashTrackr</div>
            {!isOnline && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 truncate max-w-32">
              {user?.email}
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-16 right-0 w-64 bg-white shadow-lg border-l border-gray-200">
            <div className="p-4">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                <div className="text-xs text-gray-500">User</div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('/dashboard?tab=reports')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>📝</span>
                  <span>Reports</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('/dashboard?tab=map')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>🗺️</span>
                  <span>Map</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('/dashboard?tab=analytics')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>📊</span>
                  <span>Analytics</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('/dashboard?tab=gamification')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>🏆</span>
                  <span>Achievements</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('/dashboard?tab=community')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                >
                  <span>🤝</span>
                  <span>Community</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center space-x-3"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content Padding */}
      <div className="md:hidden h-16"></div> {/* Top padding */}
      <div className="md:hidden h-16"></div> {/* Bottom padding */}
    </>
  );
} 