import React from 'react';
import { Globe, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ language, setLanguage, setSidebarOpen }) => {
  const location = useLocation();
  
  // Extract current view from pathname
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    return path.substring(1).replace('-', ' '); // Remove leading slash and replace hyphens
  };

  const currentView = getCurrentView();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <nav className="text-sm text-gray-600">
              <span>Home</span>
              <span className="mx-2">›</span>
              <span className="capitalize">{currentView}</span>
            </nav>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-sm rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('sw')}
              className={`px-2 py-1 text-sm rounded ${language === 'sw' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              Kiswahili
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;