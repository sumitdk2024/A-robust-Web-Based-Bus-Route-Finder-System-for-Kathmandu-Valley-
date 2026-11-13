import test from 'node:test';
import assert from 'node:assert/strict';
import { searchNepalAddress } from '../services/geocodingService.js';
import { app } from '../server.js';

const feature=(label,lon,lat)=>({geometry:{type:'Point',coordinates:[lon,lat]},properties:{label}});
test('geocoder sends queries to the fixed provider with a server-only key and validates Nepal', async () => {
 const results=await searchNepalAddress('New Baneshwor, Kathmandu',{apiKey:'test-key',fetchImpl:async(url,options)=>{
  const parsed=new URL(url);
  assert.equal(parsed.origin+parsed.pathname,'https://api.openrouteservice.org/geocode/search');
  assert.equal(parsed.searchParams.get('text'),'New Baneshwor, Kathmandu');
  assert.equal(parsed.searchParams.get('size'),'5');
  assert.equal(parsed.searchParams.has('api_key'),false);
  assert.equal(options.headers.Authorization,'test-key');
  return {ok:true,json:async()=>({features:[feature('New Baneshwor',85.336,27.689),feature('Copenhagen',12.56,55.67)]})};
 }});
 assert.equal(results.length,1);assert.equal(results[0].displayName,'New Baneshwor');
 assert.equal(results[0].longitude,85.336);
});
test('foreign, missing, invalid and unavailable geocoding have distinct safe outcomes', async () => {
 const mock=features=>({apiKey:'test-key',fetchImpl:async()=>({ok:true,json:async()=>({features})})});
 await assert.rejects(searchNepalAddress('Copenhagen, Denmark',mock([feature('Copenhagen',12.56,55.67)])),error=>error.status===400);
 await assert.rejects(searchNepalAddress('Unknown place',mock([])),error=>error.status===404);
 await assert.rejects(searchNepalAddress('',mock([])),error=>error.status===422);
 await assert.rejects(searchNepalAddress('Kathmandu',{apiKey:'',fetchImpl:()=>{throw Error('must not call');}}),/temporarily unavailable/);
});
test('geocoding HTTP endpoint does not return credentials and rejects a foreign address', async () => {
 const originalFetch=globalThis.fetch, originalKey=process.env.OPENROUTESERVICE_API_KEY;
 process.env.OPENROUTESERVICE_API_KEY='test-key';
 globalThis.fetch=async(url,options)=>String(url).startsWith('https://api.openrouteservice.org/geocode/search')
  ? {ok:true,json:async()=>({features:[new URL(url).searchParams.get('text').includes('Denmark')?feature('Copenhagen',12.56,55.67):feature('Kathmandu',85.324,27.717)]})}
  : originalFetch(url,options);
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const request=query=>originalFetch(`http://127.0.0.1:${server.address().port}/api/geocode`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});
 try {
  const foreign=await request('Copenhagen, Denmark'); assert.equal(foreign.status,400);
  const valid=await request('Kathmandu');assert.equal(valid.status,200);
  assert.equal(valid.headers.get('cache-control'),'no-store');
  const body=await valid.json();assert.equal(body.results[0].latitude,27.717);
  assert.ok(!JSON.stringify(body).includes('test-key'));
 } finally {
  globalThis.fetch=originalFetch;
  if(originalKey===undefined) delete process.env.OPENROUTESERVICE_API_KEY;else process.env.OPENROUTESERVICE_API_KEY=originalKey;
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 }
});
