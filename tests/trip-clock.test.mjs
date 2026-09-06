import test from 'node:test';
import assert from 'node:assert/strict';
import { getTripClock, DEPARTURE, RETURN } from '../src/lib/trip-clock.ts';
test('countdown uses Japan departure instant and stops at zero', () => {
  assert.equal(DEPARTURE, Date.parse('2026-09-23T23:00:00Z'));
  assert.deepEqual(getTripClock(DEPARTURE - 90061000), {phase:'before',days:1,hours:1,minutes:1});
  assert.deepEqual(getTripClock(DEPARTURE), {phase:'during',days:0,hours:0,minutes:0});
  assert.equal(getTripClock(RETURN-1).phase,'during');
  assert.equal(getTripClock(RETURN).phase,'after');
});
