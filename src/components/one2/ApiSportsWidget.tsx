import { useEffect, useRef } from 'react';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * ApiSportsWidget
 * -------------------------------------------------------
 * Injects the api-sports.io custom-element widget into the
 * page via a real DOM node so React doesn't interfere with
 * the third-party custom elements.
 *
 * ► To change the widget just edit WIDGET_HTML below.
 * ► API key, sport, league, theme etc. are all in WIDGET_HTML.
 * ► Script src is in SCRIPT_SRC.
 */
const WIDGET_HTML = `
<api-sports-widget data-type="leagues"
  data-target-league="1">
</api-sports-widget>

<api-sports-widget data-type="config"
  data-key="3f32007ee5d3ea0c95c1ff96bf81f71d"
  data-sport="football"
  data-lang="ar"
  data-theme="dark"
  data-timezone="Africa/Cairo"
  data-show-errors="true"
  data-show-logos="true"
  data-favorite="true">
</api-sports-widget>
`;

const SCRIPT_SRC = 'https://widgets.api-sports.io/2.0.3/widgets.js';

export function ApiSportsWidget() {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current || !containerRef.current) return;
    mountedRef.current = true;

    // Inject the custom elements HTML
    containerRef.current.innerHTML = WIDGET_HTML;

    // Inject the script once (avoid duplicates)
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SCRIPT_SRC;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Card className="overflow-hidden bg-gradient-card border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/60">
        <div className="p-2 rounded-lg bg-primary/15">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'ويدجت كأس العالم' : 'World Cup Widget'}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            {lang === 'ar' ? 'بيانات مباشرة عبر API-Football' : 'Live data via API-Football'}
          </p>
        </div>
      </div>

      {/* Widget mount point */}
      <div className="p-4 flex justify-center">
        <div
          ref={containerRef}
          className="w-full max-w-3xl min-h-[200px]"
        />
      </div>
    </Card>
  );
}
