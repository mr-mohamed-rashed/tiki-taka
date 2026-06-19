import { Loader2, Newspaper, Sparkles } from 'lucide-react';
import { AdBanner } from '@/components/one2/AdBanner';
import { AdSlotSelector } from '@/components/one2/AdSlotSelector';
import { EditModeToggle } from '@/components/one2/EditModeToggle';
import { GoogleAuthGate } from '@/components/one2/GoogleAuthGate';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { One2Footer } from '@/components/one2/One2Footer';
import { ArticleCard } from '@/components/sports/ArticleCard';
import { useLanguage } from '@/context/LanguageContext';
import { useManualNews } from '@/hooks/useManualNews';
import { useTrackVisit } from '@/hooks/useVisitTracking';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const NEWS_IMAGES = [
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
];

const SYSTEM_CATEGORIES = new Set(['Ticker', 'Pulse']);

function NewsContent() {
  const { lang } = useLanguage();
  const { news: manualNews, loading: manualLoading } = useManualNews(true);
  const manualArticles = manualNews.filter((item) => !SYSTEM_CATEGORIES.has(item.category));

  useTrackVisit({ eventType: 'news_view', page: '/news' });

  if (manualLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className={cn(lang === 'ar' && 'font-arabic')}>
          {lang === 'ar' ? 'جاري جلب أحدث الأخبار...' : 'Fetching latest news...'}
        </p>
      </div>
    );
  }

  if (manualArticles.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {manualArticles.map((article, index) => (
          <ArticleCard
            key={article.id}
            title={lang === 'ar' ? article.title_ar || article.title_en : article.title_en || article.title_ar}
            excerpt={lang === 'ar' ? article.excerpt_ar || article.excerpt_en : article.excerpt_en || article.excerpt_ar}
            category={article.category}
            image={article.image_url || NEWS_IMAGES[index % NEWS_IMAGES.length]}
            timestamp={article.published_at}
            author={lang === 'ar' ? 'وان تو' : 'One2'}
            sourceUrl={article.excerpt_en?.startsWith('http') ? article.excerpt_en : undefined}
            detailUrl={`/news/${article.id}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 p-10 text-center text-muted-foreground">
      <Newspaper className="mx-auto mb-3 h-9 w-9 text-primary" />
      <p className={cn('font-bold', lang === 'ar' && 'font-arabic')}>
        {lang === 'ar' ? 'لا توجد أخبار منشورة حتى الآن' : 'No published news yet'}
      </p>
      <p className={cn('mt-1 text-sm', lang === 'ar' && 'font-arabic')}>
        {lang === 'ar' ? 'أضف أول خبر من الداش بورد وسيظهر هنا.' : 'Add the first article from the dashboard and it will appear here.'}
      </p>
    </div>
  );
}

const WorldCupNews = () => {
  const { lang, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <EditModeToggle />
      <NewsTicker />
      <Navigation />
      <main className="container mx-auto px-4 lg:px-8 py-10">
        <AdSlotSelector location="news-page" onAdd={() => {}} />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/15 text-primary">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('font-display font-extrabold text-3xl sm:text-4xl', lang === 'ar' && 'font-arabic')}>
                {t('newsTitle', lang)}
              </h1>
              <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar'
                  ? 'آخر أخبار كأس العالم 2026 من لوحة التحكم والمصادر الموثوقة.'
                  : 'World Cup 2026 news from the dashboard and trusted sources.'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className={cn(lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'تحديث ذكي' : 'Smart Updates'}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <AdBanner slotId="news-sidebar-1" />
            <AdBanner slotId="news-sidebar-2" />
          </div>
        </div>

        <GoogleAuthGate
          title={lang === 'ar' ? 'سجل دخولك لقراءة الأخبار' : 'Sign in to read news'}
          description={lang === 'ar'
            ? 'الدخول مجاني بحساب Google. نسجل زيارة الأخبار فقط لتحليل الجمهور وتحسين المحتوى.'
            : 'Google sign-in is free. We only record a news visit to understand audience interest.'}
        >
          <NewsContent />
        </GoogleAuthGate>
      </main>
      <One2Footer />
    </div>
  );
};

export default WorldCupNews;
