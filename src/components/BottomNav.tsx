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

  // A helper to determine if an item is active based on currentView
  const isActive = (item: any) => {
    if (item.id === 'account') {
      return currentView === 'settings' || currentView === 'customer-login' || currentView === 'recent-orders';
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
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-md bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 px-6 py-2 md:py-3 pointer-events-auto flex justify-between items-center relative h-[72px]">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.view as View)}
              className="relative flex flex-col items-center w-14 h-14"
            >
              <div 
                className={`flex items-center justify-center transition-all duration-300 ease-out absolute ${
                  active 
                    ? 'top-1 text-slate-800' 
                    : 'top-3 text-slate-400'
                }`}
              >
                <item.icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                
                {/* Cart Badge */}
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute bg-gold text-white font-black flex items-center justify-center rounded-full -top-1.5 -right-2 w-4 h-4 text-[9px]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              
              <span 
                className={`absolute bottom-1 text-[10px] transition-all duration-300 ${
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
  );
}
