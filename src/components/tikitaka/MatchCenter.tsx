import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from './MatchCard';
import { TournamentCountdown } from './TournamentCountdown';
import { Live2DTracker } from './Live2DTracker';
import { Radio, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveFixtures, useUpcomingFixtures, useResults } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import type { Match } from '@/lib/footballData';

interface MatchCenterProps {
  defaultTab?: 'live' | 'fixtures' | 'results';
  liveTabRedirectTo?: string;
}

const PAGE_SIZE = 4;

export function MatchCenter({ defaultTab = 'live', liveTabRedirectTo }: MatchCenterProps) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement | null>(null);
  const { data: live = [], isLoading: liveLoading } = useLiveFixtures();
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: finished = [], isLoading: finishedLoading } = useResults();
  const [pages, setPages] = useState({ live: 1, fixtures: 1, results: 1 });
  const nextMatch = upcoming
    .filter((match) => new Date(match.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? upcoming[0];

  const setTabPage = (tab: keyof typeof pages, page: number) => {
    setPages((current) => ({ ...current, [tab]: page }));
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full" ref={topRef}>
      <TabsList className="bg-card border border-border h-auto p-1 grid grid-cols-3 w-full max-w-md">
        <TabsTrigger
          value="live"
          onClick={(event) => {
            if (!liveTabRedirectTo) return;
            event.preventDefault();
            navigate(liveTabRedirectTo);
          }}
          className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold"
        >
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
        {liveLoading && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"><SkeletonCards /></div>}
        {!liveLoading && live.length > 0 && (
          <div className="space-y-5">
            <PaginatedMatchGrid matches={live} page={pages.live} onPageChange={(page) => setTabPage('live', page)} onJumpToTop={() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} lang={lang} />
          </div>
        )}
        {!liveLoading && live.length === 0 && (
          nextMatch ? <TournamentCountdown match={nextMatch} /> : <EmptyMatchesMessage type="live" lang={lang} />
        )}
      </TabsContent>

      <TabsContent value="fixtures" className="mt-6">
        {upcomingLoading && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"><SkeletonCards /></div>}
        {!upcomingLoading && upcoming.length > 0 && (
          <PaginatedMatchGrid matches={upcoming} page={pages.fixtures} onPageChange={(page) => setTabPage('fixtures', page)} onJumpToTop={() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} lang={lang} />
        )}
        {!upcomingLoading && upcoming.length === 0 && <EmptyMatchesMessage type="fixtures" lang={lang} />}
      </TabsContent>

      <TabsContent value="results" className="mt-6">
        {finishedLoading && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"><SkeletonCards /></div>}
        {!finishedLoading && finished.length > 0 && (
          <PaginatedMatchGrid matches={finished} page={pages.results} onPageChange={(page) => setTabPage('results', page)} onJumpToTop={() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} lang={lang} />
        )}
        {!finishedLoading && finished.length === 0 && <EmptyMatchesMessage type="fixtures" lang={lang} />}
      </TabsContent>
    </Tabs>
  );
}

function EmptyMatchesMessage({ type, lang }: { type: 'live' | 'fixtures'; lang: string }) {
  return (
    <div className="rounded-lg border border-border border-dashed bg-gradient-card p-8 text-center">
      <Trophy className="mx-auto mb-4 h-10 w-10 text-primary" />
      <h3 className={lang === 'ar' ? 'font-arabic font-bold text-xl' : 'font-bold text-xl'}>
        {type === 'live'
          ? (lang === 'ar' ? 'لا توجد مباريات مباشرة الآن' : 'No live matches right now')
          : (lang === 'ar' ? 'لا توجد مواعيد قادمة الآن' : 'No upcoming fixtures right now')}
      </h3>
      <p className={lang === 'ar' ? 'font-arabic mt-2 text-sm text-muted-foreground' : 'mt-2 text-sm text-muted-foreground'}>
        {lang === 'ar'
          ? 'سيتم تحديث هذا القسم تلقائياً عند وصول بيانات جديدة.'
          : 'This section will update automatically when new data arrives.'}
      </p>
    </div>
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

function PaginatedMatchGrid({
  matches,
  page,
  onPageChange,
  onJumpToTop,
  lang,
}: {
  matches: Match[];
  page: number;
  onPageChange: (page: number) => void;
  onJumpToTop: () => void;
  lang: string;
}) {
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleMatches = useMemo(
    () => matches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [matches, safePage],
  );

  const goToPage = (nextPage: number) => {
    const targetPage = Math.min(Math.max(nextPage, 1), totalPages);
    onPageChange(targetPage);
    window.setTimeout(onJumpToTop, 0);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleMatches.map((match) => <MatchCard key={match.id} match={match} />)}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card/60 p-3">
          <div className={lang === 'ar' ? 'font-arabic text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
            {lang === 'ar'
              ? `صفحة ${safePage} من ${totalPages} - كل صفحة ${PAGE_SIZE} مباريات`
              : `Page ${safePage} of ${totalPages} - ${PAGE_SIZE} matches per page`}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {lang === 'ar' ? 'السابق' : 'Prev'}
            </Button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                type="button"
                variant={pageNumber === safePage ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(pageNumber)}
                className="h-9 w-9 p-0"
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
              className="gap-1"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
