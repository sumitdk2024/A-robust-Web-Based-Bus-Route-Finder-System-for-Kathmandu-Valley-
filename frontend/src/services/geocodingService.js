import { isInsideNepal } from '../utils/nepal.js';

export async function searchAddress(query, { signal, fetchImpl = fetch } = {}) {
  let response;
  try { response = await fetchImpl('/api/geocode', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query.trim() }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
  }); } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Address search is temporarily unavailable. Please try again.');
  }
  if (!response.ok) {
    const message = response.status === 400 ? 'This address is outside the supported area. Please enter an address in Nepal.'
      : response.status === 404 ? 'We could not find that address.' : 'Address search is temporarily unavailable. Please try again.';
    throw new Error(message);
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Address search is temporarily unavailable. Please try again.'); }
  const results = Array.isArray(data.results) ? data.results : [];
  const valid = results.filter(item => typeof item.displayName === 'string' && isInsideNepal(item.latitude, item.longitude));
  if (!valid.length) throw new Error(results.length ? 'Please select an address within Nepal.' : 'We could not find that address.');
  return valid;
}
