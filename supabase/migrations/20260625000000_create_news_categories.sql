create table if not exists public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

alter table public.news_categories enable row level security;

drop policy if exists "Public read news_categories" on public.news_categories;
create policy "Public read news_categories" on public.news_categories for select using (true);

drop policy if exists "Admins insert news_categories" on public.news_categories;
create policy "Admins insert news_categories" on public.news_categories for insert with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or lower(auth.jwt() ->> 'email') = 'rishoshi@gmail.com'
);

drop policy if exists "Admins delete news_categories" on public.news_categories;
create policy "Admins delete news_categories" on public.news_categories for delete using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or lower(auth.jwt() ->> 'email') = 'rishoshi@gmail.com'
);

insert into public.news_categories (name) values ('World Cup 2026') on conflict do nothing;
