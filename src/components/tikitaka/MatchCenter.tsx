import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from './MatchCard';
import { TournamentCountdown } from './TournamentCountdown';
import { Radio, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { useLiveFixtures, useUpcomingFixtures, useResults } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';

interface MatchCenterProps {
  defaultTab?: 'live' | 'fixtures' | 'results';
}

export function MatchCenter({ defaultTab = 'live' }: MatchCenterProps) {
  const { lang } = useLanguage();
  const { data: live = [], isLoading: liveLoading } = useLiveFixtures();
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: finished = [], isLoading: finishedLoading } = useResults();

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="bg-card border border-border h-auto p-1 grid grid-cols-3 w-full max-w-md">
        <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold">
          <Radio className="h-4 w-4" />
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('tabLive', lang)}</span>
          {liveLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-xs opacity-70">({live.length})</span>}
        </TabsTrigger>
        <TabsTrigger value="fixtures" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold">
          <Calendar className="h-4 w-4" />
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('tabFixtures', lang)}</span>
        </TabsTrigger>
        <TabsTrigger value="results" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('tabResults', lang)}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="live" className="mt-6">
        {liveLoading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><SkeletonCards /></div>}
        {!liveLoading && live.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {live.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
        {!liveLoading && live.length === 0 && <TournamentCountdown />}
      </TabsContent>

      <TabsContent value="fixtures" className="mt-6">
        {upcomingLoading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><SkeletonCards /></div>}
        {!upcomingLoading && upcoming.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
        {!upcomingLoading && upcoming.length === 0 && <TournamentCountdown />}
      </TabsContent>

      <TabsContent value="results" className="mt-6">
        {finishedLoading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><SkeletonCards /></div>}
        {!finishedLoading && finished.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {finished.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
        {!finishedLoading && finished.length === 0 && <TournamentCountdown />}
      </TabsContent>
    </Tabs>
  );
}

function SkeletonCards() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </>
  );
}
