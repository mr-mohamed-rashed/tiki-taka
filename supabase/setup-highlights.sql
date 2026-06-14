-- Create match_highlights table
CREATE TABLE IF NOT EXISTS public.match_highlights (
    match_id TEXT PRIMARY KEY,
    highlight_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.match_highlights ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.match_highlights
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated admins to insert/update
CREATE POLICY "Allow authenticated admins full access" ON public.match_highlights
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
