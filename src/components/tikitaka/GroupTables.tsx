import { useMemo } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { useResults } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import type { Match } from '@/lib/footballData';
import { cn } from '@/lib/utils';

const flag = (code: string) => `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

type GroupTeam = { name: string; nameAr: string; flag: string; confirmed: boolean };
type GroupDefinition = { name: string; nameAr: string; teams: GroupTeam[] };
type TeamStanding = GroupTeam & {
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

const GROUPS: GroupDefinition[] = [
  { name: 'Group A', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© A', teams: [
    { name: 'Mexico', nameAr: 'ط§ظ„ظ…ظƒط³ظٹظƒ', flag: flag('mx'), confirmed: true },
    { name: 'South Africa', nameAr: 'ط¬ظ†ظˆط¨ ط£ظپط±ظٹظ‚ظٹط§', flag: flag('za'), confirmed: true },
    { name: 'Korea Republic', nameAr: 'ظƒظˆط±ظٹط§ ط§ظ„ط¬ظ†ظˆط¨ظٹط©', flag: flag('kr'), confirmed: true },
    { name: 'Czechia', nameAr: 'طھط´ظٹظƒظٹط§', flag: flag('cz'), confirmed: true },
  ] },
  { name: 'Group B', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© B', teams: [
    { name: 'Canada', nameAr: 'ظƒظ†ط¯ط§', flag: flag('ca'), confirmed: true },
    { name: 'Bosnia & Herz.', nameAr: 'ط§ظ„ط¨ظˆط³ظ†ط© ظˆط§ظ„ظ‡ط±ط³ظƒ', flag: flag('ba'), confirmed: true },
    { name: 'Qatar', nameAr: 'ظ‚ط·ط±', flag: flag('qa'), confirmed: true },
    { name: 'Switzerland', nameAr: 'ط³ظˆظٹط³ط±ط§', flag: flag('ch'), confirmed: true },
  ] },
  { name: 'Group C', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© C', teams: [
    { name: 'Brazil', nameAr: 'ط§ظ„ط¨ط±ط§ط²ظٹظ„', flag: flag('br'), confirmed: true },
    { name: 'Morocco', nameAr: 'ط§ظ„ظ…ط؛ط±ط¨', flag: flag('ma'), confirmed: true },
    { name: 'Haiti', nameAr: 'ظ‡ط§ظٹطھظٹ', flag: flag('ht'), confirmed: true },
    { name: 'Scotland', nameAr: 'ط§ط³ظƒطھظ„ظ†ط¯ط§', flag: 'https://flagcdn.com/w160/gb-sct.png', confirmed: true },
  ] },
  { name: 'Group D', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© D', teams: [
    { name: 'USA', nameAr: 'ط§ظ„ظˆظ„ط§ظٹط§طھ ط§ظ„ظ…طھط­ط¯ط©', flag: flag('us'), confirmed: true },
    { name: 'Paraguay', nameAr: 'ط¨ط§ط±ط§ط¬ظˆط§ظٹ', flag: flag('py'), confirmed: true },
    { name: 'Australia', nameAr: 'ط£ط³طھط±ط§ظ„ظٹط§', flag: flag('au'), confirmed: true },
    { name: 'Turkiye', nameAr: 'طھط±ظƒظٹط§', flag: flag('tr'), confirmed: true },
  ] },
  { name: 'Group E', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© E', teams: [
    { name: 'Germany', nameAr: 'ط£ظ„ظ…ط§ظ†ظٹط§', flag: flag('de'), confirmed: true },
    { name: 'Curacao', nameAr: 'ظƒظˆط±ط§ط³ط§ظˆ', flag: flag('cw'), confirmed: true },
    { name: "Cote d'Ivoire", nameAr: 'ظƒظˆطھ ط¯ظٹظپظˆط§ط±', flag: flag('ci'), confirmed: true },
    { name: 'Ecuador', nameAr: 'ط§ظ„ط¥ظƒظˆط§ط¯ظˆط±', flag: flag('ec'), confirmed: true },
  ] },
  { name: 'Group F', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© F', teams: [
    { name: 'Netherlands', nameAr: 'ظ‡ظˆظ„ظ†ط¯ط§', flag: flag('nl'), confirmed: true },
    { name: 'Japan', nameAr: 'ط§ظ„ظٹط§ط¨ط§ظ†', flag: flag('jp'), confirmed: true },
    { name: 'Sweden', nameAr: 'ط§ظ„ط³ظˆظٹط¯', flag: flag('se'), confirmed: true },
    { name: 'Tunisia', nameAr: 'طھظˆظ†ط³', flag: flag('tn'), confirmed: true },
  ] },
  { name: 'Group G', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© G', teams: [
    { name: 'Belgium', nameAr: 'ط¨ظ„ط¬ظٹظƒط§', flag: flag('be'), confirmed: true },
    { name: 'Egypt', nameAr: 'ظ…طµط±', flag: flag('eg'), confirmed: true },
    { name: 'IR Iran', nameAr: 'ط¥ظٹط±ط§ظ†', flag: flag('ir'), confirmed: true },
    { name: 'New Zealand', nameAr: 'ظ†ظٹظˆط²ظٹظ„ظ†ط¯ط§', flag: flag('nz'), confirmed: true },
  ] },
  { name: 'Group H', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© H', teams: [
    { name: 'Spain', nameAr: 'ط¥ط³ط¨ط§ظ†ظٹط§', flag: flag('es'), confirmed: true },
    { name: 'Cabo Verde', nameAr: 'ط§ظ„ط±ط£ط³ ط§ظ„ط£ط®ط¶ط±', flag: flag('cv'), confirmed: true },
    { name: 'Saudi Arabia', nameAr: 'ط§ظ„ط³ط¹ظˆط¯ظٹط©', flag: flag('sa'), confirmed: true },
    { name: 'Uruguay', nameAr: 'ط£ظˆط±ظˆط¬ظˆط§ظٹ', flag: flag('uy'), confirmed: true },
  ] },
  { name: 'Group I', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© I', teams: [
    { name: 'France', nameAr: 'ظپط±ظ†ط³ط§', flag: flag('fr'), confirmed: true },
    { name: 'Senegal', nameAr: 'ط§ظ„ط³ظ†ط؛ط§ظ„', flag: flag('sn'), confirmed: true },
    { name: 'Iraq', nameAr: 'ط§ظ„ط¹ط±ط§ظ‚', flag: flag('iq'), confirmed: true },
    { name: 'Norway', nameAr: 'ط§ظ„ظ†ط±ظˆظٹط¬', flag: flag('no'), confirmed: true },
  ] },
  { name: 'Group J', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© J', teams: [
    { name: 'Argentina', nameAr: 'ط§ظ„ط£ط±ط¬ظ†طھظٹظ†', flag: flag('ar'), confirmed: true },
    { name: 'Algeria', nameAr: 'ط§ظ„ط¬ط²ط§ط¦ط±', flag: flag('dz'), confirmed: true },
    { name: 'Austria', nameAr: 'ط§ظ„ظ†ظ…ط³ط§', flag: flag('at'), confirmed: true },
    { name: 'Jordan', nameAr: 'ط§ظ„ط£ط±ط¯ظ†', flag: flag('jo'), confirmed: true },
  ] },
  { name: 'Group K', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© K', teams: [
    { name: 'Portugal', nameAr: 'ط§ظ„ط¨ط±طھط؛ط§ظ„', flag: flag('pt'), confirmed: true },
    { name: 'DR Congo', nameAr: 'ط§ظ„ظƒظˆظ†ط؛ظˆ ط§ظ„ط¯ظٹظ…ظ‚ط±ط§ط·ظٹط©', flag: flag('cd'), confirmed: true },
    { name: 'Uzbekistan', nameAr: 'ط£ظˆط²ط¨ظƒط³طھط§ظ†', flag: flag('uz'), confirmed: true },
    { name: 'Colombia', nameAr: 'ظƒظˆظ„ظˆظ…ط¨ظٹط§', flag: flag('co'), confirmed: true },
  ] },
  { name: 'Group L', nameAr: 'ط§ظ„ظ…ط¬ظ…ظˆط¹ط© L', teams: [
    { name: 'England', nameAr: 'ط¥ظ†ط¬ظ„طھط±ط§', flag: 'https://flagcdn.com/w160/gb-eng.png', confirmed: true },
    { name: 'Croatia', nameAr: 'ظƒط±ظˆط§طھظٹط§', flag: flag('hr'), confirmed: true },
    { name: 'Ghana', nameAr: 'ط؛ط§ظ†ط§', flag: flag('gh'), confirmed: true },
    { name: 'Panama', nameAr: 'ط¨ظ†ظ…ط§', flag: flag('pa'), confirmed: true },
  ] },
];

export function GroupTables() {
  const { lang } = useLanguage();
  const { data: results = [], isLoading } = useResults();
  const groups = useMemo(() => buildGroupTables(results), [results]);

  return (
    <div className="space-y-5">

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {t('loading', lang)}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {groups.map((group) => (
          <Card key={group.name} className="overflow-hidden bg-gradient-card border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/60">
              <div className="p-1.5 rounded bg-primary/15">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">World Cup</p>
                <h3 className={cn('font-display font-extrabold text-lg', lang === 'ar' && 'font-arabic')}>
                  {lang === 'ar' ? group.nameAr : group.name}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-8 text-center">#</TableHead>
                    <TableHead className={cn(lang === 'ar' && 'font-arabic')}>{t('team', lang)}</TableHead>
                    <TableHead className="text-center text-xs">MP</TableHead>
                    <TableHead className="text-center text-xs">W</TableHead>
                    <TableHead className="text-center text-xs">D</TableHead>
                    <TableHead className="text-center text-xs">L</TableHead>
                    <TableHead className="text-center text-xs">GD</TableHead>
                    <TableHead className="text-center text-xs font-bold text-foreground">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.teams.map((team) => (
                    <TableRow key={team.name} className={cn('border-border hover:bg-muted/30', team.rank <= 2 && team.played > 0 && 'bg-primary/5')}>
                      <TableCell className="text-center">
                        <span className="text-sm font-bold text-muted-foreground">{team.rank}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={team.flag}
                            alt={team.name}
                            className={cn('w-6 h-6 rounded object-cover ring-1 ring-border shrink-0', !team.confirmed && 'opacity-40')}
                          />
                          <span className={cn('font-semibold text-sm', !team.confirmed && 'text-muted-foreground italic', lang === 'ar' && 'font-arabic')}>
                            {lang === 'ar' ? team.nameAr : team.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{team.played}</TableCell>
                      <TableCell className="text-center font-semibold">{team.won}</TableCell>
                      <TableCell className="text-center font-semibold">{team.drawn}</TableCell>
                      <TableCell className="text-center font-semibold">{team.lost}</TableCell>
                      <TableCell className={cn('text-center font-semibold', team.gd > 0 && 'text-primary', team.gd < 0 && 'text-destructive')}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </TableCell>
                      <TableCell className="text-center font-extrabold text-foreground">{team.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function buildGroupTables(results: Match[]) {
  return GROUPS.map((group) => {
    const table = group.teams.map<TeamStanding>((team) => ({
      ...team,
      rank: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    }));

    results.forEach((match) => {
      if (match.status !== 'finished') return;

      const home = findTeam(table, match.home.name);
      const away = findTeam(table, match.away.name);
      if (!home || !away) return;

      applyResult(home, match.homeScore, match.awayScore);
      applyResult(away, match.awayScore, match.homeScore);
    });

    const teams = table
      .map((team) => ({ ...team, gd: team.gf - team.ga }))
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return { ...group, teams };
  });
}

function findTeam(table: TeamStanding[], name: string) {
  const normalized = normalizeTeamName(name);
  return table.find((team) => normalizeTeamName(team.name) === normalized);
}

function applyResult(team: TeamStanding, goalsFor: number, goalsAgainst: number) {
  team.played += 1;
  team.gf += goalsFor;
  team.ga += goalsAgainst;

  if (goalsFor > goalsAgainst) {
    team.won += 1;
    team.points += 3;
  } else if (goalsFor === goalsAgainst) {
    team.drawn += 1;
    team.points += 1;
  } else {
    team.lost += 1;
  }
}

function normalizeTeamName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/republic/g, '')
    .replace(/[^a-z0-9]+/g, '');
}
