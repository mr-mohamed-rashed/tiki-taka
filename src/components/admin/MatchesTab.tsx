import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ManualMatch } from '@/types/database';

export function MatchesTab() {
  const [matches, setMatches] = useState<ManualMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('manual_matches' as any).select('*').order('date', { ascending: false });
    if (!error && data) {
      setMatches(data as ManualMatch[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    await supabase.from('manual_matches' as any).delete().eq('id', id);
    fetchMatches();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMatch = {
      competition: 'FIFA World Cup 2026',
      stage: formData.get('stage') as string || 'Group Stage',
      date: formData.get('date') as string || new Date().toISOString(),
      status: formData.get('status') as any || 'upcoming',
      home_team_id: 'HOME',
      home_team_name: formData.get('home_team_name') as string,
      home_team_flag: 'https://flagcdn.com/w160/sa.png', // Default
      home_score: parseInt(formData.get('home_score') as string) || 0,
      away_team_id: 'AWAY',
      away_team_name: formData.get('away_team_name') as string,
      away_team_flag: 'https://flagcdn.com/w160/eg.png', // Default
      away_score: parseInt(formData.get('away_score') as string) || 0,
      venue: formData.get('venue') as string || 'TBD',
      minute: formData.get('minute') as string || '',
      highlight_url: formData.get('highlight_url') as string || '',
    };

    if (editingId) {
      await supabase.from('manual_matches' as any).update(newMatch).eq('id', editingId);
    } else {
      await supabase.from('manual_matches' as any).insert(newMatch);
    }
    
    setIsAdding(false);
    setEditingId(null);
    fetchMatches();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display">إدارة المباريات (الأرشيف)</h2>
          <p className="text-muted-foreground text-sm">أضف المباريات يدوياً وتحكم في النتيجة وروابط الملخصات.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة مباراة
        </Button>
      </div>

      <Card className="p-6 border-border bg-card/50 shadow-sm">
        {loading ? (
          <p className="text-center py-4">جاري التحميل...</p>
        ) : matches.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">لا توجد مباريات مضافة بعد. اضغط على إضافة مباراة للبدء.</p>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border/60 rounded-lg bg-background">
                <div className="flex items-center gap-4">
                  <div className="text-center w-16">
                    <Badge variant="outline" className={match.status === 'live' ? 'bg-live/10 text-live border-live/30' : ''}>
                      {match.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 font-bold">
                    <span>{match.home_team_name}</span>
                    <span className="text-xl text-primary">{match.home_score} - {match.away_score}</span>
                    <span>{match.away_team_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(match.id)}>
                    <Edit className="h-4 w-4 ml-2" /> تعديل
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(match.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* Form Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-card border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{editingId ? 'تعديل مباراة' : 'إضافة مباراة جديدة'}</h3>
                <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                {(() => {
                  const match = matches.find(m => m.id === editingId);
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الفريق الأول (Home)</label>
                        <Input name="home_team_name" required defaultValue={match?.home_team_name} placeholder="مثال: السعودية" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الفريق الثاني (Away)</label>
                        <Input name="away_team_name" required defaultValue={match?.away_team_name} placeholder="مثال: الأرجنتين" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">النتيجة (Home)</label>
                        <Input name="home_score" type="number" defaultValue={match?.home_score ?? 0} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">النتيجة (Away)</label>
                        <Input name="away_score" type="number" defaultValue={match?.away_score ?? 0} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">تاريخ المباراة</label>
                        <Input name="date" type="datetime-local" defaultValue={match?.date ? new Date(match.date).toISOString().slice(0,16) : ''} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الحالة</label>
                        <select name="status" defaultValue={match?.status ?? 'upcoming'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option value="upcoming">لم تبدأ (Upcoming)</option>
                          <option value="live">مباشر (Live)</option>
                          <option value="finished">انتهت (Finished)</option>
                        </select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium">الدقيقة (إذا كانت مباشر)</label>
                        <Input name="minute" defaultValue={match?.minute ?? ''} placeholder="مثال: 45' أو 90+2" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium">رابط الملخص (Highlight URL)</label>
                        <Input name="highlight_url" defaultValue={match?.highlight_url ?? ''} placeholder="https://youtube.com/..." dir="ltr" />
                      </div>
                    </div>
                  );
                })()}
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                    إلغاء
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> حفظ المباراة
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
