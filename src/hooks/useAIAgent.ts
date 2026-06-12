import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AIAction = 'ticker' | 'news' | 'predict' | 'commentary' | 'trending';

export function useAIAgent<T>(action: AIAction, payload?: Record<string, unknown>, lang: string = 'en') {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stringify payload for dependency array to avoid infinite loops
  const payloadString = payload ? JSON.stringify(payload) : '';

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: responseData, error: apiError } = await supabase.functions.invoke('ai-football-agent', {
          body: { action, payload: payloadString ? JSON.parse(payloadString) : undefined, lang },
        });

        if (apiError) throw apiError;
        
        if (isMounted) {
          setData(responseData);
        }
      } catch (err: unknown) {
        console.error(`Error fetching AI data for ${action}:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch AI data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Optional: Set up polling for real-time feel (e.g., every 5 minutes for ticker/news)
    let interval: NodeJS.Timeout;
    if (action === 'ticker' || action === 'news' || action === 'trending') {
      interval = setInterval(fetchData, 5 * 60 * 1000);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [action, payloadString, lang]);

  return { data, isLoading, error };
}
