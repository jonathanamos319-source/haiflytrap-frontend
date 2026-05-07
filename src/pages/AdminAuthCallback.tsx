import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { supabaseAdmin } from '@/lib/supabase';
import { api } from '@/lib/api';

import { Loader2, CheckCircle, ShieldX } from 'lucide-react';

type Status = 'loading' | 'verifying' | 'success' | 'denied';

/**
 * AdminAuthCallback – handles /auth/callback/admin
 *
 * Supabase redirects here after an admin clicks their magic link.
 * Checks role === 'admin' in public.users. If not → sign out → homepage.
 */
export function AdminAuthCallback() {
  const { setCurrentView } = useStore();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const verifyRole = async (userId: string) => {
      if (cancelled) return;
      setStatus('verifying');

      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;

        if (res.data?.success && res.data.data?.role === 'admin') {
          setStatus('success');
          setTimeout(() => {
            if (!cancelled) {
              const params = new URLSearchParams(window.location.search);
              const from = params.get('from');
              if (from) {
                window.location.href = from;
              } else {
                setCurrentView('admin-dashboard');
                window.history.pushState({}, '', '/admin');
              }
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

    const run = async () => {
      // Try to get the session — Supabase parses the URL hash/code automatically
      const { data: { session }, error } = await supabaseAdmin.auth.getSession();


      if (cancelled) return;

      if (error || !session?.user) {
        // Wait for onAuthStateChange to fire with the new session
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

      await verifyRole(session.user.id);
    };

    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
                {status === 'loading' ? 'Signing you in…' : 'Verifying admin access…'}
              </h1>
              <p className="text-slate-400 text-sm">
                {status === 'loading'
                  ? 'Establishing your secure session.'
                  : 'Checking your role in the admin directory.'}
              </p>
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
              <p className="text-slate-400 text-sm">Redirecting to admin dashboard…</p>
            </div>
          </div>
        )}

        {/* Denied */}
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
            {/* Redirect to homepage — never reveal the admin path */}
            <button
              onClick={() => {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }}
              className="w-full py-3.5 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-2xl hover:bg-white/10 transition-all btn-anim"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
