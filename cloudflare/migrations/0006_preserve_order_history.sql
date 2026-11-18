-- Product deletion must retain historical order/purchase snapshots.
-- Copy every existing column before replacing only the product FK delete action.

CREATE TABLE "order_items_new" (
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
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL,
  FOREIGN KEY ("variation_id") REFERENCES "product_variations"("id") ON DELETE SET NULL
);
INSERT INTO "order_items_new"("created_at","id","order_id","product_id","product_name","product_price","quantity","variation_id","variation_name") SELECT "created_at","id","order_id","product_id","product_name","product_price","quantity","variation_id","variation_name" FROM "order_items";
DROP TABLE "order_items";
ALTER TABLE "order_items_new" RENAME TO "order_items";


CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");
CREATE INDEX "idx_order_items_product_id" ON "order_items"("product_id");
CREATE INDEX "idx_order_items_variation_id" ON "order_items"("variation_id");


CREATE TABLE "purchase_order_items_new" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "product_id" TEXT,
  "product_name" TEXT NOT NULL,
  "purchase_order_id" TEXT NOT NULL,
  "quantity" REAL NOT NULL DEFAULT 1,
  "total_cost" REAL NOT NULL,
  "unit_cost" REAL NOT NULL,
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL,
  FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
);
INSERT INTO "purchase_order_items_new"("created_at","id","product_id","product_name","purchase_order_id","quantity","total_cost","unit_cost") SELECT "created_at","id","product_id","product_name","purchase_order_id","quantity","total_cost","unit_cost" FROM "purchase_order_items";
DROP TABLE "purchase_order_items";
ALTER TABLE "purchase_order_items_new" RENAME TO "purchase_order_items";


CREATE INDEX "idx_purchase_order_items_product_id" ON "purchase_order_items"("product_id");
CREATE INDEX "idx_purchase_order_items_purchase_order_id" ON "purchase_order_items"("purchase_order_id");

