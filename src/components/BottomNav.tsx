import { useStore } from '@/hooks/useStore';
import { Home, ShoppingBag, BookOpen, ShoppingCart, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseUser } from '@/lib/supabase';
import type { View } from '@/types';

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home', view: 'home' },
  { id: 'shop', icon: ShoppingBag, label: 'Shop', view: 'shop' },
  { id: 'blog', icon: BookOpen, label: 'Blog', view: 'blog' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart', view: 'cart' },
  { id: 'account', icon: User, label: 'Account', view: '' },
];

const W = 340;
const H = 64;
const R = 32;
const NOTCH_R = 28;
const NOTCH_DEPTH = 18;

function getPillPath(notchCx: number): string {
  const nr = NOTCH_R + 4;
  const depth = NOTCH_DEPTH;
  const spread = nr * 0.75;

  return [
    `M ${R} 0`,
    `L ${notchCx - nr - spread} 0`,
    `C ${notchCx - nr - spread * 0.2} 0, ${notchCx - nr} ${depth * 0.3}, ${notchCx - nr} ${depth}`,
    `A ${nr} ${nr} 0 0 0 ${notchCx + nr} ${depth}`,
    `C ${notchCx + nr} ${depth * 0.3}, ${notchCx + nr + spread * 0.2} 0, ${notchCx + nr + spread} 0`,
    `L ${W - R} 0`,
    `Q ${W} 0 ${W} ${R}`,
    `L ${W} ${H - R}`,
    `Q ${W} ${H} ${W - R} ${H}`,
    `L ${R} ${H}`,
    `Q 0 ${H} 0 ${H - R}`,
    `L 0 ${R}`,
    `Q 0 0 ${R} 0`,
    `Z`,
  ].join(' ');
}

export function BottomNav() {
  const { currentView, setCurrentView, cartCount } = useStore();
  const [session, setSession] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [notchX, setNotchX] = useState<number>(W / 5 / 2);

  useEffect(() => {
    supabaseUser.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabaseUser.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const navItems = NAV_ITEMS.map(item =>
    item.id === 'account' ? { ...item, view: session ? 'settings' : 'home' } : item
  );

  const getActiveIndex = () => {
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      if (item.id === 'account' && (currentView === 'settings' || currentView === 'recent-orders')) return i;
      if (item.id === 'shop' && (currentView === 'shop' || currentView === 'product')) return i;
      if (item.id === 'blog' && (currentView === 'blog' || currentView === 'blog-post')) return i;
      if (currentView === item.view) return i;
    }
    return 0;
  };

  useEffect(() => {
    const idx = getActiveIndex();
    setActiveIndex(idx);
    const segW = W / navItems.length;
    setNotchX(segW * idx + segW / 2);
  }, [currentView, session]);

  const segW = W / navItems.length;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'relative', width: W, pointerEvents: 'auto' }}>

        {/* SVG pill with animated notch */}
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.16)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))',
          }}
        >
          <path
            d={getPillPath(notchX)}
            fill="white"
            style={{ transition: 'd 0.35s cubic-bezier(0.34,1.2,0.64,1)' }}
          />
        </svg>

        {/* Active floating circle */}
        <div
          style={{
            position: 'absolute',
            top: -(NOTCH_R + 2),
            left: notchX - NOTCH_R,
            width: NOTCH_R * 2,
            height: NOTCH_R * 2,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.35s cubic-bezier(0.34,1.2,0.64,1)',
            zIndex: 2,
          }}
        >
          {(() => {
            const Icon = navItems[activeIndex].icon;
            return <Icon size={22} strokeWidth={2.5} color="#1a1a1a" />;
          })()}

          {navItems[activeIndex].id === 'cart' && cartCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 15, height: 15,
              background: '#FBBF24', color: '#fff',
              fontSize: 8, fontWeight: 900, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>

        {/* Nav buttons row */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            width: W,
            height: H,
            alignItems: 'flex-end',
            paddingBottom: 10,
          }}
        >
          {navItems.map((item, idx) => {
            const active = idx === activeIndex;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.view as View)}
                style={{
                  width: segW,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {!active && (
                  <div style={{ position: 'relative', marginBottom: 4 }}>
                    <Icon size={20} strokeWidth={1.8} color="#94a3b8" />
                    {item.id === 'cart' && cartCount > 0 && (
                      <span style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 15, height: 15,
                        background: '#FBBF24', color: '#fff',
                        fontSize: 8, fontWeight: 900, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                )}
                {active && <div style={{ height: 24, marginBottom: 4 }} />}

                <span style={{
                  fontSize: 10,
                  lineHeight: 1,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#1a1a1a' : '#94a3b8',
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}