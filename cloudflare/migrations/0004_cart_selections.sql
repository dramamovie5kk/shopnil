-- Preserve saved selections and allow distinct variation groups in a signed-in cart.
CREATE TABLE "cart_items_new" (
  "created_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "product_id" TEXT NOT NULL,
  "quantity" REAL NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 1000),
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "user_id" TEXT NOT NULL,
  selection_key TEXT NOT NULL DEFAULT '',
  variation_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(variation_ids)),
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  UNIQUE ("user_id", "product_id", "selection_key")
);
INSERT INTO cart_items_new(created_at,id,product_id,quantity,updated_at,user_id) SELECT created_at,id,product_id,quantity,updated_at,user_id FROM cart_items;
DROP TABLE cart_items;
ALTER TABLE cart_items_new RENAME TO cart_items;
CREATE TRIGGER "cart_items_updated_at" AFTER UPDATE ON "cart_items"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "cart_items" SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = NEW.id;
END;

CREATE INDEX "idx_cart_items_product_id" ON "cart_items"("product_id");
CREATE INDEX "idx_cart_items_user_id" ON "cart_items"("user_id");

CREATE UNIQUE INDEX uq_abandoned_session_phone ON abandoned_carts(session_id,customer_phone);
