import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkitraqfgcbahsfkqsxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraXRyYXFmZ2NiYWhzZmtxc3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODYxNzgsImV4cCI6MjA5Njg2MjE3OH0.5Yrves65gaKTs6OJfGJX6vv4piwDFxDomSeMuP_uJFw';

const supabase = createClient(supabaseUrl, supabaseKey);

const realData = [
  { player_name: "Kylian Mbappé", team_name: "France", goals: 8, assists: 2, motm_awards: 3, yellow_cards: 0, red_cards: 0 },
  { player_name: "Lionel Messi", team_name: "Argentina", goals: 7, assists: 3, motm_awards: 5, yellow_cards: 1, red_cards: 0 },
  { player_name: "Julián Álvarez", team_name: "Argentina", goals: 4, assists: 0, motm_awards: 0, yellow_cards: 0, red_cards: 0 },
  { player_name: "Olivier Giroud", team_name: "France", goals: 4, assists: 0, motm_awards: 1, yellow_cards: 1, red_cards: 0 },
  { player_name: "Álvaro Morata", team_name: "Spain", goals: 3, assists: 1, motm_awards: 0, yellow_cards: 0, red_cards: 0 },
  { player_name: "Gonçalo Ramos", team_name: "Portugal", goals: 3, assists: 1, motm_awards: 1, yellow_cards: 0, red_cards: 0 },
  { player_name: "Cody Gakpo", team_name: "Netherlands", goals: 3, assists: 0, motm_awards: 0, yellow_cards: 0, red_cards: 0 },
  { player_name: "Marcus Rashford", team_name: "England", goals: 3, assists: 0, motm_awards: 0, yellow_cards: 0, red_cards: 0 },
  { player_name: "Richarlison", team_name: "Brazil", goals: 3, assists: 0, motm_awards: 1, yellow_cards: 0, red_cards: 0 },
  { player_name: "Bukayo Saka", team_name: "England", goals: 3, assists: 0, motm_awards: 1, yellow_cards: 0, red_cards: 0 },
  { player_name: "Enner Valencia", team_name: "Ecuador", goals: 3, assists: 0, motm_awards: 1, yellow_cards: 0, red_cards: 0 },
];

async function insertData() {
  console.log("Inserting real World Cup top scorers...");
  
  // Clean up old ones to avoid duplicates or messy table
  await supabase.from('player_stats').delete().neq('goals', -1); 
  
  const { data, error } = await supabase.from('player_stats').insert(realData);
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully inserted real data!");
  }
}

insertData();
