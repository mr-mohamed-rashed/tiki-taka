import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert sports journalist and football analyst specializing in the FIFA World Cup 2026. 
Your tone is professional, engaging, and highly accurate. 
You must ONLY provide information relevant to the 2026 World Cup, current national teams, and major player transfers. 
Do NOT provide outdated information from the 2022 World Cup.
Always respond in JSON format as requested by the specific action.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_3597b24c9c2f");
    if (!AI_API_TOKEN) {
      throw new Error("AI_API_TOKEN is not configured");
    }
    const AI_API_URL = Deno.env.get("AI_API_URL");
    if (!AI_API_URL) {
      throw new Error("AI_API_URL is not configured");
    }

    const { action, payload, lang = 'en' } = await req.json();
    let prompt = "";

    if (action === "ticker") {
      prompt = `Generate 5 breaking news headlines for a sports ticker. Focus on World Cup 2026 preparations, national team news, and major player transfers. 
      Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
      Return ONLY a JSON array of objects with 'tag' (e.g., 'BREAKING', 'TRANSFER', 'WORLD CUP') and 'text' (the headline).`;
    } else if (action === "news") {
      prompt = `Generate 4 recent, realistic news articles about the upcoming 2026 World Cup. 
      Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
      Return ONLY a JSON array of objects with 'id', 'title', 'summary', 'category', 'date' (recent date), and 'readTime'.`;
    } else if (action === "predict") {
      const { home, away } = payload;
      prompt = `Analyze a hypothetical 2026 World Cup match between ${home} and ${away}. 
      Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
      Return ONLY a JSON object with:
      - 'homeWinProb' (number 0-100)
      - 'awayWinProb' (number 0-100)
      - 'drawProb' (number 0-100)
      - 'analysis' (a short 2-sentence tactical analysis of the matchup)`;
    } else if (action === "commentary") {
      const { event } = payload;
      prompt = `Write a short, passionate, professional live sports commentary for this event: "${event}". 
      Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
      Tone: Enthusiastic, like a famous Arab sports commentator (e.g., Issam Chawali) if Arabic, or Peter Drury if English.
      Return ONLY a JSON object with 'text' (the commentary).`;
    } else if (action === "trending") {
      prompt = `List the top 5 trending national teams or players currently in the spotlight for the 2026 World Cup.
      Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
      Return ONLY a JSON array of objects with 'name', 'type' ('team' or 'player'), and 'reason' (short reason why they are trending).`;
    } else {
      throw new Error("Invalid action");
    }

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.5",
        messages: [
          { role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` }
        ],
        stream: false,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract JSON from Claude's response (handling potential markdown formatting)
    let content = data.content[0].text;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("AI returned invalid JSON");
    }

    return new Response(JSON.stringify(parsedContent), {
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
