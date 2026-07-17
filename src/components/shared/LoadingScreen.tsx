import { ScanLine } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="bg-emerald-600 rounded-2xl p-4">
        <ScanLine className="text-white animate-pulse" size={40} />
      </div>
      <p className="text-slate-400 text-sm">Loading ScaniMart...</p>
    </div>
  );
}
