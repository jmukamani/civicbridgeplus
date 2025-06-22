import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import LanguageToggle from '../layout/LanguageToggle';
import MobileNav from '../layout/MobileNav'

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="bg-kenya-red text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <MobileNav />
            <Link to="/" className="text-xl font-bold">
              CivicBridge Pulse
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {user && (
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline">
                  {t('welcome')}, {user.firstName}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 bg-white text-kenya-red rounded hover:bg-gray-100"
                >
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;