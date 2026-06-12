import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type VisitEventType = 'news_view' | 'highlights_view' | 'match_highlight_click';

interface TrackVisitOptions {
  eventType: VisitEventType;
  page: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export function useTrackVisit({ eventType, page, metadata }: TrackVisitOptions) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    supabase.from('visitor_events').insert({
      user_id: user.id,
      event_type: eventType,
      page,
      metadata: metadata ?? {},
    });
  }, [eventType, metadata, page, user]);
}

export async function trackVisitEvent(options: TrackVisitOptions & { userId?: string }) {
  if (!options.userId) return;

  await supabase.from('visitor_events').insert({
    user_id: options.userId,
    event_type: options.eventType,
    page: options.page,
    metadata: options.metadata ?? {},
  });
}
