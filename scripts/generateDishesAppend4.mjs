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
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 2000 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log(`Starting with ${existing.length} dishes`);

  const prompt = `Generate exactly 10 Chinese seafood dishes.
Number them dish_246 to dish_255.
Output ONLY a valid JSON array, no explanation, no markdown.
Each item: {"id":"dish_246","chineseName":"...","englishName":"...","pinyin":"...","cuisine":"Cantonese","ingredients":["..."],"allergens":["shellfish"],"spicyLevel":0,"vegetarianFriendly":false,"veganFriendly":false,"commonRegion":["nationwide"],"shortDescription":"max 8 words","orderTip":"max 12 words","avoidIf":["shellfish allergy"]}`;

  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      console.log(`Attempt ${attempt}/8...`);
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const dishes = JSON.parse(cleaned);
      if (!Array.isArray(dishes)) throw new Error('Not an array');
      const all = [...existing, ...dishes];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2), 'utf-8');
      console.log(`Done! Total: ${all.length} dishes`);
      return;
    } catch(e) {
      console.error(`Failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main();
