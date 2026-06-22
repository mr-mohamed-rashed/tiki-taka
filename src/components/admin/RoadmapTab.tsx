import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Save, Loader2, Trophy, Lock, Unlock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { teams } from '@/lib/footballData';
import { BracketState, getDefaultBracket, advanceTeam, BracketMatch } from '@/lib/bracket';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function RoadmapTab() {
  const [bracket, setBracket] = useState<BracketState>(getDefaultBracket());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing settings
  useEffect(() => {
    async function loadRoadmap() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value_en')
          .eq('key', 'tournament_bracket')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading bracket:', error);
        } else if (data && data.value_en) {
          try {
            const parsed = JSON.parse(data.value_en);
            if (parsed && parsed.matches) {
              setBracket(parsed);
            }
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

  const teamsArray = Object.values(teams).sort((a, b) => a.name.localeCompare(b.name));

  const renderMatchRow = (match: BracketMatch) => {
    const t1 = match.team1Id ? teams[match.team1Id as keyof typeof teams] : null;
    const t2 = match.team2Id ? teams[match.team2Id as keyof typeof teams] : null;
    
    // For R32 and unlocked, allow selecting teams
    if (match.round === 'r32' && !bracket.isLocked) {
      return (
        <div key={match.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 p-3 rounded-lg border border-border/50 bg-background/50">
          <Select value={match.team1Id || 'empty'} onValueChange={(val) => handleTeam1Change(match.id, val)} dir="rtl">
            <SelectTrigger className="w-full font-arabic text-sm h-9">
              <SelectValue placeholder="اختر المنتخب الأول..." />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="empty" className="text-muted-foreground font-arabic">غير محدد</SelectItem>
              {teamsArray.map((team) => (
                <SelectItem key={team.id} value={team.id} className="font-arabic font-semibold flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <img src={team.flag} alt={team.name} className="h-3 w-4 rounded-sm object-cover" />
                    <span>{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-xs font-bold text-muted-foreground text-center">VS</span>

          <Select value={match.team2Id || 'empty'} onValueChange={(val) => handleTeam2Change(match.id, val)} dir="rtl">
            <SelectTrigger className="w-full font-arabic text-sm h-9">
              <SelectValue placeholder="اختر المنتخب الثاني..." />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="empty" className="text-muted-foreground font-arabic">غير محدد</SelectItem>
              {teamsArray.map((team) => (
                <SelectItem key={team.id} value={team.id} className="font-arabic font-semibold flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <img src={team.flag} alt={team.name} className="h-3 w-4 rounded-sm object-cover" />
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
    return (
      <div key={match.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-background/50">
        <div className="flex justify-between items-center text-sm font-arabic">
          <div className="flex items-center gap-2 flex-1">
            {t1 ? (
              <div className="flex items-center gap-2">
                <img src={t1.flag} className="w-4 h-3 rounded-sm object-cover" />
                <span className="font-bold text-foreground">{t1.name}</span>
              </div>
            ) : <span className="text-muted-foreground">غير محدد</span>}
          </div>
          <span className="text-xs font-bold text-muted-foreground mx-4">VS</span>
          <div className="flex items-center justify-end gap-2 flex-1 text-left">
            {t2 ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{t2.name}</span>
                <img src={t2.flag} className="w-4 h-3 rounded-sm object-cover" />
              </div>
            ) : <span className="text-muted-foreground">غير محدد</span>}
          </div>
        </div>

        {bracket.isLocked && (t1 || t2) && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground font-arabic">الفائز:</span>
            <Select value={match.winnerId || 'empty'} onValueChange={(val) => handleSetWinner(match.id, val === 'empty' ? null : val)} dir="rtl">
              <SelectTrigger className="w-[200px] font-arabic text-sm h-8 bg-background">
                <SelectValue placeholder="اختر الفائز..." />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="empty" className="text-muted-foreground font-arabic">إلغاء الفائز</SelectItem>
                {t1 && (
                  <SelectItem value={t1.id} className="font-arabic font-semibold">
                    {t1.name}
                  </SelectItem>
                )}
                {t2 && (
                  <SelectItem value={t2.id} className="font-arabic font-semibold">
                    {t2.name}
                  </SelectItem>
                )}
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

  const matchesByRound = {
    r32: Object.values(bracket.matches).filter(m => m.round === 'r32').sort((a,b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1))),
    r16: Object.values(bracket.matches).filter(m => m.round === 'r16').sort((a,b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1))),
    qf: Object.values(bracket.matches).filter(m => m.round === 'qf').sort((a,b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1))),
    sf: Object.values(bracket.matches).filter(m => m.round === 'sf').sort((a,b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1))),
    final: Object.values(bracket.matches).filter(m => m.round === 'final'),
  };

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

      <Card className="p-4 sm:p-6 bg-card border-border flex items-center justify-between">
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
      </Card>

      <div className="space-y-8">
        <div className="space-y-3">
          <h4 className="font-bold text-lg font-arabic border-b border-border pb-2">دور الـ 32</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matchesByRound.r32.map(renderMatchRow)}
          </div>
        </div>
        
        {bracket.isLocked && (
          <>
            <div className="space-y-3">
              <h4 className="font-bold text-lg font-arabic border-b border-border pb-2">دور الـ 16</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matchesByRound.r16.map(renderMatchRow)}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-lg font-arabic border-b border-border pb-2">ربع النهائي</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matchesByRound.qf.map(renderMatchRow)}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-lg font-arabic border-b border-border pb-2">نصف النهائي</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matchesByRound.sf.map(renderMatchRow)}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-lg font-arabic border-b border-border pb-2">النهائي</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matchesByRound.final.map(renderMatchRow)}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
