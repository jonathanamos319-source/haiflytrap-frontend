import React from 'react';

interface IconProps {
  className?: string;
}

/** Detailed winged sand fly illustration inside a pest medallion. */
export function SandFlySvg({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Translucent veined wings held V-shaped */}
      <path
        d="M30 28 C16 14, 6 14, 8 24 C10 31, 22 33, 30 31Z"
        fill="#d1d5db"
        fillOpacity="0.6"
        stroke="#4b5563"
        strokeWidth="1.5"
      />
      <path
        d="M34 28 C48 14, 58 14, 56 24 C54 31, 42 33, 34 31Z"
        fill="#d1d5db"
        fillOpacity="0.6"
        stroke="#4b5563"
        strokeWidth="1.5"
      />
      {/* Long slender legs */}
      <path d="M29 29 L18 22 L12 29" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M35 29 L46 22 L52 29" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M29 33 L15 39 L10 49" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M35 33 L49 39 L54 49" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M30 37 L21 48 L18 57" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M34 37 L43 48 L46 57" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
      {/* Segmented thorax & abdomen */}
      <ellipse cx="32" cy="28" rx="3.4" ry="4.5" fill="#78716c" stroke="#292524" strokeWidth="1.3" />
      <ellipse cx="32" cy="40" rx="2.8" ry="8.5" fill="#a8a29e" stroke="#292524" strokeWidth="1.3" />
      <path d="M29.5 36 H34.5 M29.5 40 H34.5 M30 44 H34" stroke="#44403c" strokeWidth="1.1" />
      {/* Head, eyes & proboscis */}
      <circle cx="32" cy="21" r="2.7" fill="#44403c" />
      <path d="M32 18.5 V12" stroke="#292524" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M30.5 20 Q25 14 23 11" stroke="#57534e" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M33.5 20 Q39 14 41 11" stroke="#57534e" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Detailed lateral jumping flea illustration. */
export function FleaSvg({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Hind jumping legs */}
      <path
        d="M36 33 L47 22 L43 47 L51 53"
        stroke="#451a03"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 36 L24 48 L19 54"
        stroke="#451a03"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 34 L14 43 L11 50"
        stroke="#451a03"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plump reddish-brown segmented oval body */}
      <path
        d="M16 30 C16 21, 27 16, 40 20 C51 23, 52 36, 44 41 C34 45, 19 40, 16 30Z"
        fill="#7c2d12"
        stroke="#451a03"
        strokeWidth="1.6"
      />
      {/* Body plates / segments */}
      <path d="M24 20 C23 26, 23 32, 24 38" stroke="#c2410c" strokeWidth="1.2" />
      <path d="M31 19 C30 26, 30 34, 31 41" stroke="#c2410c" strokeWidth="1.2" />
      <path d="M38 20 C37 27, 37 35, 38 41" stroke="#c2410c" strokeWidth="1.2" />
      <path d="M44 23 C43 29, 43 34, 44 39" stroke="#c2410c" strokeWidth="1.2" />
      {/* Tiny head & piercing mouthpart */}
      <circle cx="17" cy="29" r="3.5" fill="#7c2d12" stroke="#451a03" strokeWidth="1.4" />
      <circle cx="15.8" cy="28" r="1" fill="#1c1917" />
      <path d="M14 31 L10 35" stroke="#451a03" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Detailed lime-green plant-eating aphid matching the Broad Killer label artwork. */
export function AphidSvg({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Slender legs & antennae */}
      <path d="M25 22 Q19 13 13 10" stroke="#3f6212" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M28 22 Q33 13 38 10" stroke="#3f6212" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M25 28 L15 24 L11 29" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M39 28 L49 24 L53 29" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 34 L14 38 L10 45" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 34 L50 38 L54 45" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 42 L18 50 L16 56" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 42 L46 50 L48 56" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cornicles (characteristic rear aphid tail tubes) */}
      <path d="M27 47 L23 55" stroke="#4d7c0f" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M37 47 L41 55" stroke="#4d7c0f" strokeWidth="2.2" strokeLinecap="round" />
      {/* Pear-shaped green abdomen & thorax */}
      <ellipse cx="32" cy="36" rx="10.5" ry="13.5" fill="#84cc16" stroke="#365314" strokeWidth="1.6" />
      <ellipse cx="32" cy="24" rx="5.5" ry="4.5" fill="#65a30d" stroke="#365314" strokeWidth="1.4" />
      {/* Dark compound eyes */}
      <circle cx="28" cy="21" r="1.4" fill="#1a2e05" />
      <circle cx="36" cy="21" r="1.4" fill="#1a2e05" />
      {/* Segment highlights */}
      <path d="M24 33 Q32 36 40 33" stroke="#4d7c0f" strokeWidth="1.1" />
      <path d="M24 39 Q32 42 40 39" stroke="#4d7c0f" strokeWidth="1.1" />
    </svg>
  );
}

/** Detailed glossy dark black beetle illustration. */
export function BlackBeetleSvg({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Antennae & mandibles */}
      <path d="M28 16 Q23 11 19 10" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M36 16 Q41 11 45 10" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
      {/* Six articulated beetle legs */}
      <path d="M24 27 L14 21 L11 26" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 27 L50 21 L53 26" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 36 L11 36 L9 43" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 36 L53 36 L55 43" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 45 L14 52 L13 58" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M41 45 L50 52 L51 58" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      {/* Glossy dark carapace wing shell */}
      <ellipse cx="32" cy="39" rx="12" ry="15" fill="#1f2937" stroke="#09090b" strokeWidth="1.8" />
      <path d="M32 25 V54" stroke="#09090b" strokeWidth="1.6" />
      {/* Pronotum & head */}
      <path
        d="M22 25 C22 18, 42 18, 42 25 C38 27, 26 27, 22 25Z"
        fill="#111827"
        stroke="#09090b"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="17" r="4.2" fill="#111827" stroke="#09090b" strokeWidth="1.4" />
      {/* Subtle sheen highlight */}
      <path d="M26 30 C24 35, 24 41, 26 46" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Bottle-style green silhouette icon for Humans. */
export function HumansEmblemSvg({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      {/* Adult */}
      <circle cx="17.5" cy="12.5" r="4" />
      <path d="M12.5 19.5 C12.5 17.5, 22.5 17.5, 22.5 19.5 L24 29 H21 V39 H14 V29 H11 Z" />
      {/* Child */}
      <circle cx="31.5" cy="18.5" r="3" />
      <path d="M27.5 23.5 C27.5 22, 35.5 22, 35.5 23.5 L36.5 31 H34 V39 H29 V31 H26.5 Z" />
    </svg>
  );
}

/** Bottle-style green silhouette icon for Dogs. */
export function DogEmblemSvg({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      <path d="M35.5 14 L38.5 10.5 C39.3 9.7, 40.5 10.4, 40.3 11.6 L39.7 15.8 L42.5 17.2 C43.3 17.6, 43.4 18.8, 42.6 19.4 L39 22 C37.8 23, 37.5 24.5, 37.5 26 V37.5 C37.5 38.6, 36.6 39.5, 35.5 39.5 C34.4 39.5, 33.5 38.6, 33.5 37.5 V30.5 H20.5 V37.5 C20.5 38.6, 19.6 39.5, 18.5 39.5 C17.4 39.5, 16.5 38.6, 16.5 37.5 V29 L11.5 26 C10.4 25.4, 10 24, 10.6 22.9 C11.1 22, 12.1 21.7, 13.1 22 L17.5 23.4 C19.5 20.6, 24 19.5, 29.5 19.5 L34 15 Z" />
    </svg>
  );
}

/** Bottle-style green silhouette icon for Horses. */
export function HorseEmblemSvg({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      <path d="M36 10 L38.5 12.8 L41.5 15 C42 15.5, 41.8 16.5, 41 16.8 L37.8 17.8 C36.2 18.3, 35.4 19.8, 35.4 21.5 V25.5 C35.4 27, 34.8 28.2, 34.4 29.5 L35.2 38 C35.3 39, 34.5 39.6, 33.7 39.6 C32.9 39.6, 32.3 39, 32.2 38.1 L31 30.5 H21 L19.8 38.1 C19.7 39, 19 39.6, 18.2 39.6 C17.4 39.6, 16.8 39, 16.9 38 L17.7 29.5 C15.2 29.5, 12.8 31.8, 12 35 C11 33.8, 10.8 30.8, 12.4 28.3 C14 25.8, 17 24.5, 21 24.2 C25.2 23.8, 28.5 21.6, 30.5 16.5 L32 11.8 L34.2 12 Z" />
    </svg>
  );
}

/** Matching bottle-style green silhouette icon for Pigs. */
export function PigEmblemSvg({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.5 24 C10.4 24, 9.2 22.8, 9.8 21 C10.3 19.6, 12 19.5, 13.2 20.4 C15.5 17.5, 19.8 16, 25 16 C29.5 16, 33 17.2, 35.2 19 L37.5 15.8 L38.8 19.2 L41.5 20.4 C42.4 20.8, 42.8 21.8, 42.6 22.8 L42 25.5 C41.8 26.4, 41 27, 40 27 H38.8 C38 29, 36.6 30.5, 34.8 31.4 V37.5 C34.8 38.6, 34 39.4, 33 39.4 C32 39.4, 31.2 38.6, 31.2 37.5 V32.4 H20.8 V37.5 C20.8 38.6, 20 39.4, 19 39.4 C18 39.4, 17.2 38.6, 17.2 37.5 V31 C14.5 29.6, 12.8 27, 12.5 24 Z" />
    </svg>
  );
}

/** Matching bottle-style green botanical icon for Plants. */
export function PlantsEmblemSvg({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 39 C23 39, 22.2 38.2, 22.2 37.2 V25.8 C15 25.2, 10 20.5, 10 13 C17.5 13, 22.2 17.5, 22.8 24 H25.2 C25.8 17.5, 30.5 13, 38 13 C38 20.5, 33 25.2, 25.8 25.8 V37.2 C25.8 38.2, 25 39, 24 39 Z" />
      <path d="M16 39 H32 C33 39, 33.8 39.8, 33.8 40.8 C33.8 41.8, 33 42.6, 32 42.6 H16 C15 42.6, 14.2 41.8, 14.2 40.8 C14.2 39.8, 15 39, 16 39 Z" />
    </svg>
  );
}
