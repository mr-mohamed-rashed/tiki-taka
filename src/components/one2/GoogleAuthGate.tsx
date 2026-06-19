import { useEffect, useRef } from 'react';
import { Loader2, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { hasSupabaseConfig } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GoogleAuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  autoStart?: boolean;
}

export function GoogleAuthGate({ children, title, description, autoStart = false }: GoogleAuthGateProps) {
  const { lang } = useLanguage();
  const { loading, user, signInWithGoogle } = useAuth();
  const startedRef = useRef(false);
  const isArabic = lang === 'ar';

  useEffect(() => {
    if (!autoStart || loading || user || !hasSupabaseConfig || startedRef.current) return;
    startedRef.current = true;
    signInWithGoogle().catch(() => {
      startedRef.current = false;
    });
  }, [autoStart, loading, signInWithGoogle, user]);

  if (!hasSupabaseConfig) {
    return (
      <Card className="mx-auto mt-10 max-w-xl p-8 border-destructive/40 bg-gradient-card text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className={cn('font-display text-2xl font-extrabold mb-2', isArabic && 'font-arabic')}>
          {isArabic ? 'إعدادات Supabase ناقصة' : 'Supabase configuration is missing'}
        </h2>
        <p className={cn('text-sm text-muted-foreground leading-relaxed', isArabic && 'font-arabic')}>
          {isArabic
            ? 'أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في إعدادات الاستضافة ثم أعد النشر.'
            : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in hosting settings, then redeploy.'}
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  if (autoStart) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className={cn('text-sm', isArabic && 'font-arabic')}>
          {isArabic ? 'جاري تحويلك لتسجيل الدخول بجوجل...' : 'Redirecting you to Google sign-in...'}
        </p>
        <Button onClick={signInWithGoogle} variant="outline" className="font-bold">
          <LogIn className="h-4 w-4 me-2" />
          {isArabic ? 'الدخول بحساب Google' : 'Continue with Google'}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mx-auto mt-10 max-w-xl p-8 border-border bg-gradient-card text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className={cn('font-display text-2xl font-extrabold mb-2', isArabic && 'font-arabic')}>
        {title ?? (isArabic ? 'سجل دخولك لمتابعة المحتوى' : 'Sign in to continue')}
      </h2>
      <p className={cn('text-sm text-muted-foreground mb-6 leading-relaxed', isArabic && 'font-arabic')}>
        {description ?? (
          isArabic
            ? 'الدخول مجاني بحساب Google. نستخدمه فقط لتسجيل الزيارة وتحسين تجربة الأخبار والملخصات.'
            : 'Google sign-in is free. We use it to record visits and improve the news and highlights experience.'
        )}
      </p>
      <Button onClick={signInWithGoogle} className="font-bold shadow-neon">
        <LogIn className="h-4 w-4 me-2" />
        {isArabic ? 'الدخول بحساب Google' : 'Continue with Google'}
      </Button>
    </Card>
  );
}
