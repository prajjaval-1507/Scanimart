import { useEffect, useState } from 'react';
import { History, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, OrderItem } from '../../lib/types';

interface OrderWithDetails extends Order {
  store?: { name: string };
  items?: OrderItem[];
}

interface OrderHistoryProps {
  customerId: string;
}

function getDaysUntilExpiry(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function OrderHistory({ customerId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, store:stores(name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderWithDetails[]) ?? []);
        setLoading(false);
      });
  }, [customerId]);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!orders.find((o) => o.id === orderId)?.items) {
      const { data } = await supabase
        .from('order_items')
        .select('*, product:products(name, barcode, expiry_date)')
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

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-800 text-xl font-bold">Order History</h2>
        <p className="text-slate-500 text-sm">{orders.length} past order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <History className="mx-auto text-slate-300 mb-3" size={40} />
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-slate-700 font-medium text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {order.store?.name ?? '—'} &bull; {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-slate-800 font-bold text-sm flex-shrink-0">${Number(order.total_amount).toFixed(2)}</p>
                {expandedId === order.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {expandedId === order.id && order.items && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-2">
                  {order.items.map((item) => {
                    const expiry = (item.product as { expiry_date?: string | null } | undefined)?.expiry_date ?? null;
                    const days = getDaysUntilExpiry(expiry);
                    const expiring = days !== null && days > 0 && days <= 7;
                    const expired = days !== null && days <= 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-slate-700 text-sm font-medium truncate">
                            {(item.product as { name: string } | undefined)?.name ?? '—'}
                          </p>
                          {expiry && (
                            <div className={`flex items-center gap-1 text-xs ${expired ? 'text-red-600' : expiring ? 'text-amber-600' : 'text-slate-400'}`}>
                              {(expired || expiring) && <AlertTriangle size={11} />}
                              Expires: {expiry}
                              {expiring && ` (${days}d left)`}
                              {expired && ' (Expired)'}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-slate-700 text-sm font-semibold">${Number(item.subtotal).toFixed(2)}</p>
                          <p className="text-slate-400 text-xs">qty: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
