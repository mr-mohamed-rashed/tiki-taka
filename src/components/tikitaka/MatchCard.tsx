import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { trackVisitEvent } from '@/hooks/useVisitTracking';
import { cn } from '@/lib/utils';
import { MatchPredictor } from './MatchPredictor';
import type { Match } from '@/lib/footballData';

interface MatchCardProps {
  match: Match;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function TeamRow({
  team,
  isWinner,
  align,
}: {
  team: Match['home'];
  isWinner: boolean;
  align: 'left' | 'right';
}) {
  return (
    <div className={cn('flex items-center gap-3 flex-1', align === 'right' && 'flex-row-reverse text-right')}>
      <img
        src={team.flag}
        alt={team.name}
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-md object-cover shadow-card ring-1 ring-border"
      />
      <div className="min-w-0">
        <div className={cn('font-bold text-sm sm:text-base truncate', isWinner ? 'text-foreground' : 'text-foreground/70')}>
          {team.name}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{team.shortName}</div>
      </div>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const { lang } = useLanguage();
  const { user, signInWithGoogle } = useAuth();
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';

  const homeWin = isFinished && match.homeScore > match.awayScore;
  const awayWin = isFinished && match.awayScore > match.homeScore;
  const matchTitle = `${match.home.name} vs ${match.away.name} ${match.competition} highlights`;

  const openHighlights = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    await trackVisitEvent({
      userId: user.id,
      eventType: 'match_highlight_click',
      page: '/results',
      metadata: {
        matchId: match.id,
        home: match.home.name,
        away: match.away.name,
        provider: 'beIN SPORTS',
      },
    });

    window.open(`https://www.youtube.com/@beINSPORTS/search?query=${encodeURIComponent(matchTitle)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden bg-gradient-card border-border transition-all hover:border-primary/50 hover:shadow-elevated',
        isLive && 'border-live/40 shadow-[0_0_30px_-10px_hsl(var(--live)/0.5)]',
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-primary">{match.competition}</span>
          <span className="text-border">|</span>
          <span>{match.stage}</span>
        </div>
        {isLive && (
          <Badge className="bg-live text-live-foreground gap-1.5 px-2 py-0.5 font-bold">
            <span className="w-1.5 h-1.5 bg-live-foreground rounded-full animate-pulse-live" />
            LIVE
          </Badge>
        )}
        {isFinished && (
          <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground font-bold">
            FT
          </Badge>
        )}
        {isUpcoming && (
          <Badge variant="outline" className="border-primary/40 text-primary font-bold gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(match.date)}
          </Badge>
        )}
      </div>

      <div className="px-4 py-4 flex items-center gap-3 sm:gap-4">
        <TeamRow team={match.home} isWinner={homeWin} align="left" />

        <div className="shrink-0 px-2 sm:px-4 text-center">
          {isUpcoming ? (
            <div className="font-display font-bold text-lg sm:text-2xl text-primary tabular-nums">
              {formatTime(match.date)}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-display font-extrabold text-2xl sm:text-3xl tabular-nums">
              <span className={cn(homeWin ? 'text-primary' : 'text-foreground')}>{match.homeScore}</span>
              <span className="text-border">-</span>
              <span className={cn(awayWin ? 'text-primary' : 'text-foreground')}>{match.awayScore}</span>
            </div>
          )}
          {isLive && match.minute && (
            <div className="text-[10px] font-bold text-live mt-0.5 uppercase tracking-wider">{match.minute}</div>
          )}
          {isUpcoming && (
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Kick-off</div>
          )}
        </div>

        <TeamRow team={match.away} isWinner={awayWin} align="right" />
      </div>

      {isUpcoming && (
        <div className="px-4 pb-4">
          <MatchPredictor homeTeam={match.home.name} awayTeam={match.away.name} />
        </div>
      )}

      {isFinished && (
        <div className="px-4 pb-4">
          <Button onClick={openHighlights} variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/10 font-bold">
            <ExternalLink className="h-4 w-4 me-2" />
            {lang === 'ar' ? 'مشاهدة الملخص عبر beIN SPORTS' : 'Watch highlights on beIN SPORTS'}
          </Button>
        </div>
      )}

      <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{match.venue}</span>
        </div>
        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
          Match details
        </span>
      </div>
    </Card>
  );
}
