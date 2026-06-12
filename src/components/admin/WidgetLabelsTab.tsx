import { useState } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';

const WIDGET_KEYS = [
  { key: 'matchCenter',    label: 'Match Center Title' },
  { key: 'matchCenterSub', label: 'Match Center Subtitle' },
  { key: 'apiWidget',      label: 'Live Widget Title' },
  { key: 'apiWidgetSub',   label: 'Live Widget Subtitle' },
  { key: 'goldenBoot',     label: 'Golden Boot Title' },
  { key: 'goldenBootSub',  label: 'Golden Boot Subtitle' },
  { key: 'worldCupPulse',  label: 'News Pulse Title' },
  { key: 'highlights',     label: 'Highlights Title' },
  { key: 'highlightsSub',  label: 'Highlights Subtitle' },
];

export function WidgetLabelsTab() {
  const { settings, loading, save } = useSiteSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { en: string; ar: string }>>({});

  const getVal = (key: string, lang: 'en' | 'ar') => {
    if (edits[key]) return edits[key][lang];
    const row = settings.find(s => s.key === key);
    return row ? (lang === 'en' ? row.value_en : row.value_ar) : '';
  };

  const setVal = (key: string, lang: 'en' | 'ar', val: string) => {
    setEdits(prev => ({ ...prev, [key]: { en: getVal(key, 'en'), ar: getVal(key, 'ar'), [lang]: val } }));
  };

  const saveKey = async (key: string) => {
    setSaving(key);
    await save(key, getVal(key, 'en'), getVal(key, 'ar'));
    setSaving(null);
    setSaved(key);
    toast({ title: 'Saved!', description: `"${key}" label updated.` });
    setTimeout(() => setSaved(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Edit the English and Arabic names for every section on the site.</p>
      <div className="grid gap-4">
        {WIDGET_KEYS.map(({ key, label }) => (
          <Card key={key} className="p-5 border-border bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary/40 font-mono text-xs">{key}</Badge>
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <Button
                size="sm"
                onClick={() => saveKey(key)}
                disabled={saving === key}
                className={`gap-1.5 ${saved === key ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {saving === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                  saved === key ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                {saved === key ? 'Saved!' : 'Save'}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">English</Label>
                <Input
                  value={getVal(key, 'en')}
                  onChange={e => setVal(key, 'en', e.target.value)}
                  placeholder="English label..."
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">العربية</Label>
                <Input
                  value={getVal(key, 'ar')}
                  onChange={e => setVal(key, 'ar', e.target.value)}
                  placeholder="التسمية بالعربية..."
                  className="h-9 font-arabic text-right"
                  dir="rtl"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
