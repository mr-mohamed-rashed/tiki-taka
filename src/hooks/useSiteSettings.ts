import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SiteSetting {
  key: string;
  value_en: string;
  value_ar: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) console.error('[site_settings] fetch error:', error);
    if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const get = (key: string, lang: 'en' | 'ar' = 'en'): string | null => {
    const row = settings.find(s => s.key === key);
    if (!row) return null;
    return lang === 'ar' ? row.value_ar : row.value_en;
  };

  const save = async (key: string, value_en: string, value_ar: string) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value_en, value_ar }, { onConflict: 'key' });
    if (error) {
      console.error('[site_settings] upsert error:', error);
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    await fetch();
  };

  return { settings, loading, get, save };
}
