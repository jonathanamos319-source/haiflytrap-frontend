import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { supabaseAdmin } from '@/lib/supabase';
import { api } from '@/lib/api';

import { Loader2, ShieldX, CheckCircle } from 'lucide-react';

type CallbackStatus = 'loading' | 'verifying' | 'denied' | 'success';

/**
 * AuthCallback – renders at /auth/callback.
 *
 * Supabase redirects here after:
 *   - A magic link is clicked from email
 *   - Google OAuth completes
 *
 * Flow:
 *   1. Wait for Supabase to exchange the URL token for a session
 *   2. Query public.users to check role
 *   3. If admin  → navigate to admin dashboard
 *   4. If not    → sign out and show Access Denied
 */
export function AuthCallback() {
  const { setCurrentView } = useStore();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      // Give Supabase a moment to parse the URL hash / code exchange
      const { data: { session }, error } = await supabaseAdmin.auth.getSession();


      if (cancelled) return;

      if (error || !session?.user) {
        // Session not yet ready — subscribe and wait for onAuthStateChange
        const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(

          async (_event, newSession) => {
            if (cancelled) return;
            if (newSession?.user) {
              subscription.unsubscribe();
              await verifyRole(newSession.user.id);
            }
          }
        );
        return;
      }

      // Session already available immediately
      await verifyRole(session.user.id);
    };

    const verifyRole = async (userId: string) => {
      if (cancelled) return;
      setStatus('verifying');

      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;

        if (res.data?.success && res.data.data?.role === 'admin') {
          setStatus('success');
          // Small delay so the success state is visible
          setTimeout(() => {
            if (!cancelled) {
              setCurrentView('admin-dashboard');
              window.history.pushState({}, '', '/admin');
            }
          }, 800);
        } else {
          await supabaseAdmin.auth.signOut();
          setStatus('denied');
          setErrorMsg('Your account does not have admin privileges.');
        }
      } catch (err: any) {
        // Silently catch initialization errors
        if (err.response?.status === 401 || err.response?.status === 400) {
          return;
        }
        if (!cancelled) {
          await supabaseAdmin.auth.signOut();
          setStatus('denied');
          setErrorMsg('Something went wrong while verifying your account.');
        }
      }


    };

    handleCallback();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0f5238]/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FCB006]/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Loading / Verifying */}
        {(status === 'loading' || status === 'verifying') && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FCB006] to-[#d69502] mx-auto flex items-center justify-center shadow-lg shadow-[#FCB006]/20">
              <Loader2 className="w-10 h-10 text-slate-950 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2">
                {status === 'loading' ? 'Signing you in…' : 'Verifying access…'}
              </h1>
              <p className="text-slate-400 text-sm">
                {status === 'loading'
                  ? 'Establishing your secure session.'
                  : 'Checking your admin privileges.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Supabase Auth — End-to-End Encrypted
              </span>
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2">Access Granted</h1>
              <p className="text-slate-400 text-sm">Redirecting to your dashboard…</p>
            </div>
          </div>
        )}

        {/* Access Denied */}
        {status === 'denied' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center">
              <ShieldX className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {errorMsg || 'You do not have permission to access the admin panel.'}
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentView('admin-login');
                window.history.pushState({}, '', '/admin-login');
              }}
              className="w-full py-3.5 bg-[#FCB006] text-slate-950 font-black tracking-widest uppercase text-sm rounded-2xl hover:bg-[#FCB006]/90 transition-all btn-anim shadow-lg shadow-[#FCB006]/20"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
