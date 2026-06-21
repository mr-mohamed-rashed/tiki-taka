import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPlayerRankings, teams, getLiveMatches, getUpcomingMatches, getFinishedMatches } from '@/lib/footballData';
import type { Match, Scorer } from '@/lib/footballData';
import { queryClient } from '@/App';

function getSmartPollingInterval(): number | false {
  const now = Date.now();
  const liveMatches = queryClient.getQueryData<Match[]>(['live-fixtures']) || [];
  const currentLive = liveMatches.filter(m => m.status === 'live');
  
  if (currentLive.length > 0) {
    const activeMatch = currentLive.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const kickoff = new Date(activeMatch.date).getTime();
    const elapsedMins = (now - kickoff) / 60000;
    
    if (elapsedMins < 0) return false;
    if (elapsedMins >= 0 && elapsedMins < 115) return 240_000;
    if (elapsedMins >= 115) return 240_000;
  }
  
  const upcoming = queryClient.getQueryData<Match[]>(['upcoming-fixtures']) || [];
  const nextUpcoming = upcoming
    .filter(m => new Date(m.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  if (nextUpcoming.length === 0) return false;
  
  const nextKickoff = new Date(nextUpcoming[0].date).getTime();
  const timeToKickoff = nextKickoff - now;
  
  if (timeToKickoff <= 0) return 240_000;
  return Math.min(timeToKickoff, 3600_000);
}

// Switching to Euro 2024 to fetch real data since World Cup 2026 hasn't started
const WC_LEAGUE = '4'; // Euro 2024
const WC_SEASON = '2024';

async function callProxy(body: object) {
  try {
    const { data, error } = await supabase.functions.invoke('football-proxy', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.error('Proxy failed', err);
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
        
        let results: Match[] = [];
        if (data?.matches) results = data.matches as Match[];
        else if (data?.response) results = data.response.map(mapFixture);
        
        if (!results || results.length === 0) {
          results = getLiveMatches();
        }
        
        if (!results) return [];
        
        const previousLive = queryClient.getQueryData<Match[]>(['live-fixtures']);
        const hadLive = previousLive?.some(m => m.status === 'live');
        const hasLiveNow = results.some(m => m.status === 'live');
        
        if (hadLive && !hasLiveNow) {
           queryClient.invalidateQueries({ queryKey: ['results'] });
           queryClient.invalidateQueries({ queryKey: ['upcoming-fixtures'] });
           queryClient.invalidateQueries({ queryKey: ['standings'] });
           queryClient.invalidateQueries({ queryKey: ['topscorers'] });
        }
        
        return results;
      } catch {
        return getLiveMatches();
      }
    },
    refetchInterval: getSmartPollingInterval,
    initialData: getLiveMatches,
  });
}

// ---------- Upcoming fixtures ----------
export function useUpcomingFixtures() {
  return useQuery({
    queryKey: ['upcoming-fixtures'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'fixtures', league: WC_LEAGUE, season: WC_SEASON });
        let results: Match[] = [];
        if (data?.matches?.length) results = getUpcomingOnly(data.matches as Match[]);
        else if (data?.response?.length) results = getUpcomingOnly(data.response.map(mapFixture));
        
        if (!results || results.length === 0) {
          results = getUpcomingMatches();
        }
        
        const now = Date.now();
        return results
          .filter(m => new Date(m.date).getTime() >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch {
        const now = Date.now();
        return getUpcomingMatches()
          .filter(m => new Date(m.date).getTime() >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    },
    refetchInterval: false,
    initialData: () => {
      const now = Date.now();
      return getUpcomingMatches()
        .filter(m => new Date(m.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
  });
}

// ---------- Results ----------
export function useResults() {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'results', league: WC_LEAGUE, season: WC_SEASON });
        let proxyResults: Match[] = [];
        if (data?.matches?.length) proxyResults = getFinishedOnly(data.matches as Match[]);
        else if (data?.response?.length) proxyResults = getFinishedOnly(data.response.map(mapFixture));
        
        if (!proxyResults || proxyResults.length === 0) {
          proxyResults = getFinishedMatches();
        }
        
        const teamsMap = Object.values(teams);
        
        proxyResults = proxyResults.map(m => {
          const homeTeam = teamsMap.find(t => t.name.toLowerCase() === m.home.name.toLowerCase() || t.id === m.home.id);
          const awayTeam = teamsMap.find(t => t.name.toLowerCase() === m.away.name.toLowerCase() || t.id === m.away.id);
          return {
            ...m,
            home: { ...m.home, flag: homeTeam?.flag || m.home.flag },
            away: { ...m.away, flag: awayTeam?.flag || m.away.flag }
          };
        });

        const uniqueResults: Match[] = [];
        const seen = new Set();
        for (const m of proxyResults) {
          const key = `${m.home.name}-${m.away.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(m);
          }
        }
        
        const sortedResults = uniqueResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Fetch highlights from Supabase
        const { data: settings, error } = await supabase.from('site_settings').select('*').like('key', 'match_highlight_%');
        if (!error && settings && settings.length > 0) {
          return sortedResults.map(match => {
            const h = settings.find((x: any) => x.key === `match_highlight_${match.id}`);
            if (h) {
              return { ...match, highlight_url: h.value_en };
            }
            return match;
          });
        }
        return sortedResults;
      } catch {
        return getFinishedMatches();
      }
    },
    refetchInterval: false,
    initialData: getFinishedMatches,
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
    refetchInterval: false,
  });
}

// ---------- Top Scorers ----------
export function useTopScorers() {
  return useQuery({
    queryKey: ['topscorers'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'topscorers', league: WC_LEAGUE, season: WC_SEASON });
        if (!data?.response?.length) return [];
        return data.response.slice(0, 10).map(mapScorer);
      } catch {
        return [];
      }
    },
    refetchInterval: false,
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
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  return matches
    .filter((match) => match.status === 'upcoming' && new Date(match.date).getTime() > cutoff)
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
