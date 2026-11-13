import { stopsById } from '../data/network.js';
import { haversineDistance, hasValidCoordinates } from './distance.js';
import { TRAVEL_TIME_CONFIG } from '../config/travelTime.js';

function hasJourney(journey) {
  return Boolean(journey?.legs?.length && journey.legs.every(leg =>
    Array.isArray(leg.stops) && leg.stops.length >= 2));
}

// Sum consecutive stop connections within each leg, in kilometres.
// Coordinates come from the active stops.csv snapshot. These are not road distances.
// Return null for incomplete coordinates instead of understating distance/time.
export function calculateJourneyDistance(journey, stops = stopsById) {
  if (!hasJourney(journey)) return null;
  let metres = 0;
  for (const leg of journey.legs) {
    for (let index = 0; index < leg.stops.length; index++) {
      const stop = stops[leg.stops[index]];
      if (!stop || !hasValidCoordinates(stop.latitude, stop.longitude)) return null;
      if (index === 0) continue;
      const previous = stops[leg.stops[index - 1]];
      metres += haversineDistance(previous.latitude, previous.longitude, stop.latitude, stop.longitude);
    }
  }
  return metres / 1000;
}

export function calculateEstimatedTravelTime(journey, stops = stopsById, config = TRAVEL_TIME_CONFIG) {
  const distanceKm = calculateJourneyDistance(journey, stops);
  const { averageBusSpeedKmh, stopDelaySeconds, transferTimeMinutes } = config;
  if (distanceKm === null || !Number.isFinite(averageBusSpeedKmh) || averageBusSpeedKmh <= 0
    || !Number.isFinite(stopDelaySeconds) || stopDelaySeconds < 0
    || !Number.isFinite(transferTimeMinutes) || transferTimeMinutes < 0) return null;
  // Transfer stops get the transfer allowance; only interior stops of a leg get stop delay.
  const intermediateStopCount = journey.legs.reduce((count, leg) => count + leg.stops.length - 2, 0);
  const transferCount = journey.legs.length - 1;
  const drivingMinutes = distanceKm / averageBusSpeedKmh * 60;
  const stopMinutes = intermediateStopCount * stopDelaySeconds / 60;
  const transferMinutes = transferCount * transferTimeMinutes;
  return { distanceKm, intermediateStopCount, transferCount, drivingMinutes, stopMinutes,
    transferMinutes, estimatedMinutes: drivingMinutes + stopMinutes + transferMinutes };
}

// A coarse display range, not a statistical confidence interval. No clock times.
export function formatEstimatedTimeRange(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return 'Estimate unavailable';
  const rounded = Math.round(minutes / 5) * 5;
  return `Approx. ${Math.max(1, rounded - 5)}\u2013${Math.max(5, rounded + 5)} min`;
}


export function estimateWalkingMinutes(distanceMetres, config = TRAVEL_TIME_CONFIG) {
  if (!Number.isFinite(distanceMetres) || distanceMetres < 0
    || !Number.isFinite(config.averageWalkingSpeedKmh) || config.averageWalkingSpeedKmh <= 0) return null;
  return distanceMetres / 1000 / config.averageWalkingSpeedKmh * 60;
}

// Geographic connection only; this does not find a pedestrian route.
export function estimateWalkingTime(location, stop, config = TRAVEL_TIME_CONFIG) {
  if (!location || !stop || !Number.isFinite(config.averageWalkingSpeedKmh)
    || config.averageWalkingSpeedKmh <= 0) return null;
  const distanceMetres = haversineDistance(location.latitude, location.longitude, stop.latitude, stop.longitude);
  if (!Number.isFinite(distanceMetres)) return null;
  return { stopId: stop.id ?? stop.stop_id, stopName: stop.name ?? stop.stop_name, distanceMetres,
    walkingMinutes: estimateWalkingMinutes(distanceMetres, config) };
}

export function formatWalkingTime(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return 'Walking estimate unavailable';
  return minutes < 1 ? '< 1 min walk' : `~${Math.round(minutes)} min walk`;
}

export function calculateTotalJourneyTime(journey, walking = null, stops = stopsById, config = TRAVEL_TIME_CONFIG) {
  const bus = calculateEstimatedTravelTime(journey, stops, config);
  if (!bus || (walking && (!Number.isFinite(walking.walkingMinutes) || walking.walkingMinutes < 0
    || walking.stopId !== journey.legs[0].stops[0]))) return null;
  const startingWalkingMinutes = walking?.walkingMinutes ?? 0;
  const walkingMinutes = startingWalkingMinutes;
  return { ...bus, busMinutes: bus.drivingMinutes + bus.stopMinutes, walkingMinutes, startingWalkingMinutes,
    estimatedMinutes: bus.estimatedMinutes + walkingMinutes };
}
