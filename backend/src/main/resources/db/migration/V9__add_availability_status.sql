ALTER TABLE pg_listings
    ADD COLUMN availability_status VARCHAR(20) NOT NULL DEFAULT 'active' AFTER owner_contact_name;

UPDATE pg_listings
SET availability_status = 'full'
WHERE available_beds = 0;

UPDATE pg_listings
SET availability_status = 'active'
WHERE available_beds > 0;
