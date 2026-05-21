import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/seoArticles');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const ARTICLES = [
  { id: 'alipay-foreigners', title: 'How to Use Alipay in China as a Foreigner (2026 Guide)' },
  { id: 'wechat-pay-foreigners', title: 'How to Set Up WeChat Pay as a Foreign Tourist in China' },
  { id: 'taxi-china-no-chinese', title: 'How to Take a Taxi in China Without Speaking Chinese' },
  { id: 'china-emergency-numbers', title: 'Emergency Numbers Every Tourist Must Know in China' },
  { id: 'china-food-allergies', title: 'How to Handle Food Allergies in China as a Tourist' },
  { id: 'lost-passport-china', title: 'What to Do If You Lose Your Passport in China' },
  { id: 'china-hospital-tourist', title: 'How to Go to a Hospital in China as a Foreign Tourist' },
  { id: 'china-metro-guide', title: 'Complete Metro Guide for Foreign Tourists in China' },
  { id: 'china-vpn-alternatives', title: 'How to Access Apps and Services in China Without a VPN' },
  { id: 'china-sim-card', title: 'Best SIM Cards and Mobile Data Options for Tourists in China' },
  { id: 'order-food-china', title: 'How to Order Food in China Without Speaking Chinese' },
  { id: 'china-hotel-checkin', title: 'How to Check Into a Hotel in China as a Foreign Tourist' },
  { id: 'didi-guide-foreigners', title: 'How to Use Didi (Chinese Uber) as a Foreign Tourist' },
  { id: 'china-scams-avoid', title: 'Common Tourist Scams in China and How to Avoid Them' },
  { id: 'china-cash-vs-mobile', title: 'Cash vs Mobile Payment in China: What Tourists Need to Know' },
  { id: 'shanghai-tourist-tips', title: 'Shanghai Travel Tips for First-Time Foreign Visitors' },
  { id: 'beijing-tourist-tips', title: 'Beijing Travel Tips for Foreign Tourists' },
  { id: 'chengdu-tourist-tips', title: 'Chengdu Travel Guide for Foreign Visitors' },
  { id: 'china-train-guide', title: 'How to Take High-Speed Train in China as a Tourist' },
  { id: 'china-language-barrier', title: 'How to Overcome the Language Barrier in China' },
  { id: 'china-vegetarian-guide', title: 'Vegetarian and Vegan Guide for Tourists in China' },
  { id: 'china-internet-guide', title: 'Internet Access Guide for Foreign Tourists in China' },
  { id: 'china-tipping-culture', title: 'Tipping Culture in China: What Tourists Need to Know' },
  { id: 'china-shopping-guide', title: 'Shopping in China: Markets, Bargaining and Payment Tips' },
  { id: 'china-airport-guide', title: 'China Airport Guide: Arrival, Customs and Getting to City' },
  { id: 'china-police-tourist', title: 'How to Contact Police or Get Help in China as a Tourist' },
  { id: 'china-medicine-pharmacy', title: 'How to Find Medicine and Pharmacy in China as a Tourist' },
  { id: 'china-cultural-tips', title: 'Cultural Tips and Etiquette for Foreign Tourists in China' },
  { id: 'china-solo-travel', title: 'Solo Travel in China: Safety Tips for Foreign Tourists' },
  { id: 'china-family-travel', title: 'Family Travel in China: Tips for Tourists with Children' },
];

const TEST_MODE = process.argv[2] !== '--all';
const articlesToRun = TEST_MODE ? [ARTICLES[0]] : ARTICLES;

function buildPrompt(article) {
  return `Write a practical SEO-optimized travel article for foreign tourists visiting China.

Title: "${article.title}"

Output ONLY a valid JSON object, no explanation, no markdown backticks.

Schema:
{
  "id": "${article.id}",
  "title": "${article.title}",
  "metaDescription": "150 chars max SEO meta description",
  "slug": "${article.id}",
  "readingTimeMinutes": 2,
  "sections": [
    {
      "heading": "section heading",
      "content": "2-3 practical paragraphs, max 80 words total per section"
    }
  ],
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3", "takeaway4", "takeaway5"],
  "relatedPhrases": ["useful Chinese phrase 1", "useful Chinese phrase 2", "useful Chinese phrase 3"],
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- 4-6 sections total
- Each section max 150 words
- Practical, actionable advice only
- No political content
- No visa advice
- No outdated information (write as if 2026)
- Target audience: first-time foreign tourists in China
- Tone: friendly, helpful, reassuring
- Include practical Chinese phrases where relevant
- Safety disclaimer where appropriate (medical/legal topics)`;
}

function validate(data, id) {
  const errors = [];
  const required = ['id','title','metaDescription','sections','keyTakeaways','tags'];
  required.forEach(f => { if (!data[f]) errors.push(`Missing: ${f}`); });
  if (!Array.isArray(data.sections) || data.sections.length < 3) errors.push('Need at least 3 sections');
  return errors;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.4, max_tokens: 1500 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateArticle(article) {
  console.log(`\nGenerating: ${article.title}`);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(article));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      const errors = validate(data, article.id);
      if (errors.length > 0) {
        console.log(`  Validation errors:`, errors);
        if (attempt < MAX_RETRIES) continue;
        throw new Error('Validation failed');
      }
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, `${article.id}.json`), JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  Saved: ${article.id}.json`);
      return true;
    } catch(e) {
      console.error(`  Attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: 1 article' : `FULL MODE: ${ARTICLES.length} articles`);
  const results = [];
  for (const article of articlesToRun) {
    const success = await generateArticle(article);
    results.push({ id: article.id, success });
    if (articlesToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(({ id, success }) => console.log(`  ${success ? 'OK' : 'FAIL'} ${id}`));
}

main();
