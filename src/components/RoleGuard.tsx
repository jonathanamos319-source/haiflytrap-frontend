import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { supabaseAdmin, supabaseHandler, supabaseUser } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/pushNotifications';
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

type GuardState = 'loading' | 'granted' | 'denied';

/**
 * RoleGuard – wraps views that require specific roles.
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { setCurrentView } = useStore();
  const [state, setState] = useState<GuardState>('loading');

  const redirectHome = async () => {
    // Sign out from relevant clients safely
    const signouts = [];
    if (allowedRoles.includes('admin')) signouts.push(supabaseAdmin.auth.signOut().catch(() => {}));
    if (allowedRoles.includes('handler')) signouts.push(supabaseHandler.auth.signOut().catch(() => {}));
    if (allowedRoles.includes('customer')) signouts.push(supabaseUser.auth.signOut().catch(() => {}));
    await Promise.all(signouts);

    setState('denied');
    
    if (allowedRoles.includes('handler') && !allowedRoles.includes('customer')) {
      setCurrentView('handler-login');
      window.history.pushState({}, '', '/handler-login');
    } else {
      setCurrentView('home');
      window.history.pushState({}, '', '/');
    }
  };


  useEffect(() => {
    let cancelled = false;

    // Safety timeout: if auth check takes more than 6 seconds, redirect to login
    const timeoutId = setTimeout(async () => {
      if (!cancelled && state === 'loading') {
        await redirectHome();
      }
    }, 6000);

    const checkAuth = async () => {
      let session = null;
      try {
        if (allowedRoles.includes('admin')) {
          const { data } = await supabaseAdmin.auth.getSession();
          if (data.session) session = data.session;
        }
        if (!session && allowedRoles.includes('handler')) {
          const { data } = await supabaseHandler.auth.getSession();
          if (data.session) session = data.session;
        }
        if (!session && allowedRoles.includes('customer')) {
          const { data } = await supabaseUser.auth.getSession();
          if (data.session) session = data.session;
        }
      } catch {
        // If session retrieval fails, redirect
        clearTimeout(timeoutId);
        if (!cancelled) await redirectHome();
        return;
      }

      if (cancelled) return;

      // Fast-path: no session at all → redirect immediately without API call
      if (!session?.user) {
        clearTimeout(timeoutId);
        await redirectHome();
        return;
      }

      try {
        const controller = new AbortController();
        const apiTimeout = setTimeout(() => controller.abort(), 5000);

        const res = await api.get('/auth/me', { signal: controller.signal });
        clearTimeout(apiTimeout);
        clearTimeout(timeoutId);

        if (cancelled) return;

        if (res.data?.success && allowedRoles.includes(res.data.data?.role)) {
          setState('granted');
          subscribeToPushNotifications(res.data.data.role, session.user.id, session.user.email);
        } else {
          await redirectHome();
        }
      } catch {
        clearTimeout(timeoutId);
        if (!cancelled) await redirectHome();
      }
    };

    checkAuth();

    const subs: any[] = [];
    if (allowedRoles.includes('admin')) {
      const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && !cancelled) redirectHome();
      });
      subs.push(subscription);
    }
    if (allowedRoles.includes('handler')) {
      const { data: { subscription } } = supabaseHandler.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && !cancelled) redirectHome();
      });
      subs.push(subscription);
    }
    if (allowedRoles.includes('customer')) {
      const { data: { subscription } } = supabaseUser.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && !cancelled) redirectHome();
      });
      subs.push(subscription);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      subs.forEach(s => s.unsubscribe());
    };

  }, [allowedRoles]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <p className="text-slate-400 text-sm font-medium">Verifying authorization…</p>
        </div>
      </div>
    );
  }

  if (state === 'denied') return null;

  return <>{children}</>;
}
