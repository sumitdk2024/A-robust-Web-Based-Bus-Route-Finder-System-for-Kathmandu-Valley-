import 'dotenv/config';
import mongoose from 'mongoose';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSyntheticDataset, definitions, databaseName, dataset, datasetStatus } from '../utils/v3SyntheticDataset.js';

export async function importSyntheticData({ write = false, uri = process.env.SYNTHETIC_MONGODB_URI } = {}) {
  const { data, report } = await readSyntheticDataset();
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) throw new Error('Synthetic CSV validation failed. No database connection or writes attempted.');
  if (!write) {
    console.log('Dry run only. No database connection or writes attempted. This network is NOT verified operating route data.');
    return report;
  }
  if (!uri) throw new Error('Set SYNTHETIC_MONGODB_URI explicitly. The normal application MONGODB_URI is never used.');
  const connection = mongoose.createConnection();
  let writing = false;
  try {
    // Both database and collection names are fixed, separate from the application.
    await connection.openUri(uri, { dbName: databaseName, serverSelectionTimeoutMS: 10000 });
    for (const { name } of definitions) {
      const collection = connection.db.collection(`synthetic_${name}`);
      const foreign = await collection.findOne({ $or: [{ dataset_version: { $ne: dataset } }, { dataset_status: { $ne: datasetStatus } }] });
      if (foreign) throw new Error(`Refusing to mix records: synthetic_${name} contains records without matching synthetic provenance.`);
    }
    for (const { name, keys } of definitions) {
      const collection = connection.db.collection(`synthetic_${name}`);
      await collection.createIndex(Object.fromEntries(keys.map(key => [key, 1])), { unique: true });
    }
    writing = true;
    for (const { name, keys } of definitions) {
      // Native collections retain every CSV field, including fields absent in V2 models.
      await connection.db.collection(`synthetic_${name}`).bulkWrite(data[name].map(row => ({
        replaceOne: { filter: Object.fromEntries(keys.map(key => [key, row[key]])), replacement: row, upsert: true },
      })), { ordered: true });
    }
    console.log('Synthetic demo import complete. Missing source records are not deleted. Application collections are unchanged.');
    return report;
  } catch (error) {
    if (writing) console.error('Partial synthetic import may exist. Imports are not atomic; rerun after resolving the failure.');
    throw error;
  } finally {
    await connection.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--write') || args.length > 1) throw new Error('Usage: node scripts/importV3SyntheticData.js [--write]');
    await importSyntheticData({ write: args.includes('--write') });
  } catch (error) {
    // Connection errors can contain credentials; do not print raw driver messages.
    console.error(error.name?.startsWith('Mongo') || error instanceof mongoose.Error ? 'Synthetic import failed: database connection or write error. Check the dedicated connection and indexes.' : error.message);
    process.exitCode = 1;
  }
}
