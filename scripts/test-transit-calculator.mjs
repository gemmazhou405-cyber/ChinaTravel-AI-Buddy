import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TRANSIT_240_COUNTRY_CODES } from '../src/data/chinaVisaPolicies.ts';
import { COMMON_TRANSIT_ROUTE_EXAMPLES, calculateTransitDeadline } from '../src/lib/transitCalculator.ts';

const calculatorContent = JSON.parse(await readFile('src/data/transitCalculatorContent.json', 'utf8'));
for (const example of calculatorContent.examples) {
  const result = calculateTransitDeadline({ arrivalLocal: example.arrivalLocal, entryCity: 'Shanghai', passportNationalityCode: 'US', originRegion: 'US', onwardRegion: 'HK' });
  for (const [resultKey, exampleKey] of [['clockStartIso', 'clockStartChina'], ['planningLatestIso', 'planningLatestChina'], ['deadlineExclusiveIso', 'deadlineExclusiveChina']]) {
    assert.equal(result[resultKey], new Date(`${example[exampleKey]}:00+08:00`).toISOString(), `${example.label}: ${resultKey}`);
  }
}

const mayResult = calculateTransitDeadline({
  arrivalLocal: '2026-05-01T14:30',
  entryCity: 'Shanghai',
  passportNationalityCode: 'GB',
  originRegion: 'GB',
  onwardRegion: 'JP',
});
assert.equal(mayResult.clockStartIso, '2026-05-01T16:00:00.000Z');
assert.equal(mayResult.deadlineExclusiveIso, '2026-05-11T16:00:00.000Z');
assert.equal(mayResult.planningLatestIso, '2026-05-11T15:59:00.000Z');
assert.equal(mayResult.hasThirdRegionRoutePattern, true);
assert.equal(mayResult.isPassportNationalityEligible, true);
assert.equal(mayResult.eligibilityStatus, 'basic_requirements_match');

const rolloverResult = calculateTransitDeadline({
  arrivalLocal: '2026-12-31T23:55',
  entryCity: 'Beijing',
  passportNationalityCode: 'US',
  originRegion: 'US',
  onwardRegion: 'KR',
});
assert.equal(rolloverResult.clockStartIso, '2026-12-31T16:00:00.000Z');
assert.equal(rolloverResult.deadlineExclusiveIso, '2027-01-10T16:00:00.000Z');

const afghanistanResult = calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: 'Shenzhen', passportNationalityCode: 'AF', originRegion: 'AF', onwardRegion: 'BT' });
assert.equal(afghanistanResult.hasThirdRegionRoutePattern, true);
assert.equal(afghanistanResult.isPassportNationalityEligible, false);
assert.equal(afghanistanResult.eligibilityStatus, 'nationality_not_eligible');

const invalidRouteResult = calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: 'Shanghai', passportNationalityCode: 'GB', originRegion: 'GB', onwardRegion: 'GB' });
assert.equal(invalidRouteResult.hasThirdRegionRoutePattern, false);
assert.equal(invalidRouteResult.eligibilityStatus, 'route_pattern_invalid');

const missingNationalityResult = calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: 'Shanghai', passportNationalityCode: '', originRegion: 'GB', onwardRegion: 'JP' });
assert.equal(missingNationalityResult.isPassportNationalityEligible, null);
assert.equal(missingNationalityResult.eligibilityStatus, 'nationality_required');

assert.equal(calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: 'Shanghai', passportNationalityCode: 'US', originRegion: 'CN', onwardRegion: 'JP' }).hasThirdRegionRoutePattern, false);
assert.throws(() => calculateTransitDeadline({ arrivalLocal: 'invalid', entryCity: 'Shanghai', passportNationalityCode: 'US', originRegion: 'US', onwardRegion: 'JP' }), /invalid_arrival/);
assert.throws(() => calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: '', passportNationalityCode: 'US', originRegion: 'US', onwardRegion: 'JP' }), /missing_fields/);

assert.equal(TRANSIT_240_COUNTRY_CODES.length, 57);
assert.equal(new Set(TRANSIT_240_COUNTRY_CODES).size, 57);
assert.equal(TRANSIT_240_COUNTRY_CODES.includes('GB'), true);
assert.equal(TRANSIT_240_COUNTRY_CODES.includes('AF'), false);

assert.deepEqual(
  COMMON_TRANSIT_ROUTE_EXAMPLES.map(({ passportNationalityCode, originRegion, onwardRegion }) => [passportNationalityCode, originRegion, onwardRegion]),
  [['GB', 'GB', 'JP'], ['US', 'US', 'HK'], ['SG', 'SG', 'KR'], ['AU', 'AU', 'TH']],
);

const component = await readFile('src/components/TransitCalculatorPage.tsx', 'utf8');
for (const required of ['FAQPage', 'WebApplication', '/plan/', 'aria-live="polite"', 'OFFICIAL_VISA_SOURCES.transit240', 'Passport nationality', 'current public NIA policy', 'This calculator does not confirm final eligibility.', 'Common route examples', 'transit_calculator_calculate', 'transit_calculator_result_shown', 'transit_calculator_plan_cta_click']) {
  assert.ok(component.includes(required), `component missing ${required}`);
}

console.log('240-hour transit calculator deadline, nationality, route pattern, accessibility, CTA and schema checks passed');
