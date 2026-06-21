ALTER TABLE users
    ADD COLUMN google_id VARCHAR(255) NULL,
    ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    MODIFY password VARCHAR(255) NULL;

CREATE UNIQUE INDEX idx_users_google_id ON users (google_id);
