import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateJourneyDistance, calculateEstimatedTravelTime, formatEstimatedTimeRange, estimateWalkingTime, formatWalkingTime, calculateTotalJourneyTime } from './travelTime.js';
import { findJourney } from './findJourney.js';

const stops = { a: { latitude: 0, longitude: 0 }, b: { latitude: 0, longitude: 1 },
  c: { latitude: 0, longitude: 2 }, d: { latitude: 0, longitude: 3 }, e: { latitude: 0, longitude: 4 } };
const journey = (...legs) => ({ legs: legs.map(ids => ({ stops: ids })) });

test('sums every consecutive connection, including repeated traversal, without a duplicate transfer edge', () => {
  const direct = calculateJourneyDistance(journey(['a','b','c']), stops);
  assert.ok(Math.abs(direct - 222.38985) < 0.001);
  assert.equal(calculateJourneyDistance(journey(['a','b'], ['b','c']), stops), direct);
  assert.equal(calculateJourneyDistance(journey(['a','b','a']), stops), direct);
});

test('applies configurable speed, intermediate-stop delay, and each transfer allowance', () => {
  const result = calculateEstimatedTravelTime(journey(['a','b','c'], ['c','d','e']), stops,
    { averageBusSpeedKmh: 60, stopDelaySeconds: 30, transferTimeMinutes: 5 });
  assert.equal(result.intermediateStopCount, 2);
  assert.equal(result.transferCount, 1);
  assert.equal(result.stopMinutes, 1);
  assert.equal(result.transferMinutes, 5);
  assert.equal(result.estimatedMinutes, result.distanceKm + 6);
  const multiple = calculateEstimatedTravelTime(journey(['a','b'], ['b','c'], ['c','d']), stops);
  assert.equal(multiple.transferMinutes, 10);
  assert.equal(multiple.stopMinutes, 0);
});

test('incomplete coordinates and invalid assumptions do not produce misleading estimates', () => {
  for (const result of [null, {type:'message'}, journey([]), journey(['a','missing'])]) {
    assert.equal(calculateEstimatedTravelTime(result, stops), null);
  }
  assert.equal(calculateJourneyDistance(journey(['a','b']), { ...stops, b: {latitude:null,longitude:1} }), null);
  for (const speed of [0, -1, NaN, Infinity]) {
    assert.equal(calculateEstimatedTravelTime(journey(['a','b']), stops,
      {averageBusSpeedKmh:speed,stopDelaySeconds:30,transferTimeMinutes:5}), null);
  }
});

test('formats coarse estimate ranges without false precision', () => {
  assert.equal(formatEstimatedTimeRange(34), 'Approx. 30\u201340 min');
  assert.equal(formatEstimatedTimeRange(40), 'Approx. 35\u201345 min');
  assert.equal(formatEstimatedTimeRange(2), 'Approx. 1\u20135 min');
  assert.equal(formatEstimatedTimeRange(NaN), 'Estimate unavailable');
});

test('active V4 journeys produce estimates using the development assumptions', () => {
  for (const [from, to] of [['thankot','airport'], ['kapan','balaju'], ['baadbhanjyan(thankot)','petrol_pump-panipokhari']]) {
    const route = findJourney(from, to);
    const estimate = calculateEstimatedTravelTime(route);
    assert.ok(estimate.distanceKm > 0);
    assert.equal(estimate.drivingMinutes, estimate.distanceKm / 18 * 60);
    assert.equal(estimate.transferMinutes, (route.legs.length - 1) * 5);
  }
});


test('walking uses geographic distance and configurable speed, with sub-minute formatting', () => {
  const walking = estimateWalkingTime({latitude:0,longitude:0}, {id:'a', latitude:0,longitude:0.003777});
  assert.ok(Math.abs(walking.distanceMetres - 420) < 1);
  assert.equal(formatWalkingTime(walking.walkingMinutes), '~5 min walk');
  assert.equal(formatWalkingTime(0), '< 1 min walk');
  assert.equal(formatWalkingTime(0.9), '< 1 min walk');
  assert.equal(estimateWalkingTime(null, stops.a), null);
  assert.equal(estimateWalkingTime(stops.a, {latitude:null,longitude:0}), null);
  assert.equal(estimateWalkingTime(stops.a, stops.b, {averageWalkingSpeedKmh:0}), null);
  const faster = estimateWalkingTime(stops.a, stops.b, {averageWalkingSpeedKmh:9.6});
  assert.equal(faster.walkingMinutes, estimateWalkingTime(stops.a, stops.b).walkingMinutes / 2);
});

test('combined total includes walking exactly once, and bus breakdown excludes transfers', () => {
  const route = journey(['a','b'], ['b','c']);
  const busOnly = calculateTotalJourneyTime(route, null, stops);
  const total = calculateTotalJourneyTime(route, {stopId:'a', walkingMinutes:5}, stops);
  assert.equal(total.estimatedMinutes, busOnly.estimatedMinutes + 5);
  assert.equal(total.estimatedMinutes, total.walkingMinutes + total.busMinutes + total.transferMinutes);
  assert.equal(calculateTotalJourneyTime(route, {stopId:'b', walkingMinutes:5}, stops), null);
});
