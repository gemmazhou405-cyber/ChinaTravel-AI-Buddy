import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_FILE = path.join(__dirname, '../src/data/dishes/commonChineseDishes.json');

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 6000 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

const prompt = `Generate exactly 25 Chinese dish entries for: 素菜、豆腐、汤品、海鲜 (vegetarian dishes, tofu, soups, seafood).
Number them dish_251 to dish_275.
Output ONLY a valid JSON array, no explanation, no markdown.
Each item schema:
{"id":"dish_251","chineseName":"...","englishName":"...","pinyin":"...","cuisine":"...","ingredients":["..."],"allergens":[],"spicyLevel":0,"vegetarianFriendly":true,"veganFriendly":false,"commonRegion":["nationwide"],"shortDescription":"max 10 words","orderTip":"max 15 words","avoidIf":[]}`;

async function main() {
  console.log('Generating dish_251 to dish_275...');
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Attempt ${attempt}/5...`);
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const newDishes = JSON.parse(cleaned);
      if (!Array.isArray(newDishes)) throw new Error('Not an array');
      console.log(`Got ${newDishes.length} dishes`);
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      const merged = [...existing, ...newDishes];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      console.log(`Done! Total: ${merged.length} dishes`);
      return;
    } catch(e) {
      console.error(`Attempt ${attempt} failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main();
