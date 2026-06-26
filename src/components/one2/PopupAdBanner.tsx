import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { useAdBanners } from '@/hooks/useAdBanners';
import { getSlotsByLocation } from '@/lib/adSlots';

export function PopupAdBanner({ location }: { location: string }) {
  const { banners } = useAdBanners();
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0 && !dismissed) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, dismissed]);

  if (dismissed) return null;

  const slots = getSlotsByLocation(location);
  if (!slots.length) return null;

  // Find an active banner that belongs to this location
  const activeBanner = banners.find(b => 
    b.is_active && 
    (b.position === location || slots.some(s => s.id === b.slot_id))
  );

  if (!activeBanner) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        
        {/* Countdown / Close Button Header */}
        <div className="w-full flex justify-end mb-2">
          {countdown > 0 ? (
            <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
              يمكنك التخطي بعد {countdown} ثوانٍ
            </div>
          ) : (
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-colors shadow-lg animate-in fade-in"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Ad Content */}
        <a
          href={activeBanner.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
             // Let the user click the ad, but maybe we don't dismiss it automatically
             // setDismissed(true);
          }}
          className="block rounded-2xl overflow-hidden shadow-2xl hover:shadow-neon transition-shadow duration-300"
          style={{
            background: activeBanner.image_url
              ? 'transparent'
              : 'linear-gradient(160deg, #1a3a2a 0%, #0d2418 60%, #0a1c10 100%)',
          }}
        >
          {activeBanner.image_url ? (
            <img
              src={activeBanner.image_url}
              alt={activeBanner.title || 'Advertisement'}
              className="w-full h-full max-h-[75vh] object-contain"
            />
          ) : (
            <div className="p-12 text-center w-[300px] h-[250px] flex flex-col items-center justify-center">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-bold text-white">{activeBanner.title || 'Advertisement'}</p>
            </div>
          )}
        </a>
      </div>
    </div>
  );
}
