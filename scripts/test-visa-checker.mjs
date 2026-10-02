import assert from 'node:assert/strict';
import {
  COUNTRY_NAMES,
  HAINAN_30_DAY_COUNTRY_CODES,
  MUTUAL_VISA_EXEMPTION_POLICIES,
  TRANSIT_240_COUNTRY_CODES,
  UNILATERAL_30_DAY_COUNTRY_CODES,
  UNILATERAL_30_DAY_POLICIES,
  normalizeNationalityToIso,
} from '../src/data/chinaVisaPolicies.ts';
import { evaluateVisaFree } from '../src/lib/visaChecker.ts';

const base = {
  nationalityCode: 'GB',
  passportType: 'ordinary',
  entryDate: '2026-10-15',
  purpose: 'tourism',
  stayDays: 10,
  tripType: 'mainland_visit',
  originCountryOrRegion: '',
  onwardCountryOrRegion: '',
};

function check(name, input, expectedCategory, expectedPolicy) {
  const result = evaluateVisaFree({ ...base, ...input });
  assert.equal(result.category, expectedCategory, `${name}: category`);
  assert.equal(result.policyType, expectedPolicy, `${name}: policy`);
  assert.ok(result.sources.every((source) => source.url.startsWith('https://')), `${name}: official source URL`);
  assert.equal(result.lastPolicyCheck, '2026-10-02', `${name}: verification date`);
  console.log(`PASS ${name}`);
}

check('1 UK October 2026 direct tourism', {}, 'likely_eligible', 'unilateral_30_day');
check('2 UK January 2027 is not assumed renewed', { entryDate: '2027-01-10' }, 'date_unconfirmed', 'unilateral_30_day');
check('3 Russia remains covered in 2027', { nationalityCode: 'RU', entryDate: '2027-06-01', stayDays: 30 }, 'likely_eligible', 'unilateral_30_day');
check('4 US direct tourism is not unilateral visa-free', { nationalityCode: 'US' }, 'visa_may_be_required', 'none');
check('5 US to China to Japan may qualify for transit', {
  nationalityCode: 'US', purpose: 'transit', tripType: 'transit', stayDays: 7,
  originCountryOrRegion: 'United States', onwardCountryOrRegion: 'Japan',
}, 'additional_checks', 'transit_240_hour');
check('6 US to China to US is not third-country transit', {
  nationalityCode: 'US', purpose: 'transit', tripType: 'transit', stayDays: 7,
  originCountryOrRegion: 'United States', onwardCountryOrRegion: 'United States',
}, 'visa_may_be_required', 'transit_240_hour');
check('7 India direct tourism is not unilateral visa-free', { nationalityCode: 'IN' }, 'visa_may_be_required', 'none');
check('8 Singapore uses mutual agreement', { nationalityCode: 'SG' }, 'likely_eligible', 'mutual_agreement');
check('9 non-ordinary passport is outside scope', { passportType: 'other' }, 'cannot_determine', 'none');
for (const purpose of ['work', 'study', 'journalism']) {
  check(`10 ${purpose} is not a visitor-policy match`, { purpose }, 'visa_may_be_required', 'none');
}
check('11 Hainan nationality does not grant a Beijing trip', { nationalityCode: 'US', tripType: 'mainland_visit' }, 'visa_may_be_required', 'none');
check('12 31-day UK stay exceeds unilateral limit', { stayDays: 31 }, 'visa_may_be_required', 'unilateral_30_day');
check('13 missing required input produces no conclusion', { nationalityCode: '' }, 'cannot_determine', 'none');
check('expired unilateral policy does not hide a valid transit check', {
  nationalityCode: 'GB', entryDate: '2027-01-10', purpose: 'transit', tripType: 'transit', stayDays: 7,
  originCountryOrRegion: 'United Kingdom', onwardCountryOrRegion: 'Japan',
}, 'additional_checks', 'transit_240_hour');
check('route aliases cannot turn a return trip into third-country transit', {
  nationalityCode: 'US', purpose: 'transit', tripType: 'transit', stayDays: 7,
  originCountryOrRegion: 'USA', onwardCountryOrRegion: 'United States',
}, 'visa_may_be_required', 'transit_240_hour');

assert.equal(UNILATERAL_30_DAY_COUNTRY_CODES.length, 50, 'unilateral country count');
assert.equal(TRANSIT_240_COUNTRY_CODES.length, 57, 'transit country count');
assert.equal(HAINAN_30_DAY_COUNTRY_CODES.length, 61, 'Hainan country count');
for (const [label, codes] of [
  ['unilateral', UNILATERAL_30_DAY_COUNTRY_CODES],
  ['transit', TRANSIT_240_COUNTRY_CODES],
  ['Hainan', HAINAN_30_DAY_COUNTRY_CODES],
]) {
  assert.equal(new Set(codes).size, codes.length, `${label}: no duplicate ISO codes`);
  assert.ok(codes.every((code) => COUNTRY_NAMES[code]), `${label}: every ISO code has a display name`);
}

const unilateralByCode = Object.fromEntries(UNILATERAL_30_DAY_POLICIES.map((policy) => [policy.countryIsoCode, policy]));
assert.equal(unilateralByCode.GB.validUntil, '2026-12-31', 'UK policy end date');
assert.equal(unilateralByCode.RU.validUntil, '2027-12-31', 'Russia policy end date');
assert.equal(unilateralByCode.BN.validUntil, null, 'Brunei source states no end date');
assert.ok(MUTUAL_VISA_EXEMPTION_POLICIES.every((policy) => policy.validFrom && policy.maximumStayDays > 0), 'mutual policies include effective date and limit');
assert.equal(normalizeNationalityToIso('UK'), 'GB');
assert.equal(normalizeNationalityToIso('Republic of Korea'), 'KR');
assert.equal(normalizeNationalityToIso('Russian Federation'), 'RU');
assert.equal(normalizeNationalityToIso('Czech Republic'), 'CZ');

console.log('PASS policy-data counts, ISO uniqueness, aliases, and validity dates');
console.log('Visa checker tests passed.');
