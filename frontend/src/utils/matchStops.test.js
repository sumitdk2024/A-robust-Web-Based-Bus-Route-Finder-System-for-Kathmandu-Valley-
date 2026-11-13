import test from 'node:test';
import assert from 'node:assert/strict';
import { networkStops as mainStops } from '../data/network.js';
import { matchStops } from './matchStops.js';

test('all main stops preserve their IDs', () => { assert.equal(mainStops.length,294); assert.equal(new Set(mainStops.map(s=>s.stop_id)).size,294); });
test('case insensitive prefixes, word prefixes and substrings are ranked and capped', () => {
  assert.ok(matchStops(mainStops, 'rAt').some(stop => stop.stop_name === 'Ratna Park'));
  assert.ok(matchStops(mainStops, 'chu').some(stop => stop.stop_name === 'Chuchepati'));
  assert.ok(matchStops(mainStops, 'chow').some(stop => stop.stop_name.includes('Chowk')));
  assert.equal(matchStops(mainStops, '').length, 10);
  assert.equal(matchStops(mainStops, 'unknown place').length, 0);
  assert.deepEqual(matchStops([{ stop_name: 'Insidepark' }, { stop_name: 'Park Avenue' }, { stop_name: 'Ratna Park' }], 'park').map(stop => stop.stop_name), ['Park Avenue', 'Ratna Park', 'Insidepark']);
});
