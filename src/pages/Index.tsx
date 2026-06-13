import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Trophy, Radio, Newspaper, LayoutGrid, MapPin } from 'lucide-react';
import { Navigation } from '@/components/tikitaka/Navigation';
import { NewsTicker } from '@/components/tikitaka/NewsTicker';
import { MatchCenter } from '@/components/tikitaka/MatchCenter';
import { TopScorersTable } from '@/components/tikitaka/TopScorersTable';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { ApiSportsWidget } from '@/components/tikitaka/ApiSportsWidget';
import { WorldCupRoadmap } from '@/components/tikitaka/WorldCupRoadmap';
import { TrendingSidebar } from '@/components/tikitaka/TrendingSidebar';
import { AdBanner } from '@/components/tikitaka/AdBanner';
import { EditModeToggle } from '@/components/tikitaka/EditModeToggle';
import { EditableSiteText } from '@/components/tikitaka/EditableSiteText';
import { EditableImage } from '@/components/tikitaka/EditableImage';
import { AdSlotSelector } from '@/components/tikitaka/AdSlotSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeaturedNews, getLiveMatches, getNextMatch } from '@/lib/footballData';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useManualNews } from '@/hooks/useManualNews';
import { useEditMode } from '@/hooks/useEditMode';
import { t, T } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const Index = () => {
  const { lang, dir } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { news: manualNews } = useManualNews(true);
  const featured = getFeaturedNews(lang);
  const nextMatch = getNextMatch();
  const liveMatch = getLiveMatches()[0];
  const isEditMode = useEditMode();

  const label = (key: string, fallback: string) => get(key, lang) ?? fallback;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <EditModeToggle />
      <NewsTicker />
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${featured.image})`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="container relative mx-auto px-4 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 min-w-0">
              <Badge className="bg-primary text-primary-foreground mb-5 px-3 py-1 font-bold uppercase tracking-wider shadow-neon">
                {featured.category}
              </Badge>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-5">
                <EditableSiteText settingKey="hero_footballTitle" fallbackEn="Football." fallbackAr="كرة القدم." className={cn('text-foreground', lang === 'ar' && 'font-arabic')} />{' '}
                <EditableSiteText settingKey="hero_livePulse" fallbackEn="Live." fallbackAr="مباشر." className="text-primary [text-shadow:0_0_30px_hsl(var(--primary)/0.5)]" />
              </h1>
              <div className={cn('mb-8 max-w-2xl', lang === 'ar' && 'font-arabic')}>
                <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                  {lang === 'ar' ? 'الماتش اللي عليه الدور' : 'Up Next'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-2xl sm:text-3xl font-extrabold text-foreground">
                  <TeamHeroName name={nextMatch.home.name} flag={nextMatch.home.flag} />
                  <span className="text-primary">vs</span>
                  <TeamHeroName name={nextMatch.away.name} flag={nextMatch.away.flag} />
                </div>
                <p className="mt-3 text-sm sm:text-base text-foreground/75 leading-relaxed">
                  {featured.excerpt.replace(`${nextMatch.home.name} vs ${nextMatch.away.name} at `, '').replace(`الماتش اللي عليه الدور: ${nextMatch.home.name} ضد ${nextMatch.away.name} في `, '')}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/70">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{nextMatch.venue}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex flex-col items-center gap-2">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon">
                    <NavLink to="/live">
                      <Radio className="h-4 w-4 me-2" />
                      <EditableSiteText settingKey="hero_watchLiveNow" fallbackEn={T.watchLiveNow.en} fallbackAr={T.watchLiveNow.ar} className={lang === 'ar' ? 'font-arabic' : ''} />
                    </NavLink>
                  </Button>
                  {liveMatch && (
                    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-background/45 px-3 py-1.5 shadow-card backdrop-blur">
                      <img src={liveMatch.home.flag} alt={liveMatch.home.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/40 animate-flag-breathe" />
                      <span className="text-xs font-extrabold text-primary">LIVE</span>
                      <img src={liveMatch.away.flag} alt={liveMatch.away.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/40 animate-flag-breathe [animation-delay:0.45s]" />
                    </div>
                  )}
                </div>
                <Button asChild size="lg" variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary font-bold">
                  <NavLink to="/standings">
                    <Trophy className="h-4 w-4 me-2" />
                    <EditableSiteText settingKey="hero_topScorersButton" fallbackEn="Top Scorers" fallbackAr="ترتيب الهدافين" className={lang === 'ar' ? 'font-arabic' : ''} />
                  </NavLink>
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-sm xl:max-w-md flex flex-col gap-4">
              <AdSlotSelector location="hero" onAdd={() => {}} />
              <AdBanner slotId="hero-sidebar-1" />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        <section>
          <SectionHeader
            icon={<Radio className="h-5 w-5" />}
            title={<EditableSiteText settingKey="section_matchCenter" fallbackEn={T.matchCenter.en} fallbackAr={T.matchCenter.ar} />}
            subtitle={<EditableSiteText settingKey="section_matchCenterSub" fallbackEn={T.matchCenterSub.en} fallbackAr={T.matchCenterSub.ar} />}
            linkTo="/live"
            linkLabel={<EditableSiteText settingKey="link_allMatches" fallbackEn={T.allMatches.en} fallbackAr={T.allMatches.ar} />}
            lang={lang}
          />
          <MatchCenter defaultTab="fixtures" liveTabRedirectTo="/live" />
        </section>

        {false && <section>
          <SectionHeader
            icon={<LayoutGrid className="h-5 w-5" />}
            title={<EditableSiteText settingKey="section_apiWidget" fallbackEn="World Cup League – Live Widget" fallbackAr="دوري كأس العالم – ويدجت مباشر" />}
            subtitle={<EditableSiteText settingKey="section_apiWidgetSub" fallbackEn="Embedded directly from API-Football" fallbackAr="مُدمج مباشرةً من API-Football" />}
            lang={lang}
          />
          <ApiSportsWidget />
        </section>}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SectionHeader
              icon={<Trophy className="h-5 w-5" />}
              title={<EditableSiteText settingKey="section_goldenBoot" fallbackEn={T.goldenBoot.en} fallbackAr={T.goldenBoot.ar} />}
              subtitle={<EditableSiteText settingKey="section_goldenBootSub" fallbackEn={T.goldenBootSub.en} fallbackAr={T.goldenBootSub.ar} />}
              linkTo="/standings"
              linkLabel={<EditableSiteText settingKey="link_fullStandings" fallbackEn={T.fullStandings.en} fallbackAr={T.fullStandings.ar} />}
              lang={lang}
            />
            <TopScorersTable />
          </div>

          <aside className="space-y-6">
            <TrendingSidebar />

            <div>
              <SectionHeader 
                icon={<Newspaper className="h-5 w-5" />} 
                title={<EditableSiteText settingKey="section_worldCupPulse" fallbackEn={T.worldCupPulse.en} fallbackAr={T.worldCupPulse.ar} />} 
                subtitle={<EditableSiteText settingKey="section_latestHeadlines" fallbackEn={T.latestHeadlines.en} fallbackAr={T.latestHeadlines.ar} />} 
                lang={lang} 
              />
              <div className="space-y-3">
                {/* Manual news from dashboard */}
                {manualNews.slice(0, 5).map(n => (
                  <div key={n.id} className="block p-4 rounded-lg border border-border bg-gradient-card hover:border-primary/50 hover:shadow-card transition-all group">
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-bold mb-2">{n.category}</Badge>
                    <p className={cn('text-sm font-semibold group-hover:text-primary transition-colors leading-snug', lang === 'ar' && 'font-arabic')}>
                      {lang === 'ar' ? n.title_ar || n.title_en : n.title_en || n.title_ar}
                    </p>
                  </div>
                ))}
                {/* Fallback static headlines when no manual news yet */}
                {manualNews.length === 0 && [
                  { tag: 'SQUADS',  text: lang === 'ar' ? 'نيمار يعود! البرازيل تضمه في قائمتها لكأس العالم 2026 - 18 مايو 2026' : 'Neymar returns! Brazil squad named by Ancelotti — May 18, 2026' },
                  { tag: 'SQUADS',  text: lang === 'ar' ? 'نوير يتراجع عن اعتزاله - ألمانيا تعلن قائمتها بقيادة ناغلسمان' : 'Neuer reverses retirement — Nagelsmann names Germany squad' },
                  { tag: 'SQUADS',  text: lang === 'ar' ? 'صلاح ومرموش يقودان مصر في المجموعة G' : 'Salah & Marmoush lead Egypt in Group G' },
                  { tag: 'GROUPS',  text: lang === 'ar' ? 'الأرجنتين مع الجزائر والنمسا والأردن في المجموعة J' : 'Argentina face Algeria, Austria & Jordan in Group J' },
                  { tag: 'PREVIEW', text: lang === 'ar' ? '13 يوماً على الانطلاق - المباراة الافتتاحية: المكسيك ضد جنوب أفريقيا' : '13 days to go — Opening match: Mexico vs South Africa at Azteca' },
                ].map((n, i) => (
                  <div key={i} className="block p-4 rounded-lg border border-border bg-gradient-card hover:border-primary/50 hover:shadow-card transition-all group">
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-bold mb-2">{n.tag}</Badge>
                    <p className={cn('text-sm font-semibold group-hover:text-primary transition-colors leading-snug', lang === 'ar' && 'font-arabic')}>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="hidden">
          <SectionHeader
            icon={<Trophy className="h-5 w-5" />}
            title={lang === 'ar' ? 'طريق كأس العالم' : 'Road to the World Cup'}
            subtitle={lang === 'ar' ? 'خريطة تأهل 32 فريقاً نحو الكأس' : 'A 32-team qualification map leading to the trophy'}
            lang={lang}
          />
          <WorldCupRoadmap />
        </section>
      </main>

      <TikiTakaFooter />
    </div>
  );
};

function SectionHeader({ icon, title, subtitle, linkTo, linkLabel, lang }: {
  icon: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode;
  linkTo?: string; linkLabel?: React.ReactNode; lang: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]">{icon}</div>
        <div>
          <h2 className={cn('font-display font-extrabold text-2xl sm:text-3xl', lang === 'ar' && 'font-arabic')}>{title}</h2>
          {subtitle && <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>{subtitle}</p>}
        </div>
      </div>
      {linkTo && linkLabel && (
        <NavLink to={linkTo} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-glow transition-colors">
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{linkLabel}</span> <ArrowRight className="h-4 w-4" />
        </NavLink>
      )}
    </div>
  );
}

function TeamHeroName({ name, flag }: { name: string; flag: string }) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <img src={flag} alt="" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-primary/40 shadow-neon" />
      <span className="truncate">{name}</span>
    </span>
  );
}

export default Index;
