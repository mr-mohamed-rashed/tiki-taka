import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import type { Match } from '@/lib/footballData';
import { cn } from '@/lib/utils';

const DEFAULT_START = new Date('2026-06-11T21:00:00Z').getTime();

interface TournamentCountdownProps {
  match?: Match;
}

const getTimeLeft = (targetTime: number) => {
  const distance = Math.max(targetTime - Date.now(), 0);

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
};

export function TournamentCountdown({ match }: TournamentCountdownProps) {
  const { lang } = useLanguage();
  const targetTime = useMemo(() => (match ? new Date(match.date).getTime() : DEFAULT_START), [match]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetTime));

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetTime));

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetTime));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetTime]);

  const labels = {
    days: lang === 'ar' ? 'يوم' : 'Days',
    hours: lang === 'ar' ? 'ساعة' : 'Hours',
    minutes: lang === 'ar' ? 'دقيقة' : 'Mins',
    seconds: lang === 'ar' ? 'ثانية' : 'Secs',
  };

  const matchDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(targetTime));

  const title = match
    ? lang === 'ar'
      ? 'الماتش اللي عليه الدور'
      : 'Next Match Countdown'
    : lang === 'ar'
      ? 'قريباً: كأس العالم 2026'
      : 'Coming Soon: World Cup 2026';

  return (
    <Card className="flex flex-col items-center justify-center p-6 sm:p-10 bg-gradient-card border-border border-dashed text-center min-h-[300px]">
      <div className="p-4 rounded-full bg-primary/10 mb-5">
        <Clock className="h-8 w-8 text-primary animate-pulse-glow rounded-full" />
      </div>

      <h3 className={cn('font-display font-extrabold text-2xl mb-3', lang === 'ar' && 'font-arabic')}>
        {title}
      </h3>

      {match ? (
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-lg sm:text-xl font-extrabold">
            <span>{match.home.name}</span>
            <span className="text-primary">vs</span>
            <span>{match.away.name}</span>
          </div>
          <p className={cn('text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {match.stage} - {matchDate}
          </p>
          <p className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{match.venue}</span>
          </p>
        </div>
      ) : (
        <p className={cn('text-muted-foreground mb-8 max-w-md', lang === 'ar' && 'font-arabic')}>
          {lang === 'ar'
            ? 'ستظهر بيانات المباريات الحية هنا فور انطلاق البطولة.'
            : 'Live match data will appear here once the tournament kicks off.'}
        </p>
      )}

      <div className="grid grid-cols-4 gap-3 sm:gap-6" dir="ltr">
        {[
          { value: timeLeft.days, label: labels.days },
          { value: timeLeft.hours, label: labels.hours },
          { value: timeLeft.minutes, label: labels.minutes },
          { value: timeLeft.seconds, label: labels.seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-background border border-primary/30 rounded-xl shadow-neon mb-2">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-primary tabular-nums">
                {item.value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className={cn('text-xs font-bold text-muted-foreground uppercase tracking-wider', lang === 'ar' && 'font-arabic')}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
