import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { Lock, Loader2, KeyRound } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';


// ────────────────────────────────────────────────────────────────────────────
// TEMPORARY: Simple password login for testing.
// TODO: Restore Supabase magic-link auth once mail sending is configured.
//       The original code is preserved in a block comment at the bottom of
//       this file — just swap them back.
// ────────────────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = 'haiflytrap2018';   // Change this to whatever you want

export function LoginPage() {
  const { setCurrentView } = useStore();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Redirect if already logged in ──
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseAdmin.auth.getSession();
      const tempToken = localStorage.getItem('temp_admin_token');
      
      if (session || tempToken) {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        if (from) {
          window.location.href = from;
        } else {
          setCurrentView('admin-dashboard');
          window.history.pushState({}, '', '/admin');
        }
      }
    };
    checkSession();
  }, [setCurrentView]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    // Small delay to feel like a real check
    await new Promise(r => setTimeout(r, 600));

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('temp_admin_token', 'TEMPORARY_ADMIN_TOKEN');
      setCurrentView('admin-dashboard');
      window.history.pushState({}, '', '/admin');
      
      // We need to trigger a re-fetch of admin data since the app didn't reload.
      // A quick hack is to just dispatch a custom event that useStore can listen to.
      window.dispatchEvent(new Event('haify_admin_login'));
    } else {
      setError('Incorrect password. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0f5238]/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FCB006]/10 blur-[100px]" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FCB006] to-[#d69502] mx-auto flex items-center justify-center mb-6 shadow-lg shadow-[#FCB006]/20">
              <Lock className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tight mb-2">
              Secure Portal
            </h1>
            <p className="text-slate-500 text-xs">Authorized access only</p>
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
                  Admin Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FCB006]/50 focus:border-transparent transition-all"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-4 bg-[#FCB006] text-slate-950 font-black tracking-widest uppercase text-sm rounded-2xl hover:bg-[#FCB006]/90 transition-all flex items-center justify-center gap-3 btn-anim disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FCB006]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    <span>Enter Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-slate-500">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Temporary Password Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-600">
                Auth will be upgraded to Supabase magic links
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * ORIGINAL SUPABASE MAGIC-LINK LOGIN — RESTORE WHEN MAIL IS CONFIGURED
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * import { useState, useEffect } from 'react';
 * import { useStore } from '@/hooks/useStore';
 * import { supabaseAdmin as supabase } from '@/lib/supabase';
 * import { Lock, Loader2, Mail, CheckCircle, ShieldX } from 'lucide-react';
 *
 * type LoginStep = 'form' | 'email-sent' | 'checking' | 'denied';
 *
 * const ALLOWED_EMAILS: string[] = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
 *   .split(',')
 *   .map((e: string) => e.trim().toLowerCase())
 *   .filter(Boolean);
 *
 * export function LoginPage() {
 *   const { setCurrentView } = useStore();
 *   const [email, setEmail] = useState('');
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState('');
 *   const [step, setStep] = useState<LoginStep>('form');
 *
 *   useEffect(() => {
 *     const { data: { subscription } } = supabase.auth.onAuthStateChange(
 *       async (_event, session) => {
 *         if (session?.user) {
 *           setStep('checking');
 *           setError('');
 *           await verifyAdminRole(session.user.id);
 *         }
 *       }
 *     );
 *     return () => subscription.unsubscribe();
 *   }, []);
 *
 *   const verifyAdminRole = async (userId: string) => {
 *     try {
 *       const { data, error: dbError } = await supabase
 *         .from('users')
 *         .select('role')
 *         .eq('id', userId)
 *         .single();
 *       if (dbError || !data || data.role !== 'admin') {
 *         await supabase.auth.signOut();
 *         setStep('denied');
 *         return;
 *       }
 *       setCurrentView('admin-dashboard');
 *       window.history.pushState({}, '', '/admin');
 *     } catch {
 *       await supabase.auth.signOut();
 *       setStep('denied');
 *     }
 *   };
 *
 *   const handleMagicLink = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     if (!email.trim()) return;
 *     const normalized = email.trim().toLowerCase();
 *     if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(normalized)) {
 *       setError('Access Denied. This email is not authorized.');
 *       return;
 *     }
 *     setLoading(true);
 *     setError('');
 *     try {
 *       const { error: otpError } = await supabase.auth.signInWithOtp({
 *         email: normalized,
 *         options: { emailRedirectTo: `${window.location.origin}/auth/callback/admin` },
 *       });
 *       if (otpError) throw otpError;
 *       setStep('email-sent');
 *     } catch (err: unknown) {
 *       setError((err as any)?.message || 'Failed to send magic link.');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   // ... rest of the JSX (email-sent, checking, denied, form steps)
 * }
 */
