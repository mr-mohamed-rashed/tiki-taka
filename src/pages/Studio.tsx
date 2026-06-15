import { useState, useEffect } from 'react';
import { Video, Users, MessageSquare, Radio, Maximize, Minimize, PanelRightClose, PanelRightOpen, Volume2, VolumeX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/tikitaka/Navigation';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { LiveChat } from '@/components/tikitaka/LiveChat';
import { supabase } from '@/integrations/supabase/client';
import ReactPlayer from 'react-player';

interface LiveStudioState {
  streamUrl: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'none';
  logoSize: 'sm' | 'md' | 'lg';
  overlayText: string;
  isLive: boolean;
}

const defaultState: LiveStudioState = {
  streamUrl: '',
  logoPosition: 'top-right',
  logoSize: 'md',
  overlayText: '',
  isLive: false
};

export default function Studio() {
  const { lang, dir } = useLanguage();
  const [showChat, setShowChat] = useState(true);
  const [isTheater, setIsTheater] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [state, setState] = useState<LiveStudioState>(defaultState);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    let interval: any;
    if (state.isLive) {
      if (viewers === 0) setViewers(Math.floor(Math.random() * (46000 - 45000 + 1)) + 45000);
      interval = setInterval(() => {
        setViewers(prev => {
          const change = Math.floor(Math.random() * 2000) - 800; // -800 to +1200
          const newVal = prev + change;
          if (newVal > 51000) return newVal - 1500;
          if (newVal < 45000) return newVal + 1500;
          return newVal;
        });
      }, 3500);
    } else {
      setViewers(0);
    }
    return () => clearInterval(interval);
  }, [state.isLive]);

  useEffect(() => {
    // Initial fetch
    const fetchState = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value_en')
        .eq('key', 'live_studio_state')
        .single();
      
      if (!error && data?.value_en) {
        setState(JSON.parse(data.value_en));
      }
    };
    fetchState();

    // Subscribe to real-time changes
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.live_studio_state',
        },
        (payload) => {
          if (payload.new && (payload.new as any).value_en) {
            setState(JSON.parse((payload.new as any).value_en));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getLogoSizeClasses = () => {
    switch (state.logoSize) {
      case 'sm': return 'w-20 h-12 text-sm sm:w-24 sm:h-16 sm:text-base';
      case 'lg': return 'w-40 h-28 text-3xl sm:w-56 sm:h-36 sm:text-4xl';
      case 'md':
      default: return 'w-28 h-20 text-xl sm:w-40 sm:h-28 sm:text-2xl';
    }
  };

  const getLogoPositionClasses = () => {
    switch (state.logoPosition) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      default: return 'hidden';
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navigation />

      <main className={cn("container mx-auto transition-all", isTheater ? "py-0 px-0 min-h-[calc(100vh-64px)]" : "py-10 px-4 lg:px-8 space-y-8 min-h-[70vh]")}>
        {!isTheater && (
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-neon">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h1 className={cn('font-display font-extrabold text-3xl', lang === 'ar' && 'font-arabic')}>
                  {lang === 'ar' ? 'الاستوديو المباشر' : 'Live Studio'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
                  {lang === 'ar' ? 'بث حصري للمتابعين' : 'Exclusive broadcast for followers'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowChat(!showChat)} variant="outline" className="gap-2">
                {showChat ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                {showChat ? (lang === 'ar' ? 'إخفاء الشات' : 'Hide Chat') : (lang === 'ar' ? 'إظهار الشات' : 'Show Chat')}
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <NavLink to="/live">
                  <Radio className="h-4 w-4 text-live" />
                  {lang === 'ar' ? 'العودة للمباريات المباشرة' : 'Back to Live Matches'}
                </NavLink>
              </Button>
            </div>
          </header>
        )}

        <div className={cn("grid gap-6", isTheater ? "grid-cols-1" : (showChat ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"))}>
          <div className={cn("relative transition-all", isTheater ? "h-[calc(100vh-64px)] w-full" : (showChat ? "lg:col-span-2" : "col-span-1"))}>
            <Card className={cn("bg-black overflow-hidden flex flex-col items-center justify-center border-border relative group", isTheater ? "h-full w-full rounded-none" : "aspect-video rounded-xl")}>
              
              {/* Controls Overlay */}
              <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={cn("border-none text-white", "bg-black/50 hover:bg-black/80")}
                  title={lang === 'ar' ? "كتم / تشغيل الصوت" : "Toggle Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                {isTheater && (
                  <Button variant="secondary" size="icon" onClick={() => setShowChat(!showChat)} className="bg-black/50 text-white hover:bg-black/80 border-none">
                    {showChat ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="secondary" size="icon" onClick={() => setIsTheater(!isTheater)} className="bg-black/50 text-white hover:bg-black/80 border-none">
                  {isTheater ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>

              {!state.isLive || !state.streamUrl ? (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <Video className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className={cn('text-xl font-bold text-white mb-2', lang === 'ar' && 'font-arabic')}>
                    {lang === 'ar' ? 'البث لم يبدأ بعد' : 'Broadcast not started yet'}
                  </h3>
                  <p className="text-white/50 text-sm max-w-md text-center px-4">
                    {lang === 'ar'
                      ? 'انتظرونا قريباً في بث مباشر وتغطية حصرية. سيتم إشعاركم فور بدء البث.'
                      : 'Stay tuned for our exclusive live broadcast. You will be notified when the stream starts.'}
                  </p>
                </>
              ) : (
                <ReactPlayer
                  url={state.streamUrl}
                  playing={true}
                  muted={isMuted}
                  controls={false}
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                  style={{ objectFit: 'contain' }}
                />
              )}

              {/* Dynamic Logo Cover */}
              {state.logoPosition !== 'none' && (
                <div 
                  className={cn(
                    "absolute bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl flex flex-col items-center justify-center z-40 transition-all duration-500 pointer-events-none",
                    getLogoSizeClasses(),
                    getLogoPositionClasses(),
                    isTheater && state.logoPosition.includes('top') ? "top-16" : "" // shift down if controls are top right
                  )}
                >
                  <div className="text-primary font-display font-extrabold animate-pulse">Tiki Taka</div>
                  {state.logoSize !== 'sm' && <div className="text-white/50 text-[10px] sm:text-xs mt-1 uppercase tracking-wider">Live Broadcast</div>}
                </div>
              )}

              {/* Scrolling Marquee / Overlay Text */}
              {state.overlayText && (
                <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none overflow-hidden rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center h-10 px-4">
                  <div className="whitespace-nowrap animate-ticker-ar font-arabic font-bold text-white tracking-wide">
                    <span className="text-primary mx-4">● LIVE</span>
                    {state.overlayText}
                  </div>
                </div>
              )}

              {/* Overlay Chat in Theater Mode */}
              {isTheater && showChat && (
                <div className="absolute top-0 right-0 w-full sm:w-[350px] h-full z-40 bg-gradient-to-l from-black/90 via-black/40 to-transparent flex flex-col justify-end p-2 sm:p-4">
                  <LiveChat matchId="studio_live" variant="overlay" />
                </div>
              )}
            </Card>
          </div>

          {!isTheater && showChat && (
            <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="p-4 border-border bg-card/60 backdrop-blur flex-1 flex flex-col min-h-[500px]">
                <h3 className={cn('font-bold text-lg mb-4 flex items-center gap-2', lang === 'ar' && 'font-arabic')}>
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {lang === 'ar' ? 'الدردشة الحية' : 'Live Chat'}
                </h3>
                <div className="flex-1 min-h-0 relative">
                  <div className="absolute inset-0 overflow-y-auto pr-2">
                    <LiveChat matchId="studio_live" />
                  </div>
                </div>
              </Card>

            <Card className="p-6 border-border bg-card/60 backdrop-blur">
              <h3 className={cn('font-bold text-lg mb-4 flex items-center gap-2', lang === 'ar' && 'font-arabic')}>
                <Users className="h-5 w-5 text-primary" />
                {lang === 'ar' ? 'إحصائيات البث' : 'Stream Stats'}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'المشاهدين الآن' : 'Viewers'}</span>
                  <span className="font-bold text-live flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />
                    {state.isLive ? viewers.toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
          )}
        </div>
      </main>

      {!isTheater && <TikiTakaFooter />}
    </div>
  );
}
