import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useAdBanners } from '@/hooks/useAdBanners';
import { Loader2 } from 'lucide-react';

export function SponsorMarquee() {
  const { lang } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { banners, loading } = useAdBanners('marquee');
  
  // Filter for active marquee row ads
  const activeSponsors = banners.filter(b => b.is_active && (b.position === 'marquee' || b.slot_id === 'marquee-row'));
  const speed = Math.max(10, Math.min(300, Number(get('marquee_speed_seconds') || 50)));

  if (loading) {
    return (
      <div className="flex h-20 items-center justify-center border-b border-primary/20 bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
      </div>
    );
  }

  if (activeSponsors.length === 0) {
    return null; // Don't render anything if no sponsors
  }

  // To make it an infinite loop without gaps, we duplicate the array enough times to fill the screen
  const minItemsRequired = 8;
  let loopItems = [...activeSponsors];
  while (loopItems.length < minItemsRequired) {
    loopItems = [...loopItems, ...activeSponsors];
  }
  // Double the array for the continuous CSS scroll effect
  const finalItems = [...loopItems, ...loopItems];

  return (
    <div className="relative overflow-hidden border-b border-primary/20 bg-background/80 py-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex w-full overflow-hidden hover:[&>div]:[animation-play-state:paused]" dir="ltr">
        <div
          className={`flex whitespace-nowrap ${lang === 'ar' ? 'animate-ticker-ar' : 'animate-ticker'}`}
          style={{ animationDuration: `${speed}s` }}
        >
          {finalItems.map((sponsor, index) => (
            <a
              key={`${sponsor.id}-${index}`}
              href={sponsor.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center justify-center px-6 transition-transform hover:scale-105"
            >
              <img
                src={sponsor.image_url}
                alt={sponsor.title}
                className="max-h-[60px] w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
