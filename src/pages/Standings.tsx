import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { One2Footer } from '@/components/one2/One2Footer';
import { TopScorersTable } from '@/components/one2/TopScorersTable';
import { BestPlayersTable } from '@/components/one2/BestPlayersTable';
import { CardsTable } from '@/components/one2/CardsTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Star, Award, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const Standings = () => {
  const { lang, dir } = useLanguage();
  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <NewsTicker />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-lg bg-primary/15 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('font-display font-extrabold text-3xl sm:text-4xl', lang === 'ar' && 'font-arabic')}>
              {t('standingsTitle', lang)}
            </h1>
            <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
              {t('standingsSub', lang)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="scorers" className="w-full">
          <TabsList className="bg-card border border-border h-auto p-1 grid grid-cols-3 w-full max-w-xl mb-6">
            <TabsTrigger value="scorers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold">
              <Trophy className="h-4 w-4" />
              <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('topScorers', lang)}</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold">
              <Star className="h-4 w-4" />
              <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('bestPlayers', lang)}</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span className={lang === 'ar' ? 'font-arabic' : ''}>{lang === 'ar' ? 'البطاقات' : 'Cards'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scorers"><TopScorersTable /></TabsContent>
          <TabsContent value="players"><BestPlayersTable /></TabsContent>
          <TabsContent value="cards"><CardsTable /></TabsContent>
        </Tabs>
      </main>

      <One2Footer />
    </div>
  );
};

export default Standings;
