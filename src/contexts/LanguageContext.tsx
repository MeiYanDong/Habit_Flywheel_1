import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'zh' | 'en' | 'ja';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Array<{ code: Language; name: string; nativeName: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('habitFlywheel_language') as Language;
    return saved || 'zh';
  });

  const availableLanguages = [
    { code: 'zh' as Language, name: 'Chinese', nativeName: '简体中文' },
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'ja' as Language, name: 'Japanese', nativeName: '日本語' }
  ];

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('habitFlywheel_language', lang);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  const value = {
    language,
    setLanguage,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
