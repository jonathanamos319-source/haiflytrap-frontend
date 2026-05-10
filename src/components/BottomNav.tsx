import { useStore } from '@/hooks/useStore';
import { Home, ShoppingBag, Star, MoreHorizontal, User, ShoppingCart, BookOpen, MapPin, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabaseUser } from '@/lib/supabase';
import type { View } from '@/types';

const W = 320;
const H = 60;
const R = 30;
const NOTCH_R = 24;
const NOTCH_DEPTH = 14;

function getPillPath(notchCx: number): string {
  const nr = NOTCH_R + 3;
  const depth = NOTCH_DEPTH;
  const spread = nr * 0.7;

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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseUser.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabaseUser.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  useEffect(() => { setShowMoreMenu(false); }, [currentView]);

  const NAV_ITEMS = [
    { id: 'home', icon: Home, label: 'Home', view: 'home' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop', view: 'shop' },
    { id: 'reviews', icon: Star, label: 'Reviews', view: 'reviews' },
    { id: 'more', icon: MoreHorizontal, label: 'More', view: '__more__' },
    { id: 'account', icon: User, label: 'Account', view: session ? 'settings' : 'customer-login' },
  ];

  const getActiveIndex = () => {
    for (let i = 0; i < NAV_ITEMS.length; i++) {
      const item = NAV_ITEMS[i];
      if (item.id === 'account' && (currentView === 'settings' || currentView === 'recent-orders' || currentView === 'customer-login')) return i;
      if (item.id === 'shop' && (currentView === 'shop' || currentView === 'product')) return i;
      if (item.id === 'more' && (currentView === 'blog' || currentView === 'blog-post' || currentView === 'track-order')) return i;
      if (currentView === item.view) return i;
    }
    return 0;
  };

  useEffect(() => {
    const idx = getActiveIndex();
    setActiveIndex(idx);
    const segW = W / NAV_ITEMS.length;
    setNotchX(segW * idx + segW / 2);
  }, [currentView, session]);

  const segW = W / NAV_ITEMS.length;

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.id === 'more') {
      setShowMoreMenu(prev => !prev);
    } else {
      setShowMoreMenu(false);
      setCurrentView(item.view as View);
    }
  };

  return (
    <>
      <style>{`
        .bnav-btn {
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
          background: none !important;
          border: none !important;
          cursor: pointer;
          padding: 0;
        }
        .bnav-btn:hover, .bnav-btn:focus, .bnav-btn:active {
          background: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .bnav-cart-btn {
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }
        .bnav-cart-btn:hover, .bnav-cart-btn:focus, .bnav-cart-btn:active {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Floating Cart Button — sits well above the nav */}
      <button
        className="bnav-cart-btn"
        onClick={() => setCurrentView('cart' as View)}
        aria-label="Cart"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 'calc(100px + env(safe-area-inset-bottom))',
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid rgba(0,0,0,0.07)',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        <ShoppingCart size={22} color="#0f5238" strokeWidth={2.2} />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 3, right: 3,
            width: 17, height: 17,
            background: '#FBBF24',
            color: '#fff',
            fontSize: 9, fontWeight: 900,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fff',
          }}>
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </button>

      {/* Main nav wrapper */}
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
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          pointerEvents: 'none',
        }}
      >
        {/* More popup sheet */}
        <div
          ref={moreMenuRef}
          style={{
            position: 'absolute',
            bottom: 'calc(88px + env(safe-area-inset-bottom))',
            left: '50%',
            width: 200,
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            pointerEvents: 'auto',
            opacity: showMoreMenu ? 1 : 0,
            transform: showMoreMenu
              ? 'translateX(-50%) translateY(0)'
              : 'translateX(-50%) translateY(10px)',
            visibility: showMoreMenu ? 'visible' : 'hidden',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            zIndex: 9998,
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px 8px', borderBottom: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>More</span>
            <button className="bnav-btn" onClick={() => setShowMoreMenu(false)} style={{ color: '#94a3b8' }}>
              <X size={14} />
            </button>
          </div>

          {[
            { icon: BookOpen, label: 'Blog', view: 'blog' },
            { icon: MapPin, label: 'Track Order', view: 'track-order' },
          ].map(link => (
            <button
              key={link.view}
              className="bnav-btn"
              onClick={() => { setCurrentView(link.view as View); setShowMoreMenu(false); }}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid #f8fafc',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <link.icon size={18} color="#0f5238" strokeWidth={2} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Pill nav */}
        <div style={{ position: 'relative', width: W, pointerEvents: 'auto' }}>

          {/* SVG pill with notch */}
          <svg
            width={W} height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{
              position: 'absolute', top: 0, left: 0,
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.14)) drop-shadow(0 1px 4px rgba(0,0,0,0.08))',
              WebkitTapHighlightColor: 'rgba(0,0,0,0)',
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
              top: -(NOTCH_R + 4),
              left: notchX - NOTCH_R,
              width: NOTCH_R * 2,
              height: NOTCH_R * 2,
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'left 0.35s cubic-bezier(0.34,1.2,0.64,1)',
              zIndex: 2,
            }}
          >
            {(() => {
              const Icon = NAV_ITEMS[activeIndex].icon;
              return <Icon size={20} strokeWidth={2.5} color="#0f5238" />;
            })()}
          </div>

          {/* Nav buttons row */}
          <div
            style={{
              position: 'relative', zIndex: 1,
              display: 'flex', width: W, height: H,
              alignItems: 'flex-end',
              paddingBottom: 10,
            }}
          >
            {NAV_ITEMS.map((item, idx) => {
              const active = idx === activeIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className="bnav-btn"
                  onClick={() => handleNavClick(item)}
                  onTouchStart={() => {}}
                  style={{
                    width: segW, height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end',
                    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                  }}
                >
                  {/* Spacer so label doesn't hide under circle */}
                  {active
                    ? <div style={{ height: 22, marginBottom: 2 }} />
                    : <div style={{ marginBottom: 2 }}><Icon size={19} strokeWidth={1.8} color="#94a3b8" /></div>
                  }

                  <span style={{
                    fontSize: 9,
                    lineHeight: 1,
                    fontWeight: active ? 700 : 500,
                    color: active ? '#0f5238' : '#94a3b8',
                  }}>
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