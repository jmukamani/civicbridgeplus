import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Upload, X, FileText } from 'lucide-react';

const PolicyUpload = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'health',
    description: '',
    counties: [],
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleCountyToggle = (county) => {
    setFormData(prev => {
      const newCounties = prev.counties.includes(county)
        ? prev.counties.filter(c => c !== county)
        : [...prev.counties, county];
      return { ...prev, counties: newCounties };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    if (!formData.file) {
      toast.error(t('error.fileRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('category', formData.category);
      formPayload.append('description', formData.description);
      formData.counties.forEach(county => formPayload.append('counties', county));
      formPayload.append('file', formData.file);

      await api.post('/representatives/policies', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(t('success.policyUploaded'));
      navigate('/representative/policies');
    } catch (error) {
      toast.error(t('error.uploadingPolicy'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
    'Kakamega', 'Kisii', 'Meru', 'Thika', 'Nyeri'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('repPolicies.uploadTitle')}
        </h1>
        <Link
          to="/representative/policies"
          className="text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        >
          <X size={24} />
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('repPolicies.policyTitle')}
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('repPolicies.category')}
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            required
          >
            {['health', 'education', 'infrastructure', 'agriculture', 'security'].map(category => (
              <option key={category} value={category}>
                {t(`policyCategories.${category}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('repPolicies.description')}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('repPolicies.applicableCounties')}
          </label>
          <div className="flex flex-wrap gap-2">
            {allCounties.map(county => (
              <button
                key={county}
                type="button"
                onClick={() => handleCountyToggle(county)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.counties.includes(county)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {county}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('repPolicies.policyDocument')}
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {formData.file ? (
                <div className="flex items-center justify-center">
                  <FileText className="mr-2 text-blue-600" size={24} />
                  <span>{formData.file.name}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <Upload className="text-gray-400" size={24} />
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-800 focus-within:outline-none"
                    >
                      <span>{t('repPolicies.uploadFile')}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('repPolicies.uploadHint')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/representative/policies')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('uploading') : t('upload')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyUpload;