import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportForm from '../ReportForm';

export default function AnonymousReport() {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-full sm:max-w-2xl">
        {submitted ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Thank you for your report!</h2>
            <p className="text-lg text-gray-700 mb-8">Your anonymous report has been submitted successfully.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Submit an Anonymous Report</h2>
            <ReportForm onSuccess={() => setSubmitted(true)} />
          </>
        )}
      </div>
    </div>
  );
} 