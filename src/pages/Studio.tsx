import { useState, useEffect, useRef } from 'react';
import { Video, Users, MessageSquare, Radio, Maximize, Minimize, PanelRightClose, PanelRightOpen, Volume2, VolumeX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/tikitaka/Navigation';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { LiveChat } from '@/components/tikitaka/LiveChat';
import { supabase } from '@/integrations/supabase/client';

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
  const [state, setState] = useState<LiveStudioState>(defaultState);
  const [viewers, setViewers] = useState(0);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsTheater(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (mainRef.current?.requestFullscreen) {
          await mainRef.current.requestFullscreen();
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock('landscape').catch(() => {});
          }
        }
        setIsTheater(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        }
        setIsTheater(false);
      }
    } catch (e) {
      console.log('Fullscreen error:', e);
      setIsTheater(!isTheater);
    }
  };

  const servers = (() => {
    if (!state.streamUrl) return [];
    try {
      const parsed = JSON.parse(state.streamUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {
      return [{ name: 'Server 1', url: state.streamUrl }];
    }
    return [];
  })();

  const activeServerUrl = servers[activeServerIndex]?.url || '';

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
      case 'sm': return 'w-[16%] h-[8%] md:w-[10%] md:h-[5%] lg:w-[8%] lg:h-[4%]';
      case 'lg': return 'w-[28%] h-[14%] md:w-[18%] md:h-[9%] lg:w-[14%] lg:h-[7%]';
      case 'md':
      default: return 'w-[22%] h-[10%] md:w-[14%] md:h-[7%] lg:w-[10%] lg:h-[6%]';
    }
  };

  const getLogoPositionClasses = () => {
    switch (state.logoPosition) {
      case 'top-right': return 'top-[2%] right-[2%]';
      case 'top-left': return 'top-[2%] left-[2%]';
      case 'bottom-right': return 'bottom-[2%] right-[2%]';
      case 'bottom-left': return 'bottom-[2%] left-[2%]';
      default: return 'hidden';
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {!isTheater && <Navigation />}

      <main 
        ref={mainRef}
        className={cn("transition-all", isTheater ? "fixed inset-0 z-50 bg-black w-full h-full flex flex-col p-0 m-0" : "container mx-auto py-10 px-4 lg:px-8 space-y-8 min-h-[70vh]")}
      >
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

        <div className={cn("gap-6", isTheater ? "flex flex-1 w-full h-full min-h-0" : (showChat ? "grid grid-cols-1 lg:grid-cols-3" : "grid grid-cols-1"))}>
          <div className={cn("relative transition-all flex flex-col min-h-0", isTheater ? "flex-1 w-full h-full" : (showChat ? "lg:col-span-2" : "col-span-1"))}>
            {servers.length > 1 && !isTheater && (
              <div className="flex flex-wrap gap-2 mb-3">
                {servers.map((server: any, idx: number) => (
                  <Button
                    key={idx}
                    variant={idx === activeServerIndex ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveServerIndex(idx)}
                    className="font-bold text-xs shadow-sm"
                  >
                    {server.name || `Server ${idx + 1}`}
                  </Button>
                ))}
              </div>
            )}
            
            {/* When in theater mode, show server tabs as overlay */}
            {servers.length > 1 && isTheater && (
              <div className="absolute top-4 left-4 z-50 flex flex-wrap gap-2 opacity-50 hover:opacity-100 transition-opacity">
                {servers.map((server: any, idx: number) => (
                  <Button
                    key={idx}
                    variant={idx === activeServerIndex ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveServerIndex(idx)}
                    className="font-bold text-xs shadow-sm bg-black/60 text-white border-none hover:bg-black/80"
                  >
                    {server.name || `Server ${idx + 1}`}
                  </Button>
                ))}
              </div>
            )}

            <Card className={cn("bg-black flex flex-col items-center justify-center border-border relative group", isTheater ? "h-full w-full rounded-none border-none overflow-hidden" : "aspect-video rounded-xl overflow-hidden")}>
              <div 
                className={cn("relative w-full h-full", isTheater ? "" : "absolute inset-0")}
                style={isTheater ? { maxWidth: 'calc(100vh * (16 / 9))', maxHeight: 'calc(100vw * (9 / 16))', aspectRatio: '16/9' } : {}}
              >
              
              {/* Controls Overlay */}
              <div className="absolute bottom-16 right-4 z-50 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity items-center">
                {isTheater && (
                  <Button variant="secondary" size="icon" onClick={() => setShowChat(!showChat)} className="bg-black/50 text-white hover:bg-black/80 border-none">
                    {showChat ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="bg-black/50 text-white hover:bg-black/80 border-none">
                  {isTheater ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>

              {!state.isLive || !activeServerUrl ? (
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
                <div className="absolute inset-0 overflow-hidden bg-black">
                  <iframe
                    src={(() => {
                      let finalUrl = activeServerUrl.trim();
                      if (finalUrl.includes('youtube.com/watch?v=')) {
                        finalUrl = finalUrl.replace('watch?v=', 'embed/');
                      } else if (finalUrl.includes('youtu.be/')) {
                        const videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
                        if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
                      }
                      if (finalUrl.includes('youtube.com/embed/')) {
                        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'autoplay=1';
                      }
                      return finalUrl;
                    })()}
                    className="absolute w-full left-0 right-0 pointer-events-auto"
                    style={{ top: '-55px', height: 'calc(100% + 55px)' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {/* Dynamic Logo Cover */}
              {state.logoPosition !== 'none' && (
                <div 
                  className={cn(
                    "absolute bg-black/95 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl flex items-center justify-center gap-1.5 sm:gap-2 z-40 pointer-events-none",
                    getLogoSizeClasses(),
                    getLogoPositionClasses()
                  )}
                >
                  <div className="flex flex-col items-end justify-center">
                    <div className={cn(
                      "text-primary font-display font-extrabold leading-none animate-pulse",
                      state.logoSize === 'sm' ? "text-[8px] sm:text-[0.8vw]" :
                      state.logoSize === 'lg' ? "text-[14px] sm:text-[1.5vw]" :
                      "text-[10px] sm:text-[1vw] md:text-[0.8vw]"
                    )}>TIKI-TAKA</div>
                    {state.logoSize !== 'sm' && <div className={cn(
                      "text-white/50 uppercase tracking-wider hidden sm:block mt-0.5 leading-none",
                      state.logoSize === 'lg' ? "text-[8px] md:text-[0.6vw]" : "text-[6px] md:text-[0.4vw]"
                    )}>Live Broadcast</div>}
                  </div>
                  <img 
                    src="/icons/tiki-taka-icon.png" 
                    alt="World Cup" 
                    className={cn(
                      "object-contain",
                      state.logoSize === 'sm' ? "w-2.5 h-2.5 sm:w-[1.2vw] sm:h-[1.2vw]" :
                      state.logoSize === 'lg' ? "w-4 h-4 sm:w-[2.2vw] sm:h-[2.2vw]" :
                      "w-3 h-3 sm:w-[1.5vw] sm:h-[1.5vw] md:w-[1.2vw] md:h-[1.2vw]"
                    )} 
                  />
                </div>
              )}

              {/* Overlay Chat in Theater Mode */}
              {isTheater && showChat && (
                <div className="absolute top-0 right-0 w-full sm:w-[350px] h-full z-40 bg-gradient-to-l from-black/90 via-black/40 to-transparent flex flex-col justify-end p-2 sm:p-4 pointer-events-none">
                  <div className="pointer-events-auto">
                    <LiveChat matchId="studio_live" variant="overlay" />
                  </div>
                </div>
              )}
              </div>
            </Card>

            {/* Scrolling Marquee / Overlay Text (Moved Below Video) */}
            {state.overlayText && (
              <div className={cn("w-full overflow-hidden flex items-center h-10 px-4", isTheater ? "bg-black text-white absolute bottom-0 left-0 right-0 z-50 opacity-80" : "bg-card border border-border rounded-lg mt-3")}>
                <div className="whitespace-nowrap animate-ticker-ar font-arabic font-bold tracking-wide flex items-center">
                  <span className="text-live mx-4 animate-pulse-live">● LIVE</span>
                  <span className={isTheater ? "text-white" : "text-foreground"}>{state.overlayText}</span>
                </div>
              </div>
            )}
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
