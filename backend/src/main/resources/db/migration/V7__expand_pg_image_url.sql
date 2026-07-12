-- Support uploaded image data URLs and long Firebase storage URLs
ALTER TABLE pg_images MODIFY COLUMN image_url MEDIUMTEXT NOT NULL;
