import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/cityPacks');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const NEW_CITIES = [
  { id: 'wuhan', name: 'Wuhan', nameCN: '武汉' },
  { id: 'nanjing', name: 'Nanjing', nameCN: '南京' },
  { id: 'tianjin', name: 'Tianjin', nameCN: '天津' },
  { id: 'qingdao', name: 'Qingdao', nameCN: '青岛' },
  { id: 'kunming', name: 'Kunming', nameCN: '昆明' },
  { id: 'sanya', name: 'Sanya', nameCN: '三亚' },
];

const TEST_MODE = process.argv[2] !== '--all';
const citiesToRun = TEST_MODE ? [NEW_CITIES[0]] : NEW_CITIES;

async function callAPI(prompt) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 3000 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

function buildPrompt(city) {
  return 'You are creating a city survival pack for foreign tourists visiting ' + city.name + ', China.\n' +
    'Output ONLY a valid JSON object, no explanation, no markdown.\n' +
    '{"cityId":"' + city.id + '","cityName":"' + city.name + '","cityNameCN":"' + city.nameCN + '","airport":{"name":"...","iataCode":"...","toCity":"..."},"transport":{"metro":"...","taxi":"...","didi":"...","tips":["...","...","..."]},"payment":{"alipay":"...","wechatPay":"...","cash":"...","foreignCard":"..."},"accommodation":{"recommendedAreas":["...","..."],"tips":["...","..."]},"food":{"mustTry":["...","...","...","...","..."],"foodStreets":["...","..."],"tips":["...","..."]},"commonScams":["...","...","..."],"emergency":{"police":"110","ambulance":"120","fire":"119","localTip":"..."},"usefulApps":["...","...","..."],"bestTimeToVisit":"...","touristTips":["...","...","...","...","..."]}\n' +
    'Rules: all tips in English, practical tourist-focused, no political content, no visa advice, keep each tip under 20 words.';
}

function validate(data, cityId) {
  const errors = [];
  const required = ['cityId','cityName','cityNameCN','airport','transport','payment','food','emergency','touristTips'];
  required.forEach(function(f) { if (!data[f]) errors.push('Missing: ' + f); });
  if (data.cityId !== cityId) errors.push('cityId should be ' + cityId);
  return errors;
}

async function generateCity(city) {
  const outputFile = path.join(OUTPUT_DIR, city.id + '.json');
  if (fs.existsSync(outputFile)) {
    console.log('  Skipping ' + city.id + ' - already exists');
    return true;
  }
  console.log('\nGenerating: ' + city.name + ' (' + city.nameCN + ')');
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI(buildPrompt(city));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      const errors = validate(data, city.id);
      if (errors.length > 0) throw new Error(errors.join(', '));
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
      console.log('  Saved: ' + city.id + '.json');
      return true;
    } catch(e) {
      console.error('  Attempt ' + attempt + ' failed: ' + e.message);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: Wuhan only' : 'FULL MODE: all 6 new cities');
  const results = [];
  for (const city of citiesToRun) {
    const success = await generateCity(city);
    results.push({ city: city.name, success });
    if (citiesToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(function(r) { console.log('  ' + (r.success ? 'OK' : 'FAIL') + ' ' + r.city); });
}

main();
