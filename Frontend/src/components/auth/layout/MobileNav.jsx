import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import {
  Home,
  MessageSquare,
  FileText,
  Users,
  User,
  Settings,
  Menu,
  X
} from 'lucide-react';

const MobileNav = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <div className="flex flex-col p-2">
            {links.map((link, index) => (
              <NavLink
                key={index}
                to={link.to}
                onClick={() => setIsOpen(false)}
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
      )}
    </div>
  );
};

export default MobileNav;