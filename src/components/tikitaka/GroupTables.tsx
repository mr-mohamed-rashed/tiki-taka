import { Users, Loader2, Info, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useStandings } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';

const flag = (code: string) => `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

/**
 * Official World Cup 2026 groups — from FIFA Final Draw, Washington DC, December 5, 2025
 * Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-draw-results
 * Note: 6 playoff spots (4 UEFA + 2 inter-confederation) marked as "TBD"
 * Tournament has NOT started yet (starts June 11, 2026)
 */
const REAL_GROUPS: { name: string; nameAr: string; teams: { name: string; nameAr: string; flag: string; confirmed: boolean }[] }[] = [
  {
    name: 'Group A', nameAr: 'المجموعة A',
    teams: [
      { name: 'Mexico',       nameAr: 'المكسيك',         flag: flag('mx'), confirmed: true },
      { name: 'South Africa', nameAr: 'جنوب أفريقيا',    flag: flag('za'), confirmed: true },
      { name: 'Korea Republic', nameAr: 'كوريا الجنوبية', flag: flag('kr'), confirmed: true },
      { name: 'Czechia',      nameAr: 'تشيكيا',          flag: flag('cz'), confirmed: true },
    ],
  },
  {
    name: 'Group B', nameAr: 'المجموعة B',
    teams: [
      { name: 'Canada',       nameAr: 'كندا',            flag: flag('ca'), confirmed: true },
      { name: 'Bosnia & Herz.', nameAr: 'البوسنة والهرسك', flag: flag('ba'), confirmed: true },
      { name: 'Qatar',        nameAr: 'قطر',             flag: flag('qa'), confirmed: true },
      { name: 'Switzerland',  nameAr: 'سويسرا',          flag: flag('ch'), confirmed: true },
    ],
  },
  {
    name: 'Group C', nameAr: 'المجموعة C',
    teams: [
      { name: 'Brazil',       nameAr: 'البرازيل',        flag: flag('br'), confirmed: true },
      { name: 'Morocco',      nameAr: 'المغرب',          flag: flag('ma'), confirmed: true },
      { name: 'Haiti',        nameAr: 'هايتي',           flag: flag('ht'), confirmed: true },
      { name: 'Scotland',     nameAr: 'اسكتلندا',        flag: 'https://flagcdn.com/w160/gb-sct.png', confirmed: true },
    ],
  },
  {
    name: 'Group D', nameAr: 'المجموعة D',
    teams: [
      { name: 'USA',          nameAr: 'الولايات المتحدة', flag: flag('us'), confirmed: true },
      { name: 'Paraguay',     nameAr: 'باراغواي',        flag: flag('py'), confirmed: true },
      { name: 'Australia',    nameAr: 'أستراليا',        flag: flag('au'), confirmed: true },
      { name: 'UEFA Playoff', nameAr: 'ملعب أوروبي',     flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png', confirmed: false },
    ],
  },
  {
    name: 'Group E', nameAr: 'المجموعة E',
    teams: [
      { name: 'Germany',      nameAr: 'ألمانيا',         flag: flag('de'), confirmed: true },
      { name: 'Curaçao',      nameAr: 'كوراساو',         flag: flag('cw'), confirmed: true },
      { name: 'Côte d\'Ivoire', nameAr: 'كوت ديفوار',   flag: flag('ci'), confirmed: true },
      { name: 'Ecuador',      nameAr: 'الإكوادور',       flag: flag('ec'), confirmed: true },
    ],
  },
  {
    name: 'Group F', nameAr: 'المجموعة F',
    teams: [
      { name: 'Netherlands',  nameAr: 'هولندا',          flag: flag('nl'), confirmed: true },
      { name: 'Japan',        nameAr: 'اليابان',         flag: flag('jp'), confirmed: true },
      { name: 'UEFA Playoff', nameAr: 'ملعب أوروبي',     flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png', confirmed: false },
      { name: 'Tunisia',      nameAr: 'تونس',            flag: flag('tn'), confirmed: true },
    ],
  },
  {
    name: 'Group G', nameAr: 'المجموعة G',
    teams: [
      { name: 'Belgium',      nameAr: 'بلجيكا',          flag: flag('be'), confirmed: true },
      { name: 'Egypt',        nameAr: 'مصر',             flag: flag('eg'), confirmed: true },
      { name: 'IR Iran',      nameAr: 'إيران',           flag: flag('ir'), confirmed: true },
      { name: 'New Zealand',  nameAr: 'نيوزيلندا',       flag: flag('nz'), confirmed: true },
    ],
  },
  {
    name: 'Group H', nameAr: 'المجموعة H',
    teams: [
      { name: 'Spain',        nameAr: 'إسبانيا',         flag: flag('es'), confirmed: true },
      { name: 'Cabo Verde',   nameAr: 'الرأس الأخضر',   flag: flag('cv'), confirmed: true },
      { name: 'Saudi Arabia', nameAr: 'السعودية',        flag: flag('sa'), confirmed: true },
      { name: 'Uruguay',      nameAr: 'أوروغواي',        flag: flag('uy'), confirmed: true },
    ],
  },
  {
    name: 'Group I', nameAr: 'المجموعة I',
    teams: [
      { name: 'France',       nameAr: 'فرنسا',           flag: flag('fr'), confirmed: true },
      { name: 'Senegal',      nameAr: 'السنيغال',        flag: flag('sn'), confirmed: true },
      { name: 'Inter-Conf. Playoff', nameAr: 'ملعب قاري', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/FIFA_Logo.svg/320px-FIFA_Logo.svg.png', confirmed: false },
      { name: 'Norway',       nameAr: 'النرويج',         flag: flag('no'), confirmed: true },
    ],
  },
  {
    name: 'Group J', nameAr: 'المجموعة J',
    teams: [
      { name: 'Argentina',    nameAr: 'الأرجنتين',       flag: flag('ar'), confirmed: true },
      { name: 'Algeria',      nameAr: 'الجزائر',         flag: flag('dz'), confirmed: true },
      { name: 'Austria',      nameAr: 'النمسا',          flag: flag('at'), confirmed: true },
      { name: 'Jordan',       nameAr: 'الأردن',          flag: flag('jo'), confirmed: true },
    ],
  },
  {
    name: 'Group K', nameAr: 'المجموعة K',
    teams: [
      { name: 'Portugal',     nameAr: 'البرتغال',        flag: flag('pt'), confirmed: true },
      { name: 'Inter-Conf. Playoff', nameAr: 'ملعب قاري', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/FIFA_Logo.svg/320px-FIFA_Logo.svg.png', confirmed: false },
      { name: 'Uzbekistan',   nameAr: 'أوزبكستان',      flag: flag('uz'), confirmed: true },
      { name: 'Colombia',     nameAr: 'كولومبيا',        flag: flag('co'), confirmed: true },
    ],
  },
  {
    name: 'Group L', nameAr: 'المجموعة L',
    teams: [
      { name: 'England',      nameAr: 'إنجلترا',         flag: 'https://flagcdn.com/w160/gb-eng.png', confirmed: true },
      { name: 'Croatia',      nameAr: 'كرواتيا',         flag: flag('hr'), confirmed: true },
      { name: 'Ghana',        nameAr: 'غانا',            flag: flag('gh'), confirmed: true },
      { name: 'Panama',       nameAr: 'بنما',            flag: flag('pa'), confirmed: true },
    ],
  },
];

export function GroupTables() {
  const { lang } = useLanguage();
  const { isLoading } = useStandings();

  return (
    <div className="space-y-5">
      {/* Source note */}
      <div className="flex items-start gap-2 text-xs bg-primary/10 border border-primary/25 rounded-lg px-4 py-3">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <p className={cn(lang === 'ar' && 'font-arabic')}>
          {lang === 'ar'
            ? 'المجموعات الرسمية من قرعة كأس العالم 2026 - جون ف. كينيدي سنتر، واشنطن دي سي، 5 ديسمبر 2025 | المصدر: FIFA.com | البطولة تنطلق 11 يونيو 2026'
            : 'Official groups from FIFA World Cup 2026 Final Draw — JFK Center, Washington DC, December 5, 2025 | Source: FIFA.com | Tournament starts June 11, 2026'}
        </p>
      </div>

      {/* Opening match callout */}
      <div className="flex items-center gap-3 bg-live/10 border border-live/30 rounded-lg px-4 py-3">
        <Calendar className="h-4 w-4 text-live shrink-0" />
        <p className={cn('text-sm font-semibold', lang === 'ar' && 'font-arabic')}>
          {lang === 'ar'
            ? 'المباراة الافتتاحية: المكسيك ضد جنوب أفريقيا - استاد أزتيكا، مكسيكو سيتي - الخميس 11 يونيو 2026'
            : 'Opening Match: Mexico vs South Africa — Estadio Azteca, Mexico City — Thursday, June 11, 2026'}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {t('loading', lang)}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {REAL_GROUPS.map((group) => (
          <Card key={group.name} className="overflow-hidden bg-gradient-card border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/60">
              <div className="p-1.5 rounded bg-primary/15">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h3 className={cn('font-display font-extrabold text-lg', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? group.nameAr : group.name}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-8 text-center">#</TableHead>
                    <TableHead className={cn(lang === 'ar' && 'font-arabic')}>{t('team', lang)}</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground w-16">
                      {lang === 'ar' ? 'الحالة' : 'Status'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.teams.map((team, i) => (
                    <TableRow key={team.name} className="border-border hover:bg-muted/30">
                      <TableCell className="text-center">
                        <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
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
                      <TableCell className="text-center">
                        {team.confirmed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                            {lang === 'ar' ? 'متأهل' : 'Qualified'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {lang === 'ar' ? 'ملعب' : 'Playoff'}
                          </span>
                        )}
                      </TableCell>
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
