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
    <div className="h-[100dvh] md:h-auto flex flex-col overflow-hidden md:overflow-visible bg-black text-white" dir={dir}>
      <EditModeToggle />
      
      {/* App Bar (Navigation & Ticker) at the top - Hidden on mobile */}
      <div className="z-50 relative shrink-0 bg-background hidden md:block">
        <NewsTicker />
        <Navigation />
      </div>

      <main className="relative w-full flex flex-col md:pb-8">
        {/* Mobile Floating App Bar */}
        <div className="z-[60] absolute top-0 left-0 w-full md:hidden pointer-events-none p-1 transition-opacity duration-300">
           <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-full px-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10">
             <div className="[&>nav]:bg-transparent [&>nav]:border-none [&>nav]:backdrop-blur-none [&>nav>div]:px-2 [&>nav]:h-12 flex items-center">
               <Navigation />
             </div>
           </div>
        </div>

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
        ) : featured || get('live_stream_url', 'en') ? (
          <section className="flex flex-col lg:flex-row w-full lg:max-w-7xl lg:mx-auto lg:p-6 lg:gap-6 lg:items-stretch">
            <div className="relative h-[35vh] sm:h-[40vh] md:h-auto lg:flex-1 shrink-0 w-full lg:max-w-3xl">
              <Live2DTracker match={featured || { id: 'main', home: { name: 'A', color: '#888' }, away: { name: 'B', color: '#aaa' } } as any} hideSocials={true} />
            </div>
            <div className="flex-1 min-h-0 md:min-h-[auto] w-full lg:w-[400px] xl:w-[450px] shrink-0 h-full lg:h-auto">
              <LiveChat matchId={featured?.id?.toString() || 'main_live_stream'} />
            </div>
          </section>
        ) : (
          <section className="flex items-center justify-center h-full w-full min-h-[600px]">
            {nextMatch ? <TournamentCountdown match={nextMatch} /> : <div className="text-muted-foreground text-xl font-arabic">{lang === 'ar' ? 'لا توجد مباريات حالياً' : 'No matches available at the moment'}</div>}
          </section>
        )}
      </main>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <One2Footer />
      </div>
    </div>
  );
};

export default LiveMatches;
