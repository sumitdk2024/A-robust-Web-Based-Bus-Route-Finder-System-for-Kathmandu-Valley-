import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { mainDataset } from '../services/mainDataset.js';
import { loadMainDataset } from '../../frontend/scripts/loadMainDataset.js';

test('current transport endpoints serve only the main CSV dataset and ordered directional routes', async () => {
  assert.deepEqual(mainDataset, loadMainDataset());
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  try {
    for (const [endpoint, rows] of [['routes', mainDataset.routes], ['stops', mainDataset.stops], ['route-stops', mainDataset.route_stops]]) {
      const response = await fetch(`${base}/${endpoint}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), rows);
    }
    const route = mainDataset.routes[0];
    const response = await fetch(`${base}/routes/${encodeURIComponent(route.route_id)}/stops`);
    assert.equal(response.status, 200);
    const sequence = await response.json();
    assert.deepEqual(sequence.route, route);
    assert.deepEqual(sequence.stops.map(row => row.stop_id), mainDataset.route_stops
      .filter(row => row.route_id === route.route_id).sort((a, b) => a.stop_order - b.stop_order).map(row => row.stop_id));
    for (const row of sequence.stops) assert.deepEqual(row.stop, mainDataset.stops.find(stop => stop.stop_id === row.stop_id));
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
