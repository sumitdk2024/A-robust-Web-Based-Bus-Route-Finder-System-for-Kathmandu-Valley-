# V3 synthetic demo import setup

Development and testing only. This is not verified operating bus-route data and
must not be used for real passenger navigation. Source files are read only from
`data/master_dataset/v3_synthetic/`; v1/v2 data and import behavior are unchanged.

## Inspected CSV schema

| File | Rows | Number fields | String fields (preserved verbatim) |
| --- | ---: | --- | --- |
| routes.csv | 24 | None | route_id, route_name, start_stop, end_stop, operator, verification_status, source, notes, dataset_date |
| stops.csv | 50 | latitude, longitude (finite decimals) | stop_id, stop_name, coordinate_status, verification_status, source |
| route_stops.csv | 202 | stop_order (positive integer) | route_id, stop_id, stop_name, verification_status, source |

CSV values begin as strings. Only the three numerical fields above are converted.
`dataset_date` remains the original ISO date string, with calendar validation.
No source text is trimmed, normalized, or upgraded to verified. No blank fields
were found in this snapshot. Routes and route-stop records use
`verification_status=synthetic_demo_only`; all stops retain
`verification_status=real_place_name_with_demo_route_usage` and
`coordinate_status=osm_coordinate_from_prior_project_data`.

Every document additionally receives `dataset_version=v3_synthetic` and
`dataset_status=synthetic_demo_only`, including stops whose source coordinates
are derived from prior project data. No records are read from or joined to v1/v2.

## Commands (from backend)

```powershell
npm.cmd run inspect-v3-synthetic
npm.cmd run test:v3-synthetic
```

Both inspection and the import command default to an offline dry run. Validation
checks exact columns, required values, numbers, bounds, duplicate IDs/positions,
foreign keys, contiguous sequences, stop names, endpoints, dates, and the expected
verification statuses. New columns/statuses require explicit review. All rows
must pass before a database connection is attempted.

For a **future, deliberate import** only:

```powershell
$env:SYNTHETIC_MONGODB_URI = 'mongodb://127.0.0.1:27017'
npm.cmd run import-v3-synthetic -- --write
```

The importer never uses the application's `MONGODB_URI`. It overrides any database
in the dedicated URI with the fixed database `kathmandu_v3_synthetic_demo_only`,
and writes only `synthetic_routes`, `synthetic_stops`, and
`synthetic_route_stops`. The existing backend API is not connected to these
collections. Use a development MongoDB instance and credentials scoped to this
database when importing later.

Before writes, all three collections are checked for records lacking matching
synthetic provenance; any such record aborts the import. Unique indexes enforce
route_id, stop_id, and (route_id, stop_order), respectively. Native MongoDB writes
preserve all CSV columns, including fields absent from the existing V2 models.
Reruns replace/upsert matching IDs or positions; no collection is cleared, and
records absent from a later CSV remain. Multi-collection writes are not atomic:
a failure can leave partial synthetic data; fix and rerun the same snapshot.
Do not run this importer concurrently with other writers to its collections.

Only offline validation/tests were run during setup. No MongoDB import was run;
database connectivity, indexes, and write behavior remain untested against a live
server. No frontend, API, v1, or v2 integration was changed.
