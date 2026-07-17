import { useEffect, useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, OrderItem } from '../../lib/types';

interface OrderWithDetails extends Order {
  store?: { name: string };
  customer?: { full_name: string };
  items?: OrderItem[];
}

export function OrderManager() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select(`*, store:stores(name), customer:profiles(full_name)`)
      .order('created_at', { ascending: false });
    setOrders((data as OrderWithDetails[]) ?? []);
    setLoading(false);
  }

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!orders.find((o) => o.id === orderId)?.items) {
      const { data } = await supabase
        .from('order_items')
        .select(`*, product:products(name, barcode, price)`)
        .eq('order_id', orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, items: (data as OrderItem[]) ?? [] } : o))
      );
    }
  }

  const statusColor = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-800 text-xl font-bold">Orders</h2>
        <p className="text-slate-500 text-sm">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-slate-800 font-medium text-sm truncate">
                      {order.customer?.full_name ?? 'Customer'}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {order.store?.name ?? '—'} &bull; {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-slate-800 font-bold text-sm flex-shrink-0">${Number(order.total_amount).toFixed(2)}</p>
                {expandedId === order.id ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
              </button>

              {expandedId === order.id && order.items && (
                <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-left pb-2 font-medium">Item</th>
                        <th className="text-left pb-2 font-medium">Barcode</th>
                        <th className="text-right pb-2 font-medium">Qty</th>
                        <th className="text-right pb-2 font-medium">Price</th>
                        <th className="text-right pb-2 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-slate-700">{(item.product as { name: string } | undefined)?.name ?? '—'}</td>
                          <td className="py-1.5 text-slate-400 font-mono">{(item.product as { barcode: string } | undefined)?.barcode ?? '—'}</td>
                          <td className="py-1.5 text-right text-slate-600">{item.quantity}</td>
                          <td className="py-1.5 text-right text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-700">${Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="pt-2 text-right font-semibold text-slate-700">Total:</td>
                        <td className="pt-2 text-right font-bold text-emerald-600">${Number(order.total_amount).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
