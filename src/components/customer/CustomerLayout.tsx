import { ReactNode } from 'react';
import { ScanLine, Store, ShoppingCart, FileText, History, LogOut, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { CustomerView } from '../../lib/types';

interface CustomerLayoutProps {
  children: ReactNode;
  currentView: CustomerView;
  onViewChange: (view: CustomerView) => void;
  onSignOut: () => void;
  customerName: string;
  cartCount: number;
  notificationCount: number;
  selectedStoreName?: string;
}

const navItems: { view: CustomerView; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { view: 'stores', label: 'Select Store', icon: Store },
  { view: 'scanner', label: 'Scan Products', icon: ScanLine },
  { view: 'cart', label: 'My Cart', icon: ShoppingCart },
  { view: 'invoice', label: 'Invoice', icon: FileText },
  { view: 'history', label: 'Order History', icon: History },
];

export function CustomerLayout({
  children, currentView, onViewChange, onSignOut, customerName, cartCount, notificationCount, selectedStoreName
}: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-emerald-600 rounded-lg p-1.5">
              <ScanLine size={18} className="text-white" />
            </div>
            <span className="text-slate-800 font-bold text-lg">ScaniMart</span>
          </div>
          {selectedStoreName && (
            <p className="text-xs text-emerald-600 font-medium ml-9 truncate">{selectedStoreName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => { onViewChange(view); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                currentView === view
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {label}
              {view === 'cart' && cartCount > 0 && (
                <span className="ml-auto bg-white text-emerald-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {notificationCount > 0 && (
            <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              <Bell size={14} className="text-amber-500" />
              {notificationCount} product{notificationCount !== 1 ? 's' : ''} expiring soon
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm font-bold">
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 text-sm font-medium truncate">{customerName}</p>
              <p className="text-slate-400 text-xs">Customer</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 lg:px-6 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-slate-800 font-semibold text-base">{navItems.find((n) => n.view === currentView)?.label}</h1>
          {cartCount > 0 && (
            <button
              onClick={() => onViewChange('cart')}
              className="ml-auto flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <ShoppingCart size={16} />
              {cartCount} item{cartCount !== 1 ? 's' : ''}
            </button>
          )}
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
