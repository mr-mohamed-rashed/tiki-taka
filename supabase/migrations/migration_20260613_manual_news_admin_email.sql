create table if not exists public.manual_news (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_ar text not null default '',
  excerpt_en text not null default '',
  excerpt_ar text not null default '',
  category text not null default 'World Cup 2026',
  image_url text not null default '',
  published_at date not null default current_date,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

alter table public.manual_news enable row level security;

drop policy if exists "Public read manual_news" on public.manual_news;
drop policy if exists "Allow select manual_news" on public.manual_news;
create policy "Public read manual_news"
  on public.manual_news for select
  using (is_published = true or auth.role() = 'authenticated');

drop policy if exists "Admins insert manual_news" on public.manual_news;
drop policy if exists "Admins update manual_news" on public.manual_news;
drop policy if exists "Admins delete manual_news" on public.manual_news;
drop policy if exists "Allow insert manual_news" on public.manual_news;
drop policy if exists "Allow update manual_news" on public.manual_news;
drop policy if exists "Allow delete manual_news" on public.manual_news;

create policy "Admins insert manual_news"
  on public.manual_news for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or lower(auth.jwt() ->> 'email') = 'rishoshi@gmail.com'
  );

create policy "Admins update manual_news"
  on public.manual_news for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or lower(auth.jwt() ->> 'email') = 'rishoshi@gmail.com'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or lower(auth.jwt() ->> 'email') = 'rishoshi@gmail.com'
  );

create policy "Admins delete manual_news"
  on public.manual_news for delete
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or lower(auth.jwt() ->> 'email') = 'rishoshi@gmail.com'
  );
