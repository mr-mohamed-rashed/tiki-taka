import { useState } from 'react';
import { MessageCircle, Radio, Tv, Loader2, CircleDot } from 'lucide-react';
import { AdBanner } from '@/components/tikitaka/AdBanner';
import { Button } from '@/components/ui/button';
import { AdSlotSelector } from '@/components/tikitaka/AdSlotSelector';
import { EditModeToggle } from '@/components/tikitaka/EditModeToggle';
import { Live2DTracker } from '@/components/tikitaka/Live2DTracker';
import { LiveChat } from '@/components/tikitaka/LiveChat';
import { MatchCenter } from '@/components/tikitaka/MatchCenter';
import { Navigation } from '@/components/tikitaka/Navigation';
import { NewsTicker } from '@/components/tikitaka/NewsTicker';
import { ShareMenu } from '@/components/tikitaka/ShareMenu';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { TournamentCountdown } from '@/components/tikitaka/TournamentCountdown';
import { LiveLayoutSwitcher, LayoutMode } from '@/components/tikitaka/LiveLayoutSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useLiveFixtures, useUpcomingFixtures } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LiveMatches = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('youtube');
  const [showTiktokChat, setShowTiktokChat] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const { lang, dir } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { data: liveMatches = [], isLoading: liveLoading } = useLiveFixtures();
  const { data: upcomingMatches = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const isLoading = liveLoading || upcomingLoading;
  
  const nextMatch = upcomingMatches
    .filter((match) => new Date(match.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? upcomingMatches[0];
  const featured = liveMatches[0] || nextMatch;

  const handleTiktokTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTiktokTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distanceX = touchStartX - touchEndX;

    // Horizontal swipe logic for chat visibility
    if (Math.abs(distanceX) > 50) {
      if (distanceX > 50) {
        // Swipe Left (hide or show depending on RTL/LTR)
        setShowTiktokChat(dir === 'rtl' ? true : false);
      } else if (distanceX < -50) {
        // Swipe Right
        setShowTiktokChat(dir === 'rtl' ? false : true);
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <EditModeToggle />
      <NewsTicker />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-12">
        <AdSlotSelector location="live-page" onAdd={() => {}} />
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShareMenu />
            <div className="flex flex-col gap-4 hidden md:flex">
              <AdBanner slotId="live-sidebar-1" />
              <AdBanner slotId="live-sidebar-2" />
            </div>
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
            <LiveLayoutSwitcher currentMode={layoutMode} onModeChange={setLayoutMode} />
            
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

            {layoutMode === 'youtube' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 flex-col lg:flex-row">
                <div className="lg:col-span-3 order-1 relative">
                  <Live2DTracker match={featured} hideSocials={true} />
                </div>
                <div className="lg:col-span-2 order-2 h-[500px] lg:h-auto">
                  <LiveChat matchId={featured?.id?.toString() || 'main_live_stream'} />
                </div>
              </div>
            )}

            {layoutMode === 'tiktok' && (
              <div 
                className="relative w-full h-[85vh] lg:h-[85vh] bg-black rounded-xl overflow-hidden mb-8 shadow-2xl"
                onTouchStart={handleTiktokTouchStart}
                onTouchEnd={handleTiktokTouchEnd}
              >
                {/* Dynamic Blurred Background representing TikTok's background */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-black to-destructive/20 animate-pulse-slow blur-3xl opacity-50 transform scale-150"></div>
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl"></div>
                </div>

                {/* The Video Container */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                  <div className="w-full max-h-full aspect-video flex items-center justify-center bg-black/40">
                    <Live2DTracker match={featured} hideSocials={true} forceMode="video-only" />
                  </div>
                </div>

                {/* Chat Overlay */}
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-3/5 z-20 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end transition-transform duration-300 ease-in-out",
                    showTiktokChat ? "translate-x-0 opacity-100" : (dir === 'rtl' ? "translate-x-full opacity-0" : "-translate-x-full opacity-0")
                  )}
                >
                  <div className="h-full pt-12">
                    <LiveChat matchId={featured?.id?.toString() || 'main_live_stream'} variant="overlay" />
                  </div>
                </div>
                
                {/* Swipe Indicators */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-30 pointer-events-none hidden md:flex items-center text-white">
                   <div className="w-0 h-0 border-y-[10px] border-y-transparent border-r-[15px] border-r-white/50 animate-pulse"></div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-30 pointer-events-none hidden md:flex items-center text-white">
                   <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[15px] border-l-white/50 animate-pulse"></div>
                </div>
              </div>
            )}

            {layoutMode === 'facebook' && (
              <div className="flex flex-col gap-4 mb-8">
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                  <Live2DTracker match={featured} hideSocials={true} forceMode="video-only" />
                  {/* Floating emojis layer for facebook can go here */}
                  <div className="absolute bottom-4 right-4 pointer-events-none flex gap-2">
                    <div className="animate-bounce text-2xl">👍</div>
                    <div className="animate-bounce delay-100 text-2xl">❤️</div>
                  </div>
                </div>
                <div className="h-[400px]">
                  <LiveChat matchId={featured?.id?.toString() || 'main_live_stream'} />
                </div>
              </div>
            )}
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
