import { Loader2, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface GoogleAuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function GoogleAuthGate({ children, title, description }: GoogleAuthGateProps) {
  const { lang } = useLanguage();
  const { loading, user, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <Card className="mx-auto max-w-xl p-8 border-border bg-gradient-card text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className={cn('font-display text-2xl font-extrabold mb-2', lang === 'ar' && 'font-arabic')}>
        {title ?? (lang === 'ar' ? 'سجل دخولك لمتابعة المحتوى' : 'Sign in to continue')}
      </h2>
      <p className={cn('text-sm text-muted-foreground mb-6 leading-relaxed', lang === 'ar' && 'font-arabic')}>
        {description ?? (
          lang === 'ar'
            ? 'الدخول مجاني بحساب Google. نستخدمه فقط لتسجيل الزيارة وتحسين تجربة الأخبار والملخصات.'
            : 'Google sign-in is free. We use it to record visits and improve the news and highlights experience.'
        )}
      </p>
      <Button onClick={signInWithGoogle} className="font-bold shadow-neon">
        <LogIn className="h-4 w-4 me-2" />
        {lang === 'ar' ? 'الدخول بحساب Google' : 'Continue with Google'}
      </Button>
    </Card>
  );
}
