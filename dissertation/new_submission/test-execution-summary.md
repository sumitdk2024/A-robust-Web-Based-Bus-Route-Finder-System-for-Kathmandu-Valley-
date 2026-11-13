# Test execution — 12 November 2026

126 distinct automated/independent cases were exercised: 68 frontend, 5 backend, 40 browser, 7 route-oracle and 6 HTTP cases. The initial browser run passed 36 and timed out 4. All four passed in a sequential retest without source changes. Total: 130 executions, 126 passes, 4 initial failures, 0 skipped. Final observed status is passing for all 126 cases; repeatability under concurrent load remains uncertain.

The four timeouts concerned the assistant endpoint request, compact layout, invalid/identical-stop recovery and map labels. Logs show stalled clicks and closed sessions; their cause is unresolved. Initial failures remain in the CSV and JSON.

Frontend/backend tests used normal npm test commands. Browser tests used npm run test:ui; the retest used --workers=1 and a title filter selecting the four failures. Independent scripts were copied to this output folder with import/output paths adjusted; the checking logic was unchanged. Provider responses and GPS in relevant suites are controlled fixtures.

The production build completed in 22.62 seconds with a chunk-size warning. PowerShell reported exit 1 while redirecting warning output; build-rerun-log.txt explicitly records successful compilation. Earlier restricted build/browser attempts were environmental blocks, retained separately. Five screenshot observations and the build are not extra test cases. CSV suite rows carry case_count 68/5; summing row counts would be incorrect.

Screenshots were captured from the actual running app without interception. Direct Thankot–Airport: 28 markers, 8 loaded tiles, 65–75 minutes. Transfer Kapan–Balaju: 25 markers, 9 loaded tiles, 50–60 minutes. Mobile capture: no horizontal overflow. Estimates are model outputs, not observed travel times. The initial capture attempt hit a closed test server; the successful capture followed a local server restart.

Three separate evaluations remain blocked: live pedestrian/geocoder success, operational bus validity and participant usability. Basemap loading succeeded in this session; that does not establish continuous availability. No source fix, database import, deployment or participant feedback was invented.
