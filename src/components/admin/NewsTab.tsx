import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Eye, EyeOff, FileText, Loader2, Newspaper, Plus, Save, Trash2, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useManualNews, type ManualNewsRow } from '@/hooks/useManualNews';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ARTICLE_CATEGORIES = ['World Cup 2026', 'Groups', 'Squads', 'Preview', 'Results', 'Highlights', 'Stats'];
const SYSTEM_CATEGORIES = new Set(['Ticker', 'Pulse']);

type NewsDraft = Omit<ManualNewsRow, 'id' | 'created_at'>;

const today = () => new Date().toISOString().slice(0, 10);

const blankTicker = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'Ticker',
  image_url: '',
  published_at: today(),
  is_published: true,
});

const blankPulse = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'Pulse',
  image_url: '',
  published_at: today(),
  is_published: true,
});

const blankArticle = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'World Cup 2026',
  image_url: '',
  published_at: today(),
  is_published: true,
});

export function NewsTab() {
  const { news, loading, save, remove, togglePublish, reorder } = useManualNews();
  const { settings, save: saveSetting } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [savingSpeed, setSavingSpeed] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState('70');
  const [tickerSpeedMobile, setTickerSpeedMobile] = useState('120');
  const [ticker, setTicker] = useState(blankTicker());
  const [pulse, setPulse] = useState(blankPulse());
  const [article, setArticle] = useState(blankArticle());

  const tickerItems = news.filter((item) => item.category === 'Ticker');
  const pulseItems = news.filter((item) => item.category === 'Pulse');
  const articleItems = news.filter((item) => !SYSTEM_CATEGORIES.has(item.category));

  useEffect(() => {
    setTickerSpeed(settings.find((setting) => setting.key === 'ticker_speed_seconds')?.value_en || '70');
    setTickerSpeedMobile(settings.find((setting) => setting.key === 'ticker_speed_mobile_seconds')?.value_en || '120');
  }, [settings]);

  const addItem = async (draft: NewsDraft, reset: () => void) => {
    if (!draft.title_ar.trim() && !draft.title_en.trim()) return;
    setSaving(true);
    await save(draft);
    reset();
    setSaving(false);
  };

  const saveTickerSpeed = async () => {
    const seconds = Math.max(25, Math.min(500, Number(tickerSpeed) || 70)).toString();
    const mobileSeconds = Math.max(25, Math.min(500, Number(tickerSpeedMobile) || 120)).toString();
    setTickerSpeed(seconds);
    setTickerSpeedMobile(mobileSeconds);
    setSavingSpeed(true);
    await saveSetting('ticker_speed_seconds', seconds, seconds);
    await saveSetting('ticker_speed_mobile_seconds', mobileSeconds, mobileSeconds);
    setSavingSpeed(false);
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
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary shadow-neon">
          <Newspaper className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">إدارة الأخبار</h2>
          <p className="text-sm text-muted-foreground">كل نوع خبر له طريقة إضافة ومكان ظهور مختلف في الموقع.</p>
        </div>
      </div>

      <Tabs defaultValue="ticker" className="space-y-5">
        <TabsList className="grid h-auto grid-cols-1 gap-2 bg-card p-1 sm:grid-cols-3">
          <TabsTrigger value="ticker" className="gap-2 py-3">
            <Zap className="h-4 w-4" />
            الشريط
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-2 py-3">
            <FileText className="h-4 w-4" />
            صفحة الأخبار
          </TabsTrigger>
          <TabsTrigger value="pulse" className="gap-2 py-3">
            <Newspaper className="h-4 w-4" />
            نبض كأس العالم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ticker" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="شريط الأخبار"
              description="سطر قصير يظهر في شريط الأخبار المتحرك. اكتب السطر واضغط حفظ."
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                value={ticker.title_ar}
                onChange={(event) => setTicker((current) => ({ ...current, title_ar: event.target.value }))}
                className="h-11 flex-1 font-arabic text-right"
                dir="rtl"
                placeholder="مثال: قرعة نارية في دور المجموعات..."
              />
              <Button
                onClick={() => addItem(ticker, () => setTicker(blankTicker()))}
                disabled={saving || !ticker.title_ar.trim()}
                className="h-11 gap-2 font-semibold"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ السطر
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3 sm:flex-row sm:items-end">
              <Field label="سرعة الكمبيوتر (ثواني)" className="sm:w-48">
                <Input
                  type="number"
                  min={25}
                  max={500}
                  value={tickerSpeed}
                  onChange={(event) => setTickerSpeed(event.target.value)}
                  className="h-10 text-center"
                  dir="ltr"
                />
              </Field>
              <Field label="سرعة الموبايل (ثواني)" className="sm:w-48">
                <Input
                  type="number"
                  min={25}
                  max={500}
                  value={tickerSpeedMobile}
                  onChange={(event) => setTickerSpeedMobile(event.target.value)}
                  className="h-10 text-center"
                  dir="ltr"
                />
              </Field>
              <Button
                type="button"
                variant="outline"
                onClick={saveTickerSpeed}
                disabled={savingSpeed}
                className="h-10 gap-2"
              >
                {savingSpeed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ السرعة
              </Button>
              <p className="pb-2 text-xs text-muted-foreground">رقم أقل = حركة أسرع. أقصى رقم 500.</p>
            </div>
          </Card>
          <NewsList items={tickerItems} empty="لا توجد سطور في الشريط حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} />
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="أخبار صفحة الأخبار"
              description="خبر كامل له عنوان وتفاصيل وصورة. لو عندك مصدر خارجي أو صفحة تفاصيل طويلة حط الرابط في خانة اللينك."
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="عنوان الخبر">
                <Input
                  value={article.title_ar}
                  onChange={(event) => setArticle((current) => ({ ...current, title_ar: event.target.value }))}
                  className="h-10 font-arabic text-right"
                  dir="rtl"
                  placeholder="عنوان الخبر..."
                />
              </Field>
              <Field label="التصنيف">
                <Select value={article.category} onValueChange={(value) => setArticle((current) => ({ ...current, category: value }))}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTICLE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="تفاصيل الخبر" className="sm:col-span-2">
                <Textarea
                  value={article.excerpt_ar}
                  onChange={(event) => setArticle((current) => ({ ...current, excerpt_ar: event.target.value }))}
                  rows={5}
                  className="resize-none font-arabic text-right"
                  dir="rtl"
                  placeholder="اكتب تفاصيل الخبر هنا..."
                />
              </Field>
              <Field label="رابط الصورة">
                <Input
                  value={article.image_url}
                  onChange={(event) => setArticle((current) => ({ ...current, image_url: event.target.value }))}
                  className="h-10"
                  dir="ltr"
                  placeholder="https://..."
                />
              </Field>
              <Field label="لينك صفحة الخبر أو المصدر">
                <Input
                  value={article.excerpt_en}
                  onChange={(event) => setArticle((current) => ({ ...current, excerpt_en: event.target.value }))}
                  className="h-10"
                  dir="ltr"
                  placeholder="https://... اختياري"
                />
              </Field>
              <Field label="English title اختياري">
                <Input
                  value={article.title_en}
                  onChange={(event) => setArticle((current) => ({ ...current, title_en: event.target.value }))}
                  className="h-10"
                  dir="ltr"
                  placeholder="Optional"
                />
              </Field>
              <PublishSwitch value={article.is_published} onChange={(value) => setArticle((current) => ({ ...current, is_published: value }))} />
            </div>
            <Button
              onClick={() => addItem(article, () => setArticle(blankArticle()))}
              disabled={saving || !article.title_ar.trim()}
              className="mt-4 gap-2 font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              حفظ الخبر
            </Button>
          </Card>
          <NewsList items={articleItems} empty="لا توجد أخبار كاملة حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} />
        </TabsContent>

        <TabsContent value="pulse" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="نبض كأس العالم"
              description="كارت خفيف في الرئيسية: عنوان قصير وتايتل/تصنيف فقط."
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px_auto]">
              <Input
                value={pulse.title_ar}
                onChange={(event) => setPulse((current) => ({ ...current, title_ar: event.target.value }))}
                className="h-11 font-arabic text-right"
                dir="rtl"
                placeholder="مثال: صلاح ومرموش يقودان مصر..."
              />
              <Input
                value={pulse.title_en}
                onChange={(event) => setPulse((current) => ({ ...current, title_en: event.target.value }))}
                className="h-11"
                dir="ltr"
                placeholder="Title / tag"
              />
              <Button
                onClick={() => addItem(pulse, () => setPulse(blankPulse()))}
                disabled={saving || !pulse.title_ar.trim()}
                className="h-11 gap-2 font-semibold"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ
              </Button>
            </div>
          </Card>
          <NewsList items={pulseItems} empty="لا توجد عناصر في نبض كأس العالم حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-extrabold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PublishSwitch({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
      <div>
        <p className="text-sm font-semibold">نشر الآن</p>
        <p className="text-xs text-muted-foreground">اقفلها لو عايزه مسودة.</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function NewsList({
  items,
  empty,
  onRemove,
  onToggle,
  onReorder,
}: {
  items: ManualNewsRow[];
  empty: string;
  onRemove: (id: string) => Promise<void>;
  onToggle: (id: string, isPublished: boolean) => Promise<void>;
  onReorder: (id1: string, id2: string, createdAt1: string, createdAt2: string) => Promise<void>;
}) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (items.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">{empty}</Card>;
  }

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const visibleItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => {
        const actualIndex = (safePage - 1) * PAGE_SIZE + index;
        return (
        <Card key={item.id} className={`border-border bg-card/70 p-4 ${!item.is_published ? 'opacity-65' : ''}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-row sm:flex-col gap-1 items-center justify-center">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={actualIndex === 0}
                onClick={() => onReorder(item.id, items[actualIndex - 1].id, item.created_at, items[actualIndex - 1].created_at)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={actualIndex === items.length - 1}
                onClick={() => onReorder(item.id, items[actualIndex + 1].id, item.created_at, items[actualIndex + 1].created_at)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title_ar || item.title_en}
                className="h-20 w-full rounded-lg border border-border object-cover sm:w-28"
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
              <h3 className="font-arabic text-base font-bold leading-7 text-foreground">{item.title_ar || item.title_en}</h3>
              {item.excerpt_ar && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt_ar}</p>}
              {item.excerpt_en?.startsWith('http') && (
                <p className="mt-2 truncate text-xs text-primary" dir="ltr">{item.excerpt_en}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={item.is_published} onCheckedChange={(value) => onToggle(item.id, value)} />
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 text-destructive hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        );
      })}
      
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card/60 p-3">
          <div className="text-sm text-muted-foreground font-arabic">
            صفحة {safePage} من {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
              className="gap-1 h-9 px-3"
            >
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="gap-1 h-9 px-3"
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
