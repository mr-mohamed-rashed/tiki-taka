import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { cn } from '@/lib/utils';
import type { Match } from '@/lib/footballData';

interface Live2DTrackerProps {
  match: Match;
}

/**
 * SVG-rendered 2D pitch. The animated ball uses the `animate-ball` keyframe
 * defined in index.css to simulate movement across the field.
 */
export function Live2DTracker({ match }: Live2DTrackerProps) {
  const home = match.home;
  const away = match.away;
  const { get } = useSiteSettingsContext();

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
    { key: 'social_website_url', label: get('social_website_url', 'ar') || 'Website', href: formatHref(get('social_website_url', 'en') || '/'), icon: <WebIcon /> },
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
  const containerRef = useRef<HTMLDivElement>(null);

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
        return `https://www.youtube.com/embed/${url.searchParams.get('v')}`;
      }
      if (url.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed${url.pathname}`;
      }
    } catch (e) {
      // Ignore invalid URLs
    }
    return activeServerUrl;
  })();

  return (
    <Card className="mx-auto max-w-2xl overflow-hidden bg-gradient-card border-border">
      {/* Scoreboard */}
      <div className="px-4 sm:px-5 py-3 border-b border-border bg-card/60 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={home.flag} alt={home.name} className="w-8 h-8 rounded ring-1 ring-border" />
          <span className="font-bold text-sm sm:text-base">{home.shortName}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 font-display font-extrabold text-2xl sm:text-3xl tabular-nums">
            <span className="text-foreground">{match.homeScore}</span>
            <span className="text-border">-</span>
            <span className="text-foreground">{match.awayScore}</span>
          </div>
          {match.status === 'live' && (
            <Badge className="bg-live text-live-foreground gap-1.5 px-2 py-0 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-live-foreground rounded-full animate-pulse-live" />
              LIVE {match.minute}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
          <img src={away.flag} alt={away.name} className="w-8 h-8 rounded ring-1 ring-border" />
          <span className="font-bold text-sm sm:text-base">{away.shortName}</span>
        </div>
      </div>

      {/* Pitch */}
      <div className="p-3 sm:p-4 bg-background/40">

        {servers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {servers.map((server, idx) => (
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
        <div 
          ref={containerRef}
          className={cn("relative w-full bg-black ring-1 ring-primary/20 shadow-neon group", isTheater ? "fixed inset-0 z-[100] h-screen w-screen rounded-none flex items-center justify-center overflow-hidden" : "rounded-lg aspect-video overflow-hidden")}
        >
          <div 
            className={cn("relative w-full h-full", isTheater ? "" : "absolute inset-0")}
            style={isTheater ? { maxWidth: 'calc(100vh * (16 / 9))', maxHeight: 'calc(100vw * (9 / 16))', aspectRatio: '16/9' } : {}}
          >
          {streamUrl && (
            <div className="absolute bottom-4 right-4 z-50 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity items-center">
              <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="bg-black/50 text-white hover:bg-black/80 border-none">
                {isTheater ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize h-4 w-4"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize h-4 w-4"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>}
              </Button>
            </div>
          )}

          {streamUrl ? (
            <div className="absolute inset-0 overflow-hidden bg-black pointer-events-auto">
              <iframe
                src={streamUrl}
                className="absolute w-full left-0 right-0 pointer-events-auto"
                style={{ top: '-55px', height: 'calc(100% + 55px)' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              {/* Dynamic Logo Cover to hide koora city watermark */}
              <div 
                className="absolute flex items-center justify-end z-40 pointer-events-none top-[3%] right-[2%] w-1/6 h-1/6"
              >
                {/* Premium Broadcast Text Box */}
                  <div className="relative flex flex-col items-center justify-center h-[50%] flex-1 bg-gradient-to-r from-[#091a33]/95 to-[#1a4a85]/95 backdrop-blur-md rounded-l-[50px] shadow-2xl z-10 pl-[5%] pr-[12%] border-y border-l border-white/20 overflow-hidden">
                    {/* Glossy highlight effect */}
                    <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent"></div>
                    
                    <div className="w-full relative z-10 flex flex-col items-center justify-center mt-[2%]">
                      <svg viewBox="0 0 110 20" className="w-[90%] h-auto drop-shadow-md overflow-visible">
                        <circle cx="20" cy="10" r="3" fill="#ef4444" className="animate-pulse" />
                        <text x="28" y="13.5" textAnchor="start" fill="rgba(255,255,255,0.8)" className="font-bold uppercase tracking-wider" style={{ fontSize: '9px' }}>
                          LIVE BROADCAST
                        </text>
                      </svg>
                    </div>
                  </div>

                {/* Circular Logo overlapping the text box */}
                <div className="relative h-[80%] aspect-square rounded-full overflow-hidden shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.9)] z-20 -ml-[12%] border-[0.15vw] border-[#1a4a85]">
                  <img src="/icons/tiki-taka-icon.png" alt="World Cup" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-none object-cover" />
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"></div>
                </div>
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
        </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-white" style={{ background: home.color }} />
            <span className="font-semibold">{home.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white" />
            <span className="font-semibold">Ball</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-white" style={{ background: away.color }} />
            <span className="font-semibold">{away.name}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-4">
          <Link
            to="/studio"
            className="group flex h-10 items-center justify-center gap-2 rounded-full border border-live/50 bg-live/10 px-4 text-xs font-bold text-live shadow-card transition-all hover:-translate-y-0.5 hover:border-live hover:bg-live hover:text-live-foreground hover:shadow-neon"
            title="الاستوديو المباشر"
          >
            <Video className="h-4 w-4 animate-pulse-live" />
            <span className="font-arabic">الاستوديو</span>
          </Link>
          {socialLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-10 items-center justify-center gap-2 rounded-full border border-primary/25 bg-background/75 px-3 text-xs font-bold text-foreground shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-neon"
              title={link.label}
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </Card>
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
