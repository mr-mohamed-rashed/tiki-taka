import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useEditMode } from '@/hooks/useEditMode';
import { useAdBanners } from '@/hooks/useAdBanners';
import { AD_SLOTS, getSlotsByLocation } from '@/lib/adSlots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LOCATIONS = ['hero', 'sidebar', 'news-page', 'live-page'];

export function AdSlotSelector({ location, onAdd }: { location: string; onAdd: () => void }) {
  const isEditMode = useEditMode();
  const { save } = useAdBanners();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: '',
    image_url: '',
    link_url: '',
    slot_id: '',
    position: location,
    is_active: true,
    sort_order: 0
  });
  const [saving, setSaving] = useState(false);

  if (!isEditMode) return null;

  if (adding) {
    const handleSave = async () => {
      if (!form.link_url) return;
      setSaving(true);
      await save(form);
      setAdding(false);
      setForm({ title: '', image_url: '', link_url: '', slot_id: '', position: location });
      setSaving(false);
      onAdd();
    };

    return (
      <div className="p-4 border-2 border-primary rounded-2xl bg-background mb-4">
        <h3 className="font-semibold mb-3">Add New Ad</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Image URL</Label>
            <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Link URL *</Label>
            <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ad Slot</Label>
            <Select value={form.slot_id} onValueChange={v => {
              const slot = AD_SLOTS.find(s => s.id === v);
              setForm(f => ({ ...f, slot_id: v }));
            }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select a slot" /></SelectTrigger>
              <SelectContent>{getSlotsByLocation(location).map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.width} x {s.height})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <span className="h-3 w-3 animate-spin border-2 border-current border-t-transparent rounded-full" /> : <Check className="h-3 w-3" />}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 border-2 border-dashed border-primary/50 hover:border-primary">
        <Plus className="h-3 w-3" /> Add Ad Here
      </Button>
    </div>
  );
}
