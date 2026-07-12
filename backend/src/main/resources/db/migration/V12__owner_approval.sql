ALTER TABLE users
    ADD COLUMN owner_approval_status VARCHAR(20) NULL,
    ADD COLUMN owner_pg_name VARCHAR(255) NULL,
    ADD COLUMN owner_address VARCHAR(500) NULL,
    ADD COLUMN owner_verification_docs JSON NULL;

UPDATE users
SET owner_approval_status = 'APPROVED'
WHERE role = 'PG_OWNER';

CREATE INDEX idx_users_owner_approval ON users (role, owner_approval_status);
