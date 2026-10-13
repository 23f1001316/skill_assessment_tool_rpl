import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';
import { storage } from '../utils/storage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => storage.getLanguage());

  const setLanguage = (lang) => {
    setLanguageState(lang);
    storage.setLanguage(lang);
  };

  const t = (key, params = null) => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] !== undefined ? langDict[key] : (translations.en[key] !== undefined ? translations.en[key] : key);
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
