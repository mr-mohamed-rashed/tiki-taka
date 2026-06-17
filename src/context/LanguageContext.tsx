import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lang } from '@/lib/i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: 'ltr' | 'rtl';
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  dir: 'ltr',
  isAr: false,
});

const ARABIC_REGIONS = new Set([
  'AE', 'BH', 'DZ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 'MA',
  'OM', 'PS', 'QA', 'SA', 'SD', 'SY', 'TN', 'YE',
]);

function detectInitialLanguage(): Lang {
  const saved = localStorage.getItem('tiki-lang') as Lang | null;
  if (saved === 'ar' || saved === 'en') return saved;
  return 'ar'; // Default to Arabic
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return detectInitialLanguage();
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('tiki-lang', l);
  };

  // Apply dir + font class to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', dir);
    html.setAttribute('lang', lang);
    if (lang === 'ar') {
      html.classList.add('font-arabic');
    } else {
      html.classList.remove('font-arabic');
    }
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir, isAr: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
