import { BrainCircuit, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useAIAgent } from '@/hooks/useAIAgent';

interface MatchPredictorProps {
  homeTeam: string;
  awayTeam: string;
}

interface PredictionData {
  homeWinProb: number;
  awayWinProb: number;
  drawProb: number;
  analysis: string;
}

export function MatchPredictor({ homeTeam, awayTeam }: MatchPredictorProps) {
  const { lang } = useLanguage();
  const { data, isLoading } = useAIAgent<PredictionData>('predict', { home: homeTeam, away: awayTeam }, lang);

  if (isLoading) {
    return (
      <Card className="p-4 bg-primary/5 border-primary/20 flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className={cn("text-sm text-muted-foreground", lang === 'ar' && 'font-arabic')}>
          {lang === 'ar' ? 'جاري تحليل المباراة بالذكاء الاصطناعي...' : 'AI analyzing match...'}
        </span>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/10 to-background border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <BrainCircuit className="h-16 w-16" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="h-4 w-4 text-primary" />
        <h4 className={cn("text-sm font-bold uppercase tracking-wider text-primary", lang === 'ar' && 'font-arabic')}>
          {lang === 'ar' ? 'توقعات الذكاء الاصطناعي' : 'AI Prediction'}
        </h4>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden mb-2">
        <div style={{ width: `${data.homeWinProb}%` }} className="bg-live transition-all duration-1000" />
        <div style={{ width: `${data.drawProb}%` }} className="bg-muted-foreground/30 transition-all duration-1000" />
        <div style={{ width: `${data.awayWinProb}%` }} className="bg-primary transition-all duration-1000" />
      </div>

      <div className="flex justify-between text-xs font-bold mb-4">
        <span className="text-live">{data.homeWinProb}% {homeTeam}</span>
        <span className="text-muted-foreground">{data.drawProb}% {lang === 'ar' ? 'تعادل' : 'Draw'}</span>
        <span className="text-primary">{data.awayWinProb}% {awayTeam}</span>
      </div>

      <p className={cn("text-sm text-muted-foreground leading-relaxed relative z-10", lang === 'ar' && 'font-arabic')}>
        {data.analysis}
      </p>
    </Card>
  );
}
