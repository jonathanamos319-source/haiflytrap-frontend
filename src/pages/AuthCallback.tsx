import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, ShieldX } from 'lucide-react';

export function AuthCallback() {
  const { setCurrentView } = useStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'denied'>('loading');

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;

        if (res.data?.success && res.data.data) {
          setStatus('success');
          setTimeout(() => {
            if (!cancelled) {
              const role = res.data.data.role;
              if (role === 'admin') {
                setCurrentView('admin-dashboard');
                window.history.pushState({}, '', '/admin');
              } else if (role === 'handler') {
                setCurrentView('handler-portal');
                window.history.pushState({}, '', '/handler');
              } else {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }
            }
          }, 600);
        } else {
          setStatus('denied');
        }
      } catch {
        if (!cancelled) setStatus('denied');
      }
    };

    checkSession();
    return () => { cancelled = true; };
  }, [setCurrentView]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#FCB006] animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-white">Verifying session…</h1>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">Signed in!</h1>
          </div>
        )}
        {status === 'denied' && (
          <div className="space-y-4">
            <ShieldX className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">Sign-in failed</h1>
            <button
              onClick={() => {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }}
              className="px-6 py-2 bg-white/10 text-white rounded-xl"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
