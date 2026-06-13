import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, ExternalLink, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export type ArticleCategory =
  | 'World Cup 2026'
  | 'Group Stage'
  | 'Groups'
  | 'Squads'
  | 'Tactics'
  | 'Transfer'
  | 'Preview'
  | 'Results'
  | 'Highlights'
  | 'Interview'
  | 'Stats';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  category: ArticleCategory | string;
  image: string;
  timestamp: string;
  author?: string;
  sourceUrl?: string;
  detailUrl?: string;
}

const categoryColors: Record<string, string> = {
  'World Cup 2026': 'bg-primary text-primary-foreground shadow-neon',
  'Group Stage': 'bg-primary/80 text-primary-foreground',
  Groups: 'bg-primary/20 text-primary border border-primary/40',
  Squads: 'bg-gold text-gold-foreground',
  Tactics: 'bg-muted text-foreground border border-primary/40',
  Transfer: 'bg-primary/20 text-primary border border-primary/40',
  Preview: 'bg-live/20 text-live border border-live/40',
  Results: 'bg-primary/20 text-primary border border-primary/40',
  Highlights: 'bg-live/20 text-live border border-live/40',
  Interview: 'bg-muted text-foreground border border-border',
  Stats: 'bg-muted text-foreground border border-border',
};

export function ArticleCard({ title, excerpt, category, image, timestamp, author, sourceUrl, detailUrl }: ArticleCardProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isArabic = lang === 'ar';
  const badgeClass = categoryColors[category] ?? 'bg-primary/20 text-primary border border-primary/40';

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden border border-border bg-gradient-card hover:border-primary/50 hover:shadow-card transition-all duration-200 hover:-translate-y-0.5"
        onClick={() => detailUrl ? navigate(detailUrl) : setOpen(true)}
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className={`absolute top-3 left-3 text-xs font-bold ${badgeClass}`}>{category}</Badge>
        </div>
        <CardContent className="p-4">
          <h3 className={cn('text-base font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug', isArabic && 'font-arabic')}>
            {title}
          </h3>
          <p className={cn('text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed', isArabic && 'font-arabic')}>
            {excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timestamp}
              </span>
              {author && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {author}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {isArabic ? 'اقرأ المزيد' : 'Read more'}
              <ChevronRight className={cn('h-3.5 w-3.5', isArabic && 'rotate-180')} />
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="relative aspect-video overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <Badge className={`absolute top-4 left-4 text-xs font-bold ${badgeClass}`}>{category}</Badge>
          </div>

          <div className="p-6">
            <DialogHeader>
              <DialogTitle className={cn('text-xl font-display font-extrabold leading-snug', isArabic && 'font-arabic')}>
                {title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 mb-5">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {timestamp}
              </span>
              {author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {author}
                </span>
              )}
            </div>

            <p className={cn('text-foreground/90 leading-relaxed text-sm whitespace-pre-line', isArabic && 'font-arabic')}>
              {excerpt}
            </p>

            {sourceUrl && (
              <Button asChild className="mt-5 gap-2 font-bold">
                <a href={sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {isArabic ? 'فتح صفحة الخبر' : 'Open source'}
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
