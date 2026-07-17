
/*
  # Seed Sample Store and Product Data

  ## Purpose
  Adds initial sample stores and products so the app is usable immediately after setup.

  ## Data Added
  - 2 sample stores (ScaniMart Main Branch, ScaniMart West Wing)
  - 10 sample products with barcodes, pricing, and expiry dates across both stores
*/

INSERT INTO stores (id, name, address, phone, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ScaniMart Main Branch', '123 Market Street, Downtown', '+1-555-0101', true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ScaniMart West Wing', '456 Commerce Ave, Westside', '+1-555-0202', true)
ON CONFLICT DO NOTHING;

INSERT INTO products (store_id, barcode, name, description, price, category, stock_quantity, manufacturing_date, expiry_date) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8901234567890', 'Whole Wheat Bread', 'Freshly baked whole wheat loaf', 3.49, 'Bakery', 50, '2026-04-08', '2026-04-15'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8902345678901', 'Full Cream Milk 1L', 'Farm fresh pasteurized milk', 1.99, 'Dairy', 120, '2026-04-10', '2026-04-17'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8903456789012', 'Greek Yogurt 500g', 'Thick and creamy plain yogurt', 4.29, 'Dairy', 75, '2026-04-01', '2026-04-20'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8904567890123', 'Orange Juice 2L', 'Fresh squeezed 100% orange juice', 5.49, 'Beverages', 60, '2026-04-05', '2026-04-19'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8905678901234', 'Cheddar Cheese 400g', 'Aged sharp cheddar cheese block', 6.99, 'Dairy', 40, '2026-02-15', '2026-07-15'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '8906789012345', 'Brown Rice 2kg', 'Organic long grain brown rice', 7.99, 'Grains', 200, '2025-10-01', '2027-10-01'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '8907890123456', 'Pasta 500g', 'Italian durum wheat spaghetti', 2.49, 'Grains', 150, '2025-08-01', '2027-08-01'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '8908901234567', 'Tomato Ketchup 500ml', 'Classic tomato ketchup sauce', 3.29, 'Condiments', 90, '2025-11-01', '2027-05-01'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '8909012345678', 'Almonds 250g', 'Raw unsalted premium almonds', 9.99, 'Snacks', 55, '2026-01-01', '2026-10-01'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '8900123456789', 'Mineral Water 500ml', 'Pure natural spring water', 0.99, 'Beverages', 300, '2026-03-01', '2028-03-01')
ON CONFLICT DO NOTHING;
