import test from 'node:test';
import assert from 'node:assert/strict';
import { rankJourneyOptions } from './journeyRanking.js';
import { parseJourneyIntentLocal } from './intentParser.js';

const make = (id, transfers, stops, minutes, routeId = id) => ({
  origin: { id }, destination: { id: 'destination' },
  result: { transferCount: transfers, stopCount: stops, legs: [{ routeId, stops: [id, 'destination'] }] },
  estimate: { estimatedMinutes: minutes },
});

test('ranking prioritizes transfers, stops, time, then stable route IDs', () => {
  const options = [make('more-transfers',2,3,1), make('more-stops',1,9,1),
    make('slower',1,8,90), make('route-b',1,8,30,'R02'), make('route-a',1,8,30,'R01')];
  const expected=['route-a','route-b','slower','more-stops','more-transfers'];
  assert.deepEqual(rankJourneyOptions(options).map(option=>option.origin.id),expected);
  assert.deepEqual(rankJourneyOptions([...options].reverse()).map(option=>option.origin.id),expected);
  assert.equal(options[0].origin.id,'more-transfers'); // Does not mutate input.
});

test('remaining equal ranks use stable stop IDs and missing estimates sort last', () => {
  const options=[make('b',0,5,10,'R01'),make('a',0,5,10,'R01'),make('missing',0,5,NaN,'R01')];
  assert.deepEqual(rankJourneyOptions(options).map(option=>option.origin.id),['a','b','missing']);
});

test('requested natural-language journeys extract endpoints without a mode', () => {
  for (const [query,origin,destination] of [
    ['I want to go from Bouddha to Kapan','bouddha_stupa','kapan'],
    ['Find a route from Thankot to Airport','thankot','airport'],
    ['Take me from Lagankhel to Balaju','lagankhel','balaju'],
  ]) {
    const intent=parseJourneyIntentLocal(query);
    assert.equal(intent.origin,origin);
    assert.equal(intent.destination,destination);
    assert.equal(Object.hasOwn(intent,'preference'),false);
  }
});
