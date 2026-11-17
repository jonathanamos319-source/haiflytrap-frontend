import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
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

  const redirectHome = () => {
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

    const checkAuth = async () => {
      try {
        const preferredRole = allowedRoles[0] || 'customer';
        const res = await api.get(`/auth/me?role=${preferredRole}`);

        if (cancelled) return;

        if (res.data?.success && allowedRoles.includes(res.data.data?.role)) {
          setState('granted');
          subscribeToPushNotifications(res.data.data.role, res.data.data.id, res.data.data.email);
        } else {
          redirectHome();
        }
      } catch {
        if (!cancelled) redirectHome();
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [allowedRoles]);

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
