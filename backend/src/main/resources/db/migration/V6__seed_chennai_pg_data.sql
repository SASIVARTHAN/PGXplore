-- Additional Chennai PG listings for South Chennai coverage (Perungalathur, Guduvanchery, Pallavaram)
INSERT INTO pg_listings (name, description, address, city, area, latitude, longitude, rent, deposit, gender, amenities, available_beds, available_rooms, food_available, contact_number, rating, reviews_count, owner_id, created_at) VALUES
('Sunrise Co-Living', 'Premium co-living space near SRM with spacious rooms and community workspace.', '14 College Road', 'Chennai', 'Perungalathur', 12.90450000, 80.09520000, 7500.00, 15000.00, 'CO_LIVING', '["WiFi","AC","Housekeeping","Security","Parking","Laundry"]', 1, 1, FALSE, '9876543211', 4.70, 1, 2, NOW()),
('Green Valley Girls PG', 'Budget-friendly girls PG with daily housekeeping and home-style meals.', '22 Guduvanchery Main Road', 'Chennai', 'Guduvanchery', 12.84560000, 80.06230000, 6200.00, 12000.00, 'GIRLS', '["WiFi","Food","Laundry","Security","Power Backup"]', 2, 1, TRUE, '9876543212', 4.00, 1, 3, NOW()),
('City Comfort PG', 'Convenient PG near Pallavaram airport road with quick city access.', '8 Airport Road', 'Chennai', 'Pallavaram', 12.96780000, 80.15210000, 5800.00, 9000.00, 'BOYS', '["WiFi","Food","Laundry","Parking"]', 3, 2, TRUE, '9876543211', 3.90, 1, 2, NOW()),
('Elite Residency PG', 'Upscale co-living PG with furnished rooms and premium amenities.', '19 Chromepet High Road', 'Chennai', 'Chromepet', 12.95180000, 80.14150000, 7200.00, 14000.00, 'CO_LIVING', '["WiFi","Food","AC","Laundry","Security","Housekeeping","Parking"]', 2, 1, TRUE, '9876543212', 4.40, 1, 3, NOW()),
('Campus Nest PG', 'Student-friendly PG walking distance from colleges in Perungalathur.', '6 Vandalur Road', 'Chennai', 'Perungalathur', 12.89870000, 80.08890000, 6400.00, 11000.00, 'GIRLS', '["WiFi","Food","Laundry","Security","Housekeeping"]', 3, 2, TRUE, '9876543212', 4.30, 1, 3, NOW()),
('Royal Heights Boys PG', 'Modern boys PG near Tambaram with AC rooms and flexible meal plans.', '33 GST Road', 'Chennai', 'Tambaram', 12.93120000, 80.11870000, 6800.00, 10500.00, 'BOYS', '["WiFi","Food","AC","Laundry","Power Backup","Parking"]', 1, 1, TRUE, '9876543211', 4.10, 1, 2, NOW());

INSERT INTO pg_images (pg_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', TRUE FROM pg_listings WHERE name = 'Sunrise Co-Living' AND city = 'Chennai' LIMIT 1;

INSERT INTO pg_images (pg_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', TRUE FROM pg_listings WHERE name = 'Green Valley Girls PG' LIMIT 1;

INSERT INTO pg_images (pg_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600573472591-ee6b68c2a34a?w=800', TRUE FROM pg_listings WHERE name = 'City Comfort PG' LIMIT 1;

INSERT INTO pg_images (pg_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', TRUE FROM pg_listings WHERE name = 'Elite Residency PG' LIMIT 1;

INSERT INTO pg_images (pg_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600596542815-ffad4cec1531?w=800', TRUE FROM pg_listings WHERE name = 'Campus Nest PG' LIMIT 1;

INSERT INTO pg_images (pg_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', TRUE FROM pg_listings WHERE name = 'Royal Heights Boys PG' LIMIT 1;

INSERT INTO reviews (user_id, pg_id, rating, review_text, created_at)
SELECT 4, id, 5, 'Great location and amenities. Highly recommended!', NOW() FROM pg_listings WHERE name = 'Sunrise Co-Living' AND city = 'Chennai' LIMIT 1;

INSERT INTO reviews (user_id, pg_id, rating, review_text, created_at)
SELECT 4, id, 4, 'Affordable and peaceful locality.', NOW() FROM pg_listings WHERE name = 'Green Valley Girls PG' LIMIT 1;
