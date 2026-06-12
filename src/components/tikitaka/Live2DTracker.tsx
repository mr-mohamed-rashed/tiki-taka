import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Card className="overflow-hidden bg-gradient-card border-border">
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
          <svg viewBox="0 0 600 380" className="block w-full h-auto bg-gradient-pitch">
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
      </div>
    </Card>
  );
}
