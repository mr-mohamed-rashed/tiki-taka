import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
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
  const socialLinks = [
    { key: 'social_facebook_url', label: get('social_facebook_url', 'ar') || 'Facebook', href: get('social_facebook_url', 'en') || 'https://facebook.com', icon: <FacebookIcon /> },
    { key: 'social_tiktok_url', label: get('social_tiktok_url', 'ar') || 'TikTok', href: get('social_tiktok_url', 'en') || 'https://tiktok.com', icon: <TikTokIcon /> },
    { key: 'social_youtube_url', label: get('social_youtube_url', 'ar') || 'YouTube', href: get('social_youtube_url', 'en') || 'https://youtube.com', icon: <YouTubeIcon /> },
    { key: 'social_website_url', label: get('social_website_url', 'ar') || 'Website', href: get('social_website_url', 'en') || '/', icon: <WebIcon /> },
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
        <div className="relative w-full rounded-lg overflow-hidden ring-1 ring-primary/20 shadow-neon">
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
