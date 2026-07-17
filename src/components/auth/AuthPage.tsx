import { useState } from 'react';
import { ShoppingCart, ScanLine, Shield, Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string, role: 'admin' | 'customer') => Promise<void>;
}

export function AuthPage({ onSignIn, onSignUp }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'customer'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password, fullName, role);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left panel */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 rounded-xl p-2">
                <ScanLine className="text-white" size={28} />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">ScaniMart</span>
            </div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Smart Shopping,<br />Zero Queues
            </h2>
            <p className="text-emerald-100 text-base leading-relaxed">
              Scan products instantly, manage your cart, and generate digital invoices without waiting in long billing lines.
            </p>
          </div>
          <div className="space-y-4 mt-10">
            {[
              { icon: ScanLine, text: 'Instant barcode scanning' },
              { icon: ShoppingCart, text: 'Smart cart management' },
              { icon: Shield, text: 'Secure checkout & digital invoices' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-emerald-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-slate-800 text-2xl font-bold mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h3>
            <p className="text-slate-500 text-sm">
              {mode === 'login'
                ? 'Sign in to your ScaniMart account'
                : 'Join ScaniMart and start scanning'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['customer', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        role === r
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {r === 'customer' ? 'Customer' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
