import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_DIR = path.join(__dirname, '../src/data/emergencyKit');
const OUTPUT_DIR = path.join(__dirname, '../src/data/emergencyKitMultilingual');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const KITS = ['medicalCards','allergyCards','emergencyNumbers','lostDocuments','embassyContacts','hospitalPhrases'];

const TEST_MODE = process.argv[2] !== '--all';

async function callAPI(prompt) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 2500 }),
  });
  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function translateKit(kitId, lang) {
  const outputFile = path.join(OUTPUT_DIR, lang.code, kitId + '.json');
  if (fs.existsSync(outputFile)) {
    console.log('  Skipping ' + lang.code + '/' + kitId + ' - exists');
    return true;
  }

  const inputFile = path.join(INPUT_DIR, kitId + '.json');
  if (!fs.existsSync(inputFile)) return false;

  const kitData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const prompt = 'Translate ALL English text in this JSON into ' + lang.name + '. Keep Chinese text, pinyin, phone numbers, addresses, and id fields unchanged. Output ONLY valid JSON, no markdown.\n' + JSON.stringify(kitData);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  ' + lang.code + '/' + kitId + ' attempt ' + attempt + '...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      const langDir = path.join(OUTPUT_DIR, lang.code);
      if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log('  Saved: ' + lang.code + '/' + kitId + '.json');
      return true;
    } catch(e) {
      console.error('  Failed: ' + e.message);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const langsToRun = TEST_MODE ? [LANGUAGES[0]] : LANGUAGES;
  const kitsToRun = TEST_MODE ? [KITS[0]] : KITS;
  console.log(TEST_MODE ? 'TEST MODE: French + medicalCards' : 'FULL MODE: 5 languages x 6 kits');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let ok = 0, fail = 0;
  for (const lang of langsToRun) {
    console.log('\nLanguage: ' + lang.name);
    for (const kit of kitsToRun) {
      const success = await translateKit(kit, lang);
      success ? ok++ : fail++;
      await new Promise(r => setTimeout(r, 800));
    }
  }
  console.log('\nDone! OK: ' + ok + ', Failed: ' + fail);
}

main();
