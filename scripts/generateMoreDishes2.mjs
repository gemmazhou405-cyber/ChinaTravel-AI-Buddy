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
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1200 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateBatch(start, end, focus) {
  const prompt = 'Generate ' + (end-start+1) + ' Chinese dishes for: ' + focus + '. Number dish_' + start + ' to dish_' + end + '. Output ONLY JSON array. Each: {"id":"dish_' + start + '","chineseName":"...","englishName":"...","pinyin":"...","cuisine":"...","ingredients":["..."],"allergens":[],"spicyLevel":0,"vegetarianFriendly":false,"veganFriendly":false,"commonRegion":["..."],"shortDescription":"5 words max","orderTip":"8 words max","avoidIf":[]}';
  
  for (let i = 1; i <= 8; i++) {
    try {
      console.log('  Batch ' + start + '-' + end + ' attempt ' + i + '/8...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const dishes = JSON.parse(cleaned);
      if (!Array.isArray(dishes) || dishes.length < 5) throw new Error('Too few: ' + (dishes||[]).length);
      return dishes;
    } catch(e) {
      console.error('  Failed: ' + e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log('Starting: ' + existing.length + ' dishes');
  let all = [...existing];

  const batches = [
    { start: 246, end: 255, focus: 'Beijing duck, northern dumplings' },
    { start: 256, end: 265, focus: 'Cantonese dim sum dishes' },
    { start: 266, end: 275, focus: 'Sichuan spicy specialties' },
    { start: 276, end: 285, focus: 'Chinese street food snacks' },
    { start: 286, end: 295, focus: 'Chinese noodle dishes' },
    { start: 296, end: 305, focus: 'Chinese soup and stew dishes' },
    { start: 306, end: 315, focus: 'Chinese desserts and sweet snacks' },
    { start: 316, end: 325, focus: 'Yunnan and Xinjiang regional dishes' },
    { start: 326, end: 335, focus: 'Hunan and Zhejiang dishes' },
    { start: 336, end: 345, focus: 'Chinese seafood specialties' },
  ];

  for (const b of batches) {
    const dishes = await generateBatch(b.start, b.end, b.focus);
    if (dishes) {
      all = [...all, ...dishes];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2));
      console.log('  Total: ' + all.length + ' dishes');
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Done! Total: ' + all.length + ' dishes');
}

main();
