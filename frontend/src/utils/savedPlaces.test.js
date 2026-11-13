import test from 'node:test';
import assert from 'node:assert/strict';
import { getSavedPlaces, addSavedPlace, updateSavedPlace, deleteSavedPlace, SAVED_PLACES_KEY, nearestStopForAddress } from '../services/savedPlacesService.js';
import { searchAddress } from '../services/geocodingService.js';
import { stopsById } from '../data/network.js';
import { findJourney } from './findJourney.js';
import { calculateTotalJourneyTime } from './travelTime.js';
import { completeJourneyTime } from './completeJourneyTime.js';
import { fetchWalkingRoute } from '../services/walkingRoutes.js';

const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value) }; };
const home = { label:'Home',type:'bus_stop',stopId:'ratnapark',stopName:'Invented name ignored' };
const address = { label:'Office',type:'address',displayAddress:'New Baneshwor, Kathmandu',latitude:stopsById.new_baneshwor.latitude,longitude:stopsById.new_baneshwor.longitude };

test('saved stops persist with canonical data, edit without changing ID, and delete', () => {
 const store=storage();
 assert.deepEqual(getSavedPlaces(store),[]);
 const [saved]=addSavedPlace(home,store);
 assert.equal(saved.stopName,stopsById.ratnapark.name);
 assert.equal(getSavedPlaces(store)[0].id,saved.id);
 const [edited]=updateSavedPlace(saved.id,{...home,label:'College',stopId:'lagankhel'},store);
 assert.equal(edited.id,saved.id); assert.equal(edited.stopName,'Lagankhel');
 assert.deepEqual(deleteSavedPlace(saved.id,store),[]);
 assert.equal(store.getItem(SAVED_PLACES_KEY),'[]');
});
test('limit, invalid stops, storage corruption and quota errors do not silently overwrite places', () => {
 const store=storage();
 assert.throws(()=>addSavedPlace({...home,stopId:'not-real'},store),/supported bus stop/);
 assert.throws(()=>addSavedPlace({...home,stopId:'__proto__'},store),/supported bus stop/);
 for(let i=0;i<10;i++) addSavedPlace({...home,label:`Place ${i}`},store);
 assert.throws(()=>addSavedPlace(home,store),/up to 10/);
 assert.equal(getSavedPlaces(store).length,10);
 assert.throws(()=>addSavedPlace(home,{getItem:()=>null,setItem:()=>{throw Error('quota');}}),/Unable to save/);
 assert.throws(()=>getSavedPlaces({getItem:()=>'{broken'}),/Unable to load/);
 assert.throws(()=>addSavedPlace(home,{getItem:()=>{throw Error('blocked');}}),/Unable to save/);
});
test('addresses use polygon validation and real nearby stops, not invented address stops', () => {
 const store=storage();
 const [saved]=addSavedPlace(address,store);
 assert.equal(saved.nearestStopId,'new_baneshwor');
 assert.equal(saved.nearestStopName,stopsById.new_baneshwor.name);
 assert.equal(saved.stopId,undefined);
 assert.equal(saved.latitude,address.latitude);
 assert.throws(()=>nearestStopForAddress({latitude:55.67,longitude:12.56}),/within Nepal/);
 assert.throws(()=>nearestStopForAddress({latitude:28.2096,longitude:83.9856}),/No supported bus stop/);
 store.setItem(SAVED_PLACES_KEY,JSON.stringify([{...saved,latitude:55.67,longitude:12.56}]));
 assert.deepEqual(getSavedPlaces(store),[]);
});
test('geocoding rejects foreign and empty results and uses the backend without credentials', async () => {
 const result=await searchAddress('Kathmandu',{fetchImpl:async(url,options)=>{
  assert.equal(url,'/api/geocode'); assert.deepEqual(JSON.parse(options.body),{query:'Kathmandu'});
  assert.equal(options.headers.Authorization,undefined);
  return {ok:true,json:async()=>({results:[{displayName:address.displayAddress,...address}]})};
 }});
 assert.equal(result[0].latitude,address.latitude);
 await assert.rejects(searchAddress('Denmark',{fetchImpl:async()=>({ok:true,json:async()=>({results:[{displayName:'Copenhagen',latitude:55.67,longitude:12.56}]})})}),/within Nepal/);
 await assert.rejects(searchAddress('unknown',{fetchImpl:async()=>({ok:false,status:404})}),/could not find/);
});
test('destination walking requests stop-to-address geometry and adds only the final walk to unchanged estimates', async () => {
 const stop=stopsById.new_baneshwor;
 const walking=await fetchWalkingRoute(address,stop,{direction:'from-stop',fetchImpl:async(url,options)=>{
  const body=JSON.parse(options.body);assert.deepEqual(body.start,{lat:stop.latitude,lon:stop.longitude});
  assert.deepEqual(body.end,{lat:address.latitude,lon:address.longitude});
  return {ok:true,json:async()=>({geometry:{type:'LineString',coordinates:[[stop.longitude,stop.latitude],[address.longitude,address.latitude]]},distanceMetres:650,durationSeconds:360})};
 }});
 const result=findJourney('ratnapark',stop.id);
 const base=calculateTotalJourneyTime(result);
 assert.deepEqual(completeJourneyTime(result,null,null),base);
 const total=completeJourneyTime(result,null,walking);
 assert.equal(total.estimatedMinutes,base.estimatedMinutes+6);
 assert.equal(total.walkingMinutes,6);
 assert.equal(result.legs.at(-1).stops.at(-1),stop.id);
 assert.equal(completeJourneyTime(result,null,{...walking,stopId:'wrong'}),null);
});
