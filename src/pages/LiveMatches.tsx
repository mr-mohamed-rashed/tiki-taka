import { useState } from 'react';
import { MessageCircle, Radio, Tv, Loader2, CircleDot } from 'lucide-react';
import { AdBanner } from '@/components/one2/AdBanner';
import { Button } from '@/components/ui/button';
import { AdSlotSelector } from '@/components/one2/AdSlotSelector';
import { EditModeToggle } from '@/components/one2/EditModeToggle';
import { Live2DTracker } from '@/components/one2/Live2DTracker';
import { LiveChat } from '@/components/one2/LiveChat';
import { MatchCenter } from '@/components/one2/MatchCenter';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { ShareMenu } from '@/components/one2/ShareMenu';
import { One2Footer } from '@/components/one2/One2Footer';
import { TournamentCountdown } from '@/components/one2/TournamentCountdown';
import { TournamentCountdown } from '@/components/one2/TournamentCountdown';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useLiveFixtures, useUpcomingFixtures } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LiveMatches = () => {
  const { lang, dir } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { data: liveMatches = [], isLoading: liveLoading } = useLiveFixtures();
  const { data: upcomingMatches = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const isLoading = liveLoading || upcomingLoading;
  
  const nextMatch = upcomingMatches
    .filter((match) => new Date(match.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? upcomingMatches[0];
  const featured = liveMatches[0] || nextMatch;


  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-black text-white" dir={dir}>
      <EditModeToggle />
      
      {/* App Bar (Navigation & Ticker) at the top */}
      <div className="z-50 relative shrink-0 bg-background">
        <NewsTicker />
        <Navigation />
      </div>

      <main className="flex-1 relative w-full h-full flex flex-col">
        {isLoading ? (
          <section className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative p-6 rounded-3xl bg-card border border-border shadow-2xl flex flex-col items-center justify-center gap-4">
                <CircleDot className="h-16 w-16 text-primary animate-spin-slow" strokeWidth={2} />
                <div className="font-display font-extrabold text-3xl tracking-wide">
                  <span className="text-foreground">ONE</span>
                  <span className="text-primary">2</span>
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
          <section className="absolute inset-0 w-full h-full">
            <div className="flex flex-col lg:flex-row h-full w-full">
              <div className="flex-1 relative h-[60%] lg:h-full">
                <Live2DTracker match={featured} hideSocials={true} />
              </div>
              <div className="h-[40%] lg:h-full lg:w-[400px] bg-background border-l border-border/50">
                <LiveChat matchId={featured?.id?.toString() || 'main_live_stream'} />
              </div>
            </div>
          </section>
        ) : (
          <section className="flex items-center justify-center h-full w-full">
            {nextMatch ? <TournamentCountdown match={nextMatch} /> : null}
          </section>
        )}
      </main>
    </div>
  );
};

export default LiveMatches;
