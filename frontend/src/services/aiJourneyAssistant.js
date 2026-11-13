import { networkStops, stopsById } from '../data/network.js';
import { findJourney } from '../utils/findJourney.js';
import { findNearestStops } from '../utils/distance.js';
import { estimateWalkingTime, calculateTotalJourneyTime } from '../utils/travelTime.js';
import { parseJourneyIntentLocal, validateJourneyIntent } from '../utils/intentParser.js';
import { rankJourneyOptions } from '../utils/journeyRanking.js';
import { NEARBY_CANDIDATE_COUNT } from '../config/journeyRecommendation.js';
export { parseJourneyIntentLocal };

// Opt-in backend adapter only. A future provider/key belongs on the backend.
// Never send location coordinates to this parsing endpoint.
export async function parseJourneyIntentWithLLM(message, { backendEndpoint, fetchImpl = fetch } = {}) {
  if (!backendEndpoint || !/^\/api\/[a-z0-9/_-]+$/i.test(backendEndpoint)) throw new Error('A same-origin backend parsing endpoint is required.');
  const response = await fetchImpl(backendEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }), signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Assistant backend unavailable.');
  const intent = validateJourneyIntent(await response.json());
  if (!intent) throw new Error('Assistant returned unsupported intent.');
  return intent;
}

export async function parseJourneyIntent(message, options = {}) {
  const local = parseJourneyIntentLocal(message);
  if (!options.backendEndpoint || local.error) return local;
  try { return await parseJourneyIntentWithLLM(message, options); }
  catch { return { ...local, source: 'local_fallback' }; }
}

export function recommendJourney(intent, { location = null, onEvaluate, walkingByStop = {}, candidateStopIds = null } = {}) {
  if (!validateJourneyIntent(intent)) return { selected: null, options: [], evaluatedCount: 0,
    message: 'Please select a valid bus stop from the suggestions.', report: null };
  if (!intent.useCurrentLocation && intent.origin && intent.origin === intent.destination) {
    const validation = findJourney(intent.origin, intent.destination);
    if (!validation.legs) return { selected: null, options: [], message: validation.message };
  }
  const destinations = [{ stop: stopsById[intent.destination] }];
  const origins = intent.useCurrentLocation ? (location ? findNearestStops(networkStops, location.latitude, location.longitude, NEARBY_CANDIDATE_COUNT)
    .filter(stop => !candidateStopIds || candidateStopIds.includes(stop.id)) : [])
    : (stopsById[intent.origin] ? [stopsById[intent.origin]] : []);
  const candidates = [], rejected = [];
  for (const origin of origins) for (const target of destinations) {
    if (!target.stop) continue;
    const result = findJourney(origin.id, target.stop.id);
    if (!result.legs) { rejected.push({ origin: origin.id, destination: target.stop.id, reason: result.message }); continue; }
    const walking = intent.useCurrentLocation ? walkingByStop[origin.id] || estimateWalkingTime(location, origin) : null;
    if (intent.useCurrentLocation && !walking) continue;
    const estimate = calculateTotalJourneyTime(result, walking, stopsById);
    if (!estimate) continue;
    candidates.push({ origin, destination: target.stop, result, walking, estimate });
  }
  const ranked = rankJourneyOptions(candidates);
  const selected = ranked[0] || null;
  const report = { intent, evaluatedOrigins: origins.map(stop => stop.id), rejected,
    candidates: ranked.map(option => ({ origin: option.origin.id, destination: option.destination.id,
      transferCount: option.estimate.transferCount, stopCount: option.result.stopCount,
      walkingMinutes: option.estimate.walkingMinutes, busMinutes: option.estimate.busMinutes,
      transferMinutes: option.estimate.transferMinutes, estimatedTotalMinutes: option.estimate.estimatedMinutes })),
    selected: selected ? { origin: selected.origin.id, destination: selected.destination.id } : null };
  onEvaluate?.(report);
  return { selected, options: ranked, evaluatedCount: origins.length * destinations.length, report,
    message: !origins.length ? (intent.useCurrentLocation ? 'Use your current location to compare nearby starting stops.' : 'Please select your starting point or use your current location.')
      : 'No suitable route is available in the current project dataset.' };
}
