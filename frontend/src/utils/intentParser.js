import { networkStops, stopsById } from '../data/network.js';

export function normalizeJourneyText(text) {
  return String(text ?? '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
const normalize = normalizeJourneyText;
const stopAliases = { airport: 'airport', 'the airport': 'airport', boudha: 'bouddha_stupa',
  bouddha: 'bouddha_stupa', boudhanath: 'bouddha_stupa', gongabu: 'gongabu_chowk' };
const candidate = (id, type, name) => ({ id, type, name });

export function matchIntentPlace(text) {
  const raw = String(text ?? '').trim().toLocaleLowerCase();
  const name = normalize(raw).replace(/^(?:the|a)\s+/, '');
  if (!name) return [];
  const asStop = stop => candidate(stop.id, 'stop', stop.name);
  // Preserve exact IDs/names before normalization can merge similar records.
  const exactStops = networkStops.filter(stop => stop.stop_name.toLocaleLowerCase() === raw || stop.stop_id.toLocaleLowerCase() === raw);
  if (exactStops.length) return exactStops.map(asStop);
  const normalizedStops = networkStops.filter(stop => normalize(stop.stop_name) === name || normalize(stop.stop_id) === name);
  if (normalizedStops.length) return normalizedStops.map(asStop);

  if (Object.hasOwn(stopAliases, name) && stopsById[stopAliases[name]]) return [asStop(stopsById[stopAliases[name]])];
  const records = networkStops.map(asStop);
  // Whole-name boundaries keep multiword names together; prefer the longest name.
  const contained = records.filter(item => (` ${name} `).includes(` ${normalize(item.name)} `));
  if (contained.length) {
    const longest = Math.max(...contained.map(item => normalize(item.name).length));
    return contained.filter(item => normalize(item.name).length === longest).slice(0, 8);
  }
  return records.filter(item => normalize(item.name).includes(name) || normalize(item.id).includes(name)).slice(0, 8);
}

export function extractJourneyTexts(clause) {
  const from = /\bfrom\s+/.exec(clause);
  if (from) {
    const following = clause.slice(from.index + from[0].length);
    const to = /\bto\s+/.exec(following);
    if (to) return { originText: following.slice(0, to.index).trim(),
      destinationText: following.slice(to.index + to[0].length).split(/\s+(?:with|and)\b/)[0].trim() };
    // Reverse order: "take me to X from Y". Ignore earlier infinitive "to"s.
    const before = clause.slice(0, from.index);
    const delimiters = [...before.matchAll(/\b(?:to|visit)\s+/g)];
    const last = delimiters.at(-1);
    return { originText: following.split(/\s+(?:with|and)\b/)[0].trim(),
      destinationText: last ? before.slice(last.index + last[0].length).trim() : undefined };
  }
  // Bare "Kapan to Thankot", or destination-only/current-location sentences.
  const delimiters = [...clause.matchAll(/\b(?:to|visit)\s+/g)];
  const last = delimiters.at(-1);
  if (!last) return {};
  const before = clause.slice(0, last.index).trim();
  const bareOrigin = delimiters.length === 1 && matchIntentPlace(before).length ? before : undefined;
  return { originText: bareOrigin,
    destinationText: clause.slice(last.index + last[0].length).split(/\s+(?:with|and)\b/)[0].trim() };
}

export function parseJourneyIntentLocal(message, { onDebug } = {}) {
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
    return { origin: null, destination: null, destinationType: 'stop', useCurrentLocation: false,
      suggestions: {}, error: 'Enter a journey request of up to 2,000 characters.' };
  }
  const text = normalize(message);
  const useCurrentLocation = /near me|my (?:current )?location|current location|i (?:am|m) near/i.test(text);
  const clause = text.replace(/\b(?:want|would like)\s+to\s+visit\s+/gi, 'visit ').replace(/[?.!]+$/, '');
  const { originText, destinationText } = extractJourneyTexts(clause);
  const origins = originText ? matchIntentPlace(originText) : [];
  const destinations = destinationText ? matchIntentPlace(destinationText) : [];
  const intent = { origin: !useCurrentLocation && origins.length === 1 ? origins[0].id : null,
    destination: destinations.length === 1 ? destinations[0].id : null,
    destinationType: destinations.length === 1 ? destinations[0].type : 'stop',
    useCurrentLocation, suggestions: {}, source: 'local' };
  if (origins.length > 1 && !useCurrentLocation) intent.suggestions.origin = origins;
  if (destinations.length > 1) intent.suggestions.destination = destinations;
  if (originText && !origins.length && !useCurrentLocation) intent.originUnrecognized = true;
  if (useCurrentLocation) intent.locationHint = text.match(/\bnear\s+(.+?)(?=\s+and\b|$)/i)?.[1] || null;
  onDebug?.({ rawQuery: message, normalizedQuery: text, originText, destinationText,
    originCandidates: origins, destinationCandidates: destinations,
    selectedOrigin: intent.origin, selectedDestination: intent.destination });
  return intent;
}

// External interpretations cross the same dataset boundary as local ones.
// Discard all provider fields that could contain routes, times, or operators.
export function validateJourneyIntent(value) {
  if (!value || typeof value !== 'object'
    || typeof value.useCurrentLocation !== 'boolean' || value.destinationType !== 'stop') return null;
  if (value.origin !== null && (typeof value.origin !== 'string' || !Object.hasOwn(stopsById, value.origin))) return null;
  const destinations = networkStops;
  if (value.destination !== null && (typeof value.destination !== 'string' || !destinations.some(item => item.id === value.destination))) return null;
  return { origin: value.useCurrentLocation ? null : value.origin, destination: value.destination,
    destinationType: value.destinationType, useCurrentLocation: value.useCurrentLocation,
    suggestions: {}, source: 'backend' };
}
