import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.XIAOMI_API_KEY;
const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const OUTPUT_DIR = path.join(__dirname, '../src/data/beforeYouGo');
const MAX_RETRIES = 3;

if (!API_KEY) { console.error('XIAOMI_API_KEY not set.'); process.exit(1); }

const CHECKLISTS = [
  { id: 'documents', name: 'Documents & Visa' },
  { id: 'payments', name: 'Payment Setup' },
  { id: 'apps', name: 'Essential Apps' },
  { id: 'health', name: 'Health & Medicine' },
  { id: 'connectivity', name: 'Phone & Internet' },
  { id: 'packing', name: 'Smart Packing' },
];

const TEST_MODE = process.argv[2] !== '--all';
const listsToRun = CHECKLISTS.filter(l => l.id === "health");

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
  documents: 'Generate a pre-travel documents checklist for tourists visiting China. Output ONLY valid JSON object, no markdown.\n{"id":"documents","title":"Documents & Visa Checklist","description":"Complete before booking flights","items":[{"id":"doc_001","task":"Check passport validity (6 months minimum)","detail":"China requires passport valid for at least 6 months beyond your stay","priority":"critical","category":"passport","canDoOnline":false,"timeNeeded":"Check now"},{"id":"doc_002","task":"Apply for China visa","detail":"Most nationalities need a visa. Apply 4-8 weeks before travel","priority":"critical","category":"visa","canDoOnline":true,"timeNeeded":"4-8 weeks before"}]}\nGenerate 15 items covering: passport, visa, travel insurance, emergency contacts, copies of documents, entry requirements, customs rules.',

  payments: 'Generate a payment setup checklist for tourists visiting China. Output ONLY valid JSON object, no markdown.\n{"id":"payments","title":"Payment Setup Checklist","description":"Set up before you arrive in China","items":[{"id":"pay_001","task":"Set up Alipay International","detail":"Download Alipay, link foreign credit card, verify identity","priority":"critical","category":"mobile-payment","canDoOnline":true,"timeNeeded":"1-2 hours","link":"alipay.com"}]}\nGenerate 12 items: Alipay setup, WeChat Pay, notify bank, get local currency, backup cards, digital wallet, UnionPay card.',

  apps: 'Generate essential apps checklist for tourists visiting China. Output ONLY valid JSON object, no markdown.\n{"id":"apps","title":"Essential Apps Checklist","description":"Download before arriving in China","items":[{"id":"app_001","app":"Didi","task":"Download and set up Didi (Chinese Uber)","detail":"Main ride-hailing app in China. Works with foreign cards","priority":"high","category":"transport","downloadBefore":true,"availableInChina":true,"platform":["iOS","Android"]}]}\nGenerate 15 apps: Didi, Alipay, WeChat, Maps (Baidu/Amap), translation apps, ChinaEase Buddy, VPN (before entering), railway booking, hotel apps, food delivery.',

  health: 'Generate health preparation checklist for tourists visiting China. Output ONLY valid JSON object, no markdown.\n{"id":"health","title":"Health & Medicine Checklist","description":"Prepare your health essentials","items":[{"id":"health_001","task":"Check vaccination requirements","detail":"No mandatory vaccines for China but recommended: Hepatitis A, Typhoid","priority":"high","category":"vaccination","timeNeeded":"4-6 weeks before","seeDoctor":true}]}\nGenerate 12 items: vaccinations, travel insurance with medical, prescription medications, basic first aid, allergy cards, blood type card, medical history document, emergency contacts.',

  connectivity: 'Generate phone and internet checklist for tourists visiting China. Output ONLY valid JSON object, no markdown.\n{"id":"connectivity","title":"Phone & Internet Checklist","description":"Stay connected in China","items":[{"id":"conn_001","task":"Get China SIM card or international plan","detail":"Buy at airport or order online. Local SIM gives best rates","priority":"high","category":"sim","canDoOnline":true,"timeNeeded":"Before or on arrival"}]}\nGenerate 10 items: SIM card, VPN setup, download offline maps, WeChat account, emergency numbers saved, portable charger, adapter plug, cloud backup.',

  packing: 'Generate smart packing checklist for tourists visiting China. Output ONLY valid JSON object, no markdown.\n{"id":"packing","title":"Smart Packing Checklist","description":"China-specific packing tips","items":[{"id":"pack_001","task":"Pack power adapter (Type A/I)","detail":"China uses Type A (same as US) and Type I plugs. Most hotels have universal sockets","priority":"medium","category":"electronics","chinaSpecific":true}]}\nGenerate 15 items: adapter, portable WiFi, offline downloads, cash, small backpack, comfortable walking shoes, face mask, tissues (many places no toilet paper), umbrella, translation card with hotel address.',
};

async function generateChecklist(list) {
  console.log('\nGenerating: ' + list.name);
  const prompt = PROMPTS[list.id];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('  Attempt ' + attempt + '/' + MAX_RETRIES + '...');
      const raw = await callAPI(prompt);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      if (!data.id) throw new Error('Missing id');
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUTPUT_DIR, list.id + '.json'), JSON.stringify(data, null, 2));
      console.log('  Saved: ' + list.id + '.json');
      return true;
    } catch(e) {
      console.error('  Attempt ' + attempt + ' failed: ' + e.message);
      if (attempt === MAX_RETRIES) return false;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(TEST_MODE ? 'TEST MODE: documents only' : 'FULL MODE: all 6 checklists');
  const results = [];
  for (const list of listsToRun) {
    const success = await generateChecklist(list);
    results.push({ id: list.id, success });
    if (listsToRun.length > 1) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nSummary:');
  results.forEach(function(r) { console.log('  ' + (r.success ? 'OK' : 'FAIL') + ' ' + r.id); });
}

main();
