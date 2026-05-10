import { useState, useEffect } from 'react';

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsPWA(true);
      setShowSplash(true);
      
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return { isPWA, showSplash };
}
