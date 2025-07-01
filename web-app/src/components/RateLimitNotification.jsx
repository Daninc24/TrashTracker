import React, { useState, useEffect } from 'react';

export default function RateLimitNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Listen for 429 errors
    const handleRateLimit = () => {
      setShowNotification(true);
      setRetryCount(prev => prev + 1);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    };

    // Listen for fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 429) {
          handleRateLimit();
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-orange-50 border border-orange-200 rounded-lg p-3 z-50">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="text-orange-600">⏱️</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-orange-800">
            Too many requests. Please wait a moment...
          </p>
          {retryCount > 1 && (
            <p className="text-xs text-orange-600 mt-1">
              Retry attempt: {retryCount}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="text-orange-400 hover:text-orange-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 