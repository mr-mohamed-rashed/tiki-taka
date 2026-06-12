import { Loader2, Radio } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRealNews, formatForTicker } from '@/hooks/useRealNews';
import { t } from '@/lib/i18n';

export function NewsTicker() {
  const { lang } = useLanguage();
  const { data: realNews, isLoading } = useRealNews(lang);

  const tickerItems = formatForTicker(realNews, lang);
  const fallbackItems = [
    { tag: 'WORLD CUP', text: lang === 'ar' ? 'جاري تحميل أحدث الأخبار...' : 'Loading latest news...' },
  ];

  const items = tickerItems.length > 0 ? tickerItems : fallbackItems;
  const loop = [...items, ...items];

  return (
    <div className="bg-card border-b border-primary/30 overflow-hidden relative">
      <div className="flex items-stretch">
        <div className="shrink-0 bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center gap-2 px-3 sm:px-5 py-2.5 uppercase tracking-wider z-10 shadow-neon">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Radio className="h-4 w-4 animate-pulse-live" />
          )}
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{t('tickerLabel', lang)}</span>
        </div>
        <div className="flex-1 overflow-hidden relative bg-gradient-ticker">
          <div className="flex whitespace-nowrap animate-ticker py-2.5">
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
