import React from 'react';
import { User, FileText, MessageSquare, MapPin, Shield, Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';

const HomePage = ({ setLanguage, language }) => {
  const { t } = useTranslation(language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-gray-500" />
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('sw')}
                  className={`px-3 py-1 rounded ${language === 'sw' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                >
                  Kiswahili
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('tagline')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              {t('getStarted')}
            </Link>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors">
              {t('learnMore')}
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Choose your language</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-3 rounded-lg font-semibold ${
                language === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('sw')}
              className={`px-6 py-3 rounded-lg font-semibold ${
                language === 'sw' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'
              }`}
            >
              Kiswahili
            </button>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bilingual Access</h3>
              <p className="text-gray-600">Switch between English and Kiswahili instantly.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Offline & SMS</h3>
              <p className="text-gray-600">Works offline and supports SMS for all users.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">County Selection</h3>
              <p className="text-gray-600">Personalize your experience by county or constituency.</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Register Securely</h3>
                <p className="text-gray-600">Sign up with your role and location.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Explore Policies</h3>
                <p className="text-gray-600">Analyze and discuss public policies.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Message Officials</h3>
                <p className="text-gray-600">Connect directly with representatives.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mt-20 bg-white rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-center space-x-4">
            <Shield className="h-12 w-12 text-blue-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Privacy & Security</h3>
              <p className="text-gray-600">Your information is protected. Offline access and SMS support available.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;