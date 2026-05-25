import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_DIR = path.join(__dirname, '../src/data/cityPacks');
const OUTPUT_DIR = path.join(__dirname, '../src/data/cityPacksMultilingual');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const CITIES = ['shanghai','beijing','guangzhou','shenzhen','chengdu','hangzhou','xian','chongqing','suzhou'];

const TEST_MODE = process.argv[2] !== '--all';

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
Translate ALL text fields into ${lang.name}. Keep cityId, cityName, cityNameCN, iataCode, phone numbers, and app names unchanged.

Input:
${JSON.stringify(cityData, null, 2)}

Output ONLY the translated JSON object with exact same structure. No explanation, no markdown.`;
}

async function translateCity(cityId, lang) {
  const inputFile = path.join(INPUT_DIR, `${cityId}.json`);
  if (!fs.existsSync(inputFile)) {
    console.log(`  Skipping ${cityId} - not found`);
    return null;
  }

  const cityData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`    Attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(cityData, lang));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      if (!result.cityId) throw new Error('Missing cityId');
      return result;
    } catch(e) {
      console.error(`    Failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const citiesToRun = TEST_MODE ? ['shanghai'] : CITIES;
  const langsToRun = TEST_MODE ? [LANGUAGES[0]] : LANGUAGES;

  console.log(TEST_MODE ? 'TEST MODE: Shanghai + French' : `FULL MODE: ${CITIES.length} cities x ${LANGUAGES.length} languages`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const lang of langsToRun) {
    console.log(`\nLanguage: ${lang.name}`);
    const langDir = path.join(OUTPUT_DIR, lang.code);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

    for (const city of citiesToRun) {
      console.log(`  City: ${city}`);
      const result = await translateCity(city, lang);
      if (result) {
        fs.writeFileSync(path.join(langDir, `${city}.json`), JSON.stringify(result, null, 2));
        console.log(`  Saved: ${lang.code}/${city}.json`);
      } else {
        console.log(`  FAILED: ${city}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\nDone!');
}

main();
