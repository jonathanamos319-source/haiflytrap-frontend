import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { supabaseUser } from '@/lib/supabase';
import { api } from '@/lib/api';

import { Loader2, CheckCircle, ShieldX } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/pushNotifications';

type Status = 'loading' | 'verifying' | 'success' | 'wrong-portal';

/**
 * CustomerAuthCallback – handles /auth/callback/customer
 *
 * Supabase redirects here after a customer logs in (Google OAuth or magic link).
 *
 * Flow:
 *   - New user   → upsert into public.users with role='customer' → homepage
 *   - Customer   → homepage
 *   - Admin user → sign them out + show "Use the correct portal"
 */
export function CustomerAuthCallback() {
  const { setCurrentView } = useStore();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    const handleCustomer = async (userId: string, email: string | undefined) => {
      if (cancelled) return;
      setStatus('verifying');

      try {
        // 1. Sync user to database securely via API (handles upsert and role defaults)
        try {
          const syncRes = await api.post('/auth/sync');
          if (cancelled) return;

          if (!syncRes.data?.success) {
            throw new Error('Sync failed');
          }

          const userData = syncRes.data.data;
          
          // Subscribe to push notifications
          subscribeToPushNotifications('customer', userId, email);

          // 2. Check if this is an admin trying to use the customer portal
          if (userData.role === 'admin') {
            await supabaseUser.auth.signOut();
            setStatus('wrong-portal');
            return;
          }
        } catch (err: any) {
          // Silently catch initialization errors
          if (err.response?.status === 401 || err.response?.status === 400) {
            return;
          }
          throw err;
        }



        if (!cancelled) {
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
        }

      } catch (err) {
        console.error('Customer Auth Error:', err);
        if (!cancelled) {
          // On any error just send them home
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
      }
    };

    const run = async () => {
      const { data: { session }, error } = await supabaseUser.auth.getSession();


      if (cancelled) return;

      if (error || !session?.user) {
        const { data: { subscription } } = supabaseUser.auth.onAuthStateChange(

          async (_event, newSession) => {
            if (cancelled) return;
            if (newSession?.user) {
              subscription.unsubscribe();
              await handleCustomer(
                newSession.user.id,
                newSession.user.email
              );
            }
          }
        );
        return;
      }

      await handleCustomer(session.user.id, session.user.email);
    };

    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Logo */}
        <img
          src="/products/HAIFLYLOGO.png"
          alt="Haifly"
          className="h-12 w-auto object-contain mx-auto"
        />

        {/* Loading / Verifying */}
        {(status === 'loading' || status === 'verifying') && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#0f5238] animate-spin mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 mb-1">Signing you in…</h1>
              <p className="text-slate-500 text-sm">Just a moment.</p>
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 mb-1">Welcome back!</h1>
              <p className="text-slate-500 text-sm">Taking you to the shop…</p>
            </div>
          </div>
        )}

        {/* Wrong portal */}
        {status === 'wrong-portal' && (
          <div className="space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Wrong Portal</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Use the correct portal to access your admin account.
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }}
              className="w-full py-3 bg-[#0f5238] text-white font-bold rounded-2xl hover:opacity-90 transition-opacity btn-anim"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
