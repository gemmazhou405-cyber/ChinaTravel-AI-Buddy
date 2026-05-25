import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_DIR = path.join(__dirname, '../src/data/cityPacks');
const OUTPUT_DIR = path.join(__dirname, '../src/data/cityPacksMultilingual');
const MAX_RETRIES = 5;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ko', name: 'Korean' },
];

const CITIES = ['shanghai','beijing','guangzhou','shenzhen','chengdu','hangzhou','xian','chongqing','suzhou'];

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 3000 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

function buildPrompt(cityData, lang) {
  return `Translate this China city travel guide into ${lang.name}.
Translate ALL text fields. Keep cityId, cityNameCN, iataCode, phone numbers, app names unchanged.
Input: ${JSON.stringify(cityData, null, 2)}
Output ONLY translated JSON, no markdown.`;
}

async function translateCity(cityId, lang) {
  const outputFile = path.join(OUTPUT_DIR, lang.code, `${cityId}.json`);
  if (fs.existsSync(outputFile)) {
    console.log(`  Skipping ${lang.code}/${cityId} - already exists`);
    return true;
  }

  const inputFile = path.join(INPUT_DIR, `${cityId}.json`);
  if (!fs.existsSync(inputFile)) return false;

  const cityData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  ${lang.code}/${cityId} attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(cityData, lang));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      if (!result.cityId) throw new Error('Missing cityId');
      const langDir = path.join(OUTPUT_DIR, lang.code);
      if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log(`  Saved: ${lang.code}/${cityId}.json`);
      return true;
    } catch(e) {
      console.error(`  Failed: ${e.message}`);
      if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, 3000));
    }
  }
  return false;
}

async function main() {
  console.log('Retrying missing city packs...');
  let ok = 0, fail = 0;
  for (const lang of LANGUAGES) {
    for (const city of CITIES) {
      const success = await translateCity(city, lang);
      success ? ok++ : fail++;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log(`\nDone! OK: ${ok}, Failed: ${fail}`);
}

main();
