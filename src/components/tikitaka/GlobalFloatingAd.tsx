import { AdBanner } from './AdBanner';
import { AdSlotSelector } from './AdSlotSelector';
import { useLanguage } from '@/context/LanguageContext';
import { useEditMode } from '@/hooks/useEditMode';

export function GlobalFloatingAd() {
  const { dir } = useLanguage();
  const isEditMode = useEditMode();

  return (
    <div className={`fixed bottom-4 z-50 transition-all duration-500 ease-out ${dir === 'rtl' ? 'left-4' : 'right-4'} ${isEditMode ? 'bottom-20' : ''}`}>
      <div className="flex flex-col gap-2 items-end">
        <AdSlotSelector location="global" onAdd={() => {}} />
        <div className="shadow-2xl rounded-2xl overflow-hidden">
          <AdBanner slotId="global-floating" />
        </div>
      </div>
    </div>
  );
}
