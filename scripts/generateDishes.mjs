import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/dishes');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'commonChineseDishes.json');
const MAX_RETRIES = 3;

if (!API_KEY) {
  console.error('XIAOMI_API_KEY not set.');
  process.exit(1);
}

const BATCHES = [
  { batch: 1, start: 1,   end: 50, focus: '川菜、湘菜、东北菜经典菜' },
  { batch: 2, start: 51,  end: 100, focus: '粤菜、闽菜、浙菜经典菜' },
  { batch: 3, start: 101, end: 125, focus: '早餐、街头小吃、面食、包子饺子' },
  { batch: 4, start: 151, end: 200, focus: '火锅食材、烧烤、夜市小吃' },
  { batch: 5, start: 201, end: 250, focus: '素菜、豆腐、汤品、海鲜' },
];

const TEST_MODE = process.argv[2] !== '--all';
const batchesToRun = TEST_MODE ? [BATCHES[0]] : BATCHES;

function buildPrompt(batch) {
  return `You are generating a Chinese dishes database for a travel app helping foreign tourists in China.
Generate exactly ${batch.end - batch.start + 1} dish entries for: ${batch.focus}
Number them from dish_${String(batch.start).padStart(3,'0')} to dish_${String(batch.end).padStart(3,'0')}.

Output ONLY a valid JSON array, no explanation, no markdown, no code blocks.

Each item must follow this exact schema:
{
  "id": "dish_001",
  "chineseName": "宫保鸡丁",
  "englishName": "Kung Pao Chicken",
  "pinyin": "Gōng bǎo jī dīng",
  "cuisine": "Sichuan",
  "ingredients": ["chicken", "peanuts", "dried chili"],
  "allergens": ["peanuts"],
  "spicyLevel": 2,
  "vegetarianFriendly": false,
  "veganFriendly": false,
  "commonRegion": ["Sichuan", "nationwide"],
  "shortDescription": "Stir-fried chicken with peanuts and dried chilies",
  "orderTip": "Ask for less spicy if needed",
  "avoidIf": ["peanut allergy", "chili sensitivity"]
}

Rules:
- chineseName: simplified Chinese
- englishName: common English name tourists would recognize
- pinyin: with tone marks
- cuisine: one of Sichuan/Cantonese/Hunan/Zhejiang/Fujian/Northeast/Beijing/Shanghai/Street Food/Hotpot/BBQ/Vegetarian
- allergens: array of common allergens present (peanuts/shellfish/gluten/egg/dairy/soy/sesame/tree nuts) or empty array
- spicyLevel: 0=not spicy, 1=mild, 2=medium, 3=very spicy
- shortDescription: max 10 words
- orderTip: practical tip for tourists, max 15 words
- avoidIf: conditions when tourist should avoid this dish`;
}

function validateDishes(dishes, batch) {
  const errors = [];
  if (!Array.isArray(dishes)) { errors.push('Not an array'); return errors; }
  const expected = batch.end - batch.start + 1;
  if (dishes.length !== expected) errors.push(`Expected ${expected}, got ${dishes.length}`);
  dishes.forEach((d, i) => {
    const fields = ['id','chineseName','englishName','pinyin','cuisine','ingredients','allergens','shortDescription','orderTip','avoidIf'];
    fields.forEach(f => { if (d[f] === undefined || d[f] === null) errors.push(`Dish ${i+1}: missing "${f}"`); });
    if (typeof d.spicyLevel !== 'number') errors.push(`Dish ${i+1}: spicyLevel must be number`);
    if (typeof d.vegetarianFriendly !== 'boolean') errors.push(`Dish ${i+1}: vegetarianFriendly must be boolean`);
  });
  return errors;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 12000 }),
  });
  if (!response.ok) { const err = await response.text(); throw new Error(`API error ${response.status}: ${err}`); }
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function generateBatch(batch) {
  console.log(`\nGenerating batch ${batch.batch}: dish_${batch.start}-dish_${batch.end} (${batch.focus})`);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(batch));
      const dishes = parseJSON(raw);
      const errors = validateDishes(dishes, batch);
      if (errors.length > 0) {
        console.log(`  Validation errors:`, errors.slice(0, 3));
        if (attempt < MAX_RETRIES) continue;
        throw new Error('Validation failed');
      }
      console.log(`  OK: ${dishes.length} dishes`);
      return dishes;
    } catch (e) {
      console.error(`  Attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: batch 1 only (100 dishes)' : 'FULL MODE: all 5 batches (500 dishes)');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let allDishes = [];

  for (const batch of batchesToRun) {
    const dishes = await generateBatch(batch);
    if (dishes) {
      allDishes = allDishes.concat(dishes);
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allDishes, null, 2), 'utf-8');
      console.log(`  Saved: ${allDishes.length} dishes total`);
    } else {
      console.error(`  FAILED batch ${batch.batch}`);
    }
    if (batchesToRun.length > 1) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\nDone! Total: ${allDishes.length} dishes`);
  console.log(`Saved: src/data/dishes/commonChineseDishes.json`);
}

main();
