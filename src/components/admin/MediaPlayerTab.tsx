import { useState } from 'react';
import { Check, Loader2, Save, Copy, ExternalLink, PowerOff, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { useManualNews } from '@/hooks/useManualNews';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SOCIAL_KEYS = [
  { key: 'social_facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'social_tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'social_youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'social_telegram_url', label: 'Telegram', placeholder: 'https://t.me/...' },
];

export function MediaPlayerTab() {
  const { settings, loading, save } = useSiteSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { en: string; ar: string }>>({});
  const { data: news = [] } = useManualNews('all');
  const [selectedNews, setSelectedNews] = useState<string>('');

  const getVal = (key: string, lang: 'en' | 'ar') => {
    if (edits[key]) return edits[key][lang];
    const row = settings.find((setting) => setting.key === key);
    return row ? (lang === 'en' ? row.value_en : row.value_ar) : '';
  };

  const setVal = (key: string, lang: 'en' | 'ar', val: string) => {
    setEdits((prev) => ({ ...prev, [key]: { en: getVal(key, 'en'), ar: getVal(key, 'ar'), [lang]: val } }));
  };

  const saveLabelKey = async (key: string) => {
    setSaving(key);
    await save(key, getVal(key, 'en'), getVal(key, 'ar'));
    setSaving(null);
    setSaved(key);
    toast({ title: 'Saved!', description: `"${key}" updated.` });
    setTimeout(() => setSaved(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Manage your live stream servers and social media links displayed on the player.</p>

      <Card className="border-border bg-gradient-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Live Stream Settings</h3>
            <p className="text-xs text-muted-foreground">Add multiple streaming servers for the live match player.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedNews} onValueChange={setSelectedNews}>
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <SelectValue placeholder="اختر عنوان من الأخبار" />
              </SelectTrigger>
              <SelectContent>
                {news.slice(0, 15).map(n => (
                  <SelectItem key={n.id} value={n.title_ar || n.title_en}>{n.title_ar || n.title_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => {
              const currentServersStr = getVal('live_stream_url', 'en');
              let parsed = [];
              try { parsed = JSON.parse(currentServersStr) } catch(e) { 
                if(currentServersStr) parsed = [{id: Math.floor(1111111 + Math.random() * 8888888).toString(), name: 'Server 1', url: currentServersStr, is_active: true}] 
              }
              parsed.push({ 
                id: Math.floor(1111111 + Math.random() * 8888888).toString(), 
                name: selectedNews || `Server ${parsed.length + 1}`, 
                url: '',
                is_active: true
              });
              setVal('live_stream_url', 'en', JSON.stringify(parsed));
              setSelectedNews(''); // reset after adding
            }}>
              Add Server
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {(() => {
            const currentServersStr = getVal('live_stream_url', 'en');
            let servers = [];
            try { servers = JSON.parse(currentServersStr) } catch(e) { if(currentServersStr) servers = [{name: 'Server 1', url: currentServersStr}] }
            
            if (servers.length === 0) {
              return <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded-lg text-center">No servers added. The 2D Tracker will be shown.</div>;
            }

            // Ensure all servers have IDs and active state
            servers.forEach((s: any) => { 
              if (!s.id || String(s.id).startsWith('serv')) s.id = Math.floor(1111111 + Math.random() * 8888888).toString(); 
              if (s.is_active === undefined) s.is_active = true;
            });

            return servers.map((server: any, idx: number) => {
              const shortLink = `https://tiki-taka.cc/match/${server.id}`;
              return (
              <div key={idx} className={`grid gap-2 rounded-lg border bg-background/35 p-3 relative group ${!server.is_active ? 'border-destructive/50 opacity-75' : 'border-border'}`}>
                <div className="flex flex-wrap items-center gap-2 mb-1 border-b border-border/50 pb-2">
                  <Badge variant="outline" className="font-mono text-[10px] text-primary">{server.id}</Badge>
                  <code className="text-xs text-muted-foreground truncate flex-1 flex min-w-[200px]" dir="ltr">{shortLink}</code>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-6 text-[10px] px-2 py-0 gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(shortLink);
                        toast({ title: 'Copied!', description: 'Short link copied to clipboard.' });
                      }}
                    >
                      <Copy className="h-3 w-3" /> <span className="hidden sm:inline">Copy Link</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-[10px] px-2 py-0 gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/20"
                      onClick={() => window.open(shortLink, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" /> <span className="hidden sm:inline">معاينة المشغل</span>
                    </Button>

                    <Button 
                      variant={server.is_active ? 'destructive' : 'default'}
                      size="sm" 
                      className="h-6 text-[10px] px-2 py-0 gap-1"
                      onClick={() => {
                        const newServers = [...servers];
                        newServers[idx].is_active = !server.is_active;
                        setVal('live_stream_url', 'en', JSON.stringify(newServers));
                      }}
                    >
                      {server.is_active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                      <span className="hidden sm:inline">{server.is_active ? 'إيقاف البث' : 'تفعيل البث'}</span>
                    </Button>
                  </div>
                </div>
                <div className="grid xl:grid-cols-[100px_1fr_auto] gap-2 items-end">
                  <Field label="Server Name">
                    <Input
                      value={server.name}
                      onChange={(e) => {
                        const newServers = [...servers];
                        newServers[idx].name = e.target.value;
                        setVal('live_stream_url', 'en', JSON.stringify(newServers));
                      }}
                      placeholder="e.g. Server 1"
                      className="h-8"
                    />
                  </Field>
                  <Field label="Embed URL">
                    <Input
                      value={server.url}
                      onChange={(e) => {
                        const newServers = [...servers];
                        newServers[idx].url = e.target.value;
                        setVal('live_stream_url', 'en', JSON.stringify(newServers));
                      }}
                      placeholder="https://youtube.com/embed/..."
                      className="h-8"
                      dir="ltr"
                    />
                  </Field>
                  <Button variant="destructive" size="sm" className="h-8" onClick={() => {
                    const newServers = servers.filter((_: any, i: number) => i !== idx);
                    setVal('live_stream_url', 'en', JSON.stringify(newServers));
                  }}>
                    Remove
                  </Button>
                </div>
              </div>
            )});
          })()}
          
          <div className="flex justify-end pt-2 border-t border-border">
            <SaveButton itemKey="live_stream_url" saving={saving} saved={saved} onClick={() => saveLabelKey('live_stream_url')} />
          </div>
        </div>
      </Card>

      <Card className="border-border bg-gradient-card p-4">
        <div className="mb-4">
          <h3 className="text-sm font-bold">Social links</h3>
          <p className="text-xs text-muted-foreground">The title appears next to the icon under the 2D match screen.</p>
        </div>
        <div className="space-y-2">
          {SOCIAL_KEYS.map(({ key, label, placeholder }) => (
            <div key={key} className="grid gap-2 rounded-lg border border-border bg-background/35 p-2.5 xl:grid-cols-[150px_220px_1fr_auto] xl:items-end">
              <KeyLabel itemKey={key} label={label} />
              <Field label="Title">
                <Input
                  value={getVal(key, 'ar') || label}
                  onChange={(event) => setVal(key, 'ar', event.target.value)}
                  placeholder={label}
                  className="h-8"
                />
              </Field>
              <Field label="Link">
                <Input
                  value={getVal(key, 'en')}
                  onChange={(event) => setVal(key, 'en', event.target.value)}
                  placeholder={placeholder}
                  className="h-8"
                  dir="ltr"
                />
              </Field>
              <SaveButton itemKey={key} saving={saving} saved={saved} onClick={() => saveLabelKey(key)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border bg-gradient-card p-4">
        <div className="mb-4">
          <h3 className="text-sm font-bold">Logo & Ticker Settings (إعدادات اللوجو والشريط الإخباري)</h3>
          <p className="text-xs text-muted-foreground">Customize the news ticker and logo overlay on the live player.</p>
        </div>
        <div className="space-y-4">
          {/* Ticker Text */}
          <div className="grid gap-2 rounded-lg border border-border bg-background/35 p-3">
            <KeyLabel itemKey="live_ticker_text" label="News Ticker (الشريط الإخباري)" />
            <div className="flex gap-2">
              <Input
                value={getVal('live_ticker_text', 'ar')}
                onChange={(event) => setVal('live_ticker_text', 'ar', event.target.value)}
                placeholder="News text..."
                className="h-8"
              />
              <SaveButton itemKey="live_ticker_text" saving={saving} saved={saved} onClick={() => saveLabelKey('live_ticker_text')} />
            </div>
          </div>

          {/* Logo Position */}
          <div className="grid gap-2 rounded-lg border border-border bg-background/35 p-3">
            <KeyLabel itemKey="live_logo_position" label="Logo Position (مكان اللوجو)" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['top-right', 'top-left', 'bottom-right', 'bottom-left', 'none'].map(pos => {
                const currentPos = getVal('live_logo_position', 'en') || 'top-right';
                return (
                  <Button 
                    key={pos}
                    variant={currentPos === pos ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setVal('live_logo_position', 'en', pos);
                      setVal('live_logo_position', 'ar', pos);
                    }}
                  >
                    {pos}
                  </Button>
                )
              })}
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton itemKey="live_logo_position" saving={saving} saved={saved} onClick={() => saveLabelKey('live_logo_position')} />
            </div>
          </div>

          {/* Logo Size */}
          <div className="grid gap-2 rounded-lg border border-border bg-background/35 p-3">
            <KeyLabel itemKey="live_logo_size" label="Logo Size (حجم اللوجو)" />
            <div className="grid grid-cols-3 gap-2">
              {['SM', 'MD', 'LG'].map(size => {
                const currentSize = getVal('live_logo_size', 'en') || 'SM';
                return (
                  <Button 
                    key={size}
                    variant={currentSize === size ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setVal('live_logo_size', 'en', size);
                      setVal('live_logo_size', 'ar', size);
                    }}
                  >
                    {size}
                  </Button>
                )
              })}
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton itemKey="live_logo_size" saving={saving} saved={saved} onClick={() => saveLabelKey('live_logo_size')} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KeyLabel({ itemKey, label, hint }: { itemKey: string; label: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <Badge variant="outline" className="mb-1 text-primary border-primary/40 font-mono text-[10px]">{itemKey}</Badge>
      <div className="text-xs font-semibold">{label}</div>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SaveButton({
  itemKey,
  saving,
  saved,
  onClick,
}: {
  itemKey: string;
  saving: string | null;
  saved: string | null;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={saving === itemKey}
      className={`h-8 gap-1.5 shrink-0 px-3 ${saved === itemKey ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {saving === itemKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : saved === itemKey ? <Check className="h-3.5 w-3.5" />
          : <Save className="h-3.5 w-3.5" />}
      {saved === itemKey ? 'Saved!' : 'Save'}
    </Button>
  );
}
