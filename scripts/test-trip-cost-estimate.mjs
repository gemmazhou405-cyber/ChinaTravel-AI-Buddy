import assert from 'node:assert/strict';
import { estimateTripCost, formatTripCostRange } from '../src/lib/tripCostEstimate.mjs';

const couple = estimateTripCost(7, 2, 'budget');
assert.deepEqual([couple.perPersonMinimum, couple.perPersonMaximum], [2450, 4550]);
assert.deepEqual([couple.groupMinimum, couple.groupMaximum], [4900, 9100]);
const midRange = estimateTripCost(10, 3, 'mid-range');
assert.deepEqual([midRange.perPersonMinimum, midRange.perPersonMaximum], [8000, 15000]);
assert.deepEqual([midRange.groupMinimum, midRange.groupMaximum], [24000, 45000]);
const comfortable = estimateTripCost(14, 2, 'comfortable');
assert.deepEqual([comfortable.perPersonMinimum, comfortable.perPersonMaximum], [25200, 42000]);
assert.deepEqual([comfortable.groupMinimum, comfortable.groupMaximum], [50400, 84000]);
assert.equal(formatTripCostRange(comfortable.groupMinimum, comfortable.groupMaximum, comfortable.openEnded), 'RMB 50,400–84,000+');
assert.equal(formatTripCostRange(couple.groupMinimum, couple.groupMaximum, couple.openEnded), 'RMB 4,900–9,100');
for (const input of ['', -10, 0, NaN, Infinity, 'invalid']) {
  const result = estimateTripCost(input, input, 'budget');
  assert.equal(result.days, 1);
  assert.equal(result.travelers, 1);
  assert.equal(result.groupMinimum, 350);
}
assert.deepEqual([estimateTripCost(99, 99, 'budget').days, estimateTripCost(99, 99, 'budget').travelers], [60, 20]);
assert.deepEqual([estimateTripCost('7.9', '2.9', 'budget').days, estimateTripCost('7.9', '2.9', 'budget').travelers], [7, 2]);
assert.equal(estimateTripCost(10, 1, '__proto__').style, 'mid-range');
console.log('PASS: per-person/group subtotals, planning examples, open upper end and input bounds.');
