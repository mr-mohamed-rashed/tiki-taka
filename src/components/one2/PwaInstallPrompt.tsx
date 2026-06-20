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
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppMode = window.matchMedia('(display-mode: standalone)').matches 
                      || (window.navigator as any).standalone 
                      || document.referrer.includes('android-app://');
    
    setIsStandalone(!!isAppMode);

    if (isAppMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // For iOS, we just show instructions since prompt() is not supported
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true); // Show our custom UI
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
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      alert(lang === 'ar' ? 'لتثبيت التطبيق على آيفون: اضغط على زر المشاركة (Share) بالأسفل ثم اختر (Add to Home Screen)' : 'To install on iOS: Tap the Share button below and select "Add to Home Screen"');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-96 shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={cn("bg-primary text-primary-foreground rounded-2xl p-4 flex flex-col gap-3", lang === 'ar' ? 'font-arabic text-right' : 'text-left')}>
        <button 
          onClick={handleDismiss}
          className={cn("absolute top-2 text-primary-foreground/70 hover:text-primary-foreground", lang === 'ar' ? 'left-2' : 'right-2')}
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shrink-0">
            <img src="/icons/icon-192x192.png" alt="One2 App" className="w-10 h-10 rounded-lg object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight">
              {lang === 'ar' ? 'تطبيق وان تو (One2)' : 'One2 App'}
            </h3>
            <p className="text-sm text-primary-foreground/90 leading-tight mt-1">
              {lang === 'ar' ? 'ثبت التطبيق لتجربة أسرع وأفضل!' : 'Install our app for a faster, better experience!'}
            </p>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="w-full mt-2 font-bold shadow-sm"
          onClick={handleInstallClick}
        >
          <Download className={cn("h-4 w-4", lang === 'ar' ? 'ml-2' : 'mr-2')} />
          {lang === 'ar' ? 'تنزيل التطبيق الآن' : 'Install App Now'}
        </Button>
      </div>
    </div>
  );
}
