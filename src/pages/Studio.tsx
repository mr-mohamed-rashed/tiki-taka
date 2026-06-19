import { useState, useEffect } from 'react';
import { Video, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LiveChat } from '@/components/one2/LiveChat';
import { ShareMenu } from '@/components/one2/ShareMenu';
import { supabase } from '@/integrations/supabase/client';

interface LiveStudioState {
  streamUrl: string;
  isLive: boolean;
}

const defaultState: LiveStudioState = {
  streamUrl: '',
  isLive: false
};

export default function Studio() {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState<LiveStudioState>(defaultState);
  const [activeServerIndex, setActiveServerIndex] = useState(0);

  const servers = (() => {
    if (!state.streamUrl) return [];
    try {
      const parsed = JSON.parse(state.streamUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {
      return [{ name: 'Server 1', url: state.streamUrl }];
    }
    return [];
  })();

  const activeServerUrl = servers[activeServerIndex]?.url || '';

  useEffect(() => {
    const fetchState = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value_en')
        .eq('key', 'live_studio_state')
        .single();
      
      if (!error && data?.value_en) {
        setState(JSON.parse(data.value_en));
      }
    };
    fetchState();

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.live_studio_state',
        },
        (payload) => {
          if (payload.new && (payload.new as any).value_en) {
            setState(JSON.parse((payload.new as any).value_en));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden" dir={dir}>
      {/* App Bar */}
      <header className="flex items-center justify-between p-3 border-b border-border bg-card shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            {lang === 'ar' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-neon">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('font-bold text-lg leading-none', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? 'الاستوديو المباشر' : 'Live Studio'}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />
                <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'مباشر الآن' : 'Live Now'}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ShareMenu />
        </div>
      </header>

      {/* Video Player */}
      <div className="w-full bg-black relative shrink-0 z-0 flex flex-col aspect-video">
        {!state.isLive || !activeServerUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className={cn('text-lg font-bold text-white mb-1', lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'البث لم يبدأ بعد' : 'Broadcast not started yet'}
            </h3>
            <p className="text-white/50 text-xs max-w-[250px] text-center px-2">
              {lang === 'ar'
                ? 'انتظرونا قريباً في بث مباشر وتغطية حصرية.'
                : 'Stay tuned for our exclusive live broadcast.'}
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={(() => {
                let finalUrl = activeServerUrl.trim();
                if (finalUrl.includes('youtube.com/watch?v=')) {
                  finalUrl = finalUrl.replace('watch?v=', 'embed/');
                } else if (finalUrl.includes('youtu.be/')) {
                  const videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
                  if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
                }
                if (finalUrl.includes('youtube.com/embed/')) {
                  finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'autoplay=1&playsinline=1';
                }
                return finalUrl;
              })()}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Server Selection (if multiple) */}
      {servers.length > 1 && (
        <div className="bg-card px-3 py-2 flex flex-wrap gap-2 border-b border-border shrink-0 overflow-x-auto">
          {servers.map((server: any, idx: number) => (
            <Button
              key={idx}
              variant={idx === activeServerIndex ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveServerIndex(idx)}
              className="font-bold text-xs h-7 rounded-full whitespace-nowrap"
            >
              {server.name || `Server ${idx + 1}`}
            </Button>
          ))}
        </div>
      )}

      {/* Chat Section */}
      <div className="flex-1 w-full min-h-0 bg-background relative z-10 flex flex-col">
        <LiveChat matchId="studio_live" variant="default" isTheaterSplit={true} />
      </div>
    </div>
  );
}
