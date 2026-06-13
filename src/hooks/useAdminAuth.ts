import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/admin';

export function useAdminAuth() {
  const { user, signOut } = useAuth();
  const authed = isAdminUser(user);

  return {
    authed,
    onLogout: signOut,
  };
}
