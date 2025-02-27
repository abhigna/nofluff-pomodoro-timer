import React from 'react';
import { NextPage } from 'next';

const NotFound: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Go back to home
      </button>
    </div>
  );
};

export default NotFound; 