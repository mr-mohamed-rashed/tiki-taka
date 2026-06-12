import { useEffect, useState, useCallback } from 'react';
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
type AdBannerPayload = Omit<AdBannerInput, 'width' | 'height' | 'slot_id'>;

function toAdBannerPayload(banner: Partial<AdBannerInput>): Partial<AdBannerPayload> {
  const { width, height, slot_id, ...payload } = banner;

  if (slot_id) {
    payload.position = slot_id;
  }

  return payload;
}

export function useAdBanners(position?: string) {
  const [banners, setBanners] = useState<AdBannerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('ad_banners').select('*').order('sort_order');
    if (position) q = q.eq('position', position);
    const { data, error } = await q;
    if (error) console.error('[ad_banners] fetch error:', error);
    if (data) setBanners(data);
    setLoading(false);
  }, [position]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async (banner: AdBannerInput) => {
    const bannerData = toAdBannerPayload(banner);
    const { error } = await supabase.from('ad_banners').insert(bannerData);
    if (error) { toast({ title: 'Failed to add ad', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Ad added!' });
    await fetch();
  };

  const update = async (id: string, banner: Partial<AdBannerRow>) => {
    const bannerData = toAdBannerPayload(banner);
    const { error } = await supabase.from('ad_banners').update(bannerData).eq('id', id);
    if (error) { toast({ title: 'Update failed', description: error.message, variant: 'destructive' }); return; }
    await fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('ad_banners').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    await fetch();
  };

  const toggle = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('ad_banners').update({ is_active }).eq('id', id);
    if (error) console.error('[ad_banners] toggle error:', error);
    await fetch();
  };

  return { banners, loading, save, update, remove, toggle, refresh: fetch };
}
