-- Authentication is independent of the application role/profile tables.
CREATE TABLE auth_users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  recovery_digest TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  authenticated_at INTEGER NOT NULL
);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE TABLE request_limits (
  key TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE guest_orders (
  order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  owner_digest TEXT NOT NULL
);
CREATE INDEX idx_guest_orders_owner ON guest_orders(owner_digest);
-- Server-owned lock and coupon consumption guard against concurrent checkout.
CREATE TABLE checkout_guards (
  key TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
