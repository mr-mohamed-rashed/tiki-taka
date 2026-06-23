import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useManualNews, type ManualNewsRow } from '@/hooks/useManualNews';
import { Loader2, Save } from 'lucide-react';

const ARTICLE_CATEGORIES = [
  'World Cup 2026',
  'Group Stage',
  'Groups',
  'Squads',
  'Tactics',
  'Transfer',
  'Preview',
  'Results',
  'Highlights',
  'Interview',
  'Stats',
  'Ticker',
  'Pulse'
];

interface EditNewsDialogProps {
  article: ManualNewsRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNewsDialog({ article, open, onOpenChange }: EditNewsDialogProps) {
  const { update } = useManualNews();
  const [formData, setFormData] = useState<Partial<ManualNewsRow>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData(article);
    }
  }, [article]);

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    await update(article.id, formData);
    setSaving(false);
    onOpenChange(false);
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">تعديل الخبر</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-1 block">عنوان الخبر</Label>
            <Input 
              value={formData.title_ar || ''} 
              onChange={(e) => setFormData({...formData, title_ar: e.target.value})} 
              className="font-arabic"
            />
          </div>
          <div>
            <Label className="mb-1 block">التصنيف</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">التفاصيل</Label>
            <Textarea 
              value={formData.excerpt_ar || ''} 
              onChange={(e) => setFormData({...formData, excerpt_ar: e.target.value})} 
              rows={5}
              className="resize-none font-arabic"
            />
          </div>
          <div>
            <Label className="mb-1 block">رابط الصورة</Label>
            <Input 
              dir="ltr" 
              value={formData.image_url || ''} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
            />
          </div>
          <div>
            <Label className="mb-1 block">رابط المصدر (اختياري)</Label>
            <Input 
              dir="ltr" 
              value={formData.excerpt_en || ''} 
              onChange={(e) => setFormData({...formData, excerpt_en: e.target.value})} 
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full mt-4 font-bold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التعديلات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
