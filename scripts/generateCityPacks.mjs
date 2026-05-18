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

const CITIES = [
  { id: 'shanghai', name: 'Shanghai', nameCN: '上海' },
  { id: 'beijing', name: 'Beijing', nameCN: '北京' },
  { id: 'guangzhou', name: 'Guangzhou', nameCN: '广州' },
  { id: 'shenzhen', name: 'Shenzhen', nameCN: '深圳' },
  { id: 'chengdu', name: 'Chengdu', nameCN: '成都' },
  { id: 'hangzhou', name: 'Hangzhou', nameCN: '杭州' },
  { id: 'xian', name: "Xi'an", nameCN: '西安' },
  { id: 'chongqing', name: 'Chongqing', nameCN: '重庆' },
  { id: 'suzhou', name: 'Suzhou', nameCN: '苏州' },
];

const TEST_MODE = process.argv[2] !== '--all';
const citiesToRun = TEST_MODE ? [CITIES[0]] : CITIES;

function buildPrompt(city) {
  return `You are creating a city survival pack for foreign tourists visiting ${city.name}, China.
Output ONLY a valid JSON object, no explanation, no markdown, no code blocks.

Schema:
{
  "cityId": "${city.id}",
  "cityName": "${city.name}",
  "cityNameCN": "${city.nameCN}",
  "airport": {
    "name": "airport name",
    "iataCode": "code",
    "toCity": "how to get from airport to city center, practical tips"
  },
  "transport": {
    "metro": "metro tips for tourists",
    "taxi": "taxi tips, recommended apps",
    "didi": "Didi tips",
    "tips": ["tip1", "tip2", "tip3"]
  },
  "payment": {
    "alipay": "Alipay setup tip for foreigners",
    "wechatPay": "WeChat Pay tip",
    "cash": "cash availability tip",
    "foreignCard": "foreign card acceptance tip"
  },
  "accommodation": {
    "recommendedAreas": ["area1", "area2"],
    "tips": ["tip1", "tip2"]
  },
  "food": {
    "mustTry": ["dish1", "dish2", "dish3", "dish4", "dish5"],
    "foodStreets": ["street1", "street2"],
    "tips": ["tip1", "tip2"]
  },
  "commonScams": ["scam1", "scam2", "scam3"],
  "emergency": {
    "police": "110",
    "ambulance": "120",
    "fire": "119",
    "localTip": "specific emergency tip for this city"
  },
  "usefulApps": ["app1", "app2", "app3"],
  "bestTimeToVisit": "brief note on best time",
  "touristTips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
}

Rules:
- All tips in English
- Practical, tourist-focused
- No political content
- No visa advice
- Focus on day-to-day survival tips
- Keep each tip under 20 words`;
}

function validateCity(data, cityId) {
  const errors = [];
  const required = ['cityId','cityName','cityNameCN','airport','transport','payment','accommodation','food','commonScams','emergency','usefulApps','touristTips'];
  required.forEach(f => { if (!data[f]) errors.push(`Missing: ${f}`); });
  if (data.cityId !== cityId) errors.push(`cityId should be ${cityId}`);
  return errors;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 3000 }),
  });
  if (!response.ok) { const err = await response.text(); throw new Error(`API error ${response.status}: ${err}`); }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateCity(city) {
  console.log(`\nGenerating: ${city.name} (${city.nameCN})`);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(city));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      const errors = validateCity(data, city.id);
      if (errors.length > 0) {
        console.log(`  Validation errors:`, errors);
        if (attempt < MAX_RETRIES) continue;
        throw new Error('Validation failed');
      }
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, `${city.id}.json`), JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  Saved: src/data/cityPacks/${city.id}.json`);
      return true;
    } catch(e) {
      console.error(`  Attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: Shanghai only' : 'FULL MODE: all 9 cities');
  const results = [];
  for (const city of citiesToRun) {
    const success = await generateCity(city);
    results.push({ city: city.name, success });
    if (citiesToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(({ city, success }) => console.log(`  ${success ? 'OK' : 'FAIL'} ${city}`));
}

main();
