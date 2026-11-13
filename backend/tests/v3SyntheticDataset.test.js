import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCsv } from '../utils/v2Dataset.js';
import { definitions, readSyntheticDataset, validateSyntheticDataset, databaseName } from '../utils/v3SyntheticDataset.js';
import { importSyntheticData } from '../scripts/importV3SyntheticData.js';

async function rawData() {
  return Object.fromEntries(await Promise.all(definitions.map(async ({ name, columns }) => [name, parseCsv(await readFile(new URL(`../../data/master_dataset/v3_synthetic/${name}.csv`, import.meta.url), 'utf8'), columns, name)])));
}

test('complete synthetic dataset validates and preserves all source text fields', async () => {
  const raw = await rawData();
  const { data, report } = await readSyntheticDataset();
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.counts, { routes: 24, stops: 50, route_stops: 202 });
  for (const { name, columns } of definitions) {
    data[name].forEach((row, i) => {
      for (const column of columns) {
        if (['latitude', 'longitude', 'stop_order'].includes(column)) assert.equal(row[column], Number(raw[name][i][column]));
        else assert.equal(row[column], raw[name][i][column]);
      }
      assert.equal(row.dataset_version, 'v3_synthetic');
      assert.equal(row.dataset_status, 'synthetic_demo_only');
    });
  }
});

test('mixed verification status, duplicate position, missing references and bad coordinates are rejected', async () => {
  const raw = await rawData();
  raw.routes[0].verification_status = 'verified';
  raw.stops[0].latitude = 'NaN';
  raw.route_stops.push({ ...raw.route_stops[0], stop_id: 'MISSING' });
  const { report } = validateSyntheticDataset(raw);
  for (const pattern of [/verification_status/, /invalid number/, /duplicate key/, /Unknown stop/]) assert.ok(report.errors.some(error => pattern.test(error)));
});

test('fractional orders, sequence gaps, name and endpoint mismatches are rejected', async () => {
  const raw = await rawData();
  raw.route_stops[0].stop_order = '1.5';
  raw.route_stops[1].stop_name = 'Different name';
  raw.routes[0].end_stop = 'Different endpoint';
  const { report } = validateSyntheticDataset(raw);
  for (const pattern of [/positive integer/, /contiguous/, /name mismatch/, /endpoint names/]) assert.ok(report.errors.some(error => pattern.test(error)));
});

test('unknown CSV columns are rejected rather than silently discarded', () => {
  assert.throws(() => parseCsv('route_id,extra\nSYN01,value\n', ['route_id'], 'routes'), /Unknown columns/);
});

test('default import is offline even with an invalid MongoDB URI', async () => {
  const report = await importSyntheticData({ uri: 'invalid-uri' });
  assert.equal(report.database, databaseName);
  assert.deepEqual(report.errors, []);
});

test('write requires the dedicated URI instead of falling back to application configuration', async () => {
  await assert.rejects(importSyntheticData({ write: true, uri: '' }), /SYNTHETIC_MONGODB_URI/);
});
