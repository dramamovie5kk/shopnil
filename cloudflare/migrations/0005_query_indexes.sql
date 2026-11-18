-- Bound cleanup and accelerate frequent customer/admin lookups without changing user data.
CREATE INDEX idx_request_limits_expiry ON request_limits(expires_at);
CREATE INDEX idx_auth_sessions_expiry ON auth_sessions(expires_at);
CREATE INDEX idx_checkout_guards_expiry ON checkout_guards(expires_at);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_user_created_at ON orders(user_id,created_at DESC);
CREATE INDEX idx_sales_pages_active_created_at ON sales_pages(is_active,created_at DESC);
CREATE INDEX idx_reviews_product_approval_created_at ON product_reviews(product_id,is_approved,created_at DESC);
CREATE INDEX idx_spin_offers_active_sort ON spin_offers(is_active,sort_order);
CREATE INDEX idx_blog_posts_published_created_at ON blog_posts(is_published,created_at DESC);
