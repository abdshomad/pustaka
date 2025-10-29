/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKey } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('id'); // Default to Indonesian

  const t = useCallback((key: TranslationKey, replacements?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations.en[key];

    // Handle special pluralization for English
    if (language === 'en' && key === 'bookCount' && replacements?.count !== 1) {
        translation = '{count} books in library';
    } else if (language === 'en' && key === 'bookCount' && replacements?.count === 1) {
        translation = '{count} book in library';
    }

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
      });
    }

    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
