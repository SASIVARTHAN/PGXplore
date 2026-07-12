-- Enable additional phone for Cognito OTP sign-in (seeded local user row).
-- Cognito still sends the real SMS; this row is created/linked on first successful Cognito login,
-- but seeding avoids "no account" edge cases for demo/docs.
INSERT INTO users (name, email, password, phone, phone_verified, role, is_verified, created_at)
SELECT 'Salman User', '6305435539@phone.pgxplore.local', NULL, '6305435539', TRUE, 'USER', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '6305435539');
