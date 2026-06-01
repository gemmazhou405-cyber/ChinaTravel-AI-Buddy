import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_DIR = path.join(__dirname, '../src/data/cultureGuides');
const OUTPUT_DIR = path.join(__dirname, '../src/data/cultureGuidesMultilingual');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const GUIDES = ['etiquette','dining','transport','shopping','socialNorms','religion'];
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

async function translateGuide(guideId, lang) {
  const outputFile = path.join(OUTPUT_DIR, lang.code, guideId + '.json');
  if (fs.existsSync(outputFile)) {
    console.log('  Skipping ' + lang.code + '/' + guideId + ' - exists');
    return true;
  }
  const inputFile = path.join(INPUT_DIR, guideId + '.json');
  if (!fs.existsSync(inputFile)) return false;
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const prompt = 'Translate ALL English text in this JSON into ' + lang.name + '. Keep id fields unchanged. Output ONLY valid JSON, no markdown.\n' + JSON.stringify(data);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  ' + lang.code + '/' + guideId + ' attempt ' + attempt + '...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      const langDir = path.join(OUTPUT_DIR, lang.code);
      if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log('  Saved: ' + lang.code + '/' + guideId + '.json');
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
  const guidesToRun = TEST_MODE ? [GUIDES[0]] : GUIDES;
  console.log(TEST_MODE ? 'TEST MODE: French + etiquette' : 'FULL MODE: 5 languages x 6 guides');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  let ok = 0, fail = 0;
  for (const lang of langsToRun) {
    console.log('\nLanguage: ' + lang.name);
    for (const guide of guidesToRun) {
      const success = await translateGuide(guide, lang);
      success ? ok++ : fail++;
      await new Promise(r => setTimeout(r, 800));
    }
  }
  console.log('\nDone! OK: ' + ok + ', Failed: ' + fail);
}

main();
