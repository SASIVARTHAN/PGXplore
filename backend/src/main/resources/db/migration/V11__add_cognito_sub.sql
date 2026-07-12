ALTER TABLE users
    ADD COLUMN cognito_sub VARCHAR(255) NULL;

CREATE UNIQUE INDEX idx_users_cognito_sub ON users (cognito_sub);
