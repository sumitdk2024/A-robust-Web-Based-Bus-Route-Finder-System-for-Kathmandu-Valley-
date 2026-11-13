import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import RouteStop from '../models/RouteStop.js';
import { definitions, inspectV2, printQualitySummary } from '../utils/v2Dataset.js';

const models = { routes: Route, stops: Stop, route_stops: RouteStop };
const labels = { routes: 'Routes', stops: 'Stops', route_stops: 'Route-stop records' };

export async function importV2Data() {
  let writing = false;
  try {
    const { data, report } = await inspectV2();
    printQualitySummary(report);
    if (report.errors.length) throw new Error('CSV validation failed. No database writes were attempted; correct the reported errors and retry.');
    // bulkWrite update operations do not perform full document validation.
    // Validate every document before connecting or writing any collection.
    for (const { name } of definitions) {
      for (const [index, row] of data[name].entries()) {
        try { await new models[name](row).validate(); }
        catch { throw new Error(`${name}.csv data row ${index + 1}: model validation failed. No database writes attempted.`); }
      }
    }
    await connectDB();
    for (const model of Object.values(models)) await model.createIndexes();
    writing = true;
    for (const { name, keys } of definitions) {
      // Upsert by stable ID / route position. No collection reset or delete.
      // Explicit null coordinates replace stale values when the source is blank.
      const result = await models[name].bulkWrite(data[name].map(row => ({
        updateOne: {
          filter: Object.fromEntries(keys.map(key => [key, row[key]])),
          update: { $set: row },
          upsert: true,
        },
      })), { ordered: true });
      console.log(`${labels[name]} imported/updated: ${result.upsertedCount + result.modifiedCount} (inserted=${result.upsertedCount}, updated=${result.modifiedCount}, unchanged=${result.matchedCount - result.modifiedCount}, read=${data[name].length})`);
    }
    console.log(`Rows skipped: 0\nWarnings: ${report.warnings.length}`);
    console.log('Version 2 import completed successfully. Records absent from V2 were preserved.');
    return report;
  } catch (error) {
    if (error.code === 11000) console.error('Import failed: duplicate database keys. Review existing duplicates manually; no collection was cleared.');
    else if (error instanceof mongoose.Error || error.name?.startsWith('Mongo')) console.error('Import failed: database operation failed. Check connection, database permissions, and existing indexes.');
    else console.error(`Import failed: ${error.message}`);
    if (writing) console.error('Partial progress may have been saved. Fix the issue and rerun; upserts make retries safe.');
    process.exitCode = 1;
    return null;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importV2Data();
