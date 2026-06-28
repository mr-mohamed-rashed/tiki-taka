import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import type { Match } from '@/lib/footballData';
import { cn } from '@/lib/utils';

const DEFAULT_START = new Date('2026-06-11T21:00:00Z').getTime();

interface TournamentCountdownProps {
  match?: Match;
  onTimerZero?: () => void;
}

const getTimeLeft = (targetTime: number) => {
  const distance = Math.max(targetTime - Date.now(), 0);

  return {
    distance,
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
};

export function TournamentCountdown({ match, onTimerZero }: TournamentCountdownProps) {
  const { lang } = useLanguage();
  const targetTime = useMemo(() => (match ? new Date(match.date).getTime() : DEFAULT_START), [match]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetTime));

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const newTime = getTimeLeft(targetTime);
      setTimeLeft(newTime);
      
      if (newTime.distance <= 0) {
        window.clearInterval(timer);
        onTimerZero?.();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetTime, onTimerZero]);

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
        <div className="relative group mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl group-hover:bg-primary/60 transition-colors duration-500" />
          <div className="relative p-4 rounded-full bg-background/80 border border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.4)] backdrop-blur-xl">
            <Clock className="h-8 w-8 text-primary animate-pulse-glow" />
          </div>
        </div>

        <h3 className={cn('font-display font-black text-3xl sm:text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]', lang === 'ar' && 'font-arabic')}>
          {title}
        </h3>

        {match ? (
          <div className="mb-12 space-y-6 w-full max-w-2xl mx-auto">
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 p-6 sm:p-8 rounded-3xl bg-black/40 border border-white/10 shadow-2xl backdrop-blur-md">
              <div className="w-full sm:w-2/5 flex justify-center sm:justify-end z-10">
                <TeamName name={match.home.name} flag={match.home.flag} reverse={lang === 'ar'} />
              </div>
              
              <div className="relative z-20 flex-shrink-0 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.8)] border-2 border-background/50 ring-4 ring-primary/20 transform hover:scale-110 transition-transform duration-300">
                <span className="text-lg sm:text-xl font-black italic">VS</span>
              </div>
              
              <div className="w-full sm:w-2/5 flex justify-center sm:justify-start z-10">
                <TeamName name={match.away.name} flag={match.away.flag} reverse={lang !== 'ar'} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className={cn('inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm sm:text-base backdrop-blur-sm', lang === 'ar' && 'font-arabic')}>
                {match.stage} <span className="mx-3 opacity-50">•</span> {matchDate}
              </p>
              <p className="inline-flex items-center justify-center gap-2 text-sm text-foreground/70 font-medium">
                <MapPin className="h-4 w-4 text-primary/80" />
                <span>{match.venue}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className={cn('text-muted-foreground mb-12 max-w-md', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar'
              ? 'ستظهر بيانات المباريات الحية هنا فور انطلاق البطولة.'
              : 'Live match data will appear here once the tournament kicks off.'}
          </p>
        )}

        <div className="grid grid-cols-4 gap-3 sm:gap-8 w-full max-w-3xl" dir="ltr">
          {[
            { value: timeLeft.days, label: labels.days },
            { value: timeLeft.hours, label: labels.hours },
            { value: timeLeft.minutes, label: labels.minutes },
            { value: timeLeft.seconds, label: labels.seconds },
          ].map((item) => (
            <div key={item.label} className="group flex flex-col items-center min-w-0">
              <div className="relative w-full aspect-square max-w-[100px] flex items-center justify-center bg-black/60 border border-white/10 rounded-2xl sm:rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] mb-4 backdrop-blur-xl transition-all duration-500 overflow-hidden group-hover:border-primary/50 group-hover:shadow-[inset_0_0_30px_hsl(var(--primary)/0.2),0_0_40px_hsl(var(--primary)/0.4)]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <span className="relative font-display font-black text-4xl sm:text-6xl text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:text-primary group-hover:drop-shadow-[0_0_20px_hsl(var(--primary)/0.8)] transition-colors duration-300">
                  {item.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className={cn('text-xs sm:text-sm font-black text-foreground/60 uppercase tracking-[0.2em] group-hover:text-primary transition-colors duration-300', lang === 'ar' && 'font-arabic tracking-normal')}>
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
    <div className="absolute inset-0 bg-background overflow-hidden">
      {/* 
        ONE PIECE MOBILE BLEND: 
        On mobile, we use mask-image to smoothly fade the home flag from top-to-bottom
        and away flag from bottom-to-top, creating a single unified cinematic background.
        On desktop, we still use the sharp aggressive diagonal.
      */}
      
      {/* Home Flag */}
      <div 
        className="absolute inset-x-0 top-0 h-[70%] sm:h-full sm:w-[60%] sm:bottom-0 sm:left-0 
                   [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] 
                   sm:[mask-image:none] 
                   sm:[clip-path:polygon(0_0,100%_0,80%_100%,0_100%)] overflow-hidden"
      >
        <img
          src={match.home.flag}
          alt=""
          className="h-full w-full object-cover opacity-30 saturate-[2] mix-blend-plus-lighter"
        />
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-background/40 via-background/60 to-background" />
      </div>

      {/* Away Flag */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[70%] sm:h-full sm:w-[60%] sm:top-0 sm:right-0 
                   [mask-image:linear-gradient(to_top,black_40%,transparent_100%)] 
                   sm:[mask-image:none] 
                   sm:[clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] overflow-hidden"
      >
        <img
          src={match.away.flag}
          alt=""
          className="h-full w-full object-cover opacity-30 saturate-[2] mix-blend-plus-lighter"
        />
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-background/40 via-background/60 to-background" />
      </div>

      {/* Cinematic Center Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute h-full w-full bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] opacity-80" />
        <div className="absolute h-[150%] w-[150%] sm:h-[120%] sm:w-[120%] bg-primary/10 blur-[100px] animate-pulse" />
      </div>
    </div>
  );
}

function TeamName({ name, flag, reverse }: { name: string; flag: string; reverse?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-5", reverse && "flex-row-reverse")}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/40 blur-md" />
        <img src={flag} alt="" className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-white/20 shadow-2xl z-10" />
      </div>
      <span className="font-display font-black text-xl sm:text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-[120px] sm:max-w-[200px]">
        {name}
      </span>
    </div>
  );
}
