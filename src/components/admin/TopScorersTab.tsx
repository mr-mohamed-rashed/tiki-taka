import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PlayerStat {
  id: string;
  player_name: string;
  team_name: string;
  goals: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
}

export function TopScorersTab() {
  const [scorers, setScorers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [bulking, setBulking] = useState(false);
  const [importType, setImportType] = useState<'goals' | 'assists' | 'motm' | 'cards'>('goals');

  const [form, setForm] = useState({
    player_name: '',
    team_name: '',
    goals: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0
  });

  const handleBulkInsert = async () => {
    if (!bulkText) return;
    setBulking(true);
    try {
      const text = bulkText.replace(/\s+/g, ' ');
      
      const findMarker = (txt: string, marker: string, startFrom: number) => {
        let pos = startFrom;
        while (true) {
          pos = txt.indexOf(marker, pos);
          if (pos === -1) return -1;
          const after = txt.slice(pos + marker.length, pos + marker.length + 1);
          if (/[\u0600-\u06FFa-zA-Z]/.test(after)) {
            return pos;
          }
          pos += 1;
        }
      };

      const parsedPlayers: any[] = [];
      let lastFoundIndex = 0;

      for (let i = 1; i <= 145; i++) {
        const currentMarker = i.toString();
        const nextMarker = (i + 1).toString();
        
        const startIdx = findMarker(text, currentMarker, lastFoundIndex);
        if (startIdx === -1) continue;
        
        lastFoundIndex = startIdx + currentMarker.length;
        
        let endIdx = findMarker(text, nextMarker, lastFoundIndex);
        if (i === 145) {
          endIdx = text.length;
        }
        
        if (endIdx === -1) continue;
        
        const segment = text.slice(startIdx + currentMarker.length, endIdx).trim();
        const goalsMatch = segment.match(/(\d+)$/);
        if (!goalsMatch) continue;
        
        const goals = parseInt(goalsMatch[1]);
        const rest = segment.slice(0, segment.length - goalsMatch[1].length).trim();
        
        let teamName = "";
        let playerName = "";
        
        for (let len = 2; len <= Math.floor(rest.length / 2); len++) {
          const endPart1 = rest.slice(rest.length - len);
          const endPart2 = rest.slice(rest.length - len * 2, rest.length - len);
          if (endPart1.replace(/\s/g, '') === endPart2.replace(/\s/g, '')) {
            teamName = endPart1.trim();
            playerName = rest.slice(0, rest.length - len * 2).trim();
          }
        }
        
        if (!teamName) {
          teamName = rest.slice(Math.floor(rest.length * 0.5)).trim();
          playerName = rest.slice(0, Math.floor(rest.length * 0.5)).trim();
        }
        
        // Clean duplicate team names
        teamName = teamName
          .replace(/(السنغال)\s*(السنغال)?/g, '$1')
          .replace(/(المغرب)\s*(المغرب)?/g, '$1')
          .replace(/(جنوب أفريقيا)\s*(جنوب أفريقيا)?/g, '$1')
          .replace(/(الكونغو الديمقراطية)\s*(الكونغو الديمقراطية)?/g, '$1')
          .replace(/(البوسنة والهرسك)\s*(البوسنة والهرسك)?/g, '$1')
          .replace(/(ألمانيا)\s*(ألمانيا)?/g, '$1')
          .replace(/(الأرجنتين)\s*(الأرجنتين)?/g, '$1')
          .replace(/(فرنسا)\s*(فرنسا)?/g, '$1')
          .replace(/(السويد)\s*(السويد)?/g, '$1');
          
        if (playerName === 'الفارو فيد' && teamName === 'الغوالمكسيك') {
          playerName = 'الفارو فيدالغو';
          teamName = 'المكسيك';
        }
        if (playerName === 'جاسم ياسينا' && teamName === 'لمغرب المغرب') {
          playerName = 'جاسم ياسين';
          teamName = 'المغرب';
        }

        const payload: any = {
          player_name: playerName,
          team_name: teamName,
          goals: 0,
          assists: 0,
          yellow_cards: 0,
          red_cards: 0,
          motm_awards: 0
        };

        if (importType === 'goals') {
          payload.goals = goals;
        } else if (importType === 'assists') {
          payload.assists = goals; // number is parsed at the end
        } else if (importType === 'motm') {
          payload.motm_awards = goals;
        } else if (importType === 'cards') {
          const numStr = goals.toString();
          if (numStr.length === 1) {
            payload.yellow_cards = parseInt(numStr);
          } else if (numStr.length >= 2) {
            payload.yellow_cards = parseInt(numStr[0]);
            payload.red_cards = parseInt(numStr[1]);
          }
        }

        parsedPlayers.push(payload);
      }

      if (parsedPlayers.length === 0) {
        toast({ title: 'لم يتم العثور على أي بيانات لتسجيلها', variant: 'destructive' });
        setBulking(false);
        return;
      }

      // Always clear the database table first for a completely fresh start
      await supabase.from('player_stats').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert in chunks of 50
      for (let i = 0; i < parsedPlayers.length; i += 50) {
        const chunk = parsedPlayers.slice(i, i + 50);
        const { error } = await supabase.from('player_stats').insert(chunk);
        if (error) {
          console.error('Error inserting chunk:', error);
          toast({ title: 'فشل إدخال بعض البيانات', description: error.message, variant: 'destructive' });
        }
      }
      
      toast({ title: `تمت مسح وإعادة ترتيب ${parsedPlayers.length} سجل بنجاح في قاعدة البيانات!` });
      setBulkText('');
      fetchScorers();
    } catch (e: any) {
      toast({ title: 'حدث خطأ أثناء المعالجة والحفظ', description: e.message, variant: 'destructive' });
    }
    setBulking(false);
  };

  const fetchScorers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('player_stats')
      .select('id, player_name, team_name, goals, assists, yellow_cards, red_cards')
      .order('goals', { ascending: false });
      
    if (error) {
      console.error('Error fetching scorers:', error);
    } else {
      setScorers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScorers();
  }, []);

  const handleSubmit = async () => {
    if (!form.player_name || !form.team_name) return;
    setSaving(true);
    
    if (editingId) {
      const { error } = await supabase
        .from('player_stats')
        .update(form)
        .eq('id', editingId);
        
      if (error) {
        toast({ title: 'فشل التعديل', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'تم التعديل بنجاح' });
        setEditingId(null);
        setForm({ player_name: '', team_name: '', goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });
        fetchScorers();
      }
    } else {
      // Check if the player already exists (by name and team) to prevent duplicate key constraint failure
      const { data: existing } = await supabase
        .from('player_stats')
        .select('id')
        .eq('player_name', form.player_name)
        .eq('team_name', form.team_name)
        .maybeSingle();
        
      if (existing) {
        // Player exists! Update the existing record instead of inserting a new one
        const { error } = await supabase
          .from('player_stats')
          .update(form)
          .eq('id', existing.id);
          
        if (error) {
          toast({ title: 'فشل تحديث بيانات اللاعب', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'تم تحديث بيانات اللاعب الحالي بنجاح' });
          setForm({ player_name: '', team_name: '', goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });
          fetchScorers();
        }
      } else {
        // Insert new player
        const { error } = await supabase
          .from('player_stats')
          .insert([form]);
          
        if (error) {
          toast({ title: 'فشل الإضافة', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'تمت الإضافة بنجاح' });
          setForm({ player_name: '', team_name: '', goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });
          fetchScorers();
        }
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('player_stats').delete().eq('id', id);
    if (error) {
      toast({ title: 'فشل الحذف', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم الحذف' });
      fetchScorers();
    }
  };

  const startEdit = (scorer: PlayerStat) => {
    setEditingId(scorer.id);
    setForm({
      player_name: scorer.player_name,
      team_name: scorer.team_name,
      goals: scorer.goals,
      assists: scorer.assists || 0,
      yellow_cards: scorer.yellow_cards || 0,
      red_cards: scorer.red_cards || 0
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/25 bg-gradient-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold">إدارة الهدافين</h3>
          <p className="text-sm text-muted-foreground">أضف أو عدل بيانات هدافي البطولة.</p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-primary">اسم اللاعب</Label>
            <Input
              value={form.player_name}
              onChange={(e) => setForm({ ...form, player_name: e.target.value })}
              placeholder="مثال: ميسي"
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-primary">المنتخب</Label>
            <Input
              value={form.team_name}
              onChange={(e) => setForm({ ...form, team_name: e.target.value })}
              placeholder="مثال: الأرجنتين"
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-primary">الأهداف</Label>
            <Input
              type="number"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: parseInt(e.target.value) || 0 })}
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-primary">الأسيست</Label>
            <Input
              type="number"
              value={form.assists}
              onChange={(e) => setForm({ ...form, assists: parseInt(e.target.value) || 0 })}
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-yellow-500">بطاقات صفراء</Label>
            <Input
              type="number"
              value={form.yellow_cards}
              onChange={(e) => setForm({ ...form, yellow_cards: parseInt(e.target.value) || 0 })}
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-red-500">بطاقات حمراء</Label>
            <Input
              type="number"
              value={form.red_cards}
              onChange={(e) => setForm({ ...form, red_cards: parseInt(e.target.value) || 0 })}
              className="h-11"
            />
          </div>
          
          <div className="flex gap-2 sm:col-span-3 lg:col-span-1 lg:col-start-1 lg:col-end-4">
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.player_name || !form.team_name}
              className="h-11 flex-1 gap-2 font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
              {editingId ? 'حفظ التعديلات' : 'إضافة لاعب'}
            </Button>
            {editingId && (
              <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); setForm({ player_name: '', team_name: '', goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 }); }}>
                إلغاء
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-primary/25 bg-gradient-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold">إدخال البيانات دفعة واحدة (Bulk Import)</h3>
          <p className="text-sm text-muted-foreground">اختر نوع القائمة التي تريد إدخالها، ثم الصق النص الكامل وسيقوم الموقع بمعالجتها وتحديثها فوراً.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="font-arabic font-bold text-primary">نوع القائمة المدخلة</Label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as any)}
              className="flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="goals">قائمة الهدافين (الأهداف)</option>
              <option value="assists">قائمة صناع اللعب (الأسيست)</option>
              <option value="motm">قائمة رجل المباراة (أفضل لاعب)</option>
              <option value="cards">قائمة الإنذارات والبطاقات (أصفر/أحمر)</option>
            </select>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="انسخ والصق النص الكامل هنا (مثال: 1ليونيل ميسيالأرجنتينالأرجنتين62عثمان ديمبيليفرنسافرنسا4...)"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            dir="rtl"
          />
          <Button
            onClick={handleBulkInsert}
            disabled={bulking || !bulkText}
            className="w-full h-11 font-semibold bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {bulking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            معالجة وحفظ جميع الهدافين الآن
          </Button>
        </div>
      </Card>

      <Card className="border-border bg-card">
        <div className="p-4 border-b border-border font-bold">
          قائمة الهدافين الحالية
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : scorers.length > 0 ? (
            scorers.map((scorer) => (
              <div key={scorer.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-bold text-foreground">{scorer.player_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {scorer.team_name} • {scorer.goals} أهداف • {scorer.assists || 0} أسيست 
                    • <span className="text-yellow-500 ml-1">{scorer.yellow_cards || 0} أصفر</span> 
                    • <span className="text-red-500">{scorer.red_cards || 0} أحمر</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(scorer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(scorer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">لا يوجد لاعبين مضافين بعد.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
