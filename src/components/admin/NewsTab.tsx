import { useState } from 'react';
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useManualNews, type ManualNewsRow } from '@/hooks/useManualNews';

const CATEGORIES = ['World Cup 2026', 'Groups', 'Squads', 'Preview', 'Results', 'Highlights', 'Stats'];

const blank = (): Omit<ManualNewsRow, 'id' | 'created_at'> => ({
  title_en: '',
  title_ar: '',
  excerpt_en: '',
  excerpt_ar: '',
  category: 'World Cup 2026',
  image_url: '',
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

  const resetAddForm = () => {
    setForm(blank());
    setAdding(false);
  };

  const handleAdd = async () => {
    if (!form.title_en.trim() && !form.title_ar.trim()) return;
    setSaving(true);
    await save(form);
    setForm(blank());
    setAdding(true);
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setSaving(true);
    await update(editId, editForm);
    setEditId(null);
    setSaving(false);
  };

  const startEdit = (item: ManualNewsRow) => {
    setEditId(item.id);
    setEditForm({
      title_en: item.title_en,
      title_ar: item.title_ar,
      excerpt_en: item.excerpt_en,
      excerpt_ar: item.excerpt_ar,
      category: item.category,
      image_url: item.image_url,
      published_at: item.published_at,
      is_published: item.is_published,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <Card className="overflow-hidden border-primary/25 bg-gradient-card">
        <Collapsible open={adding} onOpenChange={setAdding}>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary shadow-neon">
                <Newspaper className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                  نبض كأس العالم
                </h2>
                <p className="text-sm text-muted-foreground">أضف الأخبار التي تظهر في الموقع وشريط الأخبار.</p>
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <Button className="gap-2 font-semibold">
                {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {adding ? 'إغلاق الإضافة' : 'إضافة خبر'}
                <ChevronDown className={`h-4 w-4 transition-transform ${adding ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="border-t border-border/70 p-5">
              <NewsForm
                form={form}
                setForm={setForm}
                saving={saving}
                submitLabel="حفظ الخبر"
                onSubmit={handleAdd}
                onCancel={resetAddForm}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {news.length === 0 && !adding && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          لا توجد أخبار مضافة حتى الآن. اضغط على إضافة خبر وابدأ أول خبر.
        </Card>
      )}

      <div className="space-y-3">
        {news.map((item) => (
          <Card key={item.id} className={`border-border bg-card/70 p-4 ${!item.is_published ? 'opacity-65' : ''}`}>
            {editId === item.id ? (
              <div className="space-y-4">
                <NewsForm
                  form={{
                    title_en: editForm.title_en ?? '',
                    title_ar: editForm.title_ar ?? '',
                    excerpt_en: editForm.excerpt_en ?? '',
                    excerpt_ar: editForm.excerpt_ar ?? '',
                    category: editForm.category ?? item.category,
                    image_url: editForm.image_url ?? '',
                    published_at: editForm.published_at ?? item.published_at,
                    is_published: editForm.is_published ?? item.is_published,
                  }}
                  setForm={(next) => {
                    setEditForm((current) => {
                      const currentForm = {
                        title_en: current.title_en ?? '',
                        title_ar: current.title_ar ?? '',
                        excerpt_en: current.excerpt_en ?? '',
                        excerpt_ar: current.excerpt_ar ?? '',
                        category: current.category ?? item.category,
                        image_url: current.image_url ?? '',
                        published_at: current.published_at ?? item.published_at,
                        is_published: current.is_published ?? item.is_published,
                      };
                      return typeof next === 'function' ? next(currentForm) : next;
                    });
                  }}
                  saving={saving}
                  submitLabel="حفظ التعديل"
                  onSubmit={handleUpdate}
                  onCancel={() => setEditId(null)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title_ar || item.title_en}
                    className="h-24 w-full rounded-lg border border-border object-cover sm:h-20 sm:w-32"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/20">{item.category}</Badge>
                    <Badge variant={item.is_published ? 'default' : 'outline'} className="gap-1">
                      {item.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {item.is_published ? 'ظاهر' : 'مسودة'}
                    </Badge>
                    <span className="text-xs text-muted-foreground" dir="ltr">{item.published_at}</span>
                  </div>

                  <h3 className="font-arabic text-base font-bold leading-7 text-foreground">
                    {item.title_ar || item.title_en}
                  </h3>
                  {item.excerpt_ar && (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt_ar}</p>
                  )}
                  {item.title_en && (
                    <p className="mt-2 truncate text-xs text-muted-foreground" dir="ltr">{item.title_en}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:flex-col">
                  <Switch checked={item.is_published} onCheckedChange={(value) => togglePublish(item.id, value)} />
                  <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => startEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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

type NewsFormState = Omit<ManualNewsRow, 'id' | 'created_at'>;

function NewsForm({
  form,
  setForm,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  form: NewsFormState;
  setForm: React.Dispatch<React.SetStateAction<NewsFormState>>;
  saving: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const canSave = form.title_ar.trim() || form.title_en.trim();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">عنوان الخبر بالعربي</Label>
          <Input
            value={form.title_ar}
            onChange={(event) => setForm((current) => ({ ...current, title_ar: event.target.value }))}
            className="h-10 font-arabic text-right"
            dir="rtl"
            placeholder="مثال: نيمار يعود! البرازيل تضمه في قائمتها..."
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">ملخص قصير</Label>
          <Textarea
            value={form.excerpt_ar}
            onChange={(event) => setForm((current) => ({ ...current, excerpt_ar: event.target.value }))}
            rows={3}
            className="resize-none font-arabic text-right"
            dir="rtl"
            placeholder="اكتب سطر أو سطرين يظهروا تحت الخبر..."
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">التصنيف</Label>
          <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">تاريخ النشر</Label>
          <Input
            type="date"
            value={form.published_at}
            onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))}
            className="h-10"
            dir="ltr"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">رابط الصورة</Label>
          <Input
            value={form.image_url}
            onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
            className="h-10"
            dir="ltr"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">English title اختياري</Label>
          <Input
            value={form.title_en}
            onChange={(event) => setForm((current) => ({ ...current, title_en: event.target.value }))}
            className="h-10"
            dir="ltr"
            placeholder="Optional English title"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
          <div>
            <p className="text-sm font-semibold">نشر الخبر الآن</p>
            <p className="text-xs text-muted-foreground">اقفلها لو عايزه يبقى مسودة.</p>
          </div>
          <Switch
            checked={form.is_published}
            onCheckedChange={(value) => setForm((current) => ({ ...current, is_published: value }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onSubmit} disabled={saving || !canSave} className="gap-2 font-semibold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitLabel}
        </Button>
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          إلغاء
        </Button>
        {canSave && !saving && <span className="flex items-center gap-1 text-xs text-primary"><Check className="h-3 w-3" /> جاهز للحفظ</span>}
      </div>
    </div>
  );
}
