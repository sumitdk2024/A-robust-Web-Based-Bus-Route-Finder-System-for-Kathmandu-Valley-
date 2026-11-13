import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

export const v2Directory = fileURLToPath(new URL('../../data/master_dataset/v2/', import.meta.url));
export const definitions = [
  { name: 'routes', columns: ['route_id', 'route_name', 'operator', 'verification_status', 'source', 'source_url', 'verified_date', 'notes'], required: ['route_id', 'route_name'], keys: ['route_id'] },
  { name: 'stops', columns: ['stop_id', 'stop_name', 'latitude', 'longitude', 'coordinate_status', 'verification_status', 'source', 'source_url', 'verified_date'], required: ['stop_id'], keys: ['stop_id'] },
  { name: 'route_stops', columns: ['route_id', 'stop_id', 'stop_order', 'verification_status', 'source', 'source_url', 'verified_date'], required: ['route_id', 'stop_id', 'stop_order'], keys: ['route_id', 'stop_order'] },
];

export function parseCsv(content, columns, filename) {
  let rows;
  try {
    // No trim: provenance and verification values must survive verbatim.
    rows = parse(content, { bom: true, skip_empty_lines: true });
  } catch (error) {
    throw new Error(`${filename}: malformed CSV near line ${error.lines ?? '?'} (${error.code ?? 'parse error'}).`);
  }
  const header = rows.shift();
  if (!header || header.length !== columns.length || new Set(header).size !== columns.length || columns.some(key => !header.includes(key))) {
    throw new Error(`${filename}: expected exactly these columns: ${columns.join(', ')}. Unknown columns must be reviewed, not discarded.`);
  }
  return rows.map(values => Object.fromEntries(header.map((key, i) => [key, values[i]])));
}

const blank = value => value == null || String(value).trim() === '';
const frequency = (rows, field) => {
  const counts = new Map();
  for (const row of rows) counts.set(row[field] ?? '', (counts.get(row[field] ?? '') ?? 0) + 1);
  return Object.fromEntries(counts);
};
const normalized = value => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

function editDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = current;
  }
  return previous[b.length];
}

export function inspectRows(input) {
  // Copy before conversion so callers retain the original source rows.
  const data = Object.fromEntries(definitions.map(({ name }) => [name, input[name].map(row => ({ ...row }))]));
  const report = { counts: {}, errors: [], warnings: [], metrics: {}, verificationStatuses: {}, coordinateStatuses: {}, sources: {}, sourceUrls: {}, nearDuplicateNames: [] };
  const { errors, warnings, metrics } = report;
  const number = (row, field, optional, location) => {
    const value = row[field];
    if (blank(value) && optional) { row[field] = null; return; }
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(String(value).trim()) || !Number.isFinite(Number(value))) {
      errors.push(`${location}: ${field} must be a finite decimal number${optional ? ' or blank' : ''}.`);
      return;
    }
    row[field] = Number(value);
  };
  for (const definition of definitions) {
    const { name, required, keys } = definition;
    const rows = data[name];
    report.counts[name] = rows.length;
    report.verificationStatuses[name] = frequency(rows, 'verification_status');
    report.sources[name] = frequency(rows, 'source');
    report.sourceUrls[name] = frequency(rows, 'source_url');
    if (!rows.length) errors.push(`${name}.csv: no data rows.`);
    const seen = new Set();
    for (const [index, row] of rows.entries()) {
      const location = `${name}.csv data row ${index + 1}`;
      for (const field of required) if (blank(row[field])) errors.push(`${location}: missing required ${field}.`);
      for (const field of ['route_id', 'stop_id']) {
        if (row[field] != null && row[field] !== row[field].trim()) errors.push(`${location}: ${field} contains surrounding whitespace; review the ID.`);
      }
      if (name === 'stops') {
        number(row, 'latitude', true, location);
        number(row, 'longitude', true, location);
        for (const [field, bound] of [['latitude', 90], ['longitude', 180]]) {
          if (typeof row[field] === 'number' && Math.abs(row[field]) > bound) errors.push(`${location}: ${field} outside -${bound} to ${bound}.`);
        }
        if (row.latitude == null || row.longitude == null) warnings.push(`${location} (${row.stop_id}): missing coordinates retained as null.`);
        if (blank(row.stop_name)) warnings.push(`${location} (${row.stop_id}): blank stop_name retained; no name invented.`);
      }
      if (name === 'route_stops') {
        number(row, 'stop_order', false, location);
        if (!Number.isSafeInteger(row.stop_order) || row.stop_order < 1) errors.push(`${location}: stop_order must be a positive safe integer.`);
      }
      const key = JSON.stringify(keys.map(field => row[field]));
      if (seen.has(key)) errors.push(`${location}: duplicate ${keys.join(' + ')} (${key}).`);
      seen.add(key);
      for (const field of ['verification_status', 'source', 'source_url', 'verified_date']) {
        if (blank(row[field])) warnings.push(`${location}: blank ${field} retained.`);
      }
    }
  }
  metrics.unnamed_stops = data.stops.filter(row => blank(row.stop_name)).length;
  metrics.stops_missing_coordinates = data.stops.filter(row => row.latitude == null || row.longitude == null).length;
  report.coordinateStatuses = frequency(data.stops, 'coordinate_status');
  const routeIds = new Set(data.routes.map(row => row.route_id));
  const stopIds = new Set(data.stops.map(row => row.stop_id));
  const triples = new Set();
  for (const [index, row] of data.route_stops.entries()) {
    const location = `route_stops.csv data row ${index + 1}`;
    if (!routeIds.has(row.route_id)) errors.push(`${location}: missing route ${row.route_id}.`);
    if (!stopIds.has(row.stop_id)) errors.push(`${location}: missing stop ${row.stop_id}.`);
    const triple = JSON.stringify([row.route_id, row.stop_id, row.stop_order]);
    if (triples.has(triple)) errors.push(`${location}: duplicate route_id + stop_id + stop_order.`);
    triples.add(triple);
  }
  for (const routeId of routeIds) {
    const orders = data.route_stops.filter(row => row.route_id === routeId).map(row => row.stop_order).filter(Number.isSafeInteger).sort((a, b) => a - b);
    if (!orders.length) warnings.push(`Route ${routeId}: no ordered stops.`);
    else if (orders[0] !== 1 || orders.some((value, i) => i > 0 && value > orders[i - 1] + 1)) warnings.push(`Route ${routeId}: stop ordering has gaps; sequence retained: ${orders.join(', ')}.`);
  }
  const named = data.stops.filter(row => !blank(row.stop_name));
  for (let i = 0; i < named.length; i++) {
    for (let j = i + 1; j < named.length; j++) {
      const a = normalized(named[i].stop_name), b = normalized(named[j].stop_name);
      if (a === b || (Math.min(a.length, b.length) >= 5 && Math.abs(a.length - b.length) <= 1 && editDistance(a, b) <= 1)) {
        const pair = { kind: a === b ? 'normalized duplicate' : 'near duplicate', stops: [named[i], named[j]].map(({ stop_id, stop_name }) => ({ stop_id, stop_name })) };
        report.nearDuplicateNames.push(pair);
        warnings.push(`${pair.kind} names: ${pair.stops.map(row => `${row.stop_id} (${row.stop_name})`).join(' / ')}. Kept separate.`);
      }
    }
  }
  return { data, report };
}

export async function inspectV2(directory = v2Directory) {
  const input = {};
  for (const { name, columns } of definitions) {
    const path = resolve(directory, `${name}.csv`);
    let text;
    try { text = await readFile(path, 'utf8'); }
    catch { throw new Error(`Cannot read CSV file: ${path}`); }
    input[name] = parseCsv(text, columns, `${name}.csv`);
  }
  const result = inspectRows(input);
  const readme = await readFile(resolve(directory, 'README.md'), 'utf8');
  const supplied = parseCsv(await readFile(resolve(directory, 'data_quality_report.csv'), 'utf8'), ['metric', 'value', 'notes'], 'data_quality_report.csv');
  result.report.suppliedQualityReport = supplied;
  result.report.datasetReadme = readme;
  const measured = { routes_total: result.data.routes.length, stops_total: result.data.stops.length, route_stop_links: result.data.route_stops.length, ...result.report.metrics };
  for (const row of supplied) {
    if (Object.hasOwn(measured, row.metric) && Number(row.value) !== measured[row.metric]) result.report.warnings.push(`Supplied quality report ${row.metric}=${row.value}, measured=${measured[row.metric]}.`);
  }
  return result;
}

export function printQualitySummary(report) {
  console.log(`V2 quality: routes=${report.counts.routes}, stops=${report.counts.stops}, route-stops=${report.counts.route_stops}`);
  console.log(`Missing coordinates=${report.metrics.stops_missing_coordinates}; unnamed stops=${report.metrics.unnamed_stops}; duplicate/near-name pairs=${report.nearDuplicateNames.length}`);
  console.log(`Blocking errors: ${report.errors.length}; warnings: ${report.warnings.length}`);
  for (const [name, statuses] of Object.entries(report.verificationStatuses)) console.log(`${name} verification statuses: ${JSON.stringify(statuses)}`);
  console.log(`Coordinate statuses: ${JSON.stringify(report.coordinateStatuses)}`);
  for (const [name, sources] of Object.entries(report.sources)) console.log(`${name} sources: ${JSON.stringify(sources)}`);
  for (const error of report.errors) console.error(`ERROR: ${error}`);
  for (const warning of report.warnings.slice(0, 5)) console.warn(`WARNING: ${warning}`);
  if (report.warnings.length > 5) console.log(`... ${report.warnings.length - 5} more warnings; run npm.cmd run inspect-v2 for the full saved report.`);
}
