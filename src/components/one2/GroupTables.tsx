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
  { name: 'Group A', nameAr: 'المجموعة A', teams: [
    { name: 'Mexico', nameAr: 'المكسيك', flag: flag('mx'), confirmed: true },
    { name: 'South Africa', nameAr: 'جنوب أفريقيا', flag: flag('za'), confirmed: true },
    { name: 'Korea Republic', nameAr: 'كوريا الجنوبية', flag: flag('kr'), confirmed: true },
    { name: 'Czechia', nameAr: 'تشيكيا', flag: flag('cz'), confirmed: true },
  ] },
  { name: 'Group B', nameAr: 'المجموعة B', teams: [
    { name: 'Canada', nameAr: 'كندا', flag: flag('ca'), confirmed: true },
    { name: 'Bosnia & Herz.', nameAr: 'البوسنة والهرسك', flag: flag('ba'), confirmed: true },
    { name: 'Qatar', nameAr: 'قطر', flag: flag('qa'), confirmed: true },
    { name: 'Switzerland', nameAr: 'سويسرا', flag: flag('ch'), confirmed: true },
  ] },
  { name: 'Group C', nameAr: 'المجموعة C', teams: [
    { name: 'Brazil', nameAr: 'البرازيل', flag: flag('br'), confirmed: true },
    { name: 'Morocco', nameAr: 'المغرب', flag: flag('ma'), confirmed: true },
    { name: 'Haiti', nameAr: 'هايتي', flag: flag('ht'), confirmed: true },
    { name: 'Scotland', nameAr: 'اسكتلندا', flag: 'https://flagcdn.com/w160/gb-sct.png', confirmed: true },
  ] },
  { name: 'Group D', nameAr: 'المجموعة D', teams: [
    { name: 'USA', nameAr: 'الولايات المتحدة', flag: flag('us'), confirmed: true },
    { name: 'Paraguay', nameAr: 'باراجواي', flag: flag('py'), confirmed: true },
    { name: 'Australia', nameAr: 'أستراليا', flag: flag('au'), confirmed: true },
    { name: 'Turkiye', nameAr: 'تركيا', flag: flag('tr'), confirmed: true },
  ] },
  { name: 'Group E', nameAr: 'المجموعة E', teams: [
    { name: 'Germany', nameAr: 'ألمانيا', flag: flag('de'), confirmed: true },
    { name: 'Curacao', nameAr: 'كوراساو', flag: flag('cw'), confirmed: true },
    { name: "Cote d'Ivoire", nameAr: 'كوت ديفوار', flag: flag('ci'), confirmed: true },
    { name: 'Ecuador', nameAr: 'الإكوادور', flag: flag('ec'), confirmed: true },
  ] },
  { name: 'Group F', nameAr: 'المجموعة F', teams: [
    { name: 'Netherlands', nameAr: 'هولندا', flag: flag('nl'), confirmed: true },
    { name: 'Japan', nameAr: 'اليابان', flag: flag('jp'), confirmed: true },
    { name: 'Sweden', nameAr: 'السويد', flag: flag('se'), confirmed: true },
    { name: 'Tunisia', nameAr: 'تونس', flag: flag('tn'), confirmed: true },
  ] },
  { name: 'Group G', nameAr: 'المجموعة G', teams: [
    { name: 'Belgium', nameAr: 'بلجيكا', flag: flag('be'), confirmed: true },
    { name: 'Egypt', nameAr: 'مصر', flag: flag('eg'), confirmed: true },
    { name: 'IR Iran', nameAr: 'إيران', flag: flag('ir'), confirmed: true },
    { name: 'New Zealand', nameAr: 'نيوزيلندا', flag: flag('nz'), confirmed: true },
  ] },
  { name: 'Group H', nameAr: 'المجموعة H', teams: [
    { name: 'Spain', nameAr: 'إسبانيا', flag: flag('es'), confirmed: true },
    { name: 'Cabo Verde', nameAr: 'الرأس الأخضر', flag: flag('cv'), confirmed: true },
    { name: 'Saudi Arabia', nameAr: 'السعودية', flag: flag('sa'), confirmed: true },
    { name: 'Uruguay', nameAr: 'أوروجواي', flag: flag('uy'), confirmed: true },
  ] },
  { name: 'Group I', nameAr: 'المجموعة I', teams: [
    { name: 'France', nameAr: 'فرنسا', flag: flag('fr'), confirmed: true },
    { name: 'Senegal', nameAr: 'السنغال', flag: flag('sn'), confirmed: true },
    { name: 'Iraq', nameAr: 'العراق', flag: flag('iq'), confirmed: true },
    { name: 'Norway', nameAr: 'النرويج', flag: flag('no'), confirmed: true },
  ] },
  { name: 'Group J', nameAr: 'المجموعة J', teams: [
    { name: 'Argentina', nameAr: 'الأرجنتين', flag: flag('ar'), confirmed: true },
    { name: 'Algeria', nameAr: 'الجزائر', flag: flag('dz'), confirmed: true },
    { name: 'Austria', nameAr: 'النمسا', flag: flag('at'), confirmed: true },
    { name: 'Jordan', nameAr: 'الأردن', flag: flag('jo'), confirmed: true },
  ] },
  { name: 'Group K', nameAr: 'المجموعة K', teams: [
    { name: 'Portugal', nameAr: 'البرتغال', flag: flag('pt'), confirmed: true },
    { name: 'DR Congo', nameAr: 'الكونغو الديمقراطية', flag: flag('cd'), confirmed: true },
    { name: 'Uzbekistan', nameAr: 'أوزبكستان', flag: flag('uz'), confirmed: true },
    { name: 'Colombia', nameAr: 'كولومبيا', flag: flag('co'), confirmed: true },
  ] },
  { name: 'Group L', nameAr: 'المجموعة L', teams: [
    { name: 'England', nameAr: 'إنجلترا', flag: 'https://flagcdn.com/w160/gb-eng.png', confirmed: true },
    { name: 'Croatia', nameAr: 'كرواتيا', flag: flag('hr'), confirmed: true },
    { name: 'Ghana', nameAr: 'غانا', flag: flag('gh'), confirmed: true },
    { name: 'Panama', nameAr: 'بنما', flag: flag('pa'), confirmed: true },
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
