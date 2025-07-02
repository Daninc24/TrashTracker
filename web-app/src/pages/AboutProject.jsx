import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutProject() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link to="/" className="inline-block mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">Back to Home</Link>
      <h1 className="text-4xl font-bold mb-4 text-green-700">About RashTrackr</h1>
      <p className="mb-4 text-lg text-gray-700">
        RashTrackr is a community-driven platform designed to empower individuals and organizations to report, track, and resolve environmental issues in their communities. Our mission is to make it easy for everyone to contribute to a cleaner, healthier environment.
      </p>
      <h2 className="text-2xl font-semibold mt-8 mb-2">Key Features</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Easy issue reporting with photos, descriptions, and map locations</li>
        <li>Real-time tracking of report status and progress</li>
        <li>Community engagement and gamification to encourage participation</li>
        <li>Admin dashboard for efficient management and analytics</li>
        <li>GDPR-compliant data handling and user privacy</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-8 mb-2">Our Team</h2>
      <p className="mb-4 text-gray-700">
        RashTrackr is built by a passionate team of developers, designers, and environmental advocates who believe in the power of technology to drive positive change. We are committed to transparency, innovation, and community collaboration.
      </p>
      <h2 className="text-2xl font-semibold mt-8 mb-2">Get Involved</h2>
      <p className="mb-4 text-gray-700">
        Join us in making a difference! Whether you are a concerned citizen, a local government, or an environmental organization, RashTrackr provides the tools you need to take action.
      </p>
    </div>
  );
} 