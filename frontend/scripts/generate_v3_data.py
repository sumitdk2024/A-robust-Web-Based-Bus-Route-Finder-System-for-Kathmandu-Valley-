"""Regenerate the frontend snapshot without editing source CSVs (Python 3)."""
import csv
import json
from pathlib import Path

frontend = Path(__file__).resolve().parents[1]
source = frontend.parent / 'data/master_dataset/v3_synthetic'
data = {}
for name in ['routes', 'stops', 'route_stops']:
    with (source / (name + '.csv')).open(encoding='utf-8-sig', newline='') as handle:
        data[name] = list(csv.DictReader(handle))
    for row in data[name]:
        row['dataset_status'] = 'synthetic_demo_only'
        for field in ['latitude', 'longitude']:
            if field in row:
                row[field] = float(row[field])
        if 'stop_order' in row:
            row['stop_order'] = int(row['stop_order'])
(frontend / 'src/data/syntheticNetwork.json').write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
print({name: len(rows) for name, rows in data.items()})
