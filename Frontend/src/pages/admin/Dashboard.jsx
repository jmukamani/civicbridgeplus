import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, FileText, MessageSquare, Activity, 
  ArrowUp, ArrowDown, RefreshCw 
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    messagesSent: 0,
    policiesPublished: 0
  });
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [userRoleDistribution, setUserRoleDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#DC2626'];

  useEffect(() => {
    fetchDashboardData();
  }, [isOnline]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (isOnline) {
        const [metricsRes, growthRes, activityRes, distributionRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/user-growth'),
          api.get('/admin/activity'),
          api.get('/admin/user-distribution')
        ]);
        
        setSystemMetrics(metricsRes.data);
        setUserGrowthData(growthRes.data);
        setActivityData(activityRes.data);
        setUserRoleDistribution(distributionRes.data);
        
        // Cache data for offline use
        await cacheData('adminMetrics', metricsRes.data);
        await cacheData('userGrowth', growthRes.data);
        await cacheData('activityData', activityRes.data);
        await cacheData('userDistribution', distributionRes.data);
      } else {
        const [
          cachedMetrics, 
          cachedGrowth, 
          cachedActivity, 
          cachedDistribution
        ] = await Promise.all([
          getCachedData('adminMetrics'),
          getCachedData('userGrowth'),
          getCachedData('activityData'),
          getCachedData('userDistribution')
        ]);
        
        if (cachedMetrics) setSystemMetrics(cachedMetrics);
        if (cachedGrowth) setUserGrowthData(cachedGrowth);
        if (cachedActivity) setActivityData(cachedActivity);
        if (cachedDistribution) setUserRoleDistribution(cachedDistribution);
        
        toast(t('offlineDataWarning'), { icon: '⚠️' });
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      toast.error(t('error.fetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isOnline) {
      toast.error(t('error.offlineRefresh'));
      return;
    }
    await fetchDashboardData();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kenya-black">
          {t('adminDashboard.title')}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={!isOnline}
          className={`flex items-center space-x-2 ${
            isOnline ? 'text-kenya-red hover:text-red-700' : 'text-gray-400'
          }`}
        >
          <RefreshCw size={18} className={!isOnline ? 'animate-spin' : ''} />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500">
          {t('lastUpdated')}: {lastUpdated.toLocaleString()}
        </p>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard 
          icon={<Users size={24} className="text-blue-500" />}
          title={t('adminDashboard.totalUsers')}
          value={systemMetrics.totalUsers}
          change={systemMetrics.newUsers}
        />
        <MetricCard 
          icon={<Activity size={24} className="text-green-500" />}
          title={t('adminDashboard.activeUsers')}
          value={systemMetrics.activeUsers}
          percentage={Math.round((systemMetrics.activeUsers / systemMetrics.totalUsers) * 100)}
        />
        <MetricCard 
          icon={<MessageSquare size={24} className="text-yellow-500" />}
          title={t('adminDashboard.messagesSent')}
          value={systemMetrics.messagesSent}
        />
        <MetricCard 
          icon={<FileText size={24} className="text-purple-500" />}
          title={t('adminDashboard.policiesPublished')}
          value={systemMetrics.policiesPublished}
        />
        <SystemHealthCard 
          uptime={systemMetrics.systemUptime}
          lastIncident={systemMetrics.lastIncident}
        />
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          {t('adminDashboard.userGrowth')}
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                name={t('adminDashboard.totalUsers')}
                stroke="#3B82F6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                name={t('adminDashboard.newUsers')}
                stroke="#10B981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">
            {t('adminDashboard.systemActivity')}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="messages" 
                  name={t('adminDashboard.messages')}
                  fill="#F59E0B" 
                />
                <Bar 
                  dataKey="policies" 
                  name={t('adminDashboard.policies')}
                  fill="#8B5CF6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">
            {t('adminDashboard.userDistribution')}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {userRoleDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, title, value, change, percentage }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between">
      <div className="text-gray-500 text-sm">{title}</div>
      {change !== undefined && (
        <div className={`flex items-center text-xs ${
          change > 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {change > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          <span className="ml-1">{Math.abs(change)}</span>
        </div>
      )}
    </div>
    <div className="flex items-end mt-2">
      <div className="text-3xl font-bold mr-3">{value}</div>
      <div className="p-2 rounded-full bg-gray-100">{icon}</div>
    </div>
    {percentage !== undefined && (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {percentage}% {title.toLowerCase()}
        </div>
      </div>
    )}
  </div>
);

const SystemHealthCard = ({ uptime, lastIncident }) => {
  const { t } = useTranslation();
  const status = uptime >= 99.9 ? 'operational' : 
                uptime >= 95 ? 'degraded' : 'outage';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-gray-500 text-sm">
        {t('adminDashboard.systemStatus')}
      </div>
      <div className="flex items-center mt-2">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          status === 'operational' ? 'bg-green-500' :
          status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
        <div className="text-sm font-medium capitalize">{status}</div>
      </div>
      <div className="text-3xl font-bold mt-1">{uptime}%</div>
      <div className="text-xs text-gray-500 mt-2">
        {t('adminDashboard.uptimeLast30Days')}
      </div>
      {lastIncident && (
        <div className="text-xs text-gray-500 mt-1">
          {t('adminDashboard.lastIncident')}: {new Date(lastIncident).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;