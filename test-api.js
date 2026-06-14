async function fetchESPN() {
  try {
    const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard");
    const data = await res.json();
    console.log(JSON.stringify(data.events[0], null, 2));
  } catch(e) {
    console.error(e);
  }
}
fetchESPN();
