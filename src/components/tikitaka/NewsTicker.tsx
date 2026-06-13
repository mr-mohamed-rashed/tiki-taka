import { Loader2, Radio } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useManualNews } from '@/hooks/useManualNews';
import { useRealNews, formatForTicker } from '@/hooks/useRealNews';
import { t } from '@/lib/i18n';

export function NewsTicker() {
  const { lang } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { news: manualNews, loading: manualLoading } = useManualNews(true);
  const { data: realNews, isLoading } = useRealNews(lang);
  const tickerSpeed = Math.max(25, Math.min(180, Number(get('ticker_speed_seconds') || 70)));

  const manualItems = manualNews
    .filter((item) => item.category === 'Ticker')
    .slice(0, 12)
    .map((item) => ({
      tag: lang === 'ar' ? 'خبر عاجل' : 'NEWS',
      text: lang === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar,
    }))
    .filter((item) => item.text);

  const tickerItems = manualItems.length > 0 ? manualItems : formatForTicker(realNews, lang);
  const fallbackItems = [
    {
      tag: 'WORLD CUP',
      text: lang === 'ar' ? 'جاري تحميل أحدث الأخبار...' : 'Loading latest news...',
    },
  ];

  const items = tickerItems.length > 0 ? tickerItems : fallbackItems;
  const tickerSet = Array.from({ length: Math.max(2, Math.ceil(8 / items.length)) }, () => items).flat();
  const loop = [...tickerSet, ...tickerSet];
  const loading = isLoading || manualLoading;

  return (
    <div className="bg-card border-b border-primary/30 overflow-hidden relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-stretch">
        <div className="shrink-0 bg-primary text-primary-foreground font-bold text-[10px] sm:text-[11px] flex items-center gap-1 px-2 sm:px-2.5 py-2.5 uppercase tracking-wide z-10 shadow-neon">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Radio className="h-3 w-3 animate-pulse-live" />
          )}
          <span className={lang === 'ar' ? 'font-arabic whitespace-nowrap' : 'whitespace-nowrap'}>
            {t('tickerLabel', lang)}
          </span>
        </div>
        <div className="flex-1 overflow-hidden relative bg-gradient-ticker" dir="ltr">
          <div
            className={`flex whitespace-nowrap py-2.5 ${lang === 'ar' ? 'animate-ticker-ar' : 'animate-ticker'}`}
            style={{ animationDuration: `${tickerSpeed}s` }}
          >
            {loop.map((item, index) => (
              <span
                key={`${item.tag}-${index}`}
                className="flex items-center text-sm shrink-0 px-5"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="font-display font-bold text-primary mx-2 uppercase tracking-wider text-xs">
                  {item.tag}
                </span>
                <span className="text-foreground/90">{item.text}</span>
                <span className="mx-5 text-primary/40">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
