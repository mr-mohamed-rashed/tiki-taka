CREATE TABLE IF NOT EXISTS public.chat_profanity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    original_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_profanity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.chat_profanity_logs
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select for admin" ON public.chat_profanity_logs
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public delete for admin" ON public.chat_profanity_logs
    FOR DELETE
    USING (true);
