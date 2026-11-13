import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWalkingRoute, routeNearbyStops } from '../services/walkingRoutes.js';
import { stopsById } from '../data/network.js';
import { estimateWalkingTime } from './travelTime.js';
import { getWalkingRoute } from '../../../backend/services/walkingRouteService.js';
import { findNearestStops } from './distance.js';
import { networkStops } from '../data/network.js';
import { recommendJourney, parseJourneyIntentLocal } from '../services/aiJourneyAssistant.js';

const location = {latitude:27.7,longitude:85.3};
const stop = stopsById.jamal;
const geometry = {type:'LineString',coordinates:[[85.3,27.7],[85.301,27.702],[stop.longitude,stop.latitude]]};
const payload = {geometry,distanceMetres:720,durationSeconds:540};

test('pedestrian response preserves provider geometry, distance and duration', async () => {
  const walking = await fetchWalkingRoute(location,stop,{fetchImpl:async(url,options) => {
    assert.equal(url,'/api/walking-route');
    assert.deepEqual(JSON.parse(options.body),{start:{lat:27.7,lon:85.3},end:{lat:stop.latitude,lon:stop.longitude}});
    return {ok:true,json:async()=>payload};
  }});
  assert.deepEqual(walking.geometry,geometry);
  assert.equal(walking.distanceMetres,720);
  assert.equal(walking.walkingMinutes,9);
  assert.equal(walking.source,'pedestrian');
});

test('errors and malformed routes fall back, while reset aborts do not commit a fallback', async () => {
  for (const fetchImpl of [async()=>{throw Error('offline');},async()=>({ok:false}),async()=>({ok:true,json:async()=>({geometry:{type:'LineString',coordinates:[]}})})]) {
    const walking=await fetchWalkingRoute(location,stop,{fetchImpl});
    assert.equal(walking.source,'approximate');
    assert.equal(walking.geometry,null);
    assert.equal(walking.distanceMetres,estimateWalkingTime(location,stop).distanceMetres);
  }
  const controller=new AbortController();controller.abort();
  await assert.rejects(fetchWalkingRoute(location,stop,{signal:controller.signal,fetchImpl:async()=>{throw Error('aborted');}}));
});

test('only shortlisted candidates are requested and compared using provider durations', async () => {
  const candidates=[stopsById.jamal,stopsById.ratnapark,stopsById.baluwatar];
  const durations=[900,480,600];let calls=0;
  const ranked=await routeNearbyStops(location,candidates,{fetchImpl:async()=>{
    const durationSeconds=durations[calls++];
    return {ok:true,json:async()=>({...payload,durationSeconds})};
  }});
  assert.equal(calls,3);
  assert.deepEqual(ranked.map(item=>item.id),[candidates[1].id,candidates[2].id,candidates[0].id]);
});

test('location recommendation uses pedestrian metrics and excludes stops outside the eligible shortlist', () => {
  const point=stopsById.baluwatar;
  const candidates=findNearestStops(networkStops,point.latitude,point.longitude,3);
  const candidate=candidates[1];
  const walking={stopId:candidate.id,stopName:candidate.name,source:'pedestrian',geometry,distanceMetres:720,walkingMinutes:9};
  const answer=recommendJourney(parseJourneyIntentLocal('From my location to Ratna Park with the least walking'),{
    location:point,candidateStopIds:[candidate.id],walkingByStop:{[candidate.id]:walking},
  });
  assert.equal(answer.options.length,1);
  assert.equal(answer.selected.origin.id,candidate.id);
  assert.equal(answer.selected.estimate.walkingMinutes,9);
  assert.deepEqual(answer.selected.walking.geometry,geometry);
});

test('backend uses foot-walking, server-only authorization and longitude-first GeoJSON', async () => {
  const result=await getWalkingRoute({lat:27.7,lon:85.3},{lat:stop.latitude,lon:stop.longitude},{apiKey:'test-only-placeholder',fetchImpl:async(url,options)=>{
    assert.equal(url,'https://api.openrouteservice.org/v2/directions/foot-walking/geojson');
    assert.equal(options.headers.Authorization,'test-only-placeholder');
    assert.deepEqual(JSON.parse(options.body).coordinates,[[85.3,27.7],[stop.longitude,stop.latitude]]);
    return {ok:true,json:async()=>({features:[{geometry,properties:{summary:{distance:720,duration:540}}}]})};
  }});
  assert.deepEqual(result,payload);
});

test('backend rejects foreign coordinates before provider calls and handles missing keys/failures', async () => {
  let calls=0;
  const fetchImpl=async()=>{calls++;throw Error('offline');};
  for (const start of [{lat:55.67,lon:12.56},{lat:26.7606,lon:83.3732},{lat:'27.7',lon:85.3}]) {
    await assert.rejects(getWalkingRoute(start,{lat:27.7,lon:85.3},{apiKey:'test',fetchImpl}),error=>error.status===400);
  }
  assert.equal(calls,0);
  await assert.rejects(getWalkingRoute({lat:27.7,lon:85.3},{lat:27.71,lon:85.31},{apiKey:'',fetchImpl}));
  assert.equal(calls,0);
  await assert.rejects(getWalkingRoute({lat:27.7,lon:85.3},{lat:27.71,lon:85.31},{apiKey:'test',fetchImpl}));
  assert.equal(calls,1);
});
