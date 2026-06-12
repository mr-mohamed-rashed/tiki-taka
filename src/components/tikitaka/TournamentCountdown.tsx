import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const TOURNAMENT_START = new Date('2026-06-11T21:00:00Z').getTime();

export function TournamentCountdown() {
  const { lang } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = TOURNAMENT_START - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const labels = {
    days: lang === 'ar' ? 'يوم' : 'Days',
    hours: lang === 'ar' ? 'ساعة' : 'Hours',
    minutes: lang === 'ar' ? 'دقيقة' : 'Mins',
    seconds: lang === 'ar' ? 'ثانية' : 'Secs',
  };

  return (
    <Card className="flex flex-col items-center justify-center p-10 bg-gradient-card border-border border-dashed text-center min-h-[300px]">
      <div className="p-4 rounded-full bg-primary/10 mb-6">
        <Clock className="h-8 w-8 text-primary animate-pulse-glow rounded-full" />
      </div>
      <h3 className={cn('font-display font-extrabold text-2xl mb-2', lang === 'ar' && 'font-arabic')}>
        {lang === 'ar' ? 'قريباً: كأس العالم 2026' : 'Coming Soon: World Cup 2026'}
      </h3>
      <p className={cn('text-muted-foreground mb-8 max-w-md', lang === 'ar' && 'font-arabic')}>
        {lang === 'ar'
          ? 'لم تبدأ المباريات بعد. ستظهر البيانات الحية هنا فور انطلاق البطولة في 11 يونيو 2026.'
          : 'Matches have not started yet. Live data will appear here once the tournament kicks off on June 11, 2026.'}
      </p>

      <div className="flex items-center gap-4 sm:gap-6" dir="ltr">
        {[
          { value: timeLeft.days, label: labels.days },
          { value: timeLeft.hours, label: labels.hours },
          { value: timeLeft.minutes, label: labels.minutes },
          { value: timeLeft.seconds, label: labels.seconds },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
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
