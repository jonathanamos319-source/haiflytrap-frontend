import { useStore } from '@/hooks/useStore';
import { Home, ShoppingBag, Star, MoreHorizontal, User as UserIcon, ShoppingCart, BookOpen, MapPin, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

const noHL: React.CSSProperties = {
  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
  outline: 'none',
  userSelect: 'none',
};

export function BottomNav() {
  const { currentView, setCurrentView, cartCount, user } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [notchX, setNotchX] = useState<number>(W / 5 / 2);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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

  const accountLabel = user ? (user.name?.trim().split(' ')[0] || 'Account') : 'Login';

  const NAV_ITEMS = [
    { id: 'home', icon: Home, label: 'Home', view: 'home' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop', view: 'shop' },
    { id: 'reviews', icon: Star, label: 'Reviews', view: 'reviews' },
    { id: 'more', icon: MoreHorizontal, label: 'More', view: '__more__' },
    { id: 'account', icon: UserIcon, label: accountLabel, view: user ? 'settings' : 'customer-login' },
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
    setNotchX((W / NAV_ITEMS.length) * idx + (W / NAV_ITEMS.length) / 2);
  }, [currentView, user]);

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
        .bnav-div {
          -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
          outline: none !important;
          -webkit-appearance: none !important;
        }
        .bnav-div:hover, .bnav-div:focus, .bnav-div:active {
          background: transparent !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Floating Cart Button — white circle with green icon */}
      <div
        role="button"
        tabIndex={0}
        className="bnav-div"
        onClick={() => setCurrentView('cart' as View)}
        onTouchEnd={(e) => { e.preventDefault(); setCurrentView('cart' as View); }}
        style={{
          ...noHL,
          position: 'fixed',
          right: 20,
          bottom: 'calc(100px + env(safe-area-inset-bottom))',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid rgba(0,0,0,0.08)',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        <ShoppingCart size={22} color="#0f5238" strokeWidth={2.2} />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: 3, right: 3,
            width: 17, height: 17,
            background: '#FBBF24', color: '#fff',
            fontSize: 9, fontWeight: 900,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fff',
          }}>
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </div>

      {/* Main nav wrapper */}
      <div style={{
        ...noHL,
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        pointerEvents: 'none',
      }}>

        {/* More popup */}
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
            transform: showMoreMenu ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(10px)',
            visibility: showMoreMenu ? 'visible' : 'hidden',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            zIndex: 9998,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>More</span>
            <div role="button" className="bnav-div" onClick={() => setShowMoreMenu(false)} onTouchEnd={(e) => { e.preventDefault(); setShowMoreMenu(false); }} style={{ ...noHL, cursor: 'pointer', color: '#94a3b8' }}>
              <X size={14} />
            </div>
          </div>
          {[
            { icon: BookOpen, label: 'Blog', view: 'blog' },
            { icon: MapPin, label: 'Track Order', view: 'track-order' },
          ].map(link => (
            <div
              key={link.view}
              role="button"
              className="bnav-div"
              onClick={() => { setCurrentView(link.view as View); setShowMoreMenu(false); }}
              onTouchEnd={(e) => { e.preventDefault(); setCurrentView(link.view as View); setShowMoreMenu(false); }}
              style={{ ...noHL, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <link.icon size={18} color="#0f5238" strokeWidth={2} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{link.label}</span>
            </div>
          ))}
        </div>

        {/* Pill nav */}
        <div style={{ ...noHL, position: 'relative', width: W, pointerEvents: 'auto' }}>

          {/* SVG pill with notch curve — NO rect, just the path */}
          <svg
            width={W} height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{
              ...noHL,
              position: 'absolute', top: 0, left: 0,
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.14)) drop-shadow(0 1px 4px rgba(0,0,0,0.08))',
            }}
          >
            <path
              d={getPillPath(notchX)}
              fill="white"
              style={{ transition: 'd 0.35s cubic-bezier(0.34,1.2,0.64,1)' }}
            />
          </svg>

          {/* Active floating circle */}
          <div style={{
            ...noHL,
            position: 'absolute',
            top: -(NOTCH_R + 4),
            left: notchX - NOTCH_R,
            width: NOTCH_R * 2, height: NOTCH_R * 2,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'left 0.35s cubic-bezier(0.34,1.2,0.64,1)',
            zIndex: 2,
          }}>
            {(() => { const Icon = NAV_ITEMS[activeIndex].icon; return <Icon size={20} strokeWidth={2.5} color="#0f5238" />; })()}
            {NAV_ITEMS[activeIndex].id === 'account' && user && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 9, height: 9, borderRadius: '50%',
                background: '#10b981', border: '1.5px solid #fff',
              }} />
            )}
          </div>

          {/* Nav tab divs — using div instead of button kills the yellow highlight */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', width: W, height: H,
            alignItems: 'flex-end', paddingBottom: 10,
          }}>
            {NAV_ITEMS.map((item, idx) => {
              const active = idx === activeIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="bnav-div"
                  onClick={() => handleNavClick(item)}
                  onTouchEnd={(e) => { e.preventDefault(); handleNavClick(item); }}
                  style={{
                    ...noHL,
                    width: segW, height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end',
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                >
                  {active
                    ? <div style={{ height: 22, marginBottom: 2 }} />
                    : (
                      <div style={{ marginBottom: 2, position: 'relative' }}>
                        <Icon size={19} strokeWidth={1.8} color="#94a3b8" />
                        {item.id === 'account' && user && (
                          <span style={{
                            position: 'absolute', top: -1, right: -3,
                            width: 7, height: 7, borderRadius: '50%',
                            background: '#10b981', border: '1.5px solid #fff',
                          }} />
                        )}
                      </div>
                    )
                  }
                  <span style={{
                    fontSize: 9, lineHeight: 1,
                    fontWeight: active ? 700 : 500,
                    color: active ? '#0f5238' : '#94a3b8',
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}