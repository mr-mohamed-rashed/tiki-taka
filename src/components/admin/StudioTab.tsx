import { useState, useEffect } from 'react';
import { Video, Settings, Save, AlertCircle, RefreshCw, Send, Type, Link, Monitor, LayoutTemplate, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LiveStudioState {
  streamUrl: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'none';
  logoSize: 'sm' | 'md' | 'lg';
  overlayText: string;
  isLive: boolean;
}

const defaultState: LiveStudioState = {
  streamUrl: '',
  logoPosition: 'top-right',
  logoSize: 'md',
  overlayText: '',
  isLive: false
};

export function StudioTab() {
  const { lang, dir } = useLanguage();
  const [state, setState] = useState<LiveStudioState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value_en')
        .eq('key', 'live_studio_state')
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.value_en) {
        setState(JSON.parse(data.value_en));
      }
    } catch (error) {
      console.error('Error fetching studio state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState?: LiveStudioState) => {
    setIsSaving(true);
    const stateToSave = newState || state;
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'live_studio_state', 
          value_en: JSON.stringify(stateToSave),
          value_ar: JSON.stringify(stateToSave)
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success(lang === 'ar' ? 'تم تحديث الاستوديو بنجاح' : 'Studio updated successfully');
      
      if (newState) setState(newState);
    } catch (error) {
      console.error('Error saving studio state:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving state');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof LiveStudioState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const toggleLive = () => {
    const newState = { ...state, isLive: !state.isLive };
    saveState(newState);
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      <Card className="p-6 border-border bg-card/60 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <h3 className={cn('font-bold text-xl flex items-center gap-2', lang === 'ar' && 'font-arabic')}>
            <Settings className="h-5 w-5 text-primary" />
            {lang === 'ar' ? 'غرفة تحكم البث (الريموت كنترول)' : 'Broadcast Control Room'}
          </h3>
          <Button 
            onClick={toggleLive}
            variant={state.isLive ? 'destructive' : 'default'}
            className={cn("gap-2 font-bold", !state.isLive && "bg-live hover:bg-live/90 text-white")}
          >
            {state.isLive ? <Video className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {state.isLive 
              ? (lang === 'ar' ? 'إيقاف البث' : 'Stop Broadcast') 
              : (lang === 'ar' ? 'بدء البث للجمهور' : 'Start Broadcast')}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Stream URL */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                {lang === 'ar' ? 'سيرفرات البث (يوتيوب، تويتش، إلخ)' : 'Stream Servers'}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                let parsed = [];
                try { parsed = JSON.parse(state.streamUrl) } catch(e) { if(state.streamUrl) parsed = [{name: 'Server 1', url: state.streamUrl}] }
                parsed.push({ name: `Server ${parsed.length + 1}`, url: '' });
                handleChange('streamUrl', JSON.stringify(parsed));
              }}>
                {lang === 'ar' ? 'إضافة سيرفر' : 'Add Server'}
              </Button>
            </label>
            
            <div className="space-y-3">
              {(() => {
                let servers = [];
                try { servers = JSON.parse(state.streamUrl) } catch(e) { if(state.streamUrl) servers = [{name: 'Server 1', url: state.streamUrl}] }
                
                if (servers.length === 0) {
                  return <Input 
                    value={state.streamUrl}
                    onChange={(e) => handleChange('streamUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="font-mono bg-background/50"
                  />;
                }

                return servers.map((server: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 animate-fade-in">
                    <Input 
                      value={server.name}
                      onChange={(e) => {
                        const newServers = [...servers];
                        newServers[idx].name = e.target.value;
                        handleChange('streamUrl', JSON.stringify(newServers));
                      }}
                      placeholder={lang === 'ar' ? "اسم السيرفر" : "Server Name"}
                      className="w-1/3"
                    />
                    <Input 
                      value={server.url}
                      onChange={(e) => {
                        const newServers = [...servers];
                        newServers[idx].url = e.target.value;
                        handleChange('streamUrl', JSON.stringify(newServers));
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className="font-mono bg-background/50 flex-1"
                    />
                    <Button variant="destructive" size="icon" onClick={() => {
                      const newServers = servers.filter((_: any, i: number) => i !== idx);
                      handleChange('streamUrl', JSON.stringify(newServers));
                    }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Overlay Text */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              {lang === 'ar' ? 'الشريط الإخباري (أسفل الشاشة)' : 'Scrolling Marquee Text'}
            </label>
            <Input 
              value={state.overlayText}
              onChange={(e) => handleChange('overlayText', e.target.value)}
              placeholder={lang === 'ar' ? 'أهلاً بكم في البث المباشر...' : 'Welcome to the live stream...'}
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Position */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                {lang === 'ar' ? 'مكان اللوجو' : 'Logo Position'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'none'] as const).map(pos => (
                  <Button
                    key={pos}
                    variant={state.logoPosition === pos ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('logoPosition', pos)}
                    className={cn(pos === 'none' && "col-span-2")}
                  >
                    {pos}
                  </Button>
                ))}
              </div>
            </div>

            {/* Logo Size */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                {lang === 'ar' ? 'حجم اللوجو' : 'Logo Size'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <Button
                    key={size}
                    variant={state.logoSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChange('logoSize', size)}
                  >
                    {size.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <Button onClick={() => saveState()} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving 
                ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                : (lang === 'ar' ? 'حفظ وتحديث الشاشات' : 'Save & Update Screens')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
