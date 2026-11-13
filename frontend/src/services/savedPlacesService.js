import { stopsById, networkStops } from '../data/network.js';
import { isInsideNepal } from '../utils/nepal.js';
import { findNearestStops } from '../utils/distance.js';
import { MAX_NEARBY_DISTANCE_METRES } from './walkingRoutes.js';

export const SAVED_PLACES_KEY = 'kathmanduBusFinder.savedPlaces';
export const MAX_SAVED_PLACES = 10;
export function nearestStopForAddress(address) {
  if (!isInsideNepal(address.latitude, address.longitude)) throw new Error('Please select an address within Nepal.');
  const stop = findNearestStops(networkStops, address.latitude, address.longitude, 1)[0];
  if (!stop || stop.distance > MAX_NEARBY_DISTANCE_METRES) throw new Error('No supported bus stop was found near this address.');
  return stop;
}

function normalize(place, id) {
  const label = typeof place.label === 'string' ? place.label.trim() : '';
  if (!label || label.length > 50) throw new Error('Enter a place label of up to 50 characters.');
  if (place.type === 'bus_stop') {
    const stop = stopsById[place.stopId];
    if (!stop || !Object.hasOwn(stopsById, place.stopId)) throw new Error('Please select a supported bus stop.');
    return { id, label, type: 'bus_stop', stopId: stop.id, stopName: stop.name };
  }
  if (place.type === 'address' && typeof place.displayAddress === 'string' && place.displayAddress.trim()) {
    const stop = nearestStopForAddress(place);
    return { id, label, type: 'address', displayAddress: place.displayAddress.trim().slice(0, 500),
      latitude: place.latitude, longitude: place.longitude, nearestStopId: stop.id, nearestStopName: stop.name };
  }
  throw new Error('Please select a supported bus stop or address.');
}

function getStore(storage) {
  try { return storage || globalThis.localStorage; }
  catch { throw new Error('Unable to save this place.'); }
}
export function getSavedPlaces(storage) {
  let rows;
  try { rows = JSON.parse(getStore(storage).getItem(SAVED_PLACES_KEY) || '[]'); }
  catch { throw new Error('Unable to load saved places.'); }
  if (!Array.isArray(rows)) throw new Error('Unable to load saved places.');
  const seen = new Set();
  return rows.flatMap(row => {
    try {
      if (!row || typeof row.id !== 'string' || !row.id || seen.has(row.id)) return [];
      const place = normalize(row, row.id);
      seen.add(row.id);
      return [place];
    } catch { return []; } // Ignore stale/unsupported records; never create stops.
  }).slice(0, MAX_SAVED_PLACES);
}

function persist(places, storage) {
  try { getStore(storage).setItem(SAVED_PLACES_KEY, JSON.stringify(places)); }
  catch { throw new Error('Unable to save this place.'); }
  return places;
}
function readForWrite(storage) {
  try { return getSavedPlaces(storage); }
  catch { throw new Error('Unable to save this place.'); }
}
export function addSavedPlace(place, storage) {
  const places = readForWrite(storage);
  if (places.length >= MAX_SAVED_PLACES) throw new Error('You can save up to 10 places.');
  return persist([...places, normalize(place, globalThis.crypto.randomUUID())], storage);
}
export function updateSavedPlace(id, place, storage) {
  const places = readForWrite(storage);
  if (!places.some(item => item.id === id)) throw new Error('This saved place is no longer available.');
  return persist(places.map(item => item.id === id ? normalize(place, id) : item), storage);
}
export function deleteSavedPlace(id, storage) {
  return persist(readForWrite(storage).filter(place => place.id !== id), storage);
}
