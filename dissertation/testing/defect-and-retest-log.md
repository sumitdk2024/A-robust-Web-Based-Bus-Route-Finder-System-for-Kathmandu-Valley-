# Defect, limitation and retest log

Date: 5 November 2026. No application code was changed during this testing task.

| ID | Initial evidence | Finding | Disposition / retest |
|---|---|---|---|
| ENV01 | service discovery output | Get-NetTCPConnection access denied | Used netstat and direct HTTP instead; existing localhost frontend reused successfully. |
| ENV02 | capture-observations.json; UI02 screenshot | External basemap tiles did not load; tileImages=0. Markers and illustrative polyline did render. | BL01 blocked for basemap verification. No application fix applied because root cause was not established; repeat with tile network access. |
| LIM01 | backend/frontend provider fixture tests | Live provider success not established | BL02 blocked; controlled error/success paths passed. |
| LIM02 | repository provenance and absent field records | Dataset tests do not validate present operating routes | BL03 blocked; operator/field checks required. |
| LIM03 | no participant records supplied | No real-user usability evaluation | BL04 blocked; do not describe developer checks as user acceptance. |
| PROC01 | independent-api.txt | Expected malformed JSON request emits server stderr `Request failed (SyntaxError).`; PowerShell command surfaced nonzero wrapper exit despite all six JSON assertions true | Preserve raw output; inspect independent-api-results.json. All six status/message assertions passed. This is expected validation logging, not an API defect. |

Active automated suites: frontend 68 passed, backend 5 passed, browser 40 passed; 0 assertion failures. Independent CSV route checks: 7 passed. Additional API validation: 6 passed. No failing application assertion required a fix or retest. Capture-script observations (6) are separate evidence checks and are not added to the 113 existing automated-test total. Do not infer coverage percentage, performance benchmark, accessibility conformance or current bus-service accuracy from these results.

## Further source/build findings recorded during independent review

| ID | Initial evidence | Finding | Disposition / retest |
|---|---|---|---|
| SRC01 | data/main_dataset/stops.csv; StopAutocomplete source; existing B07 | IDs ratamakai_chowk and rata_makai_chowk both display Rata Makai Chowk at 27.6682,85.3448. UI option labels do not distinguish them. Existing keyboard test confirms selection behaviour but does not establish unambiguous user choice. | Open source-level ambiguity; no automatic merge or fix. Confirm source identities/memberships, then add context to options and independently retest each selection. This is code/data review, not a newly executed failing UI test. |
| BUILD01 | Root agent's saved frontend production-build output | Build passed with JavaScript chunk824.39kB, gzip171.26kB,5.95s and warning that a chunk exceeded Vite500kB threshold. | Performance/packaging warning, not failed compilation or measured passenger latency. No build optimisation performed. Rebuild and compare actual bundle/user performance after a supported change. |

## Oracle convergence review and retest

REVIEW01: The initial independent oracle stopped after at most 1,215 relaxation rounds without explicitly asserting convergence. This was an assurance weakness in the test helper, not an observed production defect or a recorded route mismatch. Original helper, JSON and stdout are preserved as independent-route-check-initial.mjs, independent-route-results-initial.json and independent-route-initial.txt in execution-logs.

The helper now asserts convergence before returning an expected cost and writes rounds/converged for every case. Reran all seven affected checks on 5 November 2026. All converged and passed; costs were unchanged. Rounds in OR01–OR07 order: 47,44,66,70,54,67,67, each below the 1,215 safeguard. test-results.csv retains the seven case IDs and adds retest outcomes. No application code changed; unaffected browser/provider checks were not repeated.

PRESENT01: Printed figures were difficult to read when full-page originals were reduced. Preserved UI01–UI06, captured UI07–UI10 focused panels, then UI11–UI12 at a narrower desktop viewport for final print use. All twelve PNGs are genuine captures; hashes verify previous files unchanged. This is a document-presentation improvement, with six additional evidence views and no extra automated test cases or application change. Final ledger:71 heterogeneous rows,67 PASS,0 FAIL,4 BLOCKED; existing automated suites remain113 passing tests.
