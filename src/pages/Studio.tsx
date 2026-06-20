import { useState, useEffect } from 'react';
import { Video, ArrowLeft, ArrowRight, MessageSquare, Users, MessageCircle, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LiveChat } from '@/components/one2/LiveChat';
import { ShareMenu } from '@/components/one2/ShareMenu';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/one2/Navigation';
import { One2Footer } from '@/components/one2/One2Footer';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LiveStudioState {
  streamUrl: string;
  isLive: boolean;
  logoSize?: 'sm' | 'lg';
  overlayText?: string;
  viewersCount?: number;
}

const defaultState: LiveStudioState = {
  streamUrl: '',
  isLive: false,
  logoSize: 'lg',
  overlayText: '',
  viewersCount: 0
};

export default function Studio() {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState<LiveStudioState>(defaultState);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTheater, setIsTheater] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const renderVideoPlayer = () => {
    if (!state.isLive || !activeServerUrl) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <Video className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
          <h3 className={cn('text-lg font-bold text-white mb-1', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'البث لم يبدأ بعد' : 'Broadcast not started yet'}
          </h3>
          <p className="text-white/50 text-xs max-w-[250px] text-center px-2">
            {lang === 'ar'
              ? 'يرجى الانتظار، البث المباشر سيبدأ قريباً.'
              : 'Stay tuned for our exclusive live broadcast.'}
          </p>
        </div>
      );
    }
    return (
      <div className="absolute inset-0 w-full h-full bg-black">
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
              finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'autoplay=1&playsinline=1';
            }
            return finalUrl;
          })()}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  };

  // MOBILE LAYOUT (YouTube Style)
  if (!isDesktop) {
    return (
      <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden select-none" dir={dir}>
        <header className="flex items-center justify-between p-3 border-b border-border bg-card shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              {lang === 'ar' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-neon">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h1 className={cn('font-bold text-lg leading-none', lang === 'ar' && 'font-arabic')}>
                  {lang === 'ar' ? 'الاستوديو المباشر' : 'Live Studio'}
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />
                  <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'مباشر الآن' : 'Live Now'}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ShareMenu />
          </div>
        </header>

        <div className="w-full bg-black relative shrink-0 z-40 flex flex-col aspect-video">
          {renderVideoPlayer()}
        </div>

        {servers.length > 1 && (
          <div className="bg-card px-3 py-2 flex flex-wrap gap-2 border-b border-border shrink-0 overflow-x-auto relative z-40 shadow-sm">
            {servers.map((server: any, idx: number) => (
              <Button
                key={idx}
                variant={idx === activeServerIndex ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveServerIndex(idx)}
                className="font-bold text-xs h-7 rounded-full whitespace-nowrap"
              >
                {server.name || `Server ${idx + 1}`}
              </Button>
            ))}
          </div>
        )}

        <div className="flex-1 w-full min-h-0 bg-background relative z-10 flex flex-col">
          <LiveChat matchId="studio_live" variant="default" isTheaterSplit={true} />
        </div>
      </div>
    );
  }

  // DESKTOP LAYOUT (Original Style)
  const viewers = state.viewersCount || 10243;
  return (
    <div className="min-h-screen bg-background flex flex-col select-none" dir={dir}>
      {!isTheater && <Navigation />}

      <main className={cn("flex-1 w-full max-w-[1920px] mx-auto", isTheater ? "p-0 h-screen overflow-hidden" : "p-4 sm:p-6 lg:p-8")}>
        {!isTheater && (
          <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-card/50 hover:bg-card border border-border/50">
                {lang === 'ar' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-neon animate-pulse-slow">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h1 className={cn('text-2xl sm:text-3xl font-display font-bold', lang === 'ar' && 'font-arabic')}>
                    {lang === 'ar' ? 'الاستوديو المباشر' : 'Live Studio'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
                    <span className="text-sm font-bold text-live">{lang === 'ar' ? 'مباشر الآن' : 'LIVE NOW'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-card/40 backdrop-blur px-3 py-1.5 rounded-full border border-border mr-2" dir="ltr">
                <Label htmlFor="theater-mode" className="text-xs font-bold cursor-pointer uppercase tracking-wider">
                  Theater
                </Label>
                <Switch
                  id="theater-mode"
                  checked={isTheater}
                  onCheckedChange={setIsTheater}
                />
              </div>
              <div className="flex items-center space-x-2 bg-card/40 backdrop-blur px-3 py-1.5 rounded-full border border-border mr-2" dir="ltr">
                <Label htmlFor="chat-mode" className="text-xs font-bold cursor-pointer uppercase tracking-wider">
                  Chat
                </Label>
                <Switch
                  id="chat-mode"
                  checked={showChat}
                  onCheckedChange={setShowChat}
                />
              </div>
              <ShareMenu />
            </div>
          </div>
        )}

        <div className={cn("grid gap-6", isTheater ? "grid-cols-1 h-full" : "grid-cols-1 lg:grid-cols-3")}>
          <div className={cn("flex flex-col animate-in fade-in zoom-in-95 duration-500", isTheater ? "col-span-1 h-full" : "lg:col-span-2")}>
            
            {servers.length > 1 && !isTheater && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                {servers.map((server: any, idx: number) => (
                  <Button
                    key={idx}
                    variant={idx === activeServerIndex ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveServerIndex(idx)}
                    className="font-bold whitespace-nowrap"
                  >
                    {server.name || `Server ${idx + 1}`}
                  </Button>
                ))}
              </div>
            )}

            <Card className={cn("overflow-hidden border-border bg-card/40 backdrop-blur shadow-2xl relative", isTheater ? "border-0 rounded-none h-full" : "rounded-2xl ring-1 ring-white/10")}>
              <div className={cn("relative w-full bg-black group", isTheater ? "h-full" : "aspect-video")}>
                
                {renderVideoPlayer()}

                {/* Permanent Overlay Graphics */}
                {!state.isLive && (
                  <div className="absolute top-4 right-4 z-50 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
                      <span className="text-white font-bold text-sm tracking-widest">ONE2</span>
                    </div>
                  </div>
                )}
                
                {state.isLive && (
                  <div className="absolute top-4 right-4 z-50 pointer-events-none flex flex-col items-end gap-2">
                    <div className="bg-[#e62020] text-white px-3 py-1 rounded-sm font-bold text-sm tracking-wider flex items-center gap-2 shadow-lg animate-pulse-slow">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE
                    </div>
                    
                    <div className="w-[120px] aspect-[3/1] relative overflow-hidden rounded-md shadow-lg">
                      <div className="absolute inset-0 bg-[#14532d]">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}></div>
                        <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent"></div>
                      </div>
                      
                      <div className="relative w-full h-full z-10 flex flex-col items-center justify-center mt-[1%] pr-[38%] pl-[5%]">
                        {state.logoSize === 'sm' ? (
                          <svg viewBox="0 0 110 20" className="w-full h-auto drop-shadow-md overflow-visible">
                            <text x="50" y="16" textAnchor="middle" fill="currentColor" className="font-display font-extrabold text-primary animate-pulse" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>
                              One2
                            </text>
                          </svg>
                        ) : lang === 'ar' ? (
                          <svg viewBox="0 0 110 35" className="w-full h-auto drop-shadow-md overflow-visible">
                            <text x="50" y="16" textAnchor="middle" fill="currentColor" className="font-display font-extrabold text-primary animate-pulse" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>
                              One2
                            </text>
                            <circle cx="78" cy="28" r="2.5" fill="#ef4444" className="animate-pulse" />
                            <text x="72" y="31" textAnchor="end" fill="rgba(255,255,255,0.8)" className="font-bold uppercase tracking-wider font-arabic" style={{ fontSize: '10px' }}>
                              بث مباشر
                            </text>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 110 35" className="w-full h-auto drop-shadow-md overflow-visible">
                            <text x="50" y="16" textAnchor="middle" fill="currentColor" className="font-display font-extrabold text-primary animate-pulse" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>
                              One2
                            </text>
                            <circle cx="22" cy="28" r="2.5" fill="#ef4444" className="animate-pulse" />
                            <text x="28" y="31" textAnchor="start" fill="rgba(255,255,255,0.8)" className="font-bold uppercase tracking-wider" style={{ fontSize: '8px' }}>
                              LIVE BROADCAST
                            </text>
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-[6%] h-[80%] aspect-square rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.9)] z-20 border-[0.15vw] border-[#1a4a85] animate-roll-in-periodic">
                      <img src="/icons/one2-icon.svg" alt="World Cup" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-none object-cover" />
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"></div>
                    </div>
                  </div>
                )}

                {/* Overlay Chat in Theater Mode */}
                {isTheater && showChat && (
                  <div className="absolute top-0 right-0 w-full sm:w-[350px] h-full z-40 bg-gradient-to-l from-black/90 via-black/40 to-transparent flex flex-col justify-end p-2 sm:p-4 pointer-events-none">
                    <div className="pointer-events-auto h-full">
                      <LiveChat matchId="studio_live" variant="overlay" />
                    </div>
                  </div>
                )}
              </div>
            </Card>

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

      {!isTheater && <One2Footer />}
    </div>
  );
}
