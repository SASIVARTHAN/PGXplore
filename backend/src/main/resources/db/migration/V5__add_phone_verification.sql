ALTER TABLE users
    ADD COLUMN firebase_uid VARCHAR(128) NULL,
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX idx_users_firebase_uid ON users (firebase_uid);
CREATE UNIQUE INDEX idx_users_phone ON users (phone);
