import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const prompt = `You are a sports data aggregator for the FIFA World Cup 2026. 
Search the web for the latest statistics of the 2026 FIFA World Cup.
We need two things:
1. Tournament overall stats: total goals scored, total yellow cards, total red cards, total matches played so far.
2. The current top goalscorers list.

Return ONLY a JSON object with this exact structure:
{
  "tournament": {
    "total_goals": number,
    "yellow_cards": number,
    "red_cards": number,
    "matches_played": number
  },
  "top_scorers": [
    { "name": string, "team": string, "goals": number, "assists": number }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("Invalid response from Gemini");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", content);
      throw new Error("Gemini returned invalid JSON");
    }

    // Upsert Tournament Stats
    if (parsed.tournament) {
      const { total_goals, yellow_cards, red_cards, matches_played } = parsed.tournament;
      await supabase.from('tournament_stats').upsert({
        id: 1,
        total_goals: total_goals || 0,
        yellow_cards: yellow_cards || 0,
        red_cards: red_cards || 0,
        matches_played: matches_played || 0,
        updated_at: new Date().toISOString()
      });
    }

    // Upsert Player Stats
    if (parsed.top_scorers && Array.isArray(parsed.top_scorers)) {
      for (const player of parsed.top_scorers) {
        if (!player.name || !player.team) continue;
        await supabase.from('player_stats').upsert({
          player_name: player.name,
          team_name: player.team,
          goals: player.goals || 0,
          assists: player.assists || 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'player_name, team_name' });
      }
    }

    return new Response(JSON.stringify({ success: true, parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
