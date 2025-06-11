import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, FileText, Settings, X, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentUser, 
  language 
}) => {
  const { t } = useTranslation(language);
  
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">CivicBridgePulse</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-8">
        <div className="px-6 space-y-2">
          <Link
            to="/dashboard"
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-600 hover:bg-gray-50"
          >
            <BarChart3 className="h-5 w-5" />
            <span>{t('dashboard')}</span>
          </Link>
          <Link
            to="/representatives"
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-600 hover:bg-gray-50"
          >
            <Users className="h-5 w-5" />
            <span>{t('representatives')}</span>
          </Link>
          <Link
            to="/policy-analysis"
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-600 hover:bg-gray-50"
          >
            <FileText className="h-5 w-5" />
            <span>{t('policyAnalysis')}</span>
          </Link>
          <Link
            to="/settings"
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-600 hover:bg-gray-50"
          >
            <Settings className="h-5 w-5" />
            <span>{t('settings')}</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      {currentUser && (
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-600 capitalize">{currentUser.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;