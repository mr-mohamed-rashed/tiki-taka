import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { teams } from '@/lib/footballData';
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

// World Cup 2026 league ID on API-Football is 1
const WC_LEAGUE = '1';
const WC_SEASON = '2026';

async function fetchEspnDirectly(season: string) {
  const datesParam = season === '2026' ? '?dates=20260611-20260719' : '';
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard${datesParam}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ESPN failed: ${response.status}`);
  const data = await response.json();
  return { response: data.events || [], espn: true };
}

async function callProxy(body: any) {
  try {
    if (['live', 'fixtures', 'results'].includes(body.endpoint)) {
      const cacheKey = `${body.endpoint}_${body.league}_${body.season}_`;
      try {
        const espnData = await fetchEspnDirectly(body.season ?? '2026');
        
        // Save to cache asynchronously to survive apocalyptic scenarios
        supabase.from('api_cache').upsert({
          endpoint: cacheKey,
          data: espnData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' }).then(({ error }) => {
          if (error) console.error('Cache save failed', error);
        });
        
        return espnData;
      } catch (espnErr) {
        console.warn('ESPN fetch failed, falling back to DB cache', espnErr);
        const { data: cacheRow } = await supabase.from('api_cache')
          .select('data')
          .eq('endpoint', cacheKey)
          .single();
          
        if (cacheRow?.data) return cacheRow.data;
        throw espnErr;
      }
    }
    
    // Top scorers & Standings not supported by ESPN yet, trigger mock fallback
    throw new Error('Not supported by ESPN');
  } catch (err) {
    console.error('Data fetch failed', err);
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
        if (data?.espn) {
          results = data.response.map(mapEspnFixture).filter(m => m.status === 'live');
        } else if (data?.response?.length) {
          results = data.response.map(mapFixture);
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
        return [];
      }
    },
    refetchInterval: getSmartPollingInterval,
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
        if (data?.espn) {
          results = getUpcomingOnly(data.response.map(mapEspnFixture));
        } else if (data?.matches?.length) {
          results = getUpcomingOnly(data.matches as Match[]);
        } else if (data?.response?.length) {
          results = getUpcomingOnly(data.response.map(mapFixture));
        }
        
        const now = Date.now();
        return results
          .filter(m => new Date(m.date).getTime() >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch {
        return [];
      }
    },
    refetchInterval: false,
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
        if (data?.espn) {
          proxyResults = getFinishedOnly(data.response.map(mapEspnFixture));
        } else if (data?.matches?.length) {
          proxyResults = getFinishedOnly(data.matches as Match[]);
        } else if (data?.response?.length) {
          proxyResults = getFinishedOnly(data.response.map(mapFixture));
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
        return [];
      }
    },
    refetchInterval: false,
  });
}

// ---------- Standings / Groups ----------
export function useStandings() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'standings', league: WC_LEAGUE, season: WC_SEASON });
        if (!data || !data.response || !Array.isArray(data.response)) {
          return [];
        }

        // Parse ESPN standings format
        const espnGroups = data.response;
        return espnGroups.map((group: any) => {
          const groupName = group.name || group.abbreviation;
          const teams = group.standings.entries.map((entry: any) => {
            const stats = entry.stats || [];
            const getStat = (name: string) => stats.find((s: any) => s.name === name)?.value || 0;
            
            return {
              rank: getStat('rank') || entry.note?.rank || 0,
              name: entry.team.displayName || entry.team.name,
              nameAr: entry.team.displayName || entry.team.name, // Will translate in component if needed
              flag: entry.team.logos?.[0]?.href || `https://flagcdn.com/w160/${entry.team.abbreviation?.toLowerCase().slice(0, 2)}.png`,
              played: getStat('gamesPlayed'),
              won: getStat('wins'),
              drawn: getStat('ties'),
              lost: getStat('losses'),
              gf: getStat('pointsFor'),
              ga: getStat('pointsAgainst'),
              gd: getStat('pointDifferential'),
              points: getStat('points'),
              confirmed: true,
            };
          });

          return {
            name: groupName,
            nameAr: groupName.replace('Group', 'المجموعة'),
            teams: teams.sort((a: any, b: any) => a.rank - b.rank)
          };
        });
      } catch (e) {
        console.error('Failed to fetch standings', e);
        return [];
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
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .order('goals', { ascending: false })
          .order('assists', { ascending: false })
          .limit(10);
          
        if (error || !data) return [];
        
        return data.map((p, i) => ({
          rank: i + 1,
          name: p.player_name,
          club: p.team_name,
          country: {
            id: p.team_name,
            name: p.team_name,
            shortName: p.team_name.slice(0, 3).toUpperCase(),
            flag: `https://flagcdn.com/w160/${p.team_name.slice(0, 2).toLowerCase()}.png`, // Fallback
            code: p.team_name.slice(0, 2).toUpperCase(),
            color: '#888888',
          },
          goals: p.goals,
          assists: p.assists,
          matches: 0,
          isLeader: i === 0,
        }));
      } catch {
        return [];
      }
    },
    refetchInterval: false,
  });
}

export function useBestPlayers() {
  return useQuery({
    queryKey: ['bestplayers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .order('motm_awards', { ascending: false })
          .order('goals', { ascending: false })
          .limit(10);
          
        if (error || !data) return [];
        
        return data.map((p, i) => ({
          rank: i + 1,
          name: p.player_name,
          club: p.team_name,
          country: {
            id: p.team_name,
            name: p.team_name,
            shortName: p.team_name.slice(0, 3).toUpperCase(),
            flag: `https://flagcdn.com/w160/${p.team_name.slice(0, 2).toLowerCase()}.png`,
            code: p.team_name.slice(0, 2).toUpperCase(),
            color: '#888888',
          },
          goals: p.goals,
          assists: p.assists,
          matches: p.motm_awards, // Show MOTM awards here instead of matches
          isLeader: i === 0,
        }));
      } catch {
        return [];
      }
    },
    refetchInterval: false,
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

function mapEspnFixture(e: any): Match {
  const comp = e.competitions[0];
  const home = comp.competitors.find((c: any) => c.homeAway === 'home');
  const away = comp.competitors.find((c: any) => c.homeAway === 'away');
  
  const statusState = comp.status.type.state; // 'pre', 'in', 'post'
  const isLive = statusState === 'in';
  const isFinished = statusState === 'post';

  return {
    id: String(e.id),
    competition: e.season?.year === 2026 ? 'FIFA World Cup 2026' : e.name,
    stage: 'Group Stage', // ESPN doesn't always provide clean stage strings
    date: e.date,
    status: isLive ? 'live' : isFinished ? 'finished' : 'upcoming',
    minute: isLive ? comp.status.displayClock : undefined,
    home: {
      id: home.id,
      name: home.team.name,
      shortName: home.team.abbreviation || home.team.name.slice(0, 3).toUpperCase(),
      flag: home.team.logo,
      code: home.team.abbreviation || home.team.name.slice(0, 2).toUpperCase(),
      color: '#888888',
    },
    away: {
      id: away.id,
      name: away.team.name,
      shortName: away.team.abbreviation || away.team.name.slice(0, 3).toUpperCase(),
      flag: away.team.logo,
      code: away.team.abbreviation || away.team.name.slice(0, 2).toUpperCase(),
      color: '#AAAAAA',
    },
    homeScore: parseInt(home.score, 10) || 0,
    awayScore: parseInt(away.score, 10) || 0,
    venue: comp.venue?.fullName || '',
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
