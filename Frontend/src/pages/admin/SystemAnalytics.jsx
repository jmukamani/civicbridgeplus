import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  Activity, Users, MessageSquare, FileText, Download, Filter
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SystemAnalytics = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [timeRange, setTimeRange] = useState('7days');
  const [engagementData, setEngagementData] = useState([]);
  const [featureUsage, setFeatureUsage] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        if (isOnline) {
          const [engagementRes, usageRes, deviceRes] = await Promise.all([
            api.get(`/admin/analytics/engagement?range=${timeRange}`),
            api.get('/admin/analytics/feature-usage'),
            api.get('/admin/analytics/device-distribution')
          ]);
          
          setEngagementData(engagementRes.data);
          setFeatureUsage(usageRes.data);
          setDeviceData(deviceRes.data);
          
          // Cache data for offline use
          await cacheData('engagementData', engagementRes.data);
          await cacheData('featureUsage', usageRes.data);
          await cacheData('deviceData', deviceRes.data);
        } else {
          const [cachedEngagement, cachedUsage, cachedDevice] = await Promise.all([
            getCachedData('engagementData'),
            getCachedData('featureUsage'),
            getCachedData('deviceData')
          ]);
          
          if (cachedEngagement) setEngagementData(cachedEngagement);
          if (cachedUsage) setFeatureUsage(cachedUsage);
          if (cachedDevice) setDeviceData(cachedDevice);
          
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
      } catch (error) {
        toast.error(t('error.fetchingAnalytics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, isOnline, t]);

  const handleExport = async () => {
    if (!isOnline) {
      toast.error(t('error.offlineExport'));
      return;
    }

    try {
      const response = await api.get('/admin/analytics/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `civicbridge-analytics-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(t('error.exportFailed'));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kenya-black">
          {t('adminAnalytics.title')}
        </h1>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="7days">{t('adminAnalytics.last7Days')}</option>
            <option value="30days">{t('adminAnalytics.last30Days')}</option>
            <option value="90days">{t('adminAnalytics.last90Days')}</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!isOnline}
            className={`btn-primary flex items-center ${
              !isOnline ? 'opacity-50' : ''
            }`}
          >
            <Download size={18} className="mr-2" />
            {t('export')}
          </button>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          {t('adminAnalytics.userEngagement')}
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="activeUsers" 
                name={t('adminAnalytics.activeUsers')}
                stroke="#3B82F6" 
                fill="#93C5FD" 
              />
              <Area 
                type="monotone" 
                dataKey="newUsers" 
                name={t('adminAnalytics.newUsers')}
                stroke="#10B981" 
                fill="#6EE7B7" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">
            {t('adminAnalytics.featureUsage')}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="usageCount" 
                  name={t('adminAnalytics.usageCount')}
                  fill="#8B5CF6" 
                />
                <Bar 
                  dataKey="uniqueUsers" 
                  name={t('adminAnalytics.uniqueUsers')}
                  fill="#EC4899" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">
            {t('adminAnalytics.deviceDistribution')}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mobile" 
                  name={t('adminAnalytics.mobile')}
                  stroke="#DC2626" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="desktop" 
                  name={t('adminAnalytics.desktop')}
                  stroke="#059669" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="tablet" 
                  name={t('adminAnalytics.tablet')}
                  stroke="#D97706" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;