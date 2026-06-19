-- One2 fresh Supabase setup.
-- Run this once in Supabase SQL Editor for the new project.

create table if not exists public.site_settings (
  key text primary key,
  value_en text not null default '',
  value_ar text not null default '',
  updated_at timestamptz default now()
);

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

create index if not exists idx_ad_banners_slot_id on public.ad_banners(slot_id);

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

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page text not null default 'home',
  section_key text not null,
  name_en text not null default '',
  name_ar text not null default '',
  subtitle_en text not null default '',
  subtitle_ar text not null default '',
  bg_color text not null default '',
  bg_image text not null default '',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz default now(),
  unique(page, section_key)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  username text not null,
  message text not null check (char_length(message) <= 300),
  is_deleted boolean default false,
  match_id text not null default 'general',
  created_at timestamptz default now()
);

create table if not exists public.chat_users (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  username text not null,
  is_moderator boolean default false,
  is_banned boolean default false,
  created_at timestamptz default now()
);

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

alter table public.site_settings enable row level security;
alter table public.ad_banners enable row level security;
alter table public.manual_news enable row level security;
alter table public.page_sections enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_users enable row level security;
alter table public.visitor_events enable row level security;

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select using (true);

drop policy if exists "Public read ad_banners" on public.ad_banners;
create policy "Public read ad_banners" on public.ad_banners for select using (true);

drop policy if exists "Public read manual_news" on public.manual_news;
create policy "Public read manual_news" on public.manual_news for select using (is_published = true);

drop policy if exists "Public read page_sections" on public.page_sections;
create policy "Public read page_sections" on public.page_sections for select using (true);

drop policy if exists "Admins insert site_settings" on public.site_settings;
drop policy if exists "Admins update site_settings" on public.site_settings;
drop policy if exists "Admins delete site_settings" on public.site_settings;
create policy "Admins insert site_settings" on public.site_settings for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update site_settings" on public.site_settings for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete site_settings" on public.site_settings for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins insert ad_banners" on public.ad_banners;
drop policy if exists "Admins update ad_banners" on public.ad_banners;
drop policy if exists "Admins delete ad_banners" on public.ad_banners;
create policy "Admins insert ad_banners" on public.ad_banners for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update ad_banners" on public.ad_banners for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete ad_banners" on public.ad_banners for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins insert manual_news" on public.manual_news;
drop policy if exists "Admins update manual_news" on public.manual_news;
drop policy if exists "Admins delete manual_news" on public.manual_news;
create policy "Admins insert manual_news" on public.manual_news for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update manual_news" on public.manual_news for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete manual_news" on public.manual_news for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins insert page_sections" on public.page_sections;
drop policy if exists "Admins update page_sections" on public.page_sections;
drop policy if exists "Admins delete page_sections" on public.page_sections;
create policy "Admins insert page_sections" on public.page_sections for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update page_sections" on public.page_sections for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete page_sections" on public.page_sections for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Anyone can read non-deleted messages" on public.chat_messages;
drop policy if exists "Authenticated users can insert message" on public.chat_messages;
drop policy if exists "Admins can soft-delete messages" on public.chat_messages;
create policy "Anyone can read non-deleted messages" on public.chat_messages for select using (is_deleted = false);
create policy "Authenticated users can insert message" on public.chat_messages for insert to authenticated with check (true);
create policy "Admins can soft-delete messages" on public.chat_messages for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Anyone can read chat users" on public.chat_users;
drop policy if exists "Authenticated users can insert chat user" on public.chat_users;
drop policy if exists "Users can update own profile or admins update all" on public.chat_users;
create policy "Anyone can read chat users" on public.chat_users for select using (true);
create policy "Authenticated users can insert chat user" on public.chat_users for insert to authenticated with check (true);
create policy "Users can update own profile or admins update all" on public.chat_users for update to authenticated using (user_id = auth.uid()::text or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check (user_id = auth.uid()::text or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Users can insert own visitor events" on public.visitor_events;
drop policy if exists "Admins can read visitor events" on public.visitor_events;
create policy "Users can insert own visitor events" on public.visitor_events for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins can read visitor events" on public.visitor_events for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.site_settings (key, value_en, value_ar) values
  ('matchCenter', 'Match Center', 'مركز المباريات'),
  ('matchCenterSub', 'Live scores, fixtures & results', 'نتائج مباشرة، مواعيد ونتائج'),
  ('apiWidget', 'World Cup League - Live Widget', 'ودجت كأس العالم المباشر'),
  ('apiWidgetSub', 'Embedded directly from API-Football', 'مدمج مباشرة من API-Football'),
  ('goldenBoot', 'Golden Boot Race', 'سباق الحذاء الذهبي'),
  ('goldenBootSub', 'Tournament''s leading scorers', 'هدافو البطولة'),
  ('worldCupPulse', 'World Cup Pulse', 'نبض كأس العالم'),
  ('highlights', 'Highlights', 'الملخصات'),
  ('highlightsSub', 'Match summaries and tournament highlights', 'ملخصات المباريات وأبرز لقطات البطولة')
on conflict (key) do update set
  value_en = excluded.value_en,
  value_ar = excluded.value_ar,
  updated_at = now();

insert into public.page_sections (page, section_key, name_en, name_ar, subtitle_en, subtitle_ar, sort_order) values
  ('home', 'hero', 'Hero Banner', 'البانر الرئيسي', 'Opening match countdown and featured news', 'عداد الافتتاح والأخبار المميزة', 1),
  ('home', 'matchCenter', 'Match Center', 'مركز المباريات', 'Live scores, fixtures & results', 'نتائج مباشرة، مواعيد ونتائج', 2),
  ('home', 'apiWidget', 'Live Widget', 'الودجت المباشر', 'Embedded API-Football widget', 'ودجت مدمج من API-Football', 3),
  ('home', 'goldenBoot', 'Golden Boot Race', 'سباق الحذاء الذهبي', 'Tournament top scorers', 'هدافو البطولة', 4),
  ('home', 'worldCupPulse', 'World Cup Pulse', 'نبض كأس العالم', 'Latest headlines', 'آخر العناوين', 5),
  ('home', 'highlights', 'Highlights', 'الملخصات', 'Match summaries and video clips', 'ملخصات المباريات ومقاطع الفيديو', 6),
  ('news', 'header', 'News Header', 'رأس صفحة الأخبار', 'World Cup 2026 news aggregator', 'جامع أخبار كأس العالم 2026', 1),
  ('news', 'newsgrid', 'News Grid', 'شبكة الأخبار', 'Article cards grid', 'شبكة بطاقات المقالات', 2),
  ('live', 'liveSection', 'Live Matches', 'المباريات المباشرة', 'Real-time match scores and stats', 'نتائج ومباريات في الوقت الحقيقي', 1)
on conflict (page, section_key) do update set
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  subtitle_en = excluded.subtitle_en,
  subtitle_ar = excluded.subtitle_ar,
  sort_order = excluded.sort_order,
  updated_at = now();
