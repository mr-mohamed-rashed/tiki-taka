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

    // 1. Fetch ESPN matches
    const espnResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    if (!espnResponse.ok) throw new Error("Failed to fetch ESPN data");
    const espnData = await espnResponse.json();

    // 2. Filter completed matches
    const events = espnData.events || [];
    const completedMatches = events.filter((e: any) => e.status.type.state === 'post');

    const processedLog = [];

    // 3. Process each completed match
    for (const match of completedMatches) {
      const matchId = match.id;
      
      // Check if already processed
      const { data: existing } = await supabase
        .from('processed_matches')
        .select('match_id')
        .eq('match_id', matchId)
        .maybeSingle();

      if (existing) {
        continue; // Skip, already extracted
      }

      // We have a new match!
      const comp = match.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home')?.team?.name || '';
      const away = comp.competitors.find((c: any) => c.homeAway === 'away')?.team?.name || '';
      
      if (!home || !away) continue;

      const matchQuery = `${home} vs ${away} World Cup 2026 match stats goalscorers cards`;
      
      // Call Gemini for this match
      const prompt = `Search the web for the match report and statistics for this specific match: "${matchQuery}".
Extract the goalscorers, players who assisted, the Man of the Match (best player), and players who received yellow or red cards.

Return ONLY a JSON array of objects representing the players who achieved these stats in THIS match.
Each object must have this exact structure:
{
  "name": "Player Full Name",
  "team": "Country Name",
  "goals": number (how many goals they scored in this match),
  "assists": number (how many assists they made in this match),
  "motm_awards": number (1 if they were Man of the Match, 0 otherwise),
  "yellow_cards": number (how many yellow cards they received in this match),
  "red_cards": number (how many red cards they received in this match)
}

Do NOT include players who have all zeros. Only include players who actually scored, assisted, got MOTM, or got a card.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (!response.ok) {
        console.error(`Gemini failed for ${matchQuery}`);
        continue; // Move to the next match
      }

      const data = await response.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      let parsedPlayers: any[];
      try {
        parsedPlayers = JSON.parse(content);
      } catch (e) {
        continue;
      }

      if (!Array.isArray(parsedPlayers)) continue;

      // Upsert stats
      for (const p of parsedPlayers) {
        if (!p.name || !p.team) continue;
        const { data: dbPlayer } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_name', p.name)
          .eq('team_name', p.team)
          .maybeSingle();

        const newStats = {
          player_name: p.name,
          team_name: p.team,
          goals: (dbPlayer?.goals || 0) + (p.goals || 0),
          assists: (dbPlayer?.assists || 0) + (p.assists || 0),
          motm_awards: (dbPlayer?.motm_awards || 0) + (p.motm_awards || 0),
          yellow_cards: (dbPlayer?.yellow_cards || 0) + (p.yellow_cards || 0),
          red_cards: (dbPlayer?.red_cards || 0) + (p.red_cards || 0),
          updated_at: new Date().toISOString()
        };

        await supabase.from('player_stats').upsert(newStats, { onConflict: 'player_name, team_name' });
      }

      // Mark as processed
      await supabase.from('processed_matches').insert({
        match_id: matchId,
        match_name: `${home} vs ${away}`
      });

      processedLog.push(`${home} vs ${away}`);
    }

    return new Response(JSON.stringify({ success: true, processed: processedLog }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
