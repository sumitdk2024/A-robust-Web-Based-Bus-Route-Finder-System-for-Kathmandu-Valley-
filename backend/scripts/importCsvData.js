import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import connectDB from '../config/db.js';
import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import RouteStop from '../models/RouteStop.js';

const datasetDirectory = fileURLToPath(new URL('../../data/master_dataset/v1/', import.meta.url));
const definitions = [
  { file: 'routes.csv', model: Route, columns: ['route_id', 'route_name', 'status'], keys: ['route_id'], numbers: [] },
  { file: 'stops.csv', model: Stop, columns: ['stop_id', 'stop_name', 'latitude', 'longitude'], keys: ['stop_id'], numbers: ['latitude', 'longitude'] },
  { file: 'route_stops.csv', model: RouteStop, columns: ['route_id', 'stop_id', 'stop_order'], keys: ['route_id', 'stop_order'], numbers: ['stop_order'] },
];

export async function parseRows(content, definition) {
  const { file, model, columns, keys, numbers } = definition;
  let rows;
  try {
    rows = parse(content, { bom: true, trim: true, skip_empty_lines: true });
  } catch {
    throw new Error(`${file}: malformed CSV. Check quotes and column counts.`);
  }
  const header = rows.shift();
  if (!header || header.length !== columns.length || new Set(header).size !== columns.length || columns.some(column => !header.includes(column))) {
    throw new Error(`${file}: expected columns ${columns.join(',')}.`);
  }
  if (!rows.length) throw new Error(`${file}: no data rows found.`);
  const seen = new Set();
  return Promise.all(rows.map(async (values, index) => {
    const location = `${file}: data row ${index + 1}`;
    const row = Object.fromEntries(header.map((column, i) => [column, values[i]]));
    // Preserve the original V1 contract even though V2 allows unnamed stops.
    if (file === 'stops.csv' && !row.stop_name?.trim()) {
      throw new Error(`${location}: invalid stop_name.`);
    }
    for (const field of numbers) {
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(row[field]) || !Number.isFinite(Number(row[field]))) {
        throw new Error(`${location}: ${field} must be a finite number, not blank or text.`);
      }
      row[field] = Number(row[field]);
    }
    try {
      await new model(row).validate();
    } catch (error) {
      throw new Error(`${location}: invalid ${Object.keys(error.errors).join(', ')}.`);
    }
    const key = JSON.stringify(keys.map(field => row[field]));
    if (seen.has(key)) throw new Error(`${location}: duplicate key (${keys.join(', ')}). Fix duplicate rows before importing.`);
    seen.add(key);
    return row;
  }));
}

export async function loadDataset(directory = datasetDirectory) {
  const datasets = [];
  for (const definition of definitions) {
    const path = resolve(directory, definition.file);
    let content;
    try {
      content = await readFile(path, 'utf8');
    } catch (error) {
      throw new Error(`${error.code === 'ENOENT' ? 'Missing CSV file' : 'Cannot read CSV file'}: ${path}`);
    }
    datasets.push({ ...definition, rows: await parseRows(content, definition) });
  }
  const routeIds = new Set(datasets[0].rows.map(row => row.route_id));
  const stopIds = new Set(datasets[1].rows.map(row => row.stop_id));
  for (const [index, row] of datasets[2].rows.entries()) {
    if (!routeIds.has(row.route_id) || !stopIds.has(row.stop_id)) {
      throw new Error(`route_stops.csv: data row ${index + 1} references a route_id or stop_id missing from the Version 1 CSV files.`);
    }
  }
  return datasets;
}

export async function importData() {
  let writing = false;
  try {
    // Validate ALL files before touching the database. Never clear collections.
    const datasets = await loadDataset();
    console.log('All Version 1 CSV files passed validation.');
    await connectDB();
    // Ensure unique indexes exist before upserting. Existing duplicates cause a safe failure.
    for (const { model } of datasets) await model.createIndexes();
    writing = true;
    for (const { file, model, keys, rows } of datasets) {
      const result = await model.bulkWrite(rows.map(row => ({
        updateOne: {
          filter: Object.fromEntries(keys.map(key => [key, row[key]])),
          update: { $set: row },
          upsert: true,
        },
      })), { ordered: true });
      console.log(`${file}: read=${rows.length}, inserted=${result.upsertedCount}, updated=${result.modifiedCount}, unchanged=${result.matchedCount - result.modifiedCount}, total=${await model.countDocuments()}`);
    }
    console.log('Import completed successfully. Existing records absent from the CSV files were preserved.');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Import failed: duplicate database keys prevent a unique index or upsert. Review existing duplicates; no collections were cleared.');
    } else if (error instanceof mongoose.Error || error.name?.startsWith('Mongo')) {
      console.error('Import failed: database operation failed. Check database access and connectivity.');
    } else {
      console.error(`Import failed: ${error.message}`);
    }
    if (writing) console.error('Some records may already have been saved. Fix the issue and rerun; upserts make retries safe.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await importData();
}
