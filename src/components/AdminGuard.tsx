import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { supabaseAdmin } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/pushNotifications';
interface AdminGuardProps {
  children: React.ReactNode;
}

type GuardState = 'loading' | 'granted' | 'denied';

/**
 * AdminGuard – wraps all admin-only views.
 *
 * Security model:
 *   - Retrieves Supabase session on mount
 *   - Queries public.users to confirm role === 'admin'
 *   - Shows a spinner while checking
 *   - Renders children only when confirmed admin
 *   - On failure: signs out → redirects to HOMEPAGE (never reveals admin path)
 *   - Listens for auth state changes (token refresh, sign out)
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { setCurrentView } = useStore();
  const [state, setState] = useState<GuardState>('loading');

  const redirectHome = async () => {
    await supabaseAdmin.auth.signOut();
    setState('denied');
    setCurrentView('home');
    window.history.pushState({}, '', '/');
  };


  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const { data: { session } } = await supabaseAdmin.auth.getSession();


      if (cancelled) return;

      if (!session?.user) {
        await redirectHome();
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;

        if (res.data?.success && res.data.data?.role === 'admin') {
          setState('granted');
          subscribeToPushNotifications('admin', session.user.id, session.user.email);
        } else {
          await redirectHome();
        }
      } catch {
        if (!cancelled) await redirectHome();
      }
    };

    checkAuth();

    // Re-check on auth state change — handle token refresh & explicit sign-out
    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        if (!session) {
          setState('denied');
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
      }
    );


    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading spinner
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FCB006] to-[#d69502] flex items-center justify-center shadow-lg shadow-[#FCB006]/20 animate-pulse">
          <svg className="w-7 h-7 text-slate-950" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-center">
          <Loader2 className="w-5 h-5 text-[#FCB006] animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Denied — render nothing, redirect already fired
  if (state === 'denied') return null;

  // Granted
  return <>{children}</>;
}
