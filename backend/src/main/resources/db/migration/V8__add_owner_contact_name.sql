ALTER TABLE pg_listings
    ADD COLUMN owner_contact_name VARCHAR(100) NULL AFTER contact_number;

UPDATE pg_listings pl
    JOIN users u ON pl.owner_id = u.id
SET pl.owner_contact_name = u.name
WHERE pl.owner_contact_name IS NULL;
