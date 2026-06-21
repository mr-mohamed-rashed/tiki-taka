const https = require('https');

const options = {
  hostname: 'v3.football.api-sports.io',
  path: '/fixtures?league=1&season=2026&status=FT-AET-PEN',
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': '19a3b0d1fe31969b6b6e615f1c38fccd'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(`Number of finished matches: ${parsed.response?.length}`);
    if (parsed.response?.length > 0) {
       console.log('First match:', parsed.response[0].fixture.status);
    }
  });
});

req.on('error', console.error);
req.end();
