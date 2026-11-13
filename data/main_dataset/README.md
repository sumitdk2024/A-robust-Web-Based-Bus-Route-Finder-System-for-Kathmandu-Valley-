# Kathmandu Bus Route Finder — Main Dataset V4

This folder is the main and only active transport dataset for the FYP application.

## Source
The dataset was supplied from a previous student project. Its original upstream data source has not yet been independently confirmed.

## Contents
- routes.csv — one row per directional route record
- stops.csv — stop IDs, names and supplied coordinates
- route_stops.csv — ordered stop sequence for each directional route
- data_quality_report.csv — potential aliases/naming issues that need manual review

## Dataset summary
- Logical routes: 20
- Directional route records: 40
- Stop definitions: 294
- Route-stop relationships: 1215
- Transport companies/categories: 7
- Route stop references missing from stops.csv: 0
- Stop definitions unused by parsed routes: 0

## Important implementation rules
1. This dataset replaces the synthetic V3 dataset as the application's active transport dataset.
2. Keep outbound and inbound directional route records separate.
3. Do not automatically reverse routes because return journeys may use different stops.
4. Do not silently merge similar stop names. Review data_quality_report.csv first.
5. Use stops.csv for autocomplete, map coordinates and nearest-stop calculations.
6. Use route_stops.csv to build the journey-planning graph.
7. Do not claim this dataset has been independently verified until its original source/method is confirmed.

## Suggested app notice
"Route information is based on the project dataset and may not reflect current real-time transport operations."

## Companies in this dataset
- Bhaktapur Yatayat
- Gokarneshwor Yatayat
- Local Bus
- Mahanagar Yatayat
- Nepal Yatayat
- Riddhi Siddhi Yatayat
- Sajha Yatayat
