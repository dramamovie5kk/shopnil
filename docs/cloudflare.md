# Cloudflare Pages, D1, R2 and custom JWT

## Production configuration

The Pages project is **shopnil**, connected to
`dramamovie5kk/shopnil` (`main`). The unrelated
`dramamovie5kk` project is not modified.

| Setting | Value |
| --- | --- |
| Account ID | `6e8c7ad8a78db9e32bf755202cccd118` |
| Pages project | `shopnil` |
| Build command | `npm run build` |
| Build output | `dist` |
| D1 binding | `DB` |
| D1 database | `shopnil` |
| D1 ID | `943055df-455f-4cb1-b943-460cbdb20469` |
| R2 binding | `BUCKET` |
| R2 bucket | `shopnil` |
| Server signing secret | `JWT_SECRET` (Pages secret, never a `VITE_*` variable) |

`wrangler.jsonc` declares the actual project and bindings. Production bindings
and a newly generated server-only signing secret were saved and verified through
the Cloudflare API. Cloudflare Pages builds production deployments from the GitHub main branch.

Do not put the Cloudflare management API token into Pages build/runtime
variables. D1 and R2 runtime access uses bindings. The management token is needed
only by the setup/configuration scripts and belongs in secure environment settings.

## Schema and migrations

- `cloudflare/schema.sql`: complete reference schema for a **new empty** D1
  database, including authentication and cart selections.
- `cloudflare/migrations/`: incremental schema changes for existing databases.
- `cloudflare/schema.json`: allowlisted logical columns, types and relationships
  used by the backend query compiler.

There are 25 application tables, five backend authentication/ownership/rate-limit
  tables, and a public approved-reviews view. Migration ledger tables are separate.
The physical `sales_pages` table keeps identifiers, lookup fields, prices,
activation, timestamps and template settings in columns; the remaining content
is JSON in `content`, because D1 limits columns per table. The backend hydrates
that document, decodes JSON/booleans and safely merges document updates.
Customer phones are omitted from the public reviews view.

The user chose an empty database. No old data, media, accounts, sessions or
passwords are imported. Authentication, roles, authorization, media and functions
now run through the new backend; the previous SDK, configuration, SQL backend,
client and dependency are removed.

```sh
python scripts/test_d1_schema.py
python scripts/cloudflare_setup.py
python scripts/cloudflare_setup.py --apply
python scripts/configure_pages.py
```

The remote migration runner verifies the selected database, refuses initial
installation over unknown application tables, records SHA-256 checksums in
`app_migrations`, and skips unchanged applied migrations. Each migration and its
ledger marker are sent in one atomic multi-statement D1 request. Never edit
an applied migration. Do not run Wrangler's separate remote migration ledger
against this database, or execute `schema.sql` over an existing database.

To restore production binding settings explicitly, use
`python scripts/configure_pages.py --apply`. It checks repository identity,
preserves other bindings/variables, and never replaces an existing JWT secret
or creates a deployment. Production configuration is verified separately from
local runtime tests.

## Local development

Use Node 24 and npm. Each cloud task is already isolated; use the existing
checkout and do not create a Git worktree unless explicitly requested.

```sh
cd /workspace/shopnil
npm ci
npm run setup:local
npm run build
```

`setup:local` creates `.dev.vars` with a random local JWT signing secret only if
one is not already declared. It never prints or overwrites an existing secret.
It applies local migrations idempotently using Wrangler's **local** ledger and
`.wrangler/dev-state`. This state is separate from remote D1 and disposable tests.
Both `.dev.vars` and `.wrangler/` are ignored by Git.

Start the backend in one terminal:

```sh
npm run dev:api
```

It serves the built frontend and Pages Functions on port 8788. For frontend hot
reload, start another terminal:

```sh
npm run dev -- --host 0.0.0.0 --port 8080 --strictPort
```

Vite proxies `/api` to port 8788 while retaining the original Host/Origin for
CSRF checks. Cookie credentials are same-origin. For internal readiness checks:

```sh
curl --fail --silent http://127.0.0.1:8788/api/health
curl --fail --silent http://127.0.0.1:8080/api/health
```

Health returns 200 only when the auth schema, local D1/R2 bindings and a signing
secret are available; failures return 503 without exposing credentials or data.
Use an isolated D1/R2 pair before running branch previews against production;
the top-level binding declarations identify the production resources.

## Authentication and access control

JWTs use fixed HS256 signatures, issuer/audience/expiry checks and server-side
revocable sessions. They live in Secure, HttpOnly, SameSite cookies, never browser
local storage or response JSON. Mutations require a matching Origin. Passwords
use independently salted PBKDF2-SHA256 with 100,000 iterations, the supported
Workers WebCrypto iteration limit. Login and recovery requests are throttled.

No email verification or mail provider is used. Registration completes without
a recovery-code popup or save-code reminder. Existing saved recovery codes remain
valid: recovery requires the email and code, rotates the code, replaces the
password and revokes sessions. Users without a saved code must contact the
administrator. Only recovery-code digests are stored on the server.
Email/password changes require a login within the preceding five minutes.
Email changes are immediate; the account email is an identifier, not a claim of
verified mailbox ownership.

New registrations receive only the `user` role. The first registrant does not
automatically become an administrator. Register the intended owner through the
site, then explicitly promote that account with the management token:

```sh
python scripts/cloudflare_admin.py --email owner@example.com
```

The script verifies that the specified registered account exists and changes
only that account's roles. No password needs to be shared in chat.

The API allowlists identifiers/fields, binds SQL parameters, scopes customer
profiles/carts/wishlists/orders to their owner, hides private settings, and
requires staff/admin authority for privileged operations. Guest orders use a
separate random HttpOnly ownership cookie. Signed-in orders require the user's
session. Checkout verifies product/variation prices, shipping and coupons on
the server, then writes orders/items/ownership/coupon consumption atomically.
Spin outcomes and coupon codes are generated server-side.

## Media and external integrations

R2 stays private; `/api/media/products/...` and `/api/media/blog-images/...`
serve intended public product/blog media. Upload/delete requires an admin.
Uploads are size-bounded, sniffed, and immutable at an existing path. JPEG, PNG,
GIF, WebP, AVIF, MP4 and WebM are accepted. SVG, HTML and other active file types
are rejected. Image size is limited to 10 MB and video to 20 MB. No R2 S3 access
keys or public bucket domain are needed.

Facebook/TikTok conversion handlers, courier dispatch and courier-ratio lookup
run as Pages Functions and read their credentials server-side from site settings.
Private credential setting keys are hidden from public queries. Courier APIs
require staff access; conversion events have same-origin and rate-limit checks.
Actual paid courier/tracking service requests were not run because their
credentials were not configured. Missing credentials/failed upstream requests
produce explicit failures or disabled-tracking responses, not fake successful
courier statistics.

## Validation

```sh
npm run check
npm test
npm run test:schema
npm run pages:check
npm run build
```

The local HTTP smoke test starts from an empty disposable local database. Start
another backend with the local signing secret and a **new empty** `/tmp` state
directory, then run it with the matching directory:

```sh
XDG_CONFIG_HOME=/tmp/baridhara-cloudflare-config WRANGLER_LOG_PATH=/tmp/baridhara-smoke.log WRANGLER_SEND_METRICS=false npx wrangler pages dev dist --port 8789 --persist-to /tmp/baridhara-smoke-state
OFFER_SMOKE_STATE=/tmp/baridhara-smoke-state python scripts/test_cloudflare_runtime.py
```

The test refuses an initialized database and never accesses remote resources.
It exercises real Pages Functions/D1/R2: registration and roles, queries/joins,
compressed documents, private settings, CSRF, cart selections/wishlist/profile
isolation, upload/read/delete validation, abandoned carts, server pricing,
atomic writes/rollback, guest and account order ownership, coupon consumption,
spin outcomes, duplicate blocking, logout/login and one-time recovery.

Browser registration, the recovery dialog, secure session persistence and login
were also exercised against local Pages. No prior-backend network requests or
browser runtime exceptions were observed. Existing CSS import-order and large
bundle build warnings remain. Wrangler's optional Request.cf lookup cannot pass
the cloud machine's proxy; local operation succeeds with its documented fallback.


## Schema, security and performance audit

Run `python scripts/audit_schema.py` for a read-only comparison of the live D1
schema with the checked-in reference: tables, column names, indexes, views,
triggers and foreign keys. The audit found all 30 required tables and their
columns already present. Migration 0005 adds nine query/cleanup indexes; it does
not replace user data or create unnecessary tables.

The router now connects the existing catalog, product details, cart, checkout,
order success/history, wishlist, dashboard, CMS administration and blog pages.
A customer profile page uses the existing profile columns with owner-scoped
updates. An application error boundary supplies a reload action after unexpected
render/chunk failures rather than leaving the page blank.

JSON bodies are bounded while streaming (64 KiB for non-admin requests, 1 MiB
for admin content). Request paths, query operators and relationship names are
validated. Private product cost cannot be inferred through sorting or count
filters; financial tables are not readable by moderators. Moderator spin edits
are restricted to entry status. Review IDs/timestamps are server-owned. API and
static response security headers are set without breaking authored scripts or
same-origin editor previews.

Dashboard statistics use one authorized aggregate API call instead of ten and
no longer truncate revenue at the list-query row limit. Product/variation reads
are batched at checkout, including the tested 30-item case. Selected-field queries
avoid fetching the complete sales-page JSON document. Insert/upsert/update
responses use actual SQLite RETURNING IDs, including after a filter field changes.
Zero-priced products and explicitly zero shipping rates are supported consistently.

Public media reads bypass session/D1 lookups, support ETag 304 responses, and use
metadata-only HEAD requests. Fingerprinted static assets have immutable browser
caching. Sales templates and the legacy renderer load on demand; the SalesPage
entry chunk changed from 744,150 bytes to approximately 17 KB, with selected
renderer/shared chunks loaded separately. This is a bundle-organization measure,
not a claim about a measured live network or Lighthouse speed improvement.
The duplicate invalid CSS font import was removed; the HTML font stylesheet and
preconnects remain.


Migration 0006 corrects product foreign-key deletion behavior for order and
purchase snapshots: deleting a product clears the product reference while
retaining historical names, quantities and prices. Existing order rows are
copied intact; deleting an order still removes its own detail rows. Schema
validation also compares column types/primary keys and foreign-key delete rules.
A populated local migration check preserved all 34 existing test order items.
