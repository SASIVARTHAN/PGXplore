-- Seed users (password: Password@123 — BCrypt hash)
INSERT INTO users (name, email, password, phone, role, is_verified, created_at) VALUES
('Admin User', 'admin@pgxplore.com', '$2b$10$3Eut4ngWnz0cThT.FO8OdOr15/qpvgIDDJa7sL4j/iaEImOMlAi5K', '9876543210', 'ADMIN', TRUE, NOW()),
('Rajesh Kumar', 'rajesh@example.com', '$2b$10$3Eut4ngWnz0cThT.FO8OdOr15/qpvgIDDJa7sL4j/iaEImOMlAi5K', '9876543211', 'PG_OWNER', TRUE, NOW()),
('Priya Sharma', 'priya@example.com', '$2b$10$3Eut4ngWnz0cThT.FO8OdOr15/qpvgIDDJa7sL4j/iaEImOMlAi5K', '9876543212', 'PG_OWNER', TRUE, NOW()),
('Ananya Reddy', 'ananya@example.com', '$2b$10$3Eut4ngWnz0cThT.FO8OdOr15/qpvgIDDJa7sL4j/iaEImOMlAi5K', '9876543213', 'USER', TRUE, NOW());

-- Chennai PGs (owner: Rajesh = id 2)
INSERT INTO pg_listings (name, description, address, city, area, latitude, longitude, rent, deposit, gender, amenities, available_beds, available_rooms, food_available, contact_number, rating, reviews_count, owner_id, created_at) VALUES
('Green Nest PG', 'Spacious boys PG near Tambaram railway station with WiFi, AC, and home-style food.', '12 Station Road', 'Chennai', 'Tambaram', 12.92490000, 80.10000000, 6500.00, 5000.00, 'BOYS', '["WiFi","AC","Parking","Laundry","Food"]', 4, 2, TRUE, '9876543211', 4.50, 2, 2, NOW()),
('Sunrise Ladies PG', 'Safe and secure girls PG in Chromepet with CCTV and vegetarian meals.', '45 GST Road', 'Chennai', 'Chromepet', 12.95160000, 80.14020000, 7500.00, 6000.00, 'GIRLS', '["WiFi","CCTV","Food","Laundry"]', 2, 1, TRUE, '9876543211', 4.20, 1, 2, NOW());

-- Bangalore PG (owner: Priya = id 3)
INSERT INTO pg_listings (name, description, address, city, area, latitude, longitude, rent, deposit, gender, amenities, available_beds, available_rooms, food_available, contact_number, rating, reviews_count, owner_id, created_at) VALUES
('Urban Stay Co-living', 'Modern co-living space in Koramangala with gym and high-speed WiFi.', '88 5th Block', 'Bangalore', 'Koramangala', 12.93520000, 77.62450000, 12000.00, 10000.00, 'CO_LIVING', '["WiFi","AC","Parking","Gym","Laundry"]', 6, 3, FALSE, '9876543212', 4.80, 3, 3, NOW()),
('Tech Hub PG', 'Budget-friendly boys PG near Whitefield IT parks.', '22 ITPL Road', 'Bangalore', 'Whitefield', 12.96980000, 77.75000000, 8500.00, 7000.00, 'BOYS', '["WiFi","Parking","Laundry"]', 3, 2, TRUE, '9876543212', 4.00, 1, 3, NOW());

-- Hyderabad PG (owner: Priya = id 3)
INSERT INTO pg_listings (name, description, address, city, area, latitude, longitude, rent, deposit, gender, amenities, available_beds, available_rooms, food_available, contact_number, rating, reviews_count, owner_id, created_at) VALUES
('Pearl City PG', 'Premium girls PG in Gachibowli with AC rooms and 24/7 security.', '5 DLF Cyber City', 'Hyderabad', 'Gachibowli', 17.44010000, 78.34890000, 9000.00, 8000.00, 'GIRLS', '["WiFi","AC","CCTV","Food","Parking"]', 2, 1, TRUE, '9876543212', 4.60, 2, 3, NOW());

-- Sample images
INSERT INTO pg_images (pg_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', TRUE),
(1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', FALSE),
(2, 'https://images.unsplash.com/photo-1560448204-e02f11c45751?w=800', TRUE),
(3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', TRUE),
(4, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', TRUE),
(5, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', TRUE);

-- Sample reviews
INSERT INTO reviews (user_id, pg_id, rating, review_text, created_at) VALUES
(4, 1, 5, 'Great PG with clean rooms and tasty food. Highly recommended!', NOW()),
(4, 3, 4, 'Good location and amenities. Slightly pricey but worth it.', NOW());

-- Sample favorite
INSERT INTO favorites (user_id, pg_id, saved_at) VALUES
(4, 1, NOW());
