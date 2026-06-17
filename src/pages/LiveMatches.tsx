import { MessageCircle, Radio, Tv, Loader2, CircleDot } from 'lucide-react';
import { AdBanner } from '@/components/tikitaka/AdBanner';
import { AdSlotSelector } from '@/components/tikitaka/AdSlotSelector';
import { EditModeToggle } from '@/components/tikitaka/EditModeToggle';
import { Live2DTracker } from '@/components/tikitaka/Live2DTracker';
import { LiveChat } from '@/components/tikitaka/LiveChat';
import { MatchCenter } from '@/components/tikitaka/MatchCenter';
import { Navigation } from '@/components/tikitaka/Navigation';
import { NewsTicker } from '@/components/tikitaka/NewsTicker';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { TournamentCountdown } from '@/components/tikitaka/TournamentCountdown';
import { useLanguage } from '@/context/LanguageContext';
import { useLiveFixtures, useUpcomingFixtures } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LiveMatches = () => {
  const { lang, dir } = useLanguage();
  const { data: liveMatches = [], isLoading: liveLoading } = useLiveFixtures();
  const { data: upcomingMatches = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const isLoading = liveLoading || upcomingLoading;
  
  const nextMatch = upcomingMatches
    .filter((match) => new Date(match.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? upcomingMatches[0];
  const featured = liveMatches[0] || nextMatch;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <EditModeToggle />
      <NewsTicker />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-12">
        <AdSlotSelector location="live-page" onAdd={() => {}} />
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-live/15 text-live">
              <Radio className="h-5 w-5 animate-pulse-live" />
            </div>
            <div>
              <h1 className={cn('font-display font-extrabold text-3xl sm:text-4xl', lang === 'ar' && 'font-arabic')}>
                {t('liveTitle', lang)}
              </h1>
              <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
                {t('liveSub', lang)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <AdBanner slotId="live-sidebar-1" />
            <AdBanner slotId="live-sidebar-2" />
          </div>
        </header>

        {isLoading ? (
          <section className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative p-6 rounded-3xl bg-card border border-border shadow-2xl flex flex-col items-center justify-center gap-4">
                <CircleDot className="h-16 w-16 text-primary animate-spin-slow" strokeWidth={2} />
                <div className="font-display font-extrabold text-3xl tracking-wide">
                  <span className="text-foreground">TIKI</span>
                  <span className="text-primary">-TAKA</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  <span className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
                    {lang === 'ar' ? 'جاري تجهيز البث والمحادثة...' : 'Preparing stream & chat...'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : featured ? (
          <section>
            {(!get('live_stream_url', 'en') || get('live_stream_url', 'en') === '[]') && (
              <div className="flex items-center gap-2 mb-5">
                <Tv className="h-5 w-5 text-primary" />
                <h2 className={cn('font-display font-extrabold text-2xl', lang === 'ar' && 'font-arabic')}>
                  {t('matchTracker', lang)}
                </h2>
                <span className="text-sm text-muted-foreground ms-1">
                  - {featured.home.name} vs {featured.away.name}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              <div className="lg:col-span-3">
                <Live2DTracker match={featured} />
              </div>
              <div className="lg:col-span-2">
                <LiveChat matchId={featured.id} />
              </div>
            </div>
          </section>
        ) : (
          <section className="max-w-2xl mx-auto mb-12">
            {nextMatch ? <TournamentCountdown match={nextMatch} /> : null}
          </section>
        )}
      </main>

      <TikiTakaFooter />
    </div>
  );
};

export default LiveMatches;
