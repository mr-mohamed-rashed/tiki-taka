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
    const prompt = `أنت صحفي رياضي خبير. بناءً على المباراة القادمة في كأس العالم بين ${home} و ${away} (${stage || 'المجموعات'}):
اكتب خبرين منفصلين باللغة العربية (خبر عن استعدادات ${home} وخبر عن استعدادات ${away}).
يجب أن يكون كل خبر قصيراً جداً (سطر واحد فقط) مع عنوان جذاب يتكون من كلمتين أو ثلاثة (مثل "قوة ألمانية:", "حماس إيفواري:").
لا تستخدم هاشتاجات.

يجب أن ترد بصيغة مصفوفة JSON فقط (بدون أي نص آخر أو markdown)، بهذا الشكل:
[
  { "title": "عنوان قصير:", "excerpt": "نص الخبر في سطر واحد." },
  { "title": "عنوان قصير:", "excerpt": "نص الخبر في سطر واحد." }
]`;
    
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
    
    // Extract JSON array from text (in case it wraps it in markdown)
    const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }
    
    const articles = JSON.parse(jsonMatch[0]);

    // Insert into manual_news
    const newsItems = articles.map((article: any, index: number) => ({
      title_ar: article.title,
      title_en: `${index === 0 ? home : away} Pre-match updates`,
      excerpt_ar: article.excerpt,
      excerpt_en: `Preparations are underway for the clash between ${home} and ${away}.`,
      category: 'Pulse',
      image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      is_published: true,
      published_at: new Date(Date.now() - index * 1000).toISOString(), // slightly offset time
    }));

    const { error: insertError } = await supabase.from('manual_news').insert(newsItems);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, news: newsItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
