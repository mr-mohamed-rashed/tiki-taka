import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PageSection {
  id: string;
  page: string;
  section_key: string;
  name_en: string;
  name_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  bg_color: string;
  bg_image: string;
  is_visible: boolean;
  sort_order: number;
}

export function usePageSections(page?: string) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('page_sections').select('*').order('sort_order');
    if (page) q = q.eq('page', page);
    const { data, error } = await q;
    if (error) console.error('[page_sections] fetch error:', error);
    if (data) setSections(data);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsertMany = async (rows: Partial<PageSection>[]) => {
    for (const row of rows) {
      const { error } = await supabase
        .from('page_sections')
        .upsert(row as PageSection, { onConflict: 'page,section_key' });
      if (error) {
        console.error('[page_sections] upsert error:', error);
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
        return;
      }
    }
    toast({ title: 'Saved!', description: 'All changes saved successfully.' });
    await fetch();
  };

  const add = async (row: Omit<PageSection, 'id'>) => {
    const { error } = await supabase.from('page_sections').insert(row);
    if (error) {
      console.error('[page_sections] insert error:', error);
      toast({ title: 'Add failed', description: error.message, variant: 'destructive' });
      return;
    }
    await fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('page_sections').delete().eq('id', id);
    if (error) console.error('[page_sections] delete error:', error);
    await fetch();
  };

  return { sections, loading, upsertMany, add, remove, refresh: fetch };
}
