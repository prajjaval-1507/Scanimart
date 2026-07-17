import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Loader2, Package, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Store } from '../../lib/types';
import { Modal } from '../shared/Modal';

interface ProductForm {
  store_id: string;
  barcode: string;
  name: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string;
  manufacturing_date: string;
  expiry_date: string;
}

const defaultForm: ProductForm = {
  store_id: '', barcode: '', name: '', description: '', price: '',
  category: '', stock_quantity: '', manufacturing_date: '', expiry_date: '',
};

function isExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

function isExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < Date.now();
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStore, setFilterStore] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [{ data: prods }, { data: strs }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('stores').select('*').eq('is_active', true),
    ]);
    setProducts(prods ?? []);
    setStores(strs ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditProduct(null);
    setForm({ ...defaultForm, store_id: stores[0]?.id ?? '' });
    setError('');
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setForm({
      store_id: product.store_id,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock_quantity: String(product.stock_quantity),
      manufacturing_date: product.manufacturing_date ?? '',
      expiry_date: product.expiry_date ?? '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      store_id: form.store_id,
      barcode: form.barcode,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      manufacturing_date: form.manufacturing_date || null,
      expiry_date: form.expiry_date || null,
    };
    try {
      if (editProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
      await loadData();
      setModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const storeMap = Object.fromEntries(stores.map((s) => [s.id, s.name]));
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchStore = !filterStore || p.store_id === filterStore;
    return matchSearch && matchStore;
  });

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-xl font-bold">Products</h2>
          <p className="text-slate-500 text-sm">{products.length} product{products.length !== 1 ? 's' : ''} in inventory</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterStore}
          onChange={(e) => setFilterStore(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">All Stores</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Package className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">No products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Barcode</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Store</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Expiry</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((product) => {
                  const expiring = isExpiringSoon(product.expiry_date);
                  const expired = isExpired(product.expiry_date);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          {product.category && <p className="text-slate-400 text-xs">{product.category}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{product.barcode}</td>
                      <td className="px-4 py-3 text-slate-500">{storeMap[product.store_id] ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">${Number(product.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500">{product.stock_quantity}</td>
                      <td className="px-4 py-3">
                        {product.expiry_date ? (
                          <div className="flex items-center gap-1.5">
                            {(expiring || expired) && <AlertTriangle size={13} className={expired ? 'text-red-500' : 'text-amber-500'} />}
                            <span className={`text-xs font-medium ${expired ? 'text-red-600' : expiring ? 'text-amber-600' : 'text-slate-500'}`}>
                              {product.expiry_date}
                            </span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(product)} className="text-slate-400 hover:text-emerald-600 transition-colors"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Store</label>
              <select value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" required>
                <option value="">Select a store</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
              <input type="text" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required placeholder="e.g. 8901234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Dairy, Bakery" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturing Date</label>
              <input type="date" value={form.manufacturing_date} onChange={(e) => setForm({ ...form, manufacturing_date: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" rows={2} />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
