import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { once } from 'node:events';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import RouteStop from '../models/RouteStop.js';
import { inspectV2 } from '../utils/v2Dataset.js';

const exec = promisify(execFile);
const backend = fileURLToPath(new URL('../', import.meta.url));
const workspace = fileURLToPath(new URL('../../../', import.meta.url));

test('real MongoDB: import twice, preserve metadata, start server and exercise every endpoint', { timeout: 240000 }, async () => {
  // Always use a new disposable database. Never use or reset the user's MONGO_URI.
  const database = await MongoMemoryServer.create({ instance: { dbName: 'routefinder_v2_test' } });
  const uri = database.getUri();
  let server;
  try {
    const importer = fileURLToPath(new URL('../scripts/importV2Data.js', import.meta.url));
    const runImport = () => exec(process.execPath, [importer], { cwd: workspace, env: { ...process.env, MONGO_URI: uri }, windowsHide: true, timeout: 60000 });
    const first = await runImport();
    assert.match(first.stdout, /Routes imported\/updated: 11 \(inserted=11/);
    assert.match(first.stdout, /Stops imported\/updated: 172 \(inserted=172/);
    assert.match(first.stdout, /Route-stop records imported\/updated: 177 \(inserted=177/);
    const second = await runImport();
    assert.match(second.stdout, /Routes imported\/updated: 0 \(inserted=0, updated=0, unchanged=11/);
    assert.match(second.stdout, /Stops imported\/updated: 0 \(inserted=0, updated=0, unchanged=172/);
    assert.match(second.stdout, /Route-stop records imported\/updated: 0 \(inserted=0, updated=0, unchanged=177/);
    await mongoose.connect(uri);
    assert.equal(await Route.countDocuments(), 11);
    assert.equal(await Stop.countDocuments(), 172);
    assert.equal(await RouteStop.countDocuments(), 177);

    // Check update semantics and preservation of unrelated existing records.
    await Stop.updateOne({ stop_id: 'V2S001' }, { $set: { latitude: 27.7, longitude: 85.3, verification_status: 'incorrect-test-value' } });
    await Route.create({ route_id: 'LEGACY_TEST', route_name: 'Unrelated existing record' });
    await runImport();
    assert.equal((await Stop.findOne({ stop_id: 'V2S001' })).latitude, null);
    assert.ok(await Route.exists({ route_id: 'LEGACY_TEST' }));
    const { data } = await inspectV2();
    for (const [name, model, keys] of [['routes', Route, ['route_id']], ['stops', Stop, ['stop_id']], ['route_stops', RouteStop, ['route_id', 'stop_order']]]) {
      const documents = await model.find().lean();
      for (const row of data[name]) {
        const document = documents.find(item => keys.every(key => item[key] === row[key]));
        for (const [field, value] of Object.entries(row)) assert.deepEqual(document[field], value, `${name}.${field}`);
      }
    }
    await assert.rejects(RouteStop.create({ route_id: 'SY01', stop_id: 'V2S001', stop_order: 1 }), error => error.code === 11000);

    const probe = createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
    const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
    server = spawn(process.execPath, ['server.js'], { cwd: backend, env: { ...process.env, MONGO_URI: uri, PORT: String(port) }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server did not start within 15 seconds.')), 15000);
      server.stdout.on('data', chunk => {
        if (chunk.toString().includes('API is running at')) { clearTimeout(timer); resolve(); }
      });
      server.once('error', error => { clearTimeout(timer); reject(error); });
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited early (${code}).`)); });
    });
    const get = async path => {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(response.status, 200, path);
      return response.json();
    };
    assert.deepEqual(await get('/'), { message: 'Kathmandu Bus Route Finder API is running' });
    assert.equal((await get('/api/routes')).length, 12); // Includes the preserved legacy record.
    const apiStops = await get('/api/stops');
    assert.equal(apiStops.length, 172);
    assert.equal(apiStops.filter(stop => stop.latitude === null).length, 80);
    assert.equal(apiStops.filter(stop => stop.stop_name === '').length, 17);
    assert.equal((await get('/api/route-stops')).length, 177);
    assert.equal((await get('/api/routes/SY01')).route_id, 'SY01');
    assert.equal((await get('/api/stops/V2S001')).latitude, null);
    const sequence = await get('/api/routes/SY01/stops');
    const expected = data.route_stops.filter(row => row.route_id === 'SY01').sort((a, b) => a.stop_order - b.stop_order);
    assert.deepEqual(sequence.stops.map(link => link.stop_id), expected.map(link => link.stop_id));
    for (const [i, link] of sequence.stops.entries()) {
      assert.equal(link.stop_order, expected[i].stop_order);
      assert.equal(link.stop.stop_id, link.stop_id);
      for (const field of ['verification_status', 'source', 'source_url', 'verified_date']) {
        assert.equal(link[field], expected[i][field]);
        assert.equal(link.stop[field], data.stops.find(stop => stop.stop_id === link.stop_id)[field]);
      }
    }
    for (const path of ['/api/routes/DOES_NOT_EXIST', '/api/stops/DOES_NOT_EXIST', '/api/routes/DOES_NOT_EXIST/stops', '/unknown']) assert.equal((await fetch(`http://127.0.0.1:${port}${path}`)).status, 404);
    console.log('Verified real MongoDB connection, V2 imports and retries, all GET endpoints, ordered joins, null coordinates, blank names, and every source field.');
  } finally {
    if (server && server.exitCode === null) { const exited = once(server, 'exit'); server.kill(); await exited; }
    await mongoose.disconnect();
    await database.stop();
  }
});
