ALTER TABLE pg_listings
    ADD COLUMN listing_status VARCHAR(20) NOT NULL DEFAULT 'approved' AFTER availability_status;

UPDATE pg_listings SET listing_status = 'approved';
