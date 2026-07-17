import { CheckCircle2, Printer, ShoppingBag, Store as StoreIcon, Calendar } from 'lucide-react';
import { Order, OrderItem, Store } from '../../lib/types';

interface InvoicePageProps {
  order: Order | null;
  items: OrderItem[];
  store: Store | null;
  customerName: string;
  onNewShopping: () => void;
}

export function InvoicePage({ order, items, store, customerName, onNewShopping }: InvoicePageProps) {
  if (!order) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-slate-800 text-xl font-bold">Invoice</h2>
          <p className="text-slate-500 text-sm">Your digital invoice will appear here after checkout</p>
        </div>
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
          <ShoppingBag className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">No invoice yet</p>
          <p className="text-slate-400 text-sm mt-1">Complete your cart checkout to generate an invoice</p>
        </div>
      </div>
    );
  }

  const tax = Number(order.total_amount) * 0.08 / 1.08;
  const subtotal = Number(order.total_amount) - tax;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-xl font-bold">Invoice</h2>
          <p className="text-slate-500 text-sm">Digital receipt for your purchase</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-2xl mx-auto" id="invoice">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg p-1.5">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl">ScaniMart</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm">
              <CheckCircle2 size={14} />
              {order.status}
            </div>
          </div>
          <p className="text-emerald-100 text-sm mb-1">Invoice #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-emerald-100 text-xs">{new Date(order.created_at).toLocaleString()}</p>
        </div>

        <div className="px-8 py-5 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Customer</p>
              <p className="text-slate-800 font-semibold">{customerName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Store</p>
              <div className="flex items-center gap-1.5">
                <StoreIcon size={14} className="text-slate-400" />
                <p className="text-slate-800 font-semibold">{store?.name ?? '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <p className="text-slate-700 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Items</p>
              <p className="text-slate-700 text-sm">{items.length} product{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-3 text-slate-400 font-medium text-xs uppercase">Item</th>
                <th className="text-right pb-3 text-slate-400 font-medium text-xs uppercase">Qty</th>
                <th className="text-right pb-3 text-slate-400 font-medium text-xs uppercase">Unit Price</th>
                <th className="text-right pb-3 text-slate-400 font-medium text-xs uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <p className="text-slate-800 font-medium">{(item.product as { name: string } | undefined)?.name ?? 'Product'}</p>
                    <p className="text-slate-400 text-xs font-mono">{(item.product as { barcode: string } | undefined)?.barcode}</p>
                  </td>
                  <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-3 text-right font-semibold text-slate-800">${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-700">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tax (8%)</span>
            <span className="text-slate-700">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
            <span className="text-slate-800">Total Paid</span>
            <span className="text-emerald-600 text-lg">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="px-8 py-5 text-center border-t border-slate-100">
          <p className="text-slate-400 text-xs">Thank you for shopping at ScaniMart!</p>
          <p className="text-slate-300 text-xs mt-1">Please check expiry dates on perishable items.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <button
          onClick={onNewShopping}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          <ShoppingBag size={18} /> Start New Shopping Session
        </button>
      </div>
    </div>
  );
}
