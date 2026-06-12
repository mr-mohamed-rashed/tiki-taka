import { Navigation } from '@/components/tikitaka/Navigation';
import { NewsTicker } from '@/components/tikitaka/NewsTicker';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { GroupTables } from '@/components/tikitaka/GroupTables';
import { MatchCenter } from '@/components/tikitaka/MatchCenter';
import { Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const Groups = () => {
  const { lang, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <NewsTicker />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-10">
        <header className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/15 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('font-display font-extrabold text-3xl sm:text-4xl', lang === 'ar' && 'font-arabic')}>
              {t('groupsTitle', lang)}
            </h1>
            <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>
              {t('groupsSub', lang)}
            </p>
          </div>
        </header>

        <GroupTables />

        {/* Group stage matches */}
        <section>
          <h2 className={cn('font-display font-extrabold text-2xl mb-5', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'مباريات المجموعات' : 'Group Stage Matches'}
          </h2>
          <MatchCenter defaultTab="results" />
        </section>
      </main>

      <TikiTakaFooter />
    </div>
  );
};

export default Groups;
