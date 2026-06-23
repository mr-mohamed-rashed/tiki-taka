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
    <div className="fixed top-0 left-0 right-0 z-[100] shadow-2xl border-b border-white/10 bg-[#18181B] animate-in slide-in-from-top fade-in duration-300">
      <div className={cn("max-w-3xl mx-auto px-4 py-3 flex items-center gap-3", lang === 'ar' ? 'font-arabic' : '')}>
        <button 
          onClick={handleDismiss}
          className="p-1 -ml-1 text-zinc-400 hover:text-white shrink-0"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <img src="/icons/one2-icon-192.png" alt="One2" className="w-10 h-10 rounded shadow-sm object-cover shrink-0" />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-white truncate leading-tight">
            {lang === 'ar' ? 'وان تو - كأس العالم' : 'One2 - World Cup'}
          </h3>
          <p className="text-[13px] text-zinc-400 truncate leading-tight mt-0.5">
            one2.ink
          </p>
        </div>
        
        <button 
          className="shrink-0 font-bold bg-[#00ff66] text-[#07100c] text-sm px-4 py-1.5 rounded-full hover:bg-[#00cc52] transition-colors shadow-sm"
          onClick={handleInstallClick}
        >
          {lang === 'ar' ? 'تثبيت' : 'Install'}
        </button>
      </div>
    </div>
  );
}
