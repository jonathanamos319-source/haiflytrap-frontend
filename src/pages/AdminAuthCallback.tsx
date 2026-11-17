import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, ShieldX } from 'lucide-react';

type Status = 'loading' | 'verifying' | 'success' | 'denied';

export function AdminAuthCallback() {
  const { setCurrentView } = useStore();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const verifyRole = async () => {
      setStatus('verifying');
      try {
        const res = await api.get('/auth/me?role=admin');
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
          setStatus('denied');
          setErrorMsg('Your account does not have admin privileges.');
        }
      } catch {
        if (!cancelled) {
          setStatus('denied');
          setErrorMsg('Unable to verify admin session.');
        }
      }
    };

    verifyRole();
    return () => { cancelled = true; };
  }, [setCurrentView]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-sm text-center">
        {(status === 'loading' || status === 'verifying') && (
          <div className="space-y-6">
            <Loader2 className="w-10 h-10 text-[#FCB006] animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-white">Verifying admin access…</h1>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">Access Granted</h1>
          </div>
        )}
        {status === 'denied' && (
          <div className="space-y-4">
            <ShieldX className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">{errorMsg}</h1>
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
