import { writeFile } from 'node:fs/promises';
import { inspectV2, printQualitySummary } from '../utils/v2Dataset.js';

try {
  const { report } = await inspectV2();
  printQualitySummary(report);
  await writeFile(new URL('../data-quality-v2.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log('Full quality report saved to backend/data-quality-v2.json. Dataset files were not changed.');
  if (report.errors.length) process.exitCode = 1;
} catch (error) {
  console.error(`Inspection failed: ${error.message}`);
  process.exitCode = 1;
}
