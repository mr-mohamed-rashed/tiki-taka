import { Trophy } from 'lucide-react';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { One2Footer } from '@/components/one2/One2Footer';
import { WorldCupRoadmap } from '@/components/one2/WorldCupRoadmap';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function Roadmap() {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <NewsTicker />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-8 py-10">
        <header className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('font-display text-3xl font-extrabold sm:text-4xl', isAr && 'font-arabic')}>
              {isAr ? 'طريق كأس العالم' : 'Road to the World Cup'}
            </h1>
            <p className={cn('text-sm text-muted-foreground', isAr && 'font-arabic')}>
              {isAr ? 'خريطة تأهل 32 فريقا نحو الكأس' : 'A 32-team qualification map leading to the trophy'}
            </p>
          </div>
        </header>

        <WorldCupRoadmap />
      </main>

      <One2Footer />
    </div>
  );
}
