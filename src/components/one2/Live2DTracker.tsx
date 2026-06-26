import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Maximize, Minimize, MessageSquare, PanelRightOpen, ChevronLeft, ChevronRight, Instagram, Play, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import type { Match } from '@/lib/footballData';
import { LiveChat } from '@/components/one2/LiveChat';
import { AdSlotSelector } from '@/components/one2/AdSlotSelector';
import { AdBanner } from '@/components/one2/AdBanner';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';

interface Live2DTrackerProps {
  match: Match;
  hideSocials?: boolean;
  forceMode?: 'video-only' | 'default';
}

/**
 * SVG-rendered 2D pitch. The animated ball uses the `animate-ball` keyframe
 * defined in index.css to simulate movement across the field.
 */
export function Live2DTracker({ match, hideSocials = false, forceMode = 'default' }: Live2DTrackerProps) {
  const home = match.home;
  const away = match.away;
  const { get } = useSiteSettingsContext();
  const { lang } = useLanguage();

  const tickerText = get('live_ticker_text', 'ar') || '';
  const logoPosition = get('live_logo_position', 'en') || 'top-right';
  const logoSize = get('live_logo_size', 'en') || 'SM';

  const getLogoStyles = () => {
    let styles: any = { display: logoPosition === 'none' ? 'none' : 'flex' };
    
    // Position
    if (logoPosition.includes('top')) { styles.top = '4%'; }
    if (logoPosition.includes('bottom')) { styles.bottom = tickerText ? '40px' : '4%'; }
    if (logoPosition.includes('right')) { styles.right = '2%'; }
    if (logoPosition.includes('left')) { styles.left = '2%'; }

    // Size
    if (logoSize === 'SM') { styles.width = '24%'; styles.minWidth = '90px'; }
    if (logoSize === 'MD') { styles.width = '32%'; styles.minWidth = '120px'; }
    if (logoSize === 'LG') { styles.width = '40%'; styles.minWidth = '150px'; }

    return styles;
  };

  const formatHref = (input: string) => {
    if (!input) return '#';
    // If the user pastes a full message "Hey watch this https://vt.tiktok.com/...", extract the link
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
    let url = urlMatch ? urlMatch[0] : input.trim();
    
    // If there's still no http/https (e.g., they just pasted "tiktok.com/@user"), add it
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Basic cleanup in case it's just text with spaces
      url = `https://${url.split(' ')[0]}`;
    }
    return url;
  };

  const socialLinks = [
    { key: 'social_facebook_url', label: get('social_facebook_url', 'ar') || 'Facebook', href: formatHref(get('social_facebook_url', 'en') || 'https://facebook.com'), icon: <FacebookIcon /> },
    { key: 'social_tiktok_url', label: get('social_tiktok_url', 'ar') || 'TikTok', href: formatHref(get('social_tiktok_url', 'en') || 'https://tiktok.com'), icon: <TikTokIcon /> },
    { key: 'social_youtube_url', label: get('social_youtube_url', 'ar') || 'YouTube', href: formatHref(get('social_youtube_url', 'en') || 'https://youtube.com'), icon: <YouTubeIcon /> },
    { key: 'social_instagram_url', label: get('social_instagram_url', 'ar') || 'Instagram', href: formatHref(get('social_instagram_url', 'en') || 'https://instagram.com'), icon: <Instagram className="h-5 w-5" /> },
  ];

  // Player positions (4-3-3) on a 600x380 viewBox pitch
  const homePlayers = [
    { x: 60,  y: 190 }, // GK
    { x: 130, y: 90  }, { x: 130, y: 160 }, { x: 130, y: 220 }, { x: 130, y: 290 },
    { x: 220, y: 130 }, { x: 220, y: 190 }, { x: 220, y: 250 },
    { x: 280, y: 90  }, { x: 280, y: 190 }, { x: 280, y: 290 },
  ];
  const awayPlayers = [
    { x: 540, y: 190 }, // GK
    { x: 470, y: 90  }, { x: 470, y: 160 }, { x: 470, y: 220 }, { x: 470, y: 290 },
    { x: 380, y: 130 }, { x: 380, y: 190 }, { x: 380, y: 250 },
    { x: 320, y: 90  }, { x: 320, y: 190 }, { x: 320, y: 290 },
  ];

  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [isTheater, setIsTheater] = useState(false);
  const [chatMode, setChatMode] = useState<'hidden' | 'overlay' | 'split'>('hidden');
  const [controlsVisible, setControlsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [volume, setVolume] = useState(100);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null || servers.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const distanceX = touchStartX - touchEndX;
    const distanceY = touchStartY - touchEndY;
    
    if (Math.abs(distanceY) > Math.abs(distanceX)) {
      // Vertical swipe
      if (forceMode === 'video-only') {
        if (distanceY > 50) { // Swipe Up (Next Server)
          setActiveServerIndex((prev) => (prev + 1) % servers.length);
        } else if (distanceY < -50) { // Swipe Down (Prev Server)
          setActiveServerIndex((prev) => (prev - 1 + servers.length) % servers.length);
        }
      }
    } else {
      // Horizontal swipe
      if (forceMode !== 'video-only') {
        if (distanceX > 50) { // Swipe Left (Next Server)
          setActiveServerIndex((prev) => (prev + 1) % servers.length);
        } else if (distanceX < -50) { // Swipe Right (Prev Server)
          setActiveServerIndex((prev) => (prev - 1 + servers.length) % servers.length);
        }
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Auto-hide controls when screen is idle for 3 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('keydown', handleActivity);

    handleActivity(); // Initial start

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsTheater(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimKey(prev => prev + 1);
    }, 45000); // 45 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          // Attempt to lock orientation to landscape on mobile
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
      // Fallback to CSS theater mode
      setIsTheater(!isTheater);
    }
  };

  // When entering theater mode, default chat to hidden
  useEffect(() => {
    setChatMode('hidden');
  }, [isTheater]);

  const servers = (() => {
    const raw = get('live_stream_url', 'en');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {
      return [{ name: 'Server 1', url: raw }];
    }
    return [];
  })();

  const activeServerUrl = servers[activeServerIndex]?.url || '';

  const streamUrl = (() => {
    if (!activeServerUrl) return '';
    try {
      const url = new URL(activeServerUrl);
      if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
        return `https://www.youtube.com/embed/${url.searchParams.get('v')}?enablejsapi=1`;
      }
      if (url.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed${url.pathname}?enablejsapi=1`;
      }
    } catch (e) {
      // Ignore invalid URLs
    }
    return activeServerUrl;
  })();

  const handleExternalAction = (action: 'play' | 'setVolume', val?: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const cw = iframeRef.current.contentWindow;
      if (action === 'play') {
        cw.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        cw.postMessage(JSON.stringify({ method: 'play' }), '*');
        cw.postMessage('play', '*');
      } else if (action === 'setVolume' && val !== undefined) {
        // YouTube / generic
        cw.postMessage(`{"event":"command","func":"setVolume","args":[${val}]}`, '*');
        // Vimeo / Video.js (0 to 1)
        cw.postMessage(JSON.stringify({ method: 'setVolume', value: val / 100 }), '*');
        // JW Player (0 to 100)
        cw.postMessage(JSON.stringify({ type: 'setVolume', volume: val }), '*');
        // Twitch (0 to 1)
        cw.postMessage(JSON.stringify({ method: 'setVolume', volume: val / 100 }), '*');
        // DailyMotion
        cw.postMessage(`volume=${val / 100}`, '*');
        // Custom events
        cw.postMessage({ event: 'setVolume', volume: val / 100 }, '*');
        cw.postMessage({ type: 'volume', value: val }, '*');
      }
    }
  };

  if (forceMode === 'video-only') {
    return (
      <div 
        ref={containerRef}
        className={cn("relative w-full bg-black overflow-hidden flex items-center justify-center", isTheater ? "fixed inset-0 z-[100] h-screen w-screen" : "h-full")}
        style={{ containerType: 'size' }}
      >
        {streamUrl ? (
            <div 
              className="relative overflow-hidden bg-black pointer-events-auto"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: 'calc(100cqh * (16 / 9))',
                maxHeight: 'calc(100cqw * (9 / 16))'
              }}
            >
              <iframe
                ref={iframeRef}
                src={streamUrl}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ top: '-55px', height: 'calc(100% + 55px)' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
              {/* Invisible overlay with a center hole to allow native clicks on the video */}
              <div className="absolute inset-0 z-30 pointer-events-none flex flex-col">
                <div className="w-full flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
                <div className="w-full h-[25cqmin] max-h-[120px] min-h-[50px] flex">
                  <div className="flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
                  <div className="w-[25cqmin] max-w-[120px] min-w-[50px] h-full pointer-events-none" />
                  <div className="flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
                </div>
                <div className="w-full flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
              </div>

              {/* Smart Responsive Logo Cover */}
              <div 
                dir="ltr"
                className="absolute z-40 items-center pointer-events-none transition-all duration-300"
                style={getLogoStyles()}
              >
                {/* Logo Box with Map Pattern (no overflow hidden so trophy can overlap) */}
                <div className="relative flex items-center justify-between w-full aspect-[3.5/1] bg-gradient-to-br from-[#0a2351] via-[#1d4ed8] to-[#1e3a8a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.5)] rounded-full border border-blue-400/30 px-[4%]">
                  {/* Map Pattern Layer (rounded to stay inside box) */}
                  <div className="absolute inset-0 opacity-20 rounded-full overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')]"></div>
                  
                  <div className="relative z-10 flex items-center w-full h-full">
                    <div className="relative flex flex-col justify-center items-center w-full h-full pl-[5%] pr-[20%] select-none pointer-events-none">
                      <svg viewBox="0 0 100 40" className="w-full h-[80%] pt-[2%] drop-shadow-md">
                        <defs>
                          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur"/>
                              <feMergeNode in="blur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <text x="12" y="28" alignmentBaseline="middle" className="font-display font-black select-none" style={{ userSelect: 'none' }}>
                          <tspan fill="#ffffff" fontSize="24px">ONE</tspan>
                          <tspan fill="#22c55e" dx="4" fontStyle="italic" fontSize="32px" filter="url(#neon-glow)">2</tspan>
                        </text>
                      </svg>
                    </div>
                    
                    {/* The new circular logo jumping from inside */}
                    <div key={animKey} className="absolute right-[-2%] bottom-0 w-[38%] aspect-square animate-slide-rotate-bounce pointer-events-none z-20">
                      <div className="relative w-full h-full rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
                        <img 
                          src="/logo_new.png?v=2" 
                          alt="Trophy Logo" 
                          className="relative z-10 w-full h-full object-cover scale-[1.05]" 
                        />
                      </div>
                    </div>

                    {/* 'مباشر' box below the rectangle, shifted right slightly to cover watermark exactly */}
                    <div className="absolute top-[100%] right-[8%] bg-[#16181d]/90 px-[6%] py-[2%] rounded-[0.3vw] text-white font-bold border border-white/20 shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontSize: 'clamp(8px, 1.1vw, 14px)' }}>
                      <span className="w-[0.5em] h-[0.5em] rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                      <span>{lang === 'ar' ? 'مباشر' : 'LIVE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticker removed here, handled by TickerBot at the end of the file */}

              {/* Volume Controls for TikTok Mode */}
              <div className={cn("absolute top-4 right-4 z-50 flex items-center transition-opacity", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                <div className="group flex items-center bg-black/50 rounded-full backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="p-2 sm:p-3 cursor-pointer">
                    {volume === 0 ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-20 sm:group-hover:w-24 flex items-center opacity-0 group-hover:opacity-100">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={volume} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setVolume(val);
                        handleExternalAction('setVolume', val);
                      }}
                      className="w-16 sm:w-20 accent-primary mr-3"
                    />
                  </div>
                </div>
              </div>

              {/* Fullscreen Button positioned over native video player fullscreen mark */}
              <div className={cn("absolute bottom-[45px] right-[15px] z-50 transition-opacity", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="bg-black/50 text-white hover:bg-black/80 border-none shadow-lg rounded-full">
                  {isTheater ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>

              {/* Server Navigation Chevrons */}
              {servers.length > 1 && (
                <>
                  <div
                    className={cn("absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-[15cqmin] h-[15cqmin] max-w-[80px] max-h-[80px] min-w-[32px] min-h-[32px] bg-white/20 backdrop-blur-md cursor-pointer hover:bg-white/40 transition-all drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
                    onClick={(e) => { e.stopPropagation(); setActiveServerIndex((prev) => (prev - 1 + servers.length) % servers.length); }}
                    style={{
                      WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M18 19L8 12L18 5Z'/%3E%3Cline x1='5' y1='5' x2='5' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M18 19L8 12L18 5Z'/%3E%3Cline x1='5' y1='5' x2='5' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                  <div
                    className={cn("absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-[15cqmin] h-[15cqmin] max-w-[80px] max-h-[80px] min-w-[32px] min-h-[32px] bg-white/20 backdrop-blur-md cursor-pointer hover:bg-white/40 transition-all drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
                    onClick={(e) => { e.stopPropagation(); setActiveServerIndex((prev) => (prev + 1) % servers.length); }}
                    style={{
                      WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M6 5L16 12L6 19Z'/%3E%3Cline x1='19' y1='5' x2='19' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M6 5L16 12L6 19Z'/%3E%3Cline x1='19' y1='5' x2='19' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                </>
              )}

              {/* Server Swipe Area Overlay (Left Side) */}
              <div className="absolute left-0 top-0 bottom-0 w-1/4 z-50 flex flex-col items-center justify-center pointer-events-auto touch-pan-y touch-pan-x" 
                   onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {servers.length > 1 && (
                  <div className="flex flex-col gap-2 bg-black/40 p-2 rounded-full backdrop-blur-sm opacity-50 hover:opacity-100 transition-opacity">
                    {servers.map((_, idx) => (
                      <div key={idx} className={cn("w-2 h-2 rounded-full transition-all", idx === activeServerIndex ? "bg-primary h-4" : "bg-white/50")} />
                    ))}
                  </div>
                )}
              </div>

              {/* News Ticker (Replaces TickerBot) */}
              <NewsTicker variant="video" className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none text-xs sm:text-sm" />

              {/* Center Play Button (Blurred Rounded Triangle - Click Through) */}
              <div className={cn("absolute inset-0 m-auto w-[25cqmin] h-[25cqmin] max-w-[120px] max-h-[120px] min-w-[50px] min-h-[50px] z-50 flex items-center justify-center transition-opacity pointer-events-none", controlsVisible ? "opacity-100" : "opacity-0")}>
                <div 
                  className="w-full h-full bg-white/20 backdrop-blur-md drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none"
                  style={{
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='4' stroke-linejoin='round' d='M8 5L19 12L8 19Z'/%3E%3C/svg%3E")`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='4' stroke-linejoin='round' d='M8 5L19 12L8 19Z'/%3E%3C/svg%3E")`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
              </div>

            </div>
          ) : (
            <div className="text-white text-sm">البث غير متاح حاليا</div>
          )}
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl overflow-hidden bg-gradient-card border-none rounded-none sm:border-solid sm:border-border sm:rounded-xl">


      {/* Pitch */}
      <div className="p-0 pb-[1px] sm:p-4 bg-background/40">


        <div 
          ref={containerRef}
          className={cn("relative w-full bg-black ring-1 ring-primary/20 shadow-neon group flex items-center justify-center overflow-hidden touch-pan-y", isTheater ? "fixed inset-0 z-[100] h-screen w-screen rounded-none" : "rounded-none sm:rounded-lg aspect-video")}
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className={cn("relative transition-all w-full h-full flex items-center justify-center bg-black", isTheater && chatMode === 'split' ? "w-2/3" : "")}
            style={{ containerType: 'size' }}
          >
          {streamUrl && (
            <>
              {/* Left Side Controls: Chat Button */}
              <div className={cn("absolute bottom-4 left-4 z-50 flex gap-2 transition-opacity items-center", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                {isTheater && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); setChatMode(prev => prev === 'hidden' ? 'split' : 'hidden'); }} 
                    className="bg-black/50 text-white hover:bg-black/80 border-none shadow-lg h-10 w-10 sm:h-12 sm:w-12"
                  >
                    {chatMode === 'hidden' ? <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" /> : <PanelRightOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                  </Button>
                )}
              </div>

              {/* Right Side Controls: Volume */}
              <div className={cn("absolute bottom-[45px] right-[65px] sm:right-[70px] z-50 flex items-center transition-opacity", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                <div className="group flex items-center bg-black/50 rounded-full backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="p-2 sm:p-3 cursor-pointer">
                    {volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  </div>
                  <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-20 sm:group-hover:w-28 flex items-center opacity-0 group-hover:opacity-100">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={volume} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setVolume(val);
                        handleExternalAction('setVolume', val);
                      }}
                      className="w-16 sm:w-24 accent-primary mr-3"
                    />
                  </div>
                </div>
              </div>

              {/* Fullscreen Button positioned over native video player fullscreen mark */}
              <div className={cn("absolute bottom-[45px] right-[15px] z-50 transition-opacity", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="bg-black/50 text-white hover:bg-black/80 border-none shadow-lg h-10 w-10 sm:h-12 sm:w-12 rounded-full">
                  {isTheater ? <Minimize className="h-5 w-5 sm:h-6 sm:w-6" /> : <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />}
                </Button>
              </div>
            </>
          )}


          {streamUrl ? (
            <div 
              className="relative overflow-hidden bg-black pointer-events-auto"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: 'calc(100cqh * (16 / 9))',
                maxHeight: 'calc(100cqw * (9 / 16))'
              }}
            >
              <iframe
                ref={iframeRef}
                src={streamUrl}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ top: '-55px', height: 'calc(100% + 55px)' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
              {/* Invisible overlay with a center hole to allow native clicks on the video */}
              <div className="absolute inset-0 z-30 pointer-events-none flex flex-col">
                <div className="w-full flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
                <div className="w-full h-[25cqmin] max-h-[120px] min-h-[50px] flex">
                  <div className="flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
                  <div className="w-[25cqmin] max-w-[120px] min-w-[50px] h-full pointer-events-none" />
                  <div className="flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
                </div>
                <div className="w-full flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setControlsVisible(prev => !prev); }} />
              </div>
              
              {/* Server Navigation Chevrons */}
              {servers.length > 1 && (
                <>
                  <div
                    className={cn("absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-[15cqmin] h-[15cqmin] max-w-[80px] max-h-[80px] min-w-[32px] min-h-[32px] bg-white/20 backdrop-blur-md cursor-pointer hover:bg-white/40 transition-all drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
                    onClick={(e) => { e.stopPropagation(); setActiveServerIndex((prev) => (prev - 1 + servers.length) % servers.length); }}
                    style={{
                      WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M18 19L8 12L18 5Z'/%3E%3Cline x1='5' y1='5' x2='5' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M18 19L8 12L18 5Z'/%3E%3Cline x1='5' y1='5' x2='5' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                  <div
                    className={cn("absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-[15cqmin] h-[15cqmin] max-w-[80px] max-h-[80px] min-w-[32px] min-h-[32px] bg-white/20 backdrop-blur-md cursor-pointer hover:bg-white/40 transition-all drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]", controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
                    onClick={(e) => { e.stopPropagation(); setActiveServerIndex((prev) => (prev + 1) % servers.length); }}
                    style={{
                      WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M6 5L16 12L6 19Z'/%3E%3Cline x1='19' y1='5' x2='19' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='3' stroke-linejoin='round' d='M6 5L16 12L6 19Z'/%3E%3Cline x1='19' y1='5' x2='19' y2='19' stroke='black' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                </>
              )}

              {/* Dynamic Logo Cover to hide koora city watermark - Only visible when not in theater/fullscreen mode */}
              {!isTheater && (
                <div 
                  dir="ltr"
                  className="absolute top-1 left-2 right-2 z-40 pointer-events-none transition-opacity duration-300"
                >
                  <div className="pointer-events-auto flex items-center justify-between w-full pr-1 pl-1">
                    {/* Left Side: Hamburger Menu via Navigation Component */}
                    <div className="flex items-center [&>nav]:bg-transparent [&>nav]:border-none [&>nav]:backdrop-blur-none [&>nav>div]:px-0 [&>nav]:h-auto [&>nav>div>div>a]:hidden [&>nav>div>div>div:nth-child(2)]:hidden [&>nav>div>div>div:last-child>button:not(:last-child)]:hidden [&>nav>div>div>div:last-child>button:last-child]:bg-[#0d0e12] [&>nav>div>div>div:last-child>button:last-child]:text-white [&>nav>div>div>div:last-child>button:last-child]:rounded-xl [&>nav>div>div>div:last-child>button:last-child]:w-10 [&>nav>div>div>div:last-child>button:last-child]:h-10">
                      <Navigation />
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Responsive Logo Cover */}
              <div 
                dir="ltr"
                className="absolute z-40 items-center pointer-events-none transition-all duration-300"
                style={getLogoStyles()}
              >
                {/* Logo Box with Map Pattern (no overflow hidden so trophy can overlap) */}
                <div className="relative flex items-center justify-between w-full aspect-[3.5/1] bg-gradient-to-br from-[#0a2351] via-[#1d4ed8] to-[#1e3a8a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.5)] rounded-full border border-blue-400/30 px-[4%]">
                  {/* Map Pattern Layer (rounded to stay inside box) */}
                  <div className="absolute inset-0 opacity-20 rounded-full overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')]"></div>
                  
                  <div className="relative z-10 flex items-center w-full h-full">
                    {/* Centered One2 Text */}
                    <div className="relative flex flex-col justify-center items-center w-full h-full pl-[5%] pr-[20%] select-none pointer-events-none">
                      <svg viewBox="0 0 100 40" className="w-full h-[80%] pt-[2%] drop-shadow-md">
                        <defs>
                          <filter id="neon-glow-2" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur"/>
                              <feMergeNode in="blur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <text x="12" y="28" alignmentBaseline="middle" className="font-display font-black select-none" style={{ userSelect: 'none' }}>
                          <tspan fill="#ffffff" fontSize="24px">ONE</tspan>
                          <tspan fill="#22c55e" dx="4" fontStyle="italic" fontSize="32px" filter="url(#neon-glow-2)">2</tspan>
                        </text>
                      </svg>
                    </div>

                    {/* The new circular logo jumping from inside */}
                    <div key={animKey} className="absolute right-[-2%] bottom-0 w-[38%] aspect-square animate-slide-rotate-bounce pointer-events-none z-20">
                      <div className="relative w-full h-full rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
                        <img 
                          src="/logo_new.png?v=2" 
                          alt="Trophy Logo" 
                          className="relative z-10 w-full h-full object-cover scale-[1.05]" 
                        />
                      </div>
                    </div>

                    {/* 'مباشر' box below the rectangle, shifted right slightly to cover watermark exactly */}
                    <div className="absolute top-[100%] right-[8%] bg-[#16181d]/90 px-[6%] py-[2%] rounded-[0.3vw] text-white font-bold border border-white/20 shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontSize: 'clamp(8px, 1.1vw, 14px)' }}>
                      <span className="w-[0.5em] h-[0.5em] rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                      <span>{lang === 'ar' ? 'مباشر' : 'LIVE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Ticker (Replaces TickerBot) */}
              <NewsTicker variant="video" className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none text-xs sm:text-sm" />
              {/* Center Play Button (Blurred Rounded Triangle - Click Through) */}
              <div className={cn("absolute inset-0 m-auto w-[25cqmin] h-[25cqmin] max-w-[120px] max-h-[120px] min-w-[50px] min-h-[50px] z-50 flex items-center justify-center transition-opacity pointer-events-none", controlsVisible ? "opacity-100" : "opacity-0")}>
                <div 
                  className="w-full h-full bg-white/20 backdrop-blur-md drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none"
                  style={{
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='4' stroke-linejoin='round' d='M8 5L19 12L8 19Z'/%3E%3C/svg%3E")`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='black' stroke-width='4' stroke-linejoin='round' d='M8 5L19 12L8 19Z'/%3E%3C/svg%3E")`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
              </div>

            </div>
          ) : (
            <svg viewBox="0 0 600 380" className="block w-full max-h-[300px] bg-gradient-pitch">
              {/* pitch stripes */}
              <defs>
                <pattern id="stripes" x="0" y="0" width="80" height="380" patternUnits="userSpaceOnUse">
                  <rect width="40" height="380" fill="hsl(140 60% 22%)" />
                  <rect x="40" width="40" height="380" fill="hsl(140 65% 19%)" />
                </pattern>
                <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cccccc" />
                </radialGradient>
              </defs>
              <rect width="600" height="380" fill="url(#stripes)" />

              {/* outer lines */}
              <g stroke="hsl(140 30% 85% / 0.7)" strokeWidth="2" fill="none">
                <rect x="10" y="10" width="580" height="360" rx="2" />
                <line x1="300" y1="10" x2="300" y2="370" />
                <circle cx="300" cy="190" r="55" />
                <circle cx="300" cy="190" r="3" fill="hsl(140 30% 85% / 0.7)" />
                {/* penalty boxes */}
                <rect x="10" y="95" width="80" height="190" />
                <rect x="510" y="95" width="80" height="190" />
                {/* 6-yard */}
                <rect x="10" y="140" width="30" height="100" />
                <rect x="560" y="140" width="30" height="100" />
                {/* penalty spots */}
                <circle cx="70" cy="190" r="2" fill="hsl(140 30% 85% / 0.7)" />
                <circle cx="530" cy="190" r="2" fill="hsl(140 30% 85% / 0.7)" />
              </g>

              {/* Goals */}
              <rect x="2" y="170" width="10" height="40" fill="hsl(140 30% 85% / 0.4)" />
              <rect x="588" y="170" width="10" height="40" fill="hsl(140 30% 85% / 0.4)" />

              {/* Home players */}
              {homePlayers.map((p, i) => (
                <g key={`h-${i}`}>
                  <circle cx={p.x} cy={p.y} r="9" fill={home.color} stroke="#fff" strokeWidth="1.5" />
                  <circle cx={p.x} cy={p.y} r="13" fill={home.color} opacity="0.2" />
                </g>
              ))}

              {/* Away players */}
              {awayPlayers.map((p, i) => (
                <g key={`a-${i}`}>
                  <circle cx={p.x} cy={p.y} r="9" fill={away.color} stroke="#fff" strokeWidth="1.5" />
                  <circle cx={p.x} cy={p.y} r="13" fill={away.color} opacity="0.2" />
                </g>
              ))}

              {/* Ball (animated via group transform on inner element) */}
              <g className="animate-ball">
                <circle cx="300" cy="190" r="14" fill="hsl(var(--primary) / 0.25)" />
                <circle cx="300" cy="190" r="7" fill="url(#ballGrad)" stroke="#222" strokeWidth="0.6" />
              </g>
            </svg>
          )}

              {/* Overlay Chat in Theater Mode */}
              {isTheater && chatMode === 'overlay' && (
                <div className="absolute top-0 right-0 w-full sm:w-[350px] h-full z-40 flex flex-col justify-end p-2 sm:p-4 pointer-events-none">
                  <div className="pointer-events-none">
                    <LiveChat matchId={match.id} variant="overlay" />
                  </div>
                </div>
              )}
          </div>

          {/* Split Chat Mode in Theater */}
          {isTheater && chatMode === 'split' && (
            <div className="w-1/3 h-full bg-black border-l border-border flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="shrink-0 w-full z-50">
                 <AdSlotSelector location="live-chat" onAdd={() => {}} />
                 <AdBanner slotId="live-chat-top" />
               </div>
               <div className="flex-1 min-h-0 relative h-full">
                 <div className="absolute inset-0 flex flex-col overflow-y-auto">
                   <LiveChat matchId={match.id} variant="default" isTheaterSplit={true} />
                 </div>
               </div>
            </div>
          )}
        </div>



        {!hideSocials && (
          <div className="mt-4 border-t border-border/60 pt-4">
            <LiveSocials />
          </div>
        )}
      </div>
    </Card>
  );
}

export function LiveSocials() {
  const { get } = useSiteSettingsContext();

  const formatHref = (input: string) => {
    if (!input) return '#';
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
    let url = urlMatch ? urlMatch[0] : input.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url.split(' ')[0]}`;
    }
    return url;
  };

  const socialLinks = [
    { key: 'social_facebook_url', label: get('social_facebook_url', 'ar') || 'Facebook', href: formatHref(get('social_facebook_url', 'en') || 'https://facebook.com'), icon: <FacebookIcon />, hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-[0_5px_20px_rgba(24,119,242,0.4)]' },
    { key: 'social_tiktok_url', label: get('social_tiktok_url', 'ar') || 'TikTok', href: formatHref(get('social_tiktok_url', 'en') || 'https://tiktok.com'), icon: <TikTokIcon />, hoverClass: 'hover:bg-[#000000] hover:text-white hover:border-[#000000] hover:shadow-[0_5px_20px_rgba(255,0,80,0.4)]' },
    { key: 'social_youtube_url', label: get('social_youtube_url', 'ar') || 'YouTube', href: formatHref(get('social_youtube_url', 'en') || 'https://youtube.com'), icon: <YouTubeIcon />, hoverClass: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] hover:shadow-[0_5px_20px_rgba(255,0,0,0.4)]' },
    { key: 'social_instagram_url', label: get('social_instagram_url', 'ar') || 'Instagram', href: formatHref(get('social_instagram_url', 'en') || 'https://instagram.com'), icon: <Instagram className="h-5 w-5" />, hoverClass: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent hover:shadow-[0_5px_20px_rgba(220,39,67,0.4)]' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">

      {socialLinks.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-background/75 px-4 text-xs font-bold text-foreground shadow-card transition-all duration-300 hover:-translate-y-1 ${link.hoverClass || 'hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-neon'}`}
          title={link.label}
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a5.55 5.55 0 0 0 3.24 1.04V10a8.77 8.77 0 0 1-3.22-.63v5.88A5.75 5.75 0 1 1 10.87 9.5c.32 0 .63.03.93.08v3.23a2.56 2.56 0 1 0 1.8 2.44V2h3a5.55 5.55 0 0 0 .01.63v3.19Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}
