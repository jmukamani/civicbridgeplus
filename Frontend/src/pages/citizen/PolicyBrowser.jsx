import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import PolicyCard from './PolicyCard';
import PolicyFilter from './PolicyFilter';
import { toast } from 'react-hot-toast';
import { Download, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/auth/common/LoadingSpinner';

const PolicyBrowser = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    county: '',
    dateRange: 'all'
  });

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        let policyData;
        
        if (isOnline) {
          const response = await api.get('/policies');
          policyData = response.data;
          await cacheData('allPolicies', policyData);
        } else {
          policyData = await getCachedData('allPolicies') || [];
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
        
        setPolicies(policyData);
        setFilteredPolicies(policyData);
      } catch (error) {
        toast.error(t('error.fetchingPolicies'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, [isOnline, t]);

  useEffect(() => {
    // Apply filters whenever policies, filters, or search query changes
    let results = [...policies];
    
    // Apply search
    if (searchQuery) {
      results = results.filter(policy => 
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.category) {
      results = results.filter(policy => policy.category === filters.category);
    }
    
    if (filters.county) {
      results = results.filter(policy => policy.counties.includes(filters.county));
    }
    
    if (filters.dateRange) {
      const cutoffDate = new Date();
      if (filters.dateRange === 'week') {
        cutoffDate.setDate(cutoffDate.getDate() - 7);
      } else if (filters.dateRange === 'month') {
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      }
      
      results = results.filter(policy => 
        new Date(policy.createdAt) > cutoffDate
      );
    }
    
    setFilteredPolicies(results);
  }, [policies, searchQuery, filters]);

  const handleDownload = async (policyId) => {
    if (!isOnline) {
      toast.error(t('error.offlineDownload'));
      return;
    }
    
    try {
      const response = await api.get(`/policies/${policyId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `policy-${policyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(t('error.downloadFailed'));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">{t('policyBrowser.title')}</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('policyBrowser.searchPlaceholder')}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <PolicyFilter 
            filters={filters}
            setFilters={setFilters}
          />
        </div>
        {filteredPolicies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map(policy => (
              <PolicyCard 
                key={policy.id}
                policy={policy}
                onDownload={handleDownload}
                isOnline={isOnline}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">{t('policyBrowser.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyBrowser;