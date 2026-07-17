import { useEffect, useState } from 'react';
import { Store as StoreIcon, MapPin, Phone, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Store } from '../../lib/types';

interface StoreSelectorProps {
  selectedStoreId: string | null;
  onSelectStore: (store: Store) => void;
}

export function StoreSelector({ selectedStoreId, onSelectStore }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('stores').select('*').eq('is_active', true).order('name').then(({ data }) => {
      setStores(data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-xl h-40 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-800 text-xl font-bold">Choose a Store</h2>
        <p className="text-slate-500 text-sm">Select the store you are shopping at to begin scanning</p>
      </div>

      {stores.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <StoreIcon className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">No stores available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => {
            const selected = store.id === selectedStoreId;
            return (
              <button
                key={store.id}
                onClick={() => onSelectStore(store)}
                className={`bg-white rounded-xl border-2 p-6 text-left transition-all shadow-sm hover:shadow-md ${
                  selected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`rounded-xl p-3 ${selected ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                    <StoreIcon size={24} className={selected ? 'text-white' : 'text-slate-500'} />
                  </div>
                  {selected && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="text-slate-800 font-semibold text-base mb-2">{store.name}</h3>
                <div className="space-y-1.5">
                  {store.address && (
                    <div className="flex items-start gap-2 text-slate-500 text-sm">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Phone size={14} />
                      <span>{store.phone}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600">
                  {selected ? 'Shopping here' : 'Select this store'}
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedStoreId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-emerald-700 text-sm font-medium">Store selected! You can now start scanning products.</p>
        </div>
      )}
    </div>
  );
}
