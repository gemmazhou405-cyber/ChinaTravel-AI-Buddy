import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/cultureGuides');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const GUIDES = [
  { id: 'etiquette', name: 'Chinese Etiquette & Culture' },
  { id: 'dining', name: 'Dining Culture & Table Manners' },
  { id: 'transport', name: 'Transport Etiquette' },
  { id: 'shopping', name: 'Shopping Culture & Bargaining' },
  { id: 'socialNorms', name: 'Social Norms & Taboos' },
  { id: 'religion', name: 'Religious Sites & Temples' },
];

const TEST_MODE = process.argv[2] !== '--all';
const guidesToRun = GUIDES.filter(g => ["socialNorms","religion"].includes(g.id));

async function callAPI(prompt) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 2000 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

const PROMPTS = {
  etiquette: 'Generate a Chinese etiquette guide for foreign tourists. Output ONLY valid JSON object, no markdown.\n{"id":"etiquette","title":"Chinese Etiquette & Culture","tips":[{"id":"etq_001","category":"greetings","tip":"Nod or bow slightly when greeting","detail":"Handshakes are common in cities. Avoid hugging strangers","do":true},{"id":"etq_002","category":"gifts","tip":"Never give clocks as gifts","detail":"Clocks symbolize death in Chinese culture","do":false}]}\nGenerate 20 tips covering: greetings, gifts, shoes, chopsticks, photos, pointing, numbers, colors, business cards, queuing, noise levels, public behavior.',

  dining: 'Generate a dining etiquette guide for foreign tourists in China. Output ONLY valid JSON object, no markdown.\n{"id":"dining","title":"Dining Culture & Table Manners","tips":[{"id":"din_001","category":"ordering","tip":"Dishes are shared family style","detail":"Order multiple dishes for the table, not individual meals","do":true}]}\nGenerate 18 tips: shared dishes, chopstick etiquette, pouring tea, toasting, paying bill, tipping, loud eating, bones on table, trying everything offered, round tables, lazy Susan, host duties.',

  transport: 'Generate transport etiquette guide for tourists in China. Output ONLY valid JSON object, no markdown.\n{"id":"transport","title":"Transport Etiquette in China","tips":[{"id":"trans_001","category":"metro","tip":"Let passengers exit before boarding","detail":"Stand aside from doors and wait for people to exit first","do":true}]}\nGenerate 15 tips: metro rules, priority seating, luggage, eating on transit, phone calls, queue jumping, taxi etiquette, honking, seatbelts, Didi tips.',

  shopping: 'Generate shopping culture guide for tourists in China. Output ONLY valid JSON object, no markdown.\n{"id":"shopping","title":"Shopping Culture & Bargaining Tips","tips":[{"id":"shop_001","category":"bargaining","tip":"Bargaining is expected at markets","detail":"Start at 30-40% of asking price at street markets and tourist areas","do":true}]}\nGenerate 15 tips: when to bargain, fixed price stores, quality checking, receipts, returns, fake goods, WeChat payment, group buying, night markets, duty free.',

  socialNorms: 'Generate social norms guide for tourists in China. Output ONLY valid JSON object, no markdown.\n{"id":"socialNorms","title":"Social Norms & Cultural Taboos","tips":[{"id":"soc_001","category":"taboo","tip":"Avoid discussing Taiwan, Tibet, Tiananmen","detail":"These are sensitive political topics. Stay neutral or change subject","do":false}]}\nGenerate 15 tips: political topics, face concept, age questions, money questions, complimenting children, superstitions, lucky numbers, unlucky numbers, photos of strangers, personal space, queuing.',

  religion: 'Generate religious sites etiquette guide for tourists in China. Output ONLY valid JSON object, no markdown.\n{"id":"religion","title":"Religious Sites & Temple Etiquette","tips":[{"id":"rel_001","category":"dress","tip":"Cover shoulders and knees at temples","detail":"Bring a scarf or light jacket to cover up at Buddhist and Taoist temples","do":true}]}\nGenerate 15 tips: dress code, shoes removal, photography, offerings, incense, bowing, monks and nuns, sacred items, entrance fees, quiet behavior, prayer areas.',
};

async function generateGuide(guide) {
  console.log('\nGenerating: ' + guide.name);
  const prompt = PROMPTS[guide.id];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      if (!data.id) throw new Error('Missing id');
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, guide.id + '.json'), JSON.stringify(data, null, 2));
      console.log('  Saved: ' + guide.id + '.json');
      return true;
    } catch(e) {
      console.error('  Attempt ' + attempt + ' failed: ' + e.message);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: etiquette only' : 'FULL MODE: all 6 guides');
  const results = [];
  for (const guide of guidesToRun) {
    const success = await generateGuide(guide);
    results.push({ id: guide.id, success });
    if (guidesToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(function(r) { console.log('  ' + (r.success ? 'OK' : 'FAIL') + ' ' + r.id); });
}

main();
