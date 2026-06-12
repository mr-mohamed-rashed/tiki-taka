import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useManualNews, type ManualNewsRow } from '@/hooks/useManualNews';

const CATEGORIES = ['World Cup 2026','Group Stage','Squads','Tactics','Transfer','Preview','Interview','Stats'];

const blank = (): Omit<ManualNewsRow, 'id' | 'created_at'> => ({
  title_en: '', title_ar: '', excerpt_en: '', excerpt_ar: '',
  category: 'World Cup 2026',
  image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  published_at: new Date().toISOString().slice(0, 10),
  is_published: true,
});

export function NewsTab() {
  const { news, loading, save, update, remove, togglePublish } = useManualNews();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ManualNewsRow>>({});
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.title_en && !form.title_ar) return;
    setSaving(true);
    await save(form);
    setForm(blank());
    setAdding(false);
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setSaving(true);
    await update(editId, editForm);
    setEditId(null);
    setSaving(false);
  };

  const startEdit = (n: ManualNewsRow) => {
    setEditId(n.id);
    setEditForm({ title_en: n.title_en, title_ar: n.title_ar, excerpt_en: n.excerpt_en, excerpt_ar: n.excerpt_ar, category: n.category, image_url: n.image_url, published_at: n.published_at });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Add and manage manually curated news articles.</p>
        <Button size="sm" onClick={() => setAdding(a => !a)} variant={adding ? 'outline' : 'default'} className="gap-1.5">
          {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {adding ? 'Cancel' : 'Add Article'}
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <Card className="p-5 border-primary/40 bg-primary/5 space-y-4">
          <h3 className="font-semibold text-sm">New Article</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Title (English)</Label>
              <Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} className="h-9" placeholder="Article title..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">عنوان (عربي)</Label>
              <Input value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} className="h-9 font-arabic text-right" dir="rtl" placeholder="عنوان المقال..." />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Excerpt (English)</Label>
              <Textarea value={form.excerpt_en} onChange={e => setForm(f => ({ ...f, excerpt_en: e.target.value }))} rows={2} className="resize-none text-sm" placeholder="Short summary..." />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">ملخص (عربي)</Label>
              <Textarea value={form.excerpt_ar} onChange={e => setForm(f => ({ ...f, excerpt_ar: e.target.value }))} rows={2} className="resize-none text-sm font-arabic text-right" dir="rtl" placeholder="ملخص قصير..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Image URL</Label>
              <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="h-9" placeholder="https://..." />
            </div>
          </div>
          <Button size="sm" onClick={handleAdd} disabled={saving || (!form.title_en && !form.title_ar)} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Publish Article
          </Button>
        </Card>
      )}

      {news.length === 0 && !adding && (
        <div className="py-12 text-center text-muted-foreground text-sm">No manual articles yet. Click "Add Article" to create one.</div>
      )}

      <div className="space-y-3">
        {news.map(n => (
          <Card key={n.id} className={`p-4 border-border bg-gradient-card ${!n.is_published ? 'opacity-60' : ''}`}>
            {editId === n.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Title (EN)</Label>
                    <Input value={editForm.title_en ?? ''} onChange={e => setEditForm(f => ({ ...f, title_en: e.target.value }))} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">عنوان (AR)</Label>
                    <Input value={editForm.title_ar ?? ''} onChange={e => setEditForm(f => ({ ...f, title_ar: e.target.value }))} className="h-9 font-arabic text-right" dir="rtl" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Excerpt (EN)</Label>
                    <Textarea value={editForm.excerpt_en ?? ''} onChange={e => setEditForm(f => ({ ...f, excerpt_en: e.target.value }))} rows={2} className="resize-none text-sm" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">ملخص (AR)</Label>
                    <Textarea value={editForm.excerpt_ar ?? ''} onChange={e => setEditForm(f => ({ ...f, excerpt_ar: e.target.value }))} rows={2} className="resize-none text-sm font-arabic text-right" dir="rtl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select value={editForm.category ?? n.category} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input type="date" value={editForm.published_at ?? n.published_at} onChange={e => setEditForm(f => ({ ...f, published_at: e.target.value }))} className="h-9" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Image URL</Label>
                    <Input value={editForm.image_url ?? ''} onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))} className="h-9" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdate} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                {n.image_url && (
                  <img src={n.image_url} alt={n.title_en} className="w-14 h-10 object-cover rounded-md border border-border flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm truncate max-w-xs">{n.title_en || n.title_ar}</span>
                    <Badge variant="outline" className="text-xs border-border">{n.category}</Badge>
                    {n.is_published ? <Badge className="bg-green-600/20 text-green-400 border-green-600/40 text-xs">Published</Badge>
                      : <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>}
                  </div>
                  {n.title_ar && <p className="text-xs text-muted-foreground font-arabic truncate">{n.title_ar}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{n.published_at}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Switch checked={n.is_published} onCheckedChange={v => togglePublish(n.id, v)} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(n)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(n.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
