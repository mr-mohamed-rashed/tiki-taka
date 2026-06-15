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
      live: 60 * 5,          // 5 minutes for live matches
      fixtures: 86400,       // 24 hours (schedule)
      results: 86400,        // 24 hours (cleared automatically after match finishes)
      standings: 86400,      // 24 hours (cleared automatically after match finishes)
      topscorers: 86400,     // 24 hours (cleared automatically after match finishes)
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

    // FETCH FROM API-SPORTS
    const apiFootballData = await fetchApiFootball({
      endpoint,
      league: body.league ?? '1',
      season: body.season ?? '2026',
      fixtureId: body.fixtureId,
    });

    const isRateLimited = apiFootballData.errors && Object.keys(apiFootballData.errors).length > 0;

    if (!isRateLimited) {
      if (supabase) {
        // Save to cache
        await supabase.from('api_cache').upsert({
          endpoint: cacheKey,
          data: apiFootballData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });

        // SMART POLLING: If we just fetched LIVE and a match is FINISHED ('FT', 'PEN', 'AET')
        // We delete the old results/standings cache so they get refreshed on the next visit!
        if (endpoint === 'live' && apiFootballData.response) {
          const hasJustFinished = apiFootballData.response.some((f: any) => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short));
          if (hasJustFinished) {
            await supabase.from('api_cache').delete().in('endpoint', [
              `results_1_2026_`,
              `standings_1_2026_`,
              `topscorers_1_2026_`
            ]);
          }
        }
      }
      return json({ provider: 'api-football', ...apiFootballData });
    } else {
      // Rate limit hit -> return stale cache!
      if (cachedData) return json({ provider: 'cache-stale', ...cachedData });
      return json({ error: 'API Rate limit reached' }, 429);
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

async function fetchApiFootball({ endpoint, league, season, fixtureId }: Required<Pick<ProxyRequest, 'endpoint' | 'league' | 'season'>> & Pick<ProxyRequest, 'fixtureId'>) {
  // @ts-ignore
  const apiKey = Deno.env.get('API_FOOTBALL_KEY') ?? '';
  if (!apiKey) return { response: [] };

  const headers: Record<string, string> = {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  };

  let apiUrl = '';
  switch (endpoint) {
    case 'live': apiUrl = `${API_FOOTBALL_BASE}/fixtures?live=all`; break;
    case 'fixtures': apiUrl = `${API_FOOTBALL_BASE}/fixtures?league=${league}&season=${season}&status=NS-1H-HT-2H-ET-P`; break;
    case 'results': apiUrl = `${API_FOOTBALL_BASE}/fixtures?league=${league}&season=${season}&status=FT-AET-PEN`; break;
    case 'standings':
    case 'groups': apiUrl = `${API_FOOTBALL_BASE}/standings?league=${league}&season=${season}`; break;
    case 'topscorers': apiUrl = `${API_FOOTBALL_BASE}/players/topscorers?league=${league}&season=${season}`; break;
    case 'fixture_events': apiUrl = `${API_FOOTBALL_BASE}/fixtures/events?fixture=${fixtureId}`; break;
    default: throw new Error('Unknown endpoint');
  }

  return await fetchJson(apiUrl, { headers });
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return await response.json();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
