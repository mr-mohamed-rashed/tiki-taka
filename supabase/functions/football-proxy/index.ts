const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

type ProxyEndpoint = 'live' | 'fixtures' | 'results' | 'standings' | 'topscorers' | 'fixture_events' | 'groups';

type ProxyRequest = {
  endpoint: ProxyEndpoint;
  league?: string;
  season?: string;
  fixtureId?: string;
};

// @ts-ignore - Import Supabase JS
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({})) as Partial<ProxyRequest>;
    const endpoint = body.endpoint;

    if (!endpoint) {
      return json({ error: 'Missing endpoint' }, 400);
    }

    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

    const cacheKey = `${endpoint}_${body.league || '1'}_${body.season || '2026'}_${body.fixtureId || ''}`;

    // SMART POLLING: Cache durations in seconds
    const cacheDurations: Record<string, number> = {
      live: 240,             // 4 minutes exactly for live matches
      fixtures: 43200,       // 12 hours (refreshed automatically when a match ends)
      results: 43200,        // 12 hours
      standings: 43200,      // 12 hours
      topscorers: 43200,     // 12 hours
    };

    const maxAge = cacheDurations[endpoint] || 3600;

    let cachedData = null;
    let cacheAge = Infinity;

    if (supabase) {
      // SMART POLLING: Don't poll LIVE if no match is currently active
      if (endpoint === 'live') {
        const { data: fixturesCache } = await supabase.from('api_cache').select('data').eq('endpoint', `fixtures_1_2026_`).single();
        if (fixturesCache && !isAnyMatchActive(fixturesCache.data)) {
          return json({ provider: 'smart-polling-idle', response: [] }); // 0 API requests spent!
        }
      }

      const { data: cacheRow } = await supabase.from('api_cache').select('*').eq('endpoint', cacheKey).single();
      if (cacheRow) {
        cachedData = cacheRow.data;
        const updatedAt = new Date(cacheRow.updated_at).getTime();
        cacheAge = (new Date().getTime() - updatedAt) / 1000;
        
        if (cacheAge < maxAge && cachedData && Object.keys(cachedData).length > 0) {
          return json({ provider: 'cache', ...cachedData });
        }
      }
    }

    // FETCH FROM ESPN OR MOCK
    const apiFootballData = await fetchEspnData({
      endpoint,
      league: body.league ?? '1',
      season: body.season ?? '2026',
      fixtureId: body.fixtureId,
    });

    // If fetch failed or returned empty array, serve stale cache!
    const isFetchFailed = apiFootballData.error || (apiFootballData.response && apiFootballData.response.length === 0);

    if (!isFetchFailed) {
      if (supabase) {
        // Save to cache
        await supabase.from('api_cache').upsert({
          endpoint: cacheKey,
          data: apiFootballData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });

        // SMART POLLING: If we just fetched LIVE and a match is FINISHED ('post')
        if (endpoint === 'live' && apiFootballData.response) {
          const hasJustFinished = apiFootballData.response.some((f: any) => {
            const status = f.competitions?.[0]?.status?.type?.state;
            return status === 'post';
          });
          if (hasJustFinished) {
            await supabase.from('api_cache').delete().in('endpoint', [
              `fixtures_1_2026_`,
              `results_1_2026_`
            ]);
          }
        }
      }
      return json({ provider: 'espn', ...apiFootballData });
    } else {
      // ESPN is down or returned empty -> return stale cache so data is never lost!
      if (cachedData) return json({ provider: 'cache-stale', ...cachedData });
      return json({ error: 'ESPN API failed and no cache available' }, 502);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});

// Helper: check if any match is in the active window (15 mins before to 3 hours after)
function isAnyMatchActive(fixturesData: any) {
  if (!fixturesData?.response) return true;
  const now = new Date().getTime();
  
  for (const f of fixturesData.response) {
    if (['FT', 'AET', 'PEN'].includes(f.fixture.status.short)) continue;
    const matchTime = new Date(f.fixture.date).getTime();
    if (now >= matchTime - 15 * 60 * 1000 && now <= matchTime + 180 * 60 * 1000) {
      return true;
    }
  }
  return false; 
}

async function fetchEspnData({ endpoint, league, season }: Required<Pick<ProxyRequest, 'endpoint' | 'league' | 'season'>> & Pick<ProxyRequest, 'fixtureId'>) {
  if (endpoint === 'live' || endpoint === 'fixtures' || endpoint === 'results') {
    try {
      const datesParam = season === '2026' ? '?dates=20260611-20260719' : '';
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard${datesParam}`;
      const data = await fetchJson(url);
      return { response: data.events || [], espn: true };
    } catch (e: any) {
      console.error('ESPN fetch failed', e);
      return { response: [], espn: true, error: e.message };
    }
  }

  // Standings, topscorers, groups are not supported by the ESPN scoreboard endpoint yet.
  return { response: [], espn: true };
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return await response.json();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
