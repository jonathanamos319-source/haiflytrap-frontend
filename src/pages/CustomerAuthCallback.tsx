import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, ShieldX } from 'lucide-react';

type Status = 'loading' | 'verifying' | 'success' | 'wrong-portal';

export function CustomerAuthCallback() {
  const { setCurrentView } = useStore();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    const verifyCustomer = async () => {
      setStatus('verifying');
      try {
        const res = await api.get('/auth/me?role=customer');
        if (cancelled) return;

        if (res.data?.success && res.data.data) {
          const user = res.data.data;
          if (user.role === 'admin') {
            setStatus('wrong-portal');
            return;
          }

          setStatus('success');
          setTimeout(() => {
            if (!cancelled) {
              const params = new URLSearchParams(window.location.search);
              const from = params.get('from');
              if (from) {
                window.location.href = from;
              } else {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }
            }
          }, 600);
        } else {
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
      } catch {
        if (!cancelled) {
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
      }
    };

    verifyCustomer();
    return () => { cancelled = true; };
  }, [setCurrentView]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <img src="/products/HAIFLYLOGO.png" alt="Haifly" className="h-12 w-auto mx-auto object-contain" />
        {(status === 'loading' || status === 'verifying') && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#0f5238] animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-slate-800">Signing you in…</h1>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-bold text-slate-800">Welcome back!</h1>
          </div>
        )}
        {status === 'wrong-portal' && (
          <div className="space-y-5">
            <ShieldX className="w-10 h-10 text-amber-500 mx-auto" />
            <h1 className="text-xl font-bold text-slate-800">Wrong Portal</h1>
            <p className="text-slate-500 text-sm">Please use the admin portal to sign in.</p>
            <button
              onClick={() => {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }}
              className="w-full py-3 bg-[#0f5238] text-white font-bold rounded-2xl"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
