import { useState } from 'react';
import { Star, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPlayerRankings, type PlayerRanking } from '@/lib/footballData';

type SortKey = 'rank' | 'rating' | 'votes';

export function BestPlayersTable() {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [asc, setAsc] = useState(true);
  const rows = [...getPlayerRankings()];
  rows.sort((a, b) => asc ? (a[sortKey] as number) - (b[sortKey] as number) : (b[sortKey] as number) - (a[sortKey] as number));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setAsc(!asc);
    else { setSortKey(k); setAsc(k === 'rank'); }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <Button
      variant="ghost" size="sm"
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
          <h3 className="font-display font-extrabold text-xl">Best Player Rankings</h3>
          <p className="text-xs text-muted-foreground">Fan-voted tournament ratings</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-14"><SortBtn k="rank" label="#" /></TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="hidden sm:table-cell">Pos</TableHead>
              <TableHead className="text-center"><SortBtn k="rating" label="Rating" /></TableHead>
              <TableHead className="text-center hidden md:table-cell"><SortBtn k="votes" label="Votes" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p: PlayerRanking) => {
              const top = p.rank === 1;
              return (
                <TableRow key={p.name} className={cn('border-border hover:bg-muted/50', top && 'bg-primary/5')}>
                  <TableCell>
                    <div className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold font-display',
                      top ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-muted text-foreground'
                    )}>
                      {p.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={p.country.flag} alt={p.country.name} className="w-6 h-6 rounded object-cover ring-1 ring-border" />
                      <div className={cn('font-bold text-sm', top && 'text-primary')}>{p.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">{p.position}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 font-display font-extrabold tabular-nums">
                      <Star className={cn('h-3.5 w-3.5', top ? 'text-primary fill-primary' : 'text-gold fill-gold')} />
                      <span className={top ? 'text-primary' : 'text-foreground'}>{p.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell text-muted-foreground tabular-nums">
                    {p.votes.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
