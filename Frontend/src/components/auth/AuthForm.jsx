import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { counties, constituencies } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ isLogin = false, onAuthSuccess, language }) => {
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'citizen',
    county: '',
    constituency: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      const user = {
        name: formData.fullName || 'Jane Mwangi',
        role: formData.role,
        county: formData.county,
        constituency: formData.constituency,
        email: formData.email
      };
      
      // Call the onAuthSuccess callback with the user object
      if (onAuthSuccess) {
        onAuthSuccess(user);
        navigate('/dashboard'); // Redirect after successful auth
      } else {
        console.error('onAuthSuccess prop is missing');
        setError('Authentication error. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? t('signIn') : t('createAccount')}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Register to access personalized civic tools and policy insights.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLogin ? 'Email or Phone' : 'Email'}
            </label>
            <input
              type={isLogin ? 'text' : 'email'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="citizen">Citizen</option>
                  <option value="representative">Representative</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.county}
                  onChange={(e) => setFormData({...formData, county: e.target.value})}
                  required
                >
                  <option value="">Select County</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>

              {formData.county && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.constituency}
                    onChange={(e) => setFormData({...formData, constituency: e.target.value})}
                    required
                  >
                    <option value="">Select Constituency</option>
                    {constituencies[formData.county]?.map((constituency) => (
                      <option key={constituency} value={constituency}>{constituency}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              'Processing...'
            ) : isLogin ? (
              t('signIn')
            ) : (
              t('signUp')
            )}
          </button>
        </form>

        {!isLogin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">{t('privacySecurity')}</h4>
                <p className="text-sm text-blue-700">{t('privacyNote')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(isLogin ? '/register' : '/login')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;