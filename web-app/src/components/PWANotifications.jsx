import React from 'react';
import { usePWA } from '../contexts/PWAContext';

export const InstallPrompt = () => {
  const { showInstallPrompt, installApp, dismissInstallPrompt } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-lg">📱</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">
            Install RashTrackr
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add to your home screen for quick access and offline use.
          </p>
        </div>
        <button
          onClick={dismissInstallPrompt}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex space-x-2">
        <button
          onClick={installApp}
          className="flex-1 bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Install
        </button>
        <button
          onClick={dismissInstallPrompt}
          className="flex-1 bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-3 z-50">
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          <span className="text-yellow-600">⚠️</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-yellow-800">
            You're offline. Some features may be limited.
          </p>
        </div>
      </div>
    </div>
  );
};

export const UpdateNotification = () => {
  const { swUpdateAvailable, updateApp } = usePWA();

  if (!swUpdateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-50 border border-blue-200 rounded-lg p-3 z-50">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="text-blue-600">🔄</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-blue-800">
            A new version is available.
          </p>
        </div>
        <button
          onClick={updateApp}
          className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export const PWANotifications = () => {
  return (
    <>
      <InstallPrompt />
      <OfflineIndicator />
      <UpdateNotification />
    </>
  );
}; 