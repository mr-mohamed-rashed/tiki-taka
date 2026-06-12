import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from './MatchCard';
import { TournamentCountdown } from './TournamentCountdown';
import { Radio, Calendar, CheckCircle2, Loader2, Play } from 'lucide-react';
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
  const nextMatch = upcoming
    .filter((match) => new Date(match.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? upcoming[0];

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
        {!liveLoading && live.length === 0 && <TournamentCountdown match={nextMatch} />}
      </TabsContent>

      <TabsContent value="fixtures" className="mt-6">
        {upcomingLoading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><SkeletonCards /></div>}
        {!upcomingLoading && upcoming.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
        {!upcomingLoading && upcoming.length === 0 && <TournamentCountdown match={nextMatch} />}
      </TabsContent>

      <TabsContent value="results" className="mt-6">
        {finishedLoading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><SkeletonCards /></div>}
        {!finishedLoading && finished.length > 0 && (
          <div className="rounded-lg border border-primary/30 bg-gradient-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className={lang === 'ar' ? 'font-arabic' : ''}>
                <h3 className="font-display text-xl font-extrabold">
                  {lang === 'ar' ? 'النتائج النهائية نزلت في الملخصات' : 'Final scores moved to highlights'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === 'ar'
                    ? 'عشان الصفحة تفضل خفيفة، الماتش اللي يخلص بيتشال من المواعيد وبيظهر تحت كنتيجة ثابتة مع زر مشاهدة الملخص.'
                    : 'To keep this area clean, finished matches leave the schedule and appear below as pinned highlight cards.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {finished.slice(0, 3).map((match) => (
                  <div key={match.id} className="rounded-md border border-border bg-background px-3 py-2 text-xs font-bold">
                    {match.home.shortName} {match.homeScore}-{match.awayScore} {match.away.shortName}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
              <Play className="h-4 w-4" />
              {lang === 'ar' ? 'لو عايز تشوف ملخص المباراة انزل لقسم الملخصات' : 'Scroll to Highlights to watch the match summary'}
            </div>
          </div>
        )}
        {!finishedLoading && finished.length === 0 && <TournamentCountdown match={nextMatch} />}
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
