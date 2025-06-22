import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('civicbridge-lang', lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-kenya-red text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('sw')}
        className={`px-2 py-1 rounded ${i18n.language === 'sw' ? 'bg-kenya-red text-white' : 'bg-gray-200'}`}
      >
        SW
      </button>
    </div>
  );
};

export default LanguageToggle;