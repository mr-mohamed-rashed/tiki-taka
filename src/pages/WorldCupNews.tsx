import { Loader2, Newspaper, Sparkles } from 'lucide-react';
import { AdBanner } from '@/components/tikitaka/AdBanner';
import { AdSlotSelector } from '@/components/tikitaka/AdSlotSelector';
import { EditModeToggle } from '@/components/tikitaka/EditModeToggle';
import { GoogleAuthGate } from '@/components/tikitaka/GoogleAuthGate';
import { Navigation } from '@/components/tikitaka/Navigation';
import { NewsTicker } from '@/components/tikitaka/NewsTicker';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { ArticleCard } from '@/components/sports/ArticleCard';
import { useLanguage } from '@/context/LanguageContext';
import { useRealNews, formatForCards } from '@/hooks/useRealNews';
import { useTrackVisit } from '@/hooks/useVisitTracking';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const NEWS_IMAGES = [
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
];

function NewsContent() {
  const { lang } = useLanguage();
  const { data: realNews, isLoading } = useRealNews(lang);
  const articles = formatForCards(realNews, lang);

  useTrackVisit({ eventType: 'news_view', page: '/news' });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className={cn(lang === 'ar' && 'font-arabic')}>
          {lang === 'ar' ? 'جاري جلب أحدث الأخبار...' : 'Fetching latest news...'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles?.map((article, index) => (
        <ArticleCard
          key={article.id || index}
          title={article.title}
          excerpt={article.summary}
          category={article.category}
          image={NEWS_IMAGES[index % NEWS_IMAGES.length]}
          timestamp={article.date}
          author={lang === 'ar' ? 'تيكي تاكا AI' : 'Tiki-Taka AI'}
        />
      ))}
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
              <h1 className={cn('font-display font-extrabold text-3xl sm:text-4xl', lang === 'ar' && 'font-arabic')}>{t('newsTitle', lang)}</h1>
              <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar'
                  ? 'آخر أخبار كأس العالم 2026 من مصادر موثوقة.'
                  : 'Verified World Cup 2026 news from trusted sources.'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className={cn(lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'تجميع ذكي' : 'Smart Aggregation'}
            </span>
          </div>
          <AdBanner slotId="news-sidebar-1" />
        </div>

        <GoogleAuthGate
          title={lang === 'ar' ? 'سجل دخولك لقراءة الأخبار' : 'Sign in to read news'}
          description={lang === 'ar'
            ? 'الدخول مجاني بحساب Google. سنسجل زيارة الأخبار فقط لتحليل الجمهور وتحسين المحتوى.'
            : 'Google sign-in is free. We only record a news visit to understand audience interest.'}
        >
          <NewsContent />
        </GoogleAuthGate>
      </main>
      <TikiTakaFooter />
    </div>
  );
};

export default WorldCupNews;
