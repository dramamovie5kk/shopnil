"""Contract checks for the new D1 schema, using local SQLite only."""
from pathlib import Path
import re
import json
import sqlite3
import unittest

ROOT = Path(__file__).resolve().parents[1]


class D1SchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        for migration in sorted((ROOT / "cloudflare/migrations").glob("*.sql")):
            self.db.executescript(migration.read_text())

    def tearDown(self):
        self.db.close()

    def test_all_application_columns_are_present(self):
        source = (ROOT / "src/integrations/cloudflare/types.ts").read_text().split("    Views:")[0]
        tables = re.findall(r"^      (\w+): \{\n        Row: \{(.*?)\n        \}", source, re.M | re.S)
        self.assertEqual(len(tables), 25)
        for name, body in tables:
            expected = set(re.findall(r"^          (\w+):", body, re.M))
            actual = {r[1] for r in self.db.execute(f'PRAGMA table_info("{name}")')}
            mapping = json.loads((ROOT / "cloudflare/schema.json").read_text())[name]["columns"]
            embedded = {k for k, v in mapping.items() if v["embedded"]}
            self.assertEqual(expected, (actual - ({"content"} if name == "sales_pages" else set())) | embedded, name)
            self.assertLessEqual(len(actual), 100)

    def test_order_defaults_and_nonnegative_amount(self):
        self.db.execute("INSERT INTO orders(customer_name,customer_phone,customer_address,customer_city,total_amount) VALUES ('Test','01700000000','Address','Dhaka',100)")
        order_id, status, method, timestamp = self.db.execute("SELECT id,status,payment_method,created_at FROM orders").fetchone()
        self.assertRegex(order_id, r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
        self.assertEqual((status, method), ("pending", "cod"))
        self.assertTrue(timestamp.endswith("Z"))
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE orders SET total_amount=-1")

    def test_unique_settings_support_upsert(self):
        self.db.execute("INSERT INTO site_settings(setting_key,setting_value) VALUES ('site_name','First')")
        self.db.execute("INSERT INTO site_settings(setting_key,setting_value) VALUES ('site_name','Second') ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value")
        self.assertEqual(self.db.execute("SELECT setting_value FROM site_settings").fetchall(), [("Second",)])

    def test_json_validation(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO sales_pages(hero_headline,offer_price,slug,title,template_styles) VALUES ('Heading',10,'test','Test','not-json')")

    def test_foreign_keys_and_order_deletion(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO order_items(order_id,product_name,product_price,quantity) VALUES ('missing','Test',1,1)")
        self.db.execute("INSERT INTO orders(id,customer_name,customer_phone,customer_address,customer_city,total_amount) VALUES ('order','Test','01700000000','Address','Dhaka',100)")
        self.db.execute("INSERT INTO order_items(order_id,product_name,product_price,quantity) VALUES ('order','Test',100,1)")
        self.db.execute("DELETE FROM orders WHERE id='order'")
        self.assertEqual(self.db.execute("SELECT count(*) FROM order_items").fetchone()[0], 0)

    def test_review_projection_omits_phone_and_pending_reviews(self):
        self.db.execute("INSERT INTO products(id,name,name_bn,price,slug) VALUES ('product','Test','Test',10,'test')")
        self.db.execute("INSERT INTO product_reviews(product_id,customer_name,customer_phone,rating,is_approved) VALUES ('product','Test','01700000000',5,0)")
        self.assertEqual(self.db.execute("SELECT * FROM product_reviews_public").fetchall(), [])
        self.db.execute("UPDATE product_reviews SET is_approved=1")
        cursor = self.db.execute("SELECT * FROM product_reviews_public")
        self.assertEqual(len(cursor.fetchall()), 1)
        self.assertNotIn("customer_phone", [col[0] for col in cursor.description])

    def test_complete_schema_matches_migrations(self):
        other = sqlite3.connect(":memory:")
        other.executescript((ROOT / "cloudflare/schema.sql").read_text())
        sql = "SELECT name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name"
        self.assertEqual(self.db.execute(sql).fetchall(), other.execute(sql).fetchall())
        other.close()

    def test_auth_email_uniqueness_and_session_references(self):
        self.db.execute("INSERT INTO auth_users(id,email,password_hash,recovery_digest) VALUES ('u','Owner@Example.com','hash','digest')")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO auth_users(id,email,password_hash,recovery_digest) VALUES ('other','owner@example.com','hash','digest')")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO auth_sessions(id,user_id,expires_at,authenticated_at) VALUES ('s','missing',1,1)")

    def test_product_deletion_preserves_order_and_purchase_snapshots(self):
        self.db.execute("INSERT INTO products(id,name,name_bn,price,slug) VALUES ('product','Product','Product',100,'product')")
        self.db.execute("INSERT INTO orders(id,customer_name,customer_phone,customer_address,customer_city,total_amount) VALUES ('order','Test','01700000000','Address','Dhaka',100)")
        self.db.execute("INSERT INTO order_items(order_id,product_id,product_name,product_price,quantity) VALUES ('order','product','Saved product name',100,1)")
        self.db.execute("INSERT INTO purchase_orders(id) VALUES ('purchase')")
        self.db.execute("INSERT INTO purchase_order_items(purchase_order_id,product_id,product_name,quantity,unit_cost,total_cost) VALUES ('purchase','product','Saved product name',1,70,70)")
        self.db.execute("DELETE FROM products WHERE id='product'")
        self.assertEqual(self.db.execute("SELECT product_id,product_name,product_price,quantity FROM order_items").fetchall(), [(None,'Saved product name',100,1)])
        self.assertEqual(self.db.execute("SELECT product_id,product_name,unit_cost,total_cost FROM purchase_order_items").fetchall(), [(None,'Saved product name',70,70)])

    def test_roles_are_constrained(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO user_roles(user_id,role) VALUES ('user','superuser')")


if __name__ == "__main__":
    unittest.main()
