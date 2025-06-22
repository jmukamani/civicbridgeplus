import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-kenya-red mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="btn-primary px-6 py-2 text-lg"
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;