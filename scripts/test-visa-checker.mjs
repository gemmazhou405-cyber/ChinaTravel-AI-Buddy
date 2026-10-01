import assert from 'node:assert/strict';
import { evaluateVisaFree } from '../src/lib/visaChecker.ts';

const ports = [
  'Beijing Capital International Airport',
  'Shanghai Pudong International Airport',
];

const base = {
  nationality: 'United Kingdom',
  ordinaryPassport: true,
  entryDate: '2026-10-15',
  stayDays: 10,
  purpose: 'tourism',
  arrivalPort: '',
  departurePort: '',
  continuesToThirdCountryOrRegion: false,
  originCountryOrRegion: '',
  onwardCountryOrRegion: '',
  hainanOnly: false,
};

function check(name, input, expectedStatus, expectedRule) {
  const result = evaluateVisaFree({ ...base, ...input }, ports);
  assert.equal(result.status, expectedStatus, `${name}: status`);
  assert.equal(result.ruleType, expectedRule, `${name}: rule`);
  assert.ok(result.sourceUrl.startsWith('https://'), `${name}: official source URL`);
  console.log(`PASS ${name}`);
}

check('UK temporary 30-day entry', {}, 'may_be_eligible', 'temporary_30_day');
check('UK stay longer than 30 days is not auto-approved', { stayDays: 31 }, 'confirm_officially', 'official_confirmation_required');
check(
  '240-hour transit rejects same-origin route',
  {
    nationality: 'United States',
    purpose: 'transit',
    continuesToThirdCountryOrRegion: true,
    originCountryOrRegion: 'United States',
    onwardCountryOrRegion: 'United States',
    arrivalPort: ports[0],
    departurePort: ports[1],
  },
  'not_eligible_for_selected_route',
  'transit_240_hour',
);
check(
  '240-hour valid third-region route',
  {
    nationality: 'United States',
    purpose: 'transit',
    continuesToThirdCountryOrRegion: true,
    originCountryOrRegion: 'United States',
    onwardCountryOrRegion: 'Japan',
    arrivalPort: ports[0],
    departurePort: ports[1],
  },
  'may_be_eligible',
  'transit_240_hour',
);
check('Hainan-only policy is recognized', { nationality: 'Philippines', hainanOnly: true }, 'may_be_eligible', 'hainan_30_day');
check('Hainan policy is not treated as nationwide', { nationality: 'Philippines', hainanOnly: false }, 'confirm_officially', 'official_confirmation_required');
check('Expired UK/Canada temporary date requires confirmation', { entryDate: '2027-01-01' }, 'confirm_officially', 'temporary_30_day');
check('Non-ordinary passport is not auto-approved', { ordinaryPassport: false }, 'confirm_officially', 'official_confirmation_required');
check('Unlisted nationality is not auto-approved', { nationality: 'India' }, 'confirm_officially', 'official_confirmation_required');

console.log('Visa checker tests passed.');
