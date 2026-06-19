import { Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Calendar, ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditModeToggle } from '@/components/one2/EditModeToggle';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { One2Footer } from '@/components/one2/One2Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useManualNews } from '@/hooks/useManualNews';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80';

export default function NewsArticle() {
  const { id } = useParams();
  const { lang, dir } = useLanguage();
  const { news, loading } = useManualNews(false);
  const article = news.find((item) => item.id === id);
  const isArabic = lang === 'ar';

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <NewsTicker />
        <Navigation />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!article) return <Navigate to="/news" replace />;

  const title = isArabic ? article.title_ar || article.title_en : article.title_en || article.title_ar;
  const details = isArabic ? article.excerpt_ar || article.excerpt_en : article.excerpt_en || article.excerpt_ar;
  const sourceUrl = article.excerpt_en?.startsWith('http') ? article.excerpt_en : '';

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <EditModeToggle />
      <NewsTicker />
      <Navigation />
      <main className="container mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <a href="/news">
            <ArrowRight className={cn('h-4 w-4', isArabic ? '' : 'rotate-180')} />
            {isArabic ? 'العودة للأخبار' : 'Back to news'}
          </a>
        </Button>

        <article className="overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card">
          <div className="relative w-full max-h-[500px] overflow-hidden bg-black flex items-center justify-center">
            {/* Blurred Background for un-filled areas */}
            <div 
              className="absolute inset-0 opacity-40 blur-2xl scale-110"
              style={{ backgroundImage: `url(${article.image_url || FALLBACK_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            
            {/* Actual Image */}
            <img 
              src={article.image_url || FALLBACK_IMAGE} 
              alt={title} 
              className="relative z-10 w-full h-auto max-h-[500px] object-contain" 
            />
            
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-background/10 to-transparent pointer-events-none" />
            <Badge className="absolute bottom-5 right-5 z-30 bg-primary text-primary-foreground shadow-neon">
              {article.category}
            </Badge>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Newspaper className="h-4 w-4 text-primary" />
                {isArabic ? 'أرشيف كأس العالم 2026' : 'World Cup 2026 archive'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {article.published_at}
              </span>
            </div>

            <h1 className={cn('font-display text-3xl font-extrabold leading-tight sm:text-5xl', isArabic && 'font-arabic')}>
              {title}
            </h1>
            <p className={cn('mt-6 whitespace-pre-line text-base leading-8 text-foreground/85', isArabic && 'font-arabic')}>
              {details}
            </p>

            {sourceUrl && (
              <Button asChild className="mt-8 gap-2 font-bold">
                <a href={sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {isArabic ? 'فتح المصدر' : 'Open source'}
                </a>
              </Button>
            )}
          </div>
        </article>
      </main>
      <One2Footer />
    </div>
  );
}
