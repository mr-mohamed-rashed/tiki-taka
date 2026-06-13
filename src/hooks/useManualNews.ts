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

const LOCAL_KEY = 'tiki_taka_manual_news';

function readLocalNews() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? (JSON.parse(stored) as ManualNewsRow[]) : [];
  } catch {
    return [];
  }
}

function writeLocalNews(items: ManualNewsRow[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function sortNews(items: ManualNewsRow[]) {
  return [...items].sort((a, b) => b.published_at.localeCompare(a.published_at) || b.created_at.localeCompare(a.created_at));
}

function isMissingTableError(error: { message?: string; code?: string } | null) {
  return Boolean(error && (error.code === '42P01' || error.message?.includes('manual_news')));
}

export function useManualNews(publishedOnly = false) {
  const [news, setNews] = useState<ManualNewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const applyLocal = useCallback(() => {
    const localNews = readLocalNews();
    const filtered = publishedOnly ? localNews.filter((item) => item.is_published) : localNews;
    setNews(sortNews(filtered));
  }, [publishedOnly]);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('manual_news').select('*').order('published_at', { ascending: false });
    if (publishedOnly) q = q.eq('is_published', true);
    const { data, error } = await q;

    if (error) {
      console.error('[manual_news] fetch error:', error);
      if (isMissingTableError(error)) {
        setUsingLocalFallback(true);
        applyLocal();
      }
      setLoading(false);
      return;
    }

    setUsingLocalFallback(false);
    setNews(data ?? []);
    setLoading(false);
  }, [applyLocal, publishedOnly]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const saveLocal = async (item: Omit<ManualNewsRow, 'id' | 'created_at'>) => {
    const nextItem: ManualNewsRow = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    writeLocalNews(sortNews([nextItem, ...readLocalNews()]));
    applyLocal();
  };

  const save = async (item: Omit<ManualNewsRow, 'id' | 'created_at'>) => {
    if (usingLocalFallback) {
      await saveLocal(item);
      toast({ title: 'تم حفظ الخبر محليا', description: 'شغل جدول manual_news في Supabase عشان الحفظ يبقى دائم.' });
      return;
    }

    const { error } = await supabase.from('manual_news').insert(item);
    if (error) {
      if (isMissingTableError(error)) {
        setUsingLocalFallback(true);
        await saveLocal(item);
        toast({ title: 'تم حفظ الخبر محليا', description: 'جدول manual_news غير موجود في Supabase حتى الآن.' });
        return;
      }
      toast({ title: 'فشل حفظ الخبر', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم حفظ الخبر' });
    await fetch();
  };

  const update = async (id: string, item: Partial<ManualNewsRow>) => {
    if (usingLocalFallback) {
      writeLocalNews(readLocalNews().map((row) => (row.id === id ? { ...row, ...item } : row)));
      applyLocal();
      return;
    }
    const { error } = await supabase.from('manual_news').update(item).eq('id', id);
    if (error) {
      toast({ title: 'فشل تعديل الخبر', description: error.message, variant: 'destructive' });
      return;
    }
    await fetch();
  };

  const remove = async (id: string) => {
    if (usingLocalFallback) {
      writeLocalNews(readLocalNews().filter((row) => row.id !== id));
      applyLocal();
      return;
    }
    const { error } = await supabase.from('manual_news').delete().eq('id', id);
    if (error) {
      toast({ title: 'فشل حذف الخبر', description: error.message, variant: 'destructive' });
      return;
    }
    await fetch();
  };

  const togglePublish = async (id: string, is_published: boolean) => {
    if (usingLocalFallback) {
      writeLocalNews(readLocalNews().map((row) => (row.id === id ? { ...row, is_published } : row)));
      applyLocal();
      return;
    }
    const { error } = await supabase.from('manual_news').update({ is_published }).eq('id', id);
    if (error) console.error('[manual_news] toggle error:', error);
    await fetch();
  };

  return { news, loading, save, update, remove, togglePublish, refresh: fetch, usingLocalFallback };
}
