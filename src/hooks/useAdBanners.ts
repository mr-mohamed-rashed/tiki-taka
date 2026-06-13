import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdBannerRow {
  id: string;
  position: string;
  slot_id?: string;
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  width?: string;
  height?: string;
  created_at: string;
}

type AdBannerInput = Omit<AdBannerRow, 'id' | 'created_at'>;

const LOCAL_KEY = 'tiki_taka_ad_banners';

function isMissingTableError(error: { message?: string; code?: string } | null) {
  return Boolean(error && (error.code === '42P01' || error.message?.includes('ad_banners')));
}

function readLocalBanners() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? (JSON.parse(stored) as AdBannerRow[]) : [];
  } catch {
    return [];
  }
}

function writeLocalBanners(items: AdBannerRow[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function sortBanners(items: AdBannerRow[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));
}

function filterByPosition(items: AdBannerRow[], position?: string) {
  if (!position) return items;
  return items.filter((banner) => banner.position === position || banner.slot_id === position);
}

function toDbPayload(banner: Partial<AdBannerInput>) {
  return {
    position: banner.position || banner.slot_id || 'hero',
    slot_id: banner.slot_id || null,
    title: banner.title || '',
    image_url: banner.image_url || '',
    link_url: banner.link_url || '',
    is_active: banner.is_active ?? true,
    sort_order: banner.sort_order ?? 0,
    width: banner.width || '280px',
    height: banner.height || 'auto',
  };
}

export function useAdBanners(position?: string) {
  const [banners, setBanners] = useState<AdBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const applyLocal = useCallback(() => {
    setBanners(sortBanners(filterByPosition(readLocalBanners(), position)));
  }, [position]);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('ad_banners').select('*').order('sort_order');
    if (position) query = query.or(`position.eq.${position},slot_id.eq.${position}`);

    const { data, error } = await query;

    if (error) {
      console.error('[ad_banners] fetch error:', error);
      if (isMissingTableError(error)) {
        setUsingLocalFallback(true);
        applyLocal();
      }
      setLoading(false);
      return;
    }

    setUsingLocalFallback(false);
    setBanners(sortBanners((data ?? []) as AdBannerRow[]));
    setLoading(false);
  }, [applyLocal, position]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const saveLocal = async (banner: AdBannerInput) => {
    const nextBanner: AdBannerRow = {
      ...banner,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    writeLocalBanners(sortBanners([nextBanner, ...readLocalBanners()]));
    applyLocal();
  };

  const save = async (banner: AdBannerInput) => {
    if (usingLocalFallback) {
      await saveLocal(banner);
      toast({ title: 'تم حفظ الإعلان محليا', description: 'شغل جدول ad_banners في Supabase عشان الحفظ يبقى دائم.' });
      return;
    }

    const { error } = await (supabase.from('ad_banners') as any).insert(toDbPayload(banner));
    if (error) {
      if (isMissingTableError(error)) {
        setUsingLocalFallback(true);
        await saveLocal(banner);
        toast({ title: 'تم حفظ الإعلان محليا', description: 'جدول ad_banners غير موجود في Supabase حتى الآن.' });
        return;
      }
      toast({ title: 'Failed to add ad', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Ad added!' });
    await fetch();
  };

  const update = async (id: string, banner: Partial<AdBannerRow>) => {
    if (usingLocalFallback) {
      writeLocalBanners(readLocalBanners().map((row) => (row.id === id ? { ...row, ...banner } : row)));
      applyLocal();
      return;
    }

    const { error } = await (supabase.from('ad_banners') as any).update(toDbPayload(banner)).eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    await fetch();
  };

  const remove = async (id: string) => {
    if (usingLocalFallback) {
      writeLocalBanners(readLocalBanners().filter((row) => row.id !== id));
      applyLocal();
      return;
    }

    const { error } = await supabase.from('ad_banners').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    await fetch();
  };

  const toggle = async (id: string, is_active: boolean) => {
    if (usingLocalFallback) {
      writeLocalBanners(readLocalBanners().map((row) => (row.id === id ? { ...row, is_active } : row)));
      applyLocal();
      return;
    }

    const { error } = await supabase.from('ad_banners').update({ is_active }).eq('id', id);
    if (error) console.error('[ad_banners] toggle error:', error);
    await fetch();
  };

  return { banners, loading, save, update, remove, toggle, refresh: fetch, usingLocalFallback };
}
