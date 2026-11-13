# Test plan and reproducibility

Execution date: 5 November 2026 (Europe/Paris; JSON timestamps are UTC). Developer tests were executed by Codex, not research participants. Windows PowerShell; Node v24.11.0; npm 11.6.1; Python 3.14.0; installed Chrome through Playwright. Exact resolved browser version is in execution-logs/environment.json. No formal university acceptance criteria were supplied. Requirements below are inferred from implemented behaviours and existing repository reports; they are provisional rather than stakeholder-approved requirements.

| ID | Requirement | Trace and checks |
|---|---|---|
| R01 | Choose supported origin/destination with autocomplete | SearchForm, StopAutocomplete; autocomplete.spec.js; search.spec.js |
| R02 | Reject empty, invalid and identical selections | final-requirements.spec.js; findJourney.test.js; UI01/UI05 |
| R03 | Find direct and transfer journeys using directional adjacent CSV edges | findJourney; search.spec.js; OR01–OR07 |
| R04 | Preserve stop order and shared transfer endpoints, including two transfers | findJourney.test.js; OR01–OR07; search.spec.js |
| R05 | Show route/operator details, intermediate stops and markers | search.spec.js; map-labels.spec.js; UI02/UI03 |
| R06 | Support desktop/mobile layouts without horizontal overflow | compact-layout.spec.js; search.spec.js; UI04 |
| R07 | Show map overlays and externally loaded basemap | overlay assertions and UI02; external basemap BL01 blocked |
| R08 | Find nearest stops and handle allowed/denied/unavailable/timed-out location | nearest-stops.spec.js; location-routing.spec.js; controlled geolocation fixtures; UI06 |
| R09 | Present estimates and preserve saved-place and assistant workflows | walking-time.spec.js; my-places.spec.js; ai-assistant.spec.js |
| R10 | Serve active CSV API and validate inputs/provider errors | backend active suite; API01–API06 |
| R11 | Evaluate usability with representative real passengers | BL04; not performed |

Run from KathmanduRouteFinder/frontend: `node --test src/utils/*.test.js`. Run from backend: `npm.cmd test`. Run from KathmanduRouteFinder: `node frontend/node_modules/@playwright/test/cli.js test --config dissertation-playwright.config.mjs`; `node dissertation/testing/execution-logs/independent-route-check.mjs`; `node dissertation/testing/execution-logs/independent-api-check.mjs`; `node dissertation/testing/execution-logs/capture.mjs`.

The separate browser config reuses the existing frontend at http://localhost:5173 and starts no duplicate service. The original listener was IPv6 loopback. `Get-NetTCPConnection` was denied; `netstat -ano` established port 5173 listening and HTTP returned 200. No backend listener was present. API tests import the Express app and use ephemeral loopback ports. They read CSV, never MongoDB. Historic import or integration commands were not run. Existing generated frontend data was tested directly without regeneration; frontend tests verify exact equality with CSV input.

The full machine-readable ledger records individual existing browser assertions by source filename and line. Inputs, steps, expectations and assertions are reproducible from that executable source; browser JSON captures actual runner outcomes. Existing tests use fixtures in several areas: all/most abort map tiles, walking/geocoding endpoints receive controlled success/failure responses, and GPS success/errors are emulated or injected. Backend provider tests intercept fetch and use a test-only placeholder credential. These establish application logic under controlled conditions, not live provider availability or geographic truth. Some estimate UI expectations call production helpers and therefore provide weaker independent numerical evidence than the route oracle.

OR01–OR07 independently load CSV sequences and use repeated edge relaxation, rather than production graph/search code, to compute minimum lexicographic (transfers, edges). They then compare actual cost, verify every consecutive edge in its directional route and check shared endpoints between legs. Equal-cost route IDs may differ without an error; cost and validity are the independent criteria. This is representative rather than exhaustive all-pairs validation. Disconnected stops and forward-only direction are additionally tested on clearly labelled synthetic fixtures in findJourney.test.js; the active dataset itself is connected and no real disconnected pair was fabricated.

The screenshot script performs new browser checks without intercepting network requests. It preserves actual page output. UI06 supplies browser-emulated Thankot GPS coordinates, which is appropriate for deterministic developer testing but is not a field location measurement. At capture, no map tiles loaded, while Leaflet route/stop overlays remained visible. Original PNG files are retained. No photograph, mock-up or prior screenshot is presented as new test evidence.

To complete blocked checks: (1) start/reuse frontend, allow tile.openstreetmap.org, repeat UI02 and record tile success/failure and a new screenshot; (2) with an authorised server-only provider key, start backend using `npm.cmd start`, verify Vite proxy target, search a Nepal address and request pedestrian routing, saving redacted responses and screenshots; (3) validate sampled stop sequences, operator identities and coordinates with operators/field visits, recording date and method; (4) obtain university-required participant approval and consent, recruit actual users, run stated tasks and report denominators and adverse results. Do not treat these proposed steps as completed testing.

## Requirement numbering crosswalk

The ledger's R01–R11 labels are a separate provisional testing scheme, introduced before dissertation drafting. They must not be read as the identically numbered dissertation Table 3.1 R1–R11. The table below makes the relationship explicit. The CSV's browser requirement field says Ledger to avoid implying a one-to-one numbering match. All ledger requirements remain inferred acceptance targets; Table 3.1 separately identifies requirements whose themes originated in repository documentation.

| Dissertation Table 3.1 | Matching ledger requirement(s) | Main evidence |
|---|---|---|
| R1 Select supported endpoints | R01 | B07–B08 |
| R2 Return ordered directed journeys | R03–R04 | OR01–OR07; B35/B39 |
| R3 Reject invalid/same endpoints | R02 | B10; UI01/UI05 |
| R4 Explain no available route | R03–R04 | Frontend fixture: multiple transfers, reconstruction and disconnected/invalid inputs |
| R5 Show route details and map roles | R05/R07 | B18–B19/B35/B39; UI02/UI03; BL01 |
| R6 Repeat, swap and reset searches | R01/R02/R05 | B08/B10/B11/B36 |
| R7 Support nearby-stop outcomes | R08 | B12–B17/B29–B33; UI06 |
| R8 Label estimates and fallbacks | R08/R09 | B15/B16/B24/B40 |
| R9 Persist supported saved places | R09 | B20–B28 |
| R10 Validate provider/API boundaries | R10 | Backend suite; API01–API06; provider fixtures |
| R11 Fit selected screen sizes | R06 | B09/B28/B37; UI04 |
| Outside Table 3.1: real participant evaluation | Ledger R11 | BL04; not conducted |

Browser records now give concrete inputs/steps, expected behaviour and the actual assertions confirmed by runner results. The executable snapshot remains the authoritative complete sequence; readable summaries do not imply additional measurements beyond those assertions. Existing tests use helper-generated expectations in several map and estimate checks, an evidential weakness explicitly distinguished from the independent route oracle.
