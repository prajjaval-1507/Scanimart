import { ReactNode } from 'react';
import {
  ScanLine,
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { AdminView } from '../../lib/types';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  onSignOut: () => void;
  adminName: string;
}

const navItems: { view: AdminView; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'stores', label: 'Stores', icon: Store },
  { view: 'products', label: 'Products', icon: Package },
  { view: 'orders', label: 'Orders', icon: ShoppingBag },
];

export function AdminLayout({ children, currentView, onViewChange, onSignOut, adminName }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 rounded-lg p-1.5">
              <ScanLine size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">ScaniMart</span>
          </div>
          <p className="text-slate-400 text-xs mt-1 ml-9">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => { onViewChange(view); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === view
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminName}</p>
              <p className="text-slate-400 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 lg:px-6 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-slate-800 font-semibold text-base capitalize">{currentView}</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
