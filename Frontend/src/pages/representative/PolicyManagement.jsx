import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FileText, Upload, Search, Trash2, Edit, Download } from 'lucide-react';

const PolicyManagement = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        let policiesData;
        
        if (isOnline) {
          const response = await api.get('/representatives/policies');
          policiesData = response.data;
          await cacheData('repPolicies', policiesData);
        } else {
          policiesData = await getCachedData('repPolicies') || [];
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
        
        setPolicies(policiesData);
        setIsLoading(false);
      } catch (error) {
        toast.error(t('error.fetchingPolicies'));
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, [isOnline, t]);

  useEffect(() => {
    // Apply filters and search
    let results = [...policies];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(policy => policy.category === selectedCategory);
    }
    
    // Apply search
    if (searchQuery) {
      results = results.filter(policy =>
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredPolicies(results);
  }, [policies, selectedCategory, searchQuery]);

  const handleDeletePolicy = async (policyId) => {
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    try {
      await api.delete(`/representatives/policies/${policyId}`);
      setPolicies(policies.filter(policy => policy.id !== policyId));
      toast.success(t('success.policyDeleted'));
    } catch (error) {
      toast.error(t('error.deletingPolicy'));
    }
  };

  const handleDownloadPolicy = async (policyId) => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">{t('repPolicies.title')}</h2>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('repPolicies.searchPlaceholder')}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Link
          to="/representative/policies/upload"
          className="bg-blue-600 text-white flex items-center whitespace-nowrap px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Upload size={18} className="mr-2" />
          {t('repPolicies.uploadNew')}
        </Link>
      </div>
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('repPolicies.allCategories')}
          </button>
          {['health', 'education', 'infrastructure', 'agriculture', 'security'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t(`policyCategories.${category}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map(policy => (
            <div key={policy.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{policy.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('policyCategories.' + policy.category)} • {policy.counties.join(', ')}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(policy.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                {policy.description.length > 200
                  ? `${policy.description.substring(0, 200)}...`
                  : policy.description}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">
                    {t('repPolicies.downloads')}: {policy.downloadCount}
                  </span>
                  <span>
                    {t('repPolicies.lastUpdated')}: {new Date(policy.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownloadPolicy(policy.id)}
                    disabled={!isOnline}
                    className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isOnline 
                        ? 'text-blue-600 hover:bg-blue-50' 
                        : 'text-gray-400 cursor-not-allowed opacity-70'
                    }`}
                    title={t('download')}
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    disabled={!isOnline}
                    className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isOnline 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-400 cursor-not-allowed opacity-70'
                    }`}
                    title={t('delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link
                    to={`/representative/policies/edit/${policy.id}`}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    title={t('edit')}
                  >
                    <Edit size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t('repPolicies.noPolicies')}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManagement;