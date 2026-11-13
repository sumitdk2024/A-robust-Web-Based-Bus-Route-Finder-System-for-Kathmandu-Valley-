# Screenshot evidence index

All six images were captured anew on 5 November 2026 by execution-logs/capture.mjs from the existing app at http://localhost:5173. No displayed result was edited. The script intercepted no requests; provider success is not established. Original full-page PNGs are retained. Browser suite fixtures abort tiles; these separately captured images also show missing external tiles without request interception.

| Test | Original filename | Caption and meaning |
|---|---|---|
| UI01 | screenshots/UI01-missing-origin-desktop.png | Missing-origin validation on the desktop planner after submitting an empty form. |
| UI02 | screenshots/UI02-direct-desktop.png | Thankot–Tribhuvan Airport direct journey, R01_A, 28 stops, 0 transfers; markers and illustrative connections visible but external basemap unavailable (BL01). |
| UI03 | screenshots/UI03-transfer-desktop.png | Kapan–Balaju journey, R16_A then R11_B, transferring at Narayan Gopal Chowk; 25 stops and expanded journey details. |
| UI04 | screenshots/UI04-transfer-mobile.png | Same transfer journey in a 390×844 browser viewport; full-page capture and no horizontal document overflow. |
| UI05 | screenshots/UI05-identical-stops.png | Identical origin/destination Kapan rejected with an explanatory message. |
| UI06 | screenshots/UI06-nearest-emulated-gps.png | Three nearby stops after browser-emulated Thankot coordinates; origin Thankot, not a real field GPS reading. |

Raw visible texts, stop-marker counts and capture context: execution-logs/capture-observations.json. Independent validity results: execution-logs/independent-route-results.json. Figure captions in the dissertation must preserve the basemap and GPS qualifications. Images demonstrate interface behaviour rather than current on-road service validity.

## Additional focused evidence views for print readability

Final document visual review found that full-page captures, especially the original mobile capture, became difficult to read when scaled. The originals UI01–UI06 remain unchanged. The following four additional PNGs are genuine browser element screenshots from the same running application, captured on 5 November 2026 with no request interception, pixel editing or result alteration. They show the complete rendered .result panel; the mobile viewport is 390×1000. These are new evidence views of previously tested behaviours, not four additional automated test cases.

| Evidence view | Original new filename | Pixel dimensions | Caption |
|---|---|---|---|
| UI07 | screenshots/UI07-direct-result-desktop.png | 1248×785 | Focused desktop result: Thankot–Airport direct R01_A, 28 stops,0 transfers. |
| UI08 | screenshots/UI08-transfer-result-desktop.png | 1248×1179 | Focused desktop result: Kapan–Balaju, R16_A/R11_B and Narayan Gopal Chowk transfer. |
| UI09 | screenshots/UI09-transfer-result-mobile.png | 354×1234 | Complete result panel in 390px mobile viewport;25 stops and1 transfer, with both bus legs visible. |
| UI10 | screenshots/UI10-missing-origin-result.png | 1248×187 | Focused missing-origin validation after submitting the empty planner. |

Scripts: execution-logs/capture-focused.mjs and capture-focused-validation.mjs. Raw text, viewport, element bounds and PNG dimensions: execution-logs/focused-capture-observations.json. Hash register now covers all ten primary/focused PNGs; original six hashes were checked before adding entries. UI07–UI10 do not show the map, so basemap claims continue to rely on UI02/BL01 and must not be inferred from these focused figures. The no-horizontal-overflow observation remains separately recorded for UI04 and UI09.

### Final print-scale views

Two further genuine element captures were made at a 1024×900 browser viewport to increase text size at the dissertation's printed figure width. No requests were intercepted and all prior ten PNG hashes were checked unchanged. The actual result element width was 968px. These views replace earlier desktop figures only for document legibility; none is an edited screenshot or an additional automated test.

| Evidence view | Filename | Pixel dimensions | Meaning |
|---|---|---|---|
| UI11 | screenshots/UI11-direct-result-1024.png | 968×853 | Direct Thankot–Airport result, R01_A, 28 stops and 0 transfers. |
| UI12 | screenshots/UI12-transfer-result-1024.png | 968×1248 | Kapan–Balaju result, R16_A/R11_B, 25 stops, 1 transfer at Narayan Gopal Chowk. |

Capture script: execution-logs/capture-print.mjs. Raw text, element bounds and dimensions: execution-logs/print-capture-observations.json. Final retained screenshot collection: 12 files (UI01–UI12), of which 6 are original full-page captures and 6 are focused element views. All show real running-page output. Automated suite counts remain frontend 68 / backend 5 / browser 40; the focused views add no new test cases. Final ledger has 71 heterogeneous records: 67 PASS, 0 FAIL, 4 BLOCKED.

## Actual test execution/result screenshots added after evidence audit

An audit found application screenshots embedded but no test-run report image. On 5 November 2026 the unchanged 40-case browser suite was rerun with native Playwright HTML/JSON reporters. All 40 passed; zero failed, flaky or skipped; no runner errors. Runtime83.839 seconds. The PowerShell wrapper reported exit1 because Node's NO_COLOR warning arrived on stderr; the preserved JSON and native HTML report establish the actual successful test outcome.

| ID | Screenshot | Source and caption |
| --- | --- | --- |
| TR01 / RERUN-BROWSER | screenshots/TR01-browser-test-report.png | Unedited browser viewport of native Playwright report, showing40 passed and0 failed/flaky/skipped. Embedded as Figure6.5. |
| TR02 / B39 | screenshots/TR02-two-transfer-test-result.png | Native report's executed two-transfer case, search.spec.js:42–53, with passing steps/assertions. Embedded as Figure6.6. |

capture-test-report.mjs serves the genuine generated report locally and captures it without interception or pixel editing. HTML source: execution-logs/browser-html-report/index.html. Machine results: browser-report-rerun.json. Screenshot visible text/context: test-report-capture-observations.json. Prior twelve screenshot hashes verified unchanged; register now covers fourteen images. Four application screenshots and two report screenshots are embedded in Chapter6, alongside three technical diagrams elsewhere. The ledger now has74 heterogeneous rows:70 PASS and4 BLOCKED; rows are not an executed-test total.

Screenshot inventory clarification:14 indexed evidence screenshots (12 application,2 native report); the two browser runs additionally saved15 automatic artifact PNGs each. Across testing there are44 PNG files with33 distinct SHA256 hashes. Duplicates are retained; this is not44 unique visual images. Full paths/counts: testing/screenshot-inventory.json. PDF review renders are excluded.


Current official-template numbering (6 November 2026): application Figures5.1–5.4 use UI11/UI12/UI09/UI10; report Figures5.5–5.6 use TR01/TR02. Prior figure numbers in capture-history entries refer to earlier document versions. Screenshot originals and test IDs are unchanged.

## Enlarged native-report evidence views captured 6 November 2026

The existing generated browser-html-report from the **5 November 2026 execution** was reopened locally for legibility. No application was run and no test was rerun. Native browser display scale 150% with a 547×600CSS-pixel responsive viewport produced 821×900pixel screenshots. No DOM/text/status or screenshot pixels were edited. The original 14 registered PNG hashes were verified unchanged before these two entries were added.

| ID | Screenshot | Source/caption |
|---|---|---|
| TR03 | screenshots/TR03-enlarged-native-report-summary.png | Enlarged genuine native-report summary; All 40,Passed 40,Failed 0,Flaky 0,Skipped 0 visibly retained. Unfiltered existing report. Captured 6 November; executed 5 November. |
| TR04 / B39 | screenshots/TR04-enlarged-native-assertions.png | Enlarged genuine two-transfer report view using the native **Filter steps=Expect** control. Five green passing assertion rows are shown; this is a filtered assertion view, not the full executed action sequence. Suite status header remains All 40/Passed 40/Failed 0/Flaky 0/Skipped 0. Original TR02 preserves the full-step view. Captured 6 November; executed 5 November. |

Capture script: execution-logs/capture-enlarged-report.mjs. Raw visible text, filter, viewport, scale, capture timestamp, execution date, source HTML/JSON hashes and dimensions: execution-logs/enlarged-report-capture-observations.json. Native display scaling reflows the actual report; it does not change reported outcomes. TR04's report UI truncates some long locator text at this viewport; the unfiltered full-step original and source records remain available.

Final inventory after these evidence-only additions: 16 indexed screenshots (12 application, 4 native report), 46 PNG files across testing, 35 distinct SHA256 hashes. The ledger has 76 heterogeneous rows: 72 PASS, 0 FAIL, 4 BLOCKED. The new rows are evidence views, not additional tests; 126 distinct checks, 47 repeats and 173 passing case executions remain unchanged. BL01–BL04 remain blocked. Earlier chronological inventory summaries above describe prior collection stages and are superseded by this final inventory.
