-- ================================================
-- ShopVia E-Commerce - Sample Data Script
-- ================================================
-- This script creates test users and adds 10 sample products
-- Run this in MySQL Workbench or MySQL CLI
-- ================================================

USE ecommerce_db;

-- ================================================
-- STEP 1: Create Test Users
-- ================================================

-- Test Customer User
INSERT INTO user (name, email, password, phone, role) 
VALUES (
  'John Doe',
  'john@example.com',
  '$2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu',
  '9876543210',
  'USER'
);

-- Admin User
INSERT INTO user (name, email, password, phone, role) 
VALUES (
  'Admin User',
  'admin@shopvia.com',
  '$2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu',
  '9333333333',
  'ADMIN'
);

-- Additional Test Users
INSERT INTO user (name, email, password, phone, role) 
VALUES 
('Alice Smith', 'alice@example.com', '$2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu', '9111111111', 'USER'),
('Bob Johnson', 'bob@example.com', '$2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu', '9222222222', 'USER');

COMMIT;

-- ================================================
-- STEP 2: Add Sample Products
-- ================================================

-- Product 1: Premium Wireless Headphones
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Premium Wireless Headphones',
  'High-quality noise-cancelling Bluetooth headphones with 30-hour battery life. Perfect for music lovers and professionals.',
  3999,
  50,
  'Electronics',
  'headphones.jpg'
);

-- Product 2: Fast Charging USB-C Cable
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Fast Charging USB-C Cable',
  '2-pack of durable USB-C charging cables with fast charging support and reinforced connectors.',
  399,
  200,
  'Accessories',
  'usb-cable.jpg'
);

-- Product 3: Premium Leather Phone Case
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Premium Leather Phone Case',
  'Protective premium leather phone case with multiple card slots and RFID protection.',
  899,
  75,
  'Accessories',
  'phone-case.jpg'
);

-- Product 4: Tempered Glass Screen Protector
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Tempered Glass Screen Protector',
  'Crystal clear tempered glass screen protector set (3 pack) with easy installation.',
  299,
  300,
  'Accessories',
  'screen-protector.jpg'
);

-- Product 5: Adjustable Aluminum Laptop Stand
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Adjustable Aluminum Laptop Stand',
  'Premium adjustable aluminum laptop stand for better posture and improved cooling.',
  1799,
  40,
  'Home & Living',
  'laptop-stand.jpg'
);

-- Product 6: Ergonomic Wireless Mouse
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Ergonomic Wireless Mouse',
  'Comfortable ergonomic wireless mouse with precision tracking and long battery life.',
  799,
  120,
  'Accessories',
  'wireless-mouse.jpg'
);

-- Product 7: 7-Port USB Hub
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  '7-Port USB Hub',
  'Multi-port USB 3.0 hub with power adapter and fast data transfer speeds.',
  1299,
  60,
  'Electronics',
  'usb-hub.jpg'
);

-- Product 8: Adjustable Phone Mount for Car
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Adjustable Phone Mount for Car',
  'Universal car phone mount with strong grip and dashboard suction cup.',
  499,
  90,
  'Accessories',
  'phone-mount.jpg'
);

-- Product 9: Mechanical Gaming Keyboard
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Mechanical Gaming Keyboard',
  'RGB mechanical keyboard with switches, programmable keys, and aluminum frame.',
  2499,
  35,
  'Electronics',
  'keyboard.jpg'
);

-- Product 10: 1080p USB Webcam
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  '1080p USB Webcam',
  'Full HD 1080p webcam for video calls and streaming with built-in microphone.',
  1599,
  45,
  'Electronics',
  'webcam.jpg'
);

-- Product 11: Premium Screen Cleaner Kit
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Premium Screen Cleaner Kit',
  'Complete screen cleaning kit with microfiber cloth and anti-static solution.',
  399,
  150,
  'Accessories',
  'screen-cleaner.jpg'
);

-- Product 12: Portable Phone Charger
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Portable Phone Charger 20000mAh',
  'High-capacity portable power bank with dual USB ports and LED display.',
  1499,
  80,
  'Electronics',
  'power-bank.jpg'
);

COMMIT;

-- ================================================
-- STEP 3: Verify Data
-- ================================================

-- Check users created
SELECT id, name, email, role FROM user;

-- Check products created
SELECT id, name, price, quantity, category FROM product ORDER BY id;

-- Count products by category
SELECT category, COUNT(*) as count FROM product GROUP BY category;

-- Check low stock products (quantity <= 10)
SELECT name, quantity, category FROM product WHERE quantity <= 10 ORDER BY quantity;

-- ================================================
-- NOTES:
-- ================================================
-- Password Hash: $2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu
-- Decoded Password: Test@123
-- 
-- You can use these credentials to login:
-- Customer: john@example.com / Test@123
-- Admin: admin@shopvia.com / Test@123
--
-- Images should be placed in:
-- src/main/resources/static/images/
-- 
-- The following image files are expected:
-- - headphones.jpg
-- - usb-cable.jpg
-- - phone-case.jpg
-- - screen-protector.jpg
-- - laptop-stand.jpg
-- - wireless-mouse.jpg
-- - usb-hub.jpg
-- - phone-mount.jpg
-- - keyboard.jpg
-- - webcam.jpg
-- - screen-cleaner.jpg
-- - power-bank.jpg
-- ================================================
