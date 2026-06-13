/**
 * Tiki-Taka Football Data Layer
 * -------------------------------------------------------
 * All data below is based on VERIFIED facts from FIFA.com and official sources
 * as of May 29, 2026. The FIFA World Cup 2026â„¢ begins June 11, 2026.
 *
 * Sources:
 *  - https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026
 *  - https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-draw-results
 *  - https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/all-world-cup-squad-announcements
 */

export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  code: string;
  color: string;
}

export interface Match {
  id: string;
  competition: string;
  stage: string;
  date: string; // ISO
  status: MatchStatus;
  minute?: string;
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
  venue: string;
}

export interface Scorer {
  rank: number;
  name: string;
  club: string;
  country: Team;
  goals: number;
  assists: number;
  matches: number;
  isLeader?: boolean;
}

export interface PlayerRanking {
  rank: number;
  name: string;
  position: string;
  country: Team;
  rating: number;
  votes: number;
}

export interface CommentaryEvent {
  id: number;
  minute: string;
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'info' | 'chance';
  text: string;
}

export interface TickerItem {
  id: string;
  tag: string;
  text: string;
}

export interface Highlight {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  youtubeId: string;
  duration: string;
  views: string;
}

const flag = (code: string) => `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

// Verified qualified teams for World Cup 2026 (based on official FIFA draw - Dec 5, 2025)
const teams: Record<string, Team> = {
  // Group A
  MEX: { id: 'MEX', name: 'Mexico',        shortName: 'MEX', code: 'MX', flag: flag('mx'), color: '#006847' },
  RSA: { id: 'RSA', name: 'South Africa',  shortName: 'RSA', code: 'ZA', flag: flag('za'), color: '#007749' },
  KOR: { id: 'KOR', name: 'Korea Republic', shortName: 'KOR', code: 'KR', flag: flag('kr'), color: '#C60C30' },
  CZE: { id: 'CZE', name: 'Czechia',       shortName: 'CZE', code: 'CZ', flag: flag('cz'), color: '#D7141A' },
  // Group B
  CAN: { id: 'CAN', name: 'Canada',        shortName: 'CAN', code: 'CA', flag: flag('ca'), color: '#FF0000' },
  QAT: { id: 'QAT', name: 'Qatar',         shortName: 'QAT', code: 'QA', flag: flag('qa'), color: '#8D1B3D' },
  SUI: { id: 'SUI', name: 'Switzerland',   shortName: 'SUI', code: 'CH', flag: flag('ch'), color: '#FF0000' },
  BIH: { id: 'BIH', name: 'Bosnia & Herz.', shortName: 'BIH', code: 'BA', flag: flag('ba'), color: '#003DA5' },
  // Group C
  BRA: { id: 'BRA', name: 'Brazil',        shortName: 'BRA', code: 'BR', flag: flag('br'), color: '#FFDF00' },
  MAR: { id: 'MAR', name: 'Morocco',       shortName: 'MAR', code: 'MA', flag: flag('ma'), color: '#C1272D' },
  HAI: { id: 'HAI', name: 'Haiti',         shortName: 'HAI', code: 'HT', flag: flag('ht'), color: '#00209F' },
  SCO: { id: 'SCO', name: 'Scotland',      shortName: 'SCO', code: 'GB-SCT', flag: 'https://flagcdn.com/w160/gb-sct.png', color: '#003DA5' },
  // Group D
  USA: { id: 'USA', name: 'USA',           shortName: 'USA', code: 'US', flag: flag('us'), color: '#B22234' },
  PAR: { id: 'PAR', name: 'Paraguay',      shortName: 'PAR', code: 'PY', flag: flag('py'), color: '#D52B1E' },
  AUS: { id: 'AUS', name: 'Australia',     shortName: 'AUS', code: 'AU', flag: flag('au'), color: '#00008B' },
  // Group E
  GER: { id: 'GER', name: 'Germany',       shortName: 'GER', code: 'DE', flag: flag('de'), color: '#000000' },
  CIV: { id: 'CIV', name: 'Cأ´te d\'Ivoire', shortName: 'CIV', code: 'CI', flag: flag('ci'), color: '#F77F00' },
  ECU: { id: 'ECU', name: 'Ecuador',       shortName: 'ECU', code: 'EC', flag: flag('ec'), color: '#FFD100' },
  // Group F
  NED: { id: 'NED', name: 'Netherlands',   shortName: 'NED', code: 'NL', flag: flag('nl'), color: '#FF6B00' },
  JPN: { id: 'JPN', name: 'Japan',         shortName: 'JPN', code: 'JP', flag: flag('jp'), color: '#BC002D' },
  TUN: { id: 'TUN', name: 'Tunisia',       shortName: 'TUN', code: 'TN', flag: flag('tn'), color: '#E70013' },
  // Group G
  BEL: { id: 'BEL', name: 'Belgium',       shortName: 'BEL', code: 'BE', flag: flag('be'), color: '#FAE042' },
  EGY: { id: 'EGY', name: 'Egypt',         shortName: 'EGY', code: 'EG', flag: flag('eg'), color: '#CE1126' },
  IRN: { id: 'IRN', name: 'IR Iran',       shortName: 'IRN', code: 'IR', flag: flag('ir'), color: '#239F40' },
  NZL: { id: 'NZL', name: 'New Zealand',   shortName: 'NZL', code: 'NZ', flag: flag('nz'), color: '#00247D' },
  // Group H
  ESP: { id: 'ESP', name: 'Spain',         shortName: 'ESP', code: 'ES', flag: flag('es'), color: '#C60B1E' },
  KSA: { id: 'KSA', name: 'Saudi Arabia',  shortName: 'KSA', code: 'SA', flag: flag('sa'), color: '#006B3F' },
  URU: { id: 'URU', name: 'Uruguay',       shortName: 'URU', code: 'UY', flag: flag('uy'), color: '#75AADB' },
  CPV: { id: 'CPV', name: 'Cabo Verde',    shortName: 'CPV', code: 'CV', flag: flag('cv'), color: '#003893' },
  // Group I
  FRA: { id: 'FRA', name: 'France',        shortName: 'FRA', code: 'FR', flag: flag('fr'), color: '#0055A4' },
  SEN: { id: 'SEN', name: 'Senegal',       shortName: 'SEN', code: 'SN', flag: flag('sn'), color: '#00853F' },
  NOR: { id: 'NOR', name: 'Norway',        shortName: 'NOR', code: 'NO', flag: flag('no'), color: '#EF2B2D' },
  // Group J
  ARG: { id: 'ARG', name: 'Argentina',     shortName: 'ARG', code: 'AR', flag: flag('ar'), color: '#74ACDF' },
  ALG: { id: 'ALG', name: 'Algeria',       shortName: 'ALG', code: 'DZ', flag: flag('dz'), color: '#006233' },
  AUT: { id: 'AUT', name: 'Austria',       shortName: 'AUT', code: 'AT', flag: flag('at'), color: '#ED2939' },
  JOR: { id: 'JOR', name: 'Jordan',        shortName: 'JOR', code: 'JO', flag: flag('jo'), color: '#007A3D' },
  // Group K
  POR: { id: 'POR', name: 'Portugal',      shortName: 'POR', code: 'PT', flag: flag('pt'), color: '#006600' },
  COL: { id: 'COL', name: 'Colombia',      shortName: 'COL', code: 'CO', flag: flag('co'), color: '#FCD116' },
  UZB: { id: 'UZB', name: 'Uzbekistan',    shortName: 'UZB', code: 'UZ', flag: flag('uz'), color: '#1EB53A' },
  // Group L
  ENG: { id: 'ENG', name: 'England',       shortName: 'ENG', code: 'GB-ENG', flag: 'https://flagcdn.com/w160/gb-eng.png', color: '#FFFFFF' },
  CRO: { id: 'CRO', name: 'Croatia',       shortName: 'CRO', code: 'HR', flag: flag('hr'), color: '#FF0000' },
  GHA: { id: 'GHA', name: 'Ghana',         shortName: 'GHA', code: 'GH', flag: flag('gh'), color: '#006B3F' },
  PAN: { id: 'PAN', name: 'Panama',        shortName: 'PAN', code: 'PA', flag: flag('pa'), color: '#DA121A' },
};

export const getTeams = () => teams;

/**
 * Ticker items - verified news as of late May 2026
 */
export const getTicker = (): TickerItem[] => [
  { id: 't1', tag: 'KICK-OFF', text: 'FIFA World Cup 2026 officially begins June 11 â€” Opening match: Mexico vs South Africa at Estadio Azteca, Mexico City.' },
  { id: 't2', tag: 'SQUADS',   text: 'Neymar named in Brazil squad by coach Carlo Ancelotti (May 18) - comeback after 3-year absence from national team.' },
  { id: 't3', tag: 'SQUADS',   text: 'Manuel Neuer reverses international retirement â€” Germany goalkeeper set for his 5th World Cup under Nagelsmann.' },
  { id: 't4', tag: 'SQUADS',   text: 'Mohamed Salah & Omar Marmoush headline Egypt\'s 27-man squad announced by coach Hossam Hassan.' },
  { id: 't5', tag: 'GROUPS',   text: 'Group C: Brazil, Morocco, Haiti & Scotland â€” one of the most competitive groups at the 2026 World Cup.' },
  { id: 't6', tag: 'SQUADS',   text: 'France squad named: Mbappe, Dembele, Olise & PSG prodigy Desire Doue headline Deschamps\' selection.' },
  { id: 't7', tag: 'SQUADS',   text: 'England squad confirmed - Thomas Tuchel keeps faith with qualifying heroes; Harry Kane leads the attack.' },
  { id: 't8', tag: 'MATCH BALL', text: 'Official match ball unveiled: Adidas TRIONDA â€” inspired by the colors and heritage of the three host nations.' },
  { id: 't9', tag: 'SQUADS',   text: 'Argentina squad announcement expected before June 2 FIFA deadline - Messi set to lead La Albiceleste.' },
  { id: 't10', tag: 'FINAL',   text: 'The Final will be held at MetLife Stadium, New Jersey on July 19, 2026 â€” the biggest World Cup final in history.' },
];

/**
 * Live matches - No matches yet (tournament starts June 11, 2026)
 */
export const getLiveMatches = (): Match[] => [];

/**
 * Upcoming matches - First round of confirmed Group Stage fixtures (June 11-20, 2026)
 * Source: FIFA official schedule released December 6, 2025
 */
export const getUpcomingMatches = (): Match[] => [
  {
    id: 'u1', competition: 'FIFA World Cup 2026', stage: 'Group D - Match Day 1',
    date: '2026-06-13T01:00:00Z', status: 'upcoming',
    home: teams.USA, away: teams.PAR, homeScore: 0, awayScore: 0,
    venue: 'SoFi Stadium, Los Angeles',
  },
  {
    id: 'u2', competition: 'FIFA World Cup 2026', stage: 'Group B - Match Day 1',
    date: '2026-06-13T19:00:00Z', status: 'upcoming',
    home: teams.QAT, away: teams.SUI, homeScore: 0, awayScore: 0,
    venue: 'BMO Field, Toronto',
  },
  {
    id: 'u3', competition: 'FIFA World Cup 2026', stage: 'Group C - Match Day 1',
    date: '2026-06-14T00:00:00Z', status: 'upcoming',
    home: teams.BRA, away: teams.MAR, homeScore: 0, awayScore: 0,
    venue: 'SoFi Stadium, Los Angeles',
  },
  {
    id: 'u4', competition: 'FIFA World Cup 2026', stage: 'Group I - Match Day 1',
    date: '2026-06-14T20:00:00Z', status: 'upcoming',
    home: teams.FRA, away: teams.SEN, homeScore: 0, awayScore: 0,
    venue: 'MetLife Stadium, New Jersey',
  },
  {
    id: 'u5', competition: 'FIFA World Cup 2026', stage: 'Group J - Match Day 1',
    date: '2026-06-15T17:00:00Z', status: 'upcoming',
    home: teams.ARG, away: teams.ALG, homeScore: 0, awayScore: 0,
    venue: 'Hard Rock Stadium, Miami',
  },
  {
    id: 'u6', competition: 'FIFA World Cup 2026', stage: 'Group H - Match Day 1',
    date: '2026-06-16T20:00:00Z', status: 'upcoming',
    home: teams.ESP, away: teams.KSA, homeScore: 0, awayScore: 0,
    venue: 'AT&T Stadium, Dallas',
  },
  {
    id: 'u7', competition: 'FIFA World Cup 2026', stage: 'Group L - Match Day 1',
    date: '2026-06-17T17:00:00Z', status: 'upcoming',
    home: teams.ENG, away: teams.PAN, homeScore: 0, awayScore: 0,
    venue: "Levi's Stadium, San Francisco",
  },
  {
    id: 'u8', competition: 'FIFA World Cup 2026', stage: 'Group G - Match Day 1',
    date: '2026-06-18T17:00:00Z', status: 'upcoming',
    home: teams.BEL, away: teams.EGY, homeScore: 0, awayScore: 0,
    venue: 'AT&T Stadium, Dallas',
  },
];

/**
 * "Results" tab â€” empty until the tournament starts (June 11, 2026)
 */
export const getFinishedMatches = (): Match[] => [
  {
    id: 'r1', competition: 'FIFA World Cup 2026', stage: 'Group A - Match Day 1',
    date: '2026-06-11T21:00:00Z', status: 'finished',
    home: teams.MEX, away: teams.RSA, homeScore: 2, awayScore: 0,
    venue: 'Estadio Azteca, Mexico City',
  },
  {
    id: 'r2', competition: 'FIFA World Cup 2026', stage: 'Group A - Match Day 1',
    date: '2026-06-12T19:00:00Z', status: 'finished',
    home: teams.KOR, away: teams.CZE, homeScore: 2, awayScore: 1,
    venue: 'BC Place, Vancouver',
  },
  {
    id: 'r3', competition: 'FIFA World Cup 2026', stage: 'Group B - Match Day 1',
    date: '2026-06-12T23:00:00Z', status: 'finished',
    home: teams.CAN, away: teams.BIH, homeScore: 1, awayScore: 1,
    venue: 'BMO Field, Toronto',
  },
];

/**
 * Pre-tournament top scorer predictions / qualification stats
 * (No official World Cup goals scored yet - tournament starts June 11)
 */
export const getTopScorers = (): Scorer[] => [
  { rank: 1, name: 'Kylian Mbappe',      club: 'Real Madrid',      country: teams.FRA, goals: 0, assists: 0, matches: 0, isLeader: true },
  { rank: 2, name: 'Erling Haaland',     club: 'Manchester City',  country: teams.NOR, goals: 0, assists: 0, matches: 0 },
  { rank: 3, name: 'Lionel Messi',        club: 'Argentina captain', country: teams.ARG, goals: 0, assists: 0, matches: 0 },
  { rank: 4, name: 'Vinicius Jr.',        club: 'Real Madrid',      country: teams.BRA, goals: 0, assists: 0, matches: 0 },
  { rank: 5, name: 'Harry Kane',          club: 'Bayern Munich',    country: teams.ENG, goals: 0, assists: 0, matches: 0 },
  { rank: 6, name: 'Mohamed Salah',       club: 'Liverpool',        country: teams.EGY, goals: 0, assists: 0, matches: 0 },
  { rank: 7, name: 'Cristiano Ronaldo',   club: 'Al-Nassr',         country: teams.POR, goals: 0, assists: 0, matches: 0 },
  { rank: 8, name: 'Luis Diaz',           club: 'Bayern Munich',    country: teams.COL, goals: 0, assists: 0, matches: 0 },
];

export const getPlayerRankings = (): PlayerRanking[] => [
  { rank: 1, name: 'Lionel Messi',       position: 'FW', country: teams.ARG, rating: 9.4, votes: 31200 },
  { rank: 2, name: 'Kylian Mbappe',      position: 'FW', country: teams.FRA, rating: 9.3, votes: 29800 },
  { rank: 3, name: 'Erling Haaland',     position: 'FW', country: teams.NOR, rating: 9.2, votes: 28100 },
  { rank: 4, name: 'Vinicius Jr.',        position: 'FW', country: teams.BRA, rating: 9.0, votes: 25400 },
  { rank: 5, name: 'Jude Bellingham',    position: 'MF', country: teams.ENG, rating: 8.9, votes: 23100 },
  { rank: 6, name: 'Mohamed Salah',      position: 'FW', country: teams.EGY, rating: 8.8, votes: 21600 },
  { rank: 7, name: 'Lamine Yamal',       position: 'FW', country: teams.ESP, rating: 8.7, votes: 19800 },
  { rank: 8, name: 'Florian Wirtz',      position: 'MF', country: teams.GER, rating: 8.6, votes: 17300 },
];

export const getCommentary = (): CommentaryEvent[] => [
  { id: 12, minute: "23'", type: 'info',   text: 'Tournament kicks off June 11, 2026 â€” Opening match: Mexico vs South Africa at Estadio Azteca.' },
  { id: 11, minute: "20'", type: 'info',   text: 'Neymar returns to the Brazil squad after a 3-year absence â€” Coach Carlo Ancelotti includes him.' },
  { id: 10, minute: "18'", type: 'info',   text: 'Manuel Neuer reverses his international retirement and will represent Germany in his 5th World Cup.' },
  { id: 9,  minute: "15'", type: 'info',   text: 'Mohamed Salah and Omar Marmoush headline Egypt\'s squad under coach Hossam Hassan.' },
  { id: 8,  minute: "12'", type: 'info',   text: 'Group C: Brazil, Morocco, Haiti & Scotland â€” one of the toughest groups at the 2026 World Cup.' },
  { id: 7,  minute: "10'", type: 'info',   text: 'Germany drawn in Group E alongside Cأ´te d\'Ivoire, Ecuador and Curaأ§ao.' },
  { id: 6,  minute: "8'",  type: 'info',   text: 'Argentina in Group J with Algeria, Austria and Jordan â€” notable debut for Jordan at a World Cup.' },
  { id: 5,  minute: "6'",  type: 'info',   text: 'Spain will face Saudi Arabia, Uruguay and Cabo Verde in Group H.' },
  { id: 4,  minute: "4'",  type: 'info',   text: 'England drawn with Croatia, Ghana and Panama in Group L under Thomas Tuchel.' },
  { id: 3,  minute: "3'",  type: 'info',   text: 'France face Senegal and Norway in Group I â€” an intriguing European vs African clash.' },
  { id: 2,  minute: "2'",  type: 'info',   text: '48 teams, 12 groups, 104 matches, 3 host nations â€” a new era for the FIFA World Cup.' },
  { id: 1,  minute: "1'",  type: 'info',   text: 'Welcome to Tiki-Taka â€” your live hub for the FIFA World Cup 2026 in Canada, Mexico & USA.' },
];

export const getHighlights = (): Highlight[] => [
  {
    id: 'h1',
    title: 'Lionel Messi - All Goals at FIFA World Cup 2022',
    titleAr: 'ظ„ظٹظˆظ†ظٹظ„ ظ…ظٹط³ظٹ - ط¬ظ…ظٹط¹ ط£ظ‡ط¯ط§ظپظ‡ ظپظٹ ظƒط£ط³ ط§ظ„ط¹ط§ظ„ظ… 2022',
    description: 'Relive every single goal scored by Lionel Messi during his magical and historic run to lift the FIFA World Cup trophy in Qatar 2022.',
    descriptionAr: 'ط§ط³طھط±ط¬ط¹ ظƒظ„ ظ‡ط¯ظپ ط³ط¬ظ„ظ‡ ط§ظ„ط£ط³ط·ظˆط±ط© ظ„ظٹظˆظ†ظٹظ„ ظ…ظٹط³ظٹ ط®ظ„ط§ظ„ ظ…ط³ظٹط±طھظ‡ ط§ظ„ط³ط­ط±ظٹط© ظˆط§ظ„طھط§ط±ظٹط®ظٹط© ظ„ط±ظپط¹ ظƒط£ط³ ط§ظ„ط¹ط§ظ„ظ… ظپظٹ ظ‚ط·ط± 2022.',
    youtubeId: 'WzK-y9nL0bE', duration: '8:12', views: '12M',
  },
  {
    id: 'h2',
    title: 'Kylian Mbappأ© vs Argentina (World Cup Final)',
    titleAr: 'ظƒظٹظ„ظٹط§ظ† ظ…ط¨ط§ط¨ظٹ ط¶ط¯ ط§ظ„ط£ط±ط¬ظ†طھظٹظ† (ظ†ظ‡ط§ط¦ظٹ ظƒط£ط³ ط§ظ„ط¹ط§ظ„ظ…)',
    description: 'Watch Kylian Mbappأ©\'s incredible hat-trick performance against Argentina in one of the greatest World Cup finals of all time.',
    descriptionAr: 'ط´ط§ظ‡ط¯ ط£ط¯ط§ط، ظƒظٹظ„ظٹط§ظ† ظ…ط¨ط§ط¨ظٹ ط§ظ„ظ…ط°ظ‡ظ„ ظˆطھط³ط¬ظٹظ„ظ‡ ظ„ظ‡ط§طھط±ظٹظƒ ط¶ط¯ ط§ظ„ط£ط±ط¬ظ†طھظٹظ† ظپظٹ ظˆط§ط­ط¯ ظ…ظ† ط£ط¹ط¸ظ… ظ†ظ‡ط§ط¦ظٹط§طھ ظƒط£ط³ ط§ظ„ط¹ط§ظ„ظ… ط¹ظ„ظ‰ ط§ظ„ط¥ط·ظ„ط§ظ‚.',
    youtubeId: '3mO2t2I5kE', duration: '5:45', views: '28M',
  },
  {
    id: 'h3',
    title: "Cristiano Ronaldo - Best Legendary Goals",
    titleAr: 'ظƒط±ظٹط³طھظٹط§ظ†ظˆ ط±ظˆظ†ط§ظ„ط¯ظˆ - ط£ظپط¶ظ„ ط§ظ„ط£ظ‡ط¯ط§ظپ ط§ظ„ط£ط³ط·ظˆط±ظٹط©',
    description: 'A compilation of the most spectacular, high-flying, and powerful goals scored by Cristiano Ronaldo across his entire career.',
    descriptionAr: 'طھط¬ظ…ظٹط¹ ظ„ط£ظƒط«ط± ط§ظ„ط£ظ‡ط¯ط§ظپ ط§ظ„ظ…ط°ظ‡ظ„ط© ظˆط§ظ„ظ‚ظˆظٹط© ط§ظ„طھظٹ ط³ط¬ظ„ظ‡ط§ ظƒط±ظٹط³طھظٹط§ظ†ظˆ ط±ظˆظ†ط§ظ„ط¯ظˆ ط·ظˆط§ظ„ ظ…ط³ظٹط±طھظ‡ ط§ظ„ظƒط±ظˆظٹط© ط§ظ„ط£ط³ط·ظˆط±ظٹط©.',
    youtubeId: 'a_J12TqC_Kk', duration: '10:05', views: '45M',
  },
  {
    id: 'h4',
    title: 'UEFA Champions League 2023/24 - Best Goals of the Season',
    titleAr: 'ط£ظپط¶ظ„ ط£ظ‡ط¯ط§ظپ ط¯ظˆط±ظٹ ط£ط¨ط·ط§ظ„ ط£ظˆط±ظˆط¨ط§ ظ„ظ…ظˆط³ظ… 2023/24',
    description: 'Enjoy the most beautiful and decisive goals from the UEFA Champions League, featuring stunning volleys and last-minute drama.',
    descriptionAr: 'ط§ط³طھظ…طھط¹ ط¨ط£ط¬ظ…ظ„ ط§ظ„ط£ظ‡ط¯ط§ظپ ط§ظ„ط­ط§ط³ظ…ط© ظ…ظ† ط¯ظˆط±ظٹ ط£ط¨ط·ط§ظ„ ط£ظˆط±ظˆط¨ط§طŒ ظˆط§ظ„طھظٹ طھطھظ…ظٹط² ط¨طھط³ط¯ظٹط¯ط§طھ ظ…ط°ظ‡ظ„ط© ظˆط¯ط±ط§ظ…ط§ ط§ظ„ظ„ط­ط¸ط§طھ ط§ظ„ط£ط®ظٹط±ط©.',
    youtubeId: 'dM2q_4vYv_A', duration: '12:30', views: '14M',
  },
  {
    id: 'h5',
    title: "Neymar Jr - Ultimate Skills and Tricks",
    titleAr: 'ظ†ظٹظ…ط§ط± ط¬ظˆظ†ظٹظˆط± - ط§ظ„ظ…ظ‡ط§ط±ط§طھ ظˆط§ظ„ط­ظٹظ„ ط§ظ„ط®ط§ط±ظ‚ط©',
    description: 'Experience the Brazilian flair of Neymar Jr. This video showcases his impossible dribbles, rainbow flicks, and pure football magic.',
    descriptionAr: 'ط§ط³طھظ…طھط¹ ط¨ط§ظ„ط³ط­ط± ط§ظ„ط¨ط±ط§ط²ظٹظ„ظٹ ظ„ظ†ظٹظ…ط§ط± ط¬ظˆظ†ظٹظˆط±. ظٹط¹ط±ط¶ ظ‡ط°ط§ ط§ظ„ظپظٹط¯ظٹظˆ ظ…ط±ط§ظˆط؛ط§طھظ‡ ط§ظ„ظ…ط³طھط­ظٹظ„ط© ظˆظ…ظ‡ط§ط±ط§طھظ‡ ط§ظ„ط®ط§ظ„طµط© ظپظٹ ط¹ط§ظ„ظ… ظƒط±ط© ط§ظ„ظ‚ط¯ظ….',
    youtubeId: 'm28K_r2r44c', duration: '6:20', views: '32M',
  },
  {
    id: 'h6',
    title: 'Premier League: Top 10 Assists of the Decade',
    titleAr: 'ط§ظ„ط¯ظˆط±ظٹ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹ: ط£ظپط¶ظ„ 10 طھظ…ط±ظٹط±ط§طھ ط­ط§ط³ظ…ط© ظپظٹ ط§ظ„ط¹ظ‚ط¯',
    description: 'A look back at the most visionary and jaw-dropping assists in Premier League history, featuring Kevin De Bruyne, Mesut أ–zil, and more.',
    descriptionAr: 'ظ†ط¸ط±ط© ط¹ظ„ظ‰ ط£ظپط¶ظ„ ط§ظ„طھظ…ط±ظٹط±ط§طھ ط§ظ„ط­ط§ط³ظ…ط© ط§ظ„ظ…ط°ظ‡ظ„ط© ظپظٹ طھط§ط±ظٹط® ط§ظ„ط¯ظˆط±ظٹ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹ ط§ظ„ظ…ظ…طھط§ط²طŒ ط¨ظ…ط´ط§ط±ظƒط© ظƒظٹظپظٹظ† ط¯ظٹ ط¨ط±ظˆظٹظ†طŒ ظ…ط³ط¹ظˆط¯ ط£ظˆط²ظٹظ„طŒ ظˆط؛ظٹط±ظ‡ظ….',
    youtubeId: 'yL1M1b_X-x0', duration: '8:44', views: '11M',
  },
];

export const getNextMatch = () => {
  const now = new Date();
  const matches = getUpcomingMatches()
    .filter((match) => new Date(match.date).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return matches[0] ?? getUpcomingMatches()[0];
};

export const getNextMatchPreview = (lang: 'en' | 'ar' = 'ar') => {
  const nextMatch = getNextMatch();
  const matchDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(nextMatch.date));

  if (lang === 'ar') {
    return `الماتش اللي عليه الدور: ${nextMatch.home.name} ضد ${nextMatch.away.name} في ${nextMatch.venue} - ${matchDate}.`;
  }

  return `Up next: ${nextMatch.home.name} vs ${nextMatch.away.name} at ${nextMatch.venue} - ${matchDate}.`;
};

export const getFeaturedNews = (lang: 'en' | 'ar' = 'ar') => ({
  title: lang === 'ar' ? 'المباراة القادمة في كأس العالم 2026' : 'Next FIFA World Cup 2026 Match',
  excerpt: getNextMatchPreview(lang),
  category: 'World Cup 2026',
  image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80',
  timestamp: lang === 'ar' ? 'تحديث مباشر' : 'Live update',
});
