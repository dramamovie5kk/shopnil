-- Cloudflare D1 / SQLite initial schema for a NEW, EMPTY application database.
-- Derived from the application database types; defaults below are explicit new-schema choices.
-- No Supabase data, passwords, files, or PostgreSQL policies are imported.
-- Authorization must be enforced by Pages Functions; D1 has no PostgreSQL RLS.
PRAGMA foreign_keys = ON;

CREATE TABLE "abandoned_carts" (
  "cart_data" TEXT CHECK ("cart_data" IS NULL OR json_valid("cart_data")),
  "checkout_step" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "customer_ip" TEXT,
  "customer_phone" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "session_id" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "user_id" TEXT
);

CREATE TRIGGER "abandoned_carts_updated_at" AFTER UPDATE ON "abandoned_carts"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "abandoned_carts" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_abandoned_carts_session_id" ON "abandoned_carts"("session_id");
CREATE INDEX "idx_abandoned_carts_user_id" ON "abandoned_carts"("user_id");

CREATE TABLE "blocked_users" (
  "block_type" TEXT,
  "blocked_by" TEXT,
  "blocked_until" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "ip_address" TEXT,
  "phone" TEXT,
  "reason" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER "blocked_users_updated_at" AFTER UPDATE ON "blocked_users"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "blocked_users" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;


CREATE TABLE "blog_posts" (
  "button_link" TEXT,
  "button_text" TEXT,
  "content" TEXT,
  "content_bn" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "featured_image" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "images" TEXT CHECK ("images" IS NULL OR json_valid("images")),
  "is_published" INTEGER DEFAULT 1 CHECK ("is_published" IN (0,1)),
  "product_id" TEXT,
  "sections" TEXT CHECK ("sections" IS NULL OR json_valid("sections")),
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "title_bn" TEXT NOT NULL DEFAULT '',
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "video_url" TEXT,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL
);

CREATE TRIGGER "blog_posts_updated_at" AFTER UPDATE ON "blog_posts"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "blog_posts" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_blog_posts_product_id" ON "blog_posts"("product_id");

CREATE TABLE "cart_items" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "product_id" TEXT NOT NULL,
  "quantity" REAL NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 1000),
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "user_id" TEXT NOT NULL,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  UNIQUE ("user_id", "product_id")
);

CREATE TRIGGER "cart_items_updated_at" AFTER UPDATE ON "cart_items"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "cart_items" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_cart_items_product_id" ON "cart_items"("product_id");
CREATE INDEX "idx_cart_items_user_id" ON "cart_items"("user_id");

CREATE TABLE "categories" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "icon" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "image_url" TEXT,
  "name" TEXT NOT NULL,
  "name_bn" TEXT NOT NULL,
  "parent_id" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "sort_order" REAL NOT NULL DEFAULT 0,
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_categories_parent_id" ON "categories"("parent_id");

CREATE TABLE "expense_categories" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "icon" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "name" TEXT NOT NULL,
  "name_bn" TEXT NOT NULL
);


CREATE TABLE "order_items" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "order_id" TEXT NOT NULL,
  "product_id" TEXT,
  "product_name" TEXT NOT NULL,
  "product_price" REAL NOT NULL CHECK (product_price >= 0),
  "quantity" REAL NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 1000),
  "variation_id" TEXT,
  "variation_name" TEXT,
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  FOREIGN KEY ("variation_id") REFERENCES "product_variations"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");
CREATE INDEX "idx_order_items_product_id" ON "order_items"("product_id");
CREATE INDEX "idx_order_items_variation_id" ON "order_items"("variation_id");

CREATE TABLE "order_logs" (
  "action" TEXT NOT NULL,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "new_status" TEXT,
  "notes" TEXT,
  "old_status" TEXT,
  "order_id" TEXT NOT NULL,
  "performed_by" TEXT,
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_order_logs_order_id" ON "order_logs"("order_id");

CREATE TABLE "orders" (
  "coupon_code" TEXT,
  "coupon_discount" REAL CHECK (coupon_discount >= 0),
  "courier_consignment_id" TEXT,
  "courier_id" TEXT,
  "courier_ratio_data" TEXT CHECK ("courier_ratio_data" IS NULL OR json_valid("courier_ratio_data")),
  "courier_sent_at" TEXT,
  "courier_tracking_code" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "customer_address" TEXT NOT NULL,
  "customer_city" TEXT NOT NULL,
  "customer_ip" TEXT,
  "customer_name" TEXT NOT NULL,
  "customer_phone" TEXT NOT NULL,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "is_duplicate_blocked" INTEGER DEFAULT 0 CHECK ("is_duplicate_blocked" IN (0,1)),
  "notes" TEXT,
  "order_source" TEXT,
  "payment_method" TEXT NOT NULL DEFAULT 'cod',
  "purchase_event_id" TEXT,
  "shipping_cost" REAL CHECK (shipping_cost >= 0),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "total_amount" REAL NOT NULL CHECK (total_amount >= 0),
  "tracking_data" TEXT CHECK ("tracking_data" IS NULL OR json_valid("tracking_data")),
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "user_id" TEXT
);

CREATE TRIGGER "orders_updated_at" AFTER UPDATE ON "orders"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "orders" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_orders_courier_consignment_id" ON "orders"("courier_consignment_id");
CREATE INDEX "idx_orders_courier_id" ON "orders"("courier_id");
CREATE INDEX "idx_orders_purchase_event_id" ON "orders"("purchase_event_id");
CREATE INDEX "idx_orders_user_id" ON "orders"("user_id");

CREATE TABLE "pages" (
  "content" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "is_published" INTEGER DEFAULT 1 CHECK ("is_published" IN (0,1)),
  "meta_description" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "sort_order" REAL DEFAULT 0,
  "title" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER "pages_updated_at" AFTER UPDATE ON "pages"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "pages" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;


CREATE TABLE "product_reviews" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "customer_name" TEXT NOT NULL,
  "customer_phone" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "is_approved" INTEGER DEFAULT 0 CHECK ("is_approved" IN (0,1)),
  "product_id" TEXT NOT NULL,
  "rating" REAL NOT NULL DEFAULT 0 CHECK (rating BETWEEN 1 AND 5),
  "review_text" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "user_id" TEXT,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE TRIGGER "product_reviews_updated_at" AFTER UPDATE ON "product_reviews"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "product_reviews" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_product_reviews_product_id" ON "product_reviews"("product_id");
CREATE INDEX "idx_product_reviews_user_id" ON "product_reviews"("user_id");

CREATE TABLE "product_variations" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "group_name" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "image_url" TEXT,
  "is_default" INTEGER DEFAULT 0 CHECK ("is_default" IN (0,1)),
  "price" REAL NOT NULL CHECK (price >= 0),
  "product_id" TEXT NOT NULL,
  "sort_order" REAL DEFAULT 0,
  "stock" REAL DEFAULT 0,
  "variation_name" TEXT NOT NULL,
  "variation_type" TEXT NOT NULL DEFAULT 'size',
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_product_variations_product_id" ON "product_variations"("product_id");

CREATE TABLE "products" (
  "catalog_id" REAL,
  "category_id" TEXT,
  "cost_price" REAL,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "description" TEXT,
  "description_bn" TEXT,
  "free_shipping" INTEGER DEFAULT 0 CHECK ("free_shipping" IN (0,1)),
  "has_variations" INTEGER DEFAULT 0 CHECK ("has_variations" IN (0,1)),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "image_url" TEXT,
  "images" TEXT CHECK ("images" IS NULL OR json_valid("images")),
  "is_featured" INTEGER DEFAULT 0 CHECK ("is_featured" IN (0,1)),
  "is_new" INTEGER DEFAULT 0 CHECK ("is_new" IN (0,1)),
  "low_stock_threshold" REAL,
  "name" TEXT NOT NULL,
  "name_bn" TEXT NOT NULL,
  "original_price" REAL,
  "price" REAL NOT NULL CHECK (price >= 0),
  "rating" REAL DEFAULT 0,
  "review_images" TEXT CHECK ("review_images" IS NULL OR json_valid("review_images")),
  "reviews_count" REAL DEFAULT 0,
  "shipping_inside_dhaka" REAL,
  "shipping_outside_dhaka" REAL,
  "short_description" TEXT,
  "short_description_bn" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "stock" REAL DEFAULT 0,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "variation_type" TEXT,
  "video_url" TEXT,
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
);

CREATE TRIGGER "products_updated_at" AFTER UPDATE ON "products"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "products" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_products_catalog_id" ON "products"("catalog_id");
CREATE INDEX "idx_products_category_id" ON "products"("category_id");

CREATE TABLE "profiles" (
  "address" TEXT,
  "city" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "full_name" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "phone" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "user_id" TEXT NOT NULL UNIQUE
);

CREATE TRIGGER "profiles_updated_at" AFTER UPDATE ON "profiles"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "profiles" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_profiles_user_id" ON "profiles"("user_id");

CREATE TABLE "purchase_order_items" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "product_id" TEXT,
  "product_name" TEXT NOT NULL,
  "purchase_order_id" TEXT NOT NULL,
  "quantity" REAL NOT NULL DEFAULT 1,
  "total_cost" REAL NOT NULL,
  "unit_cost" REAL NOT NULL,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_purchase_order_items_product_id" ON "purchase_order_items"("product_id");
CREATE INDEX "idx_purchase_order_items_purchase_order_id" ON "purchase_order_items"("purchase_order_id");

CREATE TABLE "purchase_orders" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "created_by" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "notes" TEXT,
  "order_date" TEXT NOT NULL DEFAULT (date('now')),
  "received_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "supplier_id" TEXT,
  "total_amount" REAL NOT NULL DEFAULT 0,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL
);

CREATE TRIGGER "purchase_orders_updated_at" AFTER UPDATE ON "purchase_orders"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "purchase_orders" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_purchase_orders_supplier_id" ON "purchase_orders"("supplier_id");

CREATE TABLE "sales_pages" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "hero_headline" TEXT NOT NULL,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "is_active" INTEGER DEFAULT 1 CHECK ("is_active" IN (0,1)),
  "offer_price" REAL NOT NULL,
  "original_price" REAL,
  "product_id" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "template_id" TEXT,
  "template_styles" TEXT CHECK ("template_styles" IS NULL OR json_valid("template_styles")),
  "title" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  content TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(content)),
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL
);

CREATE TRIGGER "sales_pages_updated_at" AFTER UPDATE ON "sales_pages"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "sales_pages" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_sales_pages_product_id" ON "sales_pages"("product_id");
CREATE INDEX "idx_sales_pages_template_id" ON "sales_pages"("template_id");

CREATE TABLE "site_settings" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "setting_key" TEXT NOT NULL UNIQUE,
  "setting_value" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER "site_settings_updated_at" AFTER UPDATE ON "site_settings"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "site_settings" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;


CREATE TABLE "spin_entries" (
  "coupon_code" TEXT NOT NULL UNIQUE,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "customer_name" TEXT NOT NULL,
  "customer_phone" TEXT NOT NULL,
  "discount_type" TEXT NOT NULL DEFAULT 'fixed',
  "discount_value" REAL NOT NULL DEFAULT 0,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "is_used" INTEGER NOT NULL DEFAULT 0 CHECK ("is_used" IN (0,1)),
  "offer_id" TEXT,
  "offer_text" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "used_order_id" TEXT,
  FOREIGN KEY ("offer_id") REFERENCES "spin_offers"("id") ON DELETE SET NULL,
  FOREIGN KEY ("used_order_id") REFERENCES "orders"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_spin_entries_offer_id" ON "spin_entries"("offer_id");
CREATE INDEX "idx_spin_entries_used_order_id" ON "spin_entries"("used_order_id");

CREATE TABLE "spin_offers" (
  "color" TEXT NOT NULL DEFAULT '#7c3aed',
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "discount_type" TEXT NOT NULL DEFAULT 'fixed',
  "discount_value" REAL NOT NULL DEFAULT 0,
  "icon" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "is_active" INTEGER NOT NULL DEFAULT 0 CHECK ("is_active" IN (0,1)),
  "offer_text" TEXT NOT NULL,
  "probability" REAL NOT NULL DEFAULT 1,
  "sort_order" REAL NOT NULL DEFAULT 0,
  "text_color" TEXT NOT NULL DEFAULT '#ffffff',
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER "spin_offers_updated_at" AFTER UPDATE ON "spin_offers"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "spin_offers" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;


CREATE TABLE "stock_history" (
  "change_type" TEXT NOT NULL,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "created_by" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "new_stock" REAL NOT NULL,
  "notes" TEXT,
  "previous_stock" REAL NOT NULL,
  "product_id" TEXT NOT NULL,
  "quantity_change" REAL NOT NULL,
  "reference_id" TEXT,
  "reference_type" TEXT,
  "unit_cost" REAL,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT
);

CREATE INDEX "idx_stock_history_product_id" ON "stock_history"("product_id");
CREATE INDEX "idx_stock_history_reference_id" ON "stock_history"("reference_id");

CREATE TABLE "suppliers" (
  "address" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "email" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "name" TEXT NOT NULL,
  "notes" TEXT,
  "phone" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER "suppliers_updated_at" AFTER UPDATE ON "suppliers"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "suppliers" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;


CREATE TABLE "transactions" (
  "amount" REAL NOT NULL,
  "category_id" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "created_by" TEXT,
  "description" TEXT,
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "notes" TEXT,
  "order_id" TEXT,
  "transaction_date" TEXT NOT NULL DEFAULT (date('now')),
  "type" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE SET NULL,
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL
);

CREATE TRIGGER "transactions_updated_at" AFTER UPDATE ON "transactions"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "transactions" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_transactions_category_id" ON "transactions"("category_id");
CREATE INDEX "idx_transactions_order_id" ON "transactions"("order_id");

CREATE TABLE "user_roles" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "role" TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','moderator','user')),
  "user_id" TEXT NOT NULL,
  UNIQUE ("user_id", "role")
);

CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id");

CREATE TABLE "wishlist" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "product_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  UNIQUE ("user_id", "product_id")
);

CREATE INDEX "idx_wishlist_product_id" ON "wishlist"("product_id");
CREATE INDEX "idx_wishlist_user_id" ON "wishlist"("user_id");

-- Public projection deliberately omits customer_phone and hides unapproved reviews.
CREATE VIEW product_reviews_public AS
SELECT id, product_id, user_id, customer_name, rating, review_text,
       is_approved, created_at, updated_at
FROM product_reviews WHERE is_approved = 1;

CREATE INDEX idx_orders_customer_phone_created_at ON orders(customer_phone, created_at);
CREATE INDEX idx_orders_customer_ip_created_at ON orders(customer_ip, created_at);
CREATE INDEX idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX idx_abandoned_carts_session_phone ON abandoned_carts(session_id, customer_phone);
CREATE INDEX idx_blocked_users_phone ON blocked_users(phone);
CREATE INDEX idx_blocked_users_ip_address ON blocked_users(ip_address);
