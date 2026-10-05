import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

const compiled = await build({
  entryPoints: ['src/lib/campaignAttribution.ts'],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'esm',
  define: { 'import.meta.env.DEV': 'false' },
});
const source = compiled.outputFiles[0].text;
const attribution = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

class MemoryStorage {
  constructor() { this.values = new Map(); this.writes = 0; }
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  removeItem(key) { this.values.delete(key); }
  setItem(key, value) { this.writes += 1; this.values.set(key, String(value)); }
}

const sessionStorage = new MemoryStorage();
const localStorage = new MemoryStorage();
const location = {
  search: '?partner=hostel-demo&channel=hostel&campaign=first_trip_china&utm_source=partner&utm_medium=referral&utm_campaign=china_partner_landing',
  pathname: '/partners/hostel-china-travel-help/',
};
globalThis.window = { location, sessionStorage, localStorage };

attribution.captureCampaignAttribution('hostel');
const first = attribution.getCampaignAttribution();
if (
  first.firstTouch?.utm_source !== 'partner'
  || first.lastTouch?.channel !== 'hostel'
  || first.partner_id !== 'hostel-demo'
  || first.campaign !== 'first_trip_china'
) throw new Error('Initial channel attribution was not captured');

location.search = '?partner=creator-2&channel=creator&utm_source=youtube&campaign=visa_video';
attribution.captureCampaignAttribution('visa');
const updated = attribution.getCampaignAttribution();
if (updated.firstTouch?.partner_id !== 'hostel-demo' || updated.lastTouch?.partner_id !== 'creator-2') {
  throw new Error('New valid source did not preserve first touch and update last touch');
}

if (localStorage.writes !== 0 || localStorage.length !== 0) throw new Error('Attribution wrote persistent storage');

const previousLastCapturedAt = updated.lastTouch?.captured_at;
location.search = `?partner=person@example.com&channel=${'x'.repeat(81)}&campaign=%3Cscript%3E&utm_source=${'y'.repeat(81)}`;
attribution.captureCampaignAttribution('visa');
const rejected = attribution.getCampaignAttribution();
if (rejected.lastTouch?.captured_at !== previousLastCapturedAt || JSON.stringify(rejected).includes('@example.com')) {
  throw new Error('Invalid, oversized or email-like values entered attribution storage');
}

Object.defineProperty(globalThis.window, 'sessionStorage', { configurable: true, get() { throw new Error('blocked'); } });
attribution.captureCampaignAttribution('visa');
const unavailable = attribution.getCampaignAttribution();
if (unavailable.partner_id || unavailable.firstTouch || unavailable.lastTouch) throw new Error('Unavailable storage did not fail closed');

delete globalThis.window;
const serverCapture = attribution.captureCampaignAttribution('visa');
const serverRead = attribution.getCampaignAttribution();
if (serverCapture.touch !== null || serverRead.partner_id || serverRead.firstTouch || serverRead.lastTouch) {
  throw new Error('SSR/static environment access was not safe');
}

const analyticsSource = await readFile('src/lib/analytics.ts', 'utf8');
if (!analyticsSource.includes("const session = safeStorage('sessionStorage');")) throw new Error('Analytics session storage guard is missing');
if (/getAnonymousSessionId\(\)[\s\S]{0,180}safeStorage\('localStorage'\)/.test(analyticsSource)) throw new Error('Anonymous ID still persists across sessions');

console.log('campaign attribution session-only, first/last touch, source validation and storage fallback tests passed');
