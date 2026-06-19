import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function FacebookCommentsWidget({ url }: { url?: string }) {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use current URL or provided URL
  const currentUrl = url || window.location.href;

  useEffect(() => {
    // If FB SDK is already loaded, just parse
    if (window.FB) {
      window.FB.XFBML.parse(containerRef.current);
      return;
    }

    // Otherwise, load it dynamically
    const scriptId = 'facebook-jssdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://connect.facebook.net/${lang === 'ar' ? 'ar_AR' : 'en_US'}/sdk.js#xfbml=1&version=v18.0`;
      
      script.onload = () => {
        if (window.FB) {
          window.FB.XFBML.parse(containerRef.current);
        }
      };
      
      document.body.appendChild(script);
    }
  }, [currentUrl, lang]);

  return (
    <div className="w-full bg-white h-full overflow-y-auto rounded-lg" ref={containerRef}>
      <div 
        className="fb-comments w-full" 
        data-href={currentUrl} 
        data-width="100%" 
        data-numposts="10"
        data-colorscheme="light"
        data-order-by="reverse_time"
      ></div>
    </div>
  );
}
