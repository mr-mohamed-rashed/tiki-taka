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
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2">
        <Card className="relative min-w-[980px] overflow-hidden border-border bg-gradient-card p-6 sm:min-w-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_34%)]" />
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-5">
            <RoadSide slots={slots.slice(0, 16)} side="left" isAr={isAr} />

            <div className="relative mx-auto flex min-h-64 w-full max-w-sm flex-col items-center justify-center rounded-lg border border-primary/25 bg-background/55 p-6 text-center shadow-neon backdrop-blur">
              <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="relative z-10 mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-neon">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <h3 className={cn('font-display text-2xl font-extrabold', isAr && 'font-arabic')}>
                {isAr ? 'كأس العالم' : 'World Cup'}
              </h3>
              <p className={cn('mt-2 text-sm text-muted-foreground', isAr && 'font-arabic')}>
                {isAr
                  ? 'الخانات تمتلئ تلقائيا بعد تحديد المتأهلين من المجموعات.'
                  : 'Slots fill automatically once group qualifiers are known.'}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-primary">
                <span className="rounded-md bg-primary/10 px-3 py-2">{isAr ? '32 فريق' : '32 teams'}</span>
                <span className="rounded-md bg-primary/10 px-3 py-2">{isAr ? 'طريق واحد' : 'One road'}</span>
              </div>
            </div>

            <RoadSide slots={slots.slice(16)} side="right" isAr={isAr} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function RoadSide({
  slots: sideSlots,
  side,
  isAr,
}: {
  slots: typeof slots;
  side: 'left' | 'right';
  isAr: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {sideSlots.map((slot, index) => (
        <div
          key={slot.id}
          className={cn(
            'relative flex min-h-14 items-center gap-2 rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur transition-colors hover:border-primary/45',
            side === 'right' && 'justify-end text-right',
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
            <Flag className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-foreground">
              {isAr ? `متأهل ${slot.id}` : slot.label}
            </p>
            <p className={cn('text-[10px] text-muted-foreground', isAr && 'font-arabic')}>
              {isAr ? qualificationLabel(index) : 'Qualifier slot'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function qualificationLabel(index: number) {
  const group = String.fromCharCode(65 + Math.floor(index / 2));
  return index % 2 === 0 ? `أول المجموعة ${group}` : `ثاني المجموعة ${group}`;
}
