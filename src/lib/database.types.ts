export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          role: 'admin' | 'customer';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string;
          role?: 'admin' | 'customer';
          created_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string;
          role?: 'admin' | 'customer';
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          image_url: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string;
          phone?: string;
          image_url?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          address?: string;
          phone?: string;
          image_url?: string;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          store_id: string;
          barcode: string;
          name: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          stock_quantity?: number;
          manufacturing_date?: string | null;
          expiry_date?: string | null;
          created_at?: string;
        };
        Update: {
          store_id?: string;
          barcode?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          stock_quantity?: number;
          manufacturing_date?: string | null;
          expiry_date?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          store_id: string;
          total_amount: number;
          status: 'pending' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          store_id: string;
          total_amount?: number;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          total_amount?: number;
          status?: 'pending' | 'completed' | 'cancelled';
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
      };
    };
  };
}
