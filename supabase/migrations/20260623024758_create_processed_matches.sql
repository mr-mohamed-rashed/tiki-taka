CREATE TABLE IF NOT EXISTS public.processed_matches (
    match_id text PRIMARY KEY,
    match_name text NOT NULL,
    processed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up RLS
ALTER TABLE public.processed_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
    ON public.processed_matches
    FOR SELECT
    USING (true);

CREATE POLICY "Allow service role insert access"
    ON public.processed_matches
    FOR INSERT
    TO service_role
    WITH CHECK (true);
