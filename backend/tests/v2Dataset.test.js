import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions, inspectRows, inspectV2, parseCsv } from '../utils/v2Dataset.js';
import Stop from '../models/Stop.js';

const provenance = { verification_status: ' osm_only;uncertain ', source: 'Original + OSM', source_url: 'https://example.org/source', verified_date: '' };
const fixture = () => ({
  routes: [{ route_id: 'R1', route_name: 'Route', operator: '', notes: '', ...provenance }],
  stops: [{ stop_id: 'S1', stop_name: '', latitude: '', longitude: '', coordinate_status: 'pending', ...provenance }],
  route_stops: [{ route_id: 'R1', stop_id: 'S1', stop_order: '1', ...provenance }],
});

test('actual V2 dataset matches supplied counts and has no blocking errors', async () => {
  const { data, report } = await inspectV2();
  assert.deepEqual(report.counts, { routes: 11, stops: 172, route_stops: 177 });
  assert.deepEqual(report.errors, []);
  assert.equal(report.metrics.unnamed_stops, 17);
  assert.equal(report.metrics.stops_missing_coordinates, 80);
  assert.equal(report.nearDuplicateNames.length, 1);
  assert.equal(data.stops.filter(stop => stop.latitude === null).length, 80);
});

test('missing names and coordinates remain blank/null and provenance stays exact', async () => {
  const { data, report } = inspectRows(fixture());
  assert.deepEqual(report.errors, []);
  assert.equal(data.stops[0].stop_name, '');
  assert.equal(data.stops[0].latitude, null);
  assert.equal(data.stops[0].longitude, null);
  const document = new Stop(data.stops[0]);
  await document.validate();
  for (const [field, value] of Object.entries(provenance)) assert.equal(document[field], value);
});

test('CSV retains quoted commas, newlines, escaped quotes and whitespace', () => {
  assert.deepEqual(parseCsv('\uFEFFname,status\r\n"Stop, ""A""\nB"," osm_only "\r\n', ['name', 'status'], 'test.csv'), [{ name: 'Stop, "A"\nB', status: ' osm_only ' }]);
  assert.throws(() => parseCsv('name,status\n"unclosed', ['name', 'status'], 'test.csv'), /malformed CSV/);
  assert.throws(() => parseCsv('name,status,extra\na,b,c', ['name', 'status'], 'test.csv'), /Unknown columns/);
  assert.throws(() => parseCsv('name,name\na,b', ['name', 'status'], 'test.csv'), /expected exactly/);
});

test('rejects numeric junk, infinity, out-of-range coordinates and invalid orders', () => {
  for (const [field, values] of [['latitude', ['NaN', 'Infinity', '0x20', '27north', '91']], ['longitude', ['181', '-181']], ['stop_order', ['', '0', '-1', '1.5', '9007199254740992']]]) {
    for (const value of values) {
      const input = fixture();
      input[field === 'stop_order' ? 'route_stops' : 'stops'][0][field] = value;
      assert.ok(inspectRows(input).report.errors.some(error => error.includes(field)), `${field}=${value}`);
    }
  }
});

test('rejects missing required fields, duplicate keys and dangling references', () => {
  for (const { name, required } of definitions) {
    for (const field of required) {
      const input = fixture(); input[name][0][field] = '';
      assert.ok(inspectRows(input).report.errors.some(error => error.includes(`missing required ${field}`)));
    }
    const input = fixture(); input[name].push({ ...input[name][0] });
    assert.ok(inspectRows(input).report.errors.some(error => error.includes('duplicate')));
  }
  const input = fixture(); input.route_stops[0].route_id = 'unknown'; input.route_stops[0].stop_id = 'unknown';
  const errors = inspectRows(input).report.errors;
  assert.ok(errors.some(error => error.includes('missing route')));
  assert.ok(errors.some(error => error.includes('missing stop')));
});

test('gaps and near-name candidates warn without changing or merging rows', () => {
  const input = fixture();
  input.stops[0].stop_name = 'bustop';
  input.stops.push({ ...input.stops[0], stop_id: 'S2', stop_name: 'Bus Stop' });
  input.route_stops.push({ ...input.route_stops[0], stop_order: '3' });
  const { data, report } = inspectRows(input);
  assert.deepEqual(report.errors, []);
  assert.equal(data.stops.length, 2);
  assert.equal(data.route_stops[1].stop_order, 3);
  assert.ok(report.warnings.some(warning => warning.includes('gaps')));
  assert.equal(report.nearDuplicateNames.length, 1);
});
