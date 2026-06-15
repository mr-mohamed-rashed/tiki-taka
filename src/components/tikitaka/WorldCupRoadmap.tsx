import { Flag, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const slots = Array.from({ length: 32 }, (_, index) => ({
  id: index + 1,
  label: `R32-${index + 1}`,
}));

export function WorldCupRoadmap() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <Card className="relative w-full overflow-hidden border-border bg-gradient-card h-[85vh] min-h-[600px] sm:h-auto sm:min-h-0">
      
      {/* Mobile Rotated View */}
      <div 
        className="sm:hidden absolute top-0 left-full origin-top-left rotate-90 p-2 flex items-center justify-center bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_34%)]"
        style={{ width: 'max(85vh, 600px)', height: '100%' }}
      >
        <div className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <RoadSide slots={slots.slice(0, 16)} side="left" isAr={isAr} isMobile={true} />
          <CenterCup isAr={isAr} isMobile={true} />
          <RoadSide slots={slots.slice(16)} side="right" isAr={isAr} isMobile={true} />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block relative p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_34%)]" />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-5">
          <RoadSide slots={slots.slice(0, 16)} side="left" isAr={isAr} isMobile={false} />
          <CenterCup isAr={isAr} isMobile={false} />
          <RoadSide slots={slots.slice(16)} side="right" isAr={isAr} isMobile={false} />
        </div>
      </div>
    </Card>
  );
}

function CenterCup({ isAr, isMobile }: { isAr: boolean; isMobile: boolean }) {
  return (
    <div className={cn(
      "relative mx-auto flex flex-col items-center justify-center rounded-lg border border-primary/25 bg-background/55 text-center shadow-neon backdrop-blur z-10",
      isMobile ? "w-[120px] p-2" : "w-full max-w-sm sm:min-h-64 sm:p-6"
    )}>
      <div className="absolute inset-x-2 sm:inset-x-8 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-[-1]" />
      <div className={cn(
        "relative z-10 flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-neon",
        isMobile ? "mb-1 h-12 w-12" : "mb-4 sm:h-24 sm:w-24"
      )}>
        <Trophy className={cn("text-primary", isMobile ? "h-6 w-6" : "sm:h-12 sm:w-12")} />
      </div>
      <h3 className={cn('font-display font-extrabold', isAr && 'font-arabic', isMobile ? "text-sm" : "text-2xl")}>
        {isAr ? 'كأس العالم' : 'World Cup'}
      </h3>
      {!isMobile && (
        <p className={cn('mt-2 text-sm text-muted-foreground', isAr && 'font-arabic')}>
          {isAr
            ? 'الخانات تمتلئ تلقائيا بعد تحديد المتأهلين من المجموعات.'
            : 'Slots fill automatically once group qualifiers are known.'}
        </p>
      )}
      <div className={cn("grid gap-1 font-bold text-primary", isMobile ? "mt-2 grid-cols-1 text-[8px]" : "mt-5 grid-cols-2 sm:gap-2 text-xs")}>
        <span className={cn("rounded-md bg-primary/10", isMobile ? "px-1.5 py-0.5" : "px-3 py-2")}>{isAr ? '32 فريق' : '32 teams'}</span>
        <span className={cn("rounded-md bg-primary/10", isMobile ? "px-1.5 py-0.5" : "px-3 py-2")}>{isAr ? 'طريق واحد' : 'One road'}</span>
      </div>
    </div>
  );
}

function RoadSide({
  slots: sideSlots,
  side,
  isAr,
  isMobile,
}: {
  slots: typeof slots;
  side: 'left' | 'right';
  isAr: boolean;
  isMobile: boolean;
}) {
  return (
    <div className={cn("grid min-h-0 grid-cols-2", isMobile ? "gap-1" : "gap-1.5 sm:gap-2")}>
      {sideSlots.map((slot, index) => (
        <div
          key={slot.id}
          className={cn(
            'relative flex min-h-0 items-center rounded-md border border-border bg-background/70 backdrop-blur transition-colors hover:border-primary/45',
            isMobile ? "gap-1 px-1.5 py-1" : "gap-2 px-2 py-1.5 sm:min-h-14 sm:px-3 sm:py-2",
            side === 'right' && (!isMobile || isMobile) && 'justify-end text-right flex-row-reverse'
          )}
        >
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border",
            isMobile ? "h-5 w-5" : "h-7 w-7 sm:h-8 sm:w-8"
          )}>
            <Flag className={cn(isMobile ? "h-2.5 w-2.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4")} />
          </div>
          <div className="min-w-0">
            <p className={cn("truncate font-extrabold text-foreground", isMobile ? "text-[8px]" : "text-[11px] sm:text-xs")}>
              {isAr ? `متأهل ${slot.id}` : slot.label}
            </p>
            <p className={cn('truncate text-muted-foreground', isAr && 'font-arabic', isMobile ? "text-[7px]" : "text-[9px] sm:text-[10px]")}>
              {isAr ? qualificationLabel(index) : 'Qualifier'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function qualificationLabel(index: number) {
  const group = String.fromCharCode(65 + Math.floor(index / 2));
  return index % 2 === 0 ? `أول ${group}` : `ثاني ${group}`;
}
