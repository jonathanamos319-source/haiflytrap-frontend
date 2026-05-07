import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { loadGSAP } from '@/utils/gsap-loader';

export function ProductTransition() {
  const { isTransitioning, transitionData, completeTransition } = useStore();
  const [shouldRender, setShouldRender] = useState(false);
  const cloneRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTransitioning || !transitionData) return;

    const { sourceRect } = transitionData;
    if (!sourceRect) return;

    setShouldRender(true);
    document.body.style.overflow = 'hidden';

    let cancelled = false;
    const cleanup = () => {
      document.body.style.overflow = '';
    };

    const playAnimation = async () => {
      try {
        const { gsap } = await loadGSAP();
        const clone = cloneRef.current;
        const dim = dimRef.current;
        if (!clone || !dim) return;

        // Initial state (Static properties, no animation yet)
        Object.assign(clone.style, {
          display: 'block',
          top: `${sourceRect.top}px`,
          left: `${sourceRect.left}px`,
          width: `${sourceRect.width}px`,
          height: `${sourceRect.height}px`,
          opacity: '1',
          transform: 'none',
          transformOrigin: 'top left'
        });

        // Dim overlay animation
        gsap.to(dim, { opacity: 1, duration: 0.4, ease: 'power3.out' });

        if (cancelled) return;

        // Initial pulse
        await gsap.to(clone, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power3.out',
          yoyo: true,
          repeat: 1
        });

        if (cancelled) return;

        // Poll for target element
        let targetRect: DOMRect | null = null;
        for (let i = 0; i < 20 && !targetRect; i++) {
          const el = document.getElementById('product-detail-hero-image');
          if (el) targetRect = el.getBoundingClientRect();
          else await new Promise(r => setTimeout(r, 100));
        }

        if (targetRect) {
          const scaleX = targetRect.width / sourceRect.width;
          const scaleY = targetRect.height / sourceRect.height;
          const translateX = targetRect.left - sourceRect.left;
          const translateY = targetRect.top - sourceRect.top;

          await gsap.to(clone, {
            x: translateX,
            y: translateY,
            scaleX: scaleX,
            scaleY: scaleY,
            duration: 0.8,
            ease: 'expo.out'
          });
        } else {
          // Fallback to center
          await gsap.to(clone, {
            x: window.innerWidth / 2 - sourceRect.left - sourceRect.width / 2,
            y: window.innerHeight / 2 - sourceRect.top - sourceRect.height / 2,
            scale: 2,
            duration: 0.8,
            ease: 'expo.out'
          });
        }

        if (cancelled) return;

        const detailsEl = document.getElementById('product-detail-content');
        if (detailsEl) {
          gsap.fromTo(detailsEl, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          );
        }

        await gsap.to(clone, { opacity: 0, duration: 0.3, ease: 'power3.out' });
      } catch (err) {
        console.error('Transition error:', err);
      } finally {
        if (!cancelled) {
          cleanup();
          completeTransition();
          setShouldRender(false);
        }
      }
    };

    playAnimation();

    return () => {
      cancelled = true;
      cleanup();
      completeTransition();
    };
  }, [isTransitioning, transitionData, completeTransition]);


  if (!shouldRender || !transitionData) return null;

  return (
    // Outer wrapper: just a portal root, no ref needed here
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* ✅ Fix 1: dimRef now correctly targets the visible overlay */}
      <div
        ref={dimRef}
        className="absolute inset-0 bg-white/90 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />
      <div
        ref={cloneRef}
        className="fixed z-[101] overflow-hidden rounded-2xl bg-surface shadow-2xl"
        style={{ display: 'none' }}
      >
        <img
          src={transitionData.image || ''}
          className="w-full h-full object-cover"
          alt="transitioning product"
        />
      </div>
    </div>
  );
}
