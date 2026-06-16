import re

with open(r'c:\Users\Laptop World\Documents\tiki-taka\src\hooks\useFootballData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace callProxy fallback logic with clean version
call_proxy_clean = """async function callProxy(body: object) {
  try {
    const { data, error } = await supabase.functions.invoke('football-proxy', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.error('Proxy failed', err);
    return null;
  }
}

async function fetchWorldCupGames(): Promise<Match[]> {
  try {
    const res = await fetch(`${WORLD_CUP_API}/get/games`);
    if (!res.ok) return [];
    const json = await res.json();
    const games = Array.isArray(json) ? json : json?.games;
    if (!Array.isArray(games)) return [];

    const baseMatches = [...getFinishedMatches(), ...getUpcomingMatches()];
    const mapped: Match[] = [];

    for (const g of games) {
      if (!g.home_team_name_en || !g.away_team_name_en) continue;
      
      const apiHome = (g.home_team_name_en || '').toLowerCase().replace('turkey', 'turkiye').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const apiAway = (g.away_team_name_en || '').toLowerCase().replace('turkey', 'turkiye').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const baseMatch = baseMatches.find(m => {
         const myHome = m.home.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
         const myAway = m.away.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
         return apiHome === myHome && apiAway === myAway;
      });

      const finished = String(g.finished ?? '').toLowerCase() === 'true' || String(g.time_elapsed ?? '').toLowerCase() === 'finished';
      const timeElapsed = String(g.time_elapsed ?? '').toLowerCase();
      const isLive = !finished && timeElapsed !== 'notstarted' && timeElapsed !== '' && timeElapsed !== 'null';

      const matchId = baseMatch?.id || `${apiHome}-${apiAway}`;
      
      const homeTeamRef = Object.values(teams).find(t => t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === apiHome) || {
        id: apiHome, name: g.home_team_name_en, shortName: g.home_team_name_en.slice(0,3).toUpperCase(), flag: teamFlag(g.home_team_name_en), code: 'XX', color: '#888'
      };
      
      const awayTeamRef = Object.values(teams).find(t => t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === apiAway) || {
        id: apiAway, name: g.away_team_name_en, shortName: g.away_team_name_en.slice(0,3).toUpperCase(), flag: teamFlag(g.away_team_name_en), code: 'XX', color: '#888'
      };

      mapped.push({
        id: matchId,
        competition: 'FIFA World Cup 2026',
        stage: baseMatch?.stage || (g.type === 'group' ? 'Group Stage' : g.type),
        date: baseMatch?.date || new Date().toISOString(),
        status: isLive ? 'live' : finished ? 'finished' : 'upcoming',
        minute: isLive ? `${timeElapsed}'` : undefined,
        home: homeTeamRef,
        away: awayTeamRef,
        homeScore: Number(g.home_score) || 0,
        awayScore: Number(g.away_score) || 0,
        venue: baseMatch?.venue || 'TBD',
      });
    }
    return mapped;
  } catch (err) {
    console.error('Fetch games failed', err);
    return [];
  }
}
"""

content = re.sub(r"async function callProxy\(body: object\) \{.*?return data;\s*\}\s*catch\s*\(err\)\s*\{.*?return null;\s*\}\s*\}", call_proxy_clean, content, flags=re.DOTALL)


# Now replace the useQueries:
use_live = """export function useLiveFixtures() {
  return useQuery({
    queryKey: ['live-fixtures'],
    queryFn: async () => {
      const matches = await fetchWorldCupGames();
      return interpolateLiveMinutes(matches.filter(m => m.status === 'live'));
    },
    refetchInterval: 30_000,
  });
}"""

content = re.sub(r"export function useLiveFixtures\(\).*?refetchInterval: 30_000,\s*}\);", use_live, content, flags=re.DOTALL)

use_upcoming = """export function useUpcomingFixtures() {
  return useQuery({
    queryKey: ['upcoming-fixtures'],
    queryFn: async () => {
      const matches = await fetchWorldCupGames();
      return matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    refetchInterval: 120_000,
  });
}"""

content = re.sub(r"export function useUpcomingFixtures\(\).*?refetchInterval: 120_000,\s*}\);", use_upcoming, content, flags=re.DOTALL)

use_results = """export function useResults() {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      const matches = await fetchWorldCupGames();
      const finished = matches.filter(m => m.status === 'finished').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const { data: settings, error } = await supabase.from('site_settings').select('*').like('key', 'match_highlight_%');
      if (!error && settings && settings.length > 0) {
        return finished.map(match => {
          const h = settings.find((x: any) => x.key === `match_highlight_${match.id}`);
          if (h) return { ...match, highlight_url: h.value_en };
          return match;
        });
      }
      return finished;
    },
    refetchInterval: 120_000,
  });
}"""

content = re.sub(r"export function useResults\(\).*?refetchInterval: 120_000,\s*}\);", use_results, content, flags=re.DOTALL)

with open(r'c:\Users\Laptop World\Documents\tiki-taka\src\hooks\useFootballData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
