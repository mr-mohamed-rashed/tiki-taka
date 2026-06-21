const fs = require('fs');
let content = fs.readFileSync('src/lib/footballData.ts', 'utf8');

content += `
export const getUpcomingMatches = (): Match[] => {
  return UPCOMING_FIXTURES.filter(m => new Date(m.date).getTime() > Date.now());
};

export const getFinishedMatches = (): Match[] => {
  const pastUpcoming = UPCOMING_FIXTURES
    .filter(m => new Date(m.date).getTime() + LIVE_MATCH_WINDOW_MS < Date.now())
    .map(m => {
      const scoreHash = m.home.name.length + m.away.name.length;
      return {
        ...m,
        status: 'finished' as MatchStatus,
        homeScore: scoreHash % 4,
        awayScore: (scoreHash * 3) % 3,
      };
    });

  return [...FINISHED_FIXTURES, ...pastUpcoming].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
`;
fs.writeFileSync('src/lib/footballData.ts', content);
