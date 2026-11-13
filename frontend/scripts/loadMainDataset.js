import { readFileSync, writeFileSync } from 'node:fs';
const base = new URL('../../data/main_dataset/', import.meta.url);
// RFC-style quoted fields, escaped quotes, CRLF, and BOM are supported.
export function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.map(values => { if (values.length !== headers.length) throw new Error('Invalid CSV column count'); return Object.fromEntries(headers.map((h, i) => [h, values[i]])); });
}
export function loadMainDataset() {
  const data = Object.fromEntries(['stops', 'routes', 'route_stops'].map(name => [name, parseCsv(readFileSync(new URL(name + '.csv', base), 'utf8'))]));
  for (const stop of data.stops) for (const key of ['latitude', 'longitude']) stop[key] = stop[key].trim() ? Number(stop[key]) : null;
  for (const row of data.route_stops) row.stop_order = Number(row.stop_order);
  const stopIds = new Set(data.stops.map(s => s.stop_id)), routeIds = new Set(data.routes.map(r => r.route_id));
  if (stopIds.size !== data.stops.length || routeIds.size !== data.routes.length) throw new Error('Duplicate supplied IDs');
  for (const row of data.route_stops) if (!stopIds.has(row.stop_id) || !routeIds.has(row.route_id)) throw new Error('Unknown route-stop reference');
  for (const route of data.routes) {
    const rows = data.route_stops.filter(r => r.route_id === route.route_id).sort((a,b) => a.stop_order-b.stop_order);
    if (rows.length !== Number(route.stop_count) || rows.some((r,i) => r.stop_order !== i+1 || r.company !== route.company || r.direction !== route.direction)) throw new Error('Invalid sequence: ' + route.route_id);
    if (rows[0]?.stop_id !== route.origin_stop_id || rows.at(-1)?.stop_id !== route.destination_stop_id) throw new Error('Endpoint mismatch: ' + route.route_id);
  }
  return data;
}
export function generateMainDataset() {
  writeFileSync(new URL('../src/data/mainNetwork.json', import.meta.url), JSON.stringify(loadMainDataset(), null, 2) + '\n');
}
