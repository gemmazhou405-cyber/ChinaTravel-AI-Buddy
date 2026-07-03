import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_FILE = path.join(__dirname, '../src/data/dishes/commonChineseDishes.json');
const MAX_RETRIES = 5;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const BATCHES = [
  { start: 246, end: 270, focus: 'Northern Chinese cuisine, Beijing dishes, dumplings' },
  { start: 271, end: 295, focus: 'Cantonese dim sum, Hong Kong style dishes' },
  { start: 296, end: 320, focus: 'Sichuan spicy dishes, hot pot ingredients' },
  { start: 321, end: 345, focus: 'Street food, snacks, breakfast items' },
  { start: 346, end: 370, focus: 'Vegetarian dishes, tofu specialties' },
  { start: 371, end: 395, focus: 'Seafood dishes, coastal Chinese cuisine' },
  { start: 396, end: 420, focus: 'Noodle dishes, rice dishes, staples' },
  { start: 421, end: 445, focus: 'Soup dishes, stews, braised meats' },
  { start: 446, end: 470, focus: 'Desserts, sweet snacks, drinks' },
  { start: 471, end: 500, focus: 'Regional specialties: Yunnan, Xinjiang, Hunan' },
];

const TEST_MODE = process.argv[2] !== '--all';
const batchesToRun = TEST_MODE ? [BATCHES[0]] : BATCHES;

async function callAPI(prompt) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1500 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateBatch(batch) {
  const count = batch.end - batch.start + 1;
  const prompt = 'Generate exactly ' + count + ' Chinese dish entries for: ' + batch.focus + '.\n' +
    'Number them dish_' + batch.start + ' to dish_' + batch.end + '.\n' +
    'Output ONLY valid JSON array, no markdown.\n' +
    'Each item: {"id":"dish_' + batch.start + '","chineseName":"...","englishName":"...","pinyin":"...","cuisine":"...","ingredients":["..."],"allergens":[],"spicyLevel":0,"vegetarianFriendly":false,"veganFriendly":false,"commonRegion":["..."],"shortDescription":"max 8 words","orderTip":"max 12 words","avoidIf":[]}';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Batch ' + batch.start + '-' + batch.end + ' attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const dishes = JSON.parse(cleaned);
      if (!Array.isArray(dishes) || dishes.length < 10) throw new Error('Got ' + (dishes ? dishes.length : 0) + ' dishes');
      return dishes;
    } catch(e) {
      console.error('  Failed: ' + e.message);
      if (attempt === MAX_RETRIES) return null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: first batch only' : 'FULL MODE: all batches');
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log('Starting with ' + existing.length + ' dishes');
  let all = [...existing];

  for (const batch of batchesToRun) {
    const dishes = await generateBatch(batch);
    if (dishes) {
      all = [...all, ...dishes];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2));
      console.log('  Saved: ' + all.length + ' dishes total');
    } else {
      console.log('  FAILED batch ' + batch.start + '-' + batch.end);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('\nDone! Total: ' + all.length + ' dishes');
}

main();
