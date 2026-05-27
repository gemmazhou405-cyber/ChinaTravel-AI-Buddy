import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/emergencyKit');
const MAX_RETRIES = 4;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const KITS = [
  {
    id: 'medicalCards',
    prompt: 'Generate 15 medical emergency phrase cards for tourists in China. Output ONLY valid JSON array. Each item: {"id":"med_001","english":"...","chinese":"...","pinyin":"...","priority":"high","showToDoctor":true}. Cover: call ambulance, describe pain, allergies, medications, blood type, unconscious, heart attack, difficulty breathing. No diagnosis.'
  },
  {
    id: 'allergyCards',
    prompt: 'Generate 12 allergy alert cards for tourists in China. Output ONLY valid JSON array. Each item: {"id":"allergy_001","allergen":"Peanut","english":"I am allergic to peanuts","chinese":"...","pinyin":"...","severity":"severe","showToRestaurant":true}. Cover: peanuts, shellfish, gluten, dairy, eggs, soy, sesame, fish, MSG, vegetarian, vegan, halal.'
  },
  {
    id: 'emergencyNumbers',
    prompt: 'Generate China emergency numbers guide. Output ONLY valid JSON object: {"id":"emergencyNumbers","national":[{"service":"Police","number":"110","chinese":"警察","notes":"..."}],"cityHotlines":[{"city":"Shanghai","number":"962020","notes":"English speaking"}]}. Include national: police 110, ambulance 120, fire 119, tourist hotline 12301. City hotlines for Shanghai, Beijing, Guangzhou, Shenzhen, Chengdu.'
  },
  {
    id: 'lostDocuments',
    prompt: 'Generate lost documents guide for tourists in China. Output ONLY valid JSON object: {"id":"lostDocuments","items":[{"type":"Passport","steps":["..."],"phrases":[{"english":"...","chinese":"...","pinyin":"..."}]}]}. Cover: passport, credit cards, phone, flight tickets. 3-4 steps and 2-3 phrases each.'
  },
  {
    id: 'embassyContacts',
    prompt: 'Generate embassy contacts in Beijing China for tourists. Output ONLY valid JSON object: {"id":"embassyContacts","disclaimer":"Verify before travel","embassies":[{"country":"United States","phone":"+86-10-8531-3000","emergency":"+86-10-8531-4000","address":"..."}]}. Include 15 countries: US, UK, Canada, Australia, France, Germany, Spain, Italy, Japan, South Korea, India, Brazil, Netherlands, Sweden, New Zealand.'
  },
  {
    id: 'hospitalPhrases',
    prompt: 'Generate 20 hospital phrases for tourists in China. Output ONLY valid JSON array. Each item: {"id":"hosp_001","section":"Reception","english":"...","chinese":"...","pinyin":"...","showToStaff":true}. Sections: Reception, Symptoms, Treatment, Payment, Prescription. No medical advice, only communication phrases.'
  },
];

const TEST_MODE = process.argv[2] !== '--all';
const kitsToRun = TEST_MODE ? [KITS[0]] : KITS;

async function callAPI(prompt) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 2000 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateKit(kit) {
  console.log('\nGenerating: ' + kit.id);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI(kit.prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, kit.id + '.json'), JSON.stringify(data, null, 2));
      console.log('  Saved: ' + kit.id + '.json');
      return true;
    } catch(e) {
      console.error('  Attempt ' + attempt + ' failed: ' + e.message);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: medicalCards only' : 'FULL MODE: all 6 kits');
  const results = [];
  for (const kit of kitsToRun) {
    const success = await generateKit(kit);
    results.push({ id: kit.id, success });
    if (kitsToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(function(r) { console.log('  ' + (r.success ? 'OK' : 'FAIL') + ' ' + r.id); });
}

main();
