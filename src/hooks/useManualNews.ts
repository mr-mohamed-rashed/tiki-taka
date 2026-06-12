import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ManualNewsRow {
  id: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  category: string;
  image_url: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
}

export function useManualNews(publishedOnly = false) {
  const [news, setNews] = useState<ManualNewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('manual_news').select('*').order('published_at', { ascending: false });
    if (publishedOnly) q = q.eq('is_published', true);
    const { data, error } = await q;
    if (error) console.error('[manual_news] fetch error:', error);
    if (data) setNews(data);
    setLoading(false);
  }, [publishedOnly]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async (item: Omit<ManualNewsRow, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('manual_news').insert(item);
    if (error) { toast({ title: 'Failed to add article', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Article published!' });
    await fetch();
  };

  const update = async (id: string, item: Partial<ManualNewsRow>) => {
    const { error } = await supabase.from('manual_news').update(item).eq('id', id);
    if (error) { toast({ title: 'Update failed', description: error.message, variant: 'destructive' }); return; }
    await fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('manual_news').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    await fetch();
  };

  const togglePublish = async (id: string, is_published: boolean) => {
    const { error } = await supabase.from('manual_news').update({ is_published }).eq('id', id);
    if (error) console.error('[manual_news] toggle error:', error);
    await fetch();
  };

  return { news, loading, save, update, remove, togglePublish, refresh: fetch };
}
