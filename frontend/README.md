# Kathmandu Bus Route Finder

Start from this directory with `npm.cmd run dev` on Windows (or `npm run dev` elsewhere). Open http://localhost:5173.

The only active transport source is `../data/main_dataset/{stops,routes,route_stops}.csv`. The predev/prebuild/pretest hooks regenerate `src/data/mainNetwork.json`; never edit that generated snapshot manually. Restart the development server after CSV edits.

Validation: `npm.cmd test`, `npm.cmd run check:network`, `npm.cmd run test:ui`, `npm.cmd run build`.

The cleanup-only pre-testing audit, current verification results and retained legacy files are listed in `../PRETEST_CLEANUP_REPORT.md`.

Live location is limited to Nepal using a bundled Natural Earth polygon and Turf. Pedestrian directions require the backend on port 5000 and `OPENROUTESERVICE_API_KEY` in `backend/.env`; `/api` is proxied there by Vite. Without directions, the app keeps a clearly marked approximate walking estimate. See `../LOCATION_ROUTING_REPORT.md` for setup, source attribution, coverage, changed files and tests. Ordinary manual bus searches still run entirely in the frontend.

The frontend runs without the backend or MongoDB. The optional backend also reads the main CSVs directly. Archived synthetic files and import scripts are retained for reference and are not runtime sources.

The final application supports bus stops and bus routes only. Tourist data, matching, components and navigation have been removed.

See `../FINAL_REQUIREMENTS_REVIEW.md` for the final requirements review, validation results, and known limitations. Earlier redesign/assistant reports and screenshots are historical records.

The Route Assistant extracts journey endpoints without preference modes. Candidate journeys use one deterministic order: fewer transfers, fewer total stops, lower estimated total time, then stable route IDs and stop IDs. The bus graph planner, location/walking route handling and manual nearby-stop selection are unchanged.

My Places replaces Quick Stops, and alternative journey cards are removed. Save up to ten bus stops or Nepal addresses on this browser; From/To fills real supported stops. Address lookup uses the backend openrouteservice geocoder and the existing key. Selected address endpoints add pedestrian connections or clearly labelled approximate walking estimates. GPS remains separate and is never saved automatically. See `../MY_PLACES_REPORT.md` for changed files, setup, validation and limitations.
