import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadDataset, parseRows } from './importCsvData.js';
import Stop from '../models/Stop.js';
import RouteStop from '../models/RouteStop.js';

const stops = { file: 'stops.csv', model: Stop, columns: ['stop_id', 'stop_name', 'latitude', 'longitude'], keys: ['stop_id'], numbers: ['latitude', 'longitude'] };
const header = 'stop_id,stop_name,latitude,longitude\n';

test('CSV handles BOM, CRLF, quoted commas and escaped quotes', async () => {
  const rows = await parseRows('\uFEFF' + header + 'S1,"Stop, ""A""",27.7,85.3\r\n', stops);
  assert.deepEqual(rows, [{ stop_id: 'S1', stop_name: 'Stop, "A"', latitude: 27.7, longitude: 85.3 }]);
});

test('rejects blank, nonfinite, malformed and out-of-range coordinates', async () => {
  for (const value of ['', 'NaN', 'Infinity', '27north', '0x12', '91']) {
    await assert.rejects(parseRows(header + `S1,Stop,${value},85.3`, stops), /invalid|finite number/);
  }
});

test('rejects missing columns, required strings and duplicate identifiers', async () => {
  await assert.rejects(parseRows('stop_id,latitude\nS1,27', stops), /expected columns/);
  await assert.rejects(parseRows(header + 'S1,,27,85', stops), /stop_name/);
  await assert.rejects(parseRows(header + 'S1,A,27,85\nS1,B,28,86', stops), /duplicate key/);
});

test('route positions must be positive integers and unique per route', async () => {
  const definition = { file: 'route_stops.csv', model: RouteStop, columns: ['route_id', 'stop_id', 'stop_order'], keys: ['route_id', 'stop_order'], numbers: ['stop_order'] };
  const head = 'route_id,stop_id,stop_order\n';
  for (const value of ['0', '-1', '1.5']) await assert.rejects(parseRows(head + `R1,S1,${value}`, definition), /stop_order/);
  await assert.rejects(parseRows(head + 'R1,S1,1\nR1,S2,1', definition), /duplicate key/);
  assert.equal((await parseRows(head + 'R1,S1,1\nR1,S1,2', definition)).length, 2);
});

test('loads three files and rejects dangling references before database writes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'routefinder-test-'));
  try {
    await assert.rejects(loadDataset(directory), /Missing CSV file/);
    await writeFile(join(directory, 'routes.csv'), 'route_id,route_name,status\nR1,Route,partial');
    await writeFile(join(directory, 'stops.csv'), header + 'S1,Stop,27,85');
    await writeFile(join(directory, 'route_stops.csv'), 'route_id,stop_id,stop_order\nR1,S1,1');
    assert.equal((await loadDataset(directory)).length, 3);
    await writeFile(join(directory, 'route_stops.csv'), 'route_id,stop_id,stop_order\nR1,S9,1');
    await assert.rejects(loadDataset(directory), /missing from the Version 1/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
