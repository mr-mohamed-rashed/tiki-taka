import { useAuth } from '@/hooks/useAuth';

export function useAdminAuth() {
  const { user, signOut } = useAuth();
  const authed = user?.app_metadata?.role === 'admin';

  return {
    authed,
    onLogout: signOut,
  };
}
