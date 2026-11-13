import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';

test('walking HTTP endpoint validates Nepal, protects keys and handles provider success/failure', async () => {
  const originalFetch=globalThis.fetch;
  const originalKey=process.env.OPENROUTESERVICE_API_KEY;
  let providerCalls=0;
  let providerOK=true;
  globalThis.fetch=async(url,options)=>{
    if (!String(url).startsWith('https://api.openrouteservice.org/')) return originalFetch(url,options);
    providerCalls++;
    assert.equal(options.headers.Authorization,'test-only-placeholder');
    return {ok:providerOK,json:async()=>({features:[{geometry:{type:'LineString',coordinates:[[85.3,27.7],[85.305,27.705],[85.31,27.71]]},properties:{summary:{distance:720,duration:540}}}]})};
  };
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const url=`http://127.0.0.1:${server.address().port}/api/walking-route`;
  const request=body=>originalFetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  try {
    process.env.OPENROUTESERVICE_API_KEY='test-only-placeholder';
    const foreign=await request({start:{lat:55.6761,lon:12.5683},end:{lat:27.71,lon:85.31}});
    assert.equal(foreign.status,400);
    assert.equal(providerCalls,0);
    assert.ok(!(await foreign.text()).includes('55.6761'));
    const body={start:{lat:27.7,lon:85.3},end:{lat:27.71,lon:85.31}};
    delete process.env.OPENROUTESERVICE_API_KEY;
    const missing=await request(body);
    assert.equal(missing.status,503);
    assert.equal(providerCalls,0);
    process.env.OPENROUTESERVICE_API_KEY='test-only-placeholder';
    const success=await request(body);
    assert.equal(success.status,200);
    assert.equal(success.headers.get('cache-control'),'no-store');
    const route=await success.json();
    assert.equal(route.distanceMetres,720);
    assert.equal(route.durationSeconds,540);
    assert.equal(route.geometry.coordinates.length,3);
    assert.ok(!JSON.stringify(route).includes('test-only-placeholder'));
    providerOK=false;
    const failed=await request(body);
    assert.equal(failed.status,503);
    assert.match((await failed.json()).message,/approximate distance/);
  } finally {
    globalThis.fetch=originalFetch;
    if (originalKey===undefined) delete process.env.OPENROUTESERVICE_API_KEY;
    else process.env.OPENROUTESERVICE_API_KEY=originalKey;
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
  }
});
