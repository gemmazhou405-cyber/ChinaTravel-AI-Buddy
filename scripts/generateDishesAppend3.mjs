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
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 3000 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateBatch(start, end, focus) {
  const prompt = `Generate exactly ${end-start+1} Chinese dish entries for: ${focus}.
Number them dish_${start} to dish_${end}.
Output ONLY a valid JSON array, no explanation, no markdown.
Each item: {"id":"dish_${start}","chineseName":"...","englishName":"...","pinyin":"...","cuisine":"...","ingredients":["..."],"allergens":[],"spicyLevel":0,"vegetarianFriendly":false,"veganFriendly":false,"commonRegion":["nationwide"],"shortDescription":"max 10 words","orderTip":"max 15 words","avoidIf":[]}`;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`  Batch ${start}-${end} attempt ${attempt}/5...`);
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const dishes = JSON.parse(cleaned);
      if (!Array.isArray(dishes)) throw new Error('Not an array');
      return dishes;
    } catch(e) {
      console.error(`  Failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return [];
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log(`Starting with ${existing.length} dishes`);
  
  const batches = [
    { start: 226, end: 235, focus: '素菜、豆腐 vegetarian dishes and tofu' },
    { start: 236, end: 245, focus: '汤品 Chinese soups' },
    { start: 246, end: 255, focus: '海鲜 seafood dishes' },
  ];

  let all = [...existing];
  for (const b of batches) {
    const dishes = await generateBatch(b.start, b.end, b.focus);
    if (dishes.length > 0) {
      all = [...all, ...dishes];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2), 'utf-8');
      console.log(`Saved: ${all.length} dishes total`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`Done! Total: ${all.length} dishes`);
}

main();
