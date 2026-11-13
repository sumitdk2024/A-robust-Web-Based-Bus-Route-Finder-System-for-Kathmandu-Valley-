# Packaging verification ? 13 November 2026

Separate staging copy; Windows, Node 24.11.0, npm 11.6.1. The original project was not edited. SHA-256 comparison confirmed all 280 copied original files remain unchanged in the original tree.

| Check | Result |
|---|---|
| Frontend npm.cmd ci --no-audit --no-fund | PASS; 126 packages installed from lockfile |
| Backend npm.cmd ci --no-audit --no-fund | PASS; 125 packages installed from lockfile |
| Frontend npm.cmd test | PASS; 68/68 |
| Backend npm.cmd test | PASS; 5/5, CSV HTTP API and provider fixtures |
| Frontend npm.cmd run check:network | PASS; 294 stops, 40 directional routes, example journeys returned |
| Frontend npm.cmd run build | PASS after execution-permission retry; 824.39 kB JS bundle warning (>500 kB) |
| Frontend npm.cmd run test:ui | 34/40 passed; six navigation timeouts/aborted navigations |
| npm.cmd run test:ui -- --last-failed --workers=1 | PASS; all six failed cases passed sequentially; all 40 distinct browser cases passed across runs |
| node submission-checks/route-smoke.mjs | PASS; Thankot to airport direct (R01_A), Kapan to Balaju transfer (R16_A/R11_B); HTTP API returned 294 stops and 40 routes on ephemeral listener |
| Relative application imports | PASS; source/assets present; dependencies require npm ci |
| Secret check | No copied source .env secret value or private-key block found; only placeholder backend/.env.example retained |

Initial build/browser attempts hit sandbox parent-directory access errors in esbuild. Identical commands passed with broader execution permission; no source/config workaround was introduced. Default browser run used six workers; all six navigation failures passed a one-worker retry. Full initial/retry logs are retained in submission-checks/verification-logs. Installed dependencies, compiled outputs and disposable runner output were moved outside this staging artefact after verification.

Not completed: Docker execution (not attempted; supplied compose limitations in README); dedicated live map-tile availability check; live openrouteservice walking/geocoding (no real credential copied or used); physical-device GPS, field route accuracy and participant usability; inactive legacy/import/MongoDB commands (historical data absent). Provider fixtures verify logic, not live availability. No backend build command exists.

No assignment submission brief was available. Dissertation-referenced test evidence is retained in dissertation/testing and selected dissertation/new_submission records, including historical failures/retests and limitations. These are historical evidence, not all fresh verification of this ZIP. The retained project contract is not a submission-format brief.

Excluded: temporary/historical project reports, AI_* historical reports, dissertation drafts and generation tools, local Git metadata, caches, node_modules, secret .env files and dist. Source, tests, manifests/lockfiles, active CSVs, generated JSON, assets, Docker configuration, data provenance and assistance disclosures are retained. New setup, attribution and verification documents were added only in staging. Root README.md is authoritative; original nested READMEs may refer to intentionally excluded historical reports.
