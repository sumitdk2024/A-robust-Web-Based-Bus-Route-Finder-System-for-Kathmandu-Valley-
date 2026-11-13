import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './v2Dataset.js';

export const dataset = 'v3_synthetic';
export const datasetStatus = 'synthetic_demo_only';
export const databaseName = 'kathmandu_v3_synthetic_demo_only';
export const directory = fileURLToPath(new URL('../../data/master_dataset/v3_synthetic/', import.meta.url));
export const definitions = [
  { name: 'routes', columns: ['route_id', 'route_name', 'start_stop', 'end_stop', 'operator', 'verification_status', 'source', 'notes', 'dataset_date'], keys: ['route_id'] },
  { name: 'stops', columns: ['stop_id', 'stop_name', 'latitude', 'longitude', 'coordinate_status', 'verification_status', 'source'], keys: ['stop_id'] },
  { name: 'route_stops', columns: ['route_id', 'stop_id', 'stop_order', 'stop_name', 'verification_status', 'source'], keys: ['route_id', 'stop_order'] },
];

export async function readSyntheticDataset() {
  const input = {};
  for (const { name, columns } of definitions) {
    input[name] = parseCsv(await readFile(new URL(`../../data/master_dataset/v3_synthetic/${name}.csv`, import.meta.url), 'utf8'), columns, `${name}.csv`);
  }
  return validateSyntheticDataset(input);
}

export function validateSyntheticDataset(input) {
  const data = {};
  const report = { dataset, dataset_status: datasetStatus, database: databaseName, counts: {}, verificationStatuses: {}, coordinateStatuses: {}, errors: [] };
  const fail = message => report.errors.push(message);
  for (const { name, columns, keys } of definitions) {
    data[name] = input[name].map(row => ({ ...row, dataset_version: dataset, dataset_status: datasetStatus }));
    report.counts[name] = data[name].length;
    report.verificationStatuses[name] = {};
    if (!data[name].length) fail(`${name}: empty dataset`);
    const seen = new Set();
    for (const [index, row] of data[name].entries()) {
      const location = `${name} row ${index + 1}`;
      for (const column of columns) {
        if (typeof row[column] !== 'string' || !row[column].trim()) fail(`${location}: missing ${column}`);
      }
      for (const key of ['route_id', 'stop_id']) {
        if (row[key] !== undefined && row[key] !== row[key].trim()) fail(`${location}: whitespace in ${key}`);
      }
      const status = row.verification_status;
      report.verificationStatuses[name][status] = (report.verificationStatuses[name][status] || 0) + 1;
      const expected = name === 'stops' ? 'real_place_name_with_demo_route_usage' : datasetStatus;
      if (status !== expected) fail(`${location}: unexpected verification_status; review rather than mix datasets`);
      for (const field of name === 'stops' ? ['latitude', 'longitude'] : name === 'route_stops' ? ['stop_order'] : []) {
        const raw = row[field];
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) || !Number.isFinite(Number(raw))) fail(`${location}: invalid number ${field}`);
        else row[field] = Number(raw);
      }
      if (name === 'stops') {
        if (Math.abs(row.latitude) > 90 || Math.abs(row.longitude) > 180) fail(`${location}: coordinates out of range`);
        report.coordinateStatuses[row.coordinate_status] = (report.coordinateStatuses[row.coordinate_status] || 0) + 1;
      }
      if (name === 'route_stops' && (!Number.isSafeInteger(row.stop_order) || row.stop_order < 1)) fail(`${location}: stop_order must be a positive integer`);
      if (name === 'routes') {
        if (!/^SYN\d+$/.test(row.route_id)) fail(`${location}: expected synthetic route ID`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dataset_date) || !Number.isFinite(Date.parse(row.dataset_date)) || new Date(row.dataset_date).toISOString().slice(0, 10) !== row.dataset_date) fail(`${location}: invalid dataset_date`);
      }
      const key = JSON.stringify(keys.map(field => row[field]));
      if (seen.has(key)) fail(`${location}: duplicate key ${key}`);
      seen.add(key);
    }
  }
  const routes = new Map(data.routes.map(row => [row.route_id, row]));
  const stops = new Map(data.stops.map(row => [row.stop_id, row]));
  for (const row of data.route_stops) {
    if (!routes.has(row.route_id)) fail(`Unknown route ${row.route_id}`);
    if (!stops.has(row.stop_id)) fail(`Unknown stop ${row.stop_id}`);
    else if (stops.get(row.stop_id).stop_name !== row.stop_name) fail(`Stop name mismatch: ${row.route_id}/${row.stop_id}`);
  }
  for (const route of data.routes) {
    const sequence = data.route_stops.filter(row => row.route_id === route.route_id).sort((a, b) => a.stop_order - b.stop_order);
    if (sequence.length < 2 || sequence.some((row, i) => row.stop_order !== i + 1)) fail(`${route.route_id}: expected contiguous stop orders starting at 1 and at least two stops`);
    if (sequence[0]?.stop_name !== route.start_stop || sequence.at(-1)?.stop_name !== route.end_stop) fail(`${route.route_id}: endpoint names do not match sequence`);
  }
  return { data, report };
}
