import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Module-level flag: resets to false on every real page refresh (JS bundle reload)
// but stays true during SPA navigation (module stays in memory)
let hasShownThisSession = false;

export function DeliveryModal({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [animateText, setAnimateText] = useState(false);

  useEffect(() => {
    // On pages with alwaysShow: skip session check and always show
    if (!alwaysShow && hasShownThisSession) return;

    if (!alwaysShow) {
      hasShownThisSession = true;
    }

    // Reset state for clean re-show
    setVisible(false);
    setAnimateText(false);

    // Small delay so the page has time to paint first
    const showTimer = setTimeout(() => {
      setVisible(true);
      // Stagger the text slide-in slightly after the pill appears
      setTimeout(() => setAnimateText(true), 150);
    }, 800);

    // Auto-dismiss after 5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  // Render into document.body via portal — bypasses ALL stacking contexts
  return createPortal(
    <>
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          zIndex: 999999,
          pointerEvents: 'none',
          animation: 'toastSlideUp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'white',
          borderRadius: '9999px',
          padding: '12px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.07)',
        }}>
          {/* Icon */}
          <span style={{ fontSize: '18px', lineHeight: 1, userSelect: 'none' }}>🏷️</span>

          {/* Sliding text */}
          <p style={{
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '13px',
            whiteSpace: 'nowrap',
            margin: 0,
            transform: animateText ? 'translateX(0)' : 'translateX(18px)',
            opacity: animateText ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease',
          }}>
            Same-day Lagos delivery · 24–48h nationwide
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}
