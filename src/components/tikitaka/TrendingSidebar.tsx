import { TrendingUp, Loader2, Users, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useAIAgent } from '@/hooks/useAIAgent';

interface TrendingItem {
  name: string;
  type: 'team' | 'player';
  reason: string;
}

export function TrendingSidebar() {
  const { lang } = useLanguage();
  const { data, isLoading } = useAIAgent<TrendingItem[]>('trending', undefined, lang);

  return (
    <Card className="bg-gradient-card border-border overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/60">
        <div className="p-2 rounded-lg bg-primary/15">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className={cn("font-display font-extrabold text-lg", lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'الأكثر تداولاً' : 'Trending Now'}
          </h3>
          <p className={cn("text-xs text-muted-foreground", lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <span className={cn("text-sm", lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'جاري التحليل...' : 'Analyzing trends...'}
            </span>
          </div>
        ) : (
          data?.map((item, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="shrink-0 mt-1">
                {item.type === 'team' ? (
                  <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
              <div>
                <h4 className={cn("font-bold text-sm group-hover:text-primary transition-colors", lang === 'ar' && 'font-arabic')}>
                  {item.name}
                </h4>
                <p className={cn("text-xs text-muted-foreground mt-0.5 leading-relaxed", lang === 'ar' && 'font-arabic')}>
                  {item.reason}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
