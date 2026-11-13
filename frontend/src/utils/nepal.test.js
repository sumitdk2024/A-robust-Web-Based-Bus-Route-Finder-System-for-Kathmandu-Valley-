import test from 'node:test';
import assert from 'node:assert/strict';
import { isInsideNepal } from './nepal.js';
import { networkStops } from '../data/network.js';
import boundary from '../data/nepalBoundary.json' with { type: 'json' };

test('Nepal polygon admits Kathmandu and other Nepal cities, and rejects Denmark and India', () => {
  for (const point of [[27.7172,85.324],[28.2096,83.9856],[26.7288,85.9263]]) assert.equal(isInsideNepal(...point),true);
  // Gorakhpur is inside a Nepal bounding rectangle but outside the polygon.
  for (const point of [[55.6761,12.5683],[26.7606,83.3732],[28.6139,77.209],[NaN,85],[85,27],['27.7',85]]) assert.equal(isInsideNepal(...point),false);
  const [lon,lat] = boundary.geometry.coordinates[0][0];
  assert.equal(isInsideNepal(lat,lon),true);
  assert.ok(networkStops.every(stop => isInsideNepal(stop.latitude,stop.longitude)));
});
