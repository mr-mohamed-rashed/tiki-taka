import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Zap } from 'lucide-react';
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
    <Card className="relative overflow-hidden border-border border-dashed bg-background text-center min-h-[360px]">
      {match && <FlagFaceOff match={match} />}

      <div className="relative z-10 flex min-h-[360px] flex-col items-center justify-center p-6 sm:p-10">
      <div className="p-3 rounded-full bg-background/70 border border-primary/35 mb-5 shadow-neon backdrop-blur">
          <Clock className="h-7 w-7 text-primary animate-pulse-glow rounded-full" />
        </div>

        <h3 className={cn('font-display font-extrabold text-2xl sm:text-3xl mb-3 text-foreground drop-shadow-lg', lang === 'ar' && 'font-arabic')}>
          {title}
        </h3>

        {match ? (
          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xl sm:text-2xl font-extrabold">
              <TeamName name={match.home.name} flag={match.home.flag} />
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-black text-primary-foreground shadow-neon">VS</span>
              <TeamName name={match.away.name} flag={match.away.flag} />
            </div>
            <p className={cn('text-foreground/80', lang === 'ar' && 'font-arabic')}>
              {match.stage} - {matchDate}
            </p>
            <p className="inline-flex items-center justify-center gap-2 text-sm text-foreground/75">
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-background/90 border border-primary/40 rounded-xl shadow-neon mb-2 backdrop-blur">
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-primary tabular-nums">
                  {item.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className={cn('text-xs font-bold text-foreground/75 uppercase tracking-wider', lang === 'ar' && 'font-arabic')}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FlagFaceOff({ match }: { match: Match }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
        <img
          src={match.home.flag}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-48 blur-[0.5px] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-background/35 to-background/78" />
      </div>

      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        <img
          src={match.away.flag}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-48 blur-[0.5px] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/10 via-background/35 to-background/78" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.04)_43%,hsl(var(--primary)/0.12)_50%,hsl(var(--primary)/0.04)_57%,transparent_100%)]" />
      <div className="absolute left-1/2 bottom-4 h-32 w-32 -translate-x-1/2 rounded-full bg-primary/18 blur-3xl sm:bottom-6 sm:h-36 sm:w-36" />
      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 text-primary opacity-55 drop-shadow-[0_0_32px_hsl(var(--primary)/0.85)] sm:bottom-8">
        <Zap className="h-24 w-24 fill-primary/20" />
      </div>
      <div className="absolute inset-0 bg-background/42" />
    </div>
  );
}

function TeamName({ name, flag }: { name: string; flag: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-background/65 px-3 py-1.5 ring-1 ring-border backdrop-blur">
      <img src={flag} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-primary/50" />
      <span>{name}</span>
    </span>
  );
}
