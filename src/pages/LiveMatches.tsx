import { MessageCircle, Radio, Tv } from 'lucide-react';
import { AdBanner } from '@/components/tikitaka/AdBanner';
import { AdSlotSelector } from '@/components/tikitaka/AdSlotSelector';
import { EditModeToggle } from '@/components/tikitaka/EditModeToggle';
import { Live2DTracker } from '@/components/tikitaka/Live2DTracker';
import { LiveChat } from '@/components/tikitaka/LiveChat';
import { LiveCommentary } from '@/components/tikitaka/LiveCommentary';
import { MatchCenter } from '@/components/tikitaka/MatchCenter';
import { Navigation } from '@/components/tikitaka/Navigation';
import { NewsTicker } from '@/components/tikitaka/NewsTicker';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { useLanguage } from '@/context/LanguageContext';
import { useLiveFixtures, useUpcomingFixtures } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LiveMatches = () => {
  const { lang, dir } = useLanguage();
  const { data: liveMatches = [] } = useLiveFixtures();
  const { data: upcomingMatches = [] } = useUpcomingFixtures();
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
          <AdBanner slotId="live-sidebar-1" />
        </header>

        {featured && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Tv className="h-5 w-5 text-primary" />
              <h2 className={cn('font-display font-extrabold text-2xl', lang === 'ar' && 'font-arabic')}>
                {t('matchTracker', lang)}
              </h2>
              <span className="text-sm text-muted-foreground ms-1">
                - {featured.home.name} vs {featured.away.name}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              <div className="lg:col-span-3">
                <Live2DTracker match={featured} />
              </div>
              <div className="lg:col-span-2">
                <LiveCommentary />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className={cn('font-display font-extrabold text-2xl', lang === 'ar' && 'font-arabic')}>
                {t('liveChat', lang)}
              </h2>
            </div>
            <div className="max-w-2xl">
              <LiveChat matchId={featured.id} />
            </div>
          </section>
        )}

        <section>
          <h2 className={cn('font-display font-extrabold text-2xl mb-5', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'جميع المباريات' : 'All Matches'}
          </h2>
          <MatchCenter defaultTab="live" />
        </section>
      </main>

      <TikiTakaFooter />
    </div>
  );
};

export default LiveMatches;
