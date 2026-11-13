import { isInsideNepal } from '../../frontend/src/utils/nepal.js';

export async function searchNepalAddress(query, { apiKey = process.env.OPENROUTESERVICE_API_KEY, fetchImpl = fetch } = {}) {
  if (typeof query !== 'string' || query.trim().length < 3 || query.length > 300) {
    const error = new Error('Enter an address of 3 to 300 characters.'); error.status = 422; throw error;
  }
  if (!apiKey) throw new Error('Address search is temporarily unavailable.');
  // Search on explicit submission, not on every keystroke. Bias toward Nepal,
  // then validate every candidate against the same polygon used by live GPS.
  const url = new URL('https://api.openrouteservice.org/geocode/search');
  url.search = new URLSearchParams({ text: query.trim(), size: '5', 'focus.point.lat': '27.7172', 'focus.point.lon': '85.3240' });
  const response = await fetchImpl(url.toString(), { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Address search is temporarily unavailable.');
  const data = await response.json();
  if (!Array.isArray(data.features)) throw new Error('Address search is temporarily unavailable.');
  const candidates = data.features.filter(feature => feature.geometry?.type === 'Point'
    && typeof feature.properties?.label === 'string').map(feature => ({
      displayName: feature.properties.label.slice(0, 500), latitude: feature.geometry.coordinates?.[1], longitude: feature.geometry.coordinates?.[0],
    }));
  const results = candidates.filter(item => isInsideNepal(item.latitude, item.longitude));
  if (!results.length) {
    const error = new Error(candidates.length ? 'Please select an address within Nepal.' : 'We could not find that address.');
    error.status = candidates.length ? 400 : 404; throw error;
  }
  return results;
}
