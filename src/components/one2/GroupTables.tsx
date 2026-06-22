import { useMemo } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { useStandings } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function GroupTables() {
  const { lang } = useLanguage();
  const { data: groups = [], isLoading } = useStandings();

  return (
    <div className="space-y-5">

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {t('loading', lang)}
        </div>
      )}

      {!isLoading && groups.length === 0 && (
        <div className="text-center py-10 text-muted-foreground bg-card/40 rounded-xl border border-border">
          {lang === 'ar' ? 'لا توجد بيانات للمجموعات حالياً' : 'No standings available currently'}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {groups.map((group: any) => (
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
                  {group.teams.map((team: any) => (
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
