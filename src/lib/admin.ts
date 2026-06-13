const ADMIN_EMAILS = new Set(['rishoshi@gmail.com']);

export function isAdminUser(user?: { email?: string | null; app_metadata?: { role?: string } } | null) {
  if (!user) return false;
  if (user.app_metadata?.role === 'admin') return true;
  return Boolean(user.email && ADMIN_EMAILS.has(user.email.toLowerCase()));
}
