import { useState } from 'react';
import { Check, Loader2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';

const WIDGET_KEYS = [
  { key: 'matchCenter', label: 'Match Center Title' },
  { key: 'matchCenterSub', label: 'Match Center Subtitle' },
  { key: 'apiWidget', label: 'Latest News Title' },
  { key: 'apiWidgetSub', label: 'Daily News Subtitle', hint: 'آخر الأخبار اليومية في صفحة الأخبار.' },
  { key: 'goldenBoot', label: 'Golden Boot Title' },
  { key: 'goldenBootSub', label: 'Golden Boot Subtitle' },
  { key: 'worldCupPulse', label: 'News Pulse Title' },
  { key: 'highlights', label: 'Highlights Title' },
  { key: 'highlightsSub', label: 'Highlights Subtitle' },
];

const SOCIAL_KEYS = [
  { key: 'social_facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'social_tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'social_youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { key: 'social_website_url', label: 'Website', placeholder: 'https://...' },
];

export function WidgetLabelsTab() {
  const { settings, loading, save } = useSiteSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { en: string; ar: string }>>({});

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
      <p className="text-sm text-muted-foreground">Edit compact section labels and social links.</p>

      <Card className="border-border bg-gradient-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Live Stream Settings</h3>
            <p className="text-xs text-muted-foreground">Add multiple streaming servers for the live match player.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            const currentServersStr = getVal('live_stream_url', 'en');
            let parsed = [];
            try { parsed = JSON.parse(currentServersStr) } catch(e) { if(currentServersStr) parsed = [{name: 'Server 1', url: currentServersStr}] }
            parsed.push({ name: `Server ${parsed.length + 1}`, url: '' });
            setVal('live_stream_url', 'en', JSON.stringify(parsed));
          }}>
            Add Server
          </Button>
        </div>
        <div className="space-y-3">
          {(() => {
            const currentServersStr = getVal('live_stream_url', 'en');
            let servers = [];
            try { servers = JSON.parse(currentServersStr) } catch(e) { if(currentServersStr) servers = [{name: 'Server 1', url: currentServersStr}] }
            
            if (servers.length === 0) {
              return <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded-lg text-center">No servers added. The 2D Tracker will be shown.</div>;
            }

            return servers.map((server: any, idx: number) => (
              <div key={idx} className="grid gap-2 rounded-lg border border-border bg-background/35 p-2.5 xl:grid-cols-[100px_1fr_auto] xl:items-end relative group">
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
            ));
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
          <h3 className="text-sm font-bold">Section labels</h3>
          <p className="text-xs text-muted-foreground">Compact controls for homepage titles and subtitles.</p>
        </div>
        <div className="space-y-2">
          {WIDGET_KEYS.map(({ key, label, hint }) => (
            <div key={key} className="grid gap-2 rounded-lg border border-border bg-background/35 p-2.5 xl:grid-cols-[170px_1fr_1fr_auto] xl:items-end">
              <KeyLabel itemKey={key} label={label} hint={hint} />
              <Field label="English">
                <Input
                  value={getVal(key, 'en')}
                  onChange={(event) => setVal(key, 'en', event.target.value)}
                  placeholder={key === 'apiWidgetSub' ? 'Daily latest news...' : 'English label...'}
                  className="h-8"
                />
              </Field>
              <Field label="العربية">
                <Input
                  value={getVal(key, 'ar')}
                  onChange={(event) => setVal(key, 'ar', event.target.value)}
                  placeholder={key === 'apiWidgetSub' ? 'آخر الأخبار اليومية...' : 'التسمية بالعربية...'}
                  className="h-8 font-arabic text-right"
                  dir="rtl"
                />
              </Field>
              <SaveButton itemKey={key} saving={saving} saved={saved} onClick={() => saveLabelKey(key)} />
            </div>
          ))}
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
