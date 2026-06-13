create table if not exists public.ad_banners (
  id uuid primary key default gen_random_uuid(),
  position text not null default 'hero',
  slot_id text,
  title text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  width text default '280px',
  height text default 'auto',
  created_at timestamptz default now()
);

alter table public.ad_banners
  add column if not exists slot_id text,
  add column if not exists width text default '280px',
  add column if not exists height text default 'auto';

create index if not exists idx_ad_banners_position on public.ad_banners(position);
create index if not exists idx_ad_banners_slot_id on public.ad_banners(slot_id);

alter table public.ad_banners enable row level security;

drop policy if exists "Public read ad_banners" on public.ad_banners;
create policy "Public read ad_banners"
on public.ad_banners for select
using (true);

drop policy if exists "Admins insert ad_banners" on public.ad_banners;
create policy "Admins insert ad_banners"
on public.ad_banners for insert
with check (
  auth.jwt() ->> 'email' = 'rishoshi@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins update ad_banners" on public.ad_banners;
create policy "Admins update ad_banners"
on public.ad_banners for update
using (
  auth.jwt() ->> 'email' = 'rishoshi@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  auth.jwt() ->> 'email' = 'rishoshi@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins delete ad_banners" on public.ad_banners;
create policy "Admins delete ad_banners"
on public.ad_banners for delete
using (
  auth.jwt() ->> 'email' = 'rishoshi@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
