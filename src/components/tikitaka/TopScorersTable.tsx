import { useState } from 'react';
import { ArrowUpDown, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { useTopScorers } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Scorer } from '@/lib/footballData';

type SortKey = 'rank' | 'goals' | 'assists' | 'matches';

const BootIcon = ({ className, rank }: { className?: string, rank: number }) => {
  const gradientId = `boot-grad-${rank}`;
  const stop1 = rank === 1 ? '#FDE047' : rank === 2 ? '#E2E8F0' : '#FCA5A5'; // Light gold/silver/bronze
  const stop2 = rank === 1 ? '#D97706' : rank === 2 ? '#64748B' : '#9A3412'; // Dark gold/silver/bronze
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="50%" stopColor={stop2} />
          <stop offset="100%" stopColor={stop1} />
        </linearGradient>
      </defs>
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1c0-1.5-1-3-2.5-3.5L14 12V7a2 2 0 0 0-4 0v2L7 11c-1.5 1-3 2.5-3 3z" fill={`url(#${gradientId})`} stroke={stop2} strokeWidth="0.5" strokeLinejoin="round"/>
      <path d="M6 20v1.5 M10 20v1.5 M14 20v1.5 M18 20v1.5" stroke={stop2} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 14l3-2" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="15" r="1.5" fill="white" fillOpacity="0.4" />
    </svg>
  );
};

const getRankColors = (rank: number) => {
  if (rank === 1) return { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]', rowBg: 'bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent hover:from-yellow-500/15' };
  if (rank === 2) return { text: 'text-slate-300', bg: 'bg-slate-300', border: 'border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.2)]', rowBg: 'bg-gradient-to-r from-slate-400/10 via-transparent to-transparent hover:from-slate-400/15' };
  if (rank === 3) return { text: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.2)]', rowBg: 'bg-gradient-to-r from-amber-600/10 via-transparent to-transparent hover:from-amber-600/15' };
  return { text: 'text-foreground', bg: 'bg-muted', border: 'border-border', rowBg: 'hover:bg-muted/50' };
};

export function TopScorersTable() {
  const { lang } = useLanguage();
  const { data: scorersData, isLoading } = useTopScorers();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [isAscending, setIsAscending] = useState(true);

  const scorers = [...(scorersData ?? [])].sort((a, b) => {
    const first = a[sortKey] as number;
    const second = b[sortKey] as number;
    return isAscending ? first - second : second - first;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setIsAscending((value) => !value);
      return;
    }
    setSortKey(key);
    setIsAscending(key === 'rank');
  };

  const SortButton = ({ sortBy, label }: { sortBy: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSort(sortBy)}
      className="h-8 px-2 -ml-2 font-bold text-muted-foreground hover:text-primary uppercase text-xs tracking-wider"
    >
      {label}
      <ArrowUpDown className={cn('ml-1 h-3 w-3', sortKey === sortBy && 'text-primary')} />
    </Button>
  );

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const totalPages = Math.max(1, Math.ceil(scorers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleScorers = scorers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <Card className="overflow-hidden bg-gradient-card border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-gold/15">
          <Trophy className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'ترتيب هدافي كأس العالم 2026' : 'World Cup 2026 Top Scorers'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'آخر أرقام الهدافين في البطولة' : 'Latest tournament scorer numbers'}
          </p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary ms-auto" />}
      </div>

      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-14">
                <SortButton sortBy="rank" label="#" />
              </TableHead>
              <TableHead className={lang === 'ar' ? 'font-arabic' : ''}>{t('player', lang)}</TableHead>
              <TableHead className={cn('hidden md:table-cell', lang === 'ar' && 'font-arabic')}>{t('club', lang)}</TableHead>
              <TableHead className="text-center">
                <SortButton sortBy="goals" label={t('goals', lang)} />
              </TableHead>
              <TableHead className="text-center hidden sm:table-cell">
                <SortButton sortBy="assists" label={t('assists', lang)} />
              </TableHead>
              <TableHead className="text-center hidden md:table-cell">
                <SortButton sortBy="matches" label={t('matches', lang)} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <TableRow key={index} className="border-border">
                <TableCell colSpan={6}>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && visibleScorers.map((scorer: Scorer) => {
              const colors = getRankColors(scorer.rank);
              const isTop3 = scorer.rank <= 3;
              return (
              <TableRow
                key={scorer.name}
                className={cn(
                  'transition-colors border-y',
                  colors.border,
                  colors.rowBg
                )}
              >
                <TableCell>
                  <div className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold font-display',
                    isTop3 ? `${colors.bg} text-black shadow-card` : 'bg-muted text-foreground',
                  )}>
                    {scorer.rank}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={scorer.country.flag} alt={scorer.country.name} className="w-6 h-6 rounded object-cover ring-1 ring-border" />
                    <div>
                      <div className={cn('font-bold text-sm flex items-center gap-2', isTop3 && colors.text)}>
                        {scorer.name}
                        {isTop3 && <BootIcon className="w-5 h-5 drop-shadow-md" rank={scorer.rank} />}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">{scorer.club}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{scorer.club}</TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-md font-display font-extrabold tabular-nums',
                    scorer.goals > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                  )}>
                    {scorer.goals}
                  </span>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell font-semibold tabular-nums text-muted-foreground">
                  {scorer.assists}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-muted-foreground tabular-nums">
                  {scorer.matches}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border bg-card/40 p-4">
          <div className={lang === 'ar' ? 'font-arabic text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
            {lang === 'ar'
              ? `صفحة ${safePage} من ${totalPages}`
              : `Page ${safePage} of ${totalPages}`}
          </div>

          <div className="flex flex-wrap items-center gap-2" dir="ltr">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="h-8 px-2"
            >
              {lang === 'ar' ? 'السابق' : 'Prev'}
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                type="button"
                variant={pageNumber === safePage ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(pageNumber)}
                className="h-8 w-8 p-0"
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="h-8 px-2"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
