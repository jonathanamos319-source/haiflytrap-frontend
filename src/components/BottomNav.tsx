import { useStore } from '@/hooks/useStore';
import { Home, ShoppingBag, BookOpen, ShoppingCart, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseUser } from '@/lib/supabase';
import type { View } from '@/types';

export function BottomNav() {
  const { currentView, setCurrentView, cartCount } = useStore();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabaseUser.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabaseUser.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', view: 'home' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop', view: 'shop' },
    { id: 'blog', icon: BookOpen, label: 'Blog', view: 'blog' },
    { id: 'cart', icon: ShoppingCart, label: 'Cart', view: 'cart' },
    { id: 'account', icon: User, label: 'Account', view: session ? 'settings' : 'home' },
  ];

  const isActive = (item: any) => {
    if (item.id === 'account') {
      return currentView === 'settings' || currentView === 'recent-orders';
    }
    if (item.id === 'shop') {
      return currentView === 'shop' || currentView === 'product';
    }
    if (item.id === 'blog') {
      return currentView === 'blog' || currentView === 'blog-post';
    }
    return currentView === item.view;
  };

  return (
    <>
      {/* Outer wrapper: floats above bottom with safe-area padding */}
      <div
        className="fixed left-0 right-0 z-50 flex items-end justify-center pointer-events-none"
        style={{
          bottom: 0,
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        }}
      >
        {/* The pill bar */}
        <div
          className="w-full max-w-sm pointer-events-auto relative bg-white border border-slate-200/80 rounded-[999px] shadow-[0_4px_24px_0_rgba(0,0,0,0.13),0_1.5px_6px_0_rgba(0,0,0,0.07)]"
          style={{ height: 64 }}
        >
          <div className="flex justify-between items-end h-full px-4 pb-2">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.view as View)}
                  className="relative flex flex-col items-center justify-end"
                  style={{ minWidth: 48, height: '100%' }}
                >
                  {/* Icon container — floats above the pill when active */}
                  <div
                    className={`flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.36,0.64,1)] ${
                      active
                        ? 'absolute bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-slate-100'
                        : 'mb-4'
                    }`}
                    style={
                      active
                        ? {
                            width: 48,
                            height: 48,
                            bottom: 28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }
                        : { width: 24, height: 24 }
                    }
                  >
                    <item.icon
                      className={active ? 'text-slate-800' : 'text-slate-400'}
                      style={{ width: active ? 22 : 22, height: active ? 22 : 22 }}
                      strokeWidth={active ? 2.5 : 1.8}
                    />

                    {/* Cart badge */}
                    {item.id === 'cart' && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] leading-none transition-all duration-200 ${
                      active ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
