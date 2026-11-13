import { estimateWalkingTime } from '../utils/travelTime.js';
import { hasValidCoordinates } from '../utils/distance.js';

export const WALKING_UNAVAILABLE_MESSAGE = 'Walking directions are temporarily unavailable. An approximate distance is shown instead.';
export const NO_NEARBY_MESSAGE = 'No supported bus stop was found near your current location.';
// Country eligibility and dataset coverage are separate checks. Never offer a
// walk across Nepal to a Kathmandu stop outside this local coverage radius.
export const MAX_NEARBY_DISTANCE_METRES = 10000;

export async function fetchWalkingRoute(location, stop, { signal, fetchImpl = fetch, direction = 'to-stop' } = {}) {
  try {
    const response = await fetchImpl('/api/walking-route', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(direction === 'from-stop'
        ? { start: { lat: stop.latitude, lon: stop.longitude }, end: { lat: location.latitude, lon: location.longitude } }
        : { start: { lat: location.latitude, lon: location.longitude }, end: { lat: stop.latitude, lon: stop.longitude } }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Walking route unavailable');
    const route = await response.json();
    if (route.geometry?.type !== 'LineString' || route.geometry.coordinates?.length < 2
      || !route.geometry.coordinates.every(point => Array.isArray(point) && hasValidCoordinates(point[1], point[0]))
      || !Number.isFinite(route.distanceMetres) || route.distanceMetres < 0
      || !Number.isFinite(route.durationSeconds) || route.durationSeconds < 0) throw new Error('Invalid walking route');
    return { stopId: stop.id, stopName: stop.name, source: 'pedestrian',
      distanceMetres: route.distanceMetres, walkingMinutes: route.durationSeconds / 60,
      geometry: route.geometry, attribution: 'openrouteservice / OpenStreetMap contributors' };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { ...estimateWalkingTime(location, stop), source: 'approximate', geometry: null };
  }
}

export async function routeNearbyStops(location, candidates, options) {
  const stops = await Promise.all(candidates.map(async stop => ({ ...stop,
    walking: await fetchWalkingRoute(location, stop, options) })));
  return stops.sort((a, b) => a.walking.walkingMinutes - b.walking.walkingMinutes || a.id.localeCompare(b.id));
}
