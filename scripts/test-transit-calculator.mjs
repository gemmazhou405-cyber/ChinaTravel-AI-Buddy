import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculateTransitDeadline } from '../src/lib/transitCalculator.ts';

const mayResult = calculateTransitDeadline({
  arrivalLocal: '2026-05-01T14:30',
  entryCity: 'Shanghai',
  originRegion: 'GB',
  onwardRegion: 'JP',
});
assert.equal(mayResult.clockStartIso, '2026-05-01T16:00:00.000Z');
assert.equal(mayResult.deadlineExclusiveIso, '2026-05-11T16:00:00.000Z');
assert.equal(mayResult.planningLatestIso, '2026-05-11T15:59:00.000Z');
assert.equal(mayResult.hasThirdRegionRoutePattern, true);

const rolloverResult = calculateTransitDeadline({
  arrivalLocal: '2026-12-31T23:55',
  entryCity: 'Beijing',
  originRegion: 'US',
  onwardRegion: 'KR',
});
assert.equal(rolloverResult.clockStartIso, '2026-12-31T16:00:00.000Z');
assert.equal(rolloverResult.deadlineExclusiveIso, '2027-01-10T16:00:00.000Z');

assert.equal(calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: 'Shanghai', originRegion: 'US', onwardRegion: 'US' }).hasThirdRegionRoutePattern, false);
assert.equal(calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: 'Shanghai', originRegion: 'CN', onwardRegion: 'JP' }).hasThirdRegionRoutePattern, false);
assert.throws(() => calculateTransitDeadline({ arrivalLocal: 'invalid', entryCity: 'Shanghai', originRegion: 'US', onwardRegion: 'JP' }), /invalid_arrival/);
assert.throws(() => calculateTransitDeadline({ arrivalLocal: '2026-05-01T10:00', entryCity: '', originRegion: 'US', onwardRegion: 'JP' }), /missing_fields/);

const component = await readFile('src/components/TransitCalculatorPage.tsx', 'utf8');
for (const required of ['FAQPage', 'WebApplication', '/plan/', 'aria-live="polite"', 'OFFICIAL_VISA_SOURCES.transit240']) {
  assert.ok(component.includes(required), `component missing ${required}`);
}

console.log('240-hour transit calculator deadline, route pattern, accessibility, CTA and schema checks passed');
