import { useId } from 'react';

export type PanelVariant = 'crimson-top' | 'forest-middle' | 'white-bottom';

interface OrganicPanelBackdropProps {
  variant: PanelVariant;
}

/**
 * Renders responsive desktop/tablet and mobile SVG organic panel backdrops with smooth
 * Bezier rounded vertices and parallel interlocking diagonal seams colored strictly
 * with HAI FLY TRAP brand/packaging tones.
 */
export function OrganicPanelBackdrop({ variant }: OrganicPanelBackdropProps) {
  const uid = useId().replace(/:/g, '');
  const desktopGradId = `panel-grad-${variant}-d-${uid}`;
  const mobileGradId = `panel-grad-${variant}-m-${uid}`;

  // Desktop & tablet (md+) SVG paths on a 1000x320 coordinate space with parallel interlocking slopes
  const desktopPaths: Record<PanelVariant, string> = {
    // Top subtle arch-wave; bottom slopes UP from left (y=314) to right (y=272)
    'crimson-top':
      'M 2,52 Q 2,16 38,14 C 320,2 680,26 962,10 Q 998,8 998,44 L 998,236 Q 998,268 962,272 C 660,292 340,298 38,314 Q 2,316 2,280 Z',
    // Top runs parallel to crimson-top bottom (/); bottom slopes DOWN left-to-right (\)
    'forest-middle':
      'M 2,74 Q 2,42 38,38 C 340,22 660,16 962,4 Q 998,2 998,36 L 998,278 Q 998,314 962,310 C 660,290 340,282 38,266 Q 2,262 2,228 Z',
    // Top runs parallel to forest-middle bottom (\); bottom finishes with gentle asymmetric organic wave
    'white-bottom':
      'M 2,36 Q 2,4 38,8 C 340,24 660,32 962,48 Q 998,52 998,86 L 998,274 Q 998,308 962,310 C 680,318 320,296 38,312 Q 2,314 2,278 Z',
  };

  // Mobile (< md) SVG paths matching the exact same parallel diagonal (/) and (\) seams
  const mobilePaths: Record<PanelVariant, string> = {
    'crimson-top':
      'M 2,34 Q 2,10 28,8 C 145,2 255,14 372,8 Q 398,6 398,32 L 398,438 Q 398,464 372,468 C 255,482 145,488 28,500 Q 2,502 2,474 Z',
    'forest-middle':
      'M 2,60 Q 2,36 28,32 C 145,20 255,14 372,4 Q 398,2 398,28 L 398,472 Q 398,500 372,496 C 255,482 145,474 28,462 Q 2,458 2,432 Z',
    'white-bottom':
      'M 2,28 Q 2,4 28,8 C 145,20 255,28 372,40 Q 398,44 398,70 L 398,472 Q 398,496 372,498 C 250,504 150,490 28,500 Q 2,502 2,476 Z',
  };

  const renderFillDefs = (id: string) => {
    if (variant === 'crimson-top') {
      return (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d9161e" />
          <stop offset="55%" stopColor="#e40d14" />
          <stop offset="100%" stopColor="#b50b12" />
        </linearGradient>
      );
    }
    if (variant === 'forest-middle') {
      return (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f5238" />
          <stop offset="55%" stopColor="#0b4b32" />
          <stop offset="100%" stopColor="#006c48" />
        </linearGradient>
      );
    }
    return (
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f8faf9" />
      </linearGradient>
    );
  };

  const strokeColor =
    variant === 'white-bottom'
      ? '#017810'
      : variant === 'forest-middle'
        ? '#01b200'
        : 'rgba(255,255,255,0.28)';

  const strokeWidth = variant === 'white-bottom' ? 2.5 : 1.5;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full drop-shadow-[0_12px_24px_rgba(15,82,56,0.14)]"
    >
      {/* Desktop & Tablet Organic Silhouette */}
      <svg
        viewBox="0 0 1000 320"
        preserveAspectRatio="none"
        className="hidden md:block w-full h-full overflow-visible"
      >
        <defs>{renderFillDefs(desktopGradId)}</defs>
        <path
          d={desktopPaths[variant]}
          fill={`url(#${desktopGradId})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          vectorEffect="nonScalingStroke"
        />
      </svg>

      {/* Mobile Interlocking Diagonal Silhouette */}
      <svg
        viewBox="0 0 400 504"
        preserveAspectRatio="none"
        className="block md:hidden w-full h-full overflow-visible"
      >
        <defs>{renderFillDefs(mobileGradId)}</defs>
        <path
          d={mobilePaths[variant]}
          fill={`url(#${mobileGradId})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          vectorEffect="nonScalingStroke"
        />
      </svg>
    </div>
  );
}

export type MiniCardVariant = 'tamper-seal' | 'price-trust' | 'promise-cta';

/**
 * Custom asymmetric organic SVG silhouettes for the bottom highlight cards so no
 * card in the showcase falls back to an ordinary flat rectangle.
 */
export function OrganicMiniCardBackdrop({ variant }: { variant: MiniCardVariant }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `mini-grad-${variant}-${uid}`;

  const paths: Record<MiniCardVariant, string> = {
    'tamper-seal':
      'M 2,26 Q 2,4 24,6 C 145,2 255,14 374,6 Q 398,4 398,28 L 398,186 Q 398,210 374,212 C 250,218 140,206 24,214 Q 2,216 2,190 Z',
    'price-trust':
      'M 2,30 Q 2,8 26,10 C 145,16 255,2 374,8 Q 398,8 398,32 L 398,192 Q 398,216 372,214 C 245,204 145,216 26,210 Q 2,210 2,184 Z',
    'promise-cta':
      'M 2,24 Q 2,4 28,6 C 150,14 255,4 374,14 Q 398,16 398,40 L 398,188 Q 398,214 372,212 C 245,206 140,218 24,210 Q 2,208 2,184 Z',
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full drop-shadow-[0_10px_20px_rgba(15,82,56,0.12)]"
    >
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {variant === 'tamper-seal' && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8faf9" />
            </linearGradient>
          )}
          {variant === 'price-trust' && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f5238" />
              <stop offset="100%" stopColor="#0a3d2a" />
            </linearGradient>
          )}
          {variant === 'promise-cta' && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#017810" />
              <stop offset="100%" stopColor="#0f5238" />
            </linearGradient>
          )}
        </defs>
        <path
          d={paths[variant]}
          fill={`url(#${gradId})`}
          stroke={
            variant === 'tamper-seal'
              ? '#e40d14'
              : variant === 'price-trust'
                ? '#01b200'
                : 'rgba(255,255,255,0.28)'
          }
          strokeWidth={variant === 'tamper-seal' ? 2 : 1.5}
          vectorEffect="nonScalingStroke"
        />
      </svg>
    </div>
  );
}
