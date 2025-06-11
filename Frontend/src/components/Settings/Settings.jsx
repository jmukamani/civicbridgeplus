import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const Settings = ({ currentUser, language, setLanguage, setIsAuthenticated, setCurrentUser }) => {
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleSaveChanges = () => {
    // Save changes logic here
    alert('Settings saved successfully');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Profile Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentUser?.name || ''}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentUser?.county || ''}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Notification Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span>Email notifications</span>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>SMS notifications</span>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>Policy updates</span>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={handleSaveChanges}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;