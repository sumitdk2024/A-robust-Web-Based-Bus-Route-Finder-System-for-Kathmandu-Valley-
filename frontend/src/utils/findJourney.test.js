import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGraph, findJourney, inspectConnectivity } from './findJourney.js';
import { networkData, networkStops, networkRoutes } from '../data/network.js';
import { loadMainDataset, parseCsv } from '../../scripts/loadMainDataset.js';
import { getJourneyStops } from './journeyStops.js';
test('CSV source is the complete active snapshot', () => {
 assert.deepEqual(networkData, loadMainDataset());
 assert.equal(networkStops.length,294); assert.equal(networkRoutes.length,40); assert.equal(networkData.route_stops.length,1215);
 assert.equal(inspectConnectivity().unusedStops.length,0);
 assert.deepEqual(parseCsv('id,name\r\n1,"A, B"'),[{id:'1',name:'A, B'}]);
});
test('examples use supplied forward edges only', () => {
 for (const [from,to] of [['thankot','airport'],['kapan','balaju'],['kamalbinayak','ratnapark'],['budhanilkantha','lagankhel'],['gongabu_chowk','chabahil'],['kalanki','bouddha_stupa'],['godawari','jamal'],['riddhi_siddhi_mulpani','thankot']]) {
 const result=findJourney(from,to); assert.ok(result.legs,from+' -> '+to);
 assert.equal(getJourneyStops(result).length,result.stopCount);
 for(const leg of result.legs) { const sequence=networkRoutes.find(r=>r.id===leg.routeId).stops; for(let i=1;i<leg.stops.length;i++) assert.ok(sequence.some((id,j)=>id===leg.stops[i-1] && sequence[j+1]===leg.stops[i])); }
 }
});
const fixture = sequences => buildGraph(['A','B','C','D','E','F','Z'].map(id => ({ id })), sequences.map((stops, i) => ({ id: `R${i}`, name: `Route ${i}`, stops })));
test('multiple transfers, reconstruction and disconnected/invalid inputs', () => {
  const network = fixture([['A','B'], ['B','C'], ['C','D'], ['D','E']]);
  const result = findJourney('A','E', network);
  assert.equal(result.transferCount, 3);
  assert.deepEqual(result.transfers, ['B','C','D']);
  assert.equal(result.stopCount, 5);
  assert.equal(findJourney('A','Z', network).message, 'No suitable route is available in the current project dataset.');
  for (const [a,b] of [['','A'], ['A','A'], ['unknown','A']]) assert.equal(findJourney(a,b,network).type, 'message');
});
test('transfer count outranks distance; equal transfers prefer fewer stops', () => {
  const network = fixture([['A','B','C','D','E'], ['A','F'], ['F','E'], ['A','Z','E']]);
  const result = findJourney('A','E', network);
  assert.equal(result.transferCount, 0);
  assert.deepEqual(result.legs[0].stops, ['A','Z','E']);
  const longerDirect = fixture([['A','B','C','D','E'], ['A','F'], ['F','E']]);
  assert.equal(findJourney('A','E', longerDirect).stopCount, 5);
});
test('route state is retained at shared stops to avoid unnecessary changes', () => {
  const network = fixture([['A','B'], ['A','B','C']]);
  assert.equal(findJourney('A','C', network).transferCount, 0);
});

test('directional edges are never reversed automatically',()=> {
 const network=fixture([['A','B','C']]); assert.equal(findJourney('C','A',network).type,'message');
});

test('supplied network supports a two-transfer journey', () => { const r = findJourney('baadbhanjyan(thankot)','petrol_pump-panipokhari'); assert.equal(r.transferCount,2); assert.equal(r.stopCount,23); });

test('equal-cost paths use stable route IDs even if source routes are reordered', () => {
 const stops = ['A','B','C','D'].map(id => ({id}));
 const routes = [{id:'R02',stops:['A','C','D']},{id:'R01',stops:['A','B','D']}];
 const first = findJourney('A','D',buildGraph(stops,routes));
 assert.equal(first.legs[0].routeId,'R01');
 assert.deepEqual(findJourney('A','D',buildGraph(stops,[...routes].reverse())),first);
});

test('main dataset searches repeat deterministically within the local performance budget', () => {
 const pairs = [['thankot','airport'],['kapan','balaju'],['baadbhanjyan(thankot)','petrol_pump-panipokhari']];
 for (const [from,to] of pairs) {
  const expected = findJourney(from,to);
  for (let i=0;i<10;i++) {
   const start = performance.now();
   assert.deepEqual(findJourney(from,to),expected);
   assert.ok(performance.now()-start < 3000);
  }
 }
});
