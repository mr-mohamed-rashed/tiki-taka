import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Trash2, Ban, Plus, X } from 'lucide-react';

interface ProfanityLog {
  id: string;
  user_id: string;
  username: string;
  original_message: string;
  created_at: string;
}

export function ChatModerationTab() {
  const [logs, setLogs] = useState<ProfanityLog[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    fetchBannedWords();
    
    // Subscribe to new logs and banned words
    const channel = supabase.channel('moderation_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_profanity_logs' }, () => {
        fetchLogs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_banned_words' }, () => {
        fetchBannedWords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBannedWords = async () => {
    try {
      const { data, error } = await supabase.from('chat_banned_words').select('word').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setBannedWords(data.map(d => d.word));
    } catch (err) {
      console.error('Error fetching banned words:', err);
    }
  };

  const handleAddWord = async () => {
    const word = newWord.trim();
    if (!word) return;
    try {
      const { error } = await supabase.from('chat_banned_words').insert({ word });
      if (error) throw error;
      setNewWord('');
    } catch (err) {
      console.error('Error adding banned word:', err);
      alert('حدث خطأ أثناء إضافة الكلمة. تأكد أنها غير موجودة مسبقاً.');
    }
  };

  const handleRemoveWord = async (word: string) => {
    if (!window.confirm(`هل أنت متأكد من مسح كلمة "${word}" من قائمة الحظر؟`)) return;
    try {
      const { error } = await supabase.from('chat_banned_words').delete().eq('word', word);
      if (error) throw error;
    } catch (err) {
      console.error('Error removing banned word:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_profanity_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setLogs(data as ProfanityLog[]);
    } catch (err) {
      console.error('Error fetching profanity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, username: string, logId: string) => {
    if (!window.confirm(`هل أنت متأكد من حظر المستخدم ${username}؟`)) return;
    
    try {
      // Add or update to chat_users as banned
      const { data: existingUser } = await supabase
        .from('chat_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (!existingUser) {
        await supabase.from('chat_users').insert({ user_id: userId, is_banned: true, username: username });
      } else {
        await supabase.from('chat_users').update({ is_banned: true }).eq('user_id', userId);
      }

      // Delete the log after banning
      await handleDeleteLog(logId, false);
      alert('تم حظر المستخدم بنجاح');
    } catch (err) {
      console.error('Error banning user:', err);
      alert('حدث خطأ أثناء الحظر');
    }
  };

  const handleDeleteLog = async (logId: string, askConfirm = true) => {
    if (askConfirm && !window.confirm('هل أنت متأكد من مسح هذا السجل؟')) return;
    try {
      await supabase.from('chat_profanity_logs').delete().eq('id', logId);
      setLogs(logs.filter(log => log.id !== logId));
    } catch (err) {
      console.error('Error deleting log:', err);
    }
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 font-arabic text-right justify-end">
          مراقبة الشات (الألفاظ الخارجة)
          <Shield className="w-6 h-6 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Banned Words Management Section */}
        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="font-arabic font-bold text-lg mb-4 text-right flex items-center justify-end gap-2">
            قائمة الكلمات المحظورة
            <Ban className="w-5 h-5 text-destructive" />
          </h3>
          
          <div className="flex gap-2 mb-6 justify-end">
            <Button onClick={handleAddWord} className="shrink-0 gap-2 font-arabic">
              <Plus className="w-4 h-4" />
              إضافة كلمة
            </Button>
            <Input 
              placeholder="اكتب الكلمة هنا..." 
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
              className="text-right font-arabic max-w-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {bannedWords.map(word => (
              <div key={word} className="bg-destructive/10 border border-destructive/20 text-foreground px-3 py-1.5 rounded-full flex items-center gap-2 font-arabic group transition-colors hover:bg-destructive/20">
                <button 
                  onClick={() => handleRemoveWord(word)}
                  className="text-muted-foreground hover:text-destructive focus:outline-none p-0.5 rounded-full hover:bg-destructive/10"
                  title="مسح"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="mb-0.5">{word}</span>
              </div>
            ))}
            {bannedWords.length === 0 && (
              <p className="text-muted-foreground font-arabic w-full text-right">لا توجد كلمات محظورة حالياً.</p>
            )}
          </div>
        </div>

        {/* Profanity Logs Section */}
        <div>
          <h3 className="font-arabic font-bold text-lg mb-4 text-right">سجل محاولات الشتائم</h3>
          {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground font-arabic">
            لا توجد سجلات حالياً. الشات نظيف!
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="bg-background border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex-1 text-right w-full">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                      ID: {log.user_id.slice(0, 15)}...
                    </span>
                    <span className="font-bold text-foreground">{log.username}</span>
                  </div>
                  <p className="text-destructive font-arabic bg-destructive/10 p-3 rounded-lg border border-destructive/20 inline-block w-full md:w-auto text-right">
                    "{log.original_message}"
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(log.created_at).toLocaleString('ar-EG')}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    مسح السجل
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleBanUser(log.user_id, log.username, log.id)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    حظر المستخدم
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
