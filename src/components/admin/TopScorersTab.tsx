import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SectionTitle } from './SectionTitle';

interface PlayerStat {
  id: string;
  player_name: string;
  team_name: string;
  goals: number;
}

export function TopScorersTab() {
  const [scorers, setScorers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    player_name: '',
    team_name: '',
    goals: 0
  });

  const fetchScorers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('player_stats')
      .select('id, player_name, team_name, goals')
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
        setForm({ player_name: '', team_name: '', goals: 0 });
        fetchScorers();
      }
    } else {
      const { error } = await supabase
        .from('player_stats')
        .insert([form]);
        
      if (error) {
        toast({ title: 'فشل الإضافة', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'تمت الإضافة بنجاح' });
        setForm({ player_name: '', team_name: '', goals: 0 });
        fetchScorers();
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
      goals: scorer.goals
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/25 bg-gradient-card p-5">
        <SectionTitle
          title="إدارة الهدافين"
          description="أضف أو عدل بيانات هدافي البطولة."
        />
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
          
          <div className="flex gap-2 sm:col-span-3">
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.player_name || !form.team_name}
              className="h-11 flex-1 gap-2 font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
              {editingId ? 'حفظ التعديلات' : 'إضافة لاعب'}
            </Button>
            {editingId && (
              <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); setForm({ player_name: '', team_name: '', goals: 0 }); }}>
                إلغاء
              </Button>
            )}
          </div>
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
                  <div className="text-sm text-muted-foreground">{scorer.team_name} • {scorer.goals} أهداف</div>
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
