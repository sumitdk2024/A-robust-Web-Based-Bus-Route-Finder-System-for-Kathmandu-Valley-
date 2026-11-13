import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineDistance, hasValidCoordinates, findNearestStops, formatDistance } from './distance.js';

test('Haversine returns metres, zero for identical points, and symmetric distances', () => {
  assert.equal(haversineDistance(27.7, 85.3, 27.7, 85.3), 0);
  assert.ok(Math.abs(haversineDistance(0, 0, 0, 1) - 111194.93) < 0.1);
  assert.equal(haversineDistance(27.7, 85.3, 27.8, 85.4), haversineDistance(27.8, 85.4, 27.7, 85.3));
  assert.ok(Number.isFinite(haversineDistance(0, 0, 0, 180)));
});

test('invalid, missing, and out-of-range coordinates are excluded; zero is valid', () => {
  for (const [lat, lon] of [[null, 85], ['', 85], ['27', 85], [NaN, 85], [91, 85], [27, 181], [27, Infinity], [undefined, 85]]) {
    assert.equal(hasValidCoordinates(lat, lon), false);
    assert.ok(Number.isNaN(haversineDistance(0, 0, lat, lon)));
  }
  assert.equal(hasValidCoordinates(0, 0), true);
  assert.deepEqual(findNearestStops([{ latitude: null, longitude: 85 }], 27, 85), []);
});

test('ranks all usable stops and returns the closest three without mutating input', () => {
  const stops = [4, 2, 1, 3].map(id => ({ id, latitude: 0, longitude: id / 100 }));
  stops.push({ id: 5, latitude: null, longitude: 0 });
  assert.deepEqual(findNearestStops(stops, 0, 0).map(stop => stop.id), [1, 2, 3]);
  assert.deepEqual(stops.map(stop => stop.id), [4, 2, 1, 3, 5]);
  assert.equal(findNearestStops(stops.slice(0, 1), 0, 0).length, 1);
  assert.deepEqual(findNearestStops(stops, NaN, 0), []);
  assert.equal(formatDistance(280.3), '280 m');
  assert.equal(formatDistance(1250), '1.3 km');
});
