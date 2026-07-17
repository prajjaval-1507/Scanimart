
/*
  # ScaniMart Database Schema

  ## Overview
  Full schema for the ScaniMart smart shopping system.

  ## New Tables

  ### 1. profiles
  Extends Supabase auth.users with role and contact info.
  - id: references auth.users
  - full_name: display name
  - phone: contact number
  - role: 'admin' or 'customer'

  ### 2. stores
  Supermarket branches that admins manage.
  - name, address, phone, image_url, is_active

  ### 3. products
  Products with barcode lookup, dates, pricing.
  - barcode: unique per store
  - manufacturing_date, expiry_date for freshness tracking
  - stock_quantity for inventory

  ### 4. orders
  Customer purchase sessions.
  - status: pending | completed | cancelled

  ### 5. order_items
  Individual items within an order.
  - unit_price captured at time of purchase

  ## Security
  - RLS enabled on all tables
  - Admins have full read/write on stores and products
  - Customers can read stores/products, manage their own orders
  - Profiles readable by all authenticated users, writable by owner only
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete stores"
  ON stores FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  barcode text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text DEFAULT '',
  image_url text DEFAULT '',
  stock_quantity integer DEFAULT 0,
  manufacturing_date date,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, barcode)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id),
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Customers can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
