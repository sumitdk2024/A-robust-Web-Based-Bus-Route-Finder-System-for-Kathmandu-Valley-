import assert from 'node:assert/strict';
import { findJourney } from '../frontend/src/utils/findJourney.js';
import { app } from '../backend/server.js';
const results = [['thankot','airport'],['kapan','balaju']].map(([from,to]) => {
 const journey=findJourney(from,to); assert.ok(journey.legs?.length);
 assert.equal(journey.legs[0].stops[0],from); assert.equal(journey.legs.at(-1).stops.at(-1),to);
 return {from,to,transfers:journey.transferCount,stops:journey.stopCount,routes:journey.legs.map(x=>x.routeId)};
});
const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
try {
 for (const endpoint of ['stops','routes']) {
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/${endpoint}`);
 assert.equal(response.status,200); const rows=await response.json(); assert.ok(rows.length);
 console.log(JSON.stringify({endpoint,rows:rows.length,status:response.status}));
 }
 console.log(JSON.stringify({journeys:results,pass:true},null,2));
} finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
