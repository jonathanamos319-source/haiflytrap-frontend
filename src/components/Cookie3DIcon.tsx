interface Cookie3DIconProps {
  className?: string;
}

export function Cookie3DIcon({ className = 'w-12 h-12' }: Cookie3DIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} flex-shrink-0 transition-transform duration-300 hover:scale-110 drop-shadow-md select-none`}
    >
      <defs>
        {/* Cookie 3D Body Gradient */}
        <radialGradient id="cookieBody3D" cx="35%" cy="30%" r="70%" fx="30%" fy="25%">
          <stop offset="0%" stopColor="#FFE1A8" />
          <stop offset="30%" stopColor="#E5A65E" />
          <stop offset="70%" stopColor="#C27A2F" />
          <stop offset="100%" stopColor="#8C4E15" />
        </radialGradient>

        {/* 3D Specular Curvature Highlight */}
        <linearGradient id="cookieHighlight3D" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* 3D Chocolate Chip Gradient 1 */}
        <radialGradient id="chipGrad3D1" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#5E3319" />
          <stop offset="60%" stopColor="#381D0B" />
          <stop offset="100%" stopColor="#1F0E04" />
        </radialGradient>

        {/* 3D Chocolate Chip Gradient 2 */}
        <radialGradient id="chipGrad3D2" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#6B3A1C" />
          <stop offset="65%" stopColor="#3A1D0B" />
          <stop offset="100%" stopColor="#180A02" />
        </radialGradient>

        {/* Chip Drop Shadow */}
        <filter id="chipShadow3D" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0.5" dy="1.5" stdDeviation="0.8" floodColor="#552707" floodOpacity="0.75" />
        </filter>

        {/* Bottom Ambient Cookie Shadow */}
        <filter id="cookieDrop3D" x="-15%" y="-10%" width="135%" height="135%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Floor Contact Ambient Shadow */}
      <ellipse cx="32" cy="57" rx="20" ry="3.5" fill="#000000" fillOpacity="0.14" />

      {/* Main Cookie 3D Body */}
      <g filter="url(#cookieDrop3D)">
        <path
          d="M32 6C46.3594 6 58 17.6406 58 32C58 46.3594 46.3594 58 32 58C17.6406 58 6 46.3594 6 32C6 24.5 9.2 17.8 14.3 13.1C18.9 8.7 25.1 6 32 6Z"
          fill="url(#cookieBody3D)"
        />
        {/* Crisp Edge Rim Lighting */}
        <path
          d="M32 7.5C45.531 7.5 56.5 18.469 56.5 32C56.5 45.531 45.531 56.5 32 56.5C18.469 56.5 7.5 45.531 7.5 32C7.5 24.9 10.5 18.6 15.3 14.2C19.7 10 25.5 7.5 32 7.5Z"
          stroke="#FCE1A8"
          strokeWidth="1.2"
          strokeOpacity="0.45"
          fill="none"
        />
        {/* 3D Top Reflection Glaze */}
        <ellipse cx="27" cy="18" rx="14" ry="6.5" transform="rotate(-25 27 18)" fill="url(#cookieHighlight3D)" />
      </g>

      {/* 3D Chocolate Chips */}
      {/* Chip 1 (Top Left) */}
      <g filter="url(#chipShadow3D)">
        <path d="M22 17C24.5 15.5 27 18 26.5 21C26 23.5 23 24 21 22.5C19 21 19.5 18.5 22 17Z" fill="url(#chipGrad3D1)" />
        <ellipse cx="23" cy="18" rx="1.5" ry="0.8" fill="#8B4D25" fillOpacity="0.8" />
      </g>

      {/* Chip 2 (Center Right) */}
      <g filter="url(#chipShadow3D)">
        <path d="M41 23C44 21.5 47 24 46 27C45 30 41.5 30.5 39.5 28.5C37.5 26.5 38 24.5 41 23Z" fill="url(#chipGrad3D2)" />
        <ellipse cx="42" cy="24" rx="2" ry="1" fill="#8B4D25" fillOpacity="0.8" />
      </g>

      {/* Chip 3 (Center) */}
      <g filter="url(#chipShadow3D)">
        <path d="M31 31C34 29.5 37 32.5 35.5 36C34 39.5 30 39 28 36.5C26 34 28 32.5 31 31Z" fill="url(#chipGrad3D1)" />
        <ellipse cx="32" cy="32.5" rx="1.8" ry="0.9" fill="#8B4D25" fillOpacity="0.8" />
      </g>

      {/* Chip 4 (Bottom Left) */}
      <g filter="url(#chipShadow3D)">
        <path d="M19 38C21.5 36.5 24 39 23.5 42C23 45 19.5 45.5 18 43.5C16.5 41.5 16.5 39.5 19 38Z" fill="url(#chipGrad3D2)" />
        <ellipse cx="19.5" cy="39" rx="1.4" ry="0.7" fill="#8B4D25" fillOpacity="0.8" />
      </g>

      {/* Chip 5 (Bottom Right) */}
      <g filter="url(#chipShadow3D)">
        <path d="M38 42C40.5 40.5 43 43 42.5 46C42 48.5 39 49 37.5 47C36 45 35.5 43.5 38 42Z" fill="url(#chipGrad3D1)" />
        <ellipse cx="38.5" cy="43" rx="1.5" ry="0.7" fill="#8B4D25" fillOpacity="0.8" />
      </g>

      {/* 3D Crumbs */}
      <circle cx="49" cy="38" r="1.5" fill="#C27A2F" />
      <circle cx="48.5" cy="37.5" r="0.6" fill="#FCE1A8" />
      <circle cx="14" cy="29" r="1.2" fill="#B06A23" />
    </svg>
  );
}
