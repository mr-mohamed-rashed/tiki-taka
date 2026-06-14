async function test() {
  const res = await fetch('https://worldcup26.ir/get/games');
  const json = await res.json();
  const games = json.games || json;
  console.log("Total games:", games.length);
  const japan = games.filter(g => g.home_team_name_en?.includes('Japan') || g.away_team_name_en?.includes('Japan'));
  console.log("Japan games:", japan);
  const aus = games.filter(g => g.home_team_name_en?.includes('Australia') || g.away_team_name_en?.includes('Australia'));
  console.log("Australia games:", aus);
}
test();
