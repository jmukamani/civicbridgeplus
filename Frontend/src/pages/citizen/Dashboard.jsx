import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import PolicyCard from './PolicyCard';
import MessagePreview from './MessagePreview';
import { Bookmark, MessageSquare, FileText, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CitizenDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch fresh data if online
        if (isOnline) {
          const [policiesRes, messagesRes] = await Promise.all([
            api.get('/policies?limit=3&county=' + user.county),
            api.get('/messages/unread-count')
          ]);
          
          setRecentPolicies(policiesRes.data);
          setUnreadMessages(messagesRes.data.count);
          
          // Update indexedDB with fresh data
          await cacheData('policies', policiesRes.data);
          await cacheData('unreadCount', messagesRes.data.count);
        } else {
          // Fallback to cached data when offline
          const [cachedPolicies, cachedCount] = await Promise.all([
            getCachedData('policies'),
            getCachedData('unreadCount')
          ]);
          
          if (cachedPolicies) setRecentPolicies(cachedPolicies);
          if (cachedCount) setUnreadMessages(cachedCount);
        }
      } catch (error) {
        toast.error(t('error.fetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOnline, user.county, t]);

  // Helper functions for IndexedDB caching
  const cacheData = async (key, data) => {
    /* ... implementation ... */
  };

  const getCachedData = async (key) => {
    /* ... implementation ... */
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, {user.firstName}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <DashboardCard 
          icon={<FileText className="text-blue-600" size={24} />}
          title={t('dashboard.recentPolicies')}
          value={recentPolicies.length}
          link="/citizen/policies"
        />
        <DashboardCard 
          icon={<MessageSquare className="text-blue-600" size={24} />}
          title={t('dashboard.unreadMessages')}
          value={unreadMessages}
          link="/citizen/messages"
        />
        <DashboardCard 
          icon={<User className="text-blue-600" size={24} />}
          title={t('dashboard.representatives')}
          value={user.representatives?.length || 0}
          link="/citizen/representatives"
        />
      </div>

      {/* Recent Policies Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentPolicies')}</h2>
          <Link 
            to="/citizen/policies" 
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {t('viewAll')}
          </Link>
        </div>
        
        {recentPolicies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPolicies.map(policy => (
              <PolicyCard 
                key={policy.id} 
                policy={policy} 
                isOnline={isOnline}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t('dashboard.noPolicies')}</p>
        )}
      </div>

      {/* Recent Messages Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentMessages')}</h2>
          <Link 
            to="/citizen/messages" 
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {t('viewAll')}
          </Link>
        </div>
        <MessagePreview isOnline={isOnline} />
      </div>
    </div>
  );
};

const DashboardCard = ({ icon, title, value, link }) => (
  <Link to={link} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 cursor-pointer transition-colors">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-blue-50 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </Link>
);

export default CitizenDashboard;