import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_DIR = path.join(__dirname, '../src/data/phraseCards');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const SCENES = [
  { id: 'airport', description: 'Airport arrival, customs, immigration, luggage' },
  { id: 'train', description: 'Train stations, tickets, platforms, high-speed rail' },
  { id: 'hotel', description: 'Hotel check-in, room requests, facilities, checkout' },
  { id: 'payment', description: 'WeChat Pay, Alipay, card payment, cash, receipts' },
  { id: 'shopping', description: 'Markets, stores, bargaining, returns, sizes' },
  { id: 'lostItems', description: 'Lost passport, phone, wallet, bags, police' },
  { id: 'restaurant', description: 'Ordering food, allergies, bill, dietary restrictions' },
  { id: 'emergency', description: 'Calling for help, accidents, fire, medical urgency' },
];

const TEST_MODE = process.argv[2] !== '--all';
const scenesToRun = SCENES.filter(s => s.id === 'lostItems');

async function callAPI(messages) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: messages, temperature: 0.4, max_tokens: 4000 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function expandScene(scene) {
  const inputFile = path.join(INPUT_DIR, scene.id + '.json');
  if (!fs.existsSync(inputFile)) return false;
  const existing = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const start = existing.length + 1;
  console.log('\nExpanding: ' + scene.id + ' (' + existing.length + ' to 50 cards)');

  const startId = scene.id + '_' + String(start).padStart(3, '0');
  const endId = scene.id + '_' + String(start + 19).padStart(3, '0');
  
  const prompt = 'Generate exactly 20 NEW travel phrase cards for scene: "' + scene.id + '" (' + scene.description + ').\n' +
    'Number from ' + startId + ' to ' + endId + '.\n' +
    'Focus on specific, less common but useful situations.\n' +
    'Output ONLY valid JSON array, no markdown, no backticks.\n' +
    'Each item must have these fields: id, scene, priority, english, chinese, pinyin, usageNote, showToLocal, emergencyRelevant, audioText, tags.\n' +
    'Rules: audioText must equal chinese exactly, pinyin with tone marks, short sentences, no medical or legal advice.';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI([{ role: 'user', content: prompt }]);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const newCards = JSON.parse(cleaned);
      if (!Array.isArray(newCards) || newCards.length < 15) throw new Error('Got ' + newCards.length + ' cards');
      const merged = [...existing, ...newCards];
      fs.writeFileSync(inputFile, JSON.stringify(merged, null, 2));
      console.log('  Saved: ' + scene.id + '.json (' + merged.length + ' cards)');
      return true;
    } catch(e) {
      console.error('  Attempt ' + attempt + ' failed: ' + e.message);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: airport only' : 'FULL MODE: all 8 scenes');
  const results = [];
  for (const scene of scenesToRun) {
    const success = await expandScene(scene);
    results.push({ scene: scene.id, success });
    if (scenesToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(function(r) { console.log('  ' + (r.success ? 'OK' : 'FAIL') + ' ' + r.scene); });
}

main();
