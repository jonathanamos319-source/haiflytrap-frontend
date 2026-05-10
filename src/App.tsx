import { useEffect, lazy, Suspense } from 'react';
import { StoreProvider, useStore } from '@/hooks/useStore';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RoleGuard } from '@/components/RoleGuard';
import { SEO } from '@/components/SEO';

// Sections (Lazy Loaded)
const HomePage = lazy(() => import('@/sections/HomePage').then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('@/sections/ShopPage').then(m => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import('@/sections/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('@/sections/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('@/sections/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('@/sections/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const TrackOrderPage = lazy(() => import('@/sections/TrackOrderPage').then(m => ({ default: m.TrackOrderPage })));
const ReviewsPage = lazy(() => import('@/sections/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const AdminDashboard = lazy(() => import('@/sections/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const MarketersPage = lazy(() => import('@/sections/MarketersPage').then(m => ({ default: m.MarketersPage })));
const HandlerPortal = lazy(() => import('@/sections/HandlerPortal').then(m => ({ default: m.HandlerPortal })));
const LoginPage = lazy(() => import('@/sections/LoginPage').then(m => ({ default: m.LoginPage })));
const CustomerLoginPage = lazy(() => import('@/sections/CustomerLoginPage').then(m => ({ default: m.CustomerLoginPage })));
const HandlerLoginPage = lazy(() => import('@/sections/HandlerLoginPage').then(m => ({ default: m.HandlerLoginPage })));
const BlogPage = lazy(() => import('@/sections/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import('@/sections/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const SettingsPage = lazy(() => import('@/sections/SettingsPage').then(m => ({ default: m.SettingsPage })));
const RecentOrdersPage = lazy(() => import('@/sections/RecentOrdersPage').then(m => ({ default: m.RecentOrdersPage })));

// Pages (auth callbacks)
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const AdminAuthCallback = lazy(() => import('@/pages/AdminAuthCallback').then(m => ({ default: m.AdminAuthCallback })));
const CustomerAuthCallback = lazy(() => import('@/pages/CustomerAuthCallback').then(m => ({ default: m.CustomerAuthCallback })));

// Components
import { ProductTransition } from '@/components/ProductTransition';
import { DeliveryModal } from '@/components/DeliveryModal';
import { AdminOfflineBlocker } from '@/components/AdminOfflineBlocker';
import { Toaster, toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePWA } from '@/hooks/usePWA';
import { SplashScreen } from '@/components/SplashScreen';
import { BottomNav } from '@/components/BottomNav';

function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline');
    } else if (needRefresh) {
      toast('A new version is available.', {
        action: {
          label: 'Refresh',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [offlineReady, needRefresh, updateServiceWorker]);

  return null;
}

// Re-mounts on every view change → triggers enter animation
function PageWrapper({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  return (
    <div key={viewKey} style={{ animation: 'pageEnter 0.4s ease forwards' }}>
      <Suspense fallback={
        <div className="min-h-screen bg-surface flex flex-col">
          <div className="h-[64px] md:h-[80px] bg-white border-b border-outline-variant animate-pulse flex items-center px-6 md:px-24 justify-between">
            <div className="h-6 bg-surface-high rounded-lg w-32"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-surface-high rounded-full w-12 hidden md:block"></div>
              <div className="h-4 bg-surface-high rounded-full w-12 hidden md:block"></div>
              <div className="h-4 bg-surface-high rounded-full w-12"></div>
            </div>
          </div>
          <main className="flex-1 section-padding py-12 animate-pulse">
            <div className="h-10 bg-surface-high rounded-2xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[32px] p-6 border border-outline-variant h-64">
                  <div className="bg-surface-high aspect-video rounded-2xl mb-4"></div>
                  <div className="h-4 bg-surface-high rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-high rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </main>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}

function AppContent({ isPWA }: { isPWA: boolean }) {
  const { currentView, setCurrentView, isBackendDown, isCheckingBackend, isRetrying } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  useEffect(() => {
    // If backend is down and user is on a restricted page, kick them back to home
    const restrictedViews = ['checkout', 'recent-orders', 'settings', 'admin-dashboard'];
    if (isBackendDown && !isCheckingBackend && !isRetrying && restrictedViews.includes(currentView)) {
      setCurrentView('home');
    }
  }, [isBackendDown, isCheckingBackend, isRetrying, currentView, setCurrentView]);


  // ── Auth callbacks (public — no guard) ──────────────────────────────────────
  if (currentView === 'admin-callback') {
    return <PageWrapper viewKey={currentView}><AdminAuthCallback /></PageWrapper>;
  }
  if (currentView === 'customer-callback') {
    return <PageWrapper viewKey={currentView}><CustomerAuthCallback /></PageWrapper>;
  }
  // Legacy single callback (fallback)
  if (currentView === 'auth-callback') {
    return <PageWrapper viewKey={currentView}><AuthCallback /></PageWrapper>;
  }

  // ── Admin portal (accessed via secret path only) ────────────────────────────
  if (currentView === 'admin-login') {
    return <PageWrapper viewKey={currentView}><LoginPage /></PageWrapper>;
  }

  // ── Protected admin views ───────────────────────────────────────────────────
  // NOTE: RoleGuard bypassed while using temporary password-based admin login.
  // The password check in LoginPage.tsx IS the auth. Re-enable RoleGuard once
  // Supabase magic-link auth is restored.
  if (currentView === 'admin-dashboard') {
    return (
      <PageWrapper viewKey={currentView}><AdminDashboard /></PageWrapper>
    );
  }
  if (currentView === 'admin-marketers') {
    return (
      <PageWrapper viewKey={currentView}><MarketersPage /></PageWrapper>
    );
  }

  // ── Handler portal ──────────────────────────────────────────────────────────
  if (currentView === 'handler-login') {
    return <PageWrapper viewKey={currentView}><HandlerLoginPage /></PageWrapper>;
  }
  if (currentView === 'handler-portal') {
    return (
      <RoleGuard allowedRoles={['admin', 'handler']}>
        <PageWrapper viewKey={currentView}><HandlerPortal /></PageWrapper>
      </RoleGuard>
    );
  }

  // ── Customer login (/login) ─────────────────────────────────────────────────
  if (currentView === 'customer-login') {
    return <PageWrapper viewKey={currentView}><CustomerLoginPage /></PageWrapper>;
  }

  // ── Public storefront ───────────────────────────────────────────────────────
  return (
    <>
      {(['home', 'shop', 'reviews', 'track-order'] as string[]).includes(currentView) && (
        <DeliveryModal key={currentView} alwaysShow />
      )}
      <div className="min-h-screen flex flex-col">
        {isBackendDown && !isCheckingBackend && !isRetrying && (
          <div className="bg-gold text-forest py-2 px-4 text-center text-xs md:text-sm font-bold sticky top-0 z-[60] shadow-md">
            ⚠️ Shop temporarily unavailable. Order via WhatsApp.
          </div>
        )}
        {!isPWA && <Navbar />}
        <main className={`flex-1 ${isPWA ? 'pt-4 pb-24' : 'pt-[64px] md:pt-[80px]'}`}>
          <PageWrapper viewKey={currentView}>
            {currentView === 'home'               && <HomePage />}
            {currentView === 'shop'               && <ShopPage />}
            {currentView === 'product'            && <ProductDetailPage />}
            {currentView === 'cart'               && <CartPage />}
            {currentView === 'checkout'           && <CheckoutPage />}
            {currentView === 'order-confirmation' && <OrderConfirmationPage />}
            {currentView === 'track-order'        && <TrackOrderPage />}
            {currentView === 'reviews'            && <ReviewsPage />}
            {currentView === 'blog'               && <BlogPage />}
            {currentView === 'blog-post'          && <BlogDetailPage />}
            {currentView === 'settings'           && <SettingsPage />}
            {currentView === 'recent-orders'      && <RecentOrdersPage />}
          </PageWrapper>
        </main>
        <Footer />
        <ProductTransition />
        {isPWA && <BottomNav />}
      </div>
    </>
  );
}

function App() {
  const { isPWA } = usePWA();
  
  return (
    <StoreProvider>
      <SEO />
      <SplashScreen />
      <PWAUpdatePrompt />
      <AdminOfflineBlocker />
      <AppContent isPWA={isPWA} />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}

export default App;
