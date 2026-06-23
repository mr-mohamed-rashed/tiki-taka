import { useState } from 'react';
import { ArrowUpDown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayerCards } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { player } from '@/lib/footballData';

type SortKey = 'rank' | 'red_cards' | 'yellow_cards';

const getRankColors = (rank: number) => {
  if (rank === 1) return { 
    text: 'text-red-500', 
    badge: 'bg-gradient-to-b from-red-100 to-red-300 text-red-900 border border-red-300', 
    rowStyle: 'bg-red-500/5 hover:bg-red-500/10' 
  };
  return { 
    text: 'text-foreground', 
    badge: 'bg-muted text-foreground border border-border', 
    rowStyle: 'border-y border-border hover:bg-muted/50 [&>td]:border-y [&>td]:border-border' 
  };
};

export function CardsTable() {
  const { lang } = useLanguage();
  const { data: cardsData, isLoading } = usePlayerCards();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [isAscending, setIsAscending] = useState(true);

  const players = [...(cardsData ?? [])].sort((a, b) => {
    const first = (a as any)[sortKey] as number;
    const second = (b as any)[sortKey] as number;
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

  const totalPages = Math.max(1, Math.ceil(players.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleplayers = players.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <Card className="overflow-hidden bg-gradient-card border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-red-500/15">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'سجل البطاقات - كأس العالم 2026' : 'World Cup 2026 Cards Record'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'سجل الكروت الحمراء والصفراء' : 'Red and Yellow cards records'}
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
                <SortButton sortBy="red_cards" label={t('red_cards', lang)} />
              </TableHead>
              <TableHead className="text-center hidden sm:table-cell">
                <SortButton sortBy="yellow_cards" label={t('yellow_cards', lang)} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <TableRow key={index} className="border-border">
                <TableCell colSpan={5}>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && visibleplayers.map((player: any) => {
              const colors = getRankColors(player.rank);
              return (
              <TableRow
                key={player.name}
                className={cn('transition-colors', colors.rowStyle)}
              >
                <TableCell>
                  <div className={cn('w-8 h-9 flex items-center justify-center text-sm font-bold font-display relative mx-auto rounded-md', colors.badge)}>
                    {player.rank}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={player.country.flag} alt={player.country.name} className="w-6 h-6 rounded object-cover ring-1 ring-border" />
                    <div>
                      <div className={cn('font-bold text-sm flex items-center gap-2', colors.text)}>
                        {player.name}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">{player.club}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{player.club}</TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-md font-display font-extrabold tabular-nums',
                    player.red_cards > 0 ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-muted text-muted-foreground',
                  )}>
                    {player.red_cards}
                  </span>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell font-semibold tabular-nums text-muted-foreground">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-md font-display font-extrabold tabular-nums',
                    player.yellow_cards > 0 ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/50' : 'bg-muted text-muted-foreground',
                  )}>
                    {player.yellow_cards}
                  </span>
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
