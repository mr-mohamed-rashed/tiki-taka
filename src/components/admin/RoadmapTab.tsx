import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Save, Loader2, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { teams } from '@/lib/footballData';

export function RoadmapTab() {
  const [slots, setSlots] = useState<string[]>(Array(32).fill(''));
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
          .eq('key', 'roadmap_qualified_teams')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading roadmap slots:', error);
        } else if (data && data.value_en) {
          try {
            const parsed = JSON.parse(data.value_en);
            if (Array.isArray(parsed) && parsed.length === 32) {
              setSlots(parsed);
            }
          } catch (e) {
            console.error('Failed to parse roadmap slots', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  const handleSlotChange = (index: number, teamId: string) => {
    const newSlots = [...slots];
    newSlots[index] = teamId === 'empty' ? '' : teamId;
    setSlots(newSlots);
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'roadmap_qualified_teams',
          value_en: JSON.stringify(slots),
          value_ar: JSON.stringify(slots),
        },
        { onConflict: 'key' }
      );

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Error saving roadmap slots:', e);
      alert('حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  const teamsArray = Object.values(teams).sort((a, b) => a.name.localeCompare(b.name));

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            طريق كأس العالم
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-arabic">
            حدد المنتخبات المتأهلة الـ 32 ليتم عرضها في صفحة طريق كأس العالم.
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

      <Card className="p-4 sm:p-6 bg-card border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slots.map((slotTeamId, index) => (
            <div key={index} className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
              <label className="text-xs font-bold text-muted-foreground font-arabic flex justify-between">
                <span>متأهل {index + 1}</span>
              </label>
              <Select value={slotTeamId || 'empty'} onValueChange={(val) => handleSlotChange(index, val)} dir="rtl">
                <SelectTrigger className="w-full font-arabic text-sm h-9">
                  <SelectValue placeholder="اختر المنتخب..." />
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
          ))}
        </div>
      </Card>
    </div>
  );
}
