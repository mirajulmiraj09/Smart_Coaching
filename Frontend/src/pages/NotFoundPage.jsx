import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-2">Page not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary mt-6"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
