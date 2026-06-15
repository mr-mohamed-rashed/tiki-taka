create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  user_agent text,
  ip_address text,
  device_type text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Allow anyone to insert page views
drop policy if exists "Anyone can insert page views" on public.page_views;
create policy "Anyone can insert page views"
on public.page_views for insert
with check (true);

-- Only admins can view page views
drop policy if exists "Admins can view page views" on public.page_views;
create policy "Admins can view page views"
on public.page_views for select
using (public.is_admin());

-- Create an index for faster daily queries
create index if not exists idx_page_views_created_at on public.page_views(created_at);
create index if not exists idx_page_views_path on public.page_views(path);
