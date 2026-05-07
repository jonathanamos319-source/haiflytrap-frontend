import React from 'react';

export function FooterWave() {
  return (
    <div className="wave-container w-full -mt-[3px] relative z-10 pointer-events-none" style={{ background: 'none', padding: 0, margin: 0, marginTop: '-3px' }}>
      <svg 
        width="100%" 
        viewBox="0 0 1440 200" 
        preserveAspectRatio="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-[80px] md:h-[120px]"
        style={{ display: 'block', overflow: 'visible', transform: 'scaleX(1.01) scaleY(1.02)', transformOrigin: 'top', border: 'none', outline: 'none' }}
      >
        {/* Back wave - lightest green, highest peak */}
        <path d="M0,60 C200,0 400,120 720,40 C1040,-40 1240,80 1440,20 L1440,201 L0,201 Z" fill="#5a9e6f"/>
        {/* Mid wave */}
        <path d="M0,100 C250,30 450,140 760,70 C1070,0 1280,110 1440,60 L1440,201 L0,201 Z" fill="#2d6e45"/>
        {/* Front wave - darkest, matches footer */}
        <path d="M0,140 C300,90 550,170 820,120 C1090,70 1320,150 1440,110 L1440,201 L0,201 Z" fill="#1a5c38"/>
      </svg>
    </div>
  );
}
