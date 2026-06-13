import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Loader2, ExternalLink, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdBanners, type AdBannerRow } from '@/hooks/useAdBanners';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Switch } from '@/components/ui/switch';
import { AD_SLOTS, getSlotsByLocation } from '@/lib/adSlots';

const LOCATIONS = ['hero', 'sidebar', 'news-page', 'live-page', 'marquee'];

const blank = (): Omit<AdBannerRow, 'id' | 'created_at'> => ({
  position: 'hero', slot_id: '', title: '', image_url: '', link_url: '', is_active: true, sort_order: 0, width: '280px', height: 'auto',
});

export function AdsTab() {
  const { banners, loading, save, update, remove, toggle } = useAdBanners();
  const { settings, save: saveSetting } = useSiteSettings();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [savingSpeed, setSavingSpeed] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState('50');

  useEffect(() => {
    setMarqueeSpeed(settings.find((setting) => setting.key === 'marquee_speed_seconds')?.value_en || '50');
  }, [settings]);

  const saveMarqueeSpeed = async () => {
    const seconds = Math.max(10, Math.min(300, Number(marqueeSpeed) || 50)).toString();
    setMarqueeSpeed(seconds);
    setSavingSpeed(true);
    await saveSetting('marquee_speed_seconds', seconds, seconds);
    setSavingSpeed(false);
  };

  const startEdit = (b: AdBannerRow) => {
    setEditing(b.id);
    setForm({ title: b.title, image_url: b.image_url, link_url: b.link_url, position: b.position, slot_id: b.slot_id, is_active: b.is_active, sort_order: b.sort_order, width: b.width, height: b.height });
  };

  const handleSave = async () => {
    if (!form.link_url) return;
    setSaving(true);

    if (editing) {
      await update(editing, form);
      setEditing(null);
    } else {
      await save(form);
      setAdding(false);
    }

    setForm(blank());
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setAdding(false);
    setForm(blank());
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage ad banners and sponsor marquee (الرو).</p>
        <Button size="sm" onClick={() => { setAdding(true); setForm({ ...blank(), position: 'marquee', slot_id: 'marquee-row' }); }} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Ad / Sponsor
        </Button>
      </div>

      <Card className="p-4 border-primary/25 bg-gradient-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:w-48">
            <Label className="mb-1.5 block text-xs text-muted-foreground">Marquee Speed (seconds)</Label>
            <Input
              type="number"
              min={10}
              max={300}
              value={marqueeSpeed}
              onChange={(event) => setMarqueeSpeed(event.target.value)}
              className="h-10 text-center"
              dir="ltr"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={saveMarqueeSpeed}
            disabled={savingSpeed}
            className="h-10 gap-2"
          >
            {savingSpeed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Speed
          </Button>
          <p className="pb-2 text-xs text-muted-foreground ml-3 rtl:mr-3">Lower = faster. Recommended: 30 to 80.</p>
        </div>
      </Card>

      {/* Edit/Add Modal */}
      {(adding || editing) && (
        <Card className="p-6 border-primary/40 bg-primary/5">
          <h3 className="font-semibold mb-4">{editing ? 'Edit Ad' : 'New Ad Banner'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ad title" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v, slot_id: '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LOCATIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.position && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Ad Slot</Label>
                <Select value={form.slot_id} onValueChange={v => {
                  const slot = AD_SLOTS.find(s => s.id === v);
                  setForm(f => ({ ...f, slot_id: v, width: slot?.width || '280px', height: slot?.height || 'auto' }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select a slot" /></SelectTrigger>
                  <SelectContent>{getSlotsByLocation(form.position).map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.width} x {s.height})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label>Image URL (optional)</Label>
              <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Link URL *</Label>
              <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !form.link_url} className="gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editing ? 'Update' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* All Ads List */}
      {banners.length === 0 && !adding && (
        <div className="py-12 text-center text-muted-foreground text-sm">No ads yet. Click "Add Ad" to create one.</div>
      )}

      <div className="space-y-2">
        {banners.map(b => (
          <Card key={b.id} className={`p-4 border-border bg-gradient-card ${!b.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              {b.image_url && (
                <img src={b.image_url} alt={b.title} className="w-16 h-12 object-cover rounded-md border border-border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{b.title || 'Untitled Ad'}</span>
                  <Badge variant="outline" className="text-xs">{b.slot_id || b.position}</Badge>
                  {b.is_active ? <Badge className="bg-green-600/20 text-green-400 border-green-600/40 text-xs">Active</Badge>
                    : <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>}
                </div>
                <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 truncate">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />{b.link_url}
                </a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch checked={b.is_active} onCheckedChange={v => toggle(b.id, v)} />
                <Button size="sm" variant="outline" onClick={() => startEdit(b)} className="gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(b.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
