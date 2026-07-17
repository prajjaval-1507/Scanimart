import { useEffect, useState } from 'react';
import { Store, Package, ShoppingBag, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  stores: number;
  products: number;
  orders: number;
  revenue: number;
  expiringCount: number;
  pendingOrders: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ stores: 0, products: 0, orders: 0, revenue: 0, expiringCount: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const sevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const [storesRes, productsRes, ordersRes, expiringRes, pendingRes] = await Promise.all([
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('status', 'completed'),
        supabase.from('products').select('id', { count: 'exact', head: true }).gte('expiry_date', today).lte('expiry_date', sevenDays),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const revenue = (ordersRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
      setStats({
        stores: storesRes.count ?? 0,
        products: productsRes.count ?? 0,
        orders: ordersRes.data?.length ?? 0,
        revenue,
        expiringCount: expiringRes.count ?? 0,
        pendingOrders: pendingRes.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Active Stores', value: stats.stores, icon: Store, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Completed Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-violet-50 text-violet-600' },
    { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ];

  const alertCards = [
    { label: 'Expiring Soon (7 days)', value: stats.expiringCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-800 text-xl font-bold mb-1">Overview</h2>
        <p className="text-slate-500 text-sm">System-wide statistics at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 text-sm">{label}</p>
              <div className={`rounded-lg p-2 ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-slate-900 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {alertCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-5 flex items-center gap-4 ${color}`}>
            <Icon size={24} />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
