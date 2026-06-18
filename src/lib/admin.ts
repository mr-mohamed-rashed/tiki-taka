import { ADMIN_EMAILS_LIST } from '@/config/admins';

const ADMIN_EMAILS = new Set(ADMIN_EMAILS_LIST.map(e => e.toLowerCase()));

export function isAdminUser(user?: { email?: string | null; app_metadata?: { role?: string } } | null) {
  if (!user) return false;
  if (user.app_metadata?.role === 'admin') return true;
  return Boolean(user.email && ADMIN_EMAILS.has(user.email.toLowerCase()));
}
