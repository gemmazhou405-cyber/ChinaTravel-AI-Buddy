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
  { id: 'wechat-pay-foreigners', title: 'How to Set Up WeChat Pay as a Foreign Tourist in China' },
  { id: 'taxi-china-no-chinese', title: 'How to Take a Taxi in China Without Speaking Chinese' },
  { id: 'china-emergency-numbers', title: 'Emergency Numbers Every Tourist Must Know in China' },
  { id: 'lost-passport-china', title: 'What to Do If You Lose Your Passport in China' },
  { id: 'china-hospital-tourist', title: 'How to Go to a Hospital in China as a Foreign Tourist' },
  { id: 'china-metro-guide', title: 'Complete Metro Guide for Foreign Tourists in China' },
  { id: 'china-vpn-alternatives', title: 'How to Access Apps and Services in China Without a VPN' },
  { id: 'china-sim-card', title: 'Best SIM Cards and Mobile Data Options for Tourists in China' },
  { id: 'order-food-china', title: 'How to Order Food in China Without Speaking Chinese' },
  { id: 'china-hotel-checkin', title: 'How to Check Into a Hotel in China as a Foreign Tourist' },
  { id: 'didi-guide-foreigners', title: 'How to Use Didi as a Foreign Tourist' },
  { id: 'china-scams-avoid', title: 'Common Tourist Scams in China and How to Avoid Them' },
  { id: 'china-cash-vs-mobile', title: 'Cash vs Mobile Payment in China' },
  { id: 'shanghai-tourist-tips', title: 'Shanghai Travel Tips for Foreign Visitors' },
  { id: 'beijing-tourist-tips', title: 'Beijing Travel Tips for Foreign Tourists' },
  { id: 'chengdu-tourist-tips', title: 'Chengdu Travel Guide for Foreign Visitors' },
  { id: 'china-internet-guide', title: 'Internet Access Guide for Foreign Tourists in China' },
  { id: 'china-tipping-culture', title: 'Tipping Culture in China' },
  { id: 'china-shopping-guide', title: 'Shopping in China: Tips for Tourists' },
  { id: 'china-airport-guide', title: 'China Airport Guide for Tourists' },
  { id: 'china-cultural-tips', title: 'Cultural Tips for Foreign Tourists in China' },
  { id: 'china-solo-travel', title: 'Solo Travel in China: Safety Tips' },
];

function buildPrompt(article) {
  return `Write a short travel guide for tourists in China.
Title: "${article.title}"
Output ONLY valid JSON, no markdown, no backticks.
{"id":"${article.id}","title":"${article.title}","metaDescription":"SEO description max 120 chars","slug":"${article.id}","readingTimeMinutes":2,"sections":[{"heading":"h1","content":"60 words max"},{"heading":"h2","content":"60 words max"},{"heading":"h3","content":"60 words max"}],"keyTakeaways":["tip1","tip2","tip3"],"relatedPhrases":["phrase1","phrase2"],"tags":["tag1","tag2"]}
Rules: practical advice only, no political content, no visa advice, tourist-focused, friendly tone.`;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 800 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];
  for (const article of FAILED) {
    console.log(`\nGenerating: ${article.id}`);
    let success = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`  Attempt ${attempt}/5...`);
        const raw = await callAPI(buildPrompt(article));
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleaned);
        if (!data.sections || !Array.isArray(data.sections)) throw new Error('Invalid sections');
        fs.writeFileSync(path.join(OUTPUT_DIR, `${article.id}.json`), JSON.stringify(data, null, 2));
        console.log(`  Saved: ${article.id}.json`);
        success = true;
        break;
      } catch(e) {
        console.error(`  Failed: ${e.message}`);
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
