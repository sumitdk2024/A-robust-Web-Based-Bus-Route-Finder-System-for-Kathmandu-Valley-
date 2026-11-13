import { isInsideNepal } from '../../frontend/src/utils/nepal.js';

export async function getWalkingRoute(start, end, { apiKey = process.env.OPENROUTESERVICE_API_KEY, fetchImpl = fetch } = {}) {
  if (!start || !end || !isInsideNepal(start.lat, start.lon) || !isInsideNepal(end.lat, end.lon)) {
    const error = new Error('Walking routes require valid locations within Nepal.');
    error.status = 400;
    throw error;
  }
  if (!apiKey) throw new Error('Walking directions are temporarily unavailable.');
  const response = await fetchImpl('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
    method: 'POST', headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: [[start.lon, start.lat], [end.lon, end.lat]], instructions: false }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Walking directions are temporarily unavailable.');
  const feature = (await response.json()).features?.[0];
  const geometry = feature?.geometry;
  const summary = feature?.properties?.summary;
  if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2
    || geometry.coordinates.length > 50000
    || !geometry.coordinates.every(point => Array.isArray(point) && point.length >= 2
      && Number.isFinite(point[0]) && Math.abs(point[0]) <= 180
      && Number.isFinite(point[1]) && Math.abs(point[1]) <= 90)
    || !Number.isFinite(summary?.distance) || summary.distance < 0
    || !Number.isFinite(summary?.duration) || summary.duration < 0) throw new Error('Invalid walking directions.');
  return { geometry, distanceMetres: summary.distance, durationSeconds: summary.duration };
}
