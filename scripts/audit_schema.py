"""Read-only structural comparison of live D1 with the complete checked-in schema."""
from pathlib import Path
import sqlite3
import sys
from cloudflare_setup import query

ROOT=Path(__file__).resolve().parents[1]
expected=sqlite3.connect(':memory:')
expected.executescript((ROOT/'cloudflare/schema.sql').read_text())
tables=[r[0] for r in expected.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
actual={r['name']:r['type'] for r in query("SELECT name,type FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'")[0]['results']}
missing=[]
for name in tables:
    if name not in actual:missing.append(f'table: {name}')
results=query(';\n'.join(f'PRAGMA table_info("{name}")' for name in tables))
if len(results)!=len(tables):sys.exit('Incomplete schema response; audit could not be completed.')
for name,result in zip(tables,results):
    want={r[1] for r in expected.execute(f'PRAGMA table_info("{name}")')}
    have={r['name'] for r in result['results']}
    missing.extend(f'column: {name}.{column}' for column in sorted(want-have))
    expected_columns={r[1]:(r[2].upper(),r[3],r[5]) for r in expected.execute(f'PRAGMA table_info("{name}")')}
    for r in result['results']:
        if r['name'] in expected_columns and expected_columns[r['name']]!=(r['type'].upper(),r['notnull'],r['pk']):missing.append(f'column type/key constraint: {name}.{r["name"]}')
policies=query(';\n'.join(f'PRAGMA foreign_key_list("{name}")' for name in tables))
if len(policies)!=len(tables):sys.exit('Incomplete foreign-key response; audit could not be completed.')
for name,result in zip(tables,policies):
    want={(r[2],r[3],r[4],r[5],r[6]) for r in expected.execute(f'PRAGMA foreign_key_list("{name}")')}
    have={(r['table'],r['from'],r['to'],r['on_update'],r['on_delete']) for r in result['results']}
    if want!=have:missing.append(f'foreign-key policy: {name}')
objects=expected.execute("SELECT name,type FROM sqlite_master WHERE type IN ('index','view','trigger') AND name NOT LIKE 'sqlite_%'").fetchall()
missing.extend(f'{kind}: {name}' for name,kind in objects if actual.get(name)!=kind)
if missing:
    print('\n'.join('Missing '+item for item in missing));sys.exit(1)
violations=query('PRAGMA foreign_key_check')[0]['results']
if violations:sys.exit('Foreign-key violations detected; no data printed or changed.')
print(f'Live D1 matches {len(tables)} tables, all expected columns, and {len(objects)} indexes/views/triggers; foreign keys passed.')
