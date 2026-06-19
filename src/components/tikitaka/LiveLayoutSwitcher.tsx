import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Youtube, Facebook, Tv } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type LayoutMode = 'youtube' | 'tiktok' | 'facebook';

interface LiveLayoutSwitcherProps {
  currentMode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
}

export function LiveLayoutSwitcher({ currentMode, onModeChange }: LiveLayoutSwitcherProps) {
  const { lang } = useLanguage();

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        onClick={() => onModeChange('youtube')}
        className={cn(
          "rounded-full transition-all shrink-0 font-display font-bold px-6",
          currentMode === 'youtube'
            ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            : "bg-card/60 text-muted-foreground border border-border hover:bg-card hover:text-foreground"
        )}
      >
        <Youtube className="w-4 h-4 mr-2" />
        YouTube
      </Button>

      <Button
        onClick={() => onModeChange('tiktok')}
        className={cn(
          "rounded-full transition-all shrink-0 font-display font-bold px-6",
          currentMode === 'tiktok'
            ? "bg-black hover:bg-black/90 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-gray-800"
            : "bg-card/60 text-muted-foreground border border-border hover:bg-card hover:text-foreground"
        )}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.34 2.88 2.88 0 0 1 2.31-4.53 2.66 2.66 0 0 1 1.61.53V9.5a6.33 6.33 0 0 0-1.61-.22 6.33 6.33 0 1 0 6.33 6.33v-5.6a8.28 8.28 0 0 0 3.78 1.4v-3.32a4.92 4.92 0 0 1-1.62-.27c-.43-.16-.83-.4-1.18-.7z"/>
        </svg>
        TikTok
      </Button>

      <Button
        onClick={() => onModeChange('facebook')}
        className={cn(
          "rounded-full transition-all shrink-0 font-display font-bold px-6",
          currentMode === 'facebook'
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            : "bg-card/60 text-muted-foreground border border-border hover:bg-card hover:text-foreground"
        )}
      >
        <Facebook className="w-4 h-4 mr-2" />
        Facebook
      </Button>
      
      <Button
        className={cn(
          "rounded-full transition-all shrink-0 font-display font-bold px-6",
          "bg-card/60 text-muted-foreground border border-border opacity-50 cursor-not-allowed"
        )}
      >
        <Tv className="w-4 h-4 mr-2" />
        الاستوديو (قريبا)
      </Button>
    </div>
  );
}
