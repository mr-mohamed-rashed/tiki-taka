import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface LiveScoreWidgetProps {
  sport: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: 'LIVE' | 'FT' | 'HT';
  time?: string;
}

export function LiveScoreWidget({ sport, team1, team2, score1, score2, status, time }: LiveScoreWidgetProps) {
  const isLive = status === 'LIVE';

  return (
    <Card className={`${isLive ? 'border-primary' : 'border-border'} transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-muted-foreground">{sport}</span>
          <Badge 
            className={`${isLive ? 'bg-accent-live text-primary-foreground animate-pulse-live' : 'bg-muted text-muted-foreground'}`}
          >
            {status}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{team1}</span>
            <span className="text-2xl font-bold text-foreground">{score1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{team2}</span>
            <span className="text-2xl font-bold text-foreground">{score2}</span>
          </div>
        </div>

        {time && (
          <div className="mt-3 text-xs text-muted-foreground text-center">
            {time}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
