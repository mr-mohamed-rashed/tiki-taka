import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { matchId, home, away, stage } = await req.json();

    if (!matchId || !home || !away) {
      throw new Error("Missing match details");
    }

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if news for this match already exists today to prevent spam
    const { data: existing } = await supabase
      .from('manual_news')
      .select('id')
      .eq('category', 'Pulse')
      .ilike('title_en', `%${home}%${away}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ success: true, message: "News already exists" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Gemini API
    const prompt = `أنت صحفي رياضي خبير. اكتب خبر صحفي قصير جداً ومثير (بحد أقصى 50 كلمة) عن المباراة القادمة بين ${home} و ${away} في كأس العالم (${stage || 'المجموعات'}). تحدث عن استعدادات الفريقين وأهمية المباراة. لا تستخدم هاشتاجات. اكتب العنوان في السطر الأول، والخبر في السطر الثاني.`;
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok || !aiData.candidates) {
      throw new Error("Failed to generate content from AI");
    }

    const generatedText = aiData.candidates[0].content.parts[0].text;
    const lines = generatedText.split('\n').filter((l: string) => l.trim().length > 0);
    const title = lines[0].replace(/[*#]/g, '').trim();
    const excerpt = lines.slice(1).join(' ').replace(/[*#]/g, '').trim();

    // Insert into manual_news
    const newsItem = {
      title_ar: title,
      title_en: `${home} vs ${away}: Pre-match updates`,
      excerpt_ar: excerpt,
      excerpt_en: `Preparations are underway for the clash between ${home} and ${away}.`,
      category: 'Pulse',
      image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      is_published: true,
      published_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from('manual_news').insert(newsItem);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, news: newsItem }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
