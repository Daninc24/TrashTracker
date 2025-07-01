import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-green-700 mb-4">About RashTrackr</h1>
        <p className="text-lg text-gray-700 mb-4">
          RashTrackr is a community-driven platform dedicated to making our environment cleaner and safer. Our mission is to empower individuals and communities to easily report, track, and resolve environmental issues such as trash, pollution, and hazards.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Key Features</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Easy reporting of environmental issues with photos, descriptions, and map locations</li>
          <li>Anonymous reporting for privacy and accessibility</li>
          <li>Real-time tracking of reports on an interactive map</li>
          <li>Community engagement and gamification to encourage participation</li>
          <li>Admin dashboard for managing and resolving reports</li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Get Involved</h2>
        <p className="text-lg text-gray-700 mb-4">
          Join RashTrackr today to help keep your community clean! Whether you want to report an issue, track progress, or become an advocate, your participation makes a difference.
        </p>
        <p className="text-lg text-gray-700">
          For more information or to get in touch, visit our <a href="/contact" className="text-green-600 hover:underline">Contact</a> page.
        </p>
      </div>
    </div>
  );
} 