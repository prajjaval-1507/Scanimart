import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Loader2, MapPin, Phone, Store as StoreIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Store } from '../../lib/types';
import { Modal } from '../shared/Modal';

interface StoreForm {
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

const defaultForm: StoreForm = { name: '', address: '', phone: '', is_active: true };

export function StoreManager() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [form, setForm] = useState<StoreForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchStores(); }, []);

  async function fetchStores() {
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    setStores(data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditStore(null);
    setForm(defaultForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(store: Store) {
    setEditStore(store);
    setForm({ name: store.name, address: store.address, phone: store.phone, is_active: store.is_active });
    setError('');
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editStore) {
        const { error } = await supabase.from('stores').update(form).eq('id', editStore.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('stores').insert(form);
        if (error) throw error;
      }
      await fetchStores();
      setModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this store? This will also remove all its products.')) return;
    await supabase.from('stores').delete().eq('id', id);
    setStores((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-36 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-xl font-bold">Stores</h2>
          <p className="text-slate-500 text-sm">{stores.length} store{stores.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Store
        </button>
      </div>

      {stores.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <StoreIcon className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">No stores yet. Add your first store.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <StoreIcon size={20} className="text-emerald-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${store.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-slate-800 font-semibold text-sm mb-2">{store.name}</h3>
              <div className="space-y-1 mb-4">
                {store.address && (
                  <div className="flex items-start gap-1.5 text-slate-500 text-xs">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Phone size={12} />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(store)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-slate-600 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(store.id)} className="flex items-center justify-center gap-1.5 text-sm text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editStore ? 'Edit Store' : 'Add Store'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editStore ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
