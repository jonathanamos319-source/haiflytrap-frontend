import React from 'react';
import Lottie from 'lottie-react';
import leavesAnimation from '../lotties/leaves.json';

interface LeavesBackgroundProps {
  opacity?: number;
  className?: string;
}

export function LeavesBackground({ opacity = 0.15, className = "" }: LeavesBackgroundProps) {
  return (
    <div className={`hidden md:block absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`} style={{ opacity }}>
      {/* Top Left */}
      <div className="absolute -top-10 -left-10 w-64 md:w-96 h-auto rotate-12">
        <Lottie animationData={leavesAnimation} loop={true} />
      </div>
      
      {/* Bottom Right */}
      <div className="absolute -bottom-10 -right-10 w-64 md:w-96 h-auto rotate-[190deg]">
        <Lottie animationData={leavesAnimation} loop={true} />
      </div>

      {/* Middle Floating (Optional, subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 md:w-64 h-auto opacity-40 rotate-45">
        <Lottie animationData={leavesAnimation} loop={true} />
      </div>
    </div>
  );
}
