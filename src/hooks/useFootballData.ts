import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLiveMatches, getUpcomingMatches, getFinishedMatches, getTopScorers, getPlayerRankings } from '@/lib/footballData';
import type { Match } from '@/lib/footballData';

// World Cup 2026 league ID on API-Football is 1
const WC_LEAGUE = '1';
const WC_SEASON = '2026';

async function callProxy(body: object) {
  const { data, error } = await supabase.functions.invoke('football-proxy', { body });
  if (error) throw error;
  return data;
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
        if (!data?.response?.length) return getFinishedMatches();
        return getFinishedOnly(data.response.map(mapFixture));
      } catch {
        return getFinishedMatches();
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
        if (!data?.response?.length) return getTopScorers();
        return data.response.slice(0, 10).map(mapScorer);
      } catch {
        return getTopScorers();
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

export type { ApiStandingGroup };
