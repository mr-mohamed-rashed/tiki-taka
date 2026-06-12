import { useState } from 'react';
import { Edit, Check, X, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { usePageSections, type PageSection } from '@/hooks/usePageSections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function WidgetEditor({ page, sectionKey, editable = false, children }: { page: string; sectionKey: string; editable?: boolean; children: React.ReactNode }) {
  const { sections, upsertMany, remove } = usePageSections(page);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<PageSection>>({});
  const [saving, setSaving] = useState(false);

  const section = sections.find(s => s.section_key === sectionKey);

  const startEdit = () => {
    if (!section) return;
    setEditing(true);
    setForm({
      page: section.page,
      section_key: section.section_key,
      name_en: section.name_en,
      name_ar: section.name_ar,
      subtitle_en: section.subtitle_en,
      subtitle_ar: section.subtitle_ar,
      bg_color: section.bg_color,
      bg_image: section.bg_image,
      is_visible: section.is_visible,
      sort_order: section.sort_order
    });
  };

  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    await upsertMany([form]);
    setEditing(false);
    setSaving(false);
  };

  const handleMoveUp = async () => {
    if (!section) return;
    const newOrder = Math.max(0, section.sort_order - 1);
    await upsertMany([{ ...section, sort_order: newOrder }]);
  };

  const handleMoveDown = async () => {
    if (!section) return;
    const newOrder = section.sort_order + 1;
    await upsertMany([{ ...section, sort_order: newOrder }]);
  };

  const handleDelete = async () => {
    if (!section) return;
    if (!confirm('Are you sure you want to delete this widget?')) return;
    await remove(section.id);
  };

  const handleToggleVisibility = async () => {
    if (!section) return;
    await upsertMany([{ ...section, is_visible: !section.is_visible }]);
  };

  if (!section) return <>{children}</>;

  if (editing && editable) {
    return (
      <div className="relative p-4 border-2 border-primary rounded-2xl bg-background mb-4">
        <h3 className="font-semibold mb-3">Edit Widget</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Name (English)</Label>
            <Input value={form.name_en || ''} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Name (Arabic)</Label>
            <Input value={form.name_ar || ''} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Subtitle (English)</Label>
            <Input value={form.subtitle_en || ''} onChange={e => setForm(f => ({ ...f, subtitle_en: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Subtitle (Arabic)</Label>
            <Input value={form.subtitle_ar || ''} onChange={e => setForm(f => ({ ...f, subtitle_ar: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Background Color</Label>
            <Input value={form.bg_color || ''} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Background Image URL</Label>
            <Input value={form.bg_image || ''} onChange={e => setForm(f => ({ ...f, bg_image: e.target.value }))} placeholder="https://..." className="h-8 text-sm" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs flex items-center gap-2">
              <Switch checked={form.is_visible} onCheckedChange={v => setForm(f => ({ ...f, is_visible: v }))} />
              Visible
            </Label>
          </div>
        </div>
        <div className="flex gap-2 pt-3">
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (!section.is_visible) return null;

  return (
    <div className={`relative group ${!editable ? '' : 'hover:border-2 hover:border-primary/30 transition-colors'}`}>
      {editable && (
        <div className="absolute -top-3 left-2 z-10 flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={startEdit} title="Edit">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleMoveUp} title="Move Up">
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleMoveDown} title="Move Down">
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleToggleVisibility} title="Toggle Visibility">
            <X className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDelete} title="Delete">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
