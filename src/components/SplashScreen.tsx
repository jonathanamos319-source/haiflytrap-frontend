import { usePWA } from '@/hooks/usePWA';

export function SplashScreen() {
  const { showSplash } = usePWA();

  if (!showSplash) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#FAF9F6] flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards" 
      style={{ animationDelay: '2s' }}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-sm mx-auto px-6">
        <img 
          src="/products/HAIFLYLOGO.png" 
          alt="Haifly Logo" 
          className="w-48 md:w-56 h-auto animate-pulse" 
        />
        <p className="absolute bottom-12 text-forest/40 font-semibold text-sm tracking-widest uppercase">
          Safe & Eco-Friendly
        </p>
      </div>
    </div>
  );
}
