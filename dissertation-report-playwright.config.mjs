import { defineConfig } from './frontend/node_modules/@playwright/test/index.mjs';
export default defineConfig({
  testDir: './frontend/e2e',
  outputDir: './dissertation/testing/report-rerun-artifacts',
  reporter: [
    ['html', { outputFolder: './dissertation/testing/execution-logs/browser-html-report', open: 'never' }],
    ['json', { outputFile: './dissertation/testing/execution-logs/browser-report-rerun.json' }],
    ['line'],
  ],
  workers: 2,
  use: { baseURL: 'http://localhost:5173', channel: 'chrome', headless: true, screenshot: 'only-on-failure' },
  timeout: 30000,
});
