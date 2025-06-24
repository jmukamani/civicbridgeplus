import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="text-red-600 w-12 h-12" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('unauthorized.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('unauthorized.message')}
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link
            to="/"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center transition-colors"
          >
            {t('unauthorized.goHome')}
          </Link>
          
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 text-sm hover:underline transition-colors"
          >
            {t('unauthorized.loginWithDifferentAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;