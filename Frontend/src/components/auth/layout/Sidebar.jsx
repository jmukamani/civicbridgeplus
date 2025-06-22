import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import {
  Home,
  User,
  MessageSquare,
  FileText,
  Settings,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const citizenLinks = [
    { to: '/citizen/dashboard', icon: <Home size={20} />, text: t('dashboard') },
    { to: '/citizen/messages', icon: <MessageSquare size={20} />, text: t('messages') },
    { to: '/citizen/policies', icon: <FileText size={20} />, text: t('policies') }
  ];

  const representativeLinks = [
    { to: '/representative/dashboard', icon: <Home size={20} />, text: t('dashboard') },
    { to: '/representative/messages', icon: <MessageSquare size={20} />, text: t('messages') },
    { to: '/representative/policies', icon: <FileText size={20} />, text: t('policies') },
    { to: '/representative/constituents', icon: <Users size={20} />, text: t('constituents') }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <Home size={20} />, text: t('dashboard') },
    { to: '/admin/users', icon: <User size={20} />, text: t('users') },
    { to: '/admin/settings', icon: <Settings size={20} />, text: t('settings') }
  ];

  const links = user?.role === 'admin' 
    ? adminLinks 
    : user?.role === 'representative' 
      ? representativeLinks 
      : citizenLinks;

  return (
    <nav className="w-64 bg-white shadow-md hidden md:block">
      <div className="p-4">
        <div className="space-y-1 mt-8">
          {links.map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-kenya-red text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-3">{link.icon}</span>
              {link.text}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;