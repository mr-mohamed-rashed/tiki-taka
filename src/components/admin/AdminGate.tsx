import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export function AdminGate() {
  const { loading, user, signInWithGoogle, signOut } = useAuth();
  const isDenied = Boolean(user && user.app_metadata?.role !== 'admin');

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
          Sign in with the Google account marked as admin in Supabase.
        </p>

        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="space-y-3">
            <Button onClick={signInWithGoogle} className="w-full font-bold shadow-neon">
              Continue with Google
            </Button>
            {isDenied && (
              <>
                <p className="text-sm text-destructive">
                  This Google account is signed in, but it is not an admin.
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
