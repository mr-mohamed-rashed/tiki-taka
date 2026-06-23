import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const { lang } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if user already dismissed it
    if (localStorage.getItem('pwa_prompt_dismissed') === 'true') {
      return;
    }

    // Check if already installed
    const isAppMode = window.matchMedia('(display-mode: standalone)').matches 
                      || (window.navigator as any).standalone 
                      || document.referrer.includes('android-app://');
    
    if (isAppMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // iOS doesn't support beforeinstallprompt, so we show it manually
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show the banner on Android/PC if the browser fires the event
      // This means the app is NOT installed yet and is installable
      setIsVisible(true); 
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_prompt_dismissed', 'true');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      alert(lang === 'ar' ? 'لتثبيت التطبيق على آيفون: اضغط على زر المشاركة (Share) بالأسفل ثم اختر (Add to Home Screen)' : 'To install on iOS: Tap the Share button below and select "Add to Home Screen"');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-4", lang === 'ar' ? 'font-arabic' : '')}>
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="relative flex items-center gap-4">
          <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-black/50 border border-white/5 shadow-inner overflow-hidden">
             <div dir="ltr" className="flex items-baseline font-display font-black tracking-tighter select-none scale-[0.55]">
               <span className="text-white text-3xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">ONE</span>
               <span className="text-primary text-4xl drop-shadow-[0_2px_10px_rgba(34,197,94,0.5)] leading-none italic relative ml-1">2</span>
             </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[16px] text-white truncate leading-tight flex items-center gap-2">
              {lang === 'ar' ? 'تطبيق وان تو' : 'One2 App'}
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'مجاني' : 'Free'}
              </span>
            </h3>
            <p className="text-[13px] text-zinc-400 leading-snug mt-1">
              {lang === 'ar' ? 'تجربة أسرع لمتابعة المباريات' : 'Faster match tracking experience'}
            </p>
          </div>
        </div>
        
        <div className="relative mt-4 flex items-center gap-2">
          <button 
            className="flex-1 font-bold bg-primary text-primary-foreground text-sm py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-[0.98]"
            onClick={handleInstallClick}
          >
            {lang === 'ar' ? 'تثبيت التطبيق الآن' : 'Install App Now'}
          </button>
          <button 
            onClick={handleDismiss}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0 bg-black/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
