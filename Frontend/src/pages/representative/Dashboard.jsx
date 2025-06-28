import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Mail, FileText, Users, Clock, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

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

  // Helper functions for caching
  const cacheData = async (key, data) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const getCachedData = async (key) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  };

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
          toast('Using cached data (offline mode)', { icon: '⚠️' });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [isOnline, user]);

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Representative Dashboard, {user.firstName || user.first_name}
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your constituency and policies
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Mail className="text-blue-600" size={24} />}
          title="Pending Messages"
          value={metrics.pendingMessages}
          trend={metrics.pendingMessages > 0 ? 'up' : 'neutral'}
          link="/representative/messages"
        />
        <StatCard 
          icon={<FileText className="text-blue-600" size={24} />}
          title="Published Policies"
          value={metrics.publishedPolicies}
          trend="neutral"
          link="/representative/policies"
        />
        <StatCard 
          icon={<Users className="text-blue-600" size={24} />}
          title="Constituents"
          value={metrics.constituents}
          trend="neutral"
          link="/representative/constituents"
        />
        <StatCard 
          icon={<Clock className="text-blue-600" size={24} />}
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}h`}
          trend={metrics.avgResponseTime > 24 ? 'down' : 'up'}
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          Message Activity
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Bar 
                dataKey="incoming" 
                name="Incoming Messages"
                fill="#059669" 
              />
              <Bar 
                dataKey="outgoing" 
                name="Outgoing Messages"
                fill="#2563eb" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton 
            title="Respond to Messages"
            description="Reply to constituent messages"
            icon={<Mail size={20} />}
            link="/representative/messages"
            variant="primary"
          />
          <ActionButton 
            title="Upload Policy"
            description="Upload new policy documents"
            icon={<FileText size={20} />}
            link="/representative/policies/upload"
            variant="secondary"
          />
          <ActionButton 
            title="View Constituents"
            description="Manage your constituents"
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
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 cursor-pointer transition-colors">
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
      <div className="text-gray-600 text-sm">{title}</div>
      {trend === 'up' && <ArrowUp className="text-green-600" size={16} />}
      {trend === 'down' && <ArrowDown className="text-red-600" size={16} />}
    </div>
    <div className="flex items-end mt-2">
      <div className="text-3xl font-bold text-gray-900 mr-3">{value}</div>
      <div className="p-2 bg-blue-50 rounded-full">{icon}</div>
    </div>
  </div>
);

const ActionButton = ({ title, description, icon, link, variant }) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-blue-600 hover:bg-blue-50',
    neutral: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };

  return (
    <Link
      to={link}
      className={`rounded-lg p-4 transition-colors flex flex-col items-start space-y-2 ${variantClasses[variant]}`}
    >
      <div className="flex items-center mb-2">
        <div className="mr-3 p-2 bg-white bg-opacity-20 rounded-full">{icon}</div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
};

export default RepresentativeDashboard;