import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', '.wrangler'].includes(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function failOrPass(name, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`);
  return pass;
}

const srcPublicFiles = walk(join(root, 'src'))
  .concat(['index.html', 'public/llms.txt'].map((file) => join(root, file)));
const publicText = srcPublicFiles.map((file) => read(file)).join('\n');
const chatModal = read(join(root, 'src/components/ChatModal.tsx'));
const buddyFunction = read(join(root, 'functions/api/buddy/chat.js'));
const foodTab = read(join(root, 'src/components/tabs/FoodTab.tsx'));
const rules = read(join(root, 'firestore.rules'));
const indexHtml = read(join(root, 'index.html'));
const llms = read(join(root, 'public/llms.txt'));

const checks = [
  [
    'frontend no longer contains public Coze Worker URL or bot ID',
    !publicText.includes('chinaease-proxy.gemmazhou405.workers.dev') && !publicText.includes('7635204351933497390'),
  ],
  [
    'ChatModal uses authenticated Buddy API route',
    chatModal.includes("fetch('/api/buddy/chat'")
      && chatModal.includes('getIdToken')
      && chatModal.includes('requestId')
      && !chatModal.includes('COZE_WORKER_URL')
      && !chatModal.includes('onIncrementUsed'),
  ],
  [
    'Buddy API verifies Firebase token and email verification',
    buddyFunction.includes('verifyFirebaseRequest')
      && buddyFunction.includes('email_verification_required')
      && buddyFunction.includes('auth.emailVerified'),
  ],
  [
    'Buddy API uses usageRequests idempotency and Firestore transactions',
    buddyFunction.includes('usageRequests/')
      && buddyFunction.includes('beginTransaction')
      && buddyFunction.includes('commitTransaction')
      && buddyFunction.includes('reserved')
      && buddyFunction.includes('rollbackUsage'),
  ],
  [
    'Buddy API sends internal Coze header when secret exists',
    buddyFunction.includes('COZE_WORKER_URL')
      && buddyFunction.includes('COZE_INTERNAL_SECRET')
      && buddyFunction.includes('X-ChinaEase-Internal-Token'),
  ],
  [
    'users client updates are denied and usageRequests are server-write only',
    /match \/users\/\{userId\}[\s\S]*?allow update: if false;/.test(rules)
      && rules.includes('match /usageRequests/{requestId}')
      && rules.includes('allow create, update, delete: if false;'),
  ],
  [
    'Menu mock upload is not publicly available',
    !foodTab.includes('type="file"')
      && !foodTab.includes('acceptMenuFile')
      && !foodTab.includes('menu_scan_first_success')
      && foodTab.includes('privateTestingTitle'),
  ],
  [
    'Pricing and llms do not sell menu/photo scan allowance',
    !indexHtml.match(/menu\/photo scans|scan allowance/i)
      && !llms.match(/menu\/photo scans|scan allowance/i),
  ],
];

let ok = true;
for (const [name, pass, detail] of checks) {
  ok = failOrPass(name, pass, detail) && ok;
}

if (!ok) process.exit(1);
