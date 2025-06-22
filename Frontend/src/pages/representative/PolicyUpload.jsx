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
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-kenya-black">
          {t('repPolicies.uploadTitle')}
        </h1>
        <Link
          to="/representative/policies"
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('repPolicies.policyTitle')}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input w-full"
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
              className="form-select w-full"
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
              className="form-input w-full"
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
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.counties.includes(county)
                      ? 'bg-kenya-red text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
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
                    <FileText className="mr-2 text-kenya-red" size={24} />
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
                        className="relative cursor-pointer bg-white rounded-md font-medium text-kenya-red hover:text-red-700 focus-within:outline-none"
                      >
                        <span>{t('repPolicies.uploadFile')}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          required
                        />
                      </label>
                      <p className="pl-1">{t('repPolicies.orDragDrop')}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('repPolicies.fileTypes')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Link
              to="/representative/policies"
              className="btn-secondary px-4 py-2"
            >
              {t('cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !isOnline}
              className="btn-primary px-4 py-2"
            >
              {isSubmitting ? t('uploading') : t('repPolicies.uploadPolicy')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PolicyUpload;