import React, { createContext, useContext } from 'react';
import { useSiteSettings, type SiteSetting } from '@/hooks/useSiteSettings';

interface SiteSettingsContextType {
  settings: SiteSetting[];
  loading: boolean;
  get: (key: string, lang?: 'en' | 'ar') => string | null;
  save: (key: string, value_en: string, value_ar: string) => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: [],
  loading: false,
  get: () => null,
  save: async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const ctx = useSiteSettings();
  return <SiteSettingsContext.Provider value={ctx}>{children}</SiteSettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteSettingsContext() {
  return useContext(SiteSettingsContext);
}
