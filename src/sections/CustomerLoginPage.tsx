import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { supabaseUser } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

type LoginStep = 'form' | 'verify' | 'success';

export function CustomerLoginPage() {
  const { setCurrentView } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('form');

  // ── Redirect if already logged in ──
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const { data: { session } } = await supabaseUser.auth.getSession();
      if (session && !cancelled && step !== 'success') {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        if (from) {
          window.location.href = from;
        } else {
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
      }
    };
    checkSession();
    return () => { cancelled = true; };
  }, [setCurrentView]);


  // ── Magic Link ──
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { error: otpError } = await supabaseUser.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback/customer${window.location.search}`,
        },

      });
      if (otpError) throw otpError;
      setStep('verify');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabaseUser.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'email',
      });

      if (verifyError) throw verifyError;

      const userId = data.session?.user?.id;
      if (!userId) throw new Error('No user returned.');

      // 1. Update user metadata with their name FIRST
      // This ensures the backend sync picks up the correct profile info
      try {
        await supabaseUser.auth.updateUser({
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            role: 'customer'
          }
        });
      } catch (metaErr) {
        console.warn('Metadata update failed, continuing with sync:', metaErr);
      }

      // 2. Sync user to database securely via API (handles upsert and role defaults)
      try {
        const syncRes = await api.post('/auth/sync');
        if (!syncRes.data?.success) {
          throw new Error(syncRes.data?.error || 'Failed to sync account data');
        }

        const userData = syncRes.data.data;

        // 3. If admin, reject (don't allow admins on customer portal)
        if (userData.role === 'admin') {
          await supabaseUser.auth.signOut();
          setError('This portal is for customers. Admin login detected.');
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error('Account sync error:', err);
        if (err.response?.data) {
          console.error('Sync error details:', err.response.data);
        }
        setError(err.response?.data?.error || err.message || 'Account verification failed. Please try again.');
        setLoading(false);
        return;
      }


      // Success feedback
      setStep('success');
      
      // Redirect after a short delay
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        if (from) {
          window.location.href = from;
        } else {
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
      }, 2500);

    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-100">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors btn-anim"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <img
          src="/products/HAIFLYLOGO.png"
          alt="Haifly"
          className="h-9 md:h-11 w-auto object-contain"
        />
        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Success state */}
          {step === 'success' && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6 relative">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-[bounce_1.5s_infinite] shadow-lg shadow-emerald-200">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-[ping_2s_infinite] opacity-20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login Successful!</h2>
                <p className="text-slate-500 font-medium italic">Welcome back, {firstName}</p>
              </div>
              <p className="text-slate-400 text-sm">Hold on, we're taking you back...</p>
              <div className="pt-4 flex justify-center">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#0f5238] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-[#0f5238] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-[#0f5238] rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          {/* Verify state */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We sent a secure code to{' '}
                  <span className="font-semibold text-slate-700">{email}</span>.
                  Enter it below to sign in.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter code"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 focus:border-[#0f5238]/30 transition-all text-center tracking-widest text-lg font-bold"
                    required
                    maxLength={10}
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 bg-[#0f5238] text-white font-bold text-sm rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 btn-anim disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify & Sign In</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                  className="text-sm text-slate-400 hover:text-slate-700 transition-colors underline underline-offset-4"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {/* Form state */}
          {step === 'form' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                  Welcome back
                </h1>
                <p className="text-slate-500 text-sm">Sign in to track your orders and more</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              {/* Login form */}
              <form onSubmit={handleMagicLink} className="space-y-4" id="customer-magic-link-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 focus:border-[#0f5238]/30 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 focus:border-[#0f5238]/30 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">
                    Email address
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 focus:border-[#0f5238]/30 transition-all"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  id="customer-send-link-btn"
                  type="submit"
                  disabled={loading || !email.trim() || !firstName.trim() || !lastName.trim()}
                  className="w-full py-4 bg-[#0f5238] text-white font-bold text-sm rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 btn-anim disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending link…</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                By signing in you agree to our{' '}
                <span className="underline cursor-pointer hover:text-slate-600 transition-colors">Terms of Service</span>{' '}
                and{' '}
                <span className="underline cursor-pointer hover:text-slate-600 transition-colors">Privacy Policy</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
