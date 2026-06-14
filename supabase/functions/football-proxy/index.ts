const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WORLD_CUP_BASE = 'https://worldcup26.ir';
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

type ProxyEndpoint = 'live' | 'fixtures' | 'results' | 'standings' | 'topscorers' | 'fixture_events' | 'groups';

type ProxyRequest = {
  endpoint: ProxyEndpoint;
  league?: string;
  season?: string;
  fixtureId?: string;
};

type WorldCupGame = {
  id: string;
  home_score?: string;
  away_score?: string;
  group?: string;
  matchday?: string;
  local_date?: string;
  stadium_id?: string;
  finished?: string;
  time_elapsed?: string;
  type?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
};

type WorldCupStadium = {
  id: string;
  name_en?: string;
  fifa_name?: string;
  city_en?: string;
  country_en?: string;
};

type NormalizedMatch = {
  id: string;
  competition: string;
  stage: string;
  date: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: string;
  home: {
    id: string;
    name: string;
    shortName: string;
    flag: string;
    code: string;
    color: string;
  };
  away: {
    id: string;
    name: string;
    shortName: string;
    flag: string;
    code: string;
    color: string;
  };
  homeScore: number;
  awayScore: number;
  venue: string;
};

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

    if (['live', 'fixtures', 'results'].includes(endpoint)) {
      const worldCupData = await fetchWorldCupMatches(endpoint).catch(() => null);
      if (worldCupData) {
        return json({ provider: 'worldcup26', matches: worldCupData });
      }
    }

    const apiFootballData = await fetchApiFootball({
      endpoint,
      league: body.league ?? '1',
      season: body.season ?? '2026',
      fixtureId: body.fixtureId,
    });

    return json({ provider: 'api-football', ...apiFootballData });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});

async function fetchWorldCupMatches(endpoint: ProxyEndpoint): Promise<NormalizedMatch[]> {
  // Use ESPN API
  const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
  const data = await fetchJson(url).catch(() => ({ events: [] }));
  const events = data.events || [];

  return events
    .map(normalizeESPNMatch)
    .filter((match: NormalizedMatch) => {
      if (endpoint === 'live') return match.status === 'live';
      if (endpoint === 'results') return match.status === 'finished';
      return match.status === 'upcoming';
    })
    .sort((a: NormalizedMatch, b: NormalizedMatch) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, endpoint === 'fixtures' ? 12 : 20);
}

function normalizeESPNMatch(event: any): NormalizedMatch {
  const comp = event.competitions?.[0];
  const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
  const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
  const statusType = event.status?.type || {};
  
  // ESPN states: 'pre', 'in', 'post'
  const state = statusType.state;
  let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
  if (state === 'in') status = 'live';
  if (state === 'post') status = 'finished';

  const homeName = home?.team?.displayName || home?.team?.name || 'TBD';
  const awayName = away?.team?.displayName || away?.team?.name || 'TBD';

  return {
    id: String(event.id),
    competition: 'FIFA World Cup 2026',
    stage: event.season?.type === 2 ? 'Group Stage' : 'Knockout',
    date: event.date,
    status,
    minute: status === 'live' ? event.status?.displayClock : undefined,
    home: buildTeam(homeName, home?.team?.logo),
    away: buildTeam(awayName, away?.team?.logo),
    homeScore: parseInt(home?.score || '0') || 0,
    awayScore: parseInt(away?.score || '0') || 0,
    venue: comp?.venue?.fullName || '',
  };
}

function buildTeam(name: string, logo?: string) {
  const code = name === 'TBD' ? 'TBD' : name.slice(0, 3).toUpperCase();

  return {
    id: name,
    name,
    shortName: code,
    flag: logo || '',
    code,
    color: '#888888',
  };
}

function parseWorldCupDate(value?: string): string {
  if (!value) return new Date().toISOString();
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return new Date(value).toISOString();

  const [, month, day, year, hour, minute] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))).toISOString();
}

function formatStage(game: any): string {
  return 'World Cup 2026';
}

function formatVenue(stadium?: any): string {
  return '';
}

function toScore(value?: string): number {
  const score = Number(value);
  return Number.isFinite(score) ? score : 0;
}

async function fetchApiFootball({ endpoint, league, season, fixtureId }: Required<Pick<ProxyRequest, 'endpoint' | 'league' | 'season'>> & Pick<ProxyRequest, 'fixtureId'>) {
  const apiKey = Deno.env.get('API_FOOTBALL_KEY') ?? '';
  if (!apiKey) {
    return { response: [] };
  }

  const headers: Record<string, string> = {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  };

  let apiUrl = '';

  switch (endpoint) {
    case 'live':
      apiUrl = `${API_FOOTBALL_BASE}/fixtures?live=all`;
      break;
    case 'fixtures':
      apiUrl = `${API_FOOTBALL_BASE}/fixtures?league=${league}&season=${season}&status=NS-1H-HT-2H-ET-P`;
      break;
    case 'results':
      apiUrl = `${API_FOOTBALL_BASE}/fixtures?league=${league}&season=${season}&status=FT-AET-PEN`;
      break;
    case 'standings':
    case 'groups':
      apiUrl = `${API_FOOTBALL_BASE}/standings?league=${league}&season=${season}`;
      break;
    case 'topscorers':
      apiUrl = `${API_FOOTBALL_BASE}/players/topscorers?league=${league}&season=${season}`;
      break;
    case 'fixture_events':
      if (!fixtureId) throw new Error('fixtureId required');
      apiUrl = `${API_FOOTBALL_BASE}/fixtures/events?fixture=${fixtureId}`;
      break;
    default:
      throw new Error('Unknown endpoint');
  }

  return await fetchJson(apiUrl, { headers });
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return await response.json();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
