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
            {!isLoading && visibleScorers.map((scorer: Scorer) => (
              <TableRow
                key={scorer.name}
                className={cn(
                  'border-border transition-colors',
                  scorer.isLeader
                    ? 'bg-gradient-to-r from-gold/10 via-transparent to-transparent hover:from-gold/15'
                    : 'hover:bg-muted/50',
                )}
              >
                <TableCell>
                  <div className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold font-display',
                    scorer.isLeader ? 'bg-gold text-gold-foreground shadow-card' : 'bg-muted text-foreground',
                  )}>
                    {scorer.rank}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={scorer.country.flag} alt={scorer.country.name} className="w-6 h-6 rounded object-cover ring-1 ring-border" />
                    <div>
                      <div className={cn('font-bold text-sm', scorer.isLeader && 'text-gold')}>{scorer.name}</div>
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
            ))}
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
