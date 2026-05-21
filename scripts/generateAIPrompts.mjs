import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/aiPrompts');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const SCENARIOS = [
  { id: 'menu', name: 'Menu Explanation', description: 'User uploads or describes a Chinese menu item' },
  { id: 'taxi', name: 'Taxi Help', description: 'User needs help communicating with a taxi driver' },
  { id: 'hospital', name: 'Hospital Help', description: 'User needs medical assistance or is at a hospital' },
  { id: 'payment', name: 'Payment Help', description: 'User has payment issues with Alipay/WeChat/card' },
  { id: 'hotel', name: 'Hotel Help', description: 'User needs help at hotel check-in or with room issues' },
  { id: 'police', name: 'Police/Emergency', description: 'User needs to report something or get emergency help' },
  { id: 'shopping', name: 'Shopping Help', description: 'User needs help at a market or store' },
  { id: 'lostItems', name: 'Lost Items', description: 'User has lost passport, phone, wallet or other items' },
];

const TEST_MODE = process.argv[2] !== '--all';
const scenariosToRun = TEST_MODE ? [SCENARIOS[0]] : SCENARIOS;

function buildPrompt(scenario) {
  return `You are helping design an AI travel assistant called "Buddy" for ChinaEase Buddy app.
Buddy helps foreign tourists in China communicate and solve problems without speaking Chinese.

Generate a complete response template for this scenario: "${scenario.name}"
Scenario description: ${scenario.description}

Output ONLY a valid JSON object, no explanation, no markdown.

Schema:
{
  "scenarioId": "${scenario.id}",
  "scenarioName": "${scenario.name}",
  "systemPrompt": "The system prompt to give Buddy AI for this scenario (max 200 words)",
  "responseFormat": {
    "maxBullets": 5,
    "includeChinesePhrase": true,
    "includePinyin": true,
    "includeEnglishExplanation": true,
    "maxWordsPerBullet": 20
  },
  "exampleUserInputs": ["example1", "example2", "example3"],
  "exampleResponses": [
    {
      "userInput": "example question",
      "buddyResponse": "example short response with Chinese phrase"
    }
  ],
  "safetyBoundaries": ["boundary1", "boundary2"],
  "escalationTriggers": ["trigger1", "trigger2"],
  "keyPhrases": [
    {
      "english": "phrase in english",
      "chinese": "中文短语",
      "pinyin": "pīnyīn",
      "useWhen": "when to use this phrase"
    }
  ]
}

Rules for systemPrompt:
- Buddy answers in 3-5 short bullets maximum
- Always give the Chinese phrase the user can show to locals first
- Then give English explanation
- For medical/legal: always say "Please seek professional help" and give emergency numbers
- Keep responses under 150 words total
- Focus on practical immediate help
- No long background explanations`;
}

function validate(data, scenarioId) {
  const errors = [];
  const required = ['scenarioId','scenarioName','systemPrompt','responseFormat','exampleUserInputs','exampleResponses','safetyBoundaries','keyPhrases'];
  required.forEach(f => { if (!data[f]) errors.push(`Missing: ${f}`); });
  if (data.scenarioId !== scenarioId) errors.push(`scenarioId should be ${scenarioId}`);
  return errors;
}

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 3000 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateScenario(scenario) {
  console.log(`\nGenerating: ${scenario.name}`);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${MAX_RETRIES}...`);
      const raw = await callAPI(buildPrompt(scenario));
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      const errors = validate(data, scenario.id);
      if (errors.length > 0) {
        console.log(`  Validation errors:`, errors);
        if (attempt < MAX_RETRIES) continue;
        throw new Error('Validation failed');
      }
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, `${scenario.id}.json`), JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  Saved: src/data/aiPrompts/${scenario.id}.json`);
      return true;
    } catch(e) {
      console.error(`  Attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: menu only' : 'FULL MODE: all 8 scenarios');
  const results = [];
  for (const scenario of scenariosToRun) {
    const success = await generateScenario(scenario);
    results.push({ name: scenario.name, success });
    if (scenariosToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(({ name, success }) => console.log(`  ${success ? 'OK' : 'FAIL'} ${name}`));
}

main();
