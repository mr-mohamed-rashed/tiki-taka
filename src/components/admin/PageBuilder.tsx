import { useState, useRef } from 'react';
import {
  Monitor, LayoutGrid, Radio, Trophy, Newspaper, Play, Image as ImageIcon,
  Megaphone, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight,
  Save, Check, Loader2, GripVertical, Settings, Type, Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageSections, type PageSection } from '@/hooks/usePageSections';
import { useAdBanners, type AdBannerRow } from '@/hooks/useAdBanners';
import { useManualNews, type ManualNewsRow } from '@/hooks/useManualNews';
import { cn } from '@/lib/utils';

// ─── Section type icons ───────────────────────────────────────────────────────
const SECTION_ICONS: Record<string, React.ReactNode> = {
  hero:          <Monitor className="h-4 w-4" />,
  matchCenter:   <Radio className="h-4 w-4" />,
  apiWidget:     <LayoutGrid className="h-4 w-4" />,
  goldenBoot:    <Trophy className="h-4 w-4" />,
  worldCupPulse: <Newspaper className="h-4 w-4" />,
  highlights:    <Play className="h-4 w-4" />,
  header:        <Type className="h-4 w-4" />,
  newsgrid:      <Newspaper className="h-4 w-4" />,
  liveSection:   <Radio className="h-4 w-4" />,
  ad:            <Megaphone className="h-4 w-4" />,
};

const PAGES = [
  { key: 'home',      label: 'Home',       labelAr: 'الرئيسية' },
  { key: 'news',      label: 'News',       labelAr: 'الأخبار' },
  { key: 'live',      label: 'Live',       labelAr: 'مباشر' },
  { key: 'groups',    label: 'Groups',     labelAr: 'المجموعات' },
  { key: 'standings', label: 'Standings',  labelAr: 'الترتيب' },
];

// ─── Main PageBuilder ─────────────────────────────────────────────────────────
export function PageBuilder() {
  const [activePage, setActivePage] = useState('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<PageSection>>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'label' | 'bg' | 'ads' | 'news'>('label');

  const { sections, loading, upsertMany, add, remove } = usePageSections(activePage);
  const { banners, save: saveBanner, update: updateBanner, remove: removeBanner, toggle: toggleBanner } = useAdBanners();
  const { news: newsItems, save: saveNews, update: updateNews, remove: removeNews, togglePublish } = useManualNews();

  // ── Pending draft logic ──────────────────────────────────────────────────────
  const getSection = (id: string): PageSection => {
    const base = sections.find(s => s.id === id)!;
    const patch = pendingChanges.get(id) ?? {};
    return { ...base, ...patch };
  };

  const patch = (id: string, changes: Partial<PageSection>) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(id, { ...(next.get(id) ?? {}), ...changes });
      return next;
    });
  };

  const saveAll = async () => {
    setSaving(true);
    const rows: Partial<PageSection>[] = [];
    pendingChanges.forEach((changes, id) => {
      const base = sections.find(s => s.id === id);
      if (base) rows.push({ ...base, ...changes });
    });
    if (rows.length) await upsertMany(rows);
    setPendingChanges(new Map());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const hasPending = pendingChanges.size > 0;
  const selected = selectedId ? sections.find(s => s.id === selectedId) : null;
  const selectedDraft = selectedId ? getSection(selectedId) : null;

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col gap-0 min-h-[70vh]">
      {/* ── Page tab strip ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {PAGES.map(p => (
          <button
            key={p.key}
            onClick={() => { setActivePage(p.key); setSelectedId(null); }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold border transition-all',
              activePage === p.key
                ? 'bg-primary text-primary-foreground border-primary shadow-neon'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
            )}
          >
            {p.label}
          </button>
        ))}
        <AddSectionButton page={activePage} currentCount={sections.length} onAdd={add} />
      </div>

      {/* ── Two-column builder ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

        {/* LEFT: Section list */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Sections — click to edit</p>
          {sections.map(s => {
            const draft = pendingChanges.get(s.id);
            const isPending = !!draft;
            const isSelected = selectedId === s.id;
            const displaySection = { ...s, ...(draft ?? {}) };

            return (
              <div
                key={s.id}
                onClick={() => setSelectedId(isSelected ? null : s.id)}
                className={cn(
                  'group relative flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-neon'
                    : 'border-border bg-gradient-card hover:border-primary/50 hover:bg-primary/5',
                  !displaySection.is_visible && 'opacity-50',
                )}
              >
                {/* Drag handle visual */}
                <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />

                {/* Icon */}
                <div className={cn('p-2 rounded-lg flex-shrink-0', isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                  {SECTION_ICONS[s.section_key] ?? <LayoutGrid className="h-4 w-4" />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{displaySection.name_en || s.section_key}</span>
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{displaySection.subtitle_en || displaySection.name_ar}</p>
                </div>

                {/* Visibility toggle + delete */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); patch(s.id, { is_visible: !displaySection.is_visible }); }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title={displaySection.is_visible ? 'Hide section' : 'Show section'}
                  >
                    {displaySection.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('Delete section?')) { remove(s.id); if (selectedId === s.id) setSelectedId(null); } }}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* BG preview chip */}
                {(displaySection.bg_color || displaySection.bg_image) && (
                  <div
                    className="w-5 h-5 rounded-md border border-border flex-shrink-0"
                    style={{ background: displaySection.bg_color || `url(${displaySection.bg_image}) center/cover` }}
                  />
                )}
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="py-10 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              No sections yet. Click "Add Section" above.
            </div>
          )}
        </div>

        {/* RIGHT: Edit panel */}
        <div className="lg:col-span-3 sticky top-24">
          {selectedDraft ? (
            <Card className="border-primary/40 bg-gradient-card overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
                  {SECTION_ICONS[selected?.section_key ?? ''] ?? <Settings className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{selectedDraft.name_en || selected?.section_key}</p>
                  <p className="text-xs text-muted-foreground font-mono">{activePage} / {selected?.section_key}</p>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary text-xs">Editing</Badge>
              </div>

              {/* Edit sub-tabs */}
              <div className="flex border-b border-border">
                {(['label', 'bg', 'ads', 'news'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 py-2.5 text-xs font-semibold capitalize transition-colors border-b-2',
                      activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab === 'label' && <><Type className="h-3 w-3 inline me-1" />Labels</>}
                    {tab === 'bg' && <><Palette className="h-3 w-3 inline me-1" />Background</>}
                    {tab === 'ads' && <><Megaphone className="h-3 w-3 inline me-1" />Ads</>}
                    {tab === 'news' && <><Newspaper className="h-3 w-3 inline me-1" />News</>}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {activeTab === 'label' && (
                  <LabelEditor draft={selectedDraft} onChange={changes => patch(selectedId!, changes)} />
                )}
                {activeTab === 'bg' && (
                  <BgEditor draft={selectedDraft} onChange={changes => patch(selectedId!, changes)} />
                )}
                {activeTab === 'ads' && (
                  <AdsInlineEditor
                    banners={banners}
                    page={activePage}
                    sectionKey={selected?.section_key ?? ''}
                    onSave={saveBanner}
                    onUpdate={updateBanner}
                    onRemove={removeBanner}
                    onToggle={toggleBanner}
                  />
                )}
                {activeTab === 'news' && (
                  <NewsInlineEditor
                    newsItems={newsItems}
                    onSave={saveNews}
                    onUpdate={updateNews}
                    onRemove={removeNews}
                    onToggle={togglePublish}
                  />
                )}
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-2xl text-center p-8">
              <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                <Settings className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-muted-foreground">Click any section to edit it</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Select a block on the left to open its editor</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Save All ── */}
      {hasPending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={saveAll}
            disabled={saving}
            size="lg"
            className="shadow-elevated shadow-primary/30 font-bold px-8 gap-2 text-base"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : `Save All Changes (${pendingChanges.size})`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-editors ──────────────────────────────────────────────────────────────

function LabelEditor({ draft, onChange }: { draft: PageSection; onChange: (c: Partial<PageSection>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Title (English)</Label>
          <Input value={draft.name_en} onChange={e => onChange({ name_en: e.target.value })} className="h-9" placeholder="Section title..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">عنوان (عربي)</Label>
          <Input value={draft.name_ar} onChange={e => onChange({ name_ar: e.target.value })} className="h-9 font-arabic text-right" dir="rtl" placeholder="عنوان القسم..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subtitle (English)</Label>
          <Input value={draft.subtitle_en} onChange={e => onChange({ subtitle_en: e.target.value })} className="h-9" placeholder="Subtitle..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">وصف (عربي)</Label>
          <Input value={draft.subtitle_ar} onChange={e => onChange({ subtitle_ar: e.target.value })} className="h-9 font-arabic text-right" dir="rtl" placeholder="وصف القسم..." />
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Switch checked={draft.is_visible} onCheckedChange={v => onChange({ is_visible: v })} />
        <div>
          <p className="text-sm font-semibold">Section Visible</p>
          <p className="text-xs text-muted-foreground">Toggle to show/hide this section on the page</p>
        </div>
      </div>
    </div>
  );
}

function BgEditor({ draft, onChange }: { draft: PageSection; onChange: (c: Partial<PageSection>) => void }) {
  const presets = [
    { label: 'None',    color: '', image: '' },
    { label: 'Dark',    color: '#0a0a0a', image: '' },
    { label: 'Primary', color: 'hsl(142 70% 8%)', image: '' },
    { label: 'Gold',    color: 'hsl(45 90% 8%)', image: '' },
    { label: 'Blue',    color: 'hsl(220 60% 8%)', image: '' },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Background Color</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={draft.bg_color || '#000000'}
            onChange={e => onChange({ bg_color: e.target.value })}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
          />
          <Input
            value={draft.bg_color}
            onChange={e => onChange({ bg_color: e.target.value })}
            placeholder="#000000 or hsl(...)"
            className="h-9 font-mono text-sm"
          />
          {draft.bg_color && (
            <button onClick={() => onChange({ bg_color: '' })} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => onChange({ bg_color: p.color, bg_image: p.image })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:border-primary/50 transition-colors"
              style={{ background: p.color || 'transparent' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Background Image URL</Label>
        <Input
          value={draft.bg_image}
          onChange={e => onChange({ bg_image: e.target.value })}
          placeholder="https://images.unsplash.com/..."
          className="h-9"
        />
        {draft.bg_image && (
          <div className="relative h-24 rounded-lg overflow-hidden border border-border">
            <img src={draft.bg_image} alt="bg preview" className="w-full h-full object-cover" />
            <button onClick={() => onChange({ bg_image: '' })} className="absolute top-2 right-2 bg-background/80 text-xs px-2 py-1 rounded-md border border-border hover:text-destructive">
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Live preview swatch */}
      {(draft.bg_color || draft.bg_image) && (
        <div
          className="h-16 rounded-xl border border-border flex items-center justify-center text-xs font-semibold text-white/70"
          style={{
            background: draft.bg_image
              ? `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${draft.bg_image}) center/cover`
              : draft.bg_color,
          }}
        >
          Background Preview
        </div>
      )}
    </div>
  );
}

// ─── Ads inline editor ────────────────────────────────────────────────────────
const POSITIONS = ['hero', 'sidebar', 'news-page', 'live-page', 'custom'];
const blankAd = (): Omit<AdBannerRow, 'id' | 'created_at'> => ({ position: 'hero', title: '', image_url: '', link_url: '', is_active: true, sort_order: 0, width: '280px', height: 'auto' });

function AdsInlineEditor({ banners, page, sectionKey, onSave, onUpdate, onRemove, onToggle }: {
  banners: AdBannerRow[];
  page: string;
  sectionKey: string;
  onSave: (b: Omit<AdBannerRow, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, b: Partial<AdBannerRow>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onToggle: (id: string, v: boolean) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blankAd());
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdBannerRow>>({});
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.link_url) return;
    setSaving(true);
    await onSave(form);
    setForm(blankAd());
    setAdding(false);
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Ad banners across all pages</p>
        <Button size="sm" variant={adding ? 'outline' : 'default'} onClick={() => setAdding(a => !a)} className="gap-1 h-7 text-xs">
          {adding ? 'Cancel' : <><Plus className="h-3 w-3" /> Add Ad</>}
        </Button>
      </div>

      {adding && (
        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/30">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] text-muted-foreground">Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-8 text-xs" /></div>
            <div><Label className="text-[10px] text-muted-foreground">Position</Label>
              <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full h-8 rounded-md border border-border bg-background text-xs px-2">
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
          </div>
          <div><Label className="text-[10px] text-muted-foreground">Image URL</Label>
            <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="h-8 text-xs" placeholder="https://..." /></div>
          <div><Label className="text-[10px] text-muted-foreground">Link URL *</Label>
            <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} className="h-8 text-xs" placeholder="https://..." /></div>
          <div><Label className="text-[10px] text-muted-foreground">Width</Label>
            <Input value={form.width} onChange={e => setForm(f => ({ ...f, width: e.target.value }))} className="h-8 text-xs" placeholder="280px" /></div>
          <div><Label className="text-[10px] text-muted-foreground">Height</Label>
            <Input value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="h-8 text-xs" placeholder="auto" /></div>
          <Button size="sm" onClick={handleAdd} disabled={saving || !form.link_url} className="h-7 text-xs gap-1">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save Ad
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {banners.map(b => (
          <div key={b.id} className={cn('flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30', !b.is_active && 'opacity-50')}>
            {b.image_url && <img src={b.image_url} alt={b.title} className="w-10 h-8 object-cover rounded flex-shrink-0" />}
            {!b.image_url && <div className="w-10 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0"><Megaphone className="h-3.5 w-3.5 text-muted-foreground" /></div>}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{b.title || 'Untitled'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{b.link_url}</p>
            </div>
            <Switch checked={b.is_active} onCheckedChange={v => onToggle(b.id, v)} />
            <button onClick={() => onRemove(b.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {banners.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No ads yet.</p>}
      </div>
    </div>
  );
}

// ─── News inline editor ────────────────────────────────────────────────────────
const CATEGORIES = ['World Cup 2026','Group Stage','Squads','Tactics','Transfer','Preview','Interview','Stats'];
const blankNews = (): Omit<ManualNewsRow, 'id' | 'created_at'> => ({
  title_en: '', title_ar: '', excerpt_en: '', excerpt_ar: '',
  category: 'World Cup 2026',
  image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  published_at: new Date().toISOString().slice(0, 10),
  is_published: true,
});

function NewsInlineEditor({ newsItems, onSave, onUpdate, onRemove, onToggle }: {
  newsItems: ManualNewsRow[];
  onSave: (n: Omit<ManualNewsRow, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, n: Partial<ManualNewsRow>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onToggle: (id: string, v: boolean) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blankNews());
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.title_en && !form.title_ar) return;
    setSaving(true);
    await onSave(form);
    setForm(blankNews());
    setAdding(false);
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Manual news articles ({newsItems.length})</p>
        <Button size="sm" variant={adding ? 'outline' : 'default'} onClick={() => setAdding(a => !a)} className="gap-1 h-7 text-xs">
          {adding ? 'Cancel' : <><Plus className="h-3 w-3" />Add Article</>}
        </Button>
      </div>

      {adding && (
        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/30">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] text-muted-foreground">Title EN</Label>
              <Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} className="h-8 text-xs" /></div>
            <div><Label className="text-[10px] text-muted-foreground">عنوان AR</Label>
              <Input value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} className="h-8 text-xs font-arabic text-right" dir="rtl" /></div>
          </div>
          <div><Label className="text-[10px] text-muted-foreground">Excerpt EN</Label>
            <Textarea value={form.excerpt_en} onChange={e => setForm(f => ({ ...f, excerpt_en: e.target.value }))} rows={2} className="text-xs resize-none" /></div>
          <div><Label className="text-[10px] text-muted-foreground">ملخص AR</Label>
            <Textarea value={form.excerpt_ar} onChange={e => setForm(f => ({ ...f, excerpt_ar: e.target.value }))} rows={2} className="text-xs resize-none font-arabic text-right" dir="rtl" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] text-muted-foreground">Category</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-8 rounded-md border border-border bg-background text-xs px-2">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><Label className="text-[10px] text-muted-foreground">Date</Label>
              <Input type="date" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} className="h-8 text-xs" /></div>
          </div>
          <div><Label className="text-[10px] text-muted-foreground">Image URL</Label>
            <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="h-8 text-xs" placeholder="https://..." /></div>
          <Button size="sm" onClick={handleAdd} disabled={saving || (!form.title_en && !form.title_ar)} className="h-7 text-xs gap-1">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Publish
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {newsItems.map(n => (
          <div key={n.id} className={cn('flex items-start gap-2 p-2.5 rounded-lg border border-border bg-muted/30', !n.is_published && 'opacity-50')}>
            {n.image_url && <img src={n.image_url} alt={n.title_en} className="w-10 h-8 object-cover rounded flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{n.title_en || n.title_ar}</p>
              {n.title_ar && <p className="text-[10px] text-muted-foreground truncate font-arabic">{n.title_ar}</p>}
              <Badge variant="outline" className="text-[9px] mt-0.5 border-border px-1 py-0">{n.category}</Badge>
            </div>
            <Switch checked={n.is_published} onCheckedChange={v => onToggle(n.id, v)} />
            <button onClick={() => onRemove(n.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {newsItems.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No articles yet.</p>}
      </div>
    </div>
  );
}

// ─── Add Section button ────────────────────────────────────────────────────────
function AddSectionButton({ page, currentCount, onAdd }: { page: string; currentCount: number; onAdd: (r: Omit<PageSection, 'id'>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!key) return;
    setSaving(true);
    await onAdd({ page, section_key: key.toLowerCase().replace(/\s+/g, '_'), name_en: nameEn || key, name_ar: nameAr || key, subtitle_en: '', subtitle_ar: '', bg_color: '', bg_image: '', is_visible: true, sort_order: currentCount + 1 });
    setKey(''); setNameEn(''); setNameAr(''); setOpen(false); setSaving(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary text-sm font-semibold transition-all">
      <Plus className="h-4 w-4" /> Add Section
    </button>
  );

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-primary/40 bg-primary/5 flex-wrap">
      <Input value={key} onChange={e => setKey(e.target.value)} placeholder="section_key" className="h-8 w-32 text-xs font-mono" />
      <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Name EN" className="h-8 w-28 text-xs" />
      <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="اسم AR" className="h-8 w-28 text-xs font-arabic" dir="rtl" />
      <Button size="sm" onClick={submit} disabled={saving || !key} className="h-8 text-xs gap-1">
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-8 text-xs">Cancel</Button>
    </div>
  );
}
