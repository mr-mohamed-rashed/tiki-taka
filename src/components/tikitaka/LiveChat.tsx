import { useState, useEffect, useRef } from 'react';
import { Send, Shield, Ban, Trash2, MessageCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  is_deleted: boolean;
  match_id: string;
  created_at: string;
}

interface ChatUser {
  user_id: string;
  username: string;
  is_moderator: boolean;
  is_banned: boolean;
}

// Simple random ID for anonymous chat (no auth required)
function getOrCreateUserId(): string {
  let id = localStorage.getItem('tiki-user-id');
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('tiki-user-id', id);
  }
  return id;
}

// Hardcoded moderator IDs for demo – in production, manage via the database
const MODERATOR_IDS = new Set(['mod_tiki_taka_admin']);

interface LiveChatProps {
  matchId?: string;
}

export function LiveChat({ matchId = 'general' }: LiveChatProps) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Map<string, ChatUser>>(new Map());
  const [inputMsg, setInputMsg] = useState('');
  const [username, setUsername] = useState(() => localStorage.getItem('tiki-username') ?? '');
  const [usernameInput, setUsernameInput] = useState('');
  const [joined, setJoined] = useState(() => !!localStorage.getItem('tiki-username'));
  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = getOrCreateUserId();
  const isModerator = MODERATOR_IDS.has(userId);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    if (!joined) return;
    supabase
      .from('chat_messages')
      .select('*')
      .eq('match_id', matchId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[]);
      });
  }, [matchId, joined]);

  // Real-time subscription
  useEffect(() => {
    if (!joined) return;
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        // Check if sender is banned
        const sender = users.get(msg.user_id);
        if (!sender?.is_banned) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const updated = payload.new as ChatMessage;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, joined, users]);

  const handleJoin = async () => {
    const name = usernameInput.trim();
    if (!name) return;
    setUsername(name);
    localStorage.setItem('tiki-username', name);

    await supabase.from('chat_users').upsert({
      user_id: userId,
      username: name,
      is_moderator: isModerator,
      is_banned: false,
    }, { onConflict: 'user_id' });

    setJoined(true);
  };

  const sendMessage = async () => {
    const text = inputMsg.trim();
    if (!text || !username) return;

    // Check if user is banned
    const { data: userRow } = await supabase
      .from('chat_users')
      .select('is_banned')
      .eq('user_id', userId)
      .maybeSingle();
    if (userRow?.is_banned) return;

    await supabase.from('chat_messages').insert({
      user_id: userId,
      username,
      message: text,
      match_id: matchId,
    });
    setInputMsg('');
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('chat_messages').update({ is_deleted: true }).eq('id', id);
  };

  const banUser = async (targetUserId: string) => {
    await supabase.from('chat_users').update({ is_banned: true }).eq('user_id', targetUserId);
    setUsers((prev) => {
      const m = new Map(prev);
      const u = m.get(targetUserId);
      if (u) m.set(targetUserId, { ...u, is_banned: true });
      return m;
    });
  };

  if (!joined) {
    return (
      <Card className="bg-gradient-card border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/60">
          <div className="p-2 rounded-lg bg-primary/15">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {t('liveChat', lang)}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
              {t('chatJoin', lang)}
            </span>
          </div>
          <Input
            placeholder={t('chatUsernamePh', lang)}
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="bg-muted border-border"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          <Button onClick={handleJoin} disabled={!usernameInput.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon">
            <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('chatEnter', lang)}</span>
          </Button>
        </div>
      </Card>
    );
  }

  const visibleMessages = messages.filter((m) => !m.is_deleted);

  return (
    <Card className="bg-gradient-card border-border overflow-hidden flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className={cn('font-display font-extrabold text-lg', lang === 'ar' && 'font-arabic')}>{t('liveChat', lang)}</h3>
            <p className="text-xs text-muted-foreground">{username}</p>
          </div>
        </div>
        {isModerator && (
          <Badge className="bg-gold text-gold-foreground gap-1">
            <Shield className="h-3 w-3" />
            <span className={cn('text-xs font-bold', lang === 'ar' && 'font-arabic')}>{t('moderator', lang)}</span>
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="commentary-scroll flex-1 overflow-y-auto p-3 space-y-2">
        {visibleMessages.map((msg) => {
          const isOwn = msg.user_id === userId;
          return (
            <div key={msg.id} className={cn('group flex gap-2', isOwn && 'flex-row-reverse')}>
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {msg.username.slice(0, 1).toUpperCase()}
              </div>
              <div className={cn('max-w-[80%] space-y-0.5', isOwn && 'items-end flex flex-col')}>
                <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                  <span className="text-[10px] font-bold text-muted-foreground">{msg.username}</span>
                </div>
                <div className={cn(
                  'px-3 py-2 rounded-lg text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                )}>
                  {msg.message}
                </div>
              </div>
              {isModerator && !isOwn && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 self-center">
                  <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => banUser(msg.user_id)} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors">
                    <Ban className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {visibleMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {lang === 'ar' ? 'لا توجد رسائل بعد. كن الأول!' : 'No messages yet. Be the first!'}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <Input
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('chatPlaceholder', lang)}
            className="bg-muted border-border flex-1 text-sm"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            maxLength={300}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMsg.trim()}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary-glow shadow-neon shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
