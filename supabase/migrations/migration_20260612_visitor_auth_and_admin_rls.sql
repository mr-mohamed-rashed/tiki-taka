-- Visitor tracking for Google-authenticated viewers
create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('news_view', 'highlights_view', 'match_highlight_click')),
  page text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_visitor_events_user_id on public.visitor_events(user_id);
create index if not exists idx_visitor_events_created_at on public.visitor_events(created_at desc);
create index if not exists idx_visitor_events_event_type on public.visitor_events(event_type);

alter table public.visitor_events enable row level security;

drop policy if exists "Users can insert own visitor events" on public.visitor_events;
create policy "Users can insert own visitor events"
  on public.visitor_events for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read visitor events" on public.visitor_events;
create policy "Admins can read visitor events"
  on public.visitor_events for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Lock CMS writes to Google users marked as admin in auth.users.app_metadata.role.
-- Public reads stay open where the site needs them.
drop policy if exists "Allow insert site_settings" on public.site_settings;
drop policy if exists "Allow update site_settings" on public.site_settings;
drop policy if exists "Allow delete site_settings" on public.site_settings;
create policy "Admins insert site_settings" on public.site_settings for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update site_settings" on public.site_settings for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete site_settings" on public.site_settings for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allow insert ad_banners" on public.ad_banners;
drop policy if exists "Allow update ad_banners" on public.ad_banners;
drop policy if exists "Allow delete ad_banners" on public.ad_banners;
create policy "Admins insert ad_banners" on public.ad_banners for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update ad_banners" on public.ad_banners for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete ad_banners" on public.ad_banners for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allow insert manual_news" on public.manual_news;
drop policy if exists "Allow update manual_news" on public.manual_news;
drop policy if exists "Allow delete manual_news" on public.manual_news;
create policy "Admins insert manual_news" on public.manual_news for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update manual_news" on public.manual_news for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete manual_news" on public.manual_news for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allow insert page_sections" on public.page_sections;
drop policy if exists "Allow update page_sections" on public.page_sections;
drop policy if exists "Allow delete page_sections" on public.page_sections;
create policy "Admins insert page_sections" on public.page_sections for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update page_sections" on public.page_sections for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete page_sections" on public.page_sections for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
