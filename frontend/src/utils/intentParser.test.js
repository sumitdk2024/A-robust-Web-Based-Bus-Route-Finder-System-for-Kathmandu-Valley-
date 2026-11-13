import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJourneyIntentLocal, normalizeJourneyText, matchIntentPlace } from './intentParser.js';
import { networkStops } from '../data/network.js';

const cases = [
 ['I want to travel from Kapan to Thankot','kapan','thankot'],
 ['from Kapan to Thankot','kapan','thankot'],
 ['go from Kapan to Thankot','kapan','thankot'],
 ['take me from Kapan to Thankot','kapan','thankot'],
 ['Kapan to Thankot','kapan','thankot'],
 ['I need to go from Kapan to Thankot','kapan','thankot'],
 ['route from Kapan to Thankot','kapan','thankot'],
 ['how do I get from Kapan to Thankot','kapan','thankot'],
 ['from Thankot to Airport','thankot','airport'],
 ['go from Balaju to Chabahil','balaju','chabahil'],
 ['take me from Ratna Park to Lagankhel','ratnapark','lagankhel'],
 ['New Baneshwor to Narayan Gopal Chowk','new_baneshwor','narayan_gopal_chowk'],
 ['I want to go from Gongabu Chowk to Boudhanath','gongabu_chowk','bouddha_stupa'],
 ['  I WANT to TRAVEL from   kapan TO THANKOT,  ','kapan','thankot'],
 ['from new_baneshwor to narayan_gopal_chowk','new_baneshwor','narayan_gopal_chowk'],
 ['I need to travel to Thankot from Kapan','kapan','thankot'],
];
for (const [query, origin, destination] of cases) test(`destination regression: ${query}`, () => {
 const intent = parseJourneyIntentLocal(query);
 assert.equal(intent.origin,origin); assert.equal(intent.destination,destination);
 assert.equal(intent.destinationType,'stop');
});

test('normalization and full dataset display-name/ID matching', () => {
 for(const value of ['Thankot','thankot',' THANKOT ','thankot,']) assert.equal(normalizeJourneyText(value),'thankot');
 assert.equal(normalizeJourneyText(' New__Baneshwor! '),'new baneshwor');
 for (const stop of networkStops) {
  assert.ok(matchIntentPlace(stop.stop_id).some(item=>item.id===stop.id),stop.id);
  assert.ok(matchIntentPlace(stop.stop_name).some(item=>item.id===stop.id),stop.name);
 }
});

test('assistant only matches main dataset bus stops', () => {
 assert.deepEqual(matchIntentPlace('Narayanhiti Palace Museum'), []);
 for (const stop of networkStops) assert.ok(matchIntentPlace(stop.name).every(item => item.type === 'stop'));
});

test('longest complete name wins but ambiguous partials require clarification', () => {
 assert.equal(matchIntentPlace('Narayan Gopal Chowk please')[0].id,'narayan_gopal_chowk');
 assert.equal(matchIntentPlace('Thankot Checkpost please')[0].id,'thankot_checkpost');
 const ambiguous=parseJourneyIntentLocal('from Kapan to Bhaktapur');
 assert.equal(ambiguous.destination,'koteshwor_bhaktapur_stop');
 const partial = parseJourneyIntentLocal('from Kapan to Baneshwor');
 assert.equal(partial.destination,null); assert.ok(partial.suggestions.destination.length>1);
 assert.ok(partial.suggestions.destination.every(item => item.type === 'stop'));
 assert.equal(matchIntentPlace('Thankot')[0].id,'thankot');
});

test('debugging is opt-in and includes extraction, candidates and selected IDs', () => {
 let log;
 const intent=parseJourneyIntentLocal('I want to travel from kapan to Thankot',{onDebug:value=>log=value});
 assert.equal(log.rawQuery,'I want to travel from kapan to Thankot');
 assert.equal(log.originText,'kapan'); assert.equal(log.destinationText,'thankot');
 assert.equal(log.selectedOrigin,'kapan'); assert.equal(log.selectedDestination,'thankot');
 assert.ok(log.originCandidates.length); assert.ok(log.destinationCandidates.length);
 assert.equal(intent.debug,undefined);
});
