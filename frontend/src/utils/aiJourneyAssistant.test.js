import test from 'node:test';
import assert from 'node:assert/strict';
import { networkStops, stopsById, networkRoutes } from '../data/network.js';
import { parseJourneyIntent, parseJourneyIntentLocal, recommendJourney } from '../services/aiJourneyAssistant.js';
import { validateJourneyIntent } from './intentParser.js';
import { findNearestStops } from './distance.js';
import { findJourney } from './findJourney.js';

const queries = [
 ['Take me from Kapan to Boudha with the fewest transfers','kapan','bouddha_stupa'],
 ['Go from Thankot to the airport','thankot','airport'],
 ['I am near Baluwatar and want to go to Ratna Park',null,'ratnapark'],
 ['Take me to Balaju from Gongabu','gongabu_chowk','balaju'],
 ['I want the route with the least walking to Balaju',null,'balaju'],
 ['Find a route from Kapan to Balaju','kapan','balaju'],
 ['Fastest route from Lagankhel to Bhaktapur','lagankhel','koteshwor_bhaktapur_stop'],
];
for (const [query, origin, destination] of queries) {
 test(`intent: ${query}`, () => {
  const intent = parseJourneyIntentLocal(query);
  assert.equal(intent.origin, origin); assert.equal(intent.destination, destination); assert.equal(Object.hasOwn(intent, 'preference'), false);
  assert.ok(validateJourneyIntent(intent));
 });
}

test('location hints need coordinates and ambiguity contains bus stops only', () => {
 assert.equal(parseJourneyIntentLocal(queries[2][0]).useCurrentLocation,true);
 assert.equal(recommendJourney(parseJourneyIntentLocal(queries[2][0])).selected,null);
 const partial = parseJourneyIntentLocal('From Kapan to Baneshwor');
 assert.equal(partial.destination,null);
 assert.ok(partial.suggestions.destination.length > 1);
 assert.ok(partial.suggestions.destination.every(item => item.type === 'stop'));
});

test('unknown places and provider-invented IDs never become route inputs', async () => {
 const unknown = parseJourneyIntentLocal('Go from Atlantis to Mars');
 assert.equal(unknown.origin,null); assert.equal(unknown.destination,null);
 assert.equal(recommendJourney(unknown).options.length,0);
 const valid = parseJourneyIntentLocal(queries[0][0]);
 assert.equal(validateJourneyIntent({...valid, destination:'fake-stop'}),null);
 assert.equal(validateJourneyIntent({...valid, origin:'__proto__'}),null);
 assert.equal(validateJourneyIntent({...valid, preference:'ignored-legacy-field'}).preference,undefined);
 const safe = validateJourneyIntent({...valid, routes:['fake-route'], liveTime:20});
 assert.equal(safe.routes,undefined); assert.equal(safe.liveTime,undefined);
 let calls = 0;
 const mock = async () => { calls++; return {ok:true,json:async()=>({...valid,destination:'fake-stop'})}; };
 assert.equal((await parseJourneyIntent(queries[0][0],{fetchImpl:mock})).source,'local');
 assert.equal(calls,0);
 assert.equal((await parseJourneyIntent(queries[0][0],{backendEndpoint:'/api/ai/parse-journey',fetchImpl:mock})).source,'local_fallback');
 assert.equal((await parseJourneyIntent(queries[0][0],{backendEndpoint:'/api/ai/parse-journey',fetchImpl:async()=>{throw Error('offline');}})).source,'local_fallback');
});

test('location recommendation compares three real starts and keeps planner results and logs', () => {
 const point = stopsById.baluwatar;
 const intent = parseJourneyIntentLocal(queries[2][0]);
 let log;
 const answer = recommendJourney(intent,{location:point,onEvaluate:value=>log=value});
 assert.equal(answer.evaluatedCount,3);
 assert.deepEqual(log.evaluatedOrigins,findNearestStops(networkStops,point.latitude,point.longitude,3).map(stop=>stop.id));
 assert.equal(log.candidates.length,answer.options.length);
 for(const option of answer.options) {
  assert.deepEqual(option.result,findJourney(option.origin.id,option.destination.id));
  for(const leg of option.result.legs) {
   const route = networkRoutes.find(route=>route.id===leg.routeId);
   assert.ok(route); assert.equal(route.company,leg.company);
   for(let i=1;i<leg.stops.length;i++) assert.ok(route.stops.some((id,j)=>id===leg.stops[i-1]&&route.stops[j+1]===leg.stops[i]));
  }
 }
 assert.equal(answer.explanation,undefined);
 for (let i=0;i<5;i++) assert.deepEqual(recommendJourney(intent,{location:point}).selected,answer.selected);
});


test('tourist IDs and types cannot cross the backend validation boundary', () => {
 const intent = parseJourneyIntentLocal('from Kapan to Balaju');
 assert.equal(validateJourneyIntent({...intent, destinationType:'tourist_place'}), null);
 assert.equal(validateJourneyIntent({...intent, destination:'narayanhiti-palace'}), null);
 assert.equal(parseJourneyIntentLocal('from Kapan to Narayanhiti Palace Museum').destination, null);
});


test('valid backend intent is sanitized before route planning', async () => {
 const valid = parseJourneyIntentLocal('Go from Thankot to the airport');
 const answer = await parseJourneyIntent('Go from Thankot to the airport', {backendEndpoint:'/api/ai/parse-journey',
  fetchImpl:async(url, options)=>{
   assert.equal(url,'/api/ai/parse-journey');
   assert.deepEqual(JSON.parse(options.body),{message:'Go from Thankot to the airport'});
   return {ok:true,json:async()=>({...valid,operator:'Imaginary',routeId:'fake'})};
  }});
 assert.equal(answer.source,'backend'); assert.equal(answer.routeId,undefined); assert.equal(answer.operator,undefined);
 const route = recommendJourney(answer).selected.result;
 assert.deepEqual(route,findJourney('thankot','airport'));
});
