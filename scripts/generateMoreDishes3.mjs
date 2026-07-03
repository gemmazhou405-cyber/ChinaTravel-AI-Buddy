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
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 600 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateBatch(start, focus) {
  const end = start + 4;
  const prompt = 'Generate 5 Chinese dishes for: ' + focus + '. Number dish_' + start + ' to dish_' + end + '. Output ONLY JSON array. Each item must have exactly these fields: id, chineseName, englishName, pinyin, cuisine, ingredients, allergens, spicyLevel, vegetarianFriendly, veganFriendly, commonRegion, shortDescription, orderTip, avoidIf. Keep shortDescription under 6 words and orderTip under 10 words.';

  for (let i = 1; i <= 8; i++) {
    try {
      console.log('  dish_' + start + '-' + end + ' attempt ' + i + '...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const dishes = JSON.parse(cleaned);
      if (!Array.isArray(dishes) || dishes.length < 3) throw new Error('Too few: ' + (dishes ? dishes.length : 0));
      return dishes;
    } catch(e) {
      console.error('  Failed: ' + e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log('Starting: ' + existing.length + ' dishes');
  let all = [...existing];

  const batches = [
    { start: 246, focus: 'Beijing roast duck and northern dumplings' },
    { start: 251, focus: 'Cantonese dim sum specialties' },
    { start: 256, focus: 'Sichuan mala spicy dishes' },
    { start: 261, focus: 'Chinese street food snacks' },
    { start: 266, focus: 'Chinese noodle varieties' },
    { start: 271, focus: 'Chinese soups and broths' },
    { start: 276, focus: 'Chinese sweet desserts and drinks' },
    { start: 281, focus: 'Yunnan minority cuisine specialties' },
    { start: 286, focus: 'Hunan spicy dishes' },
    { start: 291, focus: 'Chinese seafood dishes' },
  ];

  for (const b of batches) {
    console.log('\nBatch: ' + b.focus);
    const dishes = await generateBatch(b.start, b.focus);
    if (dishes) {
      all = [...all, ...dishes];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2));
      console.log('  Total: ' + all.length + ' dishes');
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nDone! Total: ' + all.length + ' dishes');
}

main();
