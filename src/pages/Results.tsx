import { CheckCircle2 } from 'lucide-react';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { One2Footer } from '@/components/one2/One2Footer';
import { MatchCenter } from '@/components/one2/MatchCenter';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const Results = () => {
  const { lang, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <NewsTicker />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-8">
        <header className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/15 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('font-display font-extrabold text-3xl sm:text-4xl', lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'نتائج المباريات' : 'Match Results'}
            </h1>
            <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'تابع نتائج كأس العالم 2026 فور تحديثها.' : 'Follow World Cup 2026 results as they update.'}
            </p>
          </div>
        </header>

        <MatchCenter defaultTab="results" />
      </main>

      <One2Footer />
    </div>
  );
};

export default Results;
