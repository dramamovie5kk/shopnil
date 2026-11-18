CREATE UNIQUE INDEX uq_blocked_users_phone ON blocked_users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX uq_blocked_users_ip ON blocked_users(ip_address) WHERE ip_address IS NOT NULL;
