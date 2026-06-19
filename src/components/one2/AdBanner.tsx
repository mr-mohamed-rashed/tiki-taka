import { useState } from 'react';
import { X, Megaphone, Edit, Check, Loader2 } from 'lucide-react';
import { useAdBanners } from '@/hooks/useAdBanners';
import { getSlotById } from '@/lib/adSlots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AD_SLOTS, getSlotsByLocation, LOCATIONS } from '@/lib/adSlots';
import { useEditMode } from '@/hooks/useEditMode';

export function AdBanner({ slotId }: { slotId: string }) {
  const { banners, update } = useAdBanners();
  const isEditMode = useEditMode();
  const [dismissed, setDismissed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', slot_id: '' });
  const [saving, setSaving] = useState(false);

  if (dismissed) return null;

  const slot = getSlotById(slotId);
  if (!slot) return null;

  const allLocationSlots = getSlotsByLocation(slot.location);
  const isFirstSlotInLocation = allLocationSlots[0]?.id === slotId;

  const activeBanner = banners.find(b => b.is_active && (
    b.slot_id === slotId || 
    b.position === slotId ||
    (b.position === slot.location && !b.slot_id && isFirstSlotInLocation)
  ));
  if (!activeBanner) return null;

  const startEdit = () => {
    setEditing(true);
    setForm({
      title: activeBanner.title,
      image_url: activeBanner.image_url,
      link_url: activeBanner.link_url,
      slot_id: activeBanner.slot_id || ''
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await update(activeBanner.id, form);
    setEditing(false);
    setSaving(false);
  };

  if (editing && isEditMode) {
    return (
      <div className="relative mx-auto lg:mx-0 p-4 border-2 border-primary rounded-2xl bg-background" style={{ maxWidth: slot.width }}>
        <h3 className="font-semibold mb-3">Edit Ad</h3>
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
            <Label className="text-xs">Link URL</Label>
            <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Location</Label>
            <Select value={slot.location} onValueChange={v => {
              const newSlot = getSlotsByLocation(v)[0];
              if (newSlot) setForm(f => ({ ...f, slot_id: newSlot.id }));
            }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{LOCATIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto lg:mx-0 group"
      style={{ maxWidth: slot.width }}
    >
      {isEditMode && (
        <button
          onClick={startEdit}
          className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-primary/90 hover:bg-primary text-white shadow-lg transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
      >
        <X className="h-3 w-3" />
      </button>

      <a
        href={activeBanner.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden shadow-elevated hover:shadow-neon transition-shadow duration-300 group"
        style={{
          background: activeBanner.image_url
            ? 'transparent'
            : 'linear-gradient(160deg, #1a3a2a 0%, #0d2418 60%, #0a1c10 100%)',
          height: slot.height,
        }}
      >
        {activeBanner.image_url ? (
          <img
            src={activeBanner.image_url}
            alt={activeBanner.title || 'Advertisement'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-6 text-center">
            <Megaphone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold text-white">{activeBanner.title || 'Advertisement'}</p>
          </div>
        )}
      </a>
    </div>
  );
}
