import { useState } from 'react';
import { Menu, X, CircleDot, Search, Languages } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { t, T } from '@/lib/i18n';
import { EditableSiteText } from '@/components/tikitaka/EditableSiteText';
import { useLiveFixtures } from '@/hooks/useFootballData';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, dir } = useLanguage();

  const { data: liveMatches = [] } = useLiveFixtures();

  const links = [
    { nameKey: 'home' as const,         to: '/' },
    { nameKey: 'worldCupNews' as const,  to: '/news' },
    { nameKey: 'groups' as const,        to: '/groups' },
    { nameKey: 'roadmap' as const,       to: '/roadmap' },
    { nameKey: 'standings' as const,     to: '/standings' },
    { nameKey: 'liveMatches' as const,   to: liveMatches.length > 0 ? '/live' : '/' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border" dir={dir}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <CircleDot className="relative h-7 w-7 text-primary" strokeWidth={2.5} />
            </div>
            <div className="font-display font-extrabold text-2xl tracking-wide">
              <span className="text-foreground">TIKI</span>
              <span className="text-primary">-TAKA</span>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => {
              const isHomeLink = link.nameKey === 'home';
              return (
                <NavLink
                  key={link.nameKey}
                  to={link.to}
                  end={isHomeLink || link.to === '/'}
                  className={({ isActive }) => {
                    const effectivelyActive = isActive && (!isHomeLink && link.to === '/' ? false : true);
                    return cn(
                      'relative px-3 py-2 font-semibold text-sm transition-colors rounded-md whitespace-nowrap',
                      'hover:text-primary',
                      effectivelyActive ? 'text-primary' : 'text-foreground/80'
                    );
                  }}
                >
                  {({ isActive }) => {
                    const effectivelyActive = isActive && (!isHomeLink && link.to === '/' ? false : true);
                    return (
                      <>
                        <EditableSiteText settingKey={`nav_${link.nameKey}`} fallbackEn={T[link.nameKey].en} fallbackAr={T[link.nameKey].ar} />
                        {effectivelyActive && (
                          <span className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-primary shadow-neon rounded-full" />
                        )}
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                'border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground',
                lang === 'ar' && 'font-arabic'
              )}
              title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Languages className="h-3.5 w-3.5" />
              {t('switchToAr', lang)}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-primary/10 hover:text-primary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border py-3 space-y-1 animate-fade-in-up">
            {links.map((link) => {
              const isHomeLink = link.nameKey === 'home';
              return (
                <NavLink
                  key={link.nameKey}
                  to={link.to}
                  end={isHomeLink || link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => {
                    const effectivelyActive = isActive && (!isHomeLink && link.to === '/' ? false : true);
                    return cn(
                      'block px-4 py-3 rounded-lg font-semibold text-sm transition-colors',
                      effectivelyActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-foreground/80 hover:bg-muted hover:text-primary'
                    );
                  }}
                >
                  <EditableSiteText settingKey={`nav_${link.nameKey}`} fallbackEn={T[link.nameKey].en} fallbackAr={T[link.nameKey].ar} />
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
