import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { Lock, Loader2, KeyRound } from 'lucide-react';
import { api, getFriendlyApiError } from '@/lib/api';

export function LoginPage() {
  const { setCurrentView } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Redirect if already logged in as admin ──
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me?role=admin');
        if (cancelled) return;
        if (res.data?.success && res.data.data?.role === 'admin') {
          const params = new URLSearchParams(window.location.search);
          const from = params.get('from');
          if (from) {
            window.location.href = from;
          } else {
            setCurrentView('admin-dashboard');
            window.history.pushState({}, '', '/admin');
          }
        }
      } catch {
        // Not logged in as admin
      }
    };
    checkSession();
    return () => { cancelled = true; };
  }, [setCurrentView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/admin-login', {
        email: email.trim(),
        password,
      });

      if (res.data?.success) {
        window.dispatchEvent(new Event('haifly_admin_login'));
        window.dispatchEvent(new Event('haifly_auth_changed'));

        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        if (from) {
          window.location.href = from;
        } else {
          setCurrentView('admin-dashboard');
          window.history.pushState({}, '', '/admin');
        }
      } else {
        setError(res.data?.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(getFriendlyApiError(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0f5238]/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FCB006]/10 blur-[100px]" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FCB006] to-[#d69502] mx-auto flex items-center justify-center mb-4 shadow-lg shadow-[#FCB006]/20">
              <Lock className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tight mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-400 text-xs">Enter your administrative credentials</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" id="admin-password-form">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@haiflytrapng.com"
                  className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FCB006]/50 focus:border-transparent transition-all"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FCB006]/50 focus:border-transparent transition-all"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full py-4 bg-[#FCB006] text-slate-950 font-black tracking-widest uppercase text-sm rounded-2xl hover:bg-[#FCB006]/90 transition-all flex items-center justify-center gap-3 btn-anim disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FCB006]/20 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    <span>Enter Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
