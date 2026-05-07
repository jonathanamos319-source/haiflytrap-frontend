import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { WifiOff } from 'lucide-react';

export function AdminOfflineBlocker() {
  const { currentView } = useStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Use currentView primarily, fallback to pathname
  const isAdminOrHandlerView = 
    currentView.includes('admin') || 
    currentView.includes('handler') || 
    currentView.includes('marketers');
    
  const isAdminOrHandlerPath = 
    window.location.pathname.startsWith('/admin') || 
    window.location.pathname.startsWith('/handler') ||
    window.location.pathname.startsWith('/marketers');

  const shouldBlock = isOffline && (isAdminOrHandlerView || isAdminOrHandlerPath);

  if (!shouldBlock) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 animate-pulse">
        <WifiOff className="w-10 h-10" />
      </div>
      <h1 className="font-display font-black text-3xl md:text-5xl text-forest mb-4">
        Connection Lost
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        You are offline. The Admin and Handler dashboards require an active internet connection to prevent data synchronization issues.
      </p>
      <p className="font-bold text-forest mt-8">
        Please reconnect to continue.
      </p>
    </div>
  );
}
