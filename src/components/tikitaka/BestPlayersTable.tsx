import { useMemo, useState } from 'react';
import { ArrowUpDown, Info, Loader2, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useTopScorers } from '@/hooks/useFootballData';
import { cn } from '@/lib/utils';
import type { Scorer } from '@/lib/footballData';

type SortKey = 'rank' | 'impact' | 'goals' | 'assists' | 'matches';

type ImpactPlayer = Scorer & {
  impact: number;
};

export function BestPlayersTable() {
  const { lang } = useLanguage();
  const { data: scorers = [], isLoading } = useTopScorers();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [asc, setAsc] = useState(true);

  const rows = useMemo<ImpactPlayer[]>(() => {
    return scorers
      .map((player) => ({
        ...player,
        impact: player.goals * 3 + player.assists * 2 + player.matches,
      }))
      .sort((a, b) => b.impact - a.impact)
      .map((player, index) => ({ ...player, rank: index + 1, isLeader: index === 0 }));
  }, [scorers]);

  const sortedRows = [...rows].sort((a, b) => {
    const first = a[sortKey] as number;
    const second = b[sortKey] as number;
    return asc ? first - second : second - first;
  });

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setAsc(!asc);
      return;
    }

    setSortKey(k);
    setAsc(k === 'rank');
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSort(k)}
      className="h-8 px-2 -ml-2 font-bold text-muted-foreground hover:text-primary uppercase text-xs tracking-wider"
    >
      {label}
      <ArrowUpDown className={cn('ml-1 h-3 w-3', sortKey === k && 'text-primary')} />
    </Button>
  );

  return (
    <Card className="overflow-hidden bg-gradient-card border-border">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-primary/15">
          <Star className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'أفضل اللاعبين' : 'Best Players'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'ترتيب تأثير مبني على الأهداف والأسيست والمشاركات' : 'Impact ranking based on goals, assists and appearances'}
          </p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary ms-auto" />}
      </div>

      <div className="flex items-center gap-2 mx-4 mt-3 mb-1 text-xs bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
        <Info className="h-3 w-3 text-primary shrink-0" />
        <span className={cn(lang === 'ar' && 'font-arabic')}>
          {lang === 'ar'
            ? 'API-Football لا يوفر تقييم أفضل لاعب بشكل مباشر، لذلك نحسب مؤشر تأثير من الإحصائيات المتاحة.'
            : 'API-Football does not expose a direct best-player rating, so this uses an impact score from available stats.'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-14"><SortBtn k="rank" label="#" /></TableHead>
              <TableHead>{lang === 'ar' ? 'اللاعب' : 'Player'}</TableHead>
              <TableHead className="text-center"><SortBtn k="impact" label={lang === 'ar' ? 'تأثير' : 'Impact'} /></TableHead>
              <TableHead className="text-center hidden sm:table-cell"><SortBtn k="goals" label={lang === 'ar' ? 'أهداف' : 'Goals'} /></TableHead>
              <TableHead className="text-center hidden sm:table-cell"><SortBtn k="assists" label={lang === 'ar' ? 'أسيست' : 'Assists'} /></TableHead>
              <TableHead className="text-center hidden md:table-cell"><SortBtn k="matches" label={lang === 'ar' ? 'مباريات' : 'MP'} /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-border">
                <TableCell colSpan={6}>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && sortedRows.map((player) => {
              const top = player.rank === 1;
              return (
                <TableRow key={player.name} className={cn('border-border hover:bg-muted/50', top && 'bg-primary/5')}>
                  <TableCell>
                    <div className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold font-display',
                      top ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-muted text-foreground',
                    )}>
                      {player.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={player.country.flag} alt={player.country.name} className="w-6 h-6 rounded object-cover ring-1 ring-border" />
                      <div>
                        <div className={cn('font-bold text-sm', top && 'text-primary')}>{player.name}</div>
                        <div className="text-xs text-muted-foreground">{player.club}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 font-display font-extrabold tabular-nums">
                      <Star className={cn('h-3.5 w-3.5', top ? 'text-primary fill-primary' : 'text-gold fill-gold')} />
                      <span className={top ? 'text-primary' : 'text-foreground'}>{player.impact}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell tabular-nums">{player.goals}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell tabular-nums">{player.assists}</TableCell>
                  <TableCell className="text-center hidden md:table-cell text-muted-foreground tabular-nums">{player.matches}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
