-- PGXplore PostgreSQL Schema
-- Phase 2 backend database structure

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pg_listings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  area VARCHAR(100) NOT NULL,
  address TEXT,
  gender VARCHAR(20) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  deposit INTEGER NOT NULL,
  food_available BOOLEAN DEFAULT FALSE,
  food_type VARCHAR(20),
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  owner_name VARCHAR(100),
  owner_phone VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pg_images (
  id SERIAL PRIMARY KEY,
  pg_id INTEGER REFERENCES pg_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE sharing_options (
  id SERIAL PRIMARY KEY,
  pg_id INTEGER REFERENCES pg_listings(id) ON DELETE CASCADE,
  sharing_type VARCHAR(20) NOT NULL,
  price INTEGER NOT NULL,
  vacancies INTEGER NOT NULL DEFAULT 0,
  total_beds INTEGER NOT NULL
);

CREATE TABLE amenities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE pg_amenities (
  pg_id INTEGER REFERENCES pg_listings(id) ON DELETE CASCADE,
  amenity_id INTEGER REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (pg_id, amenity_id)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  pg_id INTEGER REFERENCES pg_listings(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  pg_id INTEGER REFERENCES pg_listings(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_listings (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  pg_id INTEGER REFERENCES pg_listings(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, pg_id)
);

-- Seed amenities
INSERT INTO amenities (name) VALUES
  ('WiFi'), ('Food'), ('Laundry'), ('Power Backup'),
  ('Security'), ('AC'), ('Housekeeping'), ('Parking');

-- Demo admin (password should be hashed in production)
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Admin', 'admin@pgxplore.com', '<bcrypt_hash>', 'admin');
