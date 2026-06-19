import { FormEvent, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/admin';

export function AdminGate() {
  const { loading, user, signInWithGoogle, signInWithPassword, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isDenied = Boolean(user && !isAdminUser(user));

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      await signInWithPassword(email.trim(), password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8 border-border bg-gradient-card shadow-elevated text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-neon">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-extrabold mb-1">Tiki-Taka Admin</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in with the admin email or the Google account marked as admin.
        </p>

        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="space-y-3">
            <form onSubmit={handleEmailLogin} className="space-y-3 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs text-muted-foreground">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-xs text-muted-foreground">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  dir="ltr"
                />
              </div>
              {errorMessage && (
                <p className="text-center text-sm text-destructive">{errorMessage}</p>
              )}
              <Button type="submit" disabled={submitting} className="w-full font-bold shadow-neon">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in with Email'}
              </Button>
            </form>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button onClick={signInWithGoogle} variant="outline" className="w-full font-bold">
              Continue with Google
            </Button>
            {isDenied && (
              <>
                <p className="text-sm text-destructive">
                  This account is signed in, but it is not an admin.
                </p>
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sign out
                </Button>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
