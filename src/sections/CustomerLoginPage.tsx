import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { api, getFriendlyApiError } from '@/lib/api';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Loader2, Mail, ArrowLeft, CheckCircle, RotateCw, UserCheck, LogOut, ShoppingBag, Shield } from 'lucide-react';

type LoginStep = 'form' | 'verify' | 'success';

export function CustomerLoginPage() {
  const { setCurrentView, logout } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('form');
  const [cooldown, setCooldown] = useState(0);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(() =>
    typeof window !== 'undefined' ? String(Math.min(350, Math.max(240, window.innerWidth - 48))) : '320'
  );

  useEffect(() => {
    const handleResize = () => {
      setGoogleBtnWidth(String(Math.min(350, Math.max(240, window.innerWidth - 48))));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Check if already logged in ──
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me?role=customer');
        if (cancelled) return;
        if (res.data?.success && res.data.data && step !== 'success') {
          const params = new URLSearchParams(window.location.search);
          const from = params.get('from');
          if (from) {
            window.location.href = from;
          } else {
            setExistingUser(res.data.data);
          }
        }
      } catch {
        // Not logged in
      }
    };
    checkSession();
    return () => { cancelled = true; };
  }, [step]);

  // ── Cooldown Timer ──
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSuccessfulAuth = (authUser?: any) => {
    window.dispatchEvent(new CustomEvent('haifly_auth_changed', { detail: { user: authUser } }));
    setStep('success');
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');
      if (from) {
        window.location.href = from;
      } else {
        setCurrentView('home');
        window.history.pushState({}, '', '/');
      }
    }, 1500);
  };

  // ── Google OAuth ──
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in token was not received.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      if (res.data?.success) {
        handleSuccessfulAuth(res.data.data);
      } else {
        setError(res.data?.error || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setError(getFriendlyApiError(err, 'Google sign-in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Request Email OTP ──
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await api.post('/auth/otp/request', {
        email: email.trim().toLowerCase(),
        name: fullName || undefined,
      });

      if (res.data?.success) {
        setStep('verify');
        setCooldown(60);
      } else {
        setError(res.data?.error || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(getFriendlyApiError(err, 'Failed to send verification code.'));
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await api.post('/auth/otp/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        name: fullName || undefined,
      });

      if (res.data?.success) {
        handleSuccessfulAuth(res.data.data);
      } else {
        setError(res.data?.error || 'Invalid verification code.');
      }
    } catch (err: any) {
      setError(getFriendlyApiError(err, 'Invalid verification code. Please try again.'));
    } finally {
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
        <div className="w-16" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Already logged in state */}
          {existingUser && (
            <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-forest text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md">
                {existingUser.name ? existingUser.name[0].toUpperCase() : (existingUser.email ? existingUser.email[0].toUpperCase() : 'U')}
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  Currently Signed In
                </span>
                <h2 className="text-xl font-bold text-forest mt-2">
                  {existingUser.name || 'Valued Customer'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono truncate px-2">
                  {existingUser.email}
                </p>
                {existingUser.role && existingUser.role !== 'customer' && (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-forest">
                    Role: {existingUser.role}
                  </span>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    setCurrentView('shop');
                    window.history.pushState({}, '', '/shop');
                  }}
                  className="w-full py-3 px-4 bg-forest hover:bg-forest/90 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 btn-anim"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </button>

                {existingUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentView('admin-dashboard');
                      window.history.pushState({}, '', '/admin');
                    }}
                    className="w-full py-2.5 px-4 bg-gold/15 hover:bg-gold/25 text-forest font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 btn-anim"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Go to Admin Portal</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    setExistingUser(null);
                  }}
                  className="w-full py-2.5 px-4 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign In With a Different Account</span>
                </button>
              </div>
            </div>
          )}

          {/* Success state */}
          {!existingUser && step === 'success' && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6 relative">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-[bounce_1.5s_infinite] shadow-lg shadow-emerald-200">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-[ping_2s_infinite] opacity-20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login Successful!</h2>
                <p className="text-slate-500 font-medium italic">Welcome back{firstName ? `, ${firstName}` : ''}</p>
              </div>
              <p className="text-slate-400 text-sm">Redirecting you in a moment…</p>
            </div>
          )}

          {/* Verify state */}
          {!existingUser && step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-slate-700">{email}</span>.
                </p>
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg py-1.5 px-3 mt-3 inline-block font-medium">
                  💡 Check your spam folder if you do not see it in your inbox.
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
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 focus:border-[#0f5238]/30 transition-all text-center tracking-widest text-2xl font-bold"
                    required
                    maxLength={6}
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

              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleRequestOtp()}
                  className="text-sm font-medium text-[#0f5238] hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>

                <button
                  onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {/* Form state */}
          {!existingUser && step === 'form' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                  Welcome back
                </h1>
                <p className="text-slate-500 text-sm">Sign in to track orders and save your details</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              {/* 1. Google Button First */}
              <div className="flex justify-center w-full overflow-hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in popup could not complete on this browser. Please use the 6-digit email code below.')}
                  shape="circle"
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width={googleBtnWidth}
                />
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  or email code
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* 2. Email OTP Fallback Form */}
              <form onSubmit={handleRequestOtp} className="space-y-4" id="customer-otp-form">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    Email address
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/30 transition-all"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  id="customer-send-code-btn"
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-4 bg-[#0f5238] text-white font-bold text-sm rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 btn-anim disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0f5238]/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Code…</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send 6-Digit Code</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[11px] text-slate-400 leading-relaxed">
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
