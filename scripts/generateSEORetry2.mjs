import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/seoArticles');

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const FAILED = [
  { id: 'wechat-pay-foreigners', title: 'WeChat Pay for Tourists' },
  { id: 'taxi-china-no-chinese', title: 'Taxi in China Without Chinese' },
  { id: 'order-food-china', title: 'Order Food in China' },
  { id: 'china-hotel-checkin', title: 'Hotel Check-in in China' },
  { id: 'china-cash-vs-mobile', title: 'Cash vs Mobile Payment China' },
  { id: 'shanghai-tourist-tips', title: 'Shanghai Tips for Tourists' },
  { id: 'china-internet-guide', title: 'Internet in China for Tourists' },
  { id: 'china-shopping-guide', title: 'Shopping in China Tips' },
  { id: 'china-cultural-tips', title: 'Cultural Tips China Tourists' },
];

function buildPrompt(article) {
  return `Write a very short travel tip article for tourists in China.
Title: "${article.title}"
Output ONLY this JSON structure with no other text:
{"id":"${article.id}","title":"${article.title}","metaDescription":"helpful guide for tourists","slug":"${article.id}","readingTimeMinutes":2,"sections":[{"heading":"Getting Started","content":"Practical tip 1. Practical tip 2. Practical tip 3."},{"heading":"Key Tips","content":"Tip A. Tip B. Tip C."},{"heading":"What to Remember","content":"Remember 1. Remember 2. Remember 3."}],"keyTakeaways":["tip1","tip2","tip3"],"relatedPhrases":["phrase1","phrase2"],"tags":["china","travel","tourist"]}`;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 600 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];
  for (const article of FAILED) {
    console.log(`Generating: ${article.id}`);
    let success = false;
    for (let attempt = 1; attempt <= 8; attempt++) {
      try {
        const raw = await callAPI(buildPrompt(article));
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleaned);
        if (!data.sections) throw new Error('No sections');
        fs.writeFileSync(path.join(OUTPUT_DIR, `${article.id}.json`), JSON.stringify(data, null, 2));
        console.log(`  OK: ${article.id}`);
        success = true;
        break;
      } catch(e) {
        console.error(`  Attempt ${attempt} failed: ${e.message}`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    results.push({ id: article.id, success });
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\nSummary:');
  results.forEach(({ id, success }) => console.log(`  ${success ? 'OK' : 'FAIL'} ${id}`));
}

main();
