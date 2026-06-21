create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select auth.jwt() ->> 'email' in (
    'mrrashed0777@gmail.com',
    'info@one2.cc',
    'rishoshi@gmail.com',
    'ahm3dsalam4@gmail.com'
  );
$$;
