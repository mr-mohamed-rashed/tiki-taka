import { useEffect, useState } from 'react';
import { Flag, Trophy, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { teams, Team } from '@/lib/footballData';

type SlotData = {
  id: number;
  label: string;
  team?: Team;
};

const defaultSlots: SlotData[] = Array.from({ length: 32 }, (_, index) => ({
  id: index + 1,
  label: `R32-${index + 1}`,
}));

export function WorldCupRoadmap() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [slots, setSlots] = useState<SlotData[]>(defaultSlots);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value_en')
          .eq('key', 'roadmap_qualified_teams')
          .single();

        if (!error && data?.value_en) {
          const parsed = JSON.parse(data.value_en);
          if (Array.isArray(parsed) && parsed.length === 32) {
            const newSlots = defaultSlots.map((slot, i) => {
              const teamId = parsed[i];
              let team: Team | undefined;
              if (teamId) {
                // Find team by ID
                team = Object.values(teams).find(t => t.id === teamId);
              }
              return { ...slot, team };
            });
            setSlots(newSlots);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load roadmap teams', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  return (
    <Card className="relative w-full overflow-hidden border-border bg-gradient-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_34%)] pointer-events-none" />
      
      {isLoading ? (
        <div className="flex h-64 sm:h-[600px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar">
          <div className="min-w-[800px] sm:min-w-0 p-4 sm:p-6 w-full h-full flex flex-col justify-center">
            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
              <RoadSide slots={slots.slice(0, 16)} side="left" isAr={isAr} />
              <CenterCup isAr={isAr} />
              <RoadSide slots={slots.slice(16)} side="right" isAr={isAr} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function CenterCup({ isAr }: { isAr: boolean }) {
  return (
    <div className={cn(
      "relative mx-auto flex flex-col items-center justify-center rounded-lg border border-primary/25 bg-background/55 text-center shadow-neon backdrop-blur z-10 w-full min-w-[140px] max-w-sm sm:min-h-64 p-4 sm:p-6 snap-center"
    )}>
      <div className="absolute inset-x-2 sm:inset-x-8 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-[-1]" />
      <div className={cn(
        "relative z-10 flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-neon mb-3 sm:mb-4 h-16 w-16 sm:h-24 sm:w-24"
      )}>
        <Trophy className="text-primary h-8 w-8 sm:h-12 sm:w-12" />
      </div>
      <h3 className={cn('font-display font-extrabold text-lg sm:text-2xl', isAr && 'font-arabic')}>
        {isAr ? 'كأس العالم' : 'World Cup'}
      </h3>
      <p className={cn('hidden sm:block mt-2 text-sm text-muted-foreground', isAr && 'font-arabic')}>
        {isAr
          ? 'الخانات تمتلئ تلقائيا بعد تحديد المتأهلين من المجموعات.'
          : 'Slots fill automatically once group qualifiers are known.'}
      </p>
      <div className="grid gap-2 font-bold text-primary mt-4 sm:mt-5 grid-cols-2 text-[10px] sm:text-xs">
        <span className="rounded-md bg-primary/10 px-2 py-1.5 sm:px-3 sm:py-2">{isAr ? '32 فريق' : '32 teams'}</span>
        <span className="rounded-md bg-primary/10 px-2 py-1.5 sm:px-3 sm:py-2">{isAr ? 'طريق واحد' : 'One road'}</span>
      </div>
    </div>
  );
}

function RoadSide({
  slots: sideSlots,
  side,
  isAr,
}: {
  slots: SlotData[];
  side: 'left' | 'right';
  isAr: boolean;
}) {
  return (
    <div className="grid min-h-0 grid-cols-2 gap-2 sm:gap-2 snap-start sm:snap-none">
      {sideSlots.map((slot, index) => (
        <div
          key={slot.id}
          className={cn(
            'relative flex min-h-0 items-center rounded-md border border-border bg-background/70 backdrop-blur transition-colors hover:border-primary/45 gap-2 px-2 py-2 sm:min-h-14 sm:px-3 sm:py-2',
            side === 'right' && 'justify-end text-right flex-row-reverse'
          )}
        >
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border h-6 w-6 sm:h-8 sm:w-8 overflow-hidden",
            slot.team && "ring-primary/40 bg-background"
          )}>
            {slot.team ? (
              <img src={slot.team.flag} alt={slot.team.name} className="h-full w-full object-cover" />
            ) : (
              <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className={cn("truncate font-extrabold text-foreground text-[10px] sm:text-xs", isAr && 'font-arabic')}>
              {slot.team ? slot.team.name : (isAr ? `متأهل ${slot.id}` : slot.label)}
            </p>
            <p className={cn('truncate text-muted-foreground text-[8px] sm:text-[10px]', isAr && 'font-arabic')}>
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
