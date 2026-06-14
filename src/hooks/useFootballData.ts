import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLiveMatches, getUpcomingMatches, getFinishedMatches, getTopScorers, getPlayerRankings, teams } from '@/lib/footballData';
import type { Match, Scorer } from '@/lib/footballData';

// World Cup 2026 league ID on API-Football is 1
const WC_LEAGUE = '1';
const WC_SEASON = '2026';
const WORLD_CUP_API = 'https://worldcup26.ir';

async function callProxy(body: object) {
  try {
    const { data, error } = await supabase.functions.invoke('football-proxy', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.error('Proxy failed, attempting direct fetch...', err);
    if (['live', 'fixtures', 'results'].includes((body as any).endpoint)) {
      try {
        const res = await fetch(`${WORLD_CUP_API}/get/games`);
        const json = await res.json();
        const games = Array.isArray(json) ? json : json?.games;
        if (Array.isArray(games)) {
          // Normalize directly using our getUpcomingMatches as a base
          const baseMatches = getUpcomingMatches();
          const mapped = baseMatches.map(m => {
            const apiGame = games.find((g: any) => 
              g.home_team_name_en?.toLowerCase() === m.home.name.toLowerCase() &&
              g.away_team_name_en?.toLowerCase() === m.away.name.toLowerCase()
            );
            if (apiGame) {
              const finished = String(apiGame.finished ?? '').toLowerCase() === 'true';
              const timeElapsed = String(apiGame.time_elapsed ?? '').toLowerCase();
              const isLive = !finished && timeElapsed !== 'notstarted' && timeElapsed !== '' && timeElapsed !== 'null';
              
              return {
                ...m,
                homeScore: Number(apiGame.home_score) || 0,
                awayScore: Number(apiGame.away_score) || 0,
                status: isLive ? 'live' : finished ? 'finished' : 'upcoming',
                minute: isLive ? `${timeElapsed}'` : undefined,
              };
            }
            return m;
          });
          
          return {
            provider: 'worldcup26-direct',
            matches: mapped.filter((m) => {
              if ((body as any).endpoint === 'live') return m.status === 'live';
              if ((body as any).endpoint === 'results') return m.status === 'finished';
              return m.status === 'upcoming';
            })
          };
        }
      } catch (directErr) {
        console.error('Direct fetch also failed', directErr);
      }
    }
    throw err;
  }
}

// ---------- Live fixtures ----------
export function useLiveFixtures() {
  return useQuery({
    queryKey: ['live-fixtures'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'live' });
        if (data?.matches?.length) return data.matches as Match[];
        if (!data?.response?.length) return getLiveMatches(); // fallback to mock
        // Map API-Football response to our Match type
        return data.response.map(mapFixture);
      } catch {
        return getLiveMatches();
      }
    },
    refetchInterval: 30_000,
  });
}

// ---------- Upcoming fixtures ----------
export function useUpcomingFixtures() {
  return useQuery({
    queryKey: ['upcoming-fixtures'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'fixtures', league: WC_LEAGUE, season: WC_SEASON });
        if (data?.matches?.length) return getUpcomingOnly(data.matches as Match[]);
        if (!data?.response?.length) return getUpcomingOnly(getUpcomingMatches());
        return getUpcomingOnly(data.response.map(mapFixture));
      } catch {
        return getUpcomingOnly(getUpcomingMatches());
      }
    },
    refetchInterval: 120_000,
  });
}

// ---------- Results ----------
export function useResults() {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'results', league: WC_LEAGUE, season: WC_SEASON });
        if (data?.matches?.length) return getFinishedOnly(data.matches as Match[]);
        if (!data?.response?.length) return getMockResults();
        return getFinishedOnly(data.response.map(mapFixture));
      } catch {
        return getMockResults();
      }
    },
    refetchInterval: 120_000,
  });
}

// ---------- Standings / Groups ----------
export function useStandings() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'standings', league: WC_LEAGUE, season: WC_SEASON });
        if (!data?.response?.[0]?.league?.standings) return null;
        return data.response[0].league.standings as ApiStandingGroup[];
      } catch {
        return null;
      }
    },
    refetchInterval: 120_000,
  });
}

// ---------- Top Scorers ----------
export function useTopScorers() {
  return useQuery({
    queryKey: ['topscorers'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'topscorers', league: WC_LEAGUE, season: WC_SEASON });
        if (!data?.response?.length) return await getWorldCupTopScorers();
        return data.response.slice(0, 10).map(mapScorer);
      } catch {
        return await getWorldCupTopScorers();
      }
    },
    refetchInterval: 180_000,
  });
}

// ---------- Best Players (reuse mock - API doesn't expose ratings) ----------
export function useBestPlayers() {
  return useQuery({
    queryKey: ['bestplayers'],
    queryFn: () => getPlayerRankings(),
  });
}

// ---------- Mappers ----------

type ApiFixture = {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string } };
  league: { name: string; round: string };
  teams: { home: ApiTeam; away: ApiTeam };
  goals: { home: number | null; away: number | null };
};
type ApiTeam = { id: number; name: string; logo: string; winner: boolean | null };
type ApiStandingGroup = { group?: string; rank: number; team: ApiTeam; points: number; goalsDiff: number; all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } } }[];

function mapFixture(f: ApiFixture) {
  const statusShort = f.fixture.status.short;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(statusShort);
  const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
  return {
    id: String(f.fixture.id),
    competition: f.league.name,
    stage: f.league.round,
    date: f.fixture.date,
    status: isLive ? 'live' as const : isFinished ? 'finished' as const : 'upcoming' as const,
    minute: isLive && f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : undefined,
    home: {
      id: String(f.teams.home.id),
      name: f.teams.home.name,
      shortName: f.teams.home.name.slice(0, 3).toUpperCase(),
      flag: f.teams.home.logo,
      code: f.teams.home.name.slice(0, 2).toUpperCase(),
      color: '#888888',
    },
    away: {
      id: String(f.teams.away.id),
      name: f.teams.away.name,
      shortName: f.teams.away.name.slice(0, 3).toUpperCase(),
      flag: f.teams.away.logo,
      code: f.teams.away.name.slice(0, 2).toUpperCase(),
      color: '#AAAAAA',
    },
    homeScore: f.goals.home ?? 0,
    awayScore: f.goals.away ?? 0,
    venue: f.fixture.venue?.name ?? '',
  };
}

function getUpcomingOnly(matches: Match[]) {
  const now = Date.now();

  return matches
    .filter((match) => match.status === 'upcoming' && new Date(match.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getFinishedOnly(matches: Match[]) {
  return matches
    .filter((match) => match.status === 'finished')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

type ApiScorer = { player: { name: string }; statistics: [{ team: { name: string; logo: string }; goals: { total: number; assists: number | null }; games: { appearences: number } }] };
function mapScorer(s: ApiScorer, i: number) {
  const stat = s.statistics[0];
  return {
    rank: i + 1,
    name: s.player.name,
    club: stat.team.name,
    country: {
      id: stat.team.name,
      name: stat.team.name,
      shortName: stat.team.name.slice(0, 3).toUpperCase(),
      flag: stat.team.logo,
      code: stat.team.name.slice(0, 2).toUpperCase(),
      color: '#888888',
    },
    goals: stat.goals.total ?? 0,
    assists: stat.goals.assists ?? 0,
    matches: stat.games.appearences ?? 0,
    isLeader: i === 0,
  };
}

type WorldCupGame = {
  finished?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_scorers?: string | null;
  away_scorers?: string | null;
};

async function getWorldCupTopScorers(): Promise<Scorer[]> {
  try {
    const response = await fetch(`${WORLD_CUP_API}/get/games`);
    if (!response.ok) throw new Error('WorldCup26 scorers unavailable');
    const data = await response.json();
    const games: WorldCupGame[] = Array.isArray(data) ? data : data?.games;
    if (!Array.isArray(games)) return getTopScorers();

    const scorerMap = new Map<string, Scorer>();

    for (const game of games) {
      if (String(game.finished).toLowerCase() !== 'true') continue;
      addScorersFromString(scorerMap, game.home_scorers, game.home_team_name_en || 'Team');
      addScorersFromString(scorerMap, game.away_scorers, game.away_team_name_en || 'Team');
    }

    const scorers = Array.from(scorerMap.values())
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .map((scorer, index) => ({
        ...scorer,
        rank: index + 1,
        isLeader: index === 0,
      }));

    return scorers.length ? scorers.slice(0, 20) : getTopScorers();
  } catch {
    return getTopScorers();
  }
}

function addScorersFromString(scorerMap: Map<string, Scorer>, raw: string | null | undefined, teamName: string) {
  if (!raw || raw === 'null') return;

  for (const scorerName of parseWorldCupScorers(raw)) {
    const key = `${scorerName}|${teamName}`;
    const existing = scorerMap.get(key);

    if (existing) {
      existing.goals += 1;
      continue;
    }

    scorerMap.set(key, {
      rank: 0,
      name: scorerName,
      club: teamName,
      country: {
        id: teamName,
        name: teamName,
        shortName: teamName.slice(0, 3).toUpperCase(),
        flag: teamFlag(teamName),
        code: teamName.slice(0, 2).toUpperCase(),
        color: '#888888',
      },
      goals: 1,
      assists: 0,
      matches: 1,
    });
  }
}

function parseWorldCupScorers(raw: string) {
  return raw
    .replace(/[{}]/g, '')
    .split(',')
    .map((part) => part
      .replace(/[“”"]/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+\d{1,3}'(?:\+\d+')?/g, '')
      .replace(/\s+\d{1,3}'/g, '')
      .trim())
    .filter(Boolean);
}

function teamFlag(teamName: string) {
  const team = Object.values(teams).find(t => t.name.toLowerCase() === teamName.toLowerCase() || t.id.toLowerCase() === teamName.toLowerCase());
  if (team) return team.flag;

  const flags: Record<string, string> = {
    Mexico: 'mx',
    'South Africa': 'za',
    'South Korea': 'kr',
    'Czech Republic': 'cz',
    Canada: 'ca',
    'Bosnia and Herzegovina': 'ba',
    'United States': 'us',
    Paraguay: 'py',
  };

  const code = flags[teamName];
  return code ? `https://flagcdn.com/w160/${code}.png` : '';
}

function getMockResults() {
  const now = Date.now();
  const pastUpcoming = getUpcomingMatches()
    .filter(m => new Date(m.date).getTime() <= now - 105 * 60000)
    .map(m => ({ ...m, status: 'finished' as const }));

  return getFinishedOnly([...getFinishedMatches(), ...pastUpcoming]);
}

export type { ApiStandingGroup };
