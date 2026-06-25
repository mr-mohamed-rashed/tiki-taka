import { NavLink } from 'react-router-dom';
import { Newspaper, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useManualNews } from '@/hooks/useManualNews';
import { useRealNews, formatForCards } from '@/hooks/useRealNews';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80';
const SYSTEM_CATEGORIES = new Set(['Ticker', 'Pulse']);

export function TrendingSidebar() {
  const { lang } = useLanguage();
  const { news, loading: manualLoading } = useManualNews(true);
  const { data: realNews, isLoading: realLoading } = useRealNews(lang);
  
  const manualArticles = news
    .filter((item) => !SYSTEM_CATEGORIES.has(item.category))
    .slice(0, 3);
    
  const loading = manualLoading || realLoading;
  
  // Use manual articles if available, otherwise fallback to real news
  const articles = manualArticles.length > 0 
    ? manualArticles 
    : (realNews ? formatForCards(realNews, lang).slice(0, 3).map(n => ({
        id: n.id,
        title_en: n.title,
        title_ar: n.title,
        category: n.category,
        image_url: FALLBACK_IMAGE,
        published_at: n.date
      })) : []);

  return (
    <Card className="overflow-hidden border-border bg-gradient-card">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className={cn('font-display text-xl font-extrabold', lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'الأكثر تداولًا' : 'Trending Now'}
            </h3>
            <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'آخر 3 أخبار من صفحة الأخبار' : 'Latest 3 stories from the news page'}
            </p>
          </div>
        </div>
        <NavLink to="/news" className="text-sm font-bold text-primary hover:text-primary-glow">
          {lang === 'ar' ? 'كل الأخبار' : 'All news'}
        </NavLink>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-lg bg-muted/30" />
          ))
        ) : articles.length > 0 ? (
          articles.map((item) => {
            const title = lang === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar;
            const isManual = !('link' in item) || !(item as any).link;
            
            const cardContent = (
              <>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={item.image_url || FALLBACK_IMAGE}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground text-[10px]">
                    {item.category}
                  </Badge>
                </div>
                <div className="p-3">
                  <h4 className={cn('line-clamp-2 text-sm font-bold leading-6 group-hover:text-primary', lang === 'ar' && 'font-arabic')}>
                    {title}
                  </h4>
                  <p className="mt-2 text-[11px] text-muted-foreground" dir="ltr">{item.published_at}</p>
                </div>
              </>
            );

            const className = "group overflow-hidden rounded-lg border border-border bg-background/55 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card block";

            if (isManual) {
              const urlId = (item as any).post_id || item.id;
              return (
                <NavLink key={item.id} to={`/news/sports/${urlId}`} className={className}>
                  {cardContent}
                </NavLink>
              );
            }

            return (
              <a
                key={item.id}
                href={(item as any).link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {cardContent}
              </a>
            );
          })
        ) : (
          <div className="col-span-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            <Newspaper className="h-4 w-4 text-primary" />
            {lang === 'ar' ? 'أضف أخبار صفحة الأخبار من الداش بورد لتظهر هنا.' : 'Add news articles from the dashboard to show them here.'}
          </div>
        )}
      </div>
    </Card>
  );
}
