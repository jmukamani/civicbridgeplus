import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Mail, FileText, Users, Clock, AlertCircle } from 'lucide-react';

const RepresentativeDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [metrics, setMetrics] = useState({
    pendingMessages: 0,
    publishedPolicies: 0,
    constituents: 0,
    avgResponseTime: 0
  });
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isOnline) {
          const [metricsRes, activityRes] = await Promise.all([
            api.get('/representatives/metrics'),
            api.get('/representatives/activity')
          ]);
          
          setMetrics(metricsRes.data);
          setActivityData(activityRes.data);
          
          // Cache data for offline use
          await cacheData('repMetrics', metricsRes.data);
          await cacheData('repActivity', activityRes.data);
        } else {
          const [cachedMetrics, cachedActivity] = await Promise.all([
            getCachedData('repMetrics'),
            getCachedData('repActivity')
          ]);
          
          if (cachedMetrics) setMetrics(cachedMetrics);
          if (cachedActivity) setActivityData(cachedActivity);
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
      } catch (error) {
        toast.error(t('error.fetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isOnline, t]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-kenya-black">
          {t('repDashboard.title')}, {user.firstName}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('repDashboard.subtitle', { county: user.county })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Mail className="text-kenya-red" size={24} />}
          title={t('repDashboard.pendingMessages')}
          value={metrics.pendingMessages}
          trend={metrics.pendingMessages > 0 ? 'up' : 'neutral'}
          link="/representative/messages"
        />
        <StatCard 
          icon={<FileText className="text-kenya-red" size={24} />}
          title={t('repDashboard.publishedPolicies')}
          value={metrics.publishedPolicies}
          trend="neutral"
          link="/representative/policies"
        />
        <StatCard 
          icon={<Users className="text-kenya-red" size={24} />}
          title={t('repDashboard.constituents')}
          value={metrics.constituents}
          trend="neutral"
          link="/representative/constituents"
        />
        <StatCard 
          icon={<Clock className="text-kenya-red" size={24} />}
          title={t('repDashboard.avgResponseTime')}
          value={`${metrics.avgResponseTime}h`}
          trend={metrics.avgResponseTime > 24 ? 'down' : 'up'}
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          {t('repDashboard.messageActivity')}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Bar 
                dataKey="incoming" 
                name={t('repDashboard.incomingMessages')}
                fill="#059669" 
              />
              <Bar 
                dataKey="outgoing" 
                name={t('repDashboard.outgoingMessages')}
                fill="#DC2626" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('repDashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton 
            title={t('repDashboard.respondToMessages')}
            description={t('repDashboard.respondToMessagesDesc')}
            icon={<Mail size={20} />}
            link="/representative/messages"
            variant="primary"
          />
          <ActionButton 
            title={t('repDashboard.uploadPolicy')}
            description={t('repDashboard.uploadPolicyDesc')}
            icon={<FileText size={20} />}
            link="/representative/policies/upload"
            variant="secondary"
          />
          <ActionButton 
            title={t('repDashboard.viewConstituents')}
            description={t('repDashboard.viewConstituentsDesc')}
            icon={<Users size={20} />}
            link="/representative/constituents"
            variant="neutral"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, trend, link }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
    {link ? (
      <Link to={link} className="block">
        <StatCardContent icon={icon} title={title} value={value} trend={trend} />
      </Link>
    ) : (
      <StatCardContent icon={icon} title={title} value={value} trend={trend} />
    )}
  </div>
);

const StatCardContent = ({ icon, title, value, trend }) => (
  <div>
    <div className="flex justify-between">
      <div className="text-gray-500 text-sm">{title}</div>
      {trend === 'up' && <ArrowUp className="text-green-500" size={16} />}
      {trend === 'down' && <ArrowDown className="text-red-500" size={16} />}
    </div>
    <div className="flex items-end mt-2">
      <div className="text-3xl font-bold mr-3">{value}</div>
      <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
    </div>
  </div>
);

const ActionButton = ({ title, description, icon, link, variant }) => {
  const variantClasses = {
    primary: 'bg-kenya-red text-white hover:bg-red-700',
    secondary: 'bg-kenya-green text-white hover:bg-green-700',
    neutral: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };

  return (
    <Link
      to={link}
      className={`rounded-lg p-4 transition-colors ${variantClasses[variant]}`}
    >
      <div className="flex items-center mb-2">
        <div className="mr-3 p-2 bg-white bg-opacity-20 rounded-full">{icon}</div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
};

export default RepresentativeDashboard;