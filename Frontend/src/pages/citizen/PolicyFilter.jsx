import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';

const PolicyFilter = ({ filters, setFilters }) => {
  const { t } = useTranslation();

  const policyCategories = [
    'health',
    'education',
    'infrastructure',
    'agriculture',
    'security',
    'environment',
    'economy',
    'housing'
  ];

  const dateRanges = [
    { value: 'all', label: t('policyFilter.allTime') },
    { value: 'week', label: t('policyFilter.lastWeek') },
    { value: 'month', label: t('policyFilter.lastMonth') },
    { value: 'year', label: t('policyFilter.lastYear') }
  ];

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range
    }));
  };

  const handleCountyChange = (county) => {
    setFilters(prev => ({
      ...prev,
      county: prev.county === county ? '' : county
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      county: '',
      dateRange: 'all'
    });
  };

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
    'Kakamega', 'Kisii', 'Meru', 'Thika', 'Nyeri',
    'Machakos', 'Kitui', 'Garissa', 'Wajir', 'Mandera',
    'Marsabit', 'Isiolo', 'Narok', 'Bomet', 'Kericho'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center">
          <Filter size={18} className="mr-2" />
          {t('policyFilter.filterBy')}
        </h3>
        {(filters.category || filters.county || filters.dateRange !== 'all') && (
          <button
            onClick={clearFilters}
            className="text-sm text-kenya-red hover:underline flex items-center"
          >
            <X size={14} className="mr-1" />
            {t('policyFilter.clearAll')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">
            {t('policyFilter.category')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {policyCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.category === category
                    ? 'bg-kenya-red text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {t(`policyCategories.${category}`)}
              </button>
            ))}
          </div>
        </div>

        {/* County Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">
            {t('policyFilter.county')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {kenyanCounties.map(county => (
              <button
                key={county}
                onClick={() => handleCountyChange(county)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.county === county
                    ? 'bg-kenya-red text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {county}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">
            {t('policyFilter.dateRange')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {dateRanges.map(range => (
              <button
                key={range.value}
                onClick={() => handleDateRangeChange(range.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.dateRange === range.value
                    ? 'bg-kenya-red text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyFilter;