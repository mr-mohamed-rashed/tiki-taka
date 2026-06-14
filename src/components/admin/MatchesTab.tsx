import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save, Loader2, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useResults } from '@/hooks/useFootballData';

export function MatchesTab() {
  const { data: finished = [], isLoading, refetch } = useResults();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const handleSave = async (matchId: string) => {
    const url = urls[matchId];
    if (url === undefined) return; // Not changed

    setSavingId(matchId);
    await supabase.from('match_highlights' as any).upsert({ 
      match_id: matchId, 
      highlight_url: url 
    });
    setSavingId(null);
    refetch(); // Refetch to get updated highlights
  };

  const handleUrlChange = (matchId: string, val: string) => {
    setUrls(prev => ({ ...prev, [matchId]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display">إدارة المباريات (الأرشيف)</h2>
          <p className="text-muted-foreground text-sm">المباريات التي انتهت من الـ API، قم بإضافة رابط ملخص (يوتيوب) لكل مباراة.</p>
        </div>
      </div>

      <Card className="p-6 border-border bg-card/50 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : finished.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">لا توجد مباريات منتهية حتى الآن.</p>
        ) : (
          <div className="space-y-4">
            {finished.map(match => (
              <div key={match.id} className="flex flex-col xl:flex-row items-center justify-between p-4 border border-border/60 rounded-lg bg-background gap-4">
                <div className="flex items-center gap-4 min-w-[300px]">
                  <div className="text-center w-16">
                    <Badge variant="outline">
                      {match.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 font-bold">
                    <span>{match.home.name}</span>
                    <span className="text-xl text-primary">{match.homeScore} - {match.awayScore}</span>
                    <span>{match.away.name}</span>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center gap-2 w-full max-w-lg">
                  <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input 
                    placeholder="رابط الملخص (https://youtube.com/...)" 
                    dir="ltr"
                    defaultValue={match.highlight_url || ''}
                    onChange={(e) => handleUrlChange(match.id, e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave(match.id)}
                    disabled={savingId === match.id}
                    className="shrink-0 gap-2"
                  >
                    {savingId === match.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
