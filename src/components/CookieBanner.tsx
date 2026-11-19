import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Cookie3DIcon } from './Cookie3DIcon';

export function CookieBanner() {
  const { currentView } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been saved
    const consent = localStorage.getItem('haifly_cookie_consent');
    if (!consent) {
      // Gentle delay so page renders smoothly before sliding in
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('haifly_cookie_consent', 'all');
    setVisible(false);
  };

  const handleEssential = () => {
    localStorage.setItem('haifly_cookie_consent', 'essential');
    setVisible(false);
  };

  // Don't show inside admin dashboard or handler portal
  if (!visible || currentView === 'admin-dashboard' || currentView === 'handler-portal') {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-3xl p-5 md:p-6 text-slate-800">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Cookie3DIcon className="w-11 h-11" />
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900">
                We use cookies
              </h3>
              <p className="text-xs text-slate-500">To enhance your shopping experience</p>
            </div>
          </div>
          <button
            onClick={handleEssential}
            aria-label="Dismiss cookie notice"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Haifly Trap uses essential cookies to keep you signed in, preserve your cart items, and provide a secure, seamless checkout.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 px-4 bg-[#0f5238] hover:bg-[#0b3d2a] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-900/10 btn-anim"
          >
            Accept All
          </button>
          <button
            onClick={handleEssential}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
