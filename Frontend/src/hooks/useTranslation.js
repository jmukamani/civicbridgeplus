import { useState } from 'react';
import { translations } from '../utils/translations';

export const useTranslation = () => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return {
    language,
    setLanguage,
    t
  };
};