import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { CartItem } from '../../lib/types';
import { useState } from 'react';

interface CartViewProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => Promise<void>;
  storeId: string | null;
}

export function CartView({ items, total, onUpdateQuantity, onRemoveItem, onCheckout, storeId }: CartViewProps) {
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      await onCheckout();
    } finally {
      setCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-slate-800 text-xl font-bold">My Cart</h2>
          <p className="text-slate-500 text-sm">Your scanned items will appear here</p>
        </div>
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
          <ShoppingCart className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Cart is empty</p>
          <p className="text-slate-400 text-sm mt-1">Scan some products to get started</p>
        </div>
      </div>
    );
  }

  const tax = total * 0.08;
  const grandTotal = total + tax;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-800 text-xl font-bold">My Cart</h2>
        <p className="text-slate-500 text-sm">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className="bg-emerald-50 rounded-lg p-3 flex-shrink-0">
                <ShoppingCart size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-800 font-semibold text-sm truncate">{product.name}</h4>
                <p className="text-slate-400 text-xs font-mono">{product.barcode}</p>
                {product.category && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{product.category}</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-800">{quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="text-right flex-shrink-0 min-w-16">
                <p className="text-slate-800 font-bold text-sm">${(product.price * quantity).toFixed(2)}</p>
                <p className="text-slate-400 text-xs">${Number(product.price).toFixed(2)} each</p>
              </div>
              <button
                onClick={() => onRemoveItem(product.id)}
                className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 sticky top-4">
            <h3 className="text-slate-800 font-bold text-base mb-4">Order Summary</h3>
            <div className="space-y-2.5 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-slate-500 truncate mr-2">{product.name} x{quantity}</span>
                  <span className="text-slate-700 flex-shrink-0">${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (8%)</span>
                <span className="text-slate-700">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-2">
                <span className="text-slate-800">Total</span>
                <span className="text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut || !storeId}
              className="w-full mt-5 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {checkingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <><ArrowRight size={16} /> Generate Bill</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
