import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const INPUT_DIR = path.join(__dirname, '../src/data/phraseCards');
const OUTPUT_DIR = path.join(__dirname, '../src/data/phraseCardsMultilingual');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const LANGUAGES = [
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

const SCENES = ['airport','train','hotel','payment','shopping','lostItems','restaurant','emergency'];

const TEST_MODE = process.argv[2] !== '--all';

async function callAPI(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 4000 }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

function buildPrompt(cards, lang) {
  const sample = cards.slice(0, 10).map(c => ({
    id: c.id,
    english: c.english,
    chinese: c.chinese,
    pinyin: c.pinyin,
  }));

  return `Translate these travel phrase cards for a China travel app.
Target language: ${lang.name} (${lang.nativeName})

For each card, translate the "english" field into ${lang.name}.
Keep "chinese" and "pinyin" exactly the same.
Add a "${lang.code}Translation" field with the translation.

Input cards:
${JSON.stringify(sample, null, 2)}

Output ONLY a valid JSON array with same structure plus the translation field.
Example output item:
{"id":"airport_001","english":"Where is the exit?","chinese":"出口在哪里？","pinyin":"Chūkǒu zài nǎlǐ?","${lang.code}Translation":"Où est la sortie?"}

Rules:
- Natural, polite translation
- Suitable for tourists showing to locals or reading themselves
- Keep all original fields
- Only add the ${lang.code}Translation field`;
}

async function translateScene(scene, lang) {
  const inputFile = path.join(INPUT_DIR, `${scene}.json`);
  if (!fs.existsSync(inputFile)) {
    console.log(`  Skipping ${scene} - file not found`);
    return null;
  }

  const cards = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const translated = [];

  // 每次翻译10张，分批处理
  for (let i = 0; i < cards.length; i += 10) {
    const batch = cards.slice(i, i + 10);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const prompt = buildPrompt(batch, lang);
        const raw = await callAPI(prompt);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(cleaned);
        if (!Array.isArray(result)) throw new Error('Not array');
        translated.push(...result);
        break;
      } catch(e) {
        console.error(`    Batch ${i}-${i+10} attempt ${attempt} failed: ${e.message}`);
        if (attempt === MAX_RETRIES) {
          // 失败时保留原卡片
          translated.push(...batch.map(c => ({ ...c, [`${lang.code}Translation`]: c.english })));
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  return translated;
}

async function main() {
  const scenesToRun = TEST_MODE ? ['airport'] : SCENES;
  const langsToRun = TEST_MODE ? [LANGUAGES[0]] : LANGUAGES;

  console.log(TEST_MODE ? 'TEST MODE: airport + French only' : `FULL MODE: ${SCENES.length} scenes x ${LANGUAGES.length} languages`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const lang of langsToRun) {
    console.log(`\nLanguage: ${lang.name}`);
    const langDir = path.join(OUTPUT_DIR, lang.code);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

    for (const scene of scenesToRun) {
      console.log(`  Scene: ${scene}`);
      const result = await translateScene(scene, lang);
      if (result) {
        fs.writeFileSync(path.join(langDir, `${scene}.json`), JSON.stringify(result, null, 2));
        console.log(`  Saved: ${lang.code}/${scene}.json (${result.length} cards)`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\nDone!');
}

main();
