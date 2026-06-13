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

  const speed = Number(get('ticker_speed_seconds', 'en') || 32);
  const tickerSpeed = Number.isFinite(speed) ? Math.min(Math.max(speed, 12), 90) : 32;

  const manualItems = manualNews
    .slice(0, 12)
    .map((item) => ({
      tag: item.category || (lang === 'ar' ? 'خبر' : 'NEWS'),
      text: lang === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar,
    }))
    .filter((item) => item.text);

  const tickerItems = manualItems.length > 0 ? manualItems : formatForTicker(realNews, lang);
  const fallbackItems = [
    { tag: 'WORLD CUP', text: lang === 'ar' ? 'جاري تحميل أحدث الأخبار...' : 'Loading latest news...' },
  ];

  const items = tickerItems.length > 0 ? tickerItems : fallbackItems;
  const loop = [...items, ...items];
  const loading = isLoading || manualLoading;

  return (
    <div className="bg-card border-b border-primary/30 overflow-hidden relative">
      <div className="flex items-stretch">
        <div className="shrink-0 bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center gap-2 px-3 sm:px-5 py-2.5 uppercase tracking-wider z-10 shadow-neon">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Radio className="h-4 w-4 animate-pulse-live" />
          )}
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('tickerLabel', lang)}</span>
        </div>
        <div className="flex-1 overflow-hidden relative bg-gradient-ticker">
          <div className="flex whitespace-nowrap animate-ticker py-2.5" style={{ animationDuration: `${tickerSpeed}s` }}>
            {loop.map((item, index) => (
              <span key={`${item.tag}-${index}`} className="flex items-center text-sm shrink-0 px-6">
                <span className="font-display font-bold text-primary mr-2 uppercase tracking-wider text-xs">
                  {item.tag}
                </span>
                <span className="text-foreground/90">{item.text}</span>
                <span className="mx-6 text-primary/40">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
