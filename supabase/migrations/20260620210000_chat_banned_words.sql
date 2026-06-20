CREATE TABLE IF NOT EXISTS public.chat_banned_words (
    word TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial data
INSERT INTO public.chat_banned_words (word) VALUES
  ('احا'),
  ('خرا'),
  ('شرموط'),
  ('شرموطه'),
  ('متناك'),
  ('متناكه'),
  ('عرص'),
  ('خول'),
  ('قحبه'),
  ('قحبة'),
  ('زبي'),
  ('كسمك'),
  ('كس'),
  ('نيك'),
  ('منيوك')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.chat_banned_words ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Allow public select on banned words" ON public.chat_banned_words
    FOR SELECT USING (true);

-- Only admins can insert
CREATE POLICY "Allow insert for admins" ON public.chat_banned_words
    FOR INSERT WITH CHECK (public.is_admin());

-- Only admins can delete
CREATE POLICY "Allow delete for admins" ON public.chat_banned_words
    FOR DELETE USING (public.is_admin());

-- Also enable realtime for this table so the chat updates immediately if an admin adds a word
begin;
  do $$
  begin
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_banned_words'
    ) then
      alter publication supabase_realtime add table public.chat_banned_words;
    end if;
  end;
  $$;
commit;
