import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a random UUID for the session if it doesn't exist
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export function useAnalytics() {
  const location = useLocation();
  const presenceChannel = useRef<any>(null);

  // 1. Record Page Views
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const userAgent = navigator.userAgent;
        let deviceType = 'Desktop';
        if (/Mobi|Android/i.test(userAgent)) {
          deviceType = 'Mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
          deviceType = 'Tablet';
        }

        await supabase.from('page_views').insert({
          path: location.pathname,
          user_agent: userAgent,
          device_type: deviceType,
        });
      } catch (error) {
        console.error('Failed to record page view:', error);
      }
    };

    recordPageView();
  }, [location.pathname]);

  // 2. Track Live Presence
  useEffect(() => {
    const sessionId = getSessionId();
    
    // Create a presence channel for all visitors
    const channel = supabase.channel('global_visitors', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    presenceChannel.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      // Intentionally left blank, we just need to join
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const userAgent = navigator.userAgent;
        let deviceType = 'Desktop';
        if (/Mobi|Android/i.test(userAgent)) deviceType = 'Mobile';
        
        await channel.track({
          page: location.pathname,
          device: deviceType,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      if (presenceChannel.current) {
        supabase.removeChannel(presenceChannel.current);
      }
    };
  }, [location.pathname]);
}
