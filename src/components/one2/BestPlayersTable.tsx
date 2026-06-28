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

const BallIcon = ({ className, rank }: { className?: string, rank: number }) => {
  const gradientId = `ball-grad-${rank}`;
  const stop1 = rank === 1 ? '#FDE68A' : rank === 2 ? '#F1F5F9' : '#FECACA'; 
  const stop2 = rank === 1 ? '#D97706' : rank === 2 ? '#64748B' : '#9A3412';
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="60%" stopColor={stop2} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <path d="M8 21l1.5-4h5L16 21H8z" fill={stop2} stroke={stop2} strokeWidth="1" strokeLinejoin="round"/>
      <path d="M7 21h10v1H7z" fill="#000" fillOpacity="0.5" />
      <circle cx="12" cy="10" r="8" fill={`url(#${gradientId})`} />
      <path d="M6 7a8 8 0 0 0 12 6M18 7a8 8 0 0 1-12 6M4 10h16M12 2v16" stroke="#000" strokeOpacity="0.3" strokeWidth="0.5" fill="none"/>
    </svg>
  );
};

const getRankColors = (rank: number) => {
  if (rank === 1) return { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]', rowBg: 'bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent hover:from-yellow-500/15' };
  if (rank === 2) return { text: 'text-slate-300', bg: 'bg-slate-300', border: 'border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.2)]', rowBg: 'bg-gradient-to-r from-slate-400/10 via-transparent to-transparent hover:from-slate-400/15' };
  if (rank === 3) return { text: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.2)]', rowBg: 'bg-gradient-to-r from-amber-600/10 via-transparent to-transparent hover:from-amber-600/15' };
  return { text: 'text-foreground', bg: 'bg-muted', border: 'border-border', rowBg: 'hover:bg-muted/50' };
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

  const displayRows = sortedRows;

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
            {lang === 'ar' ? 'المساهمات' : 'Contributions'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'ترتيب تأثير مبني على الأهداف والأسيست والمشاركات' : 'Impact ranking based on goals, assists and appearances'}
          </p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary ms-auto" />}
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
             {!isLoading && displayRows.map((player) => {
              const colors = getRankColors(player.rank);
              const isTop3 = player.rank <= 3;
              return (
                <TableRow key={player.name} className={cn('transition-colors border-y', colors.border, colors.rowBg)}>
                  <TableCell>
                    <div className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold font-display',
                      isTop3 ? `${colors.bg} text-black shadow-card` : 'bg-muted text-foreground',
                    )}>
                      {player.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className={cn('font-bold text-sm flex items-center gap-2', isTop3 && colors.text)}>
                        {player.name}
                        {isTop3 && <BallIcon className="w-5 h-5 drop-shadow-md" rank={player.rank} />}
                      </div>
                        <div className="text-xs text-muted-foreground">{player.club}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 font-display font-extrabold tabular-nums">
                      <Star className={cn('h-3.5 w-3.5', isTop3 ? colors.text : 'text-primary fill-primary')} />
                      <span className={isTop3 ? colors.text : 'text-foreground'}>{player.impact}</span>
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
