import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/visaGuides');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const GUIDES = [
  { id: 'us', country: 'United States' },
  { id: 'uk', country: 'United Kingdom' },
  { id: 'ca', country: 'Canada' },
  { id: 'au', country: 'Australia' },
  { id: 'fr', country: 'France' },
  { id: 'de', country: 'Germany' },
  { id: 'es', country: 'Spain' },
  { id: 'it', country: 'Italy' },
  { id: 'jp', country: 'Japan' },
  { id: 'kr', country: 'South Korea' },
];

const TEST_MODE = process.argv[2] !== '--all';
const guidesToRun = GUIDES.filter(g => g.id === "uk");

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

function buildPrompt(guide) {
  return 'Generate a China visa and entry guide for ' + guide.country + ' passport holders. Output ONLY valid JSON object, no markdown.\n' +
    '{"id":"' + guide.id + '","country":"' + guide.country + '","disclaimer":"Information may change. Always verify with official Chinese embassy or consulate before travel.","visaRequired":true,"visaFreeNote":"Check current policy as rules may change","applicationSteps":[{"step":1,"title":"Check current requirements","detail":"Visit the official Chinese embassy website for ' + guide.country + ' for latest requirements"}],"requiredDocuments":["Valid passport (6 months validity)","Completed visa application form","Passport photo","Proof of accommodation","Return flight ticket","Bank statement"],"processingTime":"4-7 business days typical, express available","entryPorts":["Most international airports","Major land borders"],"customsRules":[{"item":"Cash","limit":"$5,000 USD equivalent must be declared"},{"item":"Electronics","limit":"Personal use items generally allowed"}],"arrivalTips":["Fill in arrival card on the plane","Have hotel address ready in Chinese","Keep passport accessible at immigration"],"usefulLinks":[{"title":"Chinese Embassy website","url":"Check your local Chinese embassy website"}]}\n' +
    'Generate realistic content for ' + guide.country + ' travelers. Include 5 application steps, 6 required documents, 4 customs rules, 5 arrival tips. Add disclaimer that rules change and to verify officially. No specific legal advice.';
}

async function generateGuide(guide) {
  console.log('\nGenerating: ' + guide.country);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI(buildPrompt(guide));
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
  console.log(TEST_MODE ? 'TEST MODE: US only' : 'FULL MODE: all 10 countries');
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
