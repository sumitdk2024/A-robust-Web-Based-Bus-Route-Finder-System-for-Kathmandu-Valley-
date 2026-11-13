# Optional dataset API

Run `npm.cmd start` in this directory. API: http://localhost:5000/api.

Routes, stops, route-stop links and ordered route sequences read exclusively from `../data/main_dataset/`. MongoDB is no longer required or queried by the active API. Restart after CSV edits. Historic database models and V2/V3 import scripts are archived development utilities; do not run them for the main application.

The frontend is standalone and does not require this API to run.

For current pre-testing checks, run `npm.cmd test`: it tests the main CSV-backed HTTP API plus walking/geocoding services. The former V1/V2 unit command remains available as `npm.cmd run test:legacy`; legacy importer/integration commands are retained for review and are not part of the running application. See `../PRETEST_CLEANUP_REPORT.md` before using historical tools.
