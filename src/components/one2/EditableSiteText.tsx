import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { EditableText } from './EditableText';

export function EditableSiteText({
  settingKey,
  fallbackEn,
  fallbackAr,
  className = '',
  multiline = false,
}: {
  settingKey: string;
  fallbackEn: string;
  fallbackAr: string;
  className?: string;
  multiline?: boolean;
}) {
  const { lang } = useLanguage();
  const { settings, save, get } = useSiteSettingsContext();

  const currentVal = get(settingKey, lang) ?? (lang === 'ar' ? fallbackAr : fallbackEn);

  const handleSave = async (newVal: string) => {
    const existing = settings.find(s => s.key === settingKey);
    const valEn = lang === 'en' ? newVal : (existing?.value_en ?? fallbackEn);
    const valAr = lang === 'ar' ? newVal : (existing?.value_ar ?? fallbackAr);
    await save(settingKey, valEn, valAr);
  };

  return (
    <EditableText
      value={currentVal}
      onSave={handleSave}
      className={className}
      multiline={multiline}
    />
  );
}
