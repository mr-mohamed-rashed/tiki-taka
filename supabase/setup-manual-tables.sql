-- Create table for Manual Matches
CREATE TABLE public.manual_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition TEXT NOT NULL,
    stage TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'finished')),
    home_team_id TEXT NOT NULL,
    home_team_name TEXT NOT NULL,
    home_team_flag TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_team_id TEXT NOT NULL,
    away_team_name TEXT NOT NULL,
    away_team_flag TEXT NOT NULL,
    away_score INTEGER DEFAULT 0,
    venue TEXT NOT NULL,
    minute TEXT,
    highlight_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Manual Matches
ALTER TABLE public.manual_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for Manual Matches
CREATE POLICY "Public read access for manual_matches" ON public.manual_matches
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow all actions for authenticated users on manual_matches" ON public.manual_matches
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create table for News Articles
CREATE TABLE public.news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT,
    content_en TEXT,
    image_url TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for News Articles
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for News Articles
CREATE POLICY "Public read access for active news_articles" ON public.news_articles
    FOR SELECT TO public USING (status = 'active');

CREATE POLICY "Allow all actions for authenticated users on news_articles" ON public.news_articles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for manual_matches
CREATE TRIGGER update_manual_matches_modtime
    BEFORE UPDATE ON public.manual_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Trigger for news_articles
CREATE TRIGGER update_news_articles_modtime
    BEFORE UPDATE ON public.news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
