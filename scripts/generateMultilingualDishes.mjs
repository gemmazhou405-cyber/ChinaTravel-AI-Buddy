import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_FILE = path.join(__dirname, '../src/data/dishes/commonChineseDishes.json');
const OUTPUT_DIR = path.join(__dirname, '../src/data/dishesMultilingual');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

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

function buildPrompt(dishes, lang) {
  return `Translate these Chinese dish descriptions into ${lang.name}.
Translate: englishName, shortDescription, orderTip, avoidIf (array items).
Keep unchanged: id, chineseName, pinyin, cuisine, ingredients, allergens, spicyLevel, vegetarianFriendly, veganFriendly, commonRegion.
Add translated fields: ${lang.code}Name, ${lang.code}Description, ${lang.code}OrderTip.

Input:
${JSON.stringify(dishes, null, 2)}

Output ONLY valid JSON array, no markdown.`;
}

async function translateBatch(dishes, lang, batchNum) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await callAPI(buildPrompt(dishes, lang));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      if (!Array.isArray(result)) throw new Error('Not array');
      return result;
    } catch(e) {
      console.error(`    Batch ${batchNum} attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return dishes.map(d => ({ ...d, [`${lang.code}Name`]: d.englishName, [`${lang.code}Description`]: d.shortDescription, [`${lang.code}OrderTip`]: d.orderTip }));
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function translateLanguage(lang, allDishes) {
  console.log(`\nLanguage: ${lang.name}`);
  const outputFile = path.join(OUTPUT_DIR, `${lang.code}.json`);
  
  if (fs.existsSync(outputFile)) {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    if (existing.length >= allDishes.length) {
      console.log(`  Already complete (${existing.length} dishes)`);
      return;
    }
  }

  const translated = [];
  const batchSize = 10;

  for (let i = 0; i < allDishes.length; i += batchSize) {
    const batch = allDishes.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const total = Math.ceil(allDishes.length / batchSize);
    console.log(`  Batch ${batchNum}/${total} (dishes ${i+1}-${i+batch.length})...`);
    
    const result = await translateBatch(batch, lang, batchNum);
    translated.push(...result);
    
    // 每批保存一次
    fs.writeFileSync(outputFile, JSON.stringify(translated, null, 2));
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`  Done: ${translated.length} dishes saved`);
}

async function main() {
  const allDishes = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`Total dishes: ${allDishes.length}`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const langsToRun = TEST_MODE ? [LANGUAGES[0]] : LANGUAGES;
  console.log(TEST_MODE ? 'TEST MODE: French only (first 10 dishes)' : `FULL MODE: ${LANGUAGES.length} languages`);

  const dishesToRun = TEST_MODE ? allDishes.slice(0, 10) : allDishes;

  for (const lang of langsToRun) {
    await translateLanguage(lang, dishesToRun);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nAll done!');
}

main();
