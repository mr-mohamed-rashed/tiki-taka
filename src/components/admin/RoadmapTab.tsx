import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Save, Loader2, Trophy, Lock, Unlock, RefreshCw, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { teams as teamsData, Team } from '@/lib/footballData';
import { BracketState, getDefaultBracket, advanceTeam, BracketMatch } from '@/lib/bracket';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useResults } from '@/hooks/useFootballData';
import { cn } from '@/lib/utils';

export function RoadmapTab() {
  const [bracket, setBracket] = useState<BracketState>(getDefaultBracket());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { data: finished = [] } = useResults();

  // Load existing settings
  useEffect(() => {
    async function loadRoadmap() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value_ar')
          .eq('key', 'tournament_bracket')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading bracket:', error);
        } else if (data && data.value_ar) {
          try {
            const parsed = JSON.parse(data.value_ar) as BracketState;
            
            // Patch missing m32 (3rd place match) if loading an older bracket
            if (!parsed.matches['m32']) {
               parsed.matches['m32'] = {
                 id: 'm32',
                 round: '3rd',
                 team1Id: null,
                 team2Id: null,
                 score1: null,
                 score2: null,
                 winnerId: null,
                 nextMatchId: null
               };
            }
            
            setBracket(parsed);
          } catch (e) {
            console.error('Failed to parse bracket', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'tournament_bracket',
          value_en: JSON.stringify(bracket),
          value_ar: JSON.stringify(bracket),
        },
        { onConflict: 'key' }
      );

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Error saving bracket:', e);
      alert('حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTeam1Change = (matchId: string, teamId: string) => {
    setBracket(prev => {
      const b = JSON.parse(JSON.stringify(prev)) as BracketState;
      b.matches[matchId].team1Id = teamId === 'empty' ? null : teamId;
      // If winner was this team, clear it
      if (b.matches[matchId].winnerId && b.matches[matchId].winnerId !== b.matches[matchId].team1Id && b.matches[matchId].winnerId !== b.matches[matchId].team2Id) {
        return advanceTeam(b, matchId, null);
      }
      return b;
    });
    setSaved(false);
  };

  const handleTeam2Change = (matchId: string, teamId: string) => {
    setBracket(prev => {
      const b = JSON.parse(JSON.stringify(prev)) as BracketState;
      b.matches[matchId].team2Id = teamId === 'empty' ? null : teamId;
      if (b.matches[matchId].winnerId && b.matches[matchId].winnerId !== b.matches[matchId].team1Id && b.matches[matchId].winnerId !== b.matches[matchId].team2Id) {
        return advanceTeam(b, matchId, null);
      }
      return b;
    });
    setSaved(false);
  };

  const handleSetWinner = (matchId: string, winnerId: string | null) => {
    setBracket(prev => advanceTeam(prev, matchId, winnerId));
    setSaved(false);
  };

  const handleSyncResults = () => {
    setIsSyncing(true);
    let newState = { ...bracket };
    let changed = false;

    for (const [id, match] of Object.entries(newState.matches)) {
      if (match.team1Id && match.team2Id && !match.winnerId) {
        const t1 = teamsData[match.team1Id as keyof typeof teamsData];
        const t2 = teamsData[match.team2Id as keyof typeof teamsData];
        
        if (t1 && t2) {
          const finishedMatch = finished.find(m => 
            (m.home.name === t1.name && m.away.name === t2.name) ||
            (m.home.name === t2.name && m.away.name === t1.name)
          );

          if (finishedMatch) {
            const isT1Home = finishedMatch.home.name === t1.name;
            const score1 = isT1Home ? finishedMatch.homeScore : finishedMatch.awayScore;
            const score2 = isT1Home ? finishedMatch.awayScore : finishedMatch.homeScore;
            
            newState.matches[id].score1 = score1;
            newState.matches[id].score2 = score2;
            
            let winnerId = null;
            if (score1 > score2) winnerId = match.team1Id;
            else if (score2 > score1) winnerId = match.team2Id;

            if (winnerId) {
              newState = advanceTeam(newState, id, winnerId);
              changed = true;
            }
          }
        }
      }
    }

    if (changed) {
      setBracket(newState);
      setSaved(false);
    }
    setIsSyncing(false);
  };

  const teamsArray = Object.values(teamsData).sort((a, b) => a.name.localeCompare(b.name));

  const renderMatchBox = (match: BracketMatch, isFinal = false) => {
    const t1 = match.team1Id ? teamsData[match.team1Id as keyof typeof teamsData] : null;
    const t2 = match.team2Id ? teamsData[match.team2Id as keyof typeof teamsData] : null;
    
    // For R32 and unlocked, allow selecting teams
    if (match.round === 'r32' && !bracket.isLocked) {
      return (
        <div className={cn(
          "flex flex-col gap-1 p-1 rounded-md bg-background shadow-sm w-[110px] sm:w-[130px] lg:w-[140px]",
          "border-2 border-border"
        )}>
          <Select value={match.team1Id || 'empty'} onValueChange={(val) => handleTeam1Change(match.id, val)} dir="rtl">
            <SelectTrigger className="w-full text-[10px] sm:text-xs h-7 px-2">
              <SelectValue placeholder="الفريق 1" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="empty" className="text-muted-foreground text-xs">غير محدد</SelectItem>
              {teamsArray.map((team) => (
                <SelectItem key={team.id} value={team.id} className="text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <img src={team.flag} className="h-2.5 w-3.5 rounded-[1px] object-cover" />
                    <span>{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 justify-center">
             <span className="text-[9px] font-bold text-muted-foreground">VS</span>
          </div>

          <Select value={match.team2Id || 'empty'} onValueChange={(val) => handleTeam2Change(match.id, val)} dir="rtl">
            <SelectTrigger className="w-full text-[10px] sm:text-xs h-7 px-2">
              <SelectValue placeholder="الفريق 2" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="empty" className="text-muted-foreground text-xs">غير محدد</SelectItem>
              {teamsArray.map((team) => (
                <SelectItem key={team.id} value={team.id} className="text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <img src={team.flag} className="h-2.5 w-3.5 rounded-[1px] object-cover" />
                    <span>{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Locked or advanced round: show the teams (if known) and allow picking the winner
    const renderTeam = (t: Team | null, isWinner: boolean) => (
      <div className={cn(
        "flex items-center justify-between gap-1 px-1.5 py-1 w-full transition-colors",
        isWinner ? "bg-primary/20 text-foreground" : "bg-muted/30"
      )}>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className={cn("w-4 h-4 rounded-full overflow-hidden shrink-0 ring-1 ring-border", isWinner && "ring-primary")}>
            {t ? (
              <img src={t.flag} alt={t.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Flag className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            )}
          </div>
          <span className={cn(
            "text-[10px] sm:text-[11px] font-bold truncate max-w-[60px] sm:max-w-[70px]",
            !t && "text-muted-foreground",
            "font-arabic"
          )}>
            {t ? t.shortName || t.name : 'TBD'}
          </span>
        </div>
        {match.score1 !== undefined && match.score2 !== undefined && match.score1 !== null && match.score2 !== null && (
         <span className="text-[9px] sm:text-[10px] font-bold font-mono">
           {t === t1 ? match.score1 : match.score2}
         </span>
        )}
      </div>
    );

    return (
      <div className={cn(
        "flex flex-col rounded-md shadow-sm border-2 w-[110px] sm:w-[130px] lg:w-[140px] overflow-visible bg-background",
        isFinal ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)] scale-110" : "border-border/50"
      )}>
        <div className="flex flex-col rounded-t-sm overflow-hidden">
          {renderTeam(t1, match.winnerId === match.team1Id && match.winnerId !== null)}
          <div className="h-px bg-border/50 w-full" />
          {renderTeam(t2, match.winnerId === match.team2Id && match.winnerId !== null)}
        </div>
        
        {bracket.isLocked && (t1 || t2) && (
          <div className="p-1 border-t border-border/50 bg-background rounded-b-sm">
            <Select value={match.winnerId || 'empty'} onValueChange={(val) => handleSetWinner(match.id, val === 'empty' ? null : val)} dir="rtl">
              <SelectTrigger className="w-full text-[9px] sm:text-[10px] h-6 px-1.5 bg-background border-primary/20 hover:border-primary/50">
                <SelectValue placeholder="اختر الفائز..." />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="empty" className="text-xs">إلغاء الفائز</SelectItem>
                {t1 && <SelectItem value={t1.id} className="text-xs font-semibold">{t1.name}</SelectItem>}
                {t2 && <SelectItem value={t2.id} className="text-xs font-semibold">{t2.name}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
  const thirdPlace = bracket.matches['m32'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            شجرة البطولة (المراحل الإقصائية)
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-arabic">
            اختر المنتخبات الـ 32 ثم أقفل الجدول لبدء محاكاة الصعود بناءً على الفائزين.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التعديلات
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500 border border-green-500/20">
          <CheckCircle className="h-5 w-5" />
          <span className="font-arabic font-semibold">تم الحفظ بنجاح!</span>
        </div>
      )}

      <Card className="p-4 sm:p-6 bg-card border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${bracket.isLocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {bracket.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <Label className="font-arabic text-base font-bold">قفل دور الـ 32</Label>
              <p className="text-xs text-muted-foreground font-arabic mt-1">
                عند التفعيل، لا يمكن تغيير الفرق الأساسية ويمكن فقط تحديد الفائزين للصعود.
              </p>
            </div>
          </div>
          <Switch 
            checked={bracket.isLocked} 
            onCheckedChange={(c) => { setBracket(p => ({...p, isLocked: c})); setSaved(false); }} 
            dir="ltr"
          />
        </div>
        
        {bracket.isLocked && (
          <div className="pt-4 border-t border-border flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-arabic">
              يمكنك مزامنة النتائج تلقائياً من صفحة المباريات لتصعيد الفائزين مباشرة.
            </p>
            <Button variant="outline" onClick={handleSyncResults} disabled={isSyncing || finished.length === 0} className="gap-2">
               <RefreshCw className={isSyncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
               مزامنة النتائج والصعود
            </Button>
          </div>
        )}
      </Card>

      <div className="w-full pb-8 overflow-x-auto">
        <div className="w-full min-w-[700px] flex justify-between items-stretch gap-1 sm:gap-2 py-4" dir="ltr">
          {/* Left Side */}
          <BracketNode match={m29} side="left" renderBox={renderMatchBox}>
            <BracketNode match={m25} side="left" renderBox={renderMatchBox}>
              <BracketNode match={m17} side="left" renderBox={renderMatchBox}>
                <BracketNode match={m1} side="left" renderBox={renderMatchBox} />
                <BracketNode match={m2} side="left" renderBox={renderMatchBox} />
              </BracketNode>
              <BracketNode match={m18} side="left" renderBox={renderMatchBox}>
                <BracketNode match={m3} side="left" renderBox={renderMatchBox} />
                <BracketNode match={m4} side="left" renderBox={renderMatchBox} />
              </BracketNode>
            </BracketNode>
            <BracketNode match={m26} side="left" renderBox={renderMatchBox}>
              <BracketNode match={m19} side="left" renderBox={renderMatchBox}>
                <BracketNode match={m5} side="left" renderBox={renderMatchBox} />
                <BracketNode match={m6} side="left" renderBox={renderMatchBox} />
              </BracketNode>
              <BracketNode match={m20} side="left" renderBox={renderMatchBox}>
                <BracketNode match={m7} side="left" renderBox={renderMatchBox} />
                <BracketNode match={m8} side="left" renderBox={renderMatchBox} />
              </BracketNode>
            </BracketNode>
          </BracketNode>

          {/* Center Final & 3rd Place */}
          <div className="flex flex-col items-center justify-center z-10 px-1 sm:px-2 gap-4 sm:gap-8">
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 border-primary/40 bg-primary/10 p-2 sm:p-3 mb-1 sm:mb-2">
                <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-arabic font-black text-[10px] sm:text-sm lg:text-lg text-primary mb-1 sm:mb-2">
                النهائي
              </h3>
              {renderMatchBox(final, true)}
            </div>

            {thirdPlace && (
              <div className="flex flex-col items-center mt-2 sm:mt-6">
                <h3 className="font-arabic font-bold text-[9px] sm:text-[11px] text-muted-foreground mb-1 sm:mb-2">
                  المركز الثالث
                </h3>
                {renderMatchBox(thirdPlace)}
              </div>
            )}
          </div>

          {/* Right Side */}
          <BracketNode match={m30} side="right" renderBox={renderMatchBox}>
            <BracketNode match={m27} side="right" renderBox={renderMatchBox}>
              <BracketNode match={m21} side="right" renderBox={renderMatchBox}>
                <BracketNode match={m9} side="right" renderBox={renderMatchBox} />
                <BracketNode match={m10} side="right" renderBox={renderMatchBox} />
              </BracketNode>
              <BracketNode match={m22} side="right" renderBox={renderMatchBox}>
                <BracketNode match={m11} side="right" renderBox={renderMatchBox} />
                <BracketNode match={m12} side="right" renderBox={renderMatchBox} />
              </BracketNode>
            </BracketNode>
            <BracketNode match={m28} side="right" renderBox={renderMatchBox}>
              <BracketNode match={m23} side="right" renderBox={renderMatchBox}>
                <BracketNode match={m13} side="right" renderBox={renderMatchBox} />
                <BracketNode match={m14} side="right" renderBox={renderMatchBox} />
              </BracketNode>
              <BracketNode match={m24} side="right" renderBox={renderMatchBox}>
                <BracketNode match={m15} side="right" renderBox={renderMatchBox} />
                <BracketNode match={m16} side="right" renderBox={renderMatchBox} />
              </BracketNode>
            </BracketNode>
          </BracketNode>
        </div>
      </div>
    </div>
  );
}

function BracketNode({ match, children, side, renderBox }: { match: BracketMatch, children?: React.ReactNode, side: 'left' | 'right', renderBox: (m: BracketMatch) => React.ReactNode }) {
  if (!children) {
    return (
      <div className="py-1 sm:py-2">
        {renderBox(match)}
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch", side === 'right' && "flex-row-reverse")}>
      <div className="flex flex-col justify-around">
        {children}
      </div>
      <div className="flex items-center">
        <div 
          className={cn(
            "w-2 sm:w-4 border-y-2 border-primary/40", 
            side === 'left' ? 'border-r-2 rounded-r-md' : 'border-l-2 rounded-l-md'
          )} 
          style={{ height: '50%' }} 
        />
        <div className="w-2 sm:w-3 border-b-2 border-primary/40" />
      </div>
      <div className="flex items-center py-1 sm:py-2">
        {renderBox(match)}
      </div>
    </div>
  );
}
