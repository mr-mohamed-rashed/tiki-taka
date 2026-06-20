import { useState, useEffect, useRef } from 'react';
import { Send, Shield, Ban, Trash2, MessageCircle, User, Smile, Pin, PinOff, Bot, BotOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useManualNews } from '@/hooks/useManualNews';
import { t } from '@/lib/i18n';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { ADMIN_EMAILS_LIST } from '@/config/admins';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  is_deleted: boolean;
  is_pinned?: boolean;
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

// Basic profanity filter
const BAD_WORDS = ['شتيمة', 'لفظ', 'خارج', 'shit', 'fuck', 'bitch', 'احا', 'عرص', 'متناك', 'شرموط', 'خول', 'قحبة', 'منيوك'];
function filterProfanity(text: string): string {
  let filtered = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
}

function renderMessageText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      let displayText = part;
      // Shorten long news links
      if (part.includes('/news/') && part.length > 40) {
        displayText = "🔗 التفاصيل من هنا";
      }
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
          {displayText}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface LiveChatProps {
  matchId?: string;
  variant?: 'default' | 'overlay';
  isTheaterSplit?: boolean;
}

export function LiveChat({ matchId = 'general', variant = 'default', isTheaterSplit = false }: LiveChatProps) {
  const { lang } = useLanguage();
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const { news } = useManualNews(true); // Fetch active news for the bots
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Map<string, ChatUser>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [botsEnabled, setBotsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFetchedInitialRef = useRef(false);
  const mountTimeRef = useRef<number>(new Date().getTime());

  const userId = user?.id || getOrCreateUserId();
  
  const getNickname = () => {
    if (user?.user_metadata?.full_name) {
      const parts = user.user_metadata.full_name.trim().split(' ');
      return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    }
    return user?.email?.split('@')[0] || 'Guest';
  };
  
  const username = getNickname();
  const joined = !!user;

  // Auto-detect admin by known emails, or hardcoded IDs
  const isModerator = (user?.email && ADMIN_EMAILS_LIST?.includes(user.email.toLowerCase())) || user?.email === 'mrrashed0777@gmail.com' || user?.email === 'info@one2.cc' || MODERATOR_IDS.has(userId);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Do not load historical messages (TikTok style)
  useEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;
    
    // Start with an empty chat, just finish loading
    setMessages([]);
    setLoading(false);
  }, [matchId]);

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Real-time subscription
  useEffect(() => {
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
        const sender = usersRef.current.get(msg.user_id);
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
  }, [matchId]);

  // Automated 5 Admins (Bots) sending news when chat is quiet
  useEffect(() => {
    // Only run this logic on the Moderator's client to prevent multiple clients from spamming the DB
    if (!isModerator || news.length === 0 || !botsEnabled) return;

    const BOT_NAMES = ['الكابتن (One2)', 'أدمن الأخبار', 'محلل وان تو', 'فار (VAR)', 'رادار الملاعب'];

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const lastMsgTime = messages.length > 0 
        ? new Date(messages[messages.length - 1].created_at).getTime() 
        : mountTimeRef.current;
      
      let consecutiveBotMessages = 0;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (BOT_NAMES.includes(messages[i].username)) {
          consecutiveBotMessages++;
        } else {
          break;
        }
      }
      
      const multiplier = Math.pow(2, Math.min(consecutiveBotMessages, 5));
      const requiredWaitTime = 45000 * multiplier;
      
      if (now - lastMsgTime > requiredWaitTime) {
        const randomNews = news[Math.floor(Math.random() * news.length)];
        const randomBot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const title = lang === 'ar' ? (randomNews.title_ar || randomNews.title_en) : (randomNews.title_en || randomNews.title_ar);
        const link = `${window.location.origin}/news/${randomNews.id}`;
        
        supabase.from('chat_messages').insert({
          user_id: userId,
          username: randomBot,
          message: `📰 خبر عاجل: ${title} \n ${link}`,
          match_id: matchId,
        }).then(({ error }) => {
          if (error) console.error("Bot insert error:", error);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [messages, isModerator, news, matchId, lang, botsEnabled, userId]);

  const handleJoin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google login failed:', e);
    }
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

    let containsBadWord = false;
    let filteredText = text;
    BAD_WORDS.forEach(word => {
      const regex = new RegExp(word, 'gi');
      if (regex.test(filteredText)) {
        containsBadWord = true;
        filteredText = filteredText.replace(regex, '***');
      }
    });

    // 1. If message is entirely bad words, block it completely
    if (filteredText.replace(/\*/g, '').trim() === '') {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        user_id: 'system',
        username: '🤖 المساعد الذكي',
        message: '🚫 عذراً، تعليقك غير لائق تماماً وتم رفضه. يرجى الالتزام بآداب الحديث.',
        match_id: matchId,
        is_deleted: false,
        created_at: new Date().toISOString()
      }]);
      setInputMsg('');
      return;
    }

    // 2. If it has a bad word in the middle, we warn the user but send the masked version
    if (containsBadWord) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        user_id: 'system',
        username: '🤖 المساعد الذكي',
        message: '⚠️ تنبيه: تم تشفير بعض الكلمات غير اللائقة في تعليقك.',
        match_id: matchId,
        is_deleted: false,
        created_at: new Date().toISOString()
      }]);
    }

    setIsSending(true);
    setInputMsg('');
    setShowEmojis(false);

    const { error } = await supabase.from('chat_messages').insert({
      user_id: userId,
      username,
      message: filteredText,
      match_id: matchId,
    });
    
    if (error) {
      console.error("Chat error:", error);
    }
    setIsSending(false);
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('chat_messages').update({ is_deleted: true }).eq('id', id);
  };

  const clearChat = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف جميع الرسائل في هذه المحادثة؟' : 'Are you sure you want to clear the chat?')) return;
    
    const { error } = await supabase.from('chat_messages').update({ is_deleted: true }).eq('match_id', matchId);
    if (!error) {
      setMessages([]);
    } else {
      console.error("Failed to clear chat:", error);
    }
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

  const togglePin = async (id: string, currentStatus: boolean) => {
    await supabase.from('chat_messages').update({ is_pinned: !currentStatus }).eq('id', id);
  };

  if (authLoading) {
    return (
      <Card className={cn("flex items-center justify-center", variant === 'overlay' ? 'bg-transparent border-none shadow-none h-full' : 'bg-gradient-card border-border h-[500px] md:h-full')}>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </Card>
    );
  }



  const visibleMessages = messages.filter((m) => !m.is_deleted);
  const pinnedMessages = visibleMessages.filter((m) => m.is_pinned);
  // Show all messages in the normal flow, except those that were ONLY loaded because they were pinned 
  // (we load pinned messages on mount, so if they are old they will be at the top anyway)

  return (
    <Card className={cn(
      "overflow-hidden flex flex-col h-full select-text",
      variant === 'overlay' ? 'bg-transparent border-none shadow-none' : (isTheaterSplit ? 'bg-black border-none rounded-none' : 'bg-gradient-card border-border')
    )}>
      {/* Header */}
      {variant !== 'overlay' && (
        <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 shrink-0">
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="h-7 text-xs gap-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title={lang === 'ar' ? 'مسح المحادثة بالكامل' : 'Clear Chat'}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'تفريغ الشات' : 'Clear'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBotsEnabled(!botsEnabled)}
              className={cn("h-7 text-xs gap-1.5 border-dashed", botsEnabled ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground")}
            >
              {botsEnabled ? <Bot className="h-3.5 w-3.5" /> : <BotOff className="h-3.5 w-3.5" />}
              {lang === 'ar' ? (botsEnabled ? 'إيقاف البوتات' : 'تشغيل البوتات') : (botsEnabled ? 'Disable Bots' : 'Enable Bots')}
            </Button>
            <Badge className="bg-gold text-gold-foreground gap-1 hidden sm:flex">
              <Shield className="h-3 w-3" />
              <span className={cn('text-xs font-bold', lang === 'ar' && 'font-arabic')}>{t('moderator', lang)}</span>
            </Badge>
          </div>
        )}
        </div>
      )}
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20 p-3 shrink-0 flex flex-col gap-2">
          {pinnedMessages.map((msg) => (
            <div key={`pinned-${msg.id}`} className="flex items-start gap-2 text-sm relative group">
              <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <span className="font-bold mr-1.5 text-primary">
                  {msg.username} {lang === 'ar' ? ':' : ':'}
                </span>
                <span className={cn("text-foreground/90 font-medium whitespace-pre-wrap", variant === 'overlay' && "text-white")}>{renderMessageText(msg.message)}</span>
              </div>
              {isModerator && (
                <button onClick={() => togglePin(msg.id, true)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary/20 text-primary transition-opacity absolute top-0 right-0 shrink-0" title={lang === 'ar' ? 'إلغاء التثبيت' : 'Unpin'}>
                  <PinOff className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="commentary-scroll flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <div className="flex-1 min-h-0" />
        {visibleMessages.map((msg) => {
          const isOwn = msg.user_id === userId;
          return (
            <div key={msg.id} className="group flex items-start gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-lg transition-colors break-words text-sm relative animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex-1 min-w-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <span className={cn(
                  "font-bold mr-1.5",
                  isOwn ? "text-primary" : "text-blue-500"
                )}>
                  {msg.username} {lang === 'ar' ? ':' : ':'}
                </span>
                <span className={cn("text-foreground/90 whitespace-pre-wrap font-medium")}>{renderMessageText(msg.message)}</span>
              </div>
              
              {isModerator && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 bg-background/80 px-1 rounded absolute top-1 right-1">
                  <button onClick={() => togglePin(msg.id, !!msg.is_pinned)} className="p-1 rounded hover:bg-primary/20 text-primary transition-colors" title={lang === 'ar' ? (msg.is_pinned ? 'إلغاء التثبيت' : 'تثبيت') : (msg.is_pinned ? 'Unpin' : 'Pin')}>
                    {msg.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors" title={lang === 'ar' ? 'حذف' : 'Delete'}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {!isOwn && (
                    <button onClick={() => banUser(msg.user_id)} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors" title={lang === 'ar' ? 'حظر' : 'Ban'}>
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  )}
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

      {/* Input or Sign In */}
      {!joined ? (
        <div className={cn("p-4 shrink-0 border-t border-border bg-card/60")}>
          <Button onClick={handleJoin} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className={lang === 'ar' ? 'font-arabic' : ''}>
              {lang === 'ar' ? 'تسجيل الدخول للمشاركة' : 'Sign in to chat'}
            </span>
          </Button>
        </div>
      ) : (
        variant !== 'overlay' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }} 
            className={cn("p-3 shrink-0 relative flex items-center gap-2 border-t border-border")}
          >
            {showEmojis && (
              <div className="absolute bottom-[110%] right-3 z-50 shadow-2xl rounded-xl overflow-hidden">
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setInputMsg(prev => prev + emojiData.emoji);
                  }}
                  theme={Theme.DARK}
                  lazyLoadEmojis={true}
                  searchDisabled={true}
                  skinTonesDisabled={true}
                  width={280}
                  height={350}
                />
              </div>
            )}
            
            <div className="flex-1 bg-[#1e2025] rounded-[24px] flex items-center px-4 h-12 border border-border/50">
              <Input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={lang === 'ar' ? `تعليق باسم ${username}` : `Comment as ${username}`}
                className="border-none bg-transparent shadow-none text-foreground text-sm h-full w-full focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                maxLength={200}
                disabled={isSending}
              />
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none shrink-0"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <Button type="submit" disabled={!inputMsg.trim() || isSending} size="icon" className="shrink-0 bg-primary hover:bg-primary-glow text-primary-foreground rounded-full h-12 w-12 shadow-md">
              <Send className={cn("h-5 w-5", lang === 'ar' && "rotate-180")} />
            </Button>
          </form>
        )
      )}
    </Card>
  );
}
