# Attribution and disclosures

The source dissertation states: ?The application, project artifacts, evaluation and dissertation were prepared with Codex assistance, including testing, evidence collection, drafting and subagent review.? This disclosure is preserved from dissertation/dissertation.md. This artefact packaging and its verification were also prepared with Codex assistance.

The Route Assistant uses local deterministic parsing and route selection. No external language model is configured. AI_JOURNEY_ASSISTANT.md and AI_ASSISTANT_EVALUATION.json were inspected: neither is imported or read by application code, tests or the evaluation script. They are historical reports, excluded from this artefact; the actual assistant source, tests and evaluation command remain.

Map tiles and map data: ? OpenStreetMap contributors, https://www.openstreetmap.org/copyright . Walking directions/address lookup: openrouteservice / OpenStreetMap contributors. Existing UI attribution is preserved.

Nepal polygon: Natural Earth Admin 0 Countries, 1:10m, public domain. https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/ . The source project reports extraction of ADM0_A3=NPL without modifying coordinates from pinned v5.1.2: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson . Reported source SHA-256: 239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255 . This is a cartographic boundary, subject to boundary and GPS accuracy limitations.

The active route dataset was supplied from a previous student project; its original upstream source, permission/ownership and current operational accuracy have not been independently confirmed. The original data/main_dataset/README.md and data-quality report are retained. No new licence or provenance claim is made. No project-level licence or notice file was found outside installed dependencies; dependency licences are supplied by their respective npm packages when installed.

Historical test evidence includes developer/Codex testing and controlled GPS/provider fixtures. It does not establish participant usability, live provider success, physical-device GPS accuracy or field-verified bus operations. Consult the retained evidence records for exact limitations and failed/retested cases.
