import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ExternalLink, Loader2, Play, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useResults } from '@/hooks/useFootballData';
import { useAuth } from '@/hooks/useAuth';
import { trackVisitEvent, useTrackVisit } from '@/hooks/useVisitTracking';
import { hasSupabaseConfig } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Match } from '@/lib/footballData';

export function HighlightsGallery() {
  return <MatchHighlightsContent />;
}

function MatchHighlightsContent() {
  const { lang } = useLanguage();
  const { user, signInWithGoogle } = useAuth();
  const { data: finishedMatches = [], isLoading } = useResults();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useTrackVisit({ eventType: 'highlights_view', page: '/highlights' });

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const cards = useMemo(() => finishedMatches.map((match) => toHighlightCard(match, lang)), [finishedMatches, lang]);

  const openBeinSportsSearch = async (match: Match) => {
    const title = `${match.home.name} ${match.homeScore}-${match.awayScore} ${match.away.name} highlights`;
    const url = `https://www.youtube.com/@beINSPORTS/search?query=${encodeURIComponent(title)}`;

    window.speechSynthesis.cancel();
    setSpeakingId(null);

    if (hasSupabaseConfig && !user) {
      await signInWithGoogle();
      return;
    }

    await trackVisitEvent({
      userId: user?.id,
      eventType: 'match_highlight_click',
      page: '/highlights',
      metadata: {
        matchId: match.id,
        home: match.home.name,
        away: match.away.name,
        score: `${match.homeScore}-${match.awayScore}`,
        provider: 'beIN SPORTS',
      },
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const speakText = (event: React.MouseEvent, card: HighlightCard) => {
    event.stopPropagation();

    if (speakingId === card.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${card.title}. ${card.description}`);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(card.id);
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <Card className="p-8 border-dashed border-border bg-gradient-card text-center">
        <CalendarCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h3 className={cn('font-display text-2xl font-extrabold mb-2', lang === 'ar' && 'font-arabic')}>
          {lang === 'ar' ? 'ملخصات النتائج ستظهر هنا' : 'Result highlights will appear here'}
        </h3>
        <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
          {lang === 'ar'
            ? 'بعد نهاية كل مباراة، ستنزل النتيجة هنا ككارت ثابت ومعها لينك مشاهدة الملخص.'
            : 'After each match ends, its final score will be pinned here with a beIN SPORTS highlights link.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="group overflow-hidden bg-gradient-card border-border hover:border-primary/50 transition-all hover:shadow-elevated cursor-pointer"
          onClick={() => openBeinSportsSearch(card.match)}
        >
          <div className="relative aspect-video bg-gradient-pitch overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,.25)_50%,transparent_51%)]" />
            <div className="absolute inset-x-6 top-6 flex items-center justify-between">
              <TeamBadge name={card.match.home.shortName} flag={card.match.home.flag} />
              <Badge className="bg-background/90 text-foreground border border-border font-bold">FT</Badge>
              <TeamBadge name={card.match.away.shortName} flag={card.match.away.flag} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <div className="font-display text-5xl font-extrabold text-white drop-shadow-lg">
                {card.match.homeScore} - {card.match.awayScore}
              </div>
              <div className="mt-3 rounded-full bg-primary/90 px-4 py-2 text-xs font-bold text-primary-foreground shadow-neon">
                {lang === 'ar' ? 'لو عايز تشوف ملخص المباراة' : 'Watch match highlights'}
              </div>
            </div>
            <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-primary/90 flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-0.5" />
            </div>
          </div>

          <div className="p-4">
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-bold mb-2">
              {card.badge}
            </Badge>
            <h3 className={cn('font-bold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2', lang === 'ar' && 'font-arabic')}>
              {card.title}
            </h3>
            <p className={cn('text-xs text-muted-foreground line-clamp-2', lang === 'ar' && 'font-arabic')}>
              {card.description}
            </p>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={(event) => speakText(event, card)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors',
                  speakingId === card.id ? 'bg-live/20 text-live' : 'bg-muted hover:bg-muted/80 text-foreground',
                )}
                title={lang === 'ar' ? 'استماع للملخص' : 'Listen to summary'}
              >
                {speakingId === card.id ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {speakingId === card.id
                  ? (lang === 'ar' ? 'إيقاف' : 'Stop')
                  : (lang === 'ar' ? 'استماع' : 'Listen')}
              </button>
              <div className="flex items-center gap-1 text-primary font-semibold text-xs">
                <ExternalLink className="h-3 w-3" />
                <span>beIN SPORTS</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

type HighlightCard = {
  id: string;
  match: Match;
  title: string;
  description: string;
  badge: string;
};

function toHighlightCard(match: Match, lang: 'en' | 'ar'): HighlightCard {
  const score = `${match.homeScore}-${match.awayScore}`;

  return {
    id: match.id,
    match,
    title: `${match.home.name} ${score} ${match.away.name}`,
    description: lang === 'ar'
      ? `${match.competition} - ${match.stage}. النتيجة النهائية من ${match.venue || 'ملعب المباراة'}.`
      : `${match.competition} - ${match.stage}. Final score from ${match.venue || 'the match venue'}.`,
    badge: match.stage,
  };
}

function TeamBadge({ name, flag }: { name: string; flag: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs font-bold text-foreground ring-1 ring-border">
      {flag && <img src={flag} alt="" className="h-5 w-5 rounded object-cover" />}
      <span>{name}</span>
    </div>
  );
}
