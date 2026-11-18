#!/usr/bin/env python3
"""Verify the selected Cloudflare resources or apply checked-in D1 migrations.

Uses injected HTTPS authentication. Never prints credentials or application data.
This does not create, update, or publish a Pages project.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "wrangler.jsonc").read_text())
ACCOUNT = "6e8c7ad8a78db9e32bf755202cccd118"
DATABASE = CONFIG["d1_databases"][0]["database_id"]
BUCKET = CONFIG["r2_buckets"][0]["bucket_name"]


def api(path, payload=None):
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not token:
        raise RuntimeError("CLOUDFLARE_API_TOKEN must be set in secure environment settings")
    if os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT) != ACCOUNT:
        raise RuntimeError("CLOUDFLARE_ACCOUNT_ID does not match the selected account")
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/{path}",
        data=None if payload is None else json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        # Do not include response bodies, request headers, or user data in diagnostics.
        raise RuntimeError(f"Cloudflare API returned HTTP {exc.code}") from None
    if not result.get("success"):
        raise RuntimeError("Cloudflare API operation failed; inspect account permissions")
    return result["result"]


def query(sql, params=None):
    results = api(f"d1/database/{DATABASE}/query", {"sql": sql, "params": params or []})
    if not all(result.get("success") for result in results):
        raise RuntimeError("D1 query failed")
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="apply pending migrations to shopnil")
    args = parser.parse_args()
    db = api(f"d1/database/{DATABASE}")
    bucket = api(f"r2/buckets/{BUCKET}")
    if db.get("name") != "shopnil" or bucket.get("name") != BUCKET:
        raise RuntimeError("Remote resource identity mismatch")
    print("Verified D1 database and R2 bucket: shopnil")
    rows = query("SELECT name FROM sqlite_master WHERE type='table'")[0]["results"]
    names = {row["name"] for row in rows}
    if args.apply:
        if "app_migrations" not in names:
            # This initial schema is for the user's explicitly selected empty database.
            if names - {"_cf_KV", "d1_migrations"}:
                raise RuntimeError("Database is not empty; refusing to initialize existing application tables")
            query("CREATE TABLE app_migrations (name TEXT PRIMARY KEY, sha256 TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))")
        applied = {r["name"]: r["sha256"] for r in query("SELECT name,sha256 FROM app_migrations")[0]["results"]}
        for migration in sorted((ROOT / "cloudflare/migrations").glob("*.sql")):
            sql = migration.read_text()
            digest = hashlib.sha256(sql.encode()).hexdigest()
            if migration.name in applied:
                if applied[migration.name] != digest:
                    raise RuntimeError(f"Applied migration was modified: {migration.name}")
                print(f"Already applied: {migration.name}")
                continue
            # D1 executes a multi-statement query atomically. The marker participates
            # in the same transaction, so a failed migration cannot appear applied.
            if not re_safe_filename(migration.name):
                raise RuntimeError("Unexpected migration filename")
            query(sql + f"\nINSERT INTO app_migrations(name,sha256) VALUES ('{migration.name}','{digest}');")
            print(f"Applied: {migration.name}")
    counts = query("SELECT count(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('_cf_KV','app_migrations','d1_migrations')")[0]["results"]
    print("Application tables:", counts[0]["n"])
    violations = query("PRAGMA foreign_key_check")[0]["results"]
    if violations:
        raise RuntimeError("D1 foreign key validation failed")
    print("Foreign key validation passed")


def re_safe_filename(name):
    return all(c.isalnum() or c in "_.-" for c in name)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, urllib.error.URLError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
