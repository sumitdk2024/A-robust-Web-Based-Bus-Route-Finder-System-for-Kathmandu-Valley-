# A-robust-Web-Based-Bus-Route-Finder-System-for-Kathmandu-Valley-

Start here. This package contains the React/Vite frontend, optional Express backend, active Kathmandu route data, tests and retained test evidence. The original development workspace was not edited.

## Requirements and installation

Use Node.js 22.12+ (or 24 LTS) and npm; validation used Node 24.11.0 / npm 11.6.1 on Windows. Internet access is required to install dependencies and load external map tiles. From this folder in two terminals:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:5173. On macOS/Linux use `npm` in place of `npm.cmd`. Choose Thankot as origin and Tribhuvan International Airport (airport) as destination, then search. Bus search runs locally with the bundled data and needs no API key or database.

Optional backend, in a second terminal from this folder:

```powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
# Optional: set your own OPENROUTESERVICE_API_KEY in .env
npm.cmd start
```

API: http://localhost:5000/api/stops and /api/routes. No MongoDB is required. Vite proxies /api to 127.0.0.1:5000. Without an authorised openrouteservice key, live walking directions/address lookup are unavailable; bus searches still work and walking falls back to labelled estimates. Never commit or submit real credentials.

## Build and verification

From frontend: `npm.cmd test`, `npm.cmd run check:network`, `npm.cmd run build`, `npm.cmd run test:ui`. `npm.cmd run preview` serves the production bundle for inspection; its default port is 4173. The dev proxy applies to the development server; preview/static hosting requires a separately configured /api reverse proxy for optional provider features.

From backend: `npm.cmd test`. The backend is interpreted JavaScript and has no build command.

Browser tests use installed Google Chrome via Playwright and port 5173. Install Chrome if unavailable. Existing playwright.config.js uses npm.cmd to start Vite on Windows; on other platforms change that command to npm. The dissertation browser configs reuse a separately running localhost:5173 frontend.

The active data is data/main_dataset/stops.csv, routes.csv and route_stops.csv. Frontend predev/pretest/prebuild hooks regenerate src/data/mainNetwork.json. Keep frontend/scripts/loadMainDataset.js: the backend imports it too. nepalBoundary.json supplies the Nepal polygon; syntheticNetwork.json is retained as an archived source asset, not the active graph. Retained legacy import scripts/tests refer to historical datasets absent from the original data folder; do not run import or legacy/integration commands as normal setup.

Dockerfiles and docker-compose.yml are retained as supplied, but Docker is not the verified setup. The supplied nginx image does not configure SPA fallback or an /api reverse proxy and compose does not inject a provider key. Use the documented local development commands for the full optional feature flow.

## Evidence and submission scope

No university assignment submission brief was found. An extracted project contract is retained at dissertation/new_submission/project_contract-extracted.txt; it is a project contract, not proof of submission-format compliance. The dissertation-referenced evidence is retained at dissertation/testing/ and the selected testing records in dissertation/new_submission/. These include test ledgers, raw runner records, independent checks and screenshots, including failures/retests. Dissertation manuscripts, rendered documents and document-generation tools are excluded. Existing evidence records describe their own dates, fixtures and limitations; they are not all fresh verification of this ZIP.

See VERIFICATION.md for this packaging run, ATTRIBUTION_AND_DISCLOSURES.md for provenance and assistance disclosure, and FILE_MANIFEST.sha256 for packaged file integrity. Nested frontend/backend READMEs are original project documentation and may reference historical reports intentionally omitted here; use this root README for submission setup.
