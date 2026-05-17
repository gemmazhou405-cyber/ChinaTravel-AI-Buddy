import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/phraseCards');
const MAX_RETRIES = 3;

if (!API_KEY) {
  console.error('XIAOMI_API_KEY not set. Run: export XIAOMI_API_KEY=your_key');
  process.exit(1);
}

const scenes = JSON.parse(fs.readFileSync(path.join(__dirname, 'phraseScenes.json'), 'utf-8'));
const TEST_MODE = process.argv[2] !== '--all';
const scenesToRun = TEST_MODE ? [scenes[0]] : scenes;

function buildPrompt(scene, description) {
  return `You are generating travel phrase cards for a mobile app called ChinaEase Buddy.
Generate exactly 30 phrase cards for the scene: "${scene}"
Scene description: ${description}
Output ONLY a valid JSON array, no explanation, no markdown, no code blocks.
Each item must follow this exact schema:
{"id":"${scene}_001","scene":"${scene}","priority":"high","english":"...","chinese":"...","pinyin":"...","usageNote":"...","showToLocal":true,"emergencyRelevant":false,"audioText":"...","tags":["tag1"]}
Rules:
- id format: ${scene}_001 through ${scene}_030
- chinese must be natural, polite, suitable to show to Chinese locals
- pinyin must match chinese with tone marks
- audioText must equal chinese exactly
- usageNote in English, short sentence
- tags in lowercase English
- No medical diagnosis, no legal advice
- Keep sentences short for mobile display`;
}

function validateCards(cards, scene) {
  const errors = [];
  if (!Array.isArray(cards)) { errors.push('Not an array'); return errors; }
  if (cards.length !== 30) errors.push(`Expected 30 cards, got ${cards.length}`);
  const ids = new Set();
  cards.forEach((card, i) => {
    ['id','scene','priority','english','chinese','pinyin','usageNote','audioText','tags'].forEach(f => {
      if (!card[f] && card[f] !== false) errors.push(`Card ${i+1}: missing "${f}"`);
    });
    if (card.id && ids.has(card.id)) errors.push(`Duplicate id: ${card.id}`);
    if (card.id) ids.add(card.id);
    if (card.scene !== scene) errors.push(`Card ${i+1}: wrong scene`);
    if (card.audioText && card.chinese && card.audioText !== card.chinese) errors.push(`Card ${i+1}: audioText != chinese`);
  });
  return errors;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 8000 }),
  });
  if (!response.ok) { const err = await response.text(); throw new Error(`API error ${response.status}: ${err}`); }
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function generateScene(scene, description) {
  console.log(`\nGenerating: ${scene}`);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(scene, description));
      const cards = parseJSON(raw);
      const errors = validateCards(cards, scene);
      if (errors.length > 0) {
        console.log(`  Validation errors:`, errors);
        if (attempt < MAX_RETRIES) continue;
        throw new Error('Validation failed');
      }
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, `${scene}.json`), JSON.stringify(cards, null, 2), 'utf-8');
      console.log(`  Saved: src/data/phraseCards/${scene}.json (${cards.length} cards)`);
      return true;
    } catch (e) {
      console.error(`  Attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: airport only' : 'FULL MODE: all scenes');
  const results = [];
  for (const { scene, description } of scenesToRun) {
    const success = await generateScene(scene, description);
    results.push({ scene, success });
    if (scenesToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(({ scene, success }) => console.log(`  ${success ? 'OK' : 'FAIL'} ${scene}`));
}

main();
