import { useEffect, useState } from 'react';
import { Flag, Trophy, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { teams as teamsData, Team } from '@/lib/footballData';
import { BracketState, getDefaultBracket, BracketMatch } from '@/lib/bracket';

export function WorldCupRoadmap() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [bracket, setBracket] = useState<BracketState>(getDefaultBracket());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value_en')
          .eq('key', 'tournament_bracket')
          .single();

        if (!error && data?.value_en) {
          const parsed = JSON.parse(data.value_en);
          if (parsed && parsed.matches) {
            setBracket(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load bracket', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  if (isLoading) {
    return (
      <Card className="flex h-64 sm:h-[600px] items-center justify-center border-border bg-gradient-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  // Left Tree Nodes
  const m1 = bracket.matches['m1'];
  const m2 = bracket.matches['m2'];
  const m3 = bracket.matches['m3'];
  const m4 = bracket.matches['m4'];
  const m5 = bracket.matches['m5'];
  const m6 = bracket.matches['m6'];
  const m7 = bracket.matches['m7'];
  const m8 = bracket.matches['m8'];

  const m17 = bracket.matches['m17'];
  const m18 = bracket.matches['m18'];
  const m19 = bracket.matches['m19'];
  const m20 = bracket.matches['m20'];

  const m25 = bracket.matches['m25'];
  const m26 = bracket.matches['m26'];
  const m29 = bracket.matches['m29'];

  // Right Tree Nodes
  const m9 = bracket.matches['m9'];
  const m10 = bracket.matches['m10'];
  const m11 = bracket.matches['m11'];
  const m12 = bracket.matches['m12'];
  const m13 = bracket.matches['m13'];
  const m14 = bracket.matches['m14'];
  const m15 = bracket.matches['m15'];
  const m16 = bracket.matches['m16'];

  const m21 = bracket.matches['m21'];
  const m22 = bracket.matches['m22'];
  const m23 = bracket.matches['m23'];
  const m24 = bracket.matches['m24'];

  const m27 = bracket.matches['m27'];
  const m28 = bracket.matches['m28'];
  const m30 = bracket.matches['m30'];

  const final = bracket.matches['m31'];

  return (
    <Card className="relative w-full overflow-hidden border-border bg-gradient-card p-4 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_40%)] pointer-events-none" />
      
      <div className="w-full overflow-x-auto overflow-y-hidden hide-scrollbar" dir="ltr">
        <div className="min-w-[1000px] flex justify-between items-center gap-4 py-8">
          
          {/* Left Side */}
          <BracketNode match={m29} side="left" isAr={isAr}>
            <BracketNode match={m25} side="left" isAr={isAr}>
              <BracketNode match={m17} side="left" isAr={isAr}>
                <BracketNode match={m1} side="left" isAr={isAr} />
                <BracketNode match={m2} side="left" isAr={isAr} />
              </BracketNode>
              <BracketNode match={m18} side="left" isAr={isAr}>
                <BracketNode match={m3} side="left" isAr={isAr} />
                <BracketNode match={m4} side="left" isAr={isAr} />
              </BracketNode>
            </BracketNode>
            <BracketNode match={m26} side="left" isAr={isAr}>
              <BracketNode match={m19} side="left" isAr={isAr}>
                <BracketNode match={m5} side="left" isAr={isAr} />
                <BracketNode match={m6} side="left" isAr={isAr} />
              </BracketNode>
              <BracketNode match={m20} side="left" isAr={isAr}>
                <BracketNode match={m7} side="left" isAr={isAr} />
                <BracketNode match={m8} side="left" isAr={isAr} />
              </BracketNode>
            </BracketNode>
          </BracketNode>

          {/* Center Final */}
          <div className="flex flex-col items-center justify-center z-10 px-4">
            <div className="mb-6 flex flex-col items-center">
              <div className="rounded-full border-2 border-primary/40 bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.3)] p-4 sm:p-6 mb-4">
                <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
              </div>
              <h3 className={cn("font-display font-black text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary", isAr && "font-arabic")}>
                {isAr ? 'النهائي' : 'GRAND FINAL'}
              </h3>
            </div>
            
            <MatchBox match={final} isAr={isAr} isFinal />
          </div>

          {/* Right Side */}
          <BracketNode match={m30} side="right" isAr={isAr}>
            <BracketNode match={m27} side="right" isAr={isAr}>
              <BracketNode match={m21} side="right" isAr={isAr}>
                <BracketNode match={m9} side="right" isAr={isAr} />
                <BracketNode match={m10} side="right" isAr={isAr} />
              </BracketNode>
              <BracketNode match={m22} side="right" isAr={isAr}>
                <BracketNode match={m11} side="right" isAr={isAr} />
                <BracketNode match={m12} side="right" isAr={isAr} />
              </BracketNode>
            </BracketNode>
            <BracketNode match={m28} side="right" isAr={isAr}>
              <BracketNode match={m23} side="right" isAr={isAr}>
                <BracketNode match={m13} side="right" isAr={isAr} />
                <BracketNode match={m14} side="right" isAr={isAr} />
              </BracketNode>
              <BracketNode match={m24} side="right" isAr={isAr}>
                <BracketNode match={m15} side="right" isAr={isAr} />
                <BracketNode match={m16} side="right" isAr={isAr} />
              </BracketNode>
            </BracketNode>
          </BracketNode>

        </div>
      </div>
    </Card>
  );
}

function BracketNode({ match, children, side, isAr }: { match: BracketMatch, children?: React.ReactNode, side: 'left' | 'right', isAr: boolean }) {
  if (!children) {
    return (
      <div className="py-1">
        <MatchBox match={match} isAr={isAr} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch", side === 'right' && "flex-row-reverse")}>
      <div className="flex flex-col justify-around">
        {children}
      </div>
      <div className="flex items-center">
        {/* Vertical Connector */}
        <div 
          className={cn(
            "w-4 sm:w-6 border-y-2 border-primary/40", 
            side === 'left' ? 'border-r-2 rounded-r-lg' : 'border-l-2 rounded-l-lg'
          )} 
          style={{ height: '50%' }} 
        />
        {/* Horizontal Connector to parent match */}
        <div className="w-3 sm:w-5 border-b-2 border-primary/40" />
      </div>
      <div className="flex items-center py-2">
        <MatchBox match={match} isAr={isAr} />
      </div>
    </div>
  );
}

function MatchBox({ match, isAr, isFinal = false }: { match: BracketMatch, isAr: boolean, isFinal?: boolean }) {
  const t1 = match.team1Id ? teamsData[match.team1Id as keyof typeof teamsData] : null;
  const t2 = match.team2Id ? teamsData[match.team2Id as keyof typeof teamsData] : null;

  const renderTeam = (t: Team | null, isWinner: boolean) => (
    <div className={cn(
      "flex items-center justify-between gap-2 px-3 py-1.5 min-w-[120px] sm:min-w-[140px] bg-background/60 backdrop-blur-sm border border-border/50 transition-colors",
      isWinner && "bg-primary/20 border-primary/50 text-foreground"
    )}>
      <div className="flex items-center gap-2 overflow-hidden">
        <div className={cn("w-5 h-5 rounded-full overflow-hidden shrink-0 ring-1 ring-border", isWinner && "ring-primary")}>
          {t ? (
            <img src={t.flag} alt={t.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Flag className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className={cn(
          "text-xs sm:text-sm font-bold truncate",
          !t && "text-muted-foreground",
          isAr && "font-arabic"
        )}>
          {t ? t.name : 'TBD'}
        </span>
      </div>
      {match.score1 !== null && match.score2 !== null && (
         <span className="text-xs font-bold font-mono">
           {t === t1 ? match.score1 : match.score2}
         </span>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col rounded-md overflow-hidden shadow-lg border-2",
      isFinal ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)] scale-110" : "border-transparent ring-1 ring-border"
    )}>
      {renderTeam(t1, match.winnerId === match.team1Id && match.winnerId !== null)}
      <div className="h-px bg-border/50 w-full" />
      {renderTeam(t2, match.winnerId === match.team2Id && match.winnerId !== null)}
    </div>
  );
}
