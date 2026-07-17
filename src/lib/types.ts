export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  barcode: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  manufacturing_date: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  store?: Store;
  customer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AdminView = 'dashboard' | 'stores' | 'products' | 'orders';
export type CustomerView = 'stores' | 'scanner' | 'cart' | 'invoice' | 'history';
