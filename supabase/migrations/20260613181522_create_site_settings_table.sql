create table if not exists public.site_settings (
  key text primary key,
  value_en text not null default '',
  value_ar text not null default '',
  created_at timestamptz default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
on public.site_settings for select
using (true);

create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select auth.jwt() ->> 'email' = 'rishoshi@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

drop policy if exists "Admins insert site_settings" on public.site_settings;
create policy "Admins insert site_settings"
on public.site_settings for insert
with check (public.is_admin());

drop policy if exists "Admins update site_settings" on public.site_settings;
create policy "Admins update site_settings"
on public.site_settings for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete site_settings" on public.site_settings;
create policy "Admins delete site_settings"
on public.site_settings for delete
using (public.is_admin());
