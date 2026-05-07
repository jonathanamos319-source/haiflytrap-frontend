import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import api from '@/lib/api';
import { supabaseHandler } from '@/lib/supabase';
import { Package, Loader2, ArrowLeft } from 'lucide-react';

export function HandlerLoginPage() {
  const { setCurrentView } = useStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Redirect if already logged in ──
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseHandler.auth.getSession();
      if (!session) return;

      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.success && meRes.data.data?.role === 'handler') {
          const params = new URLSearchParams(window.location.search);
          const from = params.get('from');

          if (from) {
            window.location.href = from;
          } else {
            setCurrentView('handler-portal');
            window.history.pushState({}, '', '/handler');
          }
        } else {
          await supabaseHandler.auth.signOut();
        }
      } catch {
        await supabaseHandler.auth.signOut();
      }
    };
    void checkSession();
  }, [setCurrentView]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dummyEmail = `${phone}@handler.haifly.com`;
      const { data, error: authError } = await supabaseHandler.auth.signInWithPassword({
        email: dummyEmail,
        password: phone,
      });

      
      if (authError) {
        throw new Error('Invalid phone number or not registered as handler');
      }

      // Verify role is handler via our secure backend endpoint
      const meRes = await api.get('/auth/me');
      if (meRes.data?.success && meRes.data.data?.role === 'handler') {
        setCurrentView('handler-portal');
        window.history.pushState({}, '', '/handler');
      } else {
        await supabaseHandler.auth.signOut();
        throw new Error('Access denied. Handler privileges required.');
      }

    } catch (err: unknown) {
      setError((err as Error).message || 'Authentication failed. Make sure your phone number is registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 w-full h-1/2 bg-[#0f5238] skew-y-6 origin-top-left -translate-y-20 z-0" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 btn-anim"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold tracking-widest uppercase">Back to Site</span>
        </button>

        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#0f5238]/10 mx-auto flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-[#0f5238]" />
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mb-2">Delivery Handler</h1>
            <p className="text-slate-500 text-sm">Enter your registered phone number to access your tasks.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full py-4 bg-[#0f5238] text-white font-bold rounded-2xl hover:bg-[#0f5238]/90 transition-all flex items-center justify-center gap-3 btn-anim disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading Dispatch...</span>
                </>
              ) : (
                <span>Access Portal</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
